# Changes for Issue #22 — Chat authentication & session isolation

This file documents the fixes made to resolve Issue #22 (shared chat memory/state), how to test them locally, and suggested next steps for production hardening.

## Summary
- Removed the global in-memory `conversation_store` which caused cross-user/chat leaks.
- Persisted messages via the existing SQLite DB (`app/services/database.py`) and returned recent history from DB.
- Replaced the `DummyUser` stub with a header-based token extractor that raises 401 on missing/invalid Authorization headers. (This is a placeholder — integrate proper token validation with Supabase/JWT in production.)
- Updated frontend to send both the `Authorization: Bearer <token>` header and per-chat `sessionId` to the backend.

## Root Cause
- Server stored conversation state in a module-level `defaultdict` (`conversation_store`), shared across all requests in the process.
- `get_current_user()` returned the same `DummyUser` for every request, so sessions were prefixed identically.
- Frontend used a fixed `default-session` in its legacy API helper.

Combining these caused all users and chats to share the same backend memory.

## Files Modified
- `app/services/memory.py` — removed module-global store; `add_message` writes to DB; `get_history` reads recent messages.
- `app/utils/auth.py` — implemented header-based token extraction with HTTP 401 responses for missing/invalid headers.
- `frontend/src/services/api.js` — accepts `token` and `sessionId`, sets Authorization header, sends `session_id` in payload.
- `frontend/src/components/chat/ChatWindow.jsx` — passes `token` + resolved `sessionId` when calling the backend API.

## How it works now
- The backend chat endpoint composes a `full_session_id = f"{user_id}-{session_id}"` to key messages.
- `user_id` is derived from the validated token (currently token string placeholder). This ensures messages are stored and retrieved only for that user + chat.
- No module-level in-memory conversation list remains.

## Local test steps
1. Start the backend:

```bash
uvicorn app.main:app --reload
```

2. Start the frontend (from `/frontend`):

```bash
npm install
npm run dev
```

3. Simulate two users using curl or two browser sessions (use different token values):

```bash
# User A, chat 'alpha'
curl -X POST http://127.0.0.1:8000/chat \
  -H "Authorization: Bearer tokenA" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello from A","session_id":"session_alpha"}'

# User B, chat 'alpha'
curl -X POST http://127.0.0.1:8000/chat \
  -H "Authorization: Bearer tokenB" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello from B","session_id":"session_alpha"}'
```

4. Inspect `legal_ai.db` (messages table) and ensure session_id rows are stored as `tokenA-session_alpha` and `tokenB-session_alpha` respectively.

## Next steps / Recommendations
- Replace the placeholder token-as-user-id logic in `app/utils/auth.py` with proper validation against Supabase or a JWT verification middleware to extract stable user IDs.
- Add a `delete_messages(session_id)` DB helper to support chat deletion and implement `clear_history` to remove persisted messages when requested.
- Add automated tests (pytest) that POST multiple messages under different tokens and assert DB isolation.
- Consider using per-user vector indexes or namespace vectors by user_id if privacy requirements demand full separation of embeddings.

## Commit message (PR-ready)
Fix #22 — Isolate chat memory per user and session

- Remove global in-memory `conversation_store` and persist messages to SQLite.
- Extract `user_id` from Bearer token header and enforce 401 on missing/invalid auth.
- Frontend: send `Authorization` header and per-chat `sessionId` to backend.
- Ensure chat keys use `userId-sessionId` to prevent cross-user/session leaks.

-- End
