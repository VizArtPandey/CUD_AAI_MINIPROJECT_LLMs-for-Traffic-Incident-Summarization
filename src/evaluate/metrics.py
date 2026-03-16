from __future__ import annotations
from rouge_score import rouge_scorer

def compute_rouge_single(reference: str, prediction: str) -> dict[str, float]:
    scorer = rouge_scorer.RougeScorer(["rouge1", "rouge2", "rougeL"], use_stemmer=True)
    scores = scorer.score(reference, prediction)
    return {"rouge1_f1": scores["rouge1"].fmeasure, "rouge2_f1": scores["rouge2"].fmeasure, "rougeL_f1": scores["rougeL"].fmeasure}

def compression_ratio(source: str, summary: str) -> float:
    source_len = max(len(str(source).split()), 1)
    summary_len = len(str(summary).split())
    return summary_len / source_len
