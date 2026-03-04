# # import json
# # import matplotlib.pyplot as plt
# # from mpl_toolkits.mplot3d import Axes3D
# # import matplotlib.animation as animation
# # import numpy as np
# # import os

# # # =========================================
# # # SELECT LETTER FILE
# # # =========================================

# # FILE_PATH = "processed_keypoints/alphabets/A.json"

# # with open(FILE_PATH, "r") as f:
# #     data = json.load(f)

# # frames = data["frames"]

# # # =========================================
# # # Bone chains for right hand
# # # =========================================

# # FINGER_CHAINS = [
# #     ["RightHandThumb1", "RightHandThumb2", "RightHandThumb3"],
# #     ["RightHandIndex1", "RightHandIndex2", "RightHandIndex3"],
# #     ["RightHandMiddle1", "RightHandMiddle2", "RightHandMiddle3"],
# #     ["RightHandRing1", "RightHandRing2", "RightHandRing3"],
# #     ["RightHandPinky1", "RightHandPinky2", "RightHandPinky3"],
# # ]

# # fig = plt.figure()
# # ax = fig.add_subplot(111, projection='3d')

# # # =========================================
# # # Convert bone vectors to simple chain positions
# # # =========================================

# # def build_chain_positions(bones, chain):

# #     positions = []
# #     current = np.array([0, 0, 0])  # wrist origin

# #     for bone_name in chain:
# #         direction = np.array(bones.get(bone_name, [0,0,0]))
# #         current = current + direction * 0.2  # scale length
# #         positions.append(current.copy())

# #     return np.array(positions)

# # # =========================================
# # # Animation update
# # # =========================================

# # def update(frame_index):
# #     ax.clear()

# #     bones = frames[frame_index]["bones"]

# #     for chain in FINGER_CHAINS:
# #         pts = build_chain_positions(bones, chain)

# #         ax.plot(
# #             pts[:,0],
# #             pts[:,1],
# #             pts[:,2],
# #             marker='o'
# #         )

# #     ax.set_xlim(-1,1)
# #     ax.set_ylim(-1,1)
# #     ax.set_zlim(-1,1)

# #     ax.set_title(f"Frame {frame_index}")
# #     ax.set_box_aspect([1,1,1])

# # ani = animation.FuncAnimation(
# #     fig,
# #     update,
# #     frames=len(frames),
# #     interval=100
# # )

# # plt.show()




# import json
# import numpy as np
# import matplotlib.pyplot as plt
# import matplotlib.animation as animation

# FILE_PATH = "processed_keypoints/alphabets/A.json"

# with open(FILE_PATH, "r") as f:
#     data = json.load(f)

# frames = data["frames"]

# # ---------------------------------------------------
# # Bone lengths (adjust for better proportions)
# # ---------------------------------------------------

# LENGTHS = {
#     "arm": 0.25,
#     "forearm": 0.25,
#     "hand": 0.15,
#     "finger1": 0.07,
#     "finger2": 0.06,
#     "finger3": 0.05,
# }

# # ---------------------------------------------------
# # Build skeleton positions from direction vectors
# # ---------------------------------------------------

# def normalize(v):
#     v = np.array(v)
#     n = np.linalg.norm(v)
#     return v / n if n != 0 else v

# def build_hand(bones, wrist_pos, prefix):
#     joints = {}
#     joints[prefix+"Hand"] = wrist_pos

#     fingers = ["Thumb", "Index", "Middle", "Ring", "Pinky"]

#     for finger in fingers:
#         base = wrist_pos
#         v1 = normalize(bones[f"{prefix}Hand{finger}1"])
#         j1 = base + v1 * LENGTHS["finger1"]

#         v2 = normalize(bones[f"{prefix}Hand{finger}2"])
#         j2 = j1 + v2 * LENGTHS["finger2"]

#         v3 = normalize(bones[f"{prefix}Hand{finger}3"])
#         j3 = j2 + v3 * LENGTHS["finger3"]

#         joints[f"{prefix}{finger}1"] = j1
#         joints[f"{prefix}{finger}2"] = j2
#         joints[f"{prefix}{finger}3"] = j3

#     return joints

# def build_frame_positions(frame):
#     bones = frame["bones"]

#     joints = {}

#     # Root shoulder positions
#     left_shoulder = np.array([-0.4, 0.5, 0])
#     right_shoulder = np.array([0.4, 0.5, 0])

#     # -------- LEFT ARM --------
#     l_upper = normalize(bones["LeftArm"])
#     l_elbow = left_shoulder + l_upper * LENGTHS["arm"]

#     l_fore = normalize(bones["LeftForeArm"])
#     l_wrist = l_elbow + l_fore * LENGTHS["forearm"]

#     joints["LeftShoulder"] = left_shoulder
#     joints["LeftElbow"] = l_elbow
#     joints["LeftWrist"] = l_wrist

#     joints.update(build_hand(bones, l_wrist, "Left"))

#     # -------- RIGHT ARM --------
#     r_upper = normalize(bones["RightArm"])
#     r_elbow = right_shoulder + r_upper * LENGTHS["arm"]

#     r_fore = normalize(bones["RightForeArm"])
#     r_wrist = r_elbow + r_fore * LENGTHS["forearm"]

#     joints["RightShoulder"] = right_shoulder
#     joints["RightElbow"] = r_elbow
#     joints["RightWrist"] = r_wrist

#     joints.update(build_hand(bones, r_wrist, "Right"))

#     return joints

# # ---------------------------------------------------
# # Matplotlib Animation
# # ---------------------------------------------------

# fig = plt.figure()
# ax = fig.add_subplot(111, projection='3d')

# def draw_line(p1, p2, color="blue"):
#     ax.plot(
#         [p1[0], p2[0]],
#         [p1[1], p2[1]],
#         [p1[2], p2[2]],
#         color=color
#     )

# def update(frame_index):
#     ax.clear()
#     frame = frames[frame_index]
#     joints = build_frame_positions(frame)

#     # Arms
#     draw_line(joints["LeftShoulder"], joints["LeftElbow"], "blue")
#     draw_line(joints["LeftElbow"], joints["LeftWrist"], "blue")

#     draw_line(joints["RightShoulder"], joints["RightElbow"], "green")
#     draw_line(joints["RightElbow"], joints["RightWrist"], "green")

#     # Fingers
#     fingers = ["Thumb","Index","Middle","Ring","Pinky"]

#     for side,color in [("Left","red"),("Right","orange")]:
#         wrist = joints[f"{side}Wrist"]
#         for finger in fingers:
#             j1 = joints[f"{side}{finger}1"]
#             j2 = joints[f"{side}{finger}2"]
#             j3 = joints[f"{side}{finger}3"]

#             draw_line(wrist, j1, color)
#             draw_line(j1, j2, color)
#             draw_line(j2, j3, color)

#     ax.set_xlim(-1,1)
#     ax.set_ylim(0,1.2)
#     ax.set_zlim(-1,1)

#     ax.set_box_aspect([1,1,1])
#     ax.set_title(f"Frame {frame_index}")

# ani = animation.FuncAnimation(
#     fig,
#     update,
#     frames=len(frames),
#     interval=1000/data["fps"]
# )

# plt.show()


import json
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from mpl_toolkits.mplot3d import Axes3D

# ===============================
# FILE PATH (change letter here)
# ===============================

FILE_PATH = "processed_keypoints/alphabets/A.json"

with open(FILE_PATH, "r") as f:
    data = json.load(f)

frames = data["frames"]

# ===============================
# SIMPLE HUMAN BASE POSITIONS
# ===============================

BASE = {
    "LeftShoulder":  np.array([-0.2, 0.6, 0]),
    "RightShoulder": np.array([ 0.2, 0.6, 0]),
}

# ===============================
# FIGURE SETUP
# ===============================

fig = plt.figure()
ax = fig.add_subplot(111, projection="3d")

def draw_bone(start, direction, scale=0.25):
    end = start + np.array(direction) * scale
    ax.plot(
        [start[0], end[0]],
        [start[2], end[2]],
        [start[1], end[1]],
        color="black"
    )
    return end

def draw_hand(root, bones, prefix):
    wrist = draw_bone(root, bones[prefix+"Hand"], 0.15)

    fingers = [
        "Thumb",
        "Index",
        "Middle",
        "Ring",
        "Pinky"
    ]

    for finger in fingers:
        b1 = bones[prefix+finger+"1"]
        b2 = bones[prefix+finger+"2"]
        b3 = bones[prefix+finger+"3"]

        j1 = draw_bone(wrist, b1, 0.08)
        j2 = draw_bone(j1, b2, 0.06)
        draw_bone(j2, b3, 0.05)

def update(frame_idx):
    ax.clear()

    bones = frames[frame_idx]["bones"]

    # LEFT ARM
    l_shoulder = BASE["LeftShoulder"]
    l_elbow = draw_bone(l_shoulder, bones["LeftArm"])
    l_wrist = draw_bone(l_elbow, bones["LeftForeArm"])

    draw_hand(l_wrist, bones, "Left")

    # RIGHT ARM
    r_shoulder = BASE["RightShoulder"]
    r_elbow = draw_bone(r_shoulder, bones["RightArm"])
    r_wrist = draw_bone(r_elbow, bones["RightForeArm"])

    draw_hand(r_wrist, bones, "Right")

    # HEAD
    ax.scatter(0, 0.85, 0.6, s=300)
    ax.scatter(-0.03, 0.87, 0.6, s=30)
    ax.scatter( 0.03, 0.87, 0.6, s=30)

    ax.set_axis_off()
    ax.set_xlim(-0.6, 0.6)
    ax.set_ylim(-0.6, 0.6)
    ax.set_zlim(0, 1)

    ax.set_box_aspect([1,1,1])
    ax.view_init(elev=10, azim=90)  # front facing

    ax.set_title(f"Frame {frame_idx}")

ani = animation.FuncAnimation(
    fig,
    update,
    frames=len(frames),
    interval=40
)

plt.show()