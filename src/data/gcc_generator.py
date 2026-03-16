from __future__ import annotations

from pathlib import Path

import pandas as pd

from src.data.utils import load_config


def _safe(value: object, fallback: str = "unknown") -> str:
    if value is None:
        return fallback
    text = str(value).strip()
    return text if text and text.lower() != "nan" else fallback


def structured_row_to_narrative(row: pd.Series) -> str:
    emirate = _safe(row.get("emirate"), "the UAE")
    road = _safe(row.get("road_name"), "an urban corridor")
    district = _safe(row.get("district"), "a metropolitan district")
    incident_type = _safe(row.get("incident_type"), "traffic incident")
    vehicles = _safe(row.get("vehicles_involved"), "multiple")
    injuries = _safe(row.get("injury_level"), "unknown injuries")
    lane_status = _safe(row.get("lane_status"), "traffic disruption")
    timestamp = _safe(row.get("event_time"), "an unspecified time")
    weather = _safe(row.get("weather"), "normal road conditions")
    severity = _safe(row.get("severity"), "moderate")
    consequence = _safe(row.get("consequence"), "traffic delays")

    return (
        f"A {incident_type.lower()} was recorded in {district}, {emirate}, on {road} at {timestamp}. "
        f"The event involved {vehicles} vehicle(s) and was categorized as {severity.lower()} severity under {weather.lower()}. "
        f"Responders reported {injuries.lower()} with {lane_status.lower()}, resulting in {consequence.lower()}."
    )


def generate_gcc_narratives(structured_df: pd.DataFrame, config_path: str | Path = "config.yaml") -> pd.DataFrame:
    cfg = load_config(config_path)
    rows = structured_df.copy()
    rows["Description"] = rows.apply(structured_row_to_narrative, axis=1)
    rows["dataset_track"] = "gcc"
    rows["text_len"] = rows["Description"].str.len()
    cols = [
        "source_id",
        "source_label",
        "official_url",
        "incident_id",
        "country",
        "emirate",
        "district",
        "road_name",
        "event_time",
        "incident_type",
        "severity",
        "injury_level",
        "lane_status",
        "consequence",
        "Description",
        "text_len",
        "dataset_track",
    ]
    for col in cols:
        if col not in rows.columns:
            rows[col] = None
    return rows[cols].reset_index(drop=True)
