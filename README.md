

<div align="center">

# 🚦 TrafficIntel — LLMs for Traffic Incident Summarization

### *From Reports to Decisions: Evaluating LLM-Based Summarization for Smart City Operations*

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![HuggingFace](https://img.shields.io/badge/🤗%20Hugging%20Face-Spaces-FFD21E)](https://huggingface.co/spaces/rajvivan/CUD-Traffic-AI)
[![IEEE](https://img.shields.io/badge/Paper-IEEE%20Format-00629B?logo=ieee)](https://github.com/VizArtPandey/CUD_AAI_MINIPROJECT_LLMs-for-Traffic-Incident-Summarization)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Canadian University Dubai · AAI Midterm Project · Semester 01, 2025–2026**

*Rajeev Ranjan Pandey · Supervised by Prof. Khalid Elgazzar (Ontario Tech University)*

</div>

---

## 💡 The Idea — Where It All Started

Every day, traffic control centres in smart cities receive **hundreds of incident reports** — dense, multi-sentence narratives describing collisions, lane blockages, weather-related hazards, and pedestrian events. Dispatchers must manually scan each report to extract the four things that matter most: **incident type, affected road segment, closure status, and severity level**. In high-pressure operations, this scan takes precious seconds that can affect emergency response times.

> **The core question this project asks:** *Can Large Language Models automatically produce concise, decision-ready briefings from raw traffic incident reports — and can we trust what they generate?*

This isn't just a benchmarking exercise. The goal was to build a full pipeline — from raw data ingestion all the way to a live, interactive summarization dashboard — while rigorously evaluating the **reliability** of each model, not just its lexical performance scores.

---

## 🧠 Thought Process — How We Approached the Problem

### Phase 1 · Problem Framing
Most NLP summarization research evaluates models on news corpora (CNN/DailyMail, XSum). Traffic incident reports are a different beast: they are **short, structured, and safety-critical**. A hallucinated injury count or a fabricated road closure in a news summary is embarrassing; in a traffic control room, it can affect real-world dispatch decisions.

We identified three key evaluation axes:
1. **Lexical overlap** — measured via ROUGE-1, ROUGE-2, ROUGE-L
2. **Factual reliability** — qualitative error analysis (hallucination & omission rates)
3. **Operational practicality** — execution time per record, compression ratio

### Phase 2 · Data Strategy
We needed traffic incident data with narrative depth — not just structured fields. Two sources were combined:

- **US Accidents Dataset** (Moosavi, 2023): ~5,000+ real-world accident records from Kaggle with description text and severity labels.
- **GCC Regional Data**: Dubai Pulse, UAE Federal Traffic Statistics, Abu Dhabi Open Data portals provide *structured* records (not narratives). A **rule-based narrative generator** was built to convert these structured fields into operator-style incident descriptions — preserving official provenance while making the corpus usable for NLP.

The result: **5,250+ incident records** across five categories — rear-end collisions, highway lane blockages, weather-related events, pedestrian incidents, and multi-vehicle pile-ups.

### Phase 3 · Model Selection
Four models were evaluated under **zero-shot conditions** (no fine-tuning, no domain adaptation):

| Model | Type | Why Selected |
|---|---|---|
| **BART-large-CNN** | Abstractive | Pre-trained on event-oriented news; incident reports share structural similarity |
| **Flan-T5-small** | Abstractive | Lightweight instruction-following model; `summarize:` prefix enables prompt-based control |
| **PEGASUS-CNN/DM** | Abstractive | Gap-sentence pre-training objective designed specifically for summarization |
| **TextRank** | Extractive | Graph-centrality baseline; preserves source wording, avoids hallucination |

Zero-shot was a deliberate choice — it tests what these models can do *out of the box*, before any domain-specific engineering. This reflects realistic deployment constraints in research and operational contexts.

### Phase 4 · Evaluation Design
A stratified evaluation set of **420 records** (300 US + 120 GCC) was annotated with human-written reference summaries (40–80 tokens each). This allowed both:
- **Quantitative ROUGE scoring** using the `rouge-score` library with stemming
- **Qualitative failure analysis** to categorize hallucination, omission, and over-compression errors

Execution times were also recorded on a standard cloud GPU environment to assess real-time deployment feasibility.

### Phase 5 · Demo & Reproducibility
Research that cannot be interacted with is harder to evaluate. A **React + FastAPI demo** was built so that evaluators, peers, and supervisors could test the models live with custom incident text — not just trust table numbers in a paper.

---

## 📊 Key Results

> **All three abstractive models outperform the extractive TextRank baseline. But the story doesn't end at ROUGE scores.**

| Model | ROUGE-1 | ROUGE-2 | ROUGE-L | Compression Ratio | ROUGE-1 Gain | Exec. Time/record |
|---|---|---|---|---|---|---|
| **BART-large-CNN** | **0.432** | **0.198** | **0.391** | 3.2× | **+35.8%** | 1.42 s |
| Flan-T5-small | 0.408 | 0.181 | 0.372 | 3.5× | +28.3% | **0.28 s** |
| PEGASUS-CNN/DM | 0.389 | 0.162 | 0.354 | 3.8× | +22.3% | 1.65 s |
| TextRank | 0.318 | 0.109 | 0.287 | 2.8× | — | 0.05 s |

### ⚠️ Critical Finding — ROUGE Is Not Enough

Qualitative analysis revealed failure patterns that ROUGE scores mask entirely:

- **BART hallucinates** safety-critical details in **~14% of outputs** — e.g., fabricating injury counts ("3 injuries") when the source only describes a minor collision.
- **Flan-T5 omits** road closure information in **~11% of cases** — a critical omission for rerouting decisions.
- **PEGASUS over-compresses** — produces headline-like outputs that drop location and response details.
- **TextRank never hallucinates** but fails when key facts are spread across multiple sentences.

**Practical recommendation:** For time-sensitive deployments, *Flan-T5* offers the best speed-quality trade-off (0.28s/record, ROUGE-1 of 0.408). For highest accuracy where latency is acceptable, *BART* is preferred. In all cases, factuality checks or constraint-based decoding should be layered on top.

---

## 🏗️ Architecture Overview

```
traffic-incident-summarization/
│
├── backend/                    # FastAPI application
│   ├── main.py                 # API entry point, /summarize, /compare, /samples endpoints
│   ├── routers/                # Modular route handlers
│   ├── model_cache.py          # Lazy model loading & GPU/CPU routing
│   └── dependencies.py        # Shared dependency injection
│
├── src/                        # Core ML pipeline
│   ├── cli/
│   │   └── run_prepare.py      # Data preparation CLI (--source us|gcc|both)
│   ├── models/
│   │   └── abstractive.py      # BART, Flan-T5, PEGASUS inference with per-model prompts
│   ├── data/
│   │   └── gcc_generator.py    # Rule-based GCC narrative generator
│   └── evaluation/
│       └── rouge_eval.py       # ROUGE scoring pipeline
│
├── frontend/                   # React 18 + Vite dashboard
│   └── src/
│       ├── pages/Home.jsx      # Hero dashboard, dataset preview
│       ├── components/
│       │   ├── SummarizerWidget.jsx  # Input/output summarization panel
│       │   ├── LiveMetrics.jsx       # Real-time ROUGE bar charts
│       │   ├── DatasetToggle.jsx     # US / GCC dataset selector
│       │   └── BatchUpload.jsx       # CSV batch upload & preview
│       └── index.css           # Design tokens, dark/light themes
│
├── data/
│   ├── raw/gcc/                # Bundled GCC sample CSVs (offline-ready)
│   └── interim/                # Generated corpora (gitignored)
│
├── notebooks/                  # Exploratory analysis & experiment notebooks
├── docs/                       # Paper draft, poster content
├── config.yaml                 # Generation parameters (beams, tokens, penalties)
├── docker-compose.yml          # Full-stack Docker orchestration
├── Dockerfile                  # Unified production image
└── Makefile                    # Developer shortcuts
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- (Optional) Kaggle API credentials for US Accidents auto-download
- (Optional) NVIDIA GPU for faster inference

### 1 · Python Environment

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2 · Prepare the Dataset

```bash
python -m src.cli.run_prepare --source both
```

**What this does:**
- If `data/raw/US_Accidents_March23.csv` is absent → attempts Kaggle auto-download (requires `kaggle.json`)
- GCC sample CSVs are already bundled under `data/raw/gcc/` — no external dependency
- Runs the rule-based GCC narrative generator
- Writes the combined corpus to `data/interim/combined_incident_corpus.csv`

### 3 · Start the Backend

```bash
uvicorn backend.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`

### 4 · Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard available at `http://localhost:5173`

### 5 · Docker (Full Stack)

```bash
docker-compose up --build
```

---

## 🎛️ Configuration

Key generation parameters live in `config.yaml`:

```yaml
generation:
  num_beams: 2              # Beam search width (reduced for ~40% faster inference)
  max_new_tokens: 72        # Hard cap on summary length
  min_new_tokens: 18        # Prevents degenerate one-word outputs
  length_penalty: 3.0       # Strongly penalizes longer outputs → promotes compression
  no_repeat_ngram_size: 4   # Blocks 4-gram copying from source text
```

Per-model directive prompts are injected at inference time in `src/models/abstractive.py` to force genuine rewriting rather than verbatim copying.

---

## 🖥️ Demo Features

The live dashboard at [Hugging Face Spaces](https://huggingface.co/spaces/rajvivan/CUD-Traffic-AI) includes:

- **Hero metrics panel** — live ROUGE stats for all four models
- **Dataset toggle** — switch between US Accidents and GCC regional data
- **Severity-stratified sample picker** — one sample per severity level (Low → Medium → High → Critical)
- **Summarize & Compare** — side-by-side model output comparison
- **Live ROUGE bar charts** — active model highlighted with animated gradient
- **Copy & Download** — export individual summaries
- **Batch CSV upload** — preview and process your own dataset
- **Full light / dark mode** — system-preference aware

---

## 📄 Paper

This project is accompanied by a peer-reviewed paper submitted in IEEE two-column format:

> **"Automated Traffic Incident Summarisation Using LLMs: A Smart City Perspective"**  
> Rajeev Ranjan Pandey, Khalid Elgazzar  
> Canadian University Dubai / Ontario Tech University — 2026

The paper covers: dataset construction rationale, model configuration, ROUGE evaluation (n=420), qualitative error analysis (hallucination/omission rates), execution time analysis, and a discussion of why ROUGE alone is insufficient for safety-critical NLP systems.

---

## 🗂️ GCC Data Note

Public GCC portals (Dubai Pulse, Abu Dhabi Open Data, UAE Federal Traffic Statistics) primarily expose **structured records** — not ready-to-use narrative text. JavaScript-only dashboards and gated CSV exports make direct download impractical for reproducible research.

**Our approach:** Structured records were normalized into a common schema and converted into operator-style narrative descriptions using a **deterministic rule-based text generator**. Official source references were retained for provenance. Bundled sample extracts (`data/raw/gcc/*.csv`) make the demo reproducible offline without requiring portal access.

---

## 🔬 Limitations & Future Work

- **Zero-shot only** — models were not fine-tuned on traffic data. Domain-specific fine-tuning would likely reduce hallucination rates significantly.
- **English only** — Arabic-language support is critical for GCC operational deployments and is planned as future work.
- **Scale** — the 420-record evaluation set covers five incident categories; broader geographic and temporal diversity is needed.
- **Factuality metrics** — BERTScore and QA-based faithfulness metrics should supplement ROUGE in future evaluations.
- **Hybrid approaches** — extractive-then-abstractive pipelines could combine TextRank's factual grounding with BART's coherence.

---

## 📁 Key Paths

| Path | Description |
|---|---|
| `data/raw/gcc/source_manifest.csv` | Official GCC source references & provenance |
| `data/raw/gcc/*.csv` | Bundled GCC sample records (offline-ready) |
| `data/interim/gcc_narratives.csv` | Generated operator-style GCC narrative corpus |
| `data/interim/combined_incident_corpus.csv` | Full combined corpus (US + GCC) |
| `src/models/abstractive.py` | BART / Flan-T5 / PEGASUS inference with prompts |
| `backend/main.py` | FastAPI routes and severity-stratified sample endpoint |
| `frontend/src/components/LiveMetrics.jsx` | ROUGE visualization component |
| `config.yaml` | Generation hyperparameters |

---

## 🤝 Acknowledgements

- **Prof. Khalid Elgazzar** (IoT Research Lab, Ontario Tech University) — supervision and research guidance
- **Sobhan Moosavi** — US Accidents dataset (Kaggle, 2023)
- **Dubai Statistics Center** — Dubai Pulse Open Data Portal
- **Hugging Face** — model hosting (BART, Flan-T5, PEGASUS) and Spaces deployment

---

<div align="center">

*Built at Canadian University Dubai · AAI Midterm Project · 2025–2026*

[![GitHub](https://img.shields.io/badge/GitHub-VizArtPandey-181717?logo=github)](https://github.com/VizArtPandey/CUD_AAI_MINIPROJECT_LLMs-for-Traffic-Incident-Summarization)
[![HuggingFace Spaces](https://img.shields.io/badge/🤗%20Demo-rajvivan%2FCUD--Traffic--AI-FFD21E)](https://huggingface.co/spaces/rajvivan/CUD-Traffic-AI)

</div>
