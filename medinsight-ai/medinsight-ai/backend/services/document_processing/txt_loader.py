"""
MedInsight AI — Text Document Loader Service.
Loads plain text (.txt) medical documents with robust multi-encoding detection and logical page segmentation.
"""

from __future__ import annotations

import asyncio
import logging
import re
from pathlib import Path
from typing import Optional, Tuple, Union

from api.models import ConfidenceLevel, ExtractedDocument, ExtractedPage, FileType

logger = logging.getLogger("medinsight.txt_loader")

# Candidate encodings to attempt in priority order
CANDIDATE_ENCODINGS = [
    "utf-8-sig",
    "utf-8",
    "cp1252",
    "iso-8859-1",
    "utf-16",
    "ascii",
]

# Patterns representing page dividers in medical plain text dumps
PAGE_BREAK_PATTERNS = [
    r"\x0c",  # Form feed
    r"\n\s*(?:---+|\*\*\*+|===+)\s*(?:Page\s*\d+|PAGE\s*\d+)\s*(?:---+|\*\*\*+|===+)\s*\n",
    r"\n\s*\[Page\s*\d+\]\s*\n",
    r"\n\s*Page\s+\d+\s+of\s+\d+\s*\n",
]

# Fallback line threshold for virtual pagination of long notes
LINES_PER_VIRTUAL_PAGE = 60


class TxtLoader:
    """Loads plain text files with automatic encoding detection and page splitting."""

    def __init__(self, lines_per_virtual_page: int = LINES_PER_VIRTUAL_PAGE):
        self.lines_per_virtual_page = lines_per_virtual_page

    async def load_file_async(
        self,
        file_path: Union[str, Path],
        file_id: str = "",
        original_filename: Optional[str] = None,
    ) -> ExtractedDocument:
        """Asynchronously load a text file from disk."""
        return await asyncio.to_thread(
            self.load_file,
            file_path=file_path,
            file_id=file_id,
            original_filename=original_filename,
        )

    def load_file(
        self,
        file_path: Union[str, Path],
        file_id: str = "",
        original_filename: Optional[str] = None,
    ) -> ExtractedDocument:
        """
        Load and parse a plain text file from disk into an ExtractedDocument.

        Args:
            file_path: Path to the .txt file.
            file_id: Unique document ID.
            original_filename: Optional original upload name.

        Returns:
            ExtractedDocument containing segmented ExtractedPages.
        """
        path = Path(file_path)
        filename = original_filename or path.name

        try:
            raw_bytes = path.read_bytes()
            return self.load_bytes(raw_bytes, filename=filename, file_id=file_id)
        except Exception as e:
            logger.error(f"Failed to load text file {filename}: {e}", exc_info=True)
            return ExtractedDocument(
                file_id=file_id,
                filename=filename,
                file_type=FileType.TXT,
                total_pages=0,
                pages=[],
                extraction_warnings=[f"Failed to read file: {str(e)}"],
                full_text="",
            )

    def load_bytes(
        self,
        data: bytes,
        filename: str,
        file_id: str = "",
    ) -> ExtractedDocument:
        """
        Decode raw bytes into structured text pages.

        Args:
            data: Raw file bytes.
            filename: Original filename.
            file_id: Unique document identifier.

        Returns:
            ExtractedDocument.
        """
        text, encoding_used = self._decode_bytes(data)
        warnings: list[str] = []

        if encoding_used not in ("utf-8", "utf-8-sig"):
            warnings.append(f"Decoded using legacy encoding '{encoding_used}'.")

        # Standardize line breaks
        normalized_text = text.replace("\r\n", "\n").replace("\r", "\n")

        # Split into pages
        page_texts = self._split_into_pages(normalized_text)
        if not page_texts:
            page_texts = [""]

        extracted_pages: list[ExtractedPage] = []
        for idx, p_text in enumerate(page_texts, start=1):
            extracted_pages.append(
                ExtractedPage(
                    page_number=idx,
                    text=p_text.strip(),
                    extraction_method="digital",
                    ocr_confidence=ConfidenceLevel.HIGH,
                    uncertain_words=[],
                    has_images=False,
                    has_handwriting=False,
                )
            )

        full_text = "\n\n".join(p.text for p in extracted_pages if p.text)

        return ExtractedDocument(
            file_id=file_id,
            filename=filename,
            file_type=FileType.TXT,
            total_pages=len(extracted_pages),
            pages=extracted_pages,
            metadata={"encoding": encoding_used, "char_count": len(normalized_text)},
            extraction_warnings=warnings,
            full_text=full_text,
        )

    def _decode_bytes(self, data: bytes) -> Tuple[str, str]:
        """Try decoding byte content across supported encodings."""
        for enc in CANDIDATE_ENCODINGS:
            try:
                decoded = data.decode(enc)
                return decoded, enc
            except (UnicodeDecodeError, LookupError):
                continue

        # Ultimate fallback with character replacement
        logger.warning("All candidate encodings failed; falling back to utf-8 with replacement.")
        return data.decode("utf-8", errors="replace"), "utf-8-replace"

    def _split_into_pages(self, text: str) -> list[str]:
        """Split text by form feed, page headers, or line count."""
        # Check for explicit page delimiter patterns
        for pattern in PAGE_BREAK_PATTERNS:
            parts = re.split(pattern, text, flags=re.IGNORECASE)
            non_empty_parts = [p.strip() for p in parts if p.strip()]
            if len(non_empty_parts) > 1:
                return non_empty_parts

        # If no page break tokens found, split by line count for long clinical transcripts
        lines = text.split("\n")
        if len(lines) <= self.lines_per_virtual_page:
            return [text.strip()]

        pages: list[str] = []
        for i in range(0, len(lines), self.lines_per_virtual_page):
            chunk = "\n".join(lines[i : i + self.lines_per_virtual_page]).strip()
            if chunk:
                pages.append(chunk)

        return pages if pages else [text.strip()]


txt_loader = TxtLoader()
