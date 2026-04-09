import os
import logging
import requests
from typing import List, Optional
from app.services.citation_extractor import extract_legal_sections

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Optional tokenizer
try:
    import tiktoken
    enc = tiktoken.get_encoding("cl100k_base")
except Exception:
    enc = None


def _count_tokens(text: str) -> int:
    if enc:
        return len(enc.encode(text))
    return len(text) // 4


def query_groq_llm(
    retrieved_chunks: List[str],
    query: str,
    history: str = "",
    sources: Optional[List[str]] = None
) -> str:

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.error("Missing GROQ_API_KEY")
        return "I don't know"

    if not retrieved_chunks:
        logger.warning("No chunks passed to LLM")
        return "I don't know"

    model = "llama-3.3-70b-versatile"
    max_context_tokens = 3000

    # ─────────────────────────────
    # BUILD CONTEXT
    # ─────────────────────────────
    context_parts = []
    running_tokens = 0

    for i, chunk in enumerate(retrieved_chunks):
        if not chunk or not chunk.strip():
            continue

        chunk = chunk.strip()
        chunk_tokens = _count_tokens(chunk)

        if i == 0:
            context_parts.append(chunk)
            running_tokens += chunk_tokens
            continue

        if running_tokens + chunk_tokens < max_context_tokens:
            context_parts.append(chunk)
            running_tokens += chunk_tokens
        else:
            break

    context_text = "\n\n".join(context_parts)

    if not context_text:
        logger.error("Empty context")
        return "I don't know"

    logger.info(f"Context tokens ~ {running_tokens}")
    logger.info(f"Chunks used: {len(context_parts)}")

    # ─────────────────────────────
    # SOURCES
    # ─────────────────────────────
    source_text = ""
    if sources:
        unique_sources = list(set([s for s in sources if s]))
        if unique_sources:
            source_text = "\n\nSources:\n" + "\n".join(unique_sources)

    # ─────────────────────────────
    # PROMPT
    # ─────────────────────────────
    system_prompt = (
        "You are a precise legal AI assistant.\n"
        "Answer ONLY using the provided context.\n\n"
        "Rules:\n"
        "- If answer partially exists, use available context.\n"
        "- Do NOT hallucinate.\n"
        "- If unsure, say: Based on available context...\n"
        "- Mention legal source (IPC, Constitution) if present.\n"
        "- Keep answer concise.\n"
    )

    user_prompt = (
        f"Conversation History:\n{history}\n\n"
        f"Question:\n{query}\n\n"
        f"Context:\n{context_text}"
        f"{source_text}"
    )

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.1,
        "max_tokens": 500,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    # ─────────────────────────────
    # API CALL
    # ─────────────────────────────
    try:
        logger.info("Sending request to Groq API...")

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30,
        )

        if response.status_code != 200:
            logger.error(response.text)
            return "I don't know"

        data = response.json()

        if "choices" not in data or not data["choices"]:
            logger.error(f"Invalid response: {data}")
            return "I don't know"

        answer = data["choices"][0]["message"]["content"].strip()

        if not answer:
            return "I don't know"

        # ─────────────────────────────
        # 🔥 SECTION EXTRACTION (NEW)
        # ─────────────────────────────
        sections = extract_legal_sections(answer)

        if sections:
            section_text = "\n\nRelevant Legal Sections:\n" + "\n".join(sections)
            answer += section_text

        # fallback safety
        if "i don't know" in answer.lower() and len(context_text) > 100:
            return "Based on available context, more details are needed."

        logger.info(f"Answer preview: {answer[:120]}")

        return answer

    except requests.exceptions.Timeout:
        logger.error("Timeout")
        return "I don't know"

    except requests.exceptions.RequestException as e:
        logger.error(f"Request failed: {e}")
        return "I don't know"

    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return "I don't know"