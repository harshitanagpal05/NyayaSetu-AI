from fastapi import APIRouter, Request
from app.services.intent import detect_intent, is_legal_query
from app.services.llm import query_groq_llm
from app.services.ai_classifier import classify_legal_ai

router = APIRouter()


@router.post("/chat")
async def chat_endpoint(request: Request):
    data = await request.json()

    query = data.get("query") or data.get("message")
    history = data.get("history", [])

    if not query:
        return {
            "answer": "Invalid request",
            "confidence": 0.0,
            "sources": []
        }

    # 🔥 HYBRID LOGIC
    is_legal, confidence = is_legal_query(query, history)

    if is_legal is None:
        ai_result = classify_legal_ai(query)

        if ai_result:
            is_legal = True
            confidence = 0.85
        else:
            is_legal = False
            confidence = 0.2

    if not is_legal:
        return {
            "answer": "I can only assist with legal-related questions.",
            "confidence": confidence,
            "sources": []
        }

    intent = detect_intent(query, history)

    try:
        response_text = query_groq_llm(query)

        return {
            "answer": response_text,
            "confidence": confidence,
            "sources": [],
            "intent": intent
        }

    except Exception as e:
        print("ERROR:", e)

        return {
            "answer": "Something went wrong",
            "confidence": 0.0,
            "sources": []
        }