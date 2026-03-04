import json
import os
import numpy as np

OUTPUT_FOLDER = "alphabets"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

FPS = 30
FRAMES_PER_LETTER = 15

# -----------------------------------
# Utility: create finger direction
# -----------------------------------

def finger_vec(curl):
    """
    curl: 0 (extended) → 1 (half) → 2 (folded)
    Returns normalized direction vector.
    """
    if curl == 0:
        return [0, 1, 0]      # straight up
    elif curl == 1:
        return [0.3, 0.7, -0.4]
    else:
        return [0.5, 0.3, -0.8]

# -----------------------------------
# Define alphabet curl patterns
# Format: [thumb, index, middle, ring, pinky]
# 0 = extended, 1 = half, 2 = folded
# -----------------------------------

ALPHABET_PATTERNS = {
    "A": [2,2,2,2,2],
    "B": [2,0,0,0,0],
    "C": [1,1,1,1,1],
    "D": [2,0,2,2,2],
    "E": [2,2,2,2,2],
    "F": [0,0,2,2,2],
    "G": [0,0,2,2,2],
    "H": [2,0,0,2,2],
    "I": [2,2,2,2,0],
    "J": [2,2,2,2,0],
    "K": [0,0,1,2,2],
    "L": [0,0,2,2,2],
    "M": [2,2,2,2,2],
    "N": [2,2,2,2,2],
    "O": [1,1,1,1,1],
    "P": [0,0,1,2,2],
    "Q": [0,0,2,2,2],
    "R": [2,0,0,2,2],
    "S": [2,2,2,2,2],
    "T": [2,2,2,2,2],
    "U": [2,0,0,2,2],
    "V": [2,0,0,2,2],
    "W": [2,0,0,0,2],
    "X": [2,1,2,2,2],
    "Y": [0,2,2,2,0],
    "Z": [2,0,2,2,2],
}

# -----------------------------------
# Bone naming (Right hand dominant)
# -----------------------------------

def build_bones(pattern):

    thumb, index, middle, ring, pinky = pattern

    bones = {
        "RightHand": [0,1,0],

        "RightHandThumb1": finger_vec(thumb),
        "RightHandThumb2": finger_vec(thumb),
        "RightHandThumb3": finger_vec(thumb),

        "RightHandIndex1": finger_vec(index),
        "RightHandIndex2": finger_vec(index),
        "RightHandIndex3": finger_vec(index),

        "RightHandMiddle1": finger_vec(middle),
        "RightHandMiddle2": finger_vec(middle),
        "RightHandMiddle3": finger_vec(middle),

        "RightHandRing1": finger_vec(ring),
        "RightHandRing2": finger_vec(ring),
        "RightHandRing3": finger_vec(ring),

        "RightHandPinky1": finger_vec(pinky),
        "RightHandPinky2": finger_vec(pinky),
        "RightHandPinky3": finger_vec(pinky),
    }

    return bones

# -----------------------------------
# Generate files
# -----------------------------------

for letter, pattern in ALPHABET_PATTERNS.items():

    frames = []

    bones = build_bones(pattern)

    for i in range(FRAMES_PER_LETTER):
        frames.append({
            "frame": i,
            "bones": bones
        })

    data = {
        "fps": FPS,
        "frames": frames
    }

    with open(os.path.join(OUTPUT_FOLDER, f"{letter}.json"), "w") as f:
        json.dump(data, f, indent=2)

print("✅ Alphabet keypoints generated successfully.")