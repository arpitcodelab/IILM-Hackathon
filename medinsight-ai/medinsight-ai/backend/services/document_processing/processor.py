"""
MedInsight AI — Document Processing Orchestrator.
Coordinates validation, digital text extraction, image preprocessing, and dual-engine OCR
to produce unified ExtractedDocument objects from heterogeneous medical files.
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from pathlib import Path
from typing import Optional, Union

from api.models import (
    ConfidenceLevel,
    ExtractedDocument,
    ExtractedPage,
    FileType,
    OcrWord,
)
from services.document_processing.ocr_engine import ocr_engine
from services.document_processing.pdf_extractor import pdf_extractor
from services.document_processing.txt_loader import txt_loader
from services.file_validator import file_validator

logger = logging.getLogger("medinsight.document_processor")


class DocumentProcessor:
    """Central pipeline orchestrator for document ingestion and text extraction."""

    async def process_file(
        self,
        file_path: Union[str, Path],
        file_id: Optional[str] = None,
        original_filename: Optional[str] = None,
        force_vision_ocr: bool = False,
    ) -> ExtractedDocument:
        """
        Validate and process a single medical document file into an ExtractedDocument.

        Args:
            file_path: Path to the target file on disk.
            file_id: Optional document ID; generates a new UUID if omitted.
            original_filename: Display name of the file.
            force_vision_ocr: If True, forces Gemini Vision for image OCR.

        Returns:
            ExtractedDocument containing all extracted pages and metadata.
        """
        path = Path(file_path)
        actual_id = file_id or str(uuid.uuid4())
        filename = original_filename or path.name

        # 1. Validation
        validation = file_validator.validate_file(path, original_filename=filename)
        if not validation.is_valid:
            logger.warning(f"File validation failed for {filename}: {validation.errors}")
            return ExtractedDocument(
                file_id=actual_id,
                filename=filename,
                file_type=validation.file_type or FileType.TXT,
                total_pages=0,
                pages=[],
                extraction_warnings=validation.errors + validation.warnings,
                full_text="",
            )

        file_type = validation.file_type
        warnings: list[str] = list(validation.warnings)

        # 2. Format-Specific Routing
        if file_type == FileType.PDF:
            return await self._process_pdf(
                path,
                actual_id,
                filename,
                force_vision=force_vision_ocr,
                initial_warnings=warnings,
            )
        elif file_type in (FileType.JPG, FileType.JPEG, FileType.PNG):
            return await self._process_image(
                path,
                actual_id,
                filename,
                file_type,
                force_vision=force_vision_ocr,
                initial_warnings=warnings,
            )
        elif file_type == FileType.TXT:
            doc = await txt_loader.load_file_async(path, file_id=actual_id, original_filename=filename)
            doc.extraction_warnings.extend(warnings)
            return doc
        else:
            return ExtractedDocument(
                file_id=actual_id,
                filename=filename,
                file_type=FileType.TXT,
                total_pages=0,
                pages=[],
                extraction_warnings=[f"Unsupported file type: {file_type}"],
                full_text="",
            )

    async def process_batch(
        self,
        files: list[Union[tuple[str, Union[str, Path]], Path, str]],
        force_vision_ocr: bool = False,
    ) -> list[ExtractedDocument]:
        """
        Process multiple documents concurrently.

        Args:
            files: List of file paths or (filename, path) tuples.
            force_vision_ocr: Force Gemini Vision OCR for scanned pages.

        Returns:
            List of ExtractedDocument objects.
        """
        tasks = []
        for item in files:
            if isinstance(item, tuple):
                fname, fpath = item
                tasks.append(
                    self.process_file(
                        file_path=fpath,
                        original_filename=fname,
                        force_vision_ocr=force_vision_ocr,
                    )
                )
            else:
                tasks.append(
                    self.process_file(
                        file_path=item,
                        force_vision_ocr=force_vision_ocr,
                    )
                )

        results = await asyncio.gather(*tasks, return_exceptions=True)
        documents: list[ExtractedDocument] = []

        for idx, res in enumerate(results):
            if isinstance(res, Exception):
                logger.error(f"Error processing document batch item {idx}: {res}", exc_info=True)
                err_doc = ExtractedDocument(
                    file_id=str(uuid.uuid4()),
                    filename=f"document_{idx}",
                    file_type=FileType.TXT,
                    total_pages=0,
                    pages=[],
                    extraction_warnings=[f"Batch processing error: {str(res)}"],
                    full_text="",
                )
                documents.append(err_doc)
            else:
                documents.append(res)

        return documents

    async def _process_pdf(
        self,
        path: Path,
        file_id: str,
        filename: str,
        force_vision: bool,
        initial_warnings: list[str],
    ) -> ExtractedDocument:
        """Process a PDF: extract digital text and perform OCR on scanned pages."""
        pdf_res = await pdf_extractor.extract_file_async(path, file_id=file_id, render_scanned=True)
        warnings = list(initial_warnings) + list(pdf_res.warnings)

        pages: list[ExtractedPage] = []

        for p in pdf_res.pages:
            # Case A: Digital text is plentiful and clear
            if not p.is_scanned and p.digital_text:
                pages.append(
                    ExtractedPage(
                        page_number=p.page_number,
                        text=p.digital_text,
                        extraction_method="digital",
                        ocr_confidence=ConfidenceLevel.HIGH,
                        uncertain_words=[],
                        has_images=p.has_images,
                        has_handwriting=False,
                    )
                )
            # Case B: Scanned page or minimal digital text requiring OCR
            elif p.rendered_image_bytes:
                logger.info(f"Running OCR on scanned page {p.page_number} of {filename}...")
                ocr_page_res = await ocr_engine.ocr_page_async(
                    image_input=p.rendered_image_bytes,
                    page_number=p.page_number,
                    force_vision=force_vision,
                )

                # If OCR produced text, use it; otherwise fallback to any digital text found
                final_text = ocr_page_res.text.strip()
                if not final_text and p.digital_text:
                    final_text = p.digital_text

                pages.append(
                    ExtractedPage(
                        page_number=p.page_number,
                        text=final_text,
                        extraction_method=ocr_page_res.extraction_method,
                        ocr_confidence=ocr_page_res.ocr_confidence,
                        uncertain_words=ocr_page_res.uncertain_words,
                        has_images=True,
                        has_handwriting=ocr_page_res.has_handwriting,
                    )
                )
            else:
                # Scanned but rendering failed
                pages.append(
                    ExtractedPage(
                        page_number=p.page_number,
                        text=p.digital_text,
                        extraction_method="digital",
                        ocr_confidence=ConfidenceLevel.LOW,
                        uncertain_words=[],
                        has_images=p.has_images,
                        has_handwriting=False,
                    )
                )

        full_text = "\n\n".join(p.text for p in pages if p.text)

        return ExtractedDocument(
            file_id=file_id,
            filename=filename,
            file_type=FileType.PDF,
            total_pages=len(pages),
            pages=pages,
            metadata=pdf_res.metadata,
            extraction_warnings=warnings,
            full_text=full_text,
        )

    async def _process_image(
        self,
        path: Path,
        file_id: str,
        filename: str,
        file_type: FileType,
        force_vision: bool,
        initial_warnings: list[str],
    ) -> ExtractedDocument:
        """Process a standalone image file (JPG, PNG) using OCR."""
        warnings = list(initial_warnings)
        try:
            image_bytes = path.read_bytes()
            ocr_page_res = await ocr_engine.ocr_page_async(
                image_input=image_bytes,
                page_number=1,
                force_vision=force_vision,
            )

            pages = [ocr_page_res]
            full_text = ocr_page_res.text

            return ExtractedDocument(
                file_id=file_id,
                filename=filename,
                file_type=file_type,
                total_pages=1,
                pages=pages,
                metadata={"file_size": len(image_bytes)},
                extraction_warnings=warnings,
                full_text=full_text,
            )

        except Exception as e:
            logger.error(f"Failed to process image {filename}: {e}", exc_info=True)
            warnings.append(f"Image processing failed: {str(e)}")
            return ExtractedDocument(
                file_id=file_id,
                filename=filename,
                file_type=file_type,
                total_pages=0,
                pages=[],
                extraction_warnings=warnings,
                full_text="",
            )

    @staticmethod
    def get_all_uncertain_words(doc: ExtractedDocument) -> list[OcrWord]:
        """Aggregate all uncertain OCR tokens across document pages."""
        uncertain: list[OcrWord] = []
        for p in doc.pages:
            uncertain.extend(p.uncertain_words)
        return uncertain


document_processor = DocumentProcessor()
