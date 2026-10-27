"""
MedInsight AI — Image Processing Service.
Preprocesses medical document scans and photos using OpenCV to optimize OCR accuracy.
Includes grayscale conversion, CLAHE contrast enhancement, denoising, deskewing, and adaptive thresholding.
"""

from __future__ import annotations

import io
import logging
from pathlib import Path
from typing import Optional, Tuple, Union

import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger("medinsight.image_processor")


class ImageProcessor:
    """OpenCV-based image preprocessing pipeline for medical OCR."""

    @staticmethod
    def load_image(source: Union[str, Path, bytes, np.ndarray, Image.Image]) -> np.ndarray:
        """
        Load an image from various input types into a standard BGR numpy array.

        Args:
            source: File path, raw bytes, PIL Image, or existing numpy array.

        Returns:
            np.ndarray: BGR image array.
        """
        if isinstance(source, np.ndarray):
            if len(source.shape) == 2:
                return cv2.cvtColor(source, cv2.COLOR_GRAY2BGR)
            return source.copy()

        if isinstance(source, (str, Path)):
            path_str = str(source)
            # Use imdecode to safely support unicode file paths on Windows
            with open(path_str, "rb") as f:
                data = f.read()
            nparr = np.frombuffer(data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError(f"Failed to decode image from path: {path_str}")
            return img

        if isinstance(source, bytes):
            nparr = np.frombuffer(source, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Failed to decode image from raw bytes")
            return img

        if isinstance(source, Image.Image):
            rgb = np.array(source.convert("RGB"))
            return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)

        raise TypeError(f"Unsupported image input type: {type(source)}")

    @staticmethod
    def to_grayscale(image: np.ndarray) -> np.ndarray:
        """Convert BGR image to single-channel 8-bit grayscale."""
        if len(image.shape) == 2:
            return image
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    @staticmethod
    def enhance_contrast(
        gray: np.ndarray,
        clip_limit: float = 2.0,
        tile_grid_size: Tuple[int, int] = (8, 8),
    ) -> np.ndarray:
        """
        Apply Contrast Limited Adaptive Histogram Equalization (CLAHE).
        Effective for clinical records with uneven illumination, shadow, or faded ink.
        """
        if len(gray.shape) != 2:
            gray = ImageProcessor.to_grayscale(gray)
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
        return clahe.apply(gray)

    @staticmethod
    def denoise(gray: np.ndarray, method: str = "bilateral") -> np.ndarray:
        """
        Apply noise reduction while preserving sharp edge boundaries of clinical text.

        Args:
            gray: Grayscale input image.
            method: 'bilateral' (edge-preserving) or 'fast_nl' (Non-Local Means).
        """
        if len(gray.shape) != 2:
            gray = ImageProcessor.to_grayscale(gray)

        if method == "fast_nl":
            return cv2.fastNlMeansDenoising(gray, None, h=10, templateWindowSize=7, searchWindowSize=21)

        # Bilateral filter smooths textures while preserving sharp text edges
        return cv2.bilateralFilter(gray, d=7, sigmaColor=50, sigmaSpace=50)

    @staticmethod
    def deskew(gray: np.ndarray, max_angle: float = 45.0) -> Tuple[np.ndarray, float]:
        """
        Detect and correct text orientation skew using minimum area bounding box of contours.

        Args:
            gray: Grayscale input image.
            max_angle: Maximum allowable angle correction in degrees.

        Returns:
            Tuple of (deskewed_image, detected_angle_in_degrees).
        """
        if len(gray.shape) != 2:
            gray = ImageProcessor.to_grayscale(gray)

        h, w = gray.shape[:2]

        # Invert colors so text is foreground (white on black background)
        inverted = cv2.bitwise_not(gray)
        thresh = cv2.threshold(inverted, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

        # Find coordinates of all non-zero pixels
        coords = np.column_stack(np.where(thresh > 0))
        if coords.shape[0] < 50:
            return gray, 0.0

        # Calculate minimum bounding box
        rect = cv2.minAreaRect(coords)
        angle = rect[-1]

        # OpenCV minAreaRect returns angle in range [-90, 0)
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle

        # Check if the angle is within reasonable bounds
        if abs(angle) > max_angle or abs(angle) < 0.2:
            return gray, 0.0

        # Rotate image around its center
        center = (w // 2, h // 2)
        rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(
            gray,
            rotation_matrix,
            (w, h),
            flags=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REPLICATE,
        )

        logger.debug(f"Deskew applied: rotated by {angle:.2f} degrees")
        return rotated, angle

    @staticmethod
    def threshold(gray: np.ndarray, method: str = "otsu") -> np.ndarray:
        """
        Binarize grayscale image for high-contrast printed text OCR.

        Args:
            gray: Grayscale input image.
            method: 'otsu' for global Otsu binarization, or 'adaptive' for local Gaussian threshold.
        """
        if len(gray.shape) != 2:
            gray = ImageProcessor.to_grayscale(gray)

        if method == "adaptive":
            return cv2.adaptiveThreshold(
                gray,
                255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY,
                blockSize=21,
                C=10,
            )

        # Otsu's thresholding with Gaussian blur preprocessing
        blur = cv2.GaussianBlur(gray, (3, 3), 0)
        _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return thresh

    @classmethod
    def preprocess_for_ocr(
        cls,
        source: Union[str, Path, bytes, np.ndarray, Image.Image],
        is_handwritten: bool = False,
        deskew_enabled: bool = True,
    ) -> np.ndarray:
        """
        Complete preprocessing pipeline tailored for medical documents.

        For printed documents:
            Grayscale -> CLAHE -> Denoise -> Deskew -> Otsu Binarization
        For handwritten documents (or LLM Vision input):
            Grayscale -> CLAHE -> Denoise -> Deskew (retains soft gray gradations)

        Args:
            source: Input image source.
            is_handwritten: If True, skips harsh binarization to preserve subtle pen strokes.
            deskew_enabled: Whether to perform skew detection and correction.

        Returns:
            np.ndarray: Preprocessed image ready for OCR.
        """
        bgr = cls.load_image(source)
        gray = cls.to_grayscale(bgr)

        # 1. Contrast enhancement via CLAHE
        enhanced = cls.enhance_contrast(gray)

        # 2. Edge-preserving denoising
        denoised = cls.denoise(enhanced)

        # 3. Deskewing
        processed = denoised
        if deskew_enabled:
            deskewed, _ = cls.deskew(denoised)
            processed = deskewed

        # 4. Optional binarization for printed text
        if not is_handwritten:
            processed = cls.threshold(processed, method="otsu")

        return processed

    @staticmethod
    def to_pil(image: np.ndarray) -> Image.Image:
        """Convert a numpy image (gray or BGR) to a PIL Image."""
        if len(image.shape) == 2:
            return Image.fromarray(image)
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return Image.fromarray(rgb)

    @staticmethod
    def to_bytes(image: np.ndarray, format: str = "PNG") -> bytes:
        """Encode an image array into memory bytes (e.g. PNG)."""
        ext = f".{format.lower().lstrip('.')}"
        success, buffer = cv2.imencode(ext, image)
        if not success:
            raise RuntimeError(f"Failed to encode image to {format}")
        return buffer.tobytes()


image_processor = ImageProcessor()
