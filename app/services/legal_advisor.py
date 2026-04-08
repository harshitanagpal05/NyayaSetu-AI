import os
import logging
import requests

logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_NAME = "llama-3.3-70b-versatile"


# ✅ Language Style Detection (Improved)
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


def generate_legal_advice(user_query: str, history: str = "") -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError(
            "GROQ_API_KEY environment variable is not set."
        )

    # ✅ Detect user style
    style = detect_language_style(user_query)

    # ✅ NEW: Natural adaptive system prompt
    system_prompt = f"""
You are a conversational legal awareness assistant for Indian users.

Match the user's communication style naturally:

- If user writes in Hindi → reply in Hindi
- If user writes in Hinglish → reply in Hinglish (natural mix like Indians speak)
- If user writes in English → reply in English

Do NOT force language. Adapt naturally like a human conversation.

Tone:
- Simple
- Clear
- Supportive
- Slightly conversational (not robotic)

You provide general legal guidance and first-aid support — NOT final legal advice.

You MUST consider conversation history and continue context.

Your response MUST follow this structure:
1. Situation Understanding
2. Immediate Steps
3. Legal Awareness
4. Caution
5. Suggestion to consult a lawyer
6. Disclaimer (This is general legal information, not legal advice)

Rules:
- Do NOT give guarantees
- Do NOT provide definitive legal advice
- If unsure, say you are not fully certain
"""

    # ✅ NEW: Style hint in user prompt (IMPORTANT)
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

    try:
        logger.info(f"Calling Groq... (Detected Style: {style})")

        response = requests.post(
            GROQ_API_URL,
            headers=headers,
            json=payload,
            timeout=20,
        )

        if response.status_code != 200:
            logger.error(f"Groq error: {response.text}")
            return fallback_response(style)

        data = response.json()

        if "choices" not in data or not data["choices"]:
            return fallback_response(style)

        answer = data["choices"][0]["message"]["content"].strip()

        if not answer:
            return fallback_response(style)

        return answer

    except Exception as e:
        logger.error(f"Groq request failed: {e}")
        return fallback_response(style)


# ✅ Updated fallback (adaptive)
def fallback_response(style="english") -> str:

    if style == "hindi":
        return (
            "मुझे इस स्थिति के बारे में पूरी तरह से निश्चित जानकारी नहीं है।\n\n"
            "1. स्थिति समझ:\n"
            "ऐसा लगता है कि आप किसी कानूनी समस्या का सामना कर रहे हैं।\n\n"
            "2. तुरंत कदम:\n"
            "- शांत रहें और अपनी सुरक्षा सुनिश्चित करें\n"
            "- सभी जानकारी को सुरक्षित रखें\n\n"
            "3. कानूनी जानकारी:\n"
            "- कानून स्थिति के अनुसार बदल सकते हैं\n\n"
            "4. सावधानी:\n"
            "- बिना पूरी जानकारी के कोई कदम न उठाएं\n\n"
            "5. सुझाव:\n"
            "- किसी योग्य वकील से सलाह लें\n\n"
            "6. अस्वीकरण:\n"
            "यह सामान्य कानूनी जानकारी है, कानूनी सलाह नहीं।"
        )

    elif style == "hinglish":
        return (
            "Mujhe is situation ke baare mein poori tarah sure nahi hai.\n\n"
            "1. Situation Understanding:\n"
            "Lagta hai aap kisi legal issue ka saamna kar rahe hain.\n\n"
            "2. Immediate Steps:\n"
            "- Calm rahiye aur apni safety ensure karein\n"
            "- Sab documents safe rakhein\n\n"
            "3. Legal Awareness:\n"
            "- Laws situation ke hisaab se vary karte hain\n\n"
            "4. Caution:\n"
            "- Bina poori jaankari ke action na lein\n\n"
            "5. Suggestion:\n"
            "- Ek qualified lawyer se consult karein\n\n"
            "6. Disclaimer:\n"
            "Yeh general legal information hai, legal advice nahi."
        )

    else:
        return (
            "I'm not fully confident about this situation.\n\n"
            "1. Situation Understanding:\n"
            "It seems like you are facing a legal issue.\n\n"
            "2. Immediate Steps:\n"
            "- Stay calm and ensure your safety\n"
            "- Document everything\n\n"
            "3. Legal Awareness:\n"
            "- Laws vary by situation\n\n"
            "4. Caution:\n"
            "- Avoid acting without full understanding\n\n"
            "5. Suggestion:\n"
            "- Consult a qualified lawyer\n\n"
            "6. Disclaimer:\n"
            "This is general legal information, not legal advice."
        )