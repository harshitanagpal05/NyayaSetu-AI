def detect_language_style(text: str) -> str:
    text = text.lower()

    hindi_chars = any('\u0900' <= ch <= '\u097F' for ch in text)

    hinglish_keywords = [
        "kya", "kaise", "kyu", "hai", "karu", "mujhe", "mera", "hoga"
    ]

    if hindi_chars:
        return "hindi"

    if any(word in text for word in hinglish_keywords):
        return "hinglish"

    return "english"