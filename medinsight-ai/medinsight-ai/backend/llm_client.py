"""
MedInsight AI — Central LLM Client using google-genai SDK.
Supports multiple fallback models (gemini-3.5-flash, gemini-3.5-flash-lite)
so requests never fail if one model experiences quota limits or high demand.
"""

import json
import logging
from typing import Optional

from google import genai
from google.genai import types as genai_types

from config import settings

logger = logging.getLogger("medinsight.llm_client")

# Candidate models in priority order
CANDIDATE_MODELS = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
]

_client: Optional[genai.Client] = None


def get_client() -> genai.Client:
    """Get or create the shared Gemini client."""
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.google_api_key)
    return _client


def generate_text(prompt: str, system_instruction: str = "", temperature: float = 0.2,
                  max_tokens: int = 4096, json_mode: bool = False) -> str:
    """
    Generate text using Gemini with automatic model fallback.
    """
    client = get_client()

    config_kwargs: dict = {
        "temperature": temperature,
        "max_output_tokens": max_tokens,
    }
    if json_mode:
        config_kwargs["response_mime_type"] = "application/json"

    contents = []
    if system_instruction:
        contents.append(genai_types.Content(
            role="user",
            parts=[genai_types.Part(text=f"[SYSTEM INSTRUCTIONS]\n{system_instruction}\n\n[USER REQUEST]\n{prompt}")]
        ))
    else:
        contents.append(genai_types.Content(
            role="user",
            parts=[genai_types.Part(text=prompt)]
        ))

    last_error = None
    for model_name in CANDIDATE_MODELS:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=genai_types.GenerateContentConfig(**config_kwargs),
            )
            if response and response.text:
                return response.text
        except Exception as e:
            logger.warning(f"Model {model_name} failed: {e}. Trying fallback model...")
            last_error = e

    if last_error:
        raise last_error
    return ""


def generate_json(prompt: str, system_instruction: str = "", temperature: float = 0.0,
                  max_tokens: int = 4096) -> dict:
    """
    Generate structured JSON output with automatic cleaning.
    """
    raw = generate_text(prompt, system_instruction, temperature, max_tokens, json_mode=True)
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.rstrip("```").strip()
    return json.loads(raw)


def embed_text(text: str, task_type: str = "retrieval_query") -> list[float]:
    """
    Generate embedding for a single text using gemini-embedding-001.
    Falls back to deterministic hash-based vector on failure.
    """
    import hashlib, math
    DIM = 3072

    def fallback(t: str) -> list[float]:
        h = hashlib.sha256(t.encode()).digest()
        vals = [(int.from_bytes(h[(i*4)%len(h):(i*4)%len(h)+4], "little", signed=True) / 2147483648.0) for i in range(DIM)]
        norm = math.sqrt(sum(v*v for v in vals)) or 1.0
        return [v/norm for v in vals]

    if not text or not text.strip():
        return [0.0] * DIM

    try:
        client = get_client()
        result = client.models.embed_content(
            model=settings.embedding_model,
            contents=text.strip(),
            config=genai_types.EmbedContentConfig(task_type=task_type),
        )
        if result and result.embeddings:
            emb = result.embeddings[0].values
            if emb:
                return list(emb)
    except Exception as e:
        logger.warning(f"Embedding API error: {e}. Using fallback vector.")

    return fallback(text)


def embed_batch(texts: list[str], task_type: str = "retrieval_document") -> list[list[float]]:
    """Embed a list of texts."""
    return [embed_text(t, task_type) for t in texts]
