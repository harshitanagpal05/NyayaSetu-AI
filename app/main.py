import os
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.vector_store import VectorStore
from app.services.llm import query_groq_llm
from app.services.safety import validate_response
from app.services.intent import detect_intent
from app.services.legal_advisor import generate_legal_advice
from app.services.memory import add_message, get_history
from app.services.database import init_db

from app.api.chat import router as chat_router

# ✅ Load env
load_dotenv()

# ✅ Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ✅ Vector store (single instance)
vector_store = VectorStore()


# ================================
# ✅ LIFESPAN (CLEAN + SAFE)
# ================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Startup: initializing system...")

    try:
        init_db()
    except Exception as e:
        logger.warning(f"DB init failed: {e}")

    try:
        vector_store.load_index()
        logger.info("✅ FAISS index loaded")
    except Exception as e:
        logger.warning(f"⚠️ Failed to load FAISS index: {e}")

    # Attach to app
    app.state.vector_store = vector_store

    yield

    logger.info("🛑 Shutdown complete")


# ================================
# ✅ APP INIT (ONLY ONCE)
# ================================
app = FastAPI(lifespan=lifespan)

# ================================
# ✅ CORS
# ================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# ✅ ROUTERS
# ================================
app.include_router(chat_router)


# ================================
# ✅ BASIC ROUTES
# ================================
@app.get("/")
async def root():
    return {"message": "Legal AI Running 🚀"}


@app.get("/health")
async def health():
    return {
        "status": "OK",
        "vectors": vector_store.index.ntotal if vector_store.index else 0
    }


# ================================
# ✅ OPTIONAL DIRECT ENDPOINT (/ask)
# ================================
class QueryRequest(BaseModel):
    query: str
    session_id: str


@app.post("/ask")
async def ask_question(request: QueryRequest):
    query = request.query.strip()
    session_id = request.session_id

    if not query:
        raise HTTPException(status_code=400, detail="Empty query")

    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(status_code=500, detail="Missing GROQ_API_KEY")

    try:
        add_message(session_id, "user", query)
        history_text = get_history(session_id)

        intent = detect_intent(query, history_text)
        logger.info(f"🧠 Intent: {intent}")

        # ======================
        # DOCUMENT FLOW
        # ======================
        if intent == "document":
            if not vector_store.index:
                return {
                    "answer": "Knowledge base not ready yet.",
                    "confidence": 0,
                    "safe": False
                }

            results = vector_store.search(query)

            if not results:
                return {
                    "answer": "I don't know",
                    "confidence": 0,
                    "safe": False
                }

            chunks = [r["chunk"] for r in results[:3]]
            sources = [r.get("source", "") for r in results[:3]]

            llm_response = query_groq_llm(
                user_query=query,              # ✅ FIXED
                retrieved_chunks=chunks,
                history=history_text,
                sources=sources
            )

            output = validate_response(query, chunks, llm_response)

            # ✅ Confidence from FAISS
            avg_score = sum(r["score"] for r in results[:3]) / len(results[:3])
            confidence = 50 + (avg_score * 100)
            output["confidence"] = max(40, min(95, int(confidence)))

        # ======================
        # GENERAL FLOW
        # ======================
        else:
            advice = generate_legal_advice(query, history_text)

            output = {
                "answer": advice or "I don't know",
                "confidence": 60,
                "safe": True
            }

        add_message(session_id, "assistant", output["answer"])
        return output

    except Exception as e:
        logger.error(f"❌ Error: {e}", exc_info=True)

        return {
            "answer": f"Server error: {str(e)}",
            "confidence": 0,
            "safe": False
        }