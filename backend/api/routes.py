# backend/api/routes.py
from fastapi import APIRouter
from backend.api.chat import router as chat_router
# ADD: import products router
from backend.api.products import router as products_router

router = APIRouter()

# Register chat routes at /api/chat
router.include_router(chat_router, prefix="/chat", tags=["Chat"])
# Register products routes at /api/products
router.include_router(products_router, prefix="/products", tags=["Products"])
