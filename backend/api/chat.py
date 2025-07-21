from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.agents import ask_agent
from typing import List, Dict, Optional

class ChatRequest(BaseModel):
    message: str
    agent: str = "product_expert"  # Optional, default to product_expert
    latitude: float | None = None
    longitude: float | None = None
    chat_history: Optional[List[Dict[str, str]]] = None

class ChatResponse(BaseModel):
    reply: str

router = APIRouter()

@router.post("/", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    try:
        reply = ask_agent(
            request.message,
            agent_key=request.agent,
            latitude=request.latitude,
            longitude=request.longitude,
            chat_history=request.chat_history
        )
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
