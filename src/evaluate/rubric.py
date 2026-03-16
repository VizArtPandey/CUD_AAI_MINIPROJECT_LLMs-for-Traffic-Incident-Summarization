from dataclasses import dataclass

@dataclass
class RubricScore:
    clarity: int
    completeness: int
    correctness: int
    notes: str = ""

RUBRIC_GUIDANCE = {
    "clarity": "1=hard to follow, 5=very clear and concise",
    "completeness": "1=misses core facts, 5=captures event, location context, severity, and consequences",
    "correctness": "1=contains unsupported claims, 5=no obvious hallucination",
}
