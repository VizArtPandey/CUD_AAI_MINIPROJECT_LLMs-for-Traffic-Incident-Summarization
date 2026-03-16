from __future__ import annotations
import re
from sumy.nlp.tokenizers import Tokenizer
from sumy.parsers.plaintext import PlaintextParser
from sumy.summarizers.text_rank import TextRankSummarizer

SENTENCE_SPLIT_REGEX = re.compile(r"(?<=[.!?])\s+")

def lead1_summary(text: str) -> str:
    text = " ".join(str(text).split())
    if not text:
        return ""
    return re.split(SENTENCE_SPLIT_REGEX, text)[0].strip()

def textrank_summary(text: str, sentence_count: int = 1) -> str:
    text = " ".join(str(text).split())
    if not text:
        return ""
    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    summarizer = TextRankSummarizer()
    summary = " ".join(str(sentence) for sentence in summarizer(parser.document, sentence_count)).strip()
    return summary or lead1_summary(text)

def run_baseline(model_name: str, text: str) -> str:
    if model_name == "lead1":
        return lead1_summary(text)
    if model_name == "textrank":
        return textrank_summary(text)
    raise ValueError(f"Unsupported baseline model: {model_name}")
