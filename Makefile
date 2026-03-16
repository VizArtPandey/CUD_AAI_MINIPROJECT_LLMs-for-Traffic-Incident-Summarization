PYTHON=python

prepare:
	$(PYTHON) -m src.cli.run_prepare --input data/raw/US_Accidents_March23.csv

sample-eval:
	$(PYTHON) -m src.data.sample_eval_set --input data/interim/eval_candidates.csv --output data/processed/eval_set_with_refs.csv --n 150

infer:
	$(PYTHON) -m src.cli.run_inference --input data/processed/eval_set_with_refs.csv --output data/processed/model_outputs.csv --models lead1 textrank flan_t5_small bart_large_cnn

eval:
	$(PYTHON) -m src.cli.run_evaluation --input data/processed/model_outputs.csv --output data/processed/aggregate_metrics.csv

backend:
	uvicorn backend.main:app --reload --port 8000

frontend:
	cd frontend && npm install && npm run dev
