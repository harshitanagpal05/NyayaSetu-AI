from fastapi import APIRouter, Request, Depends
from pydantic import BaseModel

from app.services.memory import add_message, get_history
from app.services.intent import detect_intent
from app.services.llm import query_groq_llm
from app.services.safety import validate_response
from app.services.legal_advisor import generate_legal_advice
from app.utils.auth import get_current_user

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: str = "default-session"


# ✅ STRONG LEGAL FILTER
def is_legal_query(query: str) -> bool:
    legal_keywords = [
        "law", "legal", "police", "arrest", "rights", "court",
        "ipc", "crime", "bail", "judge", "lawyer", "case",
        "fir", "complaint", "tenant", "landlord", "agreement",
        "contract", "divorce", "property", "salary", "harassment",
        "custody", "fraud", "cyber crime", "notice", "legal action",
        "advocate", "section", "act", "detain", "warrant"
    ]

    query_lower = query.lower()
    return any(keyword in query_lower for keyword in legal_keywords)


@router.post("/chat")
async def chat_endpoint(
    request: ChatRequest,
    req: Request,
    user=Depends(get_current_user)
):
    query = request.message.strip()
    session_id = request.session_id.strip()

    user_id = user.id
    print("REAL USER ID:", user_id)

    if not query:
        return {
            "answer": "Empty message",
            "confidence": 0,
            "sources": []
        }

    # 🚨 HARD FILTER (non-legal blocked)
    if not is_legal_query(query):
        return {
            "answer": "⚖️ I only answer legal questions. Please ask about law, rights, police, court, or legal issues.",
            "confidence": 0,
            "sources": []
        }

    try:
        vector_store = req.app.state.vector_store

        full_session_id = f"{user_id}-{session_id}"

        add_message(full_session_id, "user", query)
        history_text = get_history(full_session_id)

        intent = detect_intent(query, history_text)

        # ✅ DOCUMENT FLOW (RAG)
        if (
            intent == "document"
            and vector_store
            and hasattr(vector_store, "index")
            and vector_store.index
        ):
            results = vector_store.search(query)

            if results:
                chunks = [r.get("chunk", "") for r in results[:3]]
                sources = [r.get("source", "") for r in results[:3]]

                llm_response = query_groq_llm(
                    retrieved_chunks=chunks,
                    query=query,
                    history=history_text,
                    sources=sources
                )

                output = validate_response(
                    query,
                    chunks,
                    llm_response
                )

            else:
                # ⚠️ fallback if no documents found
                advice = generate_legal_advice(query, history_text)

                output = {
                    "answer": advice,
                    "confidence": 0.5,
                    "sources": []
                }

        # ✅ GENERAL LEGAL FLOW
        else:
            advice = generate_legal_advice(query, history_text)

            output = {
                "answer": advice,
                "confidence": 0.6,
                "sources": []
            }

        add_message(full_session_id, "assistant", output["answer"])

        return output

    except Exception as e:
        print("CHAT ERROR:", str(e))

        return {
            "answer": "Server error occurred while processing your request.",
            "confidence": 0,
            "sources": []
        }