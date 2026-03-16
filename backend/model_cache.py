from src.models.abstractive import available_abstractive_models, build_generation_config, load_tokenizer_and_model
from functools import lru_cache
@lru_cache(maxsize=8)
def warm_model(model_name: str):
    if model_name in available_abstractive_models() or model_name == "pegasus_cnn":
        hf_name, _ = build_generation_config(model_name)
        load_tokenizer_and_model(hf_name)
        return hf_name
    return model_name
