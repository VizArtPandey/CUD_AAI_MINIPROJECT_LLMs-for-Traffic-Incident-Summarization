from __future__ import annotations
import argparse
from pathlib import Path
import pandas as pd
from tqdm import tqdm
from src.models.registry import summarize_text

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--models", nargs="+", required=True)
    parser.add_argument("--text-column", default="Description")
    parser.add_argument("--max-length", type=int, default=96)
    args = parser.parse_args()

    df = pd.read_csv(args.input)
    records = []
    for _, row in tqdm(df.iterrows(), total=len(df), desc="Generating summaries"):
        source_text = str(row[args.text_column])
        for model_name in args.models:
            summary = summarize_text(source_text, model_name=model_name, max_new_tokens=args.max_length)
            payload = row.to_dict()
            payload["model_name"] = model_name
            payload["generated_summary"] = summary
            records.append(payload)
    out_df = pd.DataFrame(records)
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    out_df.to_csv(args.output, index=False)
    print(f"Wrote {len(out_df)} rows to {args.output}")
