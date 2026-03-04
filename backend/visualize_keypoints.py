# import json
# import matplotlib.pyplot as plt
# from mpl_toolkits.mplot3d import Axes3D
# import matplotlib.animation as animation
# import numpy as np

# FILE_PATH = "backend/processed_keypoints/ARMY.json"

# with open(FILE_PATH, "r") as f:
#     data = json.load(f)

# frames = data.get("frames") or data.get("keypoints") or []

# POSE_CONNECTIONS = [
#     (11,13),(13,15),
#     (12,14),(14,16),
#     (11,12),
#     (11,23),(12,24),
#     (23,24)
# ]

# HAND_CONNECTIONS = [
#     (0,1),(1,2),(2,3),(3,4),
#     (0,5),(5,6),(6,7),(7,8),
#     (0,9),(9,10),(10,11),(11,12),
#     (0,13),(13,14),(14,15),(15,16),
#     (0,17),(17,18),(18,19),(19,20)
# ]

# fig = plt.figure()
# ax = fig.add_subplot(111, projection='3d')

# def transform(points):
#     pts = np.array(points)

#     # Flip Y (MediaPipe image space)
#     pts[:,1] = 1 - pts[:,1]

#     # Invert Z so forward becomes forward visually
#     pts[:,2] = -pts[:,2]

#     return pts

# def draw_connections(points, connections, color):
#     pts = transform(points)
#     for i,j in connections:
#         if i < len(pts) and j < len(pts):
#             ax.plot(
#                 [pts[i,0], pts[j,0]],
#                 [pts[i,2], pts[j,2]],  # Z as vertical
#                 [pts[i,1], pts[j,1]],  # Y as depth
#                 color=color
#             )

# def update(frame_index):
#     ax.clear()

#     frame = frames[frame_index]
#     pose = frame.get("pose")
#     left = frame.get("left_hand")
#     right = frame.get("right_hand")

#     if pose:
#         draw_connections(pose, POSE_CONNECTIONS, "blue")

#     if left:
#         draw_connections(left, HAND_CONNECTIONS, "red")

#     if right:
#         draw_connections(right, HAND_CONNECTIONS, "green")

#     ax.set_xlim(0,1)
#     ax.set_ylim(-1,1)
#     ax.set_zlim(0,1)

#     ax.set_box_aspect([1,1,1])  # equal scaling

#     ax.set_title(f"Frame {frame_index}")

# ani = animation.FuncAnimation(
#     fig,
#     update,
#     frames=len(frames),
#     interval=40
# )

# plt.show()

import json
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.animation as animation
import numpy as np

FILE_PATH = "backend/processed_alphabet_keypoints/A.json"

with open(FILE_PATH, "r") as f:
    data = json.load(f)

frames = data.get("frames") or data.get("keypoints") or []

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

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

def transform(points):
    pts = np.array(points)

    # Make skeleton face forward
    pts[:,0] = 1 - pts[:,0]   # Flip X
    pts[:,1] = 1 - pts[:,1]   # Flip Y
    pts[:,2] = -pts[:,2]      # Flip Z

    return pts

def draw_connections(points, connections, color):
    pts = transform(points)
    for i,j in connections:
        if i < len(pts) and j < len(pts):
            ax.plot(
                [pts[i,0], pts[j,0]],
                [pts[i,2], pts[j,2]],
                [pts[i,1], pts[j,1]],
                color=color
            )

def draw_face():
    # Simple head sphere
    u = np.linspace(0, 2 * np.pi, 20)
    v = np.linspace(0, np.pi, 20)

    r = 0.07
    x = r * np.outer(np.cos(u), np.sin(v)) + 0.5
    y = r * np.outer(np.sin(u), np.sin(v)) + 0.85
    z = r * np.outer(np.ones(np.size(u)), np.cos(v))

    ax.plot_surface(x, z, y, color='orange', alpha=0.6)

    # Eyes
    ax.scatter([0.47, 0.53], [0.88, 0.88], [0.82, 0.82], color='black', s=20)

def update(frame_index):
    ax.clear()

    frame = frames[frame_index]
    pose = frame.get("pose")
    left = frame.get("left_hand")
    right = frame.get("right_hand")

    if pose:
        draw_connections(pose, POSE_CONNECTIONS, "blue")

    if left:
        draw_connections(left, HAND_CONNECTIONS, "red")

    if right:
        draw_connections(right, HAND_CONNECTIONS, "green")

    draw_face()

    # Clean view (no background grid)
    ax.set_axis_off()

    ax.set_xlim(0,1)
    ax.set_ylim(-1,1)
    ax.set_zlim(0,1)

    ax.set_box_aspect([1,1,1])
    ax.view_init(elev=10, azim=90)  # Face camera directly

    ax.set_title(f"Frame {frame_index}")

ani = animation.FuncAnimation(
    fig,
    update,
    frames=len(frames),
    interval=40
)

plt.show()