import os
import logging
import requests

logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_NAME = "llama-3.3-70b-versatile"


# ─────────────────────────────
# Language Style Detection
# ─────────────────────────────
def detect_language_style(text: str) -> str:
    text = text.lower()

    hindi_chars = any('\u0900' <= ch <= '\u097F' for ch in text)

    hinglish_keywords = [
        "kya", "kaise", "kyu", "kyun", "hai", "karu", "karna",
        "mujhe", "mera", "meri", "hoga", "ka", "ke", "ki"
    ]

    if hindi_chars:
        return "hindi"

    if any(word in text for word in hinglish_keywords):
        return "hinglish"

    return "english"


# ─────────────────────────────
# Main Function
# ─────────────────────────────
def query_groq_llm(user_query: str, history: str = "") -> str:
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise ValueError("GROQ_API_KEY not set")

    # Detect style
    style = detect_language_style(user_query)

    # System prompt
    system_prompt = f"""
You are a conversational legal awareness assistant for Indian users.

Match user's communication style naturally:
- Hindi → reply in Hindi
- Hinglish → reply in Hinglish
- English → reply in English

Do NOT force language. Be natural and human-like.

Tone:
- Simple
- Clear
- Supportive

You provide general legal guidance, not final legal advice.

Follow structure:
1. Situation Understanding
2. Immediate Steps
3. Legal Awareness
4. Caution
5. Suggestion
6. Disclaimer
"""

    # User prompt
    user_prompt = f"""
User communication style: {style}

Conversation History:
{history}

User Query:
{user_query}
"""

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.3,
        "max_tokens": 500,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    # ─────────────────────────────
    # API CALL
    # ─────────────────────────────
    try:
        logger.info(f"Calling Groq... (Style: {style})")

        response = requests.post(
            GROQ_API_URL,
            headers=headers,
            json=payload,
            timeout=30,
        )

        if response.status_code != 200:
            logger.error(f"Groq API Error: {response.text}")
            return fallback_response(style)

        data = response.json()

        if "choices" not in data or not data["choices"]:
            logger.error(f"Invalid response: {data}")
            return fallback_response(style)

        answer = data["choices"][0]["message"]["content"].strip()

        if not answer:
            return fallback_response(style)

        return answer

    except Exception as e:
        logger.error(f"Groq request failed: {e}")
        return fallback_response(style)


# ─────────────────────────────
# Fallback Response
# ─────────────────────────────
def fallback_response(style="english") -> str:

    if style == "hindi":
        return (
            "मुझे इस स्थिति के बारे में पूरी तरह से निश्चित जानकारी नहीं है।\n\n"
            "1. स्थिति समझ:\n"
            "ऐसा लगता है कि आप किसी कानूनी समस्या का सामना कर रहे हैं।\n\n"
            "2. तुरंत कदम:\n"
            "- शांत रहें\n"
            "- सभी जानकारी सुरक्षित रखें\n\n"
            "3. कानूनी जानकारी:\n"
            "- कानून स्थिति पर निर्भर करता है\n\n"
            "4. सावधानी:\n"
            "- बिना पूरी जानकारी के कदम न उठाएं\n\n"
            "5. सुझाव:\n"
            "- किसी वकील से सलाह लें\n\n"
            "6. अस्वीकरण:\n"
            "यह कानूनी सलाह नहीं है।"
        )

    elif style == "hinglish":
        return (
            "Mujhe is situation ke baare mein poori tarah sure nahi hai.\n\n"
            "1. Situation Understanding:\n"
            "Lagta hai aap legal issue face kar rahe hain.\n\n"
            "2. Immediate Steps:\n"
            "- Calm rahiye\n"
            "- Documents safe rakhein\n\n"
            "3. Legal Awareness:\n"
            "- Laws situation ke hisaab se change hote hain\n\n"
            "4. Caution:\n"
            "- Bina samjhe action mat lein\n\n"
            "5. Suggestion:\n"
            "- Lawyer se consult karein\n\n"
            "6. Disclaimer:\n"
            "Yeh legal advice nahi hai."
        )

    else:
        return (
            "I'm not fully confident about this situation.\n\n"
            "1. Situation Understanding:\n"
            "You may be facing a legal issue.\n\n"
            "2. Immediate Steps:\n"
            "- Stay calm\n"
            "- Keep records\n\n"
            "3. Legal Awareness:\n"
            "- Laws vary by case\n\n"
            "4. Caution:\n"
            "- Avoid acting without full clarity\n\n"
            "5. Suggestion:\n"
            "- Consult a lawyer\n\n"
            "6. Disclaimer:\n"
            "This is not legal advice."
        )