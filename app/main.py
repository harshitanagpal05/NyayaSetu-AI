import os
import uvicorn
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.services.parser import parse_all_pdfs
from app.services.cleaner import clean_and_chunk_documents
from app.services.vector_store import VectorStore
from app.services.llm import query_groq_llm
from app.services.safety import validate_response
from app.services.intent import detect_intent
from app.services.legal_advisor import generate_legal_advice
from app.services.memory import add_message, get_history
from app.services.database import init_db
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class QueryRequest(BaseModel):
    query: str
    session_id: str


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEGAL_FOLDER = os.path.join(BASE_DIR, "data", "raw", "Legal")
vector_store = VectorStore()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Startup: initializing system...")
    init_db()
    try:
        loaded = vector_store.load_index()
    except Exception as e:
        logger.warning(f"⚠️ Failed to load index: {e}")
        loaded = False

    if not loaded:
      logger.warning("⚠️ Skipping vector DB build on Render (temporary fix)")

    yield

    logger.info("🛑 Shutdown complete")


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)


@app.get("/")
async def root():
    return {"message": "Legal AI Running 🚀"}


@app.get("/health")
async def health():
    return {
        "status": "OK",
        "vectors": vector_store.index.ntotal if vector_store.index else 0
    }


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

        if intent == "document":
            if not vector_store.index:
                return {
                    "answer": "Knowledge base not ready yet. Please try again later.",
                    "confidence": 0.0,
                    "safe": False
                }

            results = vector_store.search(query)
            if not results:
                return {
                    "answer": "I don't know",
                    "confidence": 0.0,
                    "safe": False
                }

            chunks = [r["chunk"] for r in results]
            sources = [r.get("source", "") for r in results]

            llm_response = query_groq_llm(
                retrieved_chunks=chunks,
                query=query,
                history=history_text,
                sources=sources
            )

            if not llm_response:
                llm_response = "I don't know"

            output = validate_response(query, chunks, llm_response)

        else:
            logger.info("⚖️ Routing to legal advisor")

            advice = generate_legal_advice(query, history_text)

            if not advice:
                advice = "I don't know"

            output = {
                "answer": advice,
                "confidence": 0.6,
                "safe": True
            }

        add_message(session_id, "assistant", output["answer"])

        return output

    except Exception as e:
        logger.error(f"❌ Error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
