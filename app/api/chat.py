from fastapi import APIRouter
from pydantic import BaseModel
from app.services.memory import add_message, get_history
from app.services.intent import detect_intent
from app.services.vector_store import VectorStore
from app.services.llm import query_groq_llm
from app.services.safety import validate_response
from app.services.legal_advisor import generate_legal_advice

router = APIRouter()
vector_store = VectorStore()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    query = request.message.strip()
    session_id = "default-session"
    if not query:
        return {
            "answer": "Empty message",
            "confidence": 0,
            "sources": []
        }

    try:
        add_message(session_id, "user", query)
        history_text = get_history(session_id)

        intent = detect_intent(query, history_text)

        if intent == "document":
            results = vector_store.search(query)

            if not results:
                return {
                    "answer": "I don't know",
                    "confidence": 0.0,
                    "sources": []
                }

            chunks = [r["chunk"] for r in results]
            sources = [r.get("source", "") for r in results]

            llm_response = query_groq_llm(
                retrieved_chunks=chunks,
                query=query,
                history=history_text,
                sources=sources
            )

            output = validate_response(query, chunks, llm_response)

        else:
            advice = generate_legal_advice(query, history_text)

            output = {
                "answer": advice,
                "confidence": 0.6,
                "sources": []
            }

        add_message(session_id, "assistant", output["answer"])

        return output

    except Exception:
        return {
            "answer": "Server error",
            "confidence": 0,
            "sources": []
        }