# backend/agents.py
import os
from dotenv import load_dotenv
from openai import AzureOpenAI  # ✅ correct for SDK ≥1.0
import requests
from openai.types.chat import ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam, ChatCompletionAssistantMessageParam
from typing import Optional, List, Dict
from backend.utils.product_utils import load_products, format_products_for_prompt, get_all_categories, extract_price_filter, get_all_subcategories
from backend.utils.guardrails import contains_forbidden_content

load_dotenv()

# Ensure all required env vars are present BEFORE client initialization
azure_api_key = os.getenv("AZURE_OPENAI_KEY")
azure_api_version = os.getenv("AZURE_OPENAI_API_VERSION")
azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
if not azure_api_key or not azure_api_version or not azure_endpoint:
    raise RuntimeError("Missing Azure OpenAI environment variables.")

# ✅ initialize Azure client
client = AzureOpenAI(
    api_key=azure_api_key,
    api_version=azure_api_version,
    azure_endpoint=azure_endpoint
)

AGENTS = {
    "product_expert": {
        "name": "Product Expert",
        "prompt": "You are a helpful product expert for Khaadi. Specialize in fabrics, sizing, and product details. Use 'ready to wear' instead of 'pret'.",
        "deployment": os.getenv("AZURE_OPENAI_DEPLOYMENT")
    },
    "fashion_stylist": {
        "name": "Fashion Stylist",
        "prompt": "You are a creative fashion stylist for Khaadi. Suggest outfit combinations, styling tips, and seasonal trends.",
        "deployment": os.getenv("AZURE_OPENAI_DEPLOYMENT")
    },
    "support_agent": {
        "name": "Support Agent",
        "prompt": "You are a customer support agent for Khaadi. Help with orders, returns, and store policies.",
        "deployment": os.getenv("AZURE_OPENAI_DEPLOYMENT")
    }
}

def get_weather(latitude, longitude):
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={latitude}&longitude={longitude}"
        f"&current=temperature_2m,wind_speed_10m"
        f"&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m"
    )
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        temp = data.get('current', {}).get('temperature_2m')
        if temp is not None:
            return f"Current temperature: {temp}°C"
        else:
            return "Weather data unavailable for these coordinates."
    except Exception as e:
        return f"Weather data unavailable ({str(e)})"

weather_tool_schema = {
    "name": "get_weather_by_coords",
    "description": "Get the current weather for a given latitude and longitude.",
    "parameters": {
        "type": "object",
        "properties": {
            "lat": {"type": "number", "description": "Latitude"},
            "lon": {"type": "number", "description": "Longitude"}
        },
        "required": ["lat", "lon"]
    }
}

# Fix default agent_key to 'product_expert'
def ask_agent(
    user_message: str,
    agent_key: str = "product_expert",
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    chat_history: Optional[List[Dict[str, str]]] = None
) -> str:
    agent = AGENTS.get(agent_key, AGENTS["product_expert"])
    # Guardrails: Only for product_expert
    if agent_key == "product_expert":
        if contains_forbidden_content(user_message):
            return "🚫 I'm sorry, but I can't respond to that request."
        products = load_products()
        if not products:
            return "⚠️ Sorry, no products are available at the moment. Please try again later."
        products_text = format_products_for_prompt(products)
        system_prompt = (
            "You are a helpful product expert for Khaadi. Specialize in fabrics, sizing, and product details. Use 'ready to wear' instead of 'pret'.\n"
            "You have access to the following list of Khaadi products. Only answer based on this list.\n"
            f"Here is the list of all available Khaadi products:\n\n{products_text}\n\n"
            "If the user asks about anything not related to these products, reply: 'Sorry, I can only help with the available Khaadi products.'\n"
            "If the user asks for a product or filter (e.g., under a price, by type, etc.) and there is no match, say: 'Sorry, no products match your request.'\n"
            "Always use the chat history to understand the user's intent and context."
        )
        print(f"[DEBUG] Number of products: {len(products)}")
        print(f"[DEBUG] System prompt length: {len(system_prompt)}")
        messages = [
            ChatCompletionSystemMessageParam(role="system", content=system_prompt)
        ]
        if chat_history:
            for msg in chat_history:
                if msg.get("role") == "user":
                    messages.append(ChatCompletionUserMessageParam(role="user", content=msg.get("content", "")))
                elif msg.get("role") == "assistant":
                    messages.append(ChatCompletionAssistantMessageParam(role="assistant", content=msg.get("content", "")))
        messages.append(ChatCompletionUserMessageParam(role="user", content=user_message))
    else:
        # Other agents: keep existing logic
        weather_info = ""
        if "weather" in user_message.lower() and latitude is not None and longitude is not None:
            weather_info = get_weather(latitude, longitude)
        messages: list = [
            ChatCompletionSystemMessageParam(role="system", content=agent["prompt"]),
        ]
        if weather_info:
            messages.append(ChatCompletionUserMessageParam(role="user", content=f"Current weather: {weather_info}"))
        if chat_history:
            for msg in chat_history:
                if msg.get("role") == "user":
                    messages.append(ChatCompletionUserMessageParam(role="user", content=msg.get("content", "")))
                elif msg.get("role") == "assistant":
                    messages.append(ChatCompletionAssistantMessageParam(role="assistant", content=msg.get("content", "")))
        messages.append(ChatCompletionUserMessageParam(role="user", content=user_message))
    try:
        print(f"[DEBUG] Sending messages to OpenAI: {messages}")
        response = client.chat.completions.create(
            model=agent["deployment"],
            messages=messages
        )
        content = response.choices[0].message.content
        return content if content is not None else "⚠️ Sorry, I couldn't generate a response."
    except Exception as e:
        print("[ERROR] OpenAI error:", e)
        return f"⚠️ Sorry, I'm currently unable to process that. Please try again later."


print("✅ agents.py loaded from:", __file__)
