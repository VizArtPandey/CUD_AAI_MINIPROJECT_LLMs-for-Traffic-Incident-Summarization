from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import pandas as pd

from src.data.utils import load_config


@dataclass
class GCCSource:
    source_id: str
    label: str
    official_url: str
    access_type: str
    local_sample_csv: str
    status: str
    notes: str


def get_gcc_sources(config_path: str | Path = "config.yaml") -> list[GCCSource]:
    cfg = load_config(config_path)
    sources: dict[str, Any] = cfg.get("gcc", {}).get("sources", {})
    return [
        GCCSource(
            source_id=source_id,
            label=meta["label"],
            official_url=meta["official_url"],
            access_type=meta["access_type"],
            local_sample_csv=meta["local_sample_csv"],
            status=meta.get("status", "bundled_sample"),
            notes=meta.get("notes", ""),
        )
        for source_id, meta in sources.items()
    ]


def build_source_manifest(config_path: str | Path = "config.yaml") -> pd.DataFrame:
    rows = [source.__dict__ for source in get_gcc_sources(config_path)]
    return pd.DataFrame(rows)


def load_local_gcc_source(source_id: str, config_path: str | Path = "config.yaml") -> pd.DataFrame:
    for source in get_gcc_sources(config_path):
        if source.source_id == source_id:
            path = Path(source.local_sample_csv)
            if not path.exists():
                raise FileNotFoundError(f"Bundled GCC sample file is missing: {path}")
            df = pd.read_csv(path)
            df["source_id"] = source.source_id
            df["source_label"] = source.label
            df["official_url"] = source.official_url
            return df
    raise ValueError(f"Unknown GCC source: {source_id}")


def load_all_gcc_sources(config_path: str | Path = "config.yaml") -> pd.DataFrame:
    sources = get_gcc_sources(config_path)
    parts = [load_local_gcc_source(source.source_id, config_path=config_path) for source in sources]
    if not parts:
        return pd.DataFrame()
    combined = pd.concat(parts, ignore_index=True)
    return combined
