"""Login and role-based access control."""
from fastapi import APIRouter, HTTPException
from passlib.hash import bcrypt
import jwt
import time
import database as db

router = APIRouter()
JWT_SECRET = "change-me-in-production"


@router.post("/login")
async def login(username: str, password: str):
    user = await db.get_user_by_username(username)
    if not user or not bcrypt.verify(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = jwt.encode(
        {"user_id": str(user["user_id"]), "role": user["role_name"], "exp": time.time() + 8 * 3600},
        JWT_SECRET,
        algorithm="HS256",
    )
    await db.update_last_login(user["user_id"])
    return {"access_token": token, "role": user["role_name"], "full_name": user["full_name"]}


@router.get("/me")
async def get_current_user(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return await db.get_user_by_id(payload["user_id"])
