from __future__ import annotations

from pydantic import BaseModel, Field
from typing import List


class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=10)
    model_choice: str = Field(default="bart_large_cnn")
    max_length: int = Field(default=96, ge=16, le=512)
    dataset_track: str = Field(default="gcc")


class SummarizeResponse(BaseModel):
    model_name: str
    summary: str
    dataset_track: str
    word_count: int


class CompareRequest(BaseModel):
    text: str = Field(..., min_length=10)
    model_choices: List[str]
    max_length: int = Field(default=96, ge=16, le=512)
    dataset_track: str = Field(default="gcc")


class CompareResponseItem(BaseModel):
    model_name: str
    summary: str
    word_count: int


class CompareResponse(BaseModel):
    dataset_track: str
    items: List[CompareResponseItem]


class SampleItem(BaseModel):
    id: str
    dataset_track: str
    title: str
    text: str
    source_label: str


class SamplesResponse(BaseModel):
    items: List[SampleItem]
