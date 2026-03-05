# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from werkzeug.utils import secure_filename
# import nltk
# from nltk.corpus import stopwords
# from nltk.stem import WordNetLemmatizer
# from nltk.corpus.reader.wordnet import NOUN, VERB, ADJ, ADV
# from seq2seq.inference import generate_gloss
# import csv
# import os
# import traceback
# import json
# import uuid
# from datetime import datetime

# # ------------------ INIT ------------------

# app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*"}})

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# print("FLASK RUNNING FROM:", BASE_DIR)

# # ------------------ SAFE NLTK DOWNLOADS ------------------

# def ensure_nltk():
#     resources = [
#         "corpora/stopwords",
#         "corpora/wordnet",
#         "tokenizers/punkt",
#         "taggers/averaged_perceptron_tagger"
#     ]

#     for resource in resources:
#         try:
#             nltk.data.find(resource)
#         except:
#             nltk.download(resource.split("/")[-1])

# ensure_nltk()

# # ------------------ FOLDERS ------------------

# UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "videos")
# GLOSS_FOLDER = os.path.join(BASE_DIR, "generated_gloss")

# KEYPOINT_SOURCE_FOLDER = os.path.join(BASE_DIR, "processed_keypoints")
# ALPHABET_KEYPOINT_FOLDER = os.path.join(BASE_DIR, "processed_alphabet_keypoints")

# COMBINED_KEYPOINT_FOLDER = os.path.join(BASE_DIR, "combined_keypoints")

# DATASET_FILE = os.path.join(BASE_DIR, "isl_dataset.csv")

# ALLOWED_EXTENSIONS = {"mp4", "avi", "mov", "mkv"}

# os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# os.makedirs(GLOSS_FOLDER, exist_ok=True)
# os.makedirs(COMBINED_KEYPOINT_FOLDER, exist_ok=True)
# os.makedirs(ALPHABET_KEYPOINT_FOLDER, exist_ok=True)

# app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# # ------------------ NLP SETUP ------------------

# lemmatizer = WordNetLemmatizer()
# stop_words = set(stopwords.words("english"))

# important_words = {"i", "me", "my", "not", "no", "never", "can", "will"}
# stop_words = stop_words - important_words

# # ------------------ ISL MAPPING ------------------

# isl_mapping = {
#     "i": "I",
#     "go": "GO",
#     "school": "SCHOOL",
#     "today": "TODAY",
#     "tomorrow": "TOMORROW",
#     "hello": "HELLO",
#     "you": "YOU"
# }

# # ------------------ HELPER FUNCTIONS ------------------

# def allowed_file(filename):
#     return "." in filename and \
#            filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# def save_to_dataset(input_text, isl_gloss):
#     file_exists = os.path.isfile(DATASET_FILE)

#     with open(DATASET_FILE, "a", newline="", encoding="utf-8") as f:
#         writer = csv.writer(f)

#         if not file_exists:
#             writer.writerow(["input_text", "isl_gloss"])

#         writer.writerow([input_text, " ".join(isl_gloss)])


# def save_gloss_to_file(original_text, isl_gloss):

#     file_id = str(uuid.uuid4())[:8]
#     timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

#     filename = f"gloss_{timestamp}_{file_id}.json"
#     file_path = os.path.join(GLOSS_FOLDER, filename)

#     data = {
#         "original_text": original_text,
#         "isl_gloss": isl_gloss,
#         "created_at": timestamp
#     }

#     with open(file_path, "w", encoding="utf-8") as f:
#         json.dump(data, f, indent=4)

#     return filename


# # ------------------ COMBINE SENTENCE KEYPOINTS ------------------


# def combine_sentence_keypoints(isl_gloss):
#     """
#     Combine keypoints into one animation.

#     Priority:
#     1️⃣ Use word animation from processed_keypoints
#     2️⃣ If word not found → fingerspell using processed_alphabet_keypoints
#     """

#     WORD_FOLDER = os.path.join(BASE_DIR, "processed_keypoints")
#     ALPHABET_FOLDER = os.path.join(BASE_DIR, "processed_alphabet_keypoints")
#     COMBINED_FOLDER = COMBINED_KEYPOINT_FOLDER

#     os.makedirs(COMBINED_FOLDER, exist_ok=True)

#     combined_keypoints = []
#     missing_glosses = []

#     current_frame_offset = 0
#     total_frames = 0

#     for gloss in isl_gloss:

#         word_path = os.path.join(WORD_FOLDER, f"{gloss.upper()}.json")

#         # ----------------------------------------------------
#         # 1️⃣ WORD EXISTS → USE WORD ANIMATION
#         # ----------------------------------------------------
#         if os.path.exists(word_path):

#             try:
#                 with open(word_path, "r", encoding="utf-8") as f:
#                     data = json.load(f)

#             except Exception as e:
#                 print("Error reading word:", gloss, e)
#                 missing_glosses.append(gloss)
#                 continue

#             word_frames = data.get("frames") or data.get("keypoints") or []

#         # ----------------------------------------------------
#         # 2️⃣ WORD NOT FOUND → FINGERSPELL
#         # ----------------------------------------------------
#         else:

#             print(f"⚠ Word '{gloss}' not found → using fingerspelling")

#             word_frames = []

#             for letter in gloss.upper():

#                 alphabet_path = os.path.join(
#                     ALPHABET_FOLDER,
#                     f"{letter}.json"
#                 )

#                 if not os.path.exists(alphabet_path):
#                     print(f"❌ Missing alphabet keypoints for '{letter}'")
#                     missing_glosses.append(letter)
#                     continue

#                 try:
#                     with open(alphabet_path, "r", encoding="utf-8") as f:
#                         letter_data = json.load(f)

#                 except Exception as e:
#                     print("Error reading alphabet:", letter, e)
#                     missing_glosses.append(letter)
#                     continue

#                 letter_frames = letter_data.get("frames") or []

#                 word_frames.extend(letter_frames)

#         # ----------------------------------------------------
#         # 3️⃣ APPEND TO FINAL TIMELINE
#         # ----------------------------------------------------
#         for i, frame_data in enumerate(word_frames):

#             if not isinstance(frame_data, dict):
#                 continue

#             adjusted_frame = frame_data.copy()
#             adjusted_frame["frame"] = current_frame_offset + i

#             combined_keypoints.append(adjusted_frame)

#         current_frame_offset += len(word_frames)
#         total_frames += len(word_frames)

#     # ----------------------------------------------------
#     # SAVE FINAL COMBINED ANIMATION
#     # ----------------------------------------------------
#     file_id = str(uuid.uuid4())[:8]
#     timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

#     filename = f"sentence_{timestamp}_{file_id}.json"
#     filepath = os.path.join(COMBINED_FOLDER, filename)

#     output_data = {
#         "gloss_sequence": isl_gloss,
#         "total_frames": total_frames,
#         "sentence_keypoints": combined_keypoints,
#         "missing_glosses": missing_glosses,
#         "created_at": timestamp
#     }

#     with open(filepath, "w", encoding="utf-8") as f:
#         json.dump(output_data, f, indent=4)

#     return filename, missing_glosses


# # ------------------ NLP PIPELINE ------------------

# def get_wordnet_pos(tag):

#     if tag.startswith("J"):
#         return ADJ
#     elif tag.startswith("V"):
#         return VERB
#     elif tag.startswith("N"):
#         return NOUN
#     elif tag.startswith("R"):
#         return ADV
#     else:
#         return NOUN


# def reorder_for_isl(lemmatized_tokens, pos_tags):

#     time_words, obj_words, verb_words = [], [], []

#     for i, (word, tag) in enumerate(pos_tags):

#         lemma = lemmatized_tokens[i]

#         if lemma.lower() in ["today", "tomorrow", "yesterday"]:
#             time_words.append(lemma)

#         elif tag.startswith("V"):
#             verb_words.append(lemma)

#         else:
#             obj_words.append(lemma)

#     negation = [w for w in obj_words if w == "not"]
#     obj_words = [w for w in obj_words if w != "not"]

#     return time_words + obj_words + verb_words + negation


# def process_text_pipeline(input_text):

#     input_text = input_text.lower()

#     tokens = nltk.word_tokenize(input_text)

#     filtered_tokens = [
#         w for w in tokens if w.isalpha() and w not in stop_words
#     ]

#     pos_tags = nltk.pos_tag(filtered_tokens)

#     lemmatized_tokens = [
#         lemmatizer.lemmatize(word, get_wordnet_pos(tag))
#         for word, tag in pos_tags
#     ]

#     isl_ordered_tokens = reorder_for_isl(lemmatized_tokens, pos_tags)

#     isl_gloss = [
#         isl_mapping.get(token.lower(), token.upper())
#         for token in isl_ordered_tokens
#     ]

#     return {
#         "original": input_text,
#         "processed_tokens": lemmatized_tokens,
#         "isl_gloss": isl_gloss
#     }

# # ------------------ ROUTES ------------------

# @app.route("/")
# def home():
#     return "Signify Backend Running Successfully"


# # ---------------- RULE BASED ----------------

# @app.route("/process", methods=["POST"])
# def process_text():

#     try:

#         data = request.get_json(silent=True)

#         if not data or "text" not in data:
#             return jsonify({"error": "Text field missing"}), 400

#         input_text = data.get("text", "").strip()

#         if not input_text:
#             return jsonify({"error": "Empty input text"}), 400

#         result = process_text_pipeline(input_text)

#         combined_file, missing = combine_sentence_keypoints(result["isl_gloss"])

#         return jsonify({
#             **result,
#             "sentence_keypoints_file": combined_file,
#             "combined_keypoints_url": f"http://localhost:5000/combined_keypoints/{combined_file}",
#             "missing_glosses": missing
#         })

#     except Exception as e:
#         traceback.print_exc()
#         return jsonify({"error": str(e)}), 500


# # ---------------- SEQ2SEQ ----------------

# @app.route("/seq2seq_process", methods=["POST"])
# def seq2seq_process():

#     try:

#         data = request.get_json(silent=True)

#         if not data or "text" not in data:
#             return jsonify({"error": "Text field missing"}), 400

#         input_text = data.get("text", "").strip()

#         gloss = generate_gloss(input_text)

#         gloss_file = save_gloss_to_file(input_text, gloss)

#         combined_file, missing = combine_sentence_keypoints(gloss)

#         return jsonify({
#             "original": input_text,
#             "isl_gloss": gloss,
#             "gloss_file": gloss_file,
#             "combined_keypoints_file": combined_file,
#             "missing_glosses": missing,
#             "combined_keypoints_url": f"http://localhost:5000/combined_keypoints/{combined_file}",
#             "model": "seq2seq_lstm"
#         })

#     except Exception as e:
#         traceback.print_exc()
#         return jsonify({"error": str(e)}), 500


# # ---------------- GET COMBINED KEYPOINTS ----------------

# @app.route("/combined_keypoints/<filename>")
# def get_combined_keypoints(filename):

#     try:

#         file_path = os.path.join(COMBINED_KEYPOINT_FOLDER, filename)

#         if not os.path.exists(file_path):
#             return jsonify({"error": "File not found"}), 404

#         with open(file_path, "r", encoding="utf-8") as f:
#             data = json.load(f)

#         return jsonify(data)

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# # ---------------- MAIN ----------------

# if __name__ == "__main__":
#     app.run(debug=True, host="0.0.0.0", port=5000)




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
ALPHABET_KEYPOINT_FOLDER = os.path.join(BASE_DIR, "processed_alphabet_keypoints")

COMBINED_KEYPOINT_FOLDER = os.path.join(BASE_DIR, "combined_keypoints")

DATASET_FILE = os.path.join(BASE_DIR, "isl_dataset.csv")

ALLOWED_EXTENSIONS = {"mp4", "avi", "mov", "mkv"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(GLOSS_FOLDER, exist_ok=True)
os.makedirs(COMBINED_KEYPOINT_FOLDER, exist_ok=True)
os.makedirs(ALPHABET_KEYPOINT_FOLDER, exist_ok=True)

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


# ------------------ COMBINE SENTENCE KEYPOINTS ------------------


def combine_sentence_keypoints(isl_gloss):
    """
    Combine keypoints into one animation.

    Priority:
    1️⃣ Use word animation from processed_keypoints
    2️⃣ If word not found → fingerspell using processed_alphabet_keypoints
    """

    WORD_FOLDER = os.path.join(BASE_DIR, "processed_keypoints")
    ALPHABET_FOLDER = os.path.join(BASE_DIR, "processed_alphabet_keypoints")
    COMBINED_FOLDER = COMBINED_KEYPOINT_FOLDER

    os.makedirs(COMBINED_FOLDER, exist_ok=True)

    combined_keypoints = []
    missing_glosses = []

    current_frame_offset = 0
    total_frames = 0

    for gloss in isl_gloss:

        word_path = os.path.join(WORD_FOLDER, f"{gloss.upper()}.json")

        # ----------------------------------------------------
        # 1️⃣ WORD EXISTS → USE WORD ANIMATION
        # ----------------------------------------------------
        if os.path.exists(word_path):

            try:
                with open(word_path, "r", encoding="utf-8") as f:
                    data = json.load(f)

            except Exception as e:
                print("Error reading word:", gloss, e)
                missing_glosses.append(gloss)
                continue

            word_frames = data.get("frames") or data.get("keypoints") or []

        # ----------------------------------------------------
        # 2️⃣ WORD NOT FOUND → FINGERSPELL
        # ----------------------------------------------------
        else:

            print(f"⚠ Word '{gloss}' not found → using fingerspelling")

            word_frames = []

            for letter in gloss.upper():

                alphabet_path = os.path.join(
                    ALPHABET_FOLDER,
                    f"{letter}.json"
                )

                if not os.path.exists(alphabet_path):
                    print(f"❌ Missing alphabet keypoints for '{letter}'")
                    missing_glosses.append(letter)
                    continue

                try:
                    with open(alphabet_path, "r", encoding="utf-8") as f:
                        letter_data = json.load(f)

                except Exception as e:
                    print("Error reading alphabet:", letter, e)
                    missing_glosses.append(letter)
                    continue

                letter_frames = letter_data.get("frames") or []

                word_frames.extend(letter_frames)

        # ----------------------------------------------------
        # 3️⃣ APPEND TO FINAL TIMELINE
        # ----------------------------------------------------
        for i, frame_data in enumerate(word_frames):

            if not isinstance(frame_data, dict):
                continue

            adjusted_frame = frame_data.copy()
            adjusted_frame["frame"] = current_frame_offset + i

            combined_keypoints.append(adjusted_frame)

        current_frame_offset += len(word_frames)
        total_frames += len(word_frames)

    # ----------------------------------------------------
    # SAVE FINAL COMBINED ANIMATION
    # ----------------------------------------------------
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


# ------------------ VIDEO KEYPOINT EXTRACTION ------------------

def extract_keypoints_from_video(video_path):
    """
    Extract pose + hand keypoints from every frame of a video using MediaPipe.
    Returns a list of frame dicts compatible with sentence_keypoints format.
    """
    import cv2
    import mediapipe as mp

    mp_holistic = mp.solutions.holistic

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")

    frames = []

    with mp_holistic.Holistic(
        static_image_mode=False,
        model_complexity=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as holistic:

        frame_idx = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # MediaPipe expects RGB
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = holistic.process(rgb)

            frame_data = {"frame": frame_idx}

            # ── Pose (world landmarks) ──────────────────────
            if results.pose_world_landmarks:
                frame_data["pose"] = [
                    [lm.x, lm.y, lm.z]
                    for lm in results.pose_world_landmarks.landmark
                ]
            else:
                frame_data["pose"] = None

            # ── Left hand (world landmarks) ─────────────────
            if results.left_hand_landmarks:
                frame_data["left_hand"] = [
                    [lm.x, lm.y, lm.z]
                    for lm in results.left_hand_landmarks.landmark
                ]
            else:
                frame_data["left_hand"] = None

            # ── Right hand (world landmarks) ────────────────
            if results.right_hand_landmarks:
                frame_data["right_hand"] = [
                    [lm.x, lm.y, lm.z]
                    for lm in results.right_hand_landmarks.landmark
                ]
            else:
                frame_data["right_hand"] = None

            frames.append(frame_data)
            frame_idx += 1

    cap.release()
    return frames


def transcribe_video(video_path):
    """
    Attempt to transcribe speech from the video using SpeechRecognition + ffmpeg.
    Returns transcript string or empty string if transcription fails.
    """
    try:
        import speech_recognition as sr
        import subprocess
        import tempfile

        # Extract audio from video to a temp wav file
        tmp_audio = tempfile.mktemp(suffix=".wav")
        subprocess.run(
            ["ffmpeg", "-y", "-i", video_path, "-ar", "16000", "-ac", "1", tmp_audio],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True
        )

        recognizer = sr.Recognizer()
        with sr.AudioFile(tmp_audio) as source:
            audio = recognizer.record(source)

        transcript = recognizer.recognize_google(audio)
        os.remove(tmp_audio)
        return transcript

    except Exception as e:
        print(f"Transcription failed (non-fatal): {e}")
        return ""


# ------------------ NLP PIPELINE ------------------

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

# ------------------ ROUTES ------------------

@app.route("/")
def home():
    return "Signify Backend Running Successfully"


# ---------------- RULE BASED ----------------

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


# ---------------- SEQ2SEQ ----------------

@app.route("/seq2seq_process", methods=["POST"])
def seq2seq_process():

    try:

        data = request.get_json(silent=True)

        if not data or "text" not in data:
            return jsonify({"error": "Text field missing"}), 400

        input_text = data.get("text", "").strip()

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


# ---------------- VIDEO UPLOAD ----------------

@app.route("/upload_video", methods=["POST"])
def upload_video():
    """
    Accepts a video file, extracts MediaPipe keypoints from every frame,
    optionally transcribes speech, runs NLP → ISL gloss, and returns
    a combined_keypoints_url just like /process does.
    """
    try:

        # ── 1. Validate file ────────────────────────────────
        if "video" not in request.files:
            return jsonify({"error": "No video file provided"}), 400

        file = request.files["video"]

        if file.filename == "":
            return jsonify({"error": "Empty filename"}), 400

        if not allowed_file(file.filename):
            return jsonify({
                "error": f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            }), 400

        # ── 2. Save uploaded video ──────────────────────────
        filename  = secure_filename(file.filename)
        unique_id = str(uuid.uuid4())[:8]
        saved_name = f"{unique_id}_{filename}"
        video_path = os.path.join(UPLOAD_FOLDER, saved_name)
        file.save(video_path)
        print(f"Video saved: {video_path}")

        # ── 3. Extract keypoints frame-by-frame ─────────────
        print("Extracting keypoints...")
        frames = extract_keypoints_from_video(video_path)
        print(f"Extracted {len(frames)} frames")

        # ── 4. Save raw keypoints as a combined file ─────────
        timestamp  = datetime.now().strftime("%Y%m%d_%H%M%S")
        kp_filename = f"video_{timestamp}_{unique_id}.json"
        kp_filepath = os.path.join(COMBINED_KEYPOINT_FOLDER, kp_filename)

        output_data = {
            "source": "video_upload",
            "video_file": saved_name,
            "total_frames": len(frames),
            "sentence_keypoints": frames,
            "created_at": timestamp
        }

        with open(kp_filepath, "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=2)

        # ── 5. Attempt speech transcription (non-fatal) ──────
        transcript  = transcribe_video(video_path)
        isl_gloss   = []
        missing     = []

        if transcript:
            print(f"Transcript: {transcript}")
            nlp_result = process_text_pipeline(transcript)
            isl_gloss  = nlp_result.get("isl_gloss", [])
        else:
            print("No transcript — skipping NLP gloss")

        # ── 6. Return response ───────────────────────────────
        return jsonify({
            "transcript": transcript or "(no speech detected)",
            "isl_gloss": isl_gloss,
            "missing_glosses": missing,
            "total_frames": len(frames),
            "combined_keypoints_url": f"http://localhost:5000/combined_keypoints/{kp_filename}",
            "sentence_keypoints_file": kp_filename
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ---------------- GET COMBINED KEYPOINTS ----------------

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


# ---------------- MAIN ----------------

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)