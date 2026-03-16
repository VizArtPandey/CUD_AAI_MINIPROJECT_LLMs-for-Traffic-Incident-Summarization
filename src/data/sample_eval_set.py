from __future__ import annotations
import argparse
from pathlib import Path
import pandas as pd

def create_eval_template(input_csv: str | Path, output_csv: str | Path, n: int = 150) -> pd.DataFrame:
    df = pd.read_csv(input_csv)
    working = df.head(n).copy()
    working["reference_summary"] = ""
    working["annotator_notes"] = ""
    working["clarity_human"] = ""
    working["completeness_human"] = ""
    working["correctness_human"] = ""
    Path(output_csv).parent.mkdir(parents=True, exist_ok=True)
    working.to_csv(output_csv, index=False)
    return working

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--n", type=int, default=150)
    args = parser.parse_args()
    df = create_eval_template(args.input, args.output, args.n)
    print(f"Created evaluation template with {len(df)} rows at {args.output}")
