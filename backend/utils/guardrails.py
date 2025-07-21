import re

FORBIDDEN_KEYWORDS = [
    "zara", "gucci", "nike", "adidas", "h&m", "louis vuitton", "prada", "versace", "hermes", "chanel", "balenciaga", "bomb", "hack", "exploit", "<script>", "</script>", "malware", "attack", "phish", "steal", "inject", "prompt injection", "jailbreak", "bypass", "rootkit", "sql", "drop table", "delete from", "update ", "insert into", "shutdown", "crash", "ddos", "ransomware",
    # Add extra prompt injection/LLM manipulation keywords
    "prompt", "system instructions", "act like", "ignore previous"
]

FORBIDDEN_PATTERN = re.compile(r"(" + r"|".join(re.escape(word) for word in FORBIDDEN_KEYWORDS) + r")", re.IGNORECASE)

def contains_forbidden_content(text: str) -> bool:
    return bool(FORBIDDEN_PATTERN.search(text)) 