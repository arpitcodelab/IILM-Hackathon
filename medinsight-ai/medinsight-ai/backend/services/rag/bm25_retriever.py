"""
MedInsight AI — BM25 Keyword Retriever.
Provides sparse lexical retrieval using BM25Okapi with specialized
medical tokenization (handling acronyms, lab units, hyphenated drug names).
"""

import logging
import re
from typing import Optional

from rank_bm25 import BM25Okapi
from api.models import RetrievedEvidence

logger = logging.getLogger("medinsight.rag.bm25")

# Standard English stopwords, carefully retaining medical modifiers (no, not, without, increased, decreased)
STANDARD_STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "cannot", "could", "couldn't",
    "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
    "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
    "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
    "myself", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
    "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd",
    "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that",
    "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this",
    "those", "through", "to", "too", "under", "until", "up", "very", "was",
    "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what",
    "what's", "when", "when's", "where", "where's", "which", "while", "who",
    "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you",
    "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
}

# Regex to capture medical tokens:
# 1. Terms with slashes/units (e.g., mg/dl, mmhg, mmol/l)
# 2. Hyphenated drug/condition names (e.g., ace-inhibitor, beta-blocker, non-st)
# 3. Alphanumeric acronyms / tests (e.g., hba1c, egfr, spo2, bp, covid-19)
# 4. Standard words and numbers
TOKEN_PATTERN = re.compile(r"[a-zA-Z0-9]+(?:[-/][a-zA-Z0-9]+)*")


def tokenize_medical_text(text: str) -> list[str]:
    """
    Tokenize medical text while preserving acronyms, hyphenated terms, and lab units.
    """
    if not text:
        return []

    tokens: list[str] = []
    matches = TOKEN_PATTERN.findall(text.lower())
    for token in matches:
        if token in STANDARD_STOPWORDS:
            continue
        if len(token) > 1 or token.isdigit():
            tokens.append(token)

    return tokens


class BM25Retriever:
    """In-memory BM25 index over medical evidence documents."""

    def __init__(self):
        self._corpus_documents: list[RetrievedEvidence] = []
        self._bm25_index: Optional[BM25Okapi] = None
        self._tokenized_corpus: list[list[str]] = []

    def index_documents(self, documents: list[RetrievedEvidence]) -> None:
        """
        Build or update the BM25 index with a list of RetrievedEvidence objects.
        """
        if not documents:
            logger.info("No documents provided to BM25 retriever.")
            return

        self._corpus_documents = list(documents)
        self._tokenized_corpus = [
            tokenize_medical_text(f"{doc.source_title} {doc.section} {doc.content}")
            for doc in self._corpus_documents
        ]

        # BM25Okapi expects list of list of token strings
        if self._tokenized_corpus:
            self._bm25_index = BM25Okapi(self._tokenized_corpus)
            logger.info(f"BM25 index built with {len(self._corpus_documents)} documents.")
        else:
            self._bm25_index = None

    def retrieve(self, query: str, top_k: int = 5) -> list[RetrievedEvidence]:
        """
        Retrieve the top_k most relevant documents for query using BM25.
        """
        if not query or not query.strip() or not self._bm25_index or not self._corpus_documents:
            return []

        tokens = tokenize_medical_text(query)
        if not tokens:
            return []

        scores = self._bm25_index.get_scores(tokens)

        # Pair documents with scores
        scored_docs: list[tuple[float, RetrievedEvidence]] = []
        for idx, score in enumerate(scores):
            if score > 0.0:  # Only return documents that had some term match
                scored_docs.append((float(score), self._corpus_documents[idx]))

        if not scored_docs:
            return []

        # Sort descending by score
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        top_matches = scored_docs[:top_k]

        # Normalize BM25 scores to [0.0, 1.0] relative to max score
        max_score = top_matches[0][0] or 1.0

        results: list[RetrievedEvidence] = []
        for score, doc in top_matches:
            normalized_score = min(1.0, max(0.0, score / max_score))
            # Clone with BM25 score
            results.append(
                RetrievedEvidence(
                    content=doc.content,
                    source_title=doc.source_title,
                    source_publisher=doc.source_publisher,
                    source_url=doc.source_url,
                    source_date=doc.source_date,
                    relevance_score=round(normalized_score, 4),
                    chunk_id=doc.chunk_id,
                    section=doc.section,
                )
            )

        return results

    def count(self) -> int:
        """Return the number of documents in BM25 index."""
        return len(self._corpus_documents)

    def clear(self) -> None:
        """Clear the BM25 index."""
        self._corpus_documents = []
        self._tokenized_corpus = []
        self._bm25_index = None
        logger.info("BM25 index cleared.")


# Global singleton instance
bm25_retriever = BM25Retriever()
