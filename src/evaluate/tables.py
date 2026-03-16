from __future__ import annotations
import pandas as pd

def aggregate_metrics_table(df: pd.DataFrame) -> pd.DataFrame:
    metric_cols = [c for c in ["rouge1_f1", "rouge2_f1", "rougeL_f1", "compression_ratio"] if c in df.columns]
    grouped = df.groupby("model_name", as_index=False)[metric_cols].mean()
    return grouped.sort_values(by="rougeL_f1", ascending=False, na_position="last")
