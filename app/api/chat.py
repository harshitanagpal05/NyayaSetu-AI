from fastapi import APIRouter, Request
from pydantic import BaseModel
from app.services.memory import add_message, get_history
from app.services.intent import detect_intent
from app.services.llm import query_groq_llm
from app.services.safety import validate_response
from app.services.legal_advisor import generate_legal_advice

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default-session"

@router.post("/chat")
async def chat_endpoint(request: ChatRequest, req: Request):
    query = request.message.strip()
    session_id = request.session_id

    if not query:
        return {"answer": "Empty message", "confidence": 0, "sources": []}

    try:
        vector_store = req.app.state.vector_store

        add_message(session_id, "user", query)
        history_text = get_history(session_id)
        intent = detect_intent(query, history_text)

        if intent == "document" and vector_store and vector_store.index:
            results = vector_store.search(query)

            if not results:
                return {"answer": "I don't know", "confidence": 0.0, "sources": []}

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
            output = {"answer": advice, "confidence": 0.6, "sources": []}

        add_message(session_id, "assistant", output["answer"])
        return output

    except Exception as e:
        return {"answer": f"Server error: {str(e)}", "confidence": 0, "sources": []}