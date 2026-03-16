from __future__ import annotations

import argparse

from src.data.prepare import prepare_dataset


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare US and GCC traffic incident corpora.")
    parser.add_argument("--source", choices=["us", "gcc", "both"], default="both")
    parser.add_argument("--config", default="config.yaml")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    cleaned_df, experiment_df, eval_df = prepare_dataset(source=args.source, config_path=args.config)
    print("Preparation complete")
    print(f"  cleaned rows:    {len(cleaned_df):,}")
    print(f"  experiment rows: {len(experiment_df):,}")
    print(f"  eval rows:       {len(eval_df):,}")
