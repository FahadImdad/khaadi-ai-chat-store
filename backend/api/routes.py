# backend/api/routes.py
from fastapi import APIRouter
from backend.api.chat import router as chat_router

router = APIRouter()

# Register chat routes at /api/chat
router.include_router(chat_router, prefix="/chat", tags=["Chat"])
