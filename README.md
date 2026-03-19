---
title: CUD Traffic AI
emoji: 🚦
colorFrom: yellow
colorTo: red
sdk: docker
pinned: false
---

# CUD - AAI - Midterm Project - Traffic Incident Summarization

This repo compares extractive and abstractive summarization methods for traffic incident reports and ships with a polished React + FastAPI demo.

## What is included

- U.S. Accidents ingestion with automatic Kaggle download support
- GCC regional track with bundled Dubai, Abu Dhabi, and UAE federal sample datasets
- Rule-based GCC narrative generation so structured GCC records become natural-language incident reports
- Baselines: Lead-1 and TextRank
- Abstractive models: BART, Flan-T5, optional PEGASUS
- Evaluation pipeline, notebooks, LaTeX paper draft, poster content, and a demo UI

## GCC data note

The repo now includes **official source references** for Dubai Pulse, Abu Dhabi Open Data, and UAE federal traffic statistics, along with **normalized bundled sample files** so the project runs immediately offline. This is the practical compromise because public GCC portals often expose structured records, JavaScript-only dashboards, or gated exports rather than ready-to-bundle narrative text.

In the paper, describe the GCC track like this:

> Structured GCC traffic records were normalized into a common schema and converted into operator-style narrative incident descriptions using a rule-based text generator. Official source references were retained for provenance, while bundled sample extracts were used to make the demo reproducible offline.

## Quick start

### 1. Python environment

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Prepare data

```bash
python -m src.cli.run_prepare --source both
```

Behavior:

- If `data/raw/US_Accidents_March23.csv` is missing, the script attempts Kaggle download.
- GCC sample sources are already bundled.
- A combined corpus is written to `data/interim/combined_incident_corpus.csv`.

### 3. Start backend

```bash
uvicorn backend.main:app --reload --port 8000
```

### 4. Start frontend

```bash
cd frontend
npm install
npm run dev
```

## Demo features

- Beautiful hero dashboard for screenshots
- Dataset track toggle: US or GCC
- Sample incident picker
- Summarize and compare endpoints
- Copy and download summary cards
- Batch CSV upload preview

## Important paths

- `data/raw/gcc/source_manifest.csv`
- `data/interim/gcc_narratives.csv`
- `docs/paper/main.tex`
- `docs/poster/poster_content.md`
