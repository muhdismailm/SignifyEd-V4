import io
import json
import pytest
from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


# ------------------------------
# Test root route
# ------------------------------

def test_home_route(client):
    response = client.get("/")
    assert response.status_code == 200
    assert b"Signify Backend Running Successfully" in response.data


# ------------------------------
# Test /process route
# ------------------------------

def test_process_valid_input(client):

    response = client.post(
        "/process",
        json={"text": "hello"}
    )

    assert response.status_code == 200

    data = response.get_json()

    assert "isl_gloss" in data
    assert "sentence_keypoints_file" in data
    assert isinstance(data["isl_gloss"], list)


def test_process_missing_text(client):

    response = client.post(
        "/process",
        json={}
    )

    assert response.status_code == 400

    data = response.get_json()

    assert "error" in data


def test_process_empty_text(client):

    response = client.post(
        "/process",
        json={"text": ""}
    )

    assert response.status_code == 400

    data = response.get_json()

    assert data["error"] == "Empty input text"


# ------------------------------
# Test /seq2seq_process
# ------------------------------

def test_seq2seq_valid_input(client):

    response = client.post(
        "/seq2seq_process",
        json={"text": "hello"}
    )

    # Either success (model available) or failure (model missing)
    assert response.status_code in [200, 500]

    data = response.get_json()

    if response.status_code == 200:
        # Successful inference
        assert "isl_gloss" in data
        assert "combined_keypoints_file" in data
        assert data["model"] == "seq2seq_lstm"

    else:
        # Model missing → endpoint returns error
        assert "error" in data
        
def test_seq2seq_missing_text(client):

    response = client.post(
        "/seq2seq_process",
        json={}
    )

    assert response.status_code == 400

    data = response.get_json()

    assert "error" in data


# ------------------------------
# Test /upload_video
# ------------------------------

def test_upload_video_no_file(client):

    response = client.post("/upload_video")

    assert response.status_code == 400

    data = response.get_json()

    assert "error" in data


def test_upload_video_invalid_file(client):

    data = {
        "video": (io.BytesIO(b"fake data"), "test.txt")
    }

    response = client.post(
        "/upload_video",
        data=data,
        content_type="multipart/form-data"
    )

    assert response.status_code == 400

    json_data = response.get_json()

    assert "Unsupported file type" in json_data["error"]


# ------------------------------
# Test /combined_keypoints
# ------------------------------

def test_combined_keypoints_not_found(client):

    response = client.get("/combined_keypoints/nonexistent.json")

    assert response.status_code == 404

    data = response.get_json()

    assert data["error"] == "File not found"