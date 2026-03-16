from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd

from src.data.download import ensure_dataset_available
from src.data.gcc_generator import generate_gcc_narratives
from src.data.gcc_sources import build_source_manifest, load_all_gcc_sources
from src.data.utils import load_config


def normalize_whitespace(text: str) -> str:
    return " ".join(str(text).split())


def clean_descriptions(
    df: pd.DataFrame,
    text_column: str,
    min_chars: int,
    max_chars: int,
    deduplicate: bool = True,
    dataset_track: str = "us",
) -> pd.DataFrame:
    working = df.copy()
    working = working[working[text_column].notna()].copy()
    working[text_column] = working[text_column].astype(str).map(normalize_whitespace)
    working["text_len"] = working[text_column].str.len()
    working = working[(working["text_len"] >= min_chars) & (working["text_len"] <= max_chars)].copy()
    if deduplicate:
        working = working.drop_duplicates(subset=[text_column])
    if "dataset_track" not in working.columns:
        working["dataset_track"] = dataset_track
    keep_cols = [
        c
        for c in [
            "ID",
            "Severity",
            "State",
            "City",
            "County",
            "Street",
            "Start_Time",
            "source_id",
            "source_label",
            "official_url",
            "country",
            "emirate",
            "district",
            "road_name",
            text_column,
            "text_len",
            "dataset_track",
        ]
        if c in working.columns
    ]
    return working[keep_cols].reset_index(drop=True)


def stratified_or_random_sample(df: pd.DataFrame, n: int, random_state: int, stratify_col: str | None = None) -> pd.DataFrame:
    if df.empty:
        return df.copy()
    if n >= len(df):
        return df.sample(frac=1.0, random_state=random_state).reset_index(drop=True)
    if stratify_col and stratify_col in df.columns and df[stratify_col].notna().any():
        parts = []
        for _, group_df in df.groupby(stratify_col, dropna=False):
            take = max(1, round(len(group_df) / len(df) * n))
            parts.append(group_df.sample(n=min(take, len(group_df)), random_state=random_state))
        sampled = pd.concat(parts, ignore_index=True).drop_duplicates()
        if len(sampled) > n:
            sampled = sampled.sample(n=n, random_state=random_state)
        return sampled.reset_index(drop=True)
    return df.sample(n=n, random_state=random_state).reset_index(drop=True)


def save_csv(df: pd.DataFrame, path: str | Path) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path, index=False)


def prepare_us_dataset(config_path: str | Path = "config.yaml") -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    cfg = load_config(config_path)
    raw_csv = ensure_dataset_available(config_path=config_path)
    raw = pd.read_csv(raw_csv, low_memory=False)
    cleaned = clean_descriptions(
        raw,
        cfg["data"]["text_column"],
        cfg["data"]["min_chars"],
        cfg["data"]["max_chars"],
        cfg["data"]["deduplicate"],
        dataset_track="us",
    )
    stratify_col = cfg["data"]["stratify_by"][0] if cfg["data"].get("stratify_by") else None
    experiment_sample = stratified_or_random_sample(cleaned, cfg["data"]["experiment_sample_size"], cfg["project"]["random_seed"], stratify_col)
    eval_candidates = stratified_or_random_sample(cleaned, cfg["data"]["eval_candidate_size"], cfg["project"]["random_seed"] + 1, stratify_col)
    return cleaned, experiment_sample, eval_candidates


def prepare_gcc_dataset(config_path: str | Path = "config.yaml") -> tuple[pd.DataFrame, pd.DataFrame]:
    cfg = load_config(config_path)
    manifest = build_source_manifest(config_path)
    structured = load_all_gcc_sources(config_path)
    narratives = generate_gcc_narratives(structured, config_path=config_path)
    save_csv(manifest, cfg["paths"]["gcc_manifest_csv"])
    save_csv(structured, cfg["paths"]["gcc_combined_structured_csv"])
    save_csv(narratives, cfg["paths"]["gcc_narratives_csv"])
    return structured, narratives


def prepare_dataset(source: str = "both", config_path: str | Path = "config.yaml"):
    cfg = load_config(config_path)
    cleaned_frames: list[pd.DataFrame] = []
    eval_frames: list[pd.DataFrame] = []

    if source in {"us", "both"}:
        cleaned_us, experiment_us, eval_us = prepare_us_dataset(config_path)
        cleaned_frames.append(cleaned_us)
        eval_frames.append(eval_us)
    else:
        experiment_us = pd.DataFrame()

    if source in {"gcc", "both"}:
        _, gcc_narratives = prepare_gcc_dataset(config_path)
        cleaned_gcc = clean_descriptions(
            gcc_narratives,
            cfg["data"]["text_column"],
            cfg["data"]["min_chars"],
            cfg["data"]["max_chars"],
            cfg["data"]["deduplicate"],
            dataset_track="gcc",
        )
        cleaned_frames.append(cleaned_gcc)
        eval_gcc = stratified_or_random_sample(cleaned_gcc, cfg["data"]["gcc_eval_candidate_size"], cfg["project"]["random_seed"] + 5, stratify_col="source_id")
        eval_frames.append(eval_gcc)
    else:
        cleaned_gcc = pd.DataFrame()

    combined_cleaned = pd.concat(cleaned_frames, ignore_index=True) if cleaned_frames else pd.DataFrame()
    combined_eval = pd.concat(eval_frames, ignore_index=True) if eval_frames else pd.DataFrame()

    if source == "us":
        experiment_sample = experiment_us
    elif source == "gcc":
        experiment_sample = cleaned_gcc
    else:
        experiment_sample = pd.concat([experiment_us, cleaned_gcc], ignore_index=True).drop_duplicates(subset=[cfg["data"]["text_column"]]).reset_index(drop=True)

    save_csv(combined_cleaned, cfg["paths"]["cleaned_csv"])
    save_csv(experiment_sample, cfg["paths"]["experiment_sample_csv"])
    save_csv(combined_eval, cfg["paths"]["eval_candidates_csv"])
    save_csv(experiment_sample, cfg["paths"]["combined_corpus_csv"])
    return combined_cleaned, experiment_sample, combined_eval



def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", choices=["us", "gcc", "both"], default="both")
    parser.add_argument("--config", default="config.yaml")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    cleaned_df, experiment_df, eval_df = prepare_dataset(source=args.source, config_path=args.config)
    print(f"Prepared cleaned rows: {len(cleaned_df):,}")
    print(f"Prepared experiment rows: {len(experiment_df):,}")
    print(f"Prepared eval rows: {len(eval_df):,}")
