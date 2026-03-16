from src.models.baselines import lead1_summary, textrank_summary

def test_lead1_summary_returns_first_sentence():
    text = "Crash on I-95 caused delays. Emergency crews responded."
    assert lead1_summary(text) == "Crash on I-95 caused delays."

def test_textrank_summary_returns_nonempty():
    text = "Crash on I-95 caused delays. Emergency crews responded. Two lanes were blocked."
    assert textrank_summary(text)
