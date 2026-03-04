# import os
# import cv2
# import json
# import numpy as np
# import mediapipe as mp


# # ======================================================
# # FOLDERS
# # ======================================================

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# RAW_FOLDER = os.path.join(BASE_DIR, "raw_alphabets")
# OUTPUT_FOLDER = os.path.join(BASE_DIR, "processed_alphabet_keypoints", "alphabets")

# os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# # ======================================================
# # MEDIAPIPE SETUP
# # ======================================================

# mp_hands = mp.solutions.hands
# hands = mp_hands.Hands(
#     static_image_mode=False,
#     max_num_hands=1,
#     min_detection_confidence=0.7,
#     min_tracking_confidence=0.7
# )

# # ======================================================
# # HELPER FUNCTIONS
# # ======================================================

# def normalize(vec):
#     norm = np.linalg.norm(vec)
#     if norm == 0:
#         return [0, 0, 0]
#     return (vec / norm).tolist()

# def extract_bones(landmarks):

#     lm = np.array([[p.x, p.y, p.z] for p in landmarks])

#     bones = {}

#     # Wrist
#     wrist = lm[0]

#     # Thumb
#     bones["RightHandThumb1"] = normalize(lm[1] - wrist)
#     bones["RightHandThumb2"] = normalize(lm[2] - lm[1])
#     bones["RightHandThumb3"] = normalize(lm[3] - lm[2])

#     # Index
#     bones["RightHandIndex1"] = normalize(lm[5] - wrist)
#     bones["RightHandIndex2"] = normalize(lm[6] - lm[5])
#     bones["RightHandIndex3"] = normalize(lm[7] - lm[6])

#     # Middle
#     bones["RightHandMiddle1"] = normalize(lm[9] - wrist)
#     bones["RightHandMiddle2"] = normalize(lm[10] - lm[9])
#     bones["RightHandMiddle3"] = normalize(lm[11] - lm[10])

#     # Ring
#     bones["RightHandRing1"] = normalize(lm[13] - wrist)
#     bones["RightHandRing2"] = normalize(lm[14] - lm[13])
#     bones["RightHandRing3"] = normalize(lm[15] - lm[14])

#     # Pinky
#     bones["RightHandPinky1"] = normalize(lm[17] - wrist)
#     bones["RightHandPinky2"] = normalize(lm[18] - lm[17])
#     bones["RightHandPinky3"] = normalize(lm[19] - lm[18])

#     # Minimal arm placeholders (for compatibility)
#     bones["RightArm"] = [0, 1, 0]
#     bones["RightForeArm"] = [0, 1, 0]
#     bones["RightHand"] = [0, 1, 0]

#     # Fill left side with neutral (if avatar expects both)
#     for key in [
#         "LeftArm","LeftForeArm","LeftHand",
#         "LeftHandThumb1","LeftHandThumb2","LeftHandThumb3",
#         "LeftHandIndex1","LeftHandIndex2","LeftHandIndex3",
#         "LeftHandMiddle1","LeftHandMiddle2","LeftHandMiddle3",
#         "LeftHandRing1","LeftHandRing2","LeftHandRing3",
#         "LeftHandPinky1","LeftHandPinky2","LeftHandPinky3"
#     ]:
#         bones[key] = [0, 1, 0]

#     return bones

# # ======================================================
# # PROCESS EACH VIDEO
# # ======================================================

# for file in os.listdir(RAW_FOLDER):

#     if not file.endswith(".mp4"):
#         continue

#     letter = file.split(".")[0].upper()
#     video_path = os.path.join(RAW_FOLDER, file)

#     print(f"Processing {letter}...")

#     cap = cv2.VideoCapture(video_path)

#     fps = cap.get(cv2.CAP_PROP_FPS)
#     frames_data = []
#     frame_index = 0

#     while True:
#         ret, frame = cap.read()
#         if not ret:
#             break

#         image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         results = hands.process(image)

#         if results.multi_hand_landmarks:
#             hand_landmarks = results.multi_hand_landmarks[0]
#             bones = extract_bones(hand_landmarks.landmark)

#             frames_data.append({
#                 "frame": frame_index,
#                 "bones": bones
#             })

#             frame_index += 1

#     cap.release()

#     output_json = {
#         "fps": fps,
#         "frames": frames_data
#     }

#     output_path = os.path.join(OUTPUT_FOLDER, f"{letter}.json")

#     with open(output_path, "w") as f:
#         json.dump(output_json, f, indent=2)

#     print(f"Saved {letter}.json")

# print("All alphabet keypoints generated successfully.")


import cv2
import mediapipe as mp
import json
import os

# =============================
# CONFIG
# =============================

VIDEO_FOLDER = "raw_alphabets"   # contains A.mp4, B.mp4...
OUTPUT_FOLDER = "processed_alphabet_keypoints"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# =============================
# MEDIAPIPE SETUP
# =============================

mp_hands = mp.solutions.hands
mp_pose = mp.solutions.pose

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

pose = mp_pose.Pose()

# =============================
# PROCESS EACH VIDEO
# =============================

for file in os.listdir(VIDEO_FOLDER):

    if not file.endswith(".mp4"):
        continue

    video_path = os.path.join(VIDEO_FOLDER, file)
    cap = cv2.VideoCapture(video_path)

    fps = cap.get(cv2.CAP_PROP_FPS)
    frames_data = []
    frame_count = 0

    print(f"Processing {file}...")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        hand_results = hands.process(rgb)
        pose_results = pose.process(rgb)

        # --- Extract Right / Left Hand ---
        left_hand_landmarks = None
        right_hand_landmarks = None

        if hand_results.multi_hand_landmarks:
            for idx, hand_landmarks in enumerate(hand_results.multi_hand_landmarks):

                handedness = hand_results.multi_handedness[idx].classification[0].label

                lm_list = []
                for lm in hand_landmarks.landmark:
                    lm_list.append([lm.x, lm.y, lm.z])

                if handedness == "Left":
                    left_hand_landmarks = lm_list
                else:
                    right_hand_landmarks = lm_list

        # --- Extract Pose ---
        pose_landmarks = None
        if pose_results.pose_landmarks:
            pose_landmarks = [
                [lm.x, lm.y, lm.z]
                for lm in pose_results.pose_landmarks.landmark
            ]

        frames_data.append({
            "frame": frame_count,
            "pose": pose_landmarks,
            "left_hand": left_hand_landmarks,
            "right_hand": right_hand_landmarks
        })

        frame_count += 1

    cap.release()

    output_data = {
        "fps": fps,
        "frames": frames_data
    }

    letter_name = os.path.splitext(file)[0].upper()
    output_path = os.path.join(OUTPUT_FOLDER, f"{letter_name}.json")

    with open(output_path, "w") as f:
        json.dump(output_data, f, indent=4)

    print(f"Saved {output_path}")

print("✅ All alphabets processed successfully.")