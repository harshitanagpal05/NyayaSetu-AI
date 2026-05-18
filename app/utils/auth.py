from fastapi import Request, HTTPException


class User:
    def __init__(self, user_id: str):
        self.id = user_id


def get_current_user(request: Request):
    """Simple auth dependency that extracts a Bearer token from
    the `Authorization` header and returns a lightweight `User` object.

    In production this should validate the token against your identity
    provider (e.g. Supabase) and return the real user id. For now we use the
    token value as a stable identifier to ensure session isolation per user.
    """
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    token = parts[1]
    if not token:
        raise HTTPException(status_code=401, detail="Empty token")

    # NOTE: token is used as the user id here for uniqueness/isolation. Replace
    # with validated user id retrieval when integrating a real auth provider.
    return User(user_id=token)