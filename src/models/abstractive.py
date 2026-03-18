from __future__ import annotations
from dataclasses import dataclass
from functools import lru_cache
from typing import Any, List
import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from src.data.utils import load_config

@dataclass
class GenerationConfig:
    max_input_tokens: int
    min_new_tokens: int
    max_new_tokens: int
    num_beams: int
    length_penalty: float
    no_repeat_ngram_size: int
    early_stopping: bool
    prompt_prefix: str = ""

def get_device() -> str:
    return "cuda" if torch.cuda.is_available() else "cpu"

@lru_cache(maxsize=8)
def load_tokenizer_and_model(hf_name: str) -> tuple[Any, Any]:
    tokenizer = AutoTokenizer.from_pretrained(hf_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(hf_name)
    model.to(get_device())
    model.eval()
    return tokenizer, model

def build_generation_config(model_name: str, config_path: str = "config.yaml"):
    cfg = load_config(config_path)
    model_cfg = cfg["models"][model_name]
    gen_cfg = cfg["generation"]
    return model_cfg["hf_name"], GenerationConfig(
        max_input_tokens=model_cfg.get("max_input_tokens", gen_cfg["default_max_input_tokens"]),
        min_new_tokens=gen_cfg["default_min_new_tokens"],
        max_new_tokens=gen_cfg["default_max_new_tokens"],
        num_beams=gen_cfg["num_beams"],
        length_penalty=gen_cfg["length_penalty"],
        no_repeat_ngram_size=gen_cfg["no_repeat_ngram_size"],
        early_stopping=gen_cfg["early_stopping"],
        prompt_prefix=model_cfg.get("prompt_prefix", ""),
    )

def generate_summary(text: str, model_name: str, config_path: str = "config.yaml", max_new_tokens: int | None = None) -> str:
    hf_name, gen = build_generation_config(model_name, config_path)
    tokenizer, model = load_tokenizer_and_model(hf_name)
    source_text = f"{gen.prompt_prefix}{' '.join(str(text).split())}"
    encoded = tokenizer(source_text, truncation=True, max_length=gen.max_input_tokens, return_tensors="pt")
    encoded = {k: v.to(get_device()) for k, v in encoded.items()}
    actual_max_tokens = max_new_tokens or gen.max_new_tokens
    actual_min_tokens = gen.min_new_tokens
    
    with torch.inference_mode():
        output_ids = model.generate(
            **encoded,
            min_new_tokens=actual_min_tokens,
            max_new_tokens=actual_max_tokens,
            num_beams=gen.num_beams,
            length_penalty=gen.length_penalty,
            no_repeat_ngram_size=gen.no_repeat_ngram_size,
            early_stopping=bool(gen.early_stopping),
        )
    output_text = " ".join(tokenizer.decode(output_ids[0], skip_special_tokens=True).split())
    # Post-processing filters for common model hallucinations
    hallucinations = [
        "For confidential support call the Samaritans in the UK on 08457 90 90 90, visit a local Samaritans branch or click here for details.",
        "For confidential support call the Samaritans",
        "The cause of the collision has not been determined",
        "The incident is under investigation by Dubai Police.",
        "The incident is currently under investigation and no further details have been released."
    ]
    for h in hallucinations:
        output_text = output_text.replace(h, "").strip()
    return " ".join(output_text.split())

def available_abstractive_models(config_path: str = "config.yaml") -> List[str]:
    cfg = load_config(config_path)
    return [name for name, meta in cfg["models"].items() if meta.get("enabled", False)]
