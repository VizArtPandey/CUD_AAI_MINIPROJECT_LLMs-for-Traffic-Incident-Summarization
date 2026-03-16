# Automatic Dataset Download

The repo tries to fetch the dataset automatically when you run:

```bash
python -m src.cli.run_prepare
```

## Authentication
Use one of these:
- `~/.kaggle/kaggle.json`
- `KAGGLE_USERNAME` and `KAGGLE_KEY`

## Manual fallback
If automatic download is not available in your environment, manually download:
`US_Accidents_March23.csv`

Then place it in:
`data/raw/US_Accidents_March23.csv`
