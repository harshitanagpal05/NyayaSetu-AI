import re
import logging

logger = logging.getLogger(__name__)


def validate_response(query: str, retrieved_chunks: list, llm_response: str) -> dict:
    """
    Validate LLM response for grounding and safety.
    retrieved_chunks: List[str] — plain text chunks
    """

    # ── Guard: malformed inputs ──────────────────────────────────────────────
    if not isinstance(llm_response, str) or not llm_response.strip():
        logger.warning("validate_response received empty/non-string llm_response")
        return {"answer": "I don't know", "confidence": 0.0, "safe": False}

    if not retrieved_chunks:
        logger.warning("validate_response received empty chunks list")
        return {"answer": "I don't know", "confidence": 0.0, "safe": False}

    # ── Ensure chunks are strings ────────────────────────────────────────────
    # Safety net in case dicts slip through
    chunk_strings = []
    for c in retrieved_chunks:
        if isinstance(c, str):
            chunk_strings.append(c)
        elif isinstance(c, dict):
            chunk_strings.append(c.get("chunk", ""))

    combined_chunks = " ".join(chunk_strings).lower()
    response_lower = llm_response.lower()

    logger.info(f"Safety check — response preview: {llm_response[:100]!r}")

    # ── Immediate reject: LLM admitted it doesn't know ──────────────────────
    if "i don't know" in response_lower or "i do not know" in response_lower:
        logger.info("Safety: LLM returned I don't know")
        return {"answer": "I don't know", "confidence": 0.2, "safe": False}

    # ── Grounding check: keyword overlap ────────────────────────────────────
    words = [w for w in response_lower.split() if len(w) > 3]  # skip noise words
    overlap = sum(1 for word in words if word in combined_chunks)
    grounded = overlap >= 8  # lowered from 10 — more lenient for short answers

    logger.info(f"Safety: overlap={overlap}, grounded={grounded}")

    # ── Overconfidence detection ─────────────────────────────────────────────
    banned = ["guaranteed", "always", "100%", "definitely", "absolutely certain"]
    overconfident = any(phrase in response_lower for phrase in banned)

    # ── Legal reference boost ────────────────────────────────────────────────
    legal_pattern = r"(section\s\d+|article\s\d+|clause\s\d+|order\s\d+)"
    legal_refs = re.findall(legal_pattern, response_lower)
    has_legal_ref = len(legal_refs) > 0

    # ── Confidence score ─────────────────────────────────────────────────────
    confidence = 0.0
    if grounded:
        confidence += 0.5
    if has_legal_ref:
        confidence += 0.2
    if not overconfident:
        confidence += 0.3
    confidence = min(confidence, 0.9)

    logger.info(f"Safety: confidence={confidence}, overconfident={overconfident}, legal_ref={has_legal_ref}")

    # ── Final decision ───────────────────────────────────────────────────────
    if not grounded or overconfident:
        return {"answer": "I don't know", "confidence": confidence, "safe": False}

    return {"answer": llm_response, "confidence": confidence, "safe": True}