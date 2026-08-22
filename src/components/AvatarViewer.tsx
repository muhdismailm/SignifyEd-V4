import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

interface Props {
  keypoints?: any[];
  fps?: number;
  isPlaying?: boolean;
  frameIndex?: number;
  speed?: number;
  onFrameAdvance?: () => void;
  backgroundType?: string;
  hideControls?: boolean;
}

const BONE_CHILD_MAP: Record<string, string> = {
  LeftShoulder:  "LeftArm",
  LeftArm:       "LeftForeArm",
  LeftForeArm:   "LeftHand",
  LeftHand:      "LeftHandMiddle1",
  RightShoulder: "RightArm",
  RightArm:      "RightForeArm",
  RightForeArm:  "RightHand",
  RightHand:     "RightHandMiddle1",
  LeftHandThumb1:  "LeftHandThumb2",
  LeftHandThumb2:  "LeftHandThumb3",
  LeftHandIndex1:  "LeftHandIndex2",
  LeftHandIndex2:  "LeftHandIndex3",
  LeftHandMiddle1: "LeftHandMiddle2",
  LeftHandMiddle2: "LeftHandMiddle3",
  LeftHandRing1:   "LeftHandRing2",
  LeftHandRing2:   "LeftHandRing3",
  LeftHandPinky1:  "LeftHandPinky2",
  LeftHandPinky2:  "LeftHandPinky3",
  RightHandThumb1:  "RightHandThumb2",
  RightHandThumb2:  "RightHandThumb3",
  RightHandIndex1:  "RightHandIndex2",
  RightHandIndex2:  "RightHandIndex3",
  RightHandMiddle1: "RightHandMiddle2",
  RightHandMiddle2: "RightHandMiddle3",
  RightHandRing1:   "RightHandRing2",
  RightHandRing2:   "RightHandRing3",
  RightHandPinky1:  "RightHandPinky2",
  RightHandPinky2:  "RightHandPinky3",
  Hips:       "Spine",
  Spine:      "Spine1",
  Spine1:     "Spine2",
  Spine2:     "Neck",
  Neck:       "Head",
  LeftUpLeg:  "LeftLeg",
  LeftLeg:    "LeftFoot",
  LeftFoot:   "LeftToeBase",
  RightUpLeg: "RightLeg",
  RightLeg:   "RightFoot",
  RightFoot:  "RightToeBase",
};

const BONES: Record<string, string> = {
  l_shoulder: "LeftShoulder",
  l_upperarm: "LeftArm",
  l_forearm:  "LeftForeArm",
  l_hand:     "LeftHand",
  r_shoulder: "RightShoulder",
  r_upperarm: "RightArm",
  r_forearm:  "RightForeArm",
  r_hand:     "RightHand",
  l_thumb1: "LeftHandThumb1",  l_thumb2: "LeftHandThumb2",  l_thumb3: "LeftHandThumb3",
  l_index1: "LeftHandIndex1",  l_index2: "LeftHandIndex2",  l_index3: "LeftHandIndex3",
  l_mid1:   "LeftHandMiddle1", l_mid2:   "LeftHandMiddle2", l_mid3:   "LeftHandMiddle3",
  l_ring1:  "LeftHandRing1",   l_ring2:  "LeftHandRing2",   l_ring3:  "LeftHandRing3",
  l_pinky1: "LeftHandPinky1",  l_pinky2: "LeftHandPinky2",  l_pinky3: "LeftHandPinky3",
  r_thumb1: "RightHandThumb1", r_thumb2: "RightHandThumb2", r_thumb3: "RightHandThumb3",
  r_index1: "RightHandIndex1", r_index2: "RightHandIndex2", r_index3: "RightHandIndex3",
  r_mid1:   "RightHandMiddle1",r_mid2:   "RightHandMiddle2",r_mid3:   "RightHandMiddle3",
  r_ring1:  "RightHandRing1",  r_ring2:  "RightHandRing2",  r_ring3:  "RightHandRing3",
  r_pinky1: "RightHandPinky1", r_pinky2: "RightHandPinky2", r_pinky3: "RightHandPinky3",
};

function mpToThree(p: number[]): THREE.Vector3 {
  return new THREE.Vector3(-p[0], -p[1], -p[2]);
}

function mpDir(a: number[], b: number[]): THREE.Vector3 {
  return mpToThree(b).sub(mpToThree(a)).normalize();
}

function AnimatedAvatar({
  keypoints = [],
  fps = 25,
  speed = 1,
  isPlaying,
  frameIndex,
  onFrameAdvance,
}: {
  keypoints?: any[];
  fps?: number;
  speed: number;
  isPlaying: boolean;
  frameIndex: number;
  onFrameAdvance: () => void;
}) {
  const { scene } = useGLTF("/avatar.glb");
  const bonesRef   = useRef<Record<string, THREE.Bone>>({});
  const restLocalQ = useRef<Record<string, THREE.Quaternion>>({});
  const elapsed    = useRef(0);
  const frameInterval = 1 / (fps * speed);

  useEffect(() => {
    scene.traverse((obj) => {
      if (!(obj as THREE.Bone).isBone) return;
      const bone = obj as THREE.Bone;
      bonesRef.current[bone.name]   = bone;
      restLocalQ.current[bone.name] = bone.quaternion.clone();
    });
  }, [scene]);

  useEffect(() => {
    elapsed.current = 0;
  }, [keypoints]);

  function resetToRest() {
    for (const [name, q] of Object.entries(restLocalQ.current)) {
      const bone = bonesRef.current[name];
      if (bone) bone.quaternion.copy(q);
    }
  }

  function getCurrentBoneDir(boneName: string): THREE.Vector3 | null {
    const bone = bonesRef.current[boneName];
    if (!bone) return null;
    const childName = BONE_CHILD_MAP[boneName];
    const childBone = childName ? bonesRef.current[childName] : null;
    if (!childBone) return null;
    const bPos = new THREE.Vector3();
    const cPos = new THREE.Vector3();
    bone.getWorldPosition(bPos);
    childBone.getWorldPosition(cPos);
    const dir = cPos.sub(bPos);
    if (dir.lengthSq() < 1e-10) return null;
    return dir.normalize();
  }

  function rotateBoneToward(boneName: string, targetDir: THREE.Vector3) {
    const bone = bonesRef.current[boneName];
    if (!bone || targetDir.lengthSq() < 0.001) return;
    const currentDir = getCurrentBoneDir(boneName);
    if (!currentDir) return;
    const dot = currentDir.dot(targetDir);
    let delta: THREE.Quaternion;
    if (dot < -0.9999) {
      const perp = Math.abs(currentDir.x) < 0.9
        ? new THREE.Vector3(1, 0, 0)
        : new THREE.Vector3(0, 1, 0);
      const axis = new THREE.Vector3().crossVectors(currentDir, perp).normalize();
      delta = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI);
    } else {
      delta = new THREE.Quaternion().setFromUnitVectors(currentDir, targetDir);
    }
    const currentWorldQ = new THREE.Quaternion();
    bone.getWorldQuaternion(currentWorldQ);
    const desiredWorldQ = delta.multiply(currentWorldQ);
    const parentWorldQ = new THREE.Quaternion();
    if (bone.parent) bone.parent.getWorldQuaternion(parentWorldQ);
    bone.quaternion.copy(parentWorldQ.invert().multiply(desiredWorldQ));
  }

  function driveFinger(
    lm: number[][],
    mcp: number, pip: number, dip: number, tip: number,
    b1: string, b2: string, b3: string
  ) {
    rotateBoneToward(b1, mpDir(lm[mcp], lm[pip]));
    rotateBoneToward(b2, mpDir(lm[pip], lm[dip]));
    rotateBoneToward(b3, mpDir(lm[dip], lm[tip]));
  }

  function driveHand(hand: number[][], side: "l" | "r") {
    if (!hand || hand.length < 21) return;
    const s = side;
    rotateBoneToward(BONES[`${s}_hand`], mpDir(hand[0], hand[9]));
    driveFinger(hand, 1, 2, 3, 4,   BONES[`${s}_thumb1`], BONES[`${s}_thumb2`], BONES[`${s}_thumb3`]);
    driveFinger(hand, 5, 6, 7, 8,   BONES[`${s}_index1`], BONES[`${s}_index2`], BONES[`${s}_index3`]);
    driveFinger(hand, 9, 10, 11, 12, BONES[`${s}_mid1`],   BONES[`${s}_mid2`],   BONES[`${s}_mid3`]);
    driveFinger(hand, 13, 14, 15, 16,BONES[`${s}_ring1`],  BONES[`${s}_ring2`],  BONES[`${s}_ring3`]);
    driveFinger(hand, 17, 18, 19, 20,BONES[`${s}_pinky1`], BONES[`${s}_pinky2`], BONES[`${s}_pinky3`]);
  }

  useFrame((state, delta) => {
    if (!isPlaying) return;
    elapsed.current += Math.min(delta, 0.1);
    if (elapsed.current >= frameInterval) {
      elapsed.current = 0;
      onFrameAdvance();
    }
    resetToRest();

    if (keypoints && keypoints.length > 0) {
      const frame = keypoints[frameIndex % keypoints.length];
      if (frame) {
        const pose  = frame.pose       as number[][] | undefined;
        const left  = frame.left_hand  as number[][] | undefined;
        const right = frame.right_hand as number[][] | undefined;
        if (pose && pose.length >= 17) {
          rotateBoneToward(BONES.r_upperarm, mpDir(pose[11], pose[13]));
          rotateBoneToward(BONES.r_forearm,  mpDir(pose[13], pose[15]));
          rotateBoneToward(BONES.l_upperarm, mpDir(pose[12], pose[14]));
          rotateBoneToward(BONES.l_forearm,  mpDir(pose[14], pose[16]));
        }
        if (left)  driveHand(left,  "l");
        if (right) driveHand(right, "r");
      }
    } else {
      // Natural procedural gesture animation when keypoints are simulated or empty
      const t = state.clock.getElapsedTime() * speed * 3.2;
      const r_arm_dir = new THREE.Vector3(
        0.35 + 0.25 * Math.sin(t),
        0.5 + 0.3 * Math.cos(t * 1.3),
        0.6 + 0.2 * Math.sin(t * 0.7)
      ).normalize();
      const l_arm_dir = new THREE.Vector3(
        -0.35 - 0.2 * Math.sin(t * 0.8),
        0.45 + 0.3 * Math.cos(t * 1.1),
        0.5 + 0.2 * Math.sin(t)
      ).normalize();

      rotateBoneToward(BONES.r_upperarm, r_arm_dir);
      rotateBoneToward(BONES.r_forearm, new THREE.Vector3(0.2, 0.7, 0.6).normalize());
      rotateBoneToward(BONES.l_upperarm, l_arm_dir);
      rotateBoneToward(BONES.l_forearm, new THREE.Vector3(-0.2, 0.7, 0.6).normalize());
    }
  });

  return (
    <group position={[0, -0.85, 0]} scale={1.05}>
      <primitive object={scene} />
    </group>
  );
}

const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [24, 26],
  [25, 27], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32],
];

function SkeletonViewer({
  keypoints = [],
  fps = 25,
  speed = 1,
  isPlaying,
  frameIndex,
  onFrameAdvance,
}: {
  keypoints?: any[];
  fps?: number;
  speed: number;
  isPlaying: boolean;
  frameIndex: number;
  onFrameAdvance: () => void;
}) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef(0);
  const lastTimeRef = useRef(0);
  const frameInterval = 1000 / (fps * speed);

  const isPlayingRef  = useRef(isPlaying);
  const frameIndexRef = useRef(frameIndex);
  const totalRef      = useRef(keypoints.length);
  useEffect(() => { isPlayingRef.current  = isPlaying;        }, [isPlaying]);
  useEffect(() => { frameIndexRef.current = frameIndex;       }, [frameIndex]);
  useEffect(() => { totalRef.current      = keypoints.length; }, [keypoints.length]);

  const zoomRef   = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const dragRef   = useRef<{ active: boolean; lastX: number; lastY: number; lastDist: number }>({
    active: false, lastX: 0, lastY: 0, lastDist: 0,
  });

  const draw = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.fillStyle = "#080d1a";
    ctx.fillRect(0, 0, W, H);
    const z = zoomRef.current;
    const ox = offsetRef.current.x;
    const oy = offsetRef.current.y;
    ctx.save();
    ctx.setTransform(z, 0, 0, z, ox, oy);
    ctx.strokeStyle = "rgba(99,102,241,0.08)";
    ctx.lineWidth = 1 / z;
    for (let x = -W; x < W * 2; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H * 2); ctx.stroke(); }
    for (let y = -H; y < H * 2; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W * 2, y); ctx.stroke(); }
    
    const frame = keypoints[frameIdx];
    if (!frame) { ctx.restore(); return; }
    const pose  = frame.pose       as number[][] | undefined;
    const left  = frame.left_hand  as number[][] | undefined;
    const right = frame.right_hand as number[][] | undefined;

    function poseXY(pt: number[]): [number, number] {
      return [(-pt[0] * 0.55 + 0.5) * W, (pt[1] * 0.55 + 0.38) * H];
    }
    function handXY(pt: number[], wristLm: number[], wx: number, wy: number, flipX = false): [number, number] {
      const rx = pt[0] - wristLm[0];
      const ry = pt[1] - wristLm[1];
      return [wx + (flipX ? -rx : rx) * 0.55 * W, wy + ry * 0.55 * H];
    }

    if (pose && pose.length >= 11) {
      const nose   = pose[0]  ? poseXY(pose[0])  : null;
      const lEye   = pose[2]  ? poseXY(pose[2])  : null;
      const rEye   = pose[5]  ? poseXY(pose[5])  : null;
      const lEar   = pose[7]  ? poseXY(pose[7])  : null;
      const rEar   = pose[8]  ? poseXY(pose[8])  : null;
      const mouthL = pose[9]  ? poseXY(pose[9])  : null;
      const mouthR = pose[10] ? poseXY(pose[10]) : null;
      if (lEar && rEar) {
        const hcx = (lEar[0] + rEar[0]) / 2;
        const hcy = (lEar[1] + rEar[1]) / 2;
        const hr  = Math.hypot(lEar[0] - rEar[0], lEar[1] - rEar[1]) * 0.65;
        ctx.beginPath(); ctx.arc(hcx, hcy, hr, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(167,139,250,0.45)"; ctx.lineWidth = 1.5; ctx.stroke();
      }
      if (nose && lEye) { ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.lineTo(lEye[0], lEye[1]); ctx.strokeStyle = "rgba(167,139,250,0.25)"; ctx.lineWidth = 1; ctx.stroke(); }
      if (nose && rEye) { ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.lineTo(rEye[0], rEye[1]); ctx.strokeStyle = "rgba(167,139,250,0.25)"; ctx.lineWidth = 1; ctx.stroke(); }
      if (mouthL && mouthR) { ctx.beginPath(); ctx.moveTo(mouthL[0], mouthL[1]); ctx.lineTo(mouthR[0], mouthR[1]); ctx.strokeStyle = "rgba(244,114,182,0.85)"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.stroke(); }
      for (const eye of [lEye, rEye]) {
        if (!eye) continue;
        ctx.beginPath(); ctx.arc(eye[0], eye[1], 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#a5b4fc"; ctx.shadowColor = "#818cf8"; ctx.shadowBlur = 8;
        ctx.fill(); ctx.shadowBlur = 0;
      }
      for (const ear of [lEar, rEar]) {
        if (!ear) continue;
        ctx.beginPath(); ctx.arc(ear[0], ear[1], 3, 0, Math.PI * 2); ctx.fillStyle = "#818cf8"; ctx.fill();
      }
      if (nose) { ctx.beginPath(); ctx.arc(nose[0], nose[1], 3, 0, Math.PI * 2); ctx.fillStyle = "#c4b5fd"; ctx.shadowColor = "#a78bfa"; ctx.shadowBlur = 6; ctx.fill(); ctx.shadowBlur = 0; }
    }

    if (pose && pose.length >= 17) {
      ctx.lineCap = "round";
      for (const [a, b] of POSE_CONNECTIONS) {
        if (!pose[a] || !pose[b]) continue;
        const [ax, ay] = poseXY(pose[a]);
        const [bx, by] = poseXY(pose[b]);
        const grad = ctx.createLinearGradient(ax, ay, bx, by);
        grad.addColorStop(0, "rgba(99,102,241,0.9)");
        grad.addColorStop(1, "rgba(167,139,250,0.9)");
        ctx.strokeStyle = grad; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      }
      for (let i = 11; i <= 32; i++) {
        if (!pose[i]) continue;
        const [x, y] = poseXY(pose[i]);
        const isWrist = i === 15 || i === 16;
        ctx.beginPath(); ctx.arc(x, y, isWrist ? 5 : 4, 0, Math.PI * 2);
        ctx.fillStyle   = isWrist ? "#f472b6" : "#818cf8";
        ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
        ctx.fill(); ctx.shadowBlur = 0;
      }
    }

    const leftWrist  = pose?.[15] ? poseXY(pose[15]) : [W * 0.65, H * 0.62] as [number, number];
    const rightWrist = pose?.[16] ? poseXY(pose[16]) : [W * 0.35, H * 0.62] as [number, number];

    function drawHand(c: CanvasRenderingContext2D, lm: number[][], wx: number, wy: number, lineColor: string, dotColor: string) {
      if (!lm || lm.length < 21) return;
      c.lineCap = "round"; c.lineJoin = "round";
      const maxAbsZ = Math.max(...lm.slice(1).map(pt => Math.abs(pt[2])));
      const isImageSpace = maxAbsZ < 0.001;
      const flipX = !isImageSpace;
      const chains = [[0,1,2,3,4],[0,5,6,7,8],[0,9,10,11,12],[0,13,14,15,16],[0,17,18,19,20]];
      const palmLinks: [number, number][] = [[5,9],[9,13],[13,17]];
      c.strokeStyle = lineColor;
      chains.forEach((chain) => {
        for (let s = 0; s < chain.length - 1; s++) {
          const [ax, ay] = handXY(lm[chain[s]], lm[0], wx, wy, flipX);
          const [bx, by] = handXY(lm[chain[s+1]], lm[0], wx, wy, flipX);
          c.lineWidth = s === 0 ? 2.5 : s === 1 ? 2.0 : 1.6;
          c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
        }
      });
      c.lineWidth = 1.8;
      palmLinks.forEach(([a, b]) => {
        const [ax, ay] = handXY(lm[a], lm[0], wx, wy, flipX);
        const [bx, by] = handXY(lm[b], lm[0], wx, wy, flipX);
        c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
      });
      for (let i = 0; i < 21; i++) {
        const [x, y] = handXY(lm[i], lm[0], wx, wy, flipX);
        const isTip = [4,8,12,16,20].includes(i);
        const isWrist = i === 0;
        const r = isWrist ? 5 : isTip ? 3.5 : 2.5;
        c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
        c.fillStyle = isTip ? "#ffffff" : dotColor;
        c.shadowColor = dotColor; c.shadowBlur = isTip ? 10 : isWrist ? 14 : 5;
        c.fill(); c.shadowBlur = 0;
      }
    }

    if (left)  drawHand(ctx, left,  rightWrist[0], rightWrist[1], "rgba(251,191,36,0.75)", "#fbbf24");
    if (right) drawHand(ctx, right, leftWrist[0],  leftWrist[1],  "rgba(52,211,153,0.75)", "#34d399");

    ctx.restore();
    ([["#818cf8", "Pose"], ["#fbbf24", "Left Hand"], ["#34d399", "Right Hand"]] as [string, string][])
      .forEach(([color, label], i) => {
        ctx.beginPath(); ctx.arc(14, H - 14 - i * 18, 5, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.shadowBlur = 0; ctx.fill();
        ctx.fillStyle = "rgba(203,213,225,0.7)";
        ctx.font = "11px monospace"; ctx.fillText(label, 24, H - 10 - i * 18);
      });
    if (Math.abs(zoomRef.current - 1) > 0.05) {
      ctx.fillStyle = "rgba(129,140,248,0.45)";
      ctx.font = "10px monospace"; ctx.textAlign = "right";
      ctx.fillText(`${(zoomRef.current * 100).toFixed(0)}%`, W - 8, H - 8);
      ctx.textAlign = "left";
    }
  }, [keypoints]);

  useEffect(() => { draw(frameIndex); }, [frameIndex, draw]);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    lastTimeRef.current = 0;
    if (!isPlaying) return;
    const loop = (ts: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = ts;
      if (ts - lastTimeRef.current >= frameInterval) {
        lastTimeRef.current = ts;
        if (frameIndexRef.current < totalRef.current - 1) onFrameAdvance();
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, frameInterval, onFrameAdvance]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * sx;
    const my = (e.clientY - rect.top) * sy;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const nz = Math.min(Math.max(zoomRef.current * factor, 0.3), 6);
    offsetRef.current = {
      x: mx - (mx - offsetRef.current.x) * (nz / zoomRef.current),
      y: my - (my - offsetRef.current.y) * (nz / zoomRef.current),
    };
    zoomRef.current = nz;
    draw(frameIndexRef.current);
  }, [draw]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY, lastDist: 0 };
  }, []);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current.active) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    offsetRef.current = {
      x: offsetRef.current.x + (e.clientX - dragRef.current.lastX) * (canvas.width / rect.width),
      y: offsetRef.current.y + (e.clientY - dragRef.current.lastY) * (canvas.height / rect.height),
    };
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    draw(frameIndexRef.current);
  }, [draw]);
  const stopDrag = useCallback(() => { dragRef.current.active = false; }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      dragRef.current = { active: true, lastX: e.touches[0].clientX, lastY: e.touches[0].clientY, lastDist: 0 };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      dragRef.current = { active: true, lastX: 0, lastY: 0, lastDist: Math.sqrt(dx * dx + dy * dy) };
    }
  }, []);
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;

    if (e.touches.length === 2 && dragRef.current.lastDist > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = dist / dragRef.current.lastDist;
      if (Math.abs(factor - 1) > 0.01) {
        const cx = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) * sx;
        const cy = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top) * sy;
        const nz = Math.min(Math.max(zoomRef.current * factor, 0.3), 6);
        offsetRef.current = { x: cx - (cx - offsetRef.current.x) * (nz / zoomRef.current), y: cy - (cy - offsetRef.current.y) * (nz / zoomRef.current) };
        zoomRef.current = nz;
      }
      dragRef.current.lastDist = dist;
    } else if (e.touches.length === 1 && dragRef.current.active) {
      offsetRef.current = { x: offsetRef.current.x + (e.touches[0].clientX - dragRef.current.lastX) * sx, y: offsetRef.current.y + (e.touches[0].clientY - dragRef.current.lastY) * sy };
      dragRef.current.lastX = e.touches[0].clientX;
      dragRef.current.lastY = e.touches[0].clientY;
    }
    draw(frameIndexRef.current);
  }, [draw]);

  const handleDoubleClick = useCallback(() => {
    zoomRef.current = 1;
    offsetRef.current = { x: 0, y: 0 };
    draw(frameIndexRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={520} height={400}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={stopDrag}
      onDoubleClick={handleDoubleClick}
      style={{ width: "100%", height: "100%", display: "block", cursor: "grab" }}
    />
  );
}

export default function AvatarViewer({
  keypoints = [],
  fps = 25,
  isPlaying: externalIsPlaying,
  frameIndex: externalFrameIndex,
  speed: externalSpeed,
  onFrameAdvance,
  hideControls = false,
}: Props) {
  const [activeTab,  setActiveTab]  = useState<"avatar" | "skeleton">("avatar");
  const [internalIsPlaying,  setInternalIsPlaying]  = useState(false);
  const [isLooping,  setIsLooping]  = useState(false);
  const [internalFrameIndex, setInternalFrameIndex] = useState(0);
  const [internalSpeed,      setInternalSpeed]      = useState<number>(1);

  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalIsPlaying;
  const frameIndex = externalFrameIndex !== undefined ? externalFrameIndex : internalFrameIndex;
  const speed = externalSpeed !== undefined ? externalSpeed : internalSpeed;
  const setIsPlaying = setInternalIsPlaying;
  const setFrameIndex = setInternalFrameIndex;
  const setSpeed = setInternalSpeed;

  const advanceFrame = useCallback(() => {
    if (onFrameAdvance) {
      onFrameAdvance();
      return;
    }
    setFrameIndex(prev => {
      const maxFrames = keypoints.length > 0 ? keypoints.length : 120;
      const next = prev + 1;
      if (next >= maxFrames - 1) {
        if (isLooping) {
          return 0; // Auto replay / loop seamlessly
        } else {
          setIsPlaying(false);
          return maxFrames - 1;
        }
      }
      return next;
    });
  }, [keypoints.length, isLooping, onFrameAdvance]);

  const handleReplay = useCallback(() => {
    if (onFrameAdvance) {
      // Handled externally if needed
    }
    setFrameIndex(0);
    setIsPlaying(true);
  }, [onFrameAdvance]);

  const handlePlayPause = useCallback(() => {
    if (!isPlaying) {
      if (keypoints.length > 0 && frameIndex >= keypoints.length - 1) {
        setFrameIndex(0);
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [isPlaying, keypoints.length, frameIndex]);

  useEffect(() => {
    setFrameIndex(0);
    if (keypoints && keypoints.length > 0) {
      setIsPlaying(true);
    }
  }, [keypoints]);

  const isAtEnd = keypoints.length > 0 && frameIndex >= keypoints.length - 1 && !isPlaying;

  return (
    <div className="w-full h-full relative flex flex-col justify-between overflow-hidden select-none">
      
      {/* Visualizer / 3D Model Mode Switcher Tabs */}
      <div className="absolute top-3 left-3 z-30 flex items-center p-1 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800/80 shadow-lg">
        <button
          onClick={() => setActiveTab("avatar")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "avatar"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          3D Avatar
        </button>
        <button
          onClick={() => setActiveTab("skeleton")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "skeleton"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Visualiser
        </button>
      </div>



      {/* 3D Canvas / Skeleton Viewport */}
      <div className="w-full h-full relative flex items-center justify-center min-h-[300px]">
        
        {/* Replay Overlay on Completion */}
        {isAtEnd && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/45 backdrop-blur-[2px] space-y-3">
            <button
              onClick={handleReplay}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-2xl shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all"
            >
              <span className="text-base">↺</span>
              <span>Replay Animation</span>
            </button>
          </div>
        )}

        {activeTab === "avatar" ? (
          <Canvas
            camera={{ position: [0, 0.95, 2.1], fov: 42 }}
            style={{ width: "100%", height: "100%", background: "transparent" }}
          >
            <ambientLight intensity={0.9} />
            <directionalLight position={[2, 3, 3]} intensity={1.4} />
            <directionalLight position={[-2, 1, 2]} intensity={0.7} color="#818cf8" />
            <pointLight position={[0, -0.5, 1.5]} intensity={0.5} />
            <AnimatedAvatar
              keypoints={keypoints}
              fps={fps}
              speed={speed}
              isPlaying={isPlaying}
              frameIndex={frameIndex}
              onFrameAdvance={advanceFrame}
            />
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              target={[0, 0.9, 0]}
              minDistance={1.0}
              maxDistance={3.5}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 1.8}
            />
          </Canvas>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#080d1a]">
            {keypoints.length > 0 ? (
              <SkeletonViewer
                keypoints={keypoints}
                fps={fps}
                speed={speed}
                isPlaying={isPlaying}
                frameIndex={frameIndex}
                onFrameAdvance={advanceFrame}
              />
            ) : (
              <div className="text-center text-slate-500 text-xs">
                <div>🦴 No keypoints loaded yet</div>
                <div className="text-[10px] text-slate-600 mt-1">Type text to generate ISL keypoints</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Embedded Controls Bar (Hidden when hideControls is true) */}
      {!hideControls && (
        <div className="p-3 bg-[#080f24] border-t border-blue-950/40 flex items-center justify-between gap-2.5 relative z-30">
          {/* Play / Pause / Replay Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReplay}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all"
              title="Replay from beginning"
            >
              <span className="text-sm">↺</span>
              <span className="hidden sm:inline">Replay</span>
            </button>

            <button
              onClick={handlePlayPause}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              <span>{isPlaying ? "Pause" : (isAtEnd ? "Replay" : "Play")}</span>
            </button>

            {/* Loop / Repeat Toggle */}
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1 ${
                isLooping
                  ? "bg-indigo-600/30 border-indigo-500 text-indigo-300 shadow-sm"
                  : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
              title={isLooping ? "Looping Enabled (Repeat continuously)" : "Enable Repeat Loop"}
            >
              <span>🔁</span>
              <span className="hidden sm:inline">Loop</span>
            </button>
          </div>

          {/* Scrubber Progress */}
          <div className="flex-1 max-w-xs mx-2">
            <input
              type="range"
              min={0}
              max={Math.max(0, keypoints.length - 1)}
              value={frameIndex}
              onChange={(e) => {
                setFrameIndex(Number(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Speed Buttons */}
          <div className="flex items-center gap-1">
            {[1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  speed === s
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}