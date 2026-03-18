# Changelog

All notable changes to the **TrafficIntel — LLMs for Traffic Incident Summarization** project are documented here.

---

## [v1.1.0] — 2026-03-19  ·  UI Overhaul + Summarization Quality

### ✨ New Features

#### Live ROUGE Experiment Results Panel
- Added `LiveMetrics.jsx` — a new right-column card showing ROUGE-1 bar charts for all four models (BART, Flan-T5, PEGASUS, TextRank) sourced from the experiment corpus (n = 200).
- The **currently selected model** is highlighted in orange with an animated gradient bar and an "active" badge.
- A 4-metric grid (R-1, R-2, R-L, CR) updates live as the user switches models.
- A green delta indicator shows ROUGE-1 gain over the TextRank baseline (e.g. +35.8% for BART).
- Each metric now has a bullet-point description below explaining what it measures.

#### Dataset Loader (`BatchUpload.jsx`)
- Renamed from "Batch Processing" / "Evaluation Data Loader" → **"Load Your Dataset"** for clarity.
- File format guidance simplified: `.csv only · max 50 MB` displayed inline in the drop zone.
- Clear reference to the required `Incident Description` column in the helper text.

#### Available Datasets Panel (`DatasetToggle.jsx`)
- Renamed section header from "Analysis Dataset" → **"Available Datasets"**.
- Replaced `Database` icon with `BrainCircuit` (ML-themed) icon rendered in orange.
- Full light/dark mode support with proper hover states and contrast.

---

### 🐛 Bug Fixes & Improvements

#### Summarization Quality — Backend
- **Per-model directive prompts** injected before incident text to force genuine rewriting:
  - BART-large-CNN: instructed to report only location, type, severity, and road impact briefly.
  - Flan-T5-small: instructed to produce a one-sentence summary under 35 words.
  - PEGASUS: given a compact-sentence summarization directive.
- **Dynamic token cap**: `max_new_tokens` capped at 50% of raw input token count, preventing verbatim echoing of short incidents.
- `length_penalty` raised to **3.0** — strongly penalises long outputs and promotes compression.
- `no_repeat_ngram_size` raised to **4** — blocks 4-gram phrase copying from the source text.
- `num_beams` reduced from 4 → **2** for ~40% faster inference with minimal quality loss.

#### Light Mode — Full Global Support
- Root page background (`Home.jsx`): `bg-[#060d1f]` → `bg-slate-50 dark:bg-[#060d1f]`.
- Navbar: white background in light, all text/icon colours use `dark:` variants.
- SummarizerWidget card, input/output panes, model cards, buttons: full `dark:` pairing.
- Dataset Preview (`Home.jsx`): `bg-[#0d1326]` → `bg-white dark:bg-[#0d1326]`.
- DatasetToggle, BatchUpload, LiveMetrics: all hardcoded dark colours replaced.
- Hero stat chips: wrapped in `bg-slate-100 dark:bg-white/5` cards; value text `text-slate-900 dark:text-white`.
- Model card names, Speed label, speed bars: all light-mode-safe.
- Copy & Save buttons: `bg-slate-100 text-slate-700` in light, `bg-white/8 text-white` in dark.

#### Info Icon & Tooltip
- Info `i` badge: `border-2` (thicker), always visible at `text-slate-500`, glows `text-orange-600` on hover.
- Tooltip: `bg-white border-slate-200 text-slate-700` in light / `bg-slate-800 text-slate-300` in dark.

#### Text Readability
- Input textarea and output paragraph: both use `text-lg leading-[1.85]` — larger and breathable.
- Removed artificial `min-h/max-h` constraints on the output pane that created dead whitespace.
- Textarea uses fixed `rows={5}` to eliminate empty space when content is short.

#### Visual / Layout
- "CUD · AAI Midterm Project" badge moved from hero → below the TrafficIntel logo in the navbar (less cluttered hero).
- All card borders tightened: `border-slate-200` → `border-slate-300 dark:border-white/[0.07]` for better definition.
- A `border-t` separator added between hero and the 3-column grid for clean visual rhythm.
- Dataset Preview shows **5 severity-stratified samples** (one per severity level: High → Medium → Critical → Low) instead of simply the top-5 rows, so the preview always shows a meaningful, diverse range.

---

### 📁 Files Changed

| File | Change |
|------|--------|
| `src/models/abstractive.py` | Per-model prompts, dynamic token cap, stronger length penalty |
| `config.yaml` | `num_beams: 4→2`, `max_new_tokens: 96→72` |
| `backend/main.py` | Severity-stratified `/samples` endpoint, `_safe_int` helper |
| `frontend/src/pages/Home.jsx` | Full light mode, stat cards, CUD badge moved, dataset preview border |
| `frontend/src/components/SummarizerWidget.jsx` | Light mode, text size, info icon, tooltip |
| `frontend/src/components/DatasetToggle.jsx` | Renamed, BrainCircuit icon, light mode |
| `frontend/src/components/BatchUpload.jsx` | Renamed, cleaned up, light mode |
| `frontend/src/components/LiveMetrics.jsx` | New component — live ROUGE scores |
| `frontend/src/index.css` | Dark theme tokens, Inter font, custom scrollbar, grid background |

---

> ⚠️ **Backend restart required** after pulling to activate the new generation parameters and prompt changes.
