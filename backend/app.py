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

# ------------------ INIT ------------------

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
print("FLASK RUNNING FROM:", BASE_DIR)

# ------------------ SAFE NLTK DOWNLOADS ------------------

def ensure_nltk():
    try:
        nltk.data.find("corpora/stopwords")
    except:
        nltk.download("stopwords")

    try:
        nltk.data.find("corpora/wordnet")
    except:
        nltk.download("wordnet")

    try:
        nltk.data.find("tokenizers/punkt")
    except:
        nltk.download("punkt")

    try:
        nltk.data.find("taggers/averaged_perceptron_tagger")
    except:
        nltk.download("averaged_perceptron_tagger")

ensure_nltk()

# ------------------ UPLOAD CONFIG ------------------

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "videos")
ALLOWED_EXTENSIONS = {"mp4", "avi", "mov", "mkv"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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
    "tommorow": "TOMMOROW",
    "hello": "HELLO",
    "you": "YOU"
}

DATASET_FILE = os.path.join(BASE_DIR, "isl_dataset.csv")

# ------------------ HELPERS ------------------

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

        if lemma.lower() in ["today", "tommorow", "yesterday"]:
            time_words.append(lemma)
        elif tag.startswith("V"):
            verb_words.append(lemma)
        else:
            obj_words.append(lemma)

    negation = [w for w in obj_words if w == "not"]
    obj_words = [w for w in obj_words if w != "not"]

    return time_words + obj_words + verb_words + negation


# ------------------ RULE-BASED NLP PIPELINE ------------------

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

# ------------------ ROUTES ------------------

@app.route("/")
def home():
    return "SignifyEd Backend Running Successfully"


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
        save_to_dataset(input_text, result["isl_gloss"])

        return jsonify(result)

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

        return jsonify({
            "original": input_text,
            "isl_gloss": gloss,
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

        return jsonify({
            "transcript": transcript,
            "processed_tokens": result["processed_tokens"],
            "isl_gloss": result["isl_gloss"],
            "model": "rule_based"
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# -------- TOKEN → GLOSS --------

@app.route("/to_gloss", methods=["POST"])
def to_gloss():
    try:
        data = request.get_json(silent=True)

        if not data or "tokens" not in data:
            return jsonify({"error": "Tokens missing"}), 400

        tokens = data.get("tokens", [])

        gloss = [
            isl_mapping.get(token.lower(), token.upper())
            for token in tokens
        ]

        return jsonify({
            "tokens": tokens,
            "gloss": gloss
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ------------------ MAIN ------------------

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)