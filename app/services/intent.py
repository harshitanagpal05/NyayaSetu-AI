import re
from typing import Literal, List, Dict

IntentType = Literal["document", "general_legal"]


def detect_intent(query: str, history: List[Dict] = None) -> IntentType:
    """
    Detect user intent using:
    - current query
    - conversation history (for context)
    """

    query_clean = query.lower().strip()

    # 🔥 Combine history for context awareness
    history_text = ""
    if history:
        history_text = " ".join(
            [msg.get("content", "") for msg in history]
        ).lower()

    combined = query_clean + " " + history_text

    # -------------------------------
    # ⚖️ REAL-WORLD LEGAL KEYWORDS
    # -------------------------------
    legal_keywords = [
        "what should i do",
        "what can i do",
        "help me",
        "police",
        "harassed",
        "harassment",
        "threat",
        "threatened",
        "landlord",
        "tenant",
        "eviction",
        "divorce",
        "fir",
        "complaint",
        "arrest",
        "rights",
        "cheating",
        "fraud",
        "problem",
        "trouble",
        "scam",
        "they threatened me",
        "he threatened me",
    ]

    # -------------------------------
    # 📄 DOCUMENT KEYWORDS
    # -------------------------------
    document_keywords = [
        "this judgment",
        "this case",
        "this document",
        "in the judgment",
        "in this file",
        "mentioned here",
        "according to this",
        "summarize this",
        "explain this judgment",
        "what does this judgment say",
        "legal issue",
        "ruling",
        "decision",
    ]

    # -------------------------------
    # 🎯 PRIORITY RULES
    # -------------------------------

    # 🔥 Rule 1: Real-world (HIGH PRIORITY)
    for keyword in legal_keywords:
        if keyword in combined:
            return "general_legal"

    # 🔥 Rule 2: Strong document signals
    for keyword in document_keywords:
        if keyword in combined:
            return "document"

    # -------------------------------
    # 🧠 PATTERN-BASED DETECTION
    # -------------------------------

    # "this judgment / this case"
    if re.search(r"\b(this|the)\s+(judgment|case|document|order)\b", combined):
        return "document"

    # Explanation queries
    if re.search(r"\b(explain|summarize|describe)\b", combined):
        if "this" in combined:
            return "document"
        return "general_legal"

    # Personal context → real-world
    if re.search(r"\b(i|me|my|we)\b", combined):
        return "general_legal"

    # Legal sections → safer as general
    if re.search(r"\b(section|article|ipc)\b", combined):
        return "general_legal"

    # -------------------------------
    # 🧠 FALLBACK (IMPORTANT)
    # -------------------------------

    # Default to document (safer for your system)
    return "document"