"""
MedInsight AI — File Validator Service.
Validates uploaded documents for format, size, corruption, encryption, and integrity.
"""

from __future__ import annotations

import io
import logging
from pathlib import Path
from typing import Optional, Union

from PIL import Image

from api.models import FileType, FileValidationResult
from config import settings

logger = logging.getLogger("medinsight.file_validator")

# Supported file extensions mapped to FileType enum
EXTENSION_TO_FILE_TYPE: dict[str, FileType] = {
    ".pdf": FileType.PDF,
    ".jpg": FileType.JPG,
    ".jpeg": FileType.JPEG,
    ".png": FileType.PNG,
    ".txt": FileType.TXT,
}

# Known file signatures (magic bytes)
MAGIC_SIGNATURES: dict[FileType, list[bytes]] = {
    FileType.PDF: [b"%PDF-"],
    FileType.JPG: [b"\xff\xd8\xff"],
    FileType.JPEG: [b"\xff\xd8\xff"],
    FileType.PNG: [b"\x89PNG\r\n\x1a\n"],
}


class FileValidator:
    """Service for validating medical document files prior to processing."""

    def __init__(self, max_size_bytes: Optional[int] = None):
        self.max_size_bytes = max_size_bytes or settings.max_file_size_bytes

    def validate_file(
        self,
        file_path: Union[str, Path],
        original_filename: Optional[str] = None,
    ) -> FileValidationResult:
        """
        Validate a file on disk.

        Args:
            file_path: Absolute or relative path to the file.
            original_filename: Optional display name for the file.

        Returns:
            FileValidationResult with validity flag, file type, errors, and warnings.
        """
        path = Path(file_path)
        filename = original_filename or path.name

        if not path.exists():
            return FileValidationResult(
                filename=filename,
                is_valid=False,
                errors=[f"File not found: {filename}"],
            )

        try:
            size_bytes = path.stat().st_size
            data = path.read_bytes()
            return self.validate_bytes(data=data, filename=filename, size_bytes=size_bytes)
        except Exception as e:
            logger.error(f"Error reading file {filename}: {e}", exc_info=True)
            return FileValidationResult(
                filename=filename,
                is_valid=False,
                errors=[f"Failed to read file: {str(e)}"],
            )

    def validate_bytes(
        self,
        data: bytes,
        filename: str,
        size_bytes: Optional[int] = None,
    ) -> FileValidationResult:
        """
        Validate file content directly from bytes.

        Args:
            data: Raw file bytes.
            filename: Original filename including extension.
            size_bytes: Optional byte count; defaults to len(data).

        Returns:
            FileValidationResult.
        """
        errors: list[str] = []
        warnings: list[str] = []
        actual_size = size_bytes if size_bytes is not None else len(data)

        # 1. Filename & Extension Check
        clean_filename = Path(filename).name
        ext = Path(filename).suffix.lower()

        if not ext:
            errors.append(f"File '{clean_filename}' lacks an extension.")
            return FileValidationResult(
                filename=clean_filename,
                file_type=None,
                size_bytes=actual_size,
                is_valid=False,
                errors=errors,
            )

        file_type = EXTENSION_TO_FILE_TYPE.get(ext)
        if not file_type:
            allowed = ", ".join(EXTENSION_TO_FILE_TYPE.keys())
            errors.append(f"Unsupported file extension '{ext}'. Supported formats: {allowed}.")
            return FileValidationResult(
                filename=clean_filename,
                file_type=None,
                size_bytes=actual_size,
                is_valid=False,
                errors=errors,
            )

        # 2. File Size Check
        if actual_size == 0:
            errors.append(f"File '{clean_filename}' is empty (0 bytes).")
            return FileValidationResult(
                filename=clean_filename,
                file_type=file_type,
                size_bytes=0,
                is_valid=False,
                errors=errors,
            )

        if actual_size > self.max_size_bytes:
            max_mb = self.max_size_bytes / (1024 * 1024)
            actual_mb = actual_size / (1024 * 1024)
            errors.append(
                f"File size ({actual_mb:.2f} MB) exceeds maximum allowed size of {max_mb:.0f} MB."
            )
            return FileValidationResult(
                filename=clean_filename,
                file_type=file_type,
                size_bytes=actual_size,
                is_valid=False,
                errors=errors,
            )

        # 3. Magic Bytes / Header Signature Check
        expected_magics = MAGIC_SIGNATURES.get(file_type)
        if expected_magics:
            has_valid_magic = any(data.startswith(magic) for magic in expected_magics)
            if not has_valid_magic:
                errors.append(
                    f"File content does not match expected format for {file_type.value.upper()}."
                )
                return FileValidationResult(
                    filename=clean_filename,
                    file_type=file_type,
                    size_bytes=actual_size,
                    is_valid=False,
                    errors=errors,
                )

        # 4. Deep Format-Specific Validation
        if file_type == FileType.PDF:
            self._validate_pdf(data, errors, warnings)
        elif file_type in (FileType.JPG, FileType.JPEG, FileType.PNG):
            self._validate_image(data, errors, warnings)
        elif file_type == FileType.TXT:
            self._validate_txt(data, errors, warnings)

        return FileValidationResult(
            filename=clean_filename,
            file_type=file_type,
            size_bytes=actual_size,
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
        )

    def _validate_pdf(self, data: bytes, errors: list[str], warnings: list[str]) -> None:
        """Validate PDF integrity, encryption, and page structure using PyMuPDF."""
        try:
            import fitz

            doc = fitz.open(stream=data, filetype="pdf")

            if doc.is_encrypted or doc.needs_pass:
                errors.append("PDF document is encrypted or password-protected and cannot be processed.")
                doc.close()
                return

            page_count = len(doc)
            if page_count == 0:
                errors.append("PDF document contains 0 pages.")
                doc.close()
                return

            if page_count > 100:
                warnings.append(
                    f"PDF document has {page_count} pages. Processing may take longer than usual."
                )

            # Test first and last page access
            try:
                _ = doc[0].rect
                _ = doc[page_count - 1].rect
            except Exception as e:
                errors.append(f"Corrupted PDF page structure: {str(e)}")

            doc.close()

        except ImportError:
            warnings.append("PyMuPDF (fitz) is not installed; performing basic header check only.")
            if not data.startswith(b"%PDF-"):
                errors.append("Invalid PDF header.")
        except Exception as e:
            logger.warning(f"PDF validation failure: {e}")
            errors.append(f"Corrupted or invalid PDF file: {str(e)}")

    def _validate_image(self, data: bytes, errors: list[str], warnings: list[str]) -> None:
        """Validate image integrity and dimensions using Pillow."""
        try:
            with Image.open(io.BytesIO(data)) as img:
                img.verify()

            # Reopen to read dimensions and format (verify() closes internal state)
            with Image.open(io.BytesIO(data)) as img:
                width, height = img.size
                if width < 100 or height < 100:
                    warnings.append(
                        f"Image resolution is very low ({width}x{height} px). "
                        "OCR accuracy may be degraded."
                    )
                elif width > 10000 or height > 10000:
                    warnings.append(
                        f"Image resolution is very large ({width}x{height} px). "
                        "Image may be downscaled during processing."
                    )
        except Exception as e:
            logger.warning(f"Image validation failure: {e}")
            errors.append(f"Corrupted or invalid image file: {str(e)}")

    def _validate_txt(self, data: bytes, errors: list[str], warnings: list[str]) -> None:
        """Validate text file decodability and check for binary content."""
        # Check for excessive null bytes which indicate binary file
        null_count = data.count(b"\x00")
        if null_count > 0 and (null_count / max(len(data), 1)) > 0.01:
            errors.append("File contains binary data and does not appear to be a plain text document.")
            return

        # Attempt decoding with standard encodings
        decoded_text: Optional[str] = None
        for encoding in ["utf-8-sig", "utf-8", "cp1252", "latin-1"]:
            try:
                decoded_text = data.decode(encoding)
                break
            except UnicodeDecodeError:
                continue

        if decoded_text is None:
            errors.append("Unable to decode text file with UTF-8, CP1252, or Latin-1 encodings.")
            return

        if not decoded_text.strip():
            warnings.append("Text file contains only whitespace.")


file_validator = FileValidator()
