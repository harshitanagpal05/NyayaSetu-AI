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


# ✅ Legal filter (fixed)
def is_legal_query(query: str) -> bool:
    query = query.lower()

    keywords = [
        "law", "legal", "police", "arrest", "court", "fir",
        "ipc", "crpc", "section", "crime", "bail", "judge",
        "lawyer", "case", "tenant", "landlord", "rent",
        "agreement", "contract", "divorce", "property",
        "salary", "harassment", "warrant", "evict", "notice"
    ]

    return any(k in query for k in keywords)


@router.post("/chat")
async def chat_endpoint(
    request: ChatRequest,
    req: Request,
    user=Depends(get_current_user)
):
    query = request.message.strip()
    session_id = request.session_id.strip()
    user_id = user.id

    if not query:
        return {"answer": "Empty message", "confidence": 0, "sources": []}

    # 🚫 Non-legal filter
    if not is_legal_query(query):
        return {
            "answer": "⚖️ I only answer legal questions.",
            "confidence": 0,
            "sources": []
        }

    try:
        vector_store = req.app.state.vector_store
        full_session_id = f"{user_id}-{session_id}"

        add_message(full_session_id, "user", query)
        history_text = get_history(full_session_id)

        intent = detect_intent(query, history_text)
        print("INTENT:", intent)

        # =========================
        # ✅ DOCUMENT FLOW (RAG)
        # =========================
        if intent == "document":
            results = vector_store.search(query)
            print("RESULTS COUNT:", len(results))

            if results:
                top_results = results[:3]

                chunks = [r["chunk"] for r in top_results]
                sources = [r["source"] for r in top_results]

                llm_response = query_groq_llm(
                    user_query=query,
                    retrieved_chunks=chunks,
                    history=history_text,
                    sources=sources
                )

                output = validate_response(query, chunks, llm_response)

                # ✅ FIXED CONFIDENCE LOGIC
                avg_score = sum(r["score"] for r in top_results) / len(top_results)

                normalized_score = min(1.0, avg_score * 3)

                confidence = (
                    normalized_score * 100 * 0.4 +
                    output["confidence"] * 0.6
                )
                if avg_score < 0.18:
                    confidence += 5

                output["confidence"] = int(max(55, min(92, confidence)))
                output["sources"] = sources

            else:
                output = {
                    "answer": "I don't know",
                    "confidence": 40,
                    "sources": []
                }

        # =========================
        # ✅ GENERAL LEGAL FLOW
        # =========================
        else:
            advice = generate_legal_advice(query, history_text)

            output = {
                "answer": advice,
                "confidence": 60,
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