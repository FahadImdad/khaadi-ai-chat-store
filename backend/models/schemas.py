# backend/models/schemas.py
from pydantic import BaseModel
from typing import List
import os
import json

class Product(BaseModel):
    id: str
    name: str
    category: str
    price: int
    image: str
    tags: List[str]

def load_products():
    # Prefer products1.json if it exists, else fallback to products.json
    base_dir = os.path.dirname(__file__)
    p1 = os.path.join(base_dir, "..", "data", "products1.json")
    p0 = os.path.join(base_dir, "..", "data", "products.json")
    products = []
    if os.path.exists(p1):
        with open(p1, "r", encoding="utf-8") as f:
            products = json.load(f)
    elif os.path.exists(p0):
        with open(p0, "r", encoding="utf-8") as f:
            products = json.load(f)
    if not products:
        print("[ERROR] No products found in products1.json or products.json!")
    return products