from fastapi import APIRouter, HTTPException
import os
import json

router = APIRouter()

@router.get("/", response_model=list)
def get_products():
    base_dir = os.path.dirname(__file__)
    products_path = os.path.join(base_dir, "..", "data", "products1.json")
    try:
        with open(products_path, "r", encoding="utf-8") as f:
            products = json.load(f)
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load products: {e}") 