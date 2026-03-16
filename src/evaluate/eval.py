from __future__ import annotations
import argparse
from pathlib import Path
import pandas as pd
from src.evaluate.metrics import compute_rouge_single, compression_ratio
from src.evaluate.tables import aggregate_metrics_table

def evaluate_outputs(df: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for _, row in df.iterrows():
        item = row.to_dict()
        source = str(item.get("Description", ""))
        prediction = str(item.get("generated_summary", ""))
        reference = str(item.get("reference_summary", "")).strip()
        metrics = {"compression_ratio": compression_ratio(source, prediction)}
        if reference:
            metrics.update(compute_rouge_single(reference, prediction))
        else:
            metrics.update({"rouge1_f1": None, "rouge2_f1": None, "rougeL_f1": None})
        item.update(metrics)
        rows.append(item)
    return pd.DataFrame(rows)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--detailed-output", default=None)
    args = parser.parse_args()
    df = pd.read_csv(args.input)
    detailed = evaluate_outputs(df)
    if args.detailed_output:
        Path(args.detailed_output).parent.mkdir(parents=True, exist_ok=True)
        detailed.to_csv(args.detailed_output, index=False)
    aggregate = aggregate_metrics_table(detailed)
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    aggregate.to_csv(args.output, index=False)
    print(aggregate.to_string(index=False))
