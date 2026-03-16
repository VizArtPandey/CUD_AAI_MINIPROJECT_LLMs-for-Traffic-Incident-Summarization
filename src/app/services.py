from __future__ import annotations
from src.models.registry import summarize_text

def summarize_with_model(text: str, model_name: str, max_length: int = 96) -> str:
    return summarize_text(text=text, model_name=model_name, max_new_tokens=max_length)
