from fastapi import APIRouter, Request
from app.services.intent import detect_intent, is_legal_query
from app.services.llm import query_groq_llm

router = APIRouter()


@router.post("/chat")
async def chat_endpoint(request: Request):
    data = await request.json()

    query = data.get("query") or data.get("message")
    history = data.get("history", [])

    if not query:
        return {
            "answer": "Invalid request. Please provide a query.",
            "confidence": 0.0,
            "sources": [],
        }

    # 🔥 FIX 1 + 2: LEGAL FILTER WITH CONFIDENCE
    is_legal, confidence = is_legal_query(query, history)

    if not is_legal:
        return {
            "answer": "I can only assist with legal-related questions. Please ask about laws, rights, FIRs, or legal issues.",
            "confidence": confidence,  # dynamic (low)
            "sources": [],
            "type": "non_legal"
        }

    # 🔥 FIX 3: INTENT + SMART CONFIDENCE USAGE
    intent = detect_intent(query, history)

    try:
        # 🔥 CALL LLM
        response_text = query_groq_llm(query)

        return {
            "answer": response_text,
            "confidence": confidence,  # dynamic (based on query strength)
            "sources": [],
            "intent": intent
        }

    except Exception as e:
        print("ERROR:", str(e))

        return {
            "answer": "Something went wrong. Please try again.",
            "confidence": 0.0,
            "sources": [],
        }