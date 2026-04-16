from fastapi import Header, HTTPException
from app.services.supabase_client import supabase


def get_current_user(authorization: str = Header(default=None)):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="No token provided"
        )

    try:
        # Expected format: Bearer <token>
        parts = authorization.strip().split(" ")

        if len(parts) != 2:
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization format"
            )

        scheme = parts[0]
        token = parts[1]

        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization scheme"
            )

        if not token or token == "undefined" or token == "null":
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        # Verify token with Supabase
        response = supabase.auth.get_user(token)

        if not response or not response.user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return response.user

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Auth failed: {str(e)}"
        )