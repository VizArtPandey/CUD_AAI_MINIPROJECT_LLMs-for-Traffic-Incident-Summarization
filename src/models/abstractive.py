from __future__ import annotations
from dataclasses import dataclass
from functools import lru_cache
from typing import Any, List
import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from src.data.utils import load_config

# ── Per-model instruction prefixes ────────────────────────────────────────────
# Changed prompting to be highly professional, requesting a "classy",
# high-impact executive tone suitable for official intelligence reports.
_MODEL_PROMPTS: dict[str, str] = {
    "bart_large_cnn": (
        "Re-write the following traffic event into a highly professional executive "
        "incident brief. Focus on creating an impactful, formal summary highlighting "
        "severity and operational disruption: "
    ),
    "flan_t5_small": (
        "Task: Create a professional, high-impact Executive Traffic Intelligence Brief "
        "from the following incident. Emphasize severity, exact location, and direct "
        "consequences in a formal tone. "
        "Incident details: "
    ),
    "pegasus_cnn": (
        "Generate a formal, impactful Traffic Intelligence Report summarizing the key "
        "operational facts from this incident: "
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
        length_penalty=1.0,  # Reverted length_penalty to 1.0 (defaults) for natural flow
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

    # Limit to max_tokens configured. The previous dynamic strict limit forced the models
    # to behave weirdly or copy, instead let the model use its own stopping logic.
    actual_max_tokens = max_new_tokens or gen.max_new_tokens

    with torch.inference_mode():
        output_ids = model.generate(
            **encoded,
            min_new_tokens=gen.min_new_tokens,
            max_new_tokens=actual_max_tokens,
            num_beams=gen.num_beams,
            length_penalty=gen.length_penalty,
            no_repeat_ngram_size=gen.no_repeat_ngram_size,
            early_stopping=True,
        )
    output_text = " ".join(tokenizer.decode(output_ids[0], skip_special_tokens=True).split())

    # Strip the instruction template echo
    for prefix in _MODEL_PROMPTS.values():
        if output_text.lower().startswith(prefix.replace("Task: ", "").lower().strip()[:20]):
            output_text = output_text[len(prefix):].strip()

    # Generic stripping of prefixes the models sometimes generate
    output_text = output_text.replace("Executive Incident Brief:", "")
    output_text = output_text.replace("Traffic Intelligence Report:", "")
    output_text = output_text.replace("Incident report:", "")

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
