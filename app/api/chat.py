from fastapi import APIRouter, Request, Header, HTTPException, Depends
from pydantic import BaseModel
from app.services.memory import add_message, get_history
from app.services.intent import detect_intent
from app.services.llm import query_groq_llm
from app.services.safety import validate_response
from app.services.legal_advisor import generate_legal_advice

router = APIRouter()

# 🔐 AUTH FUNCTION (UPDATED)
class AuthUser:
    def __init__(self, token: str):
        self.token = token
        # ⚠️ TEMP: mock user object (replace with real JWT decode later)
        self.user = {
            "id": "demo_user_id"  # replace later with real user id
        }

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="No token provided")

    try:
        token = authorization.split(" ")[1]
        return AuthUser(token)
    except:
        raise HTTPException(status_code=401, detail="Invalid token format")


class ChatRequest(BaseModel):
    message: str
    session_id: str = "default-session"


@router.post("/chat")
async def chat_endpoint(
    request: ChatRequest,
    req: Request,
    user: AuthUser = Depends(get_current_user)  # 🔐 now returns user object
):
    query = request.message.strip()
    session_id = request.session_id

    # 🔥 IMPORTANT LINE (now works)
    user_id = user.user["id"]
    print("USER ID:", user_id)

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