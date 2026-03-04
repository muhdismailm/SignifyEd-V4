import cv2
import os

# ==============================
# SETTINGS
# ==============================

VIDEO_PATH = r"C:\Users\Ismail M\Desktop\Main project\SignifyEd\backend\alphabets.mp4"
OUTPUT_FOLDER = "raw_alphabets"



os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Your cleaned timestamps (seconds)
timestamps = {
    "A": (0, 3),
    "B": (3, 5),
    "C": (5, 7),
    "D": (7, 9),
    "E": (9, 12),
    "F": (18, 20),
    "G": (20, 22),
    "H": (22, 24),
    "I": (24, 27),
    "J": (30, 31),
    "K": (38, 39),
    "L": (39, 41),
    "M": (41, 44),
    "N": (44, 46),
    "O": (46, 48),
    "P": (48, 49),
    "Q": (49, 52),
    "R": (52, 54),
    "S": (54, 56),
    "T": (56, 58),
    "U": (58, 60),
    "V": (60, 62),
    "W": (62, 64),
    "X": (64, 66),
    "Y": (66, 69),
    "Z": (69, 72),
}

# ==============================
# LOAD VIDEO
# ==============================

cap = cv2.VideoCapture(VIDEO_PATH)

if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

fps = cap.get(cv2.CAP_PROP_FPS)
print("Video FPS:", fps)

# ==============================
# SPLIT LOGIC
# ==============================

for letter, (start_sec, end_sec) in timestamps.items():

    start_frame = int(start_sec * fps)
    end_frame = int(end_sec * fps)

    cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    output_path = os.path.join(OUTPUT_FOLDER, f"{letter}.mp4")

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    print(f"Processing {letter}...")

    for frame_no in range(start_frame, end_frame):
        ret, frame = cap.read()
        if not ret:
            break
        out.write(frame)

    out.release()

cap.release()

print("All alphabet videos created successfully.")