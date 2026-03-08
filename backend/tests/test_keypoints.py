import pytest
from app import reorder_for_isl, process_text_pipeline


def test_reorder_for_isl_basic():

    tokens = ["i", "go", "school", "today"]
    pos_tags = [
        ("i","PRP"),
        ("go","VB"),
        ("school","NN"),
        ("today","NN")
    ]

    result = reorder_for_isl(tokens, pos_tags)

    assert result == ["today","i","school","go"]


def test_process_text_pipeline_basic():

    text = "I go to school today"

    result = process_text_pipeline(text)

    assert "isl_gloss" in result
    assert isinstance(result["isl_gloss"], list)


def test_process_text_pipeline_mapping():

    text = "hello"

    result = process_text_pipeline(text)

    assert result["isl_gloss"][0] == "HELLO"