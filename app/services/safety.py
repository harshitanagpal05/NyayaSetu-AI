import re
import logging

logger = logging.getLogger(__name__)


def validate_response(query: str, retrieved_chunks: list, llm_response: str) -> dict:
    """
    SAFE validation:
    - Never deletes answer
    - Adjusts confidence smartly
    """

    if not isinstance(llm_response, str) or not llm_response.strip():
        return {
            "answer": "I don't know",
            "confidence": 0,
            "safe": False
        }

    chunk_strings = []
    for c in retrieved_chunks or []:
        if isinstance(c, str):
            chunk_strings.append(c)
        elif isinstance(c, dict):
            chunk_strings.append(c.get("chunk", ""))

    combined_chunks = " ".join(chunk_strings).lower()
    response_lower = llm_response.lower()

    # Grounding
    words = [w for w in response_lower.split() if len(w) > 3]
    overlap = sum(1 for word in words if word in combined_chunks)
    grounded = overlap >= 5

    # Overconfidence
    banned = ["guaranteed", "always", "100%", "definitely"]
    overconfident = any(p in response_lower for p in banned)

    # Legal reference
    legal_pattern = r"(section\s\d+|article\s\d+|ipc\s\d+|crpc\s\d+)"
    has_legal_ref = bool(re.search(legal_pattern, response_lower))

    # ✅ Balanced confidence
    confidence = 65

    if grounded:
        confidence += 15

    if has_legal_ref:
        confidence += 10

    if overconfident:
        confidence -= 5

    if not chunk_strings:
        confidence -= 5

    confidence = max(40, min(confidence, 95))

    return {
        "answer": llm_response,
        "confidence": confidence,
        "safe": grounded
    }