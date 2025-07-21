# backend/utils/product_utils.py
import json
import os
import re

PRODUCTS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "products.json")

def load_products():
    # Prefer products1.json if it exists and is non-empty, else fallback to products.json
    base_dir = os.path.dirname(__file__)
    p1 = os.path.join(base_dir, "..", "data", "products1.json")
    p0 = os.path.join(base_dir, "..", "data", "products.json")
    products = []
    if os.path.exists(p1):
        with open(p1, "r", encoding="utf-8") as f:
            products = json.load(f)
    if not products and os.path.exists(p0):
        with open(p0, "r", encoding="utf-8") as f:
            products = json.load(f)
    if not products:
        print("[ERROR] No products found in products1.json or products.json!")
    return products

FALLBACK_IMAGE = "https://pk.khaadi.com/dw/image/v2/BJTG_PRD/on/demandware.static/-/Sites-khaadi-master-catalog/default/dw721dfc09/images/hi-res/25-05e62-01tb_multi_1.jpg?sw=800&sh=1200"

def filter_products_by_query(query: str):
    products = load_products()
    query = query.lower()
    return [p for p in products if query in p['name'].lower() or any(query in t for t in p.get('tags', []))]

def format_products_for_prompt(products):
    lines = []
    for p in products:
        name = p.get("name") or p.get("title") or "(No Name)"
        img = p.get("picUrl") or p.get("image") or FALLBACK_IMAGE
        price = p.get("price", "")
        currency = p.get("currency", "")
        desc = p.get("description", "")
        colors = p.get("colors", [])
        sizes = p.get("sizes", [])
        # Markdown image first, then details (no product link)
        img_md = f"![{name}]({img})" if img else ""
        line = f"{img_md}\n**{name}** ({price} {currency})\n{desc}\nColors: {', '.join(colors)}\nSizes: {', '.join(sizes)}\n"
        lines.append(line)
    return "\n".join(lines)

def get_all_categories():
    products = load_products()
    return list(set(p['category'].lower() for p in products if 'category' in p))

def get_all_subcategories():
    products = load_products()
    return list(set(p['subcategory'].lower() for p in products if 'subcategory' in p))

def extract_price_filter(query: str):
    # Returns (max_price: int) if found, else None
    match = re.search(r'(?:under|below|less than|<)\s*([\d,]+)\s*(k|thousand)?', query.lower())
    if match:
        price = match.group(1).replace(',', '')
        if match.group(2):
            price = int(price) * 1000
        else:
            price = int(price)
        return price
    return None
