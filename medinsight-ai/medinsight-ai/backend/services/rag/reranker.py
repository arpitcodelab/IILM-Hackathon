"""MedInsight AI — LLM Reranker using llm_client."""
import asyncio, logging
from llm_client import generate_json
from api.models import RetrievedEvidence
logger = logging.getLogger("medinsight.rag.reranker")

class LLMReranker:
    async def rerank(self, query: str, candidates: list[RetrievedEvidence], top_k: int = 5) -> list[RetrievedEvidence]:
        if not candidates: return []
        if len(candidates) <= top_k: return candidates
        try:
            passages = [{"id": i, "text": c.content[:300], "source": c.source_title} for i, c in enumerate(candidates)]
            prompt = f"Query: {query}\nRank these {len(passages)} medical passages by relevance (most relevant first). Return JSON array of ids only: [0,1,2,...]\nPassages: {passages}"
            result = await asyncio.to_thread(generate_json, prompt, "Return a JSON array of passage IDs sorted by relevance to the query, most relevant first.", 0.0, 200)
            if isinstance(result, list):
                ranked = []
                for idx in result:
                    if isinstance(idx, int) and 0 <= idx < len(candidates):
                        ranked.append(candidates[idx])
                if ranked: return ranked[:top_k]
        except Exception as e:
            logger.warning(f"Reranker error: {e}. Using original ranking.")
        return candidates[:top_k]

reranker = LLMReranker()
