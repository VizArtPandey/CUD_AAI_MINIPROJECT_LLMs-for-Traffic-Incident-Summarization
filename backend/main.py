from __future__ import annotations

from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from src.app.schemas import (
    CompareRequest,
    CompareResponse,
    CompareResponseItem,
    SampleItem,
    SamplesResponse,
    SummarizeRequest,
    SummarizeResponse,
)
from src.app.services import summarize_with_model
from src.data.prepare import prepare_dataset
from src.data.utils import load_config

app = FastAPI(title="Traffic Incident Summarization API", version="0.4.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_prepare() -> None:
    cfg = load_config()
    combined = Path(cfg["paths"]["combined_corpus_csv"])
    if not combined.exists():
        try:
            prepare_dataset(source="gcc", config_path="config.yaml")
        except Exception:
            # keep startup resilient, especially when Kaggle credentials are absent
            pass


@app.get("/health")
def health():
    return {"status": "ok", "service": "traffic-incident-summarization", "version": "0.4.0"}


@app.get("/samples", response_model=SamplesResponse)
def get_samples(track: str = "gcc"):
    cfg = load_config()
    combined_path = Path(cfg["paths"]["combined_corpus_csv"])
    if not combined_path.exists():
        prepare_dataset(source="gcc", config_path="config.yaml")
    df = pd.read_csv(combined_path)
    if "dataset_track" in df.columns:
        df = df[df["dataset_track"].fillna("us") == track]
    if df.empty:
        raise HTTPException(status_code=404, detail=f"No samples found for dataset track: {track}")
    
    if "Start_Time" in df.columns:
        df["Start_Time"] = pd.to_datetime(df["Start_Time"], errors="coerce")
        df = df.sort_values(by="Start_Time", ascending=False)
        
    sample_df = df.head(10).copy()
    items = []
    for idx, row in sample_df.iterrows():
        def clean(val):
            s = str(val).strip() if pd.notna(val) else ""
            return "" if s.lower() in ("nan", "none", "") else s

        loc_cols = ["road_name", "Street", "district", "City", "State", "emirate"]
        location_parts = [clean(row.get(col)) for col in loc_cols]
        title = " · ".join([p for p in location_parts if p][:3]) or f"Sample incident {idx + 1}"

        desc = clean(row.get("Description", "")) or "No description available."

        sev = row.get("Severity", "")
        if clean(str(sev)):
            if "severity" not in desc.lower():
                try:
                    sev_int = int(float(sev))
                    sev_map = {1: "Low", 2: "Medium", 3: "High", 4: "Critical"}
                    sev_str = sev_map.get(sev_int, "Medium")
                    desc = f"{desc} Classified as {sev_str} severity."
                except Exception:
                    pass

        src_lbl = clean(row.get("source_label", ""))
        if not src_lbl:
            src_lbl = "US Accidents" if track == "us" else "GCC sample"

        items.append(
            SampleItem(
                id=str(idx + 1),
                dataset_track=track,
                title=title,
                text=desc,
                source_label=src_lbl,
            )
        )
    return SamplesResponse(items=items)


@app.post("/summarize", response_model=SummarizeResponse)
def summarize(request: SummarizeRequest):
    try:
        summary = summarize_with_model(request.text, request.model_choice, request.max_length)
        return SummarizeResponse(
            model_name=request.model_choice,
            summary=summary,
            dataset_track=request.dataset_track,
            word_count=len(summary.split()),
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/compare", response_model=CompareResponse)
def compare(request: CompareRequest):
    try:
        items = [
            CompareResponseItem(
                model_name=m,
                summary=summarize_with_model(request.text, m, request.max_length),
                word_count=len(summarize_with_model(request.text, m, request.max_length).split()),
            )
            for m in request.model_choices
        ]
        return CompareResponse(dataset_track=request.dataset_track, items=items)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
