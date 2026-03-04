from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.corpus.reader.wordnet import NOUN, VERB, ADJ, ADV
from seq2seq.inference import generate_gloss
import csv
import os
import traceback
import json
import uuid
from datetime import datetime

# ------------------ INIT ------------------

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
print("FLASK RUNNING FROM:", BASE_DIR)

# ------------------ SAFE NLTK DOWNLOADS ------------------

def ensure_nltk():
    resources = [
        "corpora/stopwords",
        "corpora/wordnet",
        "tokenizers/punkt",
        "taggers/averaged_perceptron_tagger"
    ]

    for resource in resources:
        try:
            nltk.data.find(resource)
        except:
            nltk.download(resource.split("/")[-1])

ensure_nltk()

# ------------------ FOLDERS ------------------

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "videos")
GLOSS_FOLDER = os.path.join(BASE_DIR, "generated_gloss")
KEYPOINT_SOURCE_FOLDER = os.path.join(BASE_DIR, "processed_keypoints")
COMBINED_KEYPOINT_FOLDER = os.path.join(BASE_DIR, "combined_keypoints")
DATASET_FILE = os.path.join(BASE_DIR, "isl_dataset.csv")

ALLOWED_EXTENSIONS = {"mp4", "avi", "mov", "mkv"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(GLOSS_FOLDER, exist_ok=True)
os.makedirs(COMBINED_KEYPOINT_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# ------------------ NLP SETUP ------------------

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words("english"))

important_words = {"i", "me", "my", "not", "no", "never", "can", "will"}
stop_words = stop_words - important_words

# ------------------ ISL MAPPING ------------------

isl_mapping = {
    "i": "I",
    "go": "GO",
    "school": "SCHOOL",
    "today": "TODAY",
    "tomorrow": "TOMORROW",
    "hello": "HELLO",
    "you": "YOU"
}

# ------------------ HELPER FUNCTIONS ------------------

def allowed_file(filename):
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def save_to_dataset(input_text, isl_gloss):
    file_exists = os.path.isfile(DATASET_FILE)
    with open(DATASET_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["input_text", "isl_gloss"])
        writer.writerow([input_text, " ".join(isl_gloss)])


def save_gloss_to_file(original_text, isl_gloss):
    file_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    filename = f"gloss_{timestamp}_{file_id}.json"
    file_path = os.path.join(GLOSS_FOLDER, filename)

    data = {
        "original_text": original_text,
        "isl_gloss": isl_gloss,
        "created_at": timestamp
    }

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    return filename

def combine_sentence_keypoints(isl_gloss):
    """
    Combine keypoints from:
    processed_keypoints/GLOSS_NAME.json
    into one continuous animation file.
    """

    KEYPOINT_SOURCE_FOLDER = os.path.join(BASE_DIR, "processed_keypoints")
    COMBINED_FOLDER = COMBINED_KEYPOINT_FOLDER

    os.makedirs(COMBINED_FOLDER, exist_ok=True)

    combined_keypoints = []
    missing_glosses = []

    current_frame_offset = 0
    total_frames = 0

    for gloss in isl_gloss:

        json_path = os.path.join(
            KEYPOINT_SOURCE_FOLDER,
            f"{gloss.upper()}.json"
        )

        if not os.path.exists(json_path):
            missing_glosses.append(gloss)
            continue

        try:
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            print(f"Error reading {json_path}: {e}")
            missing_glosses.append(gloss)
            continue

        # Handle both JSON formats safely
        if isinstance(data, list):
            word_keypoints = data
        elif isinstance(data, dict):
            word_keypoints = (
                data.get("keypoints") or
                data.get("frames") or
                []
            )
        else:
            word_keypoints = []

        if not word_keypoints:
            missing_glosses.append(gloss)
            continue

        word_total_frames = len(word_keypoints)

        # Maintain continuous timeline
        for i, frame_data in enumerate(word_keypoints):

            if not isinstance(frame_data, dict):
                continue

            adjusted_frame = frame_data.copy()
            adjusted_frame["frame"] = current_frame_offset + i

            combined_keypoints.append(adjusted_frame)

        current_frame_offset += word_total_frames
        total_frames += word_total_frames

    # Generate output file
    file_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    filename = f"sentence_{timestamp}_{file_id}.json"
    filepath = os.path.join(COMBINED_FOLDER, filename)

    output_data = {
        "gloss_sequence": isl_gloss,
        "total_frames": total_frames,
        "sentence_keypoints": combined_keypoints,
        "missing_glosses": missing_glosses,
        "created_at": timestamp
    }

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=4)

    return filename, missing_glosses




def get_wordnet_pos(tag):
    if tag.startswith("J"):
        return ADJ
    elif tag.startswith("V"):
        return VERB
    elif tag.startswith("N"):
        return NOUN
    elif tag.startswith("R"):
        return ADV
    else:
        return NOUN


def reorder_for_isl(lemmatized_tokens, pos_tags):
    """
    ISL Grammar Rule:
    Time → Object → Verb (+ Negation at end)
    """
    time_words, obj_words, verb_words = [], [], []

    for i, (word, tag) in enumerate(pos_tags):
        lemma = lemmatized_tokens[i]

        if lemma.lower() in ["today", "tomorrow", "yesterday"]:
            time_words.append(lemma)
        elif tag.startswith("V"):
            verb_words.append(lemma)
        else:
            obj_words.append(lemma)

    negation = [w for w in obj_words if w == "not"]
    obj_words = [w for w in obj_words if w != "not"]

    return time_words + obj_words + verb_words + negation

def process_text_pipeline(input_text):
    input_text = input_text.lower()
    tokens = nltk.word_tokenize(input_text)

    filtered_tokens = [
        w for w in tokens if w.isalpha() and w not in stop_words
    ]

    pos_tags = nltk.pos_tag(filtered_tokens)

    lemmatized_tokens = [
        lemmatizer.lemmatize(word, get_wordnet_pos(tag))
        for word, tag in pos_tags
    ]

    isl_ordered_tokens = reorder_for_isl(lemmatized_tokens, pos_tags)

    isl_gloss = [
        isl_mapping.get(token.lower(), token.upper())
        for token in isl_ordered_tokens
    ]

    return {
        "original": input_text,
        "processed_tokens": lemmatized_tokens,
        "isl_gloss": isl_gloss
    }
# ------------------ COMBINE SENTENCE KEYPOINTS ------------------

# def combine_sentence_keypoints(isl_gloss):
#     """
#     Combine keypoints from:
#     processed_keypoints/GLOSS_NAME/*.json
#     into one sentence-level keypoints file
#     """

#     KEYPOINT_SOURCE_FOLDER = os.path.join(BASE_DIR, "processed_keypoints")
#     COMBINED_FOLDER = os.path.join(BASE_DIR, "combined_sentence_keypoints")

#     os.makedirs(COMBINED_FOLDER, exist_ok=True)

#     combined_keypoints = []
#     missing_glosses = []

#     for gloss in isl_gloss:

#         gloss_folder = os.path.join(KEYPOINT_SOURCE_FOLDER, gloss.upper())

#         if not os.path.exists(gloss_folder):
#             missing_glosses.append(gloss)
#             continue

#         json_files = [
#             f for f in os.listdir(gloss_folder)
#             if f.endswith(".json")
#         ]

#         if not json_files:
#             missing_glosses.append(gloss)
#             continue

#         json_path = os.path.join(gloss_folder, json_files[0])

#         with open(json_path, "r", encoding="utf-8") as f:
#             data = json.load(f)

#             word_keypoints = (
#                 data.get("keypoints") or
#                 data.get("frames") or
#                 []
#             )

#             combined_keypoints.extend(word_keypoints)

#     # Save combined sentence file
#     file_id = str(uuid.uuid4())[:8]
#     timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

#     filename = f"sentence_{timestamp}_{file_id}.json"
#     filepath = os.path.join(COMBINED_FOLDER, filename)

#     output_data = {
#         "gloss_sequence": isl_gloss,
#         "total_frames": len(combined_keypoints),
#         "sentence_keypoints": combined_keypoints,
#         "missing_glosses": missing_glosses,
#         "created_at": timestamp
#     }

#     with open(filepath, "w", encoding="utf-8") as f:
#         json.dump(output_data, f, indent=4)

#     return filename, missing_glosses
# ------------------ ROUTES ------------------

@app.route("/")
def home():
    return "Signify Backend Running Successfully"


# -------- RULE-BASED TEXT → ISL --------

@app.route("/process", methods=["POST"])
def process_text():
    try:
        data = request.get_json(silent=True)

        if not data or "text" not in data:
            return jsonify({"error": "Text field missing"}), 400

        input_text = data.get("text", "").strip()

        if not input_text:
            return jsonify({"error": "Empty input text"}), 400

        result = process_text_pipeline(input_text)

        # Combine keypoints for avatar animation
        combined_file, missing = combine_sentence_keypoints(result["isl_gloss"])

        return jsonify({
            **result,
            "sentence_keypoints_file": combined_file,
            "combined_keypoints_url": f"http://localhost:5000/combined_keypoints/{combined_file}",
            "missing_glosses": missing
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# -------- SEQ2SEQ TEXT → ISL --------

@app.route("/seq2seq_process", methods=["POST"])
def seq2seq_process():
    try:
        data = request.get_json(silent=True)

        if not data or "text" not in data:
            return jsonify({"error": "Text field missing"}), 400

        input_text = data.get("text", "").strip()

        if not input_text:
            return jsonify({"error": "Empty input text"}), 400

        gloss = generate_gloss(input_text)

        gloss_file = save_gloss_to_file(input_text, gloss)
        combined_file, missing = combine_sentence_keypoints(gloss)

        return jsonify({
            "original": input_text,
            "isl_gloss": gloss,
            "gloss_file": gloss_file,
            "combined_keypoints_file": combined_file,
            "missing_glosses": missing,
            "combined_keypoints_url": f"http://localhost:5000/combined_keypoints/{combined_file}",
            "model": "seq2seq_lstm"
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# -------- VIDEO → AUDIO → TEXT → ISL --------

@app.route("/upload_video", methods=["POST"])
def upload_video():
    try:
        if "video" not in request.files:
            return jsonify({"error": "No video file provided"}), 400

        file = request.files["video"]

        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400

        filename = secure_filename(file.filename)
        video_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(video_path)

        from video_utils import has_audio, extract_audio
        from asr_utils import audio_to_text

        if not has_audio(video_path):
            return jsonify({"error": "Uploaded video does not contain audio."}), 400

        audio_path = extract_audio(video_path)
        transcript = audio_to_text(audio_path)

        if not transcript or not transcript.strip():
            return jsonify({"error": "Speech recognition failed."}), 400

        result = process_text_pipeline(transcript)

        gloss_file = save_gloss_to_file(transcript, result["isl_gloss"])
        combined_file, missing = combine_sentence_keypoints(result["isl_gloss"])
        return jsonify({
            "transcript": transcript,
            "isl_gloss": result["isl_gloss"],
            "gloss_file": gloss_file,
            "combined_keypoints_file": combined_file,
            "missing_glosses": missing,
            "combined_keypoints_url": f"http://localhost:5000/combined_keypoints/{combined_file}",
            "model": "video_rule_based"
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    

@app.route("/combined_keypoints/<filename>")
def get_combined_keypoints(filename):
    try:
        file_path = os.path.join(COMBINED_KEYPOINT_FOLDER, filename)

        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------ MAIN ------------------

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)