from __future__ import annotations
from dataclasses import dataclass
from functools import lru_cache
from typing import Any, List
import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from src.data.utils import load_config

# ── Per-model instruction prefixes ────────────────────────────────────────────
# Prepended to raw incident text so models rewrite instead of echo.
_MODEL_PROMPTS: dict[str, str] = {
    "bart_large_cnn": (
        "Generate a concise traffic incident summary. "
        "Report only: location, incident type, severity, and road impact. "
        "Be brief. Incident report: "
    ),
    "flan_t5_small": (
        "Write a one-sentence traffic incident summary covering location, "
        "incident type, severity level, and road impact in under 35 words. "
        "Traffic report: "
    ),
    "pegasus_cnn": (
        "Summarize the key facts from this traffic incident in one compact sentence: "
    ),
}

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

    # Use model-specific rewriting instruction if available, else fall back to config prefix.
    instruction = _MODEL_PROMPTS.get(model_name, gen.prompt_prefix)
    clean_text = " ".join(str(text).split())
    source_text = f"{instruction}{clean_text}"

    encoded = tokenizer(source_text, truncation=True, max_length=gen.max_input_tokens, return_tensors="pt")
    encoded = {k: v.to(get_device()) for k, v in encoded.items()}

    # Dynamic cap: limit output to 50 % of raw input token count to force compression.
    raw_len = tokenizer(clean_text, return_tensors="pt")["input_ids"].shape[-1]
    dynamic_max = max(gen.min_new_tokens, min(int(raw_len * 0.50), gen.max_new_tokens))
    actual_max_tokens = max_new_tokens or dynamic_max

    with torch.inference_mode():
        output_ids = model.generate(
            **encoded,
            min_new_tokens=gen.min_new_tokens,
            max_new_tokens=actual_max_tokens,
            num_beams=gen.num_beams,
            length_penalty=3.0,     # strongly prefers concise outputs
            no_repeat_ngram_size=4, # blocks 4-gram copying from input
            early_stopping=True,
        )
    output_text = " ".join(tokenizer.decode(output_ids[0], skip_special_tokens=True).split())

    # Strip known hallucinations
    hallucinations = [
        "For confidential support call the Samaritans in the UK on 08457 90 90 90, visit a local Samaritans branch or click here for details.",
        "For confidential support call the Samaritans",
        "The cause of the collision has not been determined",
        "The incident is under investigation by Dubai Police.",
        "The incident is currently under investigation and no further details have been released.",
    ]
    for h in hallucinations:
        output_text = output_text.replace(h, "").strip()

    return " ".join(output_text.split())


def available_abstractive_models(config_path: str = "config.yaml") -> List[str]:
    cfg = load_config(config_path)
    return [name for name, meta in cfg["models"].items() if meta.get("enabled", False)]
