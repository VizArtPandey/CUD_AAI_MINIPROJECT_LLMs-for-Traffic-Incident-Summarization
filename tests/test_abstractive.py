from src.models.abstractive import build_generation_config

def test_generation_config_builds():
    hf_name, cfg = build_generation_config("flan_t5_small")
    assert "flan-t5" in hf_name
    assert cfg.max_input_tokens > 0
