import pandas as pd
from src.evaluate.eval import evaluate_outputs

def test_evaluate_outputs_adds_metrics():
    df = pd.DataFrame([{
        "Description": "Crash blocked one lane on I-95 northbound.",
        "reference_summary": "One lane was blocked after a crash on I-95 northbound.",
        "generated_summary": "A crash blocked one lane on I-95 northbound.",
        "model_name": "lead1",
    }])
    out = evaluate_outputs(df)
    assert "compression_ratio" in out.columns
    assert "rouge1_f1" in out.columns
