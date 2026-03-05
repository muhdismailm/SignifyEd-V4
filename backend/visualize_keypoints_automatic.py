import json
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.animation as animation
import numpy as np

FILE_PATH = "backend/combined_keypoints/armyarrive.json"

with open(FILE_PATH, "r") as f:
    data = json.load(f)

frames = data.get("sentence_keypoints", [])

# ---------------- MEDIAPIPE CONNECTIONS ---------------- #

POSE_CONNECTIONS = [
    (11,13),(13,15),
    (12,14),(14,16),
    (11,12),
    (11,23),(12,24),
    (23,24)
]

HAND_CONNECTIONS = [
    (0,1),(1,2),(2,3),(3,4),
    (0,5),(5,6),(6,7),(7,8),
    (0,9),(9,10),(10,11),(11,12),
    (0,13),(13,14),(14,15),(15,16),
    (0,17),(17,18),(18,19),(19,20)
]

# simplified face outline
FACE_CONNECTIONS = [
    (10,338),(338,297),(297,332),(332,284),(284,251)
]

# ------------------------------------------------------- #

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')


def transform(points):
    pts = np.array(points)

    # convert mediapipe coords to world view
    pts[:,0] = 1 - pts[:,0]
    pts[:,1] = 1 - pts[:,1]
    pts[:,2] = -pts[:,2]

    return pts


def draw_connections(points, connections, color):

    pts = transform(points)

    for i,j in connections:

        if i < len(pts) and j < len(pts):

            ax.plot(
                [pts[i,0], pts[j,0]],
                [pts[i,2], pts[j,2]],
                [pts[i,1], pts[j,1]],
                color=color,
                linewidth=2
            )


def draw_points(points, color):

    pts = transform(points)

    ax.scatter(
        pts[:,0],
        pts[:,2],
        pts[:,1],
        color=color,
        s=5
    )


def update(frame_index):

    ax.clear()

    frame = frames[frame_index]

    pose = frame.get("pose")
    left = frame.get("left_hand")
    right = frame.get("right_hand")
    face = frame.get("face")

    if pose:
        draw_connections(pose, POSE_CONNECTIONS, "blue")

    if left:
        draw_connections(left, HAND_CONNECTIONS, "red")

    if right:
        draw_connections(right, HAND_CONNECTIONS, "green")

    if face:
        draw_points(face, "orange")

    ax.set_xlim(0,1)
    ax.set_ylim(-1,1)
    ax.set_zlim(0,1)

    ax.set_box_aspect([1,1,1])
    ax.set_axis_off()

    ax.view_init(elev=10, azim=90)

    ax.set_title(f"Frame {frame_index}")


ani = animation.FuncAnimation(
    fig,
    update,
    frames=len(frames),
    interval=40
)

plt.show()