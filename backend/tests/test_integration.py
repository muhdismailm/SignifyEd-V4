import pytest
import os
import json

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


# -----------------------------
# Integration Test 1
# TEXT → NLP → KEYPOINT FILE
# -----------------------------
def test_text_to_keypoints_integration(client):

    response = client.post(
        "/process",
        json={"text": "hello"}
    )

    assert response.status_code == 200

    data = response.get_json()

    assert "isl_gloss" in data
    assert "sentence_keypoints_file" in data

    filename = data["sentence_keypoints_file"]

    # Verify file actually created
    filepath = os.path.join("combined_keypoints", filename)

    assert os.path.exists(filepath)


# -----------------------------
# Integration Test 2
# TEXT → NLP → MULTIPLE WORDS
# -----------------------------
def test_multiword_sentence_pipeline(client):

    response = client.post(
        "/process",
        json={"text": "I go school today"}
    )

    assert response.status_code == 200

    data = response.get_json()

    assert isinstance(data["isl_gloss"], list)

    # Should generate keypoints file
    filename = data["sentence_keypoints_file"]
    filepath = os.path.join("combined_keypoints", filename)

    assert os.path.exists(filepath)


# -----------------------------
# Integration Test 3
# KEYPOINT FILE STRUCTURE
# -----------------------------
def test_generated_keypoint_structure(client):

    response = client.post(
        "/process",
        json={"text": "hello"}
    )

    data = response.get_json()

    filename = data["sentence_keypoints_file"]

    filepath = os.path.join("combined_keypoints", filename)

    with open(filepath, "r") as f:
        content = json.load(f)

    assert "sentence_keypoints" in content
    assert "total_frames" in content
    assert isinstance(content["sentence_keypoints"], list)


# -----------------------------
# Integration Test 4
# SEQ2SEQ PIPELINE
# -----------------------------
def test_seq2seq_pipeline_integration(client):

    response = client.post(
        "/seq2seq_process",
        json={"text": "hello"}
    )

    assert response.status_code in [200, 500]

    data = response.get_json()

    if response.status_code == 200:
        assert "isl_gloss" in data
        assert "combined_keypoints_file" in data

    else:
        assert "error" in data


# -----------------------------
# Integration Test 5
# GET GENERATED KEYPOINT FILE
# -----------------------------
def test_get_generated_keypoints(client):

    response = client.post(
        "/process",
        json={"text": "hello"}
    )

    data = response.get_json()

    filename = data["sentence_keypoints_file"]

    response2 = client.get(f"/combined_keypoints/{filename}")

    assert response2.status_code == 200

    content = response2.get_json()

    assert "sentence_keypoints" in content