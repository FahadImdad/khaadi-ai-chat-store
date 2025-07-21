import json
import uuid
from datetime import datetime
from backend.models.schemas import Order

ORDERS_FILE = "backend/data/orders.json"

def load_orders():
    with open(ORDERS_FILE, "r") as f:
        return json.load(f)

def save_orders(orders):
    with open(ORDERS_FILE, "w") as f:
        json.dump(orders, f, indent=2)

def create_order(user_id, items):
    orders = load_orders()
    order = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "items": items,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }
    orders.append(order)
    save_orders(orders)
    return order

def get_orders_by_user(user_id):
    orders = load_orders()
    return [o for o in orders if o["user_id"] == user_id] 