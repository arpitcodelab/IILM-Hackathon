"""
MedInsight AI — PDF Extractor Service.
Extracts digital text and identifies scanned pages/embedded images in PDF documents using PyMuPDF.
Renders scanned pages as high-resolution images for downstream OCR processing.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional, Union

import fitz  # PyMuPDF

from api.models import ConfidenceLevel, ExtractedDocument, ExtractedPage, FileType

logger = logging.getLogger("medinsight.pdf_extractor")

# Minimum character count to consider a page as having sufficient digital text
MIN_DIGITAL_TEXT_CHARS = 60
DEFAULT_RENDER_DPI = 300


@dataclass
class PdfPageAnalysis:
    """Internal analysis result for a single PDF page."""
    page_number: int
    digital_text: str
    is_scanned: bool
    has_images: bool
    image_count: int
    rendered_image_bytes: Optional[bytes] = None
    width: float = 0.0
    height: float = 0.0


@dataclass
class PdfExtractionResult:
    """Intermediate extraction result before OCR processing."""
    file_id: str
    filename: str
    total_pages: int
    pages: list[PdfPageAnalysis] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)


class PdfExtractor:
    """Extracts text and renders scanned pages from PDF documents."""

    def __init__(self, render_dpi: int = DEFAULT_RENDER_DPI, min_text_chars: int = MIN_DIGITAL_TEXT_CHARS):
        self.render_dpi = render_dpi
        self.min_text_chars = min_text_chars

    async def extract_file_async(
        self,
        file_path: Union[str, Path],
        file_id: str = "",
        render_scanned: bool = True,
    ) -> PdfExtractionResult:
        """Asynchronously extract PDF content by offloading CPU-bound operations to a thread."""
        return await asyncio.to_thread(
            self.extract_file,
            file_path=file_path,
            file_id=file_id,
            render_scanned=render_scanned,
        )

    def extract_file(
        self,
        file_path: Union[str, Path],
        file_id: str = "",
        render_scanned: bool = True,
    ) -> PdfExtractionResult:
        """
        Synchronously extract text, image metadata, and render scanned pages from a PDF file.

        Args:
            file_path: Path to the PDF file.
            file_id: Unique identifier for the document.
            render_scanned: If True, renders pages with insufficient digital text to PNG bytes.

        Returns:
            PdfExtractionResult containing page-by-page analysis.
        """
        path = Path(file_path)
        filename = path.name

        try:
            doc = fitz.open(str(path))
            return self._process_document(doc, filename=filename, file_id=file_id, render_scanned=render_scanned)
        except Exception as e:
            logger.error(f"Failed to extract PDF {filename}: {e}", exc_info=True)
            return PdfExtractionResult(
                file_id=file_id,
                filename=filename,
                total_pages=0,
                warnings=[f"Failed to open PDF document: {str(e)}"],
            )

    def extract_bytes(
        self,
        data: bytes,
        filename: str,
        file_id: str = "",
        render_scanned: bool = True,
    ) -> PdfExtractionResult:
        """
        Extract PDF content directly from raw bytes.

        Args:
            data: PDF file content.
            filename: Display filename.
            file_id: Unique identifier.
            render_scanned: If True, renders scanned pages to PNG.

        Returns:
            PdfExtractionResult.
        """
        try:
            doc = fitz.open(stream=data, filetype="pdf")
            return self._process_document(doc, filename=filename, file_id=file_id, render_scanned=render_scanned)
        except Exception as e:
            logger.error(f"Failed to extract PDF from bytes ({filename}): {e}", exc_info=True)
            return PdfExtractionResult(
                file_id=file_id,
                filename=filename,
                total_pages=0,
                warnings=[f"Failed to open PDF from memory: {str(e)}"],
            )

    def _process_document(
        self,
        doc: fitz.Document,
        filename: str,
        file_id: str,
        render_scanned: bool,
    ) -> PdfExtractionResult:
        """Process an open fitz.Document object and build extraction results."""
        warnings: list[str] = []
        page_analyses: list[PdfPageAnalysis] = []

        try:
            if doc.is_encrypted:
                warnings.append("Document is encrypted; text extraction may be incomplete or empty.")

            total_pages = len(doc)
            meta: dict[str, Any] = {
                "title": doc.metadata.get("title", ""),
                "author": doc.metadata.get("author", ""),
                "subject": doc.metadata.get("subject", ""),
                "creator": doc.metadata.get("creator", ""),
                "producer": doc.metadata.get("producer", ""),
                "creation_date": doc.metadata.get("creationDate", ""),
                "mod_date": doc.metadata.get("modDate", ""),
                "page_count": total_pages,
            }

            for page_idx in range(total_pages):
                page = doc[page_idx]
                page_num = page_idx + 1

                # Extract digital text
                raw_text = page.get_text("text").strip()
                images = page.get_images(full=True)
                image_count = len(images)
                has_images = image_count > 0

                # Determine if page is scanned/image-based
                # A page is considered scanned if digital text is below threshold
                is_scanned = len(raw_text) < self.min_text_chars

                rendered_bytes: Optional[bytes] = None
                if is_scanned and render_scanned:
                    try:
                        # Render page at 300 DPI for high quality OCR
                        pix = page.get_pixmap(dpi=self.render_dpi)
                        rendered_bytes = pix.tobytes("png")
                    except Exception as render_err:
                        logger.warning(
                            f"Failed to render scanned page {page_num} of {filename}: {render_err}"
                        )
                        warnings.append(
                            f"Page {page_num}: Failed to render high-resolution image ({str(render_err)})"
                        )

                page_analysis = PdfPageAnalysis(
                    page_number=page_num,
                    digital_text=raw_text,
                    is_scanned=is_scanned,
                    has_images=has_images,
                    image_count=image_count,
                    rendered_image_bytes=rendered_bytes,
                    width=float(page.rect.width),
                    height=float(page.rect.height),
                )
                page_analyses.append(page_analysis)

            return PdfExtractionResult(
                file_id=file_id,
                filename=filename,
                total_pages=total_pages,
                pages=page_analyses,
                metadata=meta,
                warnings=warnings,
            )

        finally:
            doc.close()

    def to_extracted_document(self, result: PdfExtractionResult) -> ExtractedDocument:
        """
        Convert a digital-only extraction result directly into an ExtractedDocument model.
        Pages marked as scanned will retain whatever minimal digital text was found unless
        subsequently enhanced by the OCR engine.
        """
        extracted_pages: list[ExtractedPage] = []
        for p in result.pages:
            method = "ocr_scanned_pending" if p.is_scanned else "digital"
            confidence = ConfidenceLevel.UNKNOWN if p.is_scanned else ConfidenceLevel.HIGH

            extracted_pages.append(
                ExtractedPage(
                    page_number=p.page_number,
                    text=p.digital_text,
                    extraction_method=method,
                    ocr_confidence=confidence,
                    uncertain_words=[],
                    has_images=p.has_images,
                    has_handwriting=False,
                )
            )

        full_text = "\n\n".join(p.text for p in extracted_pages if p.text)

        return ExtractedDocument(
            file_id=result.file_id,
            filename=result.filename,
            file_type=FileType.PDF,
            total_pages=result.total_pages,
            pages=extracted_pages,
            metadata=result.metadata,
            extraction_warnings=result.warnings,
            full_text=full_text,
        )


pdf_extractor = PdfExtractor()
