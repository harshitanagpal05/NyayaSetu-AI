import re
from typing import Literal, List, Dict

IntentType = Literal["document", "general_legal"]


# -------------------------------
# 🧠 HELPER: Normalize Text
# -------------------------------
def _normalize(query: str, history: List[Dict] = None) -> str:
    query_clean = query.lower().strip()

    history_text = ""
    if history:
        history_text = " ".join(
            [msg.get("content", "") for msg in history]
        ).lower()

    return f"{query_clean} {history_text}"


# -------------------------------
# 🎯 INTENT DETECTION
# -------------------------------
def detect_intent(query: str, history: List[Dict] = None) -> IntentType:
    combined = _normalize(query, history)

    # -------------------------------
    # ⚖️ REAL-WORLD LEGAL KEYWORDS
    # -------------------------------
    legal_keywords = [
        "what should i do", "what can i do", "help me",
        "police", "harassed", "harassment", "threat",
        "threatened", "landlord", "tenant", "eviction",
        "divorce", "fir", "complaint", "arrest",
        "rights", "cheating", "fraud", "problem",
        "trouble", "scam"
    ]

    # -------------------------------
    # 📄 DOCUMENT KEYWORDS
    # -------------------------------
    document_keywords = [
        "this judgment", "this case", "this document",
        "in the judgment", "in this file", "mentioned here",
        "according to this", "summarize this",
        "explain this judgment", "legal issue",
        "ruling", "decision"
    ]

    # -------------------------------
    # 🔥 PRIORITY RULES
    # -------------------------------

    # Legal intent
    for keyword in legal_keywords:
        if keyword in combined:
            return "general_legal"

    # Document intent
    for keyword in document_keywords:
        if keyword in combined:
            return "document"

    # -------------------------------
    # 🧠 PATTERN DETECTION
    # -------------------------------

    if re.search(r"\b(this|the)\s+(judgment|case|document|order)\b", combined):
        return "document"

    if re.search(r"\b(explain|summarize|describe)\b", combined):
        return "document" if "this" in combined else "general_legal"

    # Multi-language personal context
    if re.search(r"\b(i|me|my|we|mujhe|mera|meri|hum|hamara)\b", combined):
        return "general_legal"

    if re.search(r"(मुझे|मेरा|मेरी|हम|हमारा)", combined):
        return "general_legal"

    # Legal structure
    if re.search(r"\b(section|article|ipc|court|case)\b", combined):
        return "general_legal"

    # Default fallback
    return "document"


# -------------------------------
# 🔥 LEGAL FILTER (CRITICAL)
# -------------------------------
def is_legal_query(query: str, history: List[Dict] = None):
    combined = _normalize(query, history)

    score = 0

    # ❌ NON-LEGAL (hard block)
    non_legal_signals = [
        "joke", "weather", "movie", "song",
        "cricket", "football", "ipl", "netflix",
        "recipe", "food", "coding"
    ]

    for word in non_legal_signals:
        if word in combined:
            return False, 0.1

    # -------------------------------
    # ✅ LEGAL KEYWORDS (EN + HI + HINGLISH)
    # -------------------------------
    legal_signals = [
        # English
        "law", "legal", "court", "judge", "police", "fir",
        "case", "crime", "rights", "section", "ipc",
        "complaint", "lawyer", "arrest", "bail",
        "tenant", "landlord", "agreement", "contract",
        "divorce", "salary", "fraud", "harassment",
        "scam", "threat", "cybercrime",

        # Hinglish
        "police", "complaint", "kanoon", "adhikar",
        "shikayat", "girftar", "dhokha",

        # Hindi
        "पुलिस", "शिकायत", "कानून", "अधिकार",
        "मामला", "गिरफ्तार", "धोखा"
    ]

    for word in legal_signals:
        if word in combined:
            score += 2

    # -------------------------------
    # 🧠 STRONG HINDI INTENT DETECTION (🔥 NEW)
    # -------------------------------

    # Hindi intent phrases
    if re.search(r"(मुझे|मेरी|मेरा).*?(शिकायत|मदद|समस्या|मामला)", combined):
        score += 3

    # Hinglish intent
    if re.search(r"(mujhe|mera|meri).*?(problem|issue|complaint|case)", combined):
        score += 3

    # English intent
    if re.search(r"\b(i|me|my).*?(problem|issue|complaint|case)\b", combined):
        score += 2

    # Legal structure
    if re.search(r"\b(section|ipc|court|case)\b", combined):
        score += 2

    # -------------------------------
    # 🎯 FINAL DECISION
    # -------------------------------

    if score >= 4:
        return True, 0.9
    elif score >= 2:
        return True, 0.75
    else:
        return False, 0.4