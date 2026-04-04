import os
import logging
import requests

logger = logging.getLogger(__name__)

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_NAME = "llama-3.3-70b-versatile"

def generate_legal_advice(user_query: str, history: str = "") -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError(
            "GROQ_API_KEY environment variable is not set. Please configure it before running the application."
        )

    # ✅ FIXED: FORCE ENGLISH RESPONSE
    system_prompt = (
        "You are a conversational legal awareness assistant.\n"
        "ALWAYS respond in English.\n"
        "Use simple, clear, and professional language.\n"
        "You provide general legal guidance and first-aid support — NOT final legal advice.\n\n"
        "You MUST consider conversation history and continue context.\n"
        "If the query is a follow-up, build on the previous situation.\n\n"
        "Your response MUST follow this structure:\n"
        "1. Updated Situation Understanding\n"
        "2. Immediate Steps\n"
        "3. Legal Awareness\n"
        "4. Caution\n"
        "5. Suggestion to consult a lawyer\n"
        "6. Disclaimer (This is general legal information, not legal advice)\n\n"
        "Rules:\n"
        "- Do NOT give guarantees\n"
        "- Do NOT provide definitive legal advice\n"
        "- Be clear, structured, and calm\n"
    )

    user_prompt = (
        f"Conversation History:\n{history}\n\n"
        f"Current User Query:\n{user_query}"
    )

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
        logger.info("Calling Groq for legal advisory...")

        response = requests.post(
            GROQ_API_URL,
            headers=headers,
            json=payload,
            timeout=20,
        )

        if response.status_code != 200:
            logger.error(f"Groq error: {response.text}")
            return fallback_response()

        data = response.json()

        if "choices" not in data or not data["choices"]:
            return fallback_response()

        answer = data["choices"][0]["message"]["content"].strip()

        if not answer:
            return fallback_response()

        return answer

    except Exception as e:
        logger.error(f"Groq request failed: {e}")
        return fallback_response()

def fallback_response() -> str:
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
