"""
MedInsight AI — OCR Engine Service.
Provides dual-engine OCR processing using Tesseract (for printed records with word-level confidence)
and Google Gemini Vision (for handwritten clinical notes and prescriptions).
"""

from __future__ import annotations

import asyncio
import io
import logging
import os
import re
from pathlib import Path
from typing import Optional, Union

import cv2
import numpy as np
from PIL import Image
import pytesseract
from pytesseract import Output

from api.models import ConfidenceLevel, ExtractedPage, OcrWord
from config import settings
from services.document_processing.image_processor import image_processor

logger = logging.getLogger("medinsight.ocr_engine")

# Configure tesseract binary path
if settings.tesseract_cmd:
    pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd

# Word confidence thresholds for Tesseract
WORD_CONFIDENCE_THRESHOLD = 60.0
HIGH_CONFIDENCE_THRESHOLD = 80.0
MEDIUM_CONFIDENCE_THRESHOLD = 60.0

# Pattern to identify potential critical medical terms, dosages, units, numbers
CRITICAL_MEDICAL_PATTERN = re.compile(
    r"\b(?:\d+(?:\.\d+)?(?:\s*(?:mg|mcg|g|ml|iu|units?|tablets?|caps?|tab|cap|od|bd|tds|qid|sos|prn|po|iv|im|mmhg|bpm|%))?|[a-z]{3,}(?:cillin|mycin|olol|statin|pril|sartan|zole|pam|pine|ide|gliptin))\b",
    re.IGNORECASE,
)


class TesseractProvider:
    """OCR provider using Tesseract for printed medical text with token-level confidence metrics."""

    def __init__(self, tesseract_cmd: Optional[str] = None):
        self.cmd = tesseract_cmd or settings.tesseract_cmd
        if self.cmd:
            pytesseract.pytesseract.tesseract_cmd = self.cmd

    def is_available(self) -> bool:
        """Check if Tesseract binary is accessible on the host system."""
        try:
            if self.cmd and Path(self.cmd).exists():
                return True
            # Test running tesseract command
            pytesseract.get_tesseract_version()
            return True
        except Exception:
            return False

    def extract(
        self,
        image_input: Union[np.ndarray, bytes, Image.Image],
        page_number: int = 1,
    ) -> ExtractedPage:
        """
        Extract text and word-level confidence scores from an image using Tesseract.

        Args:
            image_input: Image array, raw bytes, or PIL Image.
            page_number: Document page number.

        Returns:
            ExtractedPage with word confidence and extraction method.
        """
        try:
            # Preprocess image for printed OCR (includes deskew and Otsu binarization)
            preprocessed_np = image_processor.preprocess_for_ocr(
                image_input,
                is_handwritten=False,
                deskew_enabled=True,
            )
            pil_image = image_processor.to_pil(preprocessed_np)

            # Tesseract configuration optimized for clinical text
            # OEM 3 = Default, PSM 3 = Fully automatic page segmentation
            custom_config = r"--oem 3 --psm 3"

            data = pytesseract.image_to_data(
                pil_image,
                output_type=Output.DICT,
                config=custom_config,
            )

            words_text: list[str] = []
            ocr_words: list[OcrWord] = []
            confidence_scores: list[float] = []

            n_boxes = len(data["text"])
            for i in range(n_boxes):
                word_text = data["text"][i].strip()
                conf_str = data["conf"][i]

                try:
                    conf = float(conf_str)
                except (ValueError, TypeError):
                    conf = -1.0

                if not word_text:
                    continue

                words_text.append(word_text)

                if conf >= 0:
                    confidence_scores.append(conf)

                is_critical = bool(CRITICAL_MEDICAL_PATTERN.search(word_text))
                # Mark as uncertain if below baseline threshold, or below 75% for numbers/dosages
                is_uncertain = (conf < WORD_CONFIDENCE_THRESHOLD) or (is_critical and conf < 75.0)

                ocr_words.append(
                    OcrWord(
                        text=word_text,
                        confidence=conf,
                        is_uncertain=is_uncertain,
                        page=page_number,
                    )
                )

            full_page_text = " ".join(words_text)

            # Calculate aggregate confidence
            if confidence_scores:
                avg_conf = sum(confidence_scores) / len(confidence_scores)
                if avg_conf >= HIGH_CONFIDENCE_THRESHOLD:
                    page_confidence = ConfidenceLevel.HIGH
                elif avg_conf >= MEDIUM_CONFIDENCE_THRESHOLD:
                    page_confidence = ConfidenceLevel.MEDIUM
                else:
                    page_confidence = ConfidenceLevel.LOW
            else:
                page_confidence = ConfidenceLevel.UNKNOWN

            uncertain_words = [w for w in ocr_words if w.is_uncertain]

            return ExtractedPage(
                page_number=page_number,
                text=full_page_text,
                extraction_method="ocr_printed",
                ocr_confidence=page_confidence,
                uncertain_words=uncertain_words,
                has_images=True,
                has_handwriting=False,
            )

        except Exception as e:
            logger.error(f"Tesseract OCR failed on page {page_number}: {e}", exc_info=True)
            return ExtractedPage(
                page_number=page_number,
                text="",
                extraction_method="ocr_printed",
                ocr_confidence=ConfidenceLevel.LOW,
                uncertain_words=[],
                has_images=True,
                has_handwriting=False,
            )


class GeminiVisionProvider:
    """OCR provider using Google Gemini Vision (gemini-2.5-flash) for handwritten clinical records."""

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or settings.google_api_key
        self.model_name = model_name or settings.llm_model or "gemini-3.8-flash"
        self._initialized = False

    def _ensure_configured(self) -> bool:
        """Initialize google.generativeai client if API key is present."""
        if not self.api_key:
            return False
        if not self._initialized:
            try:
                import google.generativeai as genai

                genai.configure(api_key=self.api_key)
                self._initialized = True
            except Exception as e:
                logger.error(f"Failed to configure Gemini Vision: {e}")
                return False
        return True

    def is_available(self) -> bool:
        """Check if Gemini Vision has a valid API key configured."""
        return bool(self.api_key and self.api_key.strip())

    async def extract_async(
        self,
        image_input: Union[np.ndarray, bytes, Image.Image],
        page_number: int = 1,
    ) -> ExtractedPage:
        """Extract text and handwriting asynchronously using Gemini Vision."""
        if not self._ensure_configured():
            logger.warning("Gemini Vision requested but Google API key is missing or unconfigured.")
            return ExtractedPage(
                page_number=page_number,
                text="",
                extraction_method="ocr_handwritten",
                ocr_confidence=ConfidenceLevel.UNKNOWN,
                uncertain_words=[],
                has_images=True,
                has_handwriting=True,
            )

        try:
            import google.generativeai as genai

            # Preprocess image gently for vision LLM (preserves ink gradients, no binarization)
            preprocessed_np = image_processor.preprocess_for_ocr(
                image_input,
                is_handwritten=True,
                deskew_enabled=True,
            )
            pil_image = image_processor.to_pil(preprocessed_np)

            prompt = (
                "You are an expert medical transcriptionist analyzing clinical documents, doctor prescriptions, "
                "lab reports, and handwritten notes.\n\n"
                "TASK:\n"
                "Transcribe ALL visible text accurately and verbatim.\n"
                "1. Maintain document layout and structure (headers, tables, lists, signature blocks).\n"
                "2. Transcribe both printed headings and handwritten clinical notes, dosages, medications, and findings.\n"
                "3. If a medical term, medication name, dosage, or number is unclear or difficult to read, "
                "transcribe your best reading enclosed in square brackets with a question mark or uncertain tag, "
                "for example: [uncertain: Metformin 500mg] or [illegible].\n"
                "4. Output ONLY the transcribed text. Do not add conversational commentary or explanations."
            )

            model = genai.GenerativeModel(self.model_name)
            response = await model.generate_content_async(
                [prompt, pil_image],
                generation_config={"temperature": 0.1, "max_output_tokens": 4096},
            )

            raw_text = response.text if response and response.text else ""

            # Extract uncertain/illegible words identified by LLM
            uncertain_words: list[OcrWord] = []
            uncertain_matches = re.finditer(r"\[uncertain:\s*([^\]]+)\]|\[illegible\]", raw_text, re.IGNORECASE)
            for m in uncertain_matches:
                u_text = m.group(1) or m.group(0)
                uncertain_words.append(
                    OcrWord(
                        text=u_text.strip(),
                        confidence=-1.0,  # Unknown confidence
                        is_uncertain=True,
                        page=page_number,
                    )
                )

            # Per instructions: For Gemini Vision, return ConfidenceLevel.UNKNOWN
            return ExtractedPage(
                page_number=page_number,
                text=raw_text.strip(),
                extraction_method="ocr_handwritten",
                ocr_confidence=ConfidenceLevel.UNKNOWN,
                uncertain_words=uncertain_words,
                has_images=True,
                has_handwriting=True,
            )

        except Exception as e:
            logger.error(f"Gemini Vision OCR failed on page {page_number}: {e}", exc_info=True)
            return ExtractedPage(
                page_number=page_number,
                text="",
                extraction_method="ocr_handwritten",
                ocr_confidence=ConfidenceLevel.UNKNOWN,
                uncertain_words=[],
                has_images=True,
                has_handwriting=True,
            )

    def extract(
        self,
        image_input: Union[np.ndarray, bytes, Image.Image],
        page_number: int = 1,
    ) -> ExtractedPage:
        """Synchronous wrapper for extract_async."""
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # If already inside an event loop, use run_coroutine_threadsafe or nest_asyncio
                import concurrent.futures

                with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                    future = executor.submit(
                        asyncio.run,
                        self.extract_async(image_input=image_input, page_number=page_number),
                    )
                    return future.result()
            else:
                return loop.run_until_complete(
                    self.extract_async(image_input=image_input, page_number=page_number)
                )
        except Exception:
            return asyncio.run(self.extract_async(image_input=image_input, page_number=page_number))


class OcrEngine:
    """Orchestrator combining Tesseract and Gemini Vision providers with fallback handling."""

    def __init__(
        self,
        tesseract_provider: Optional[TesseractProvider] = None,
        vision_provider: Optional[GeminiVisionProvider] = None,
    ):
        self.tesseract = tesseract_provider or TesseractProvider()
        self.vision = vision_provider or GeminiVisionProvider()

    async def ocr_page_async(
        self,
        image_input: Union[np.ndarray, bytes, Image.Image],
        page_number: int = 1,
        force_vision: bool = False,
    ) -> ExtractedPage:
        """
        Process a page image through the best available OCR provider.

        Args:
            image_input: Image to process.
            page_number: Page number being processed.
            force_vision: If True, bypasses Tesseract and uses Gemini Vision directly.

        Returns:
            ExtractedPage with extracted text, confidence, and flagged uncertain items.
        """
        # If explicitly requested or handwriting suspected, use Gemini Vision if available
        if force_vision and self.vision.is_available():
            logger.info(f"Page {page_number}: Processing with Gemini Vision (force_vision=True).")
            return await self.vision.extract_async(image_input, page_number=page_number)

        # Check if Tesseract is available
        if self.tesseract.is_available() and not force_vision:
            logger.info(f"Page {page_number}: Processing with Tesseract OCR.")
            # Run Tesseract in thread pool to avoid blocking async loop
            page_result = await asyncio.to_thread(
                self.tesseract.extract,
                image_input=image_input,
                page_number=page_number,
            )

            # If Tesseract produced meaningful text and adequate confidence, return it
            if page_result.text.strip() and page_result.ocr_confidence in (
                ConfidenceLevel.HIGH,
                ConfidenceLevel.MEDIUM,
            ):
                return page_result

            # If Tesseract returned low confidence or empty text, fallback to Gemini Vision if available
            if self.vision.is_available():
                logger.info(
                    f"Page {page_number}: Tesseract confidence was {page_result.ocr_confidence.value}; "
                    "falling back to Gemini Vision."
                )
                vision_result = await self.vision.extract_async(image_input, page_number=page_number)
                if vision_result.text.strip():
                    return vision_result

            return page_result

        # Fallback to Gemini Vision if Tesseract is unavailable
        if self.vision.is_available():
            logger.info(f"Page {page_number}: Tesseract unavailable; processing with Gemini Vision.")
            return await self.vision.extract_async(image_input, page_number=page_number)

        logger.error(f"Page {page_number}: No OCR provider is currently available.")
        return ExtractedPage(
            page_number=page_number,
            text="",
            extraction_method="ocr_failed",
            ocr_confidence=ConfidenceLevel.LOW,
            uncertain_words=[],
            has_images=True,
            has_handwriting=False,
        )

    def ocr_page(
        self,
        image_input: Union[np.ndarray, bytes, Image.Image],
        page_number: int = 1,
        force_vision: bool = False,
    ) -> ExtractedPage:
        """Synchronous wrapper for ocr_page_async."""
        return asyncio.run(
            self.ocr_page_async(
                image_input=image_input,
                page_number=page_number,
                force_vision=force_vision,
            )
        )


ocr_engine = OcrEngine()
