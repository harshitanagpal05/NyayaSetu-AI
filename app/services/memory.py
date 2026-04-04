from collections import defaultdict
from app.services.database import save_message, get_messages

# In-memory session storage (simple version)
conversation_store = defaultdict(list)

MAX_HISTORY = 5  # last 5 messages


def add_message(session_id: str, role: str, content: str):
    conversation_store[session_id].append({
        "role": role,
        "content": content
    })

    # keep only last N messages
    if len(conversation_store[session_id]) > MAX_HISTORY:
        conversation_store[session_id] = conversation_store[session_id][-MAX_HISTORY:]


def get_history(session_id: str):
    return conversation_store[session_id]


def clear_history(session_id: str):
    conversation_store[session_id] = []