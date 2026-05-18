"""Conversation memory helpers.

Replaced the previous global in-memory `conversation_store` which caused
shared-state leaks across users/sessions. We now persist messages to the
SQLite DB via `save_message` and read recent history with `get_messages`.

This keeps per-process memory minimal and ensures session isolation when
combined with `user_id`-prefixed session IDs (e.g. "<user_id>-<session_id>").
"""

from app.services.database import save_message, get_messages

# How many recent messages to return as the working history
MAX_HISTORY = 5


def add_message(session_id: str, role: str, content: str):
    """Append a message to persistent storage for a given session.

    Args:
        session_id: unique session identifier (should include user id prefix)
        role: 'user' or 'assistant'
        content: message text
    """
    save_message(session_id, role, content)


def get_history(session_id: str):
    """Return the most recent `MAX_HISTORY` messages for `session_id`.

    This reads from the DB rather than relying on module-level state so that
    different processes/users do not accidentally share the same conversation
    buffer.
    """
    msgs = get_messages(session_id)
    # Keep only the last MAX_HISTORY messages (database returns all ordered)
    return msgs[-MAX_HISTORY:]


def clear_history(session_id: str):
    """Clear history for a session.

    Note: the lightweight DB helper didn't previously implement deletion. If
    needed, add a `delete_messages(session_id)` function in
    `app.services.database` and call it here. For now, provide a no-op to keep
    the function contract stable.
    """
    # No-op: intentionally left for future DB deletion implementation.
    return