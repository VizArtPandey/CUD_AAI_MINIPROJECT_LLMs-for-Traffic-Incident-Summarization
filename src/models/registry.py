from __future__ import annotations
from src.models.abstractive import available_abstractive_models, generate_summary
from src.models.baselines import run_baseline

BASELINE_MODELS = {"lead1", "textrank"}

def summarize_text(text: str, model_name: str, config_path: str = "config.yaml", max_new_tokens: int | None = None) -> str:
    if model_name in BASELINE_MODELS:
        return run_baseline(model_name, text)
    if model_name in available_abstractive_models(config_path) or model_name == "pegasus_cnn":
        return generate_summary(text, model_name, config_path=config_path, max_new_tokens=max_new_tokens)
    raise ValueError(f"Unsupported model name: {model_name}")
