

// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF } from "@react-three/drei";
// import { useEffect, useRef, useState, useCallback } from "react";
// import * as THREE from "three";

// interface Props {
//   keypoints: any[];
//   fps?: number;
// }

// /* ─────────────────────────────────────────────────────────────
//    MIXAMO BONE MAP
// ───────────────────────────────────────────────────────────── */
// const BONES = {
//   l_upperarm: "LeftArm",
//   l_forearm:  "LeftForeArm",
//   l_hand:     "LeftHand",
//   r_upperarm: "RightArm",
//   r_forearm:  "RightForeArm",
//   r_hand:     "RightHand",
//   l_thumb1: "LeftHandThumb1",  l_thumb2: "LeftHandThumb2",  l_thumb3: "LeftHandThumb3",
//   l_index1: "LeftHandIndex1",  l_index2: "LeftHandIndex2",  l_index3: "LeftHandIndex3",
//   l_mid1:   "LeftHandMiddle1", l_mid2:   "LeftHandMiddle2", l_mid3:   "LeftHandMiddle3",
//   l_ring1:  "LeftHandRing1",   l_ring2:  "LeftHandRing2",   l_ring3:  "LeftHandRing3",
//   l_pinky1: "LeftHandPinky1",  l_pinky2: "LeftHandPinky2",  l_pinky3: "LeftHandPinky3",
//   r_thumb1: "RightHandThumb1", r_thumb2: "RightHandThumb2", r_thumb3: "RightHandThumb3",
//   r_index1: "RightHandIndex1", r_index2: "RightHandIndex2", r_index3: "RightHandIndex3",
//   r_mid1:   "RightHandMiddle1",r_mid2:   "RightHandMiddle2",r_mid3:   "RightHandMiddle3",
//   r_ring1:  "RightHandRing1",  r_ring2:  "RightHandRing2",  r_ring3:  "RightHandRing3",
//   r_pinky1: "RightHandPinky1", r_pinky2: "RightHandPinky2", r_pinky3: "RightHandPinky3",
// } as const;

// /* ─────────────────────────────────────────────────────────────
//    MEDIAPIPE HELPERS
// ───────────────────────────────────────────────────────────── */
// function mpToWorld(p: number[]): THREE.Vector3 {
//   return new THREE.Vector3(-p[0], -p[1], p[2]);
// }
// function mpDir(a: number[], b: number[]): THREE.Vector3 {
//   return mpToWorld(b).sub(mpToWorld(a)).normalize();
// }

// /* ─────────────────────────────────────────────────────────────
//    ANIMATED AVATAR (3-D)
// ───────────────────────────────────────────────────────────── */
// function AnimatedAvatar({
//   keypoints,
//   fps = 25,
//   isPlaying,
//   frameIndex,
//   onFrameAdvance,
// }: Props & {
//   isPlaying: boolean;
//   frameIndex: number;
//   onFrameAdvance: () => void;
// }) {
//   const { scene } = useGLTF("/avatar.glb");
//   const bonesRef   = useRef<Record<string, THREE.Bone>>({});
//   const restDir    = useRef<Record<string, THREE.Vector3>>({});
//   const restLocalQ = useRef<Record<string, THREE.Quaternion>>({});
//   const elapsed    = useRef(0);
//   const frameInterval = 1 / fps;

//   useEffect(() => {
//     scene.traverse((obj) => {
//       if (!(obj as THREE.Bone).isBone) return;
//       const bone = obj as THREE.Bone;
//       bonesRef.current[bone.name]   = bone;
//       restLocalQ.current[bone.name] = bone.quaternion.clone();
//     });
//     scene.traverse((obj) => {
//       if (!(obj as THREE.Bone).isBone) return;
//       const bone = obj as THREE.Bone;
//       const childBone = bone.children.find(c => (c as THREE.Bone).isBone) as THREE.Object3D | undefined;
//       if (childBone) {
//         const bPos = new THREE.Vector3();
//         const cPos = new THREE.Vector3();
//         bone.getWorldPosition(bPos);
//         childBone.getWorldPosition(cPos);
//         restDir.current[bone.name] = cPos.sub(bPos).normalize();
//       }
//     });
//   }, [scene]);

//   useEffect(() => { elapsed.current = 0; }, [keypoints]);

//   function rotateBoneToward(boneName: string, targetDir: THREE.Vector3, alpha = 1.0) {
//     const bone  = bonesRef.current[boneName];
//     const rDir  = restDir.current[boneName];
//     const restQ = restLocalQ.current[boneName];
//     if (!bone || !rDir || !restQ || targetDir.lengthSq() < 0.001) return;
//     bone.quaternion.copy(restQ);
//     const restWorldQ = new THREE.Quaternion();
//     bone.getWorldQuaternion(restWorldQ);
//     const dot = rDir.dot(targetDir);
//     if (dot < -0.9999) {
//       const perp = Math.abs(rDir.x) < 0.9 ? new THREE.Vector3(1,0,0) : new THREE.Vector3(0,1,0);
//       const axis = new THREE.Vector3().crossVectors(rDir, perp).normalize();
//       const delta180 = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI);
//       const desired  = delta180.multiply(restWorldQ);
//       const parentWorldQ = new THREE.Quaternion();
//       if (bone.parent) bone.parent.getWorldQuaternion(parentWorldQ);
//       bone.quaternion.copy(parentWorldQ.invert().multiply(desired));
//       return;
//     }
//     const delta = new THREE.Quaternion().setFromUnitVectors(rDir, targetDir);
//     const desiredWorldQ = delta.multiply(restWorldQ);
//     const parentWorldQ  = new THREE.Quaternion();
//     if (bone.parent) bone.parent.getWorldQuaternion(parentWorldQ);
//     bone.quaternion.slerp(parentWorldQ.invert().multiply(desiredWorldQ), alpha);
//   }

//   function driveFinger(lm: number[][], mcp: number, pip: number, dip: number, tip: number,
//     b1: string, b2: string, b3: string) {
//     rotateBoneToward(b1, mpDir(lm[mcp], lm[pip]));
//     rotateBoneToward(b2, mpDir(lm[pip], lm[dip]));
//     rotateBoneToward(b3, mpDir(lm[dip], lm[tip]));
//   }

//   function driveHand(hand: number[][], side: "l" | "r") {
//     if (!hand || hand.length < 21) return;
//     const s = side;
//     rotateBoneToward(BONES[`${s}_hand`], mpDir(hand[0], hand[9]));
//     driveFinger(hand,1,2,3,4,     BONES[`${s}_thumb1`],BONES[`${s}_thumb2`],BONES[`${s}_thumb3`]);
//     driveFinger(hand,5,6,7,8,     BONES[`${s}_index1`],BONES[`${s}_index2`],BONES[`${s}_index3`]);
//     driveFinger(hand,9,10,11,12,  BONES[`${s}_mid1`],  BONES[`${s}_mid2`],  BONES[`${s}_mid3`]);
//     driveFinger(hand,13,14,15,16, BONES[`${s}_ring1`], BONES[`${s}_ring2`], BONES[`${s}_ring3`]);
//     driveFinger(hand,17,18,19,20, BONES[`${s}_pinky1`],BONES[`${s}_pinky2`],BONES[`${s}_pinky3`]);
//   }

//   useFrame((_, delta) => {
//     if (!isPlaying || !keypoints?.length) return;
//     elapsed.current += Math.min(delta, 0.1);
//     if (elapsed.current >= frameInterval) {
//       elapsed.current = 0;
//       if (frameIndex < keypoints.length - 1) onFrameAdvance();
//     }
//     const frame = keypoints[frameIndex];
//     if (!frame) return;
//     const pose  = frame.pose       as number[][] | undefined;
//     const left  = frame.left_hand  as number[][] | undefined;
//     const right = frame.right_hand as number[][] | undefined;
//     if (pose && pose.length >= 17) {
//       rotateBoneToward(BONES.r_upperarm, mpDir(pose[11], pose[13]));
//       rotateBoneToward(BONES.r_forearm,  mpDir(pose[13], pose[15]));
//       rotateBoneToward(BONES.l_upperarm, mpDir(pose[12], pose[14]));
//       rotateBoneToward(BONES.l_forearm,  mpDir(pose[14], pose[16]));
//     }
//     if (left)  driveHand(left,  "r");
//     if (right) driveHand(right, "l");
//   });

//   return (
//     <group position={[0, -0.8, 0]}>
//       <primitive object={scene} scale={1} />
//     </group>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    SKELETON CONNECTIONS
// ───────────────────────────────────────────────────────────── */
// const POSE_CONNECTIONS: [number, number][] = [
//   [11,12],[11,13],[13,15],[12,14],[14,16],
//   [11,23],[12,24],[23,24],[23,25],[24,26],
//   [25,27],[26,28],[27,29],[28,30],[29,31],[30,32],
// ];
// const HAND_CONNECTIONS: [number, number][] = [
//   [0,1],[1,2],[2,3],[3,4],
//   [0,5],[5,6],[6,7],[7,8],
//   [0,9],[9,10],[10,11],[11,12],
//   [0,13],[13,14],[14,15],[15,16],
//   [0,17],[17,18],[18,19],[19,20],
//   [5,9],[9,13],[13,17],
// ];

// /* ─────────────────────────────────────────────────────────────
//    SKELETON VIEWER (2-D canvas)
// ───────────────────────────────────────────────────────────── */
// function SkeletonViewer({
//   keypoints,
//   fps,
//   isPlaying,
//   frameIndex,
//   onFrameAdvance,
// }: {
//   keypoints: any[];
//   fps: number;
//   isPlaying: boolean;
//   frameIndex: number;
//   onFrameAdvance: () => void;
// }) {
//   const canvasRef    = useRef<HTMLCanvasElement>(null);
//   const rafRef       = useRef<number>(0);
//   const lastTimeRef  = useRef<number>(0);
//   const frameInterval = 1000 / fps;

//   // Keep a ref to the latest values so RAF closure stays fresh
//   const isPlayingRef   = useRef(isPlaying);
//   const frameIndexRef  = useRef(frameIndex);
//   const totalRef       = useRef(keypoints.length);
//   useEffect(() => { isPlayingRef.current  = isPlaying;       }, [isPlaying]);
//   useEffect(() => { frameIndexRef.current = frameIndex;      }, [frameIndex]);
//   useEffect(() => { totalRef.current      = keypoints.length;}, [keypoints.length]);

//   // ── draw one frame ──────────────────────────────────────
//   const draw = useCallback((frameIdx: number) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     const W = canvas.width;
//     const H = canvas.height;

//     ctx.fillStyle = "#080d1a";
//     ctx.fillRect(0, 0, W, H);
//     ctx.strokeStyle = "rgba(99,102,241,0.08)";
//     ctx.lineWidth = 1;
//     for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
//     for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

//     const frame = keypoints[frameIdx];
//     if (!frame) return;

//     const pose  = frame.pose       as number[][] | undefined;
//     const left  = frame.left_hand  as number[][] | undefined;
//     const right = frame.right_hand as number[][] | undefined;

//     // pose world coords: negate x to mirror for viewer, keep y natural (up = up)
//     function poseXY(pt: number[]): [number, number] {
//       return [(-pt[0] * 0.55 + 0.5) * W, (pt[1] * 0.55 + 0.38) * H];
//     }
//     // Hand landmarks in metres (world space). Anchor from wrist canvas pos.
//     // HAND_SCALE magnifies so individual fingers are clearly visible.
//     const HAND_SCALE = 400;
//     function handXY(pt: number[], wx: number, wy: number): [number, number] {
//       return [wx + (-pt[0]) * HAND_SCALE, wy + pt[1] * HAND_SCALE];
//     }

//     // ── Face (landmarks 0–10) ──────────────────────────────
//     if (pose && pose.length >= 11) {
//       const nose   = pose[0]  ? poseXY(pose[0])  : null;
//       const lEye   = pose[2]  ? poseXY(pose[2])  : null;
//       const rEye   = pose[5]  ? poseXY(pose[5])  : null;
//       const lEar   = pose[7]  ? poseXY(pose[7])  : null;
//       const rEar   = pose[8]  ? poseXY(pose[8])  : null;
//       const mouthL = pose[9]  ? poseXY(pose[9])  : null;
//       const mouthR = pose[10] ? poseXY(pose[10]) : null;

//       // Head circle from ear span
//       if (lEar && rEar) {
//         const hcx = (lEar[0] + rEar[0]) / 2;
//         const hcy = (lEar[1] + rEar[1]) / 2;
//         const hr  = Math.hypot(lEar[0] - rEar[0], lEar[1] - rEar[1]) * 0.65;
//         ctx.beginPath(); ctx.arc(hcx, hcy, hr, 0, Math.PI * 2);
//         ctx.strokeStyle = "rgba(167,139,250,0.45)"; ctx.lineWidth = 1.5; ctx.stroke();
//       }

//       // Nose → eye guide lines
//       if (nose && lEye) {
//         ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.lineTo(lEye[0], lEye[1]);
//         ctx.strokeStyle = "rgba(167,139,250,0.25)"; ctx.lineWidth = 1; ctx.stroke();
//       }
//       if (nose && rEye) {
//         ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.lineTo(rEye[0], rEye[1]);
//         ctx.strokeStyle = "rgba(167,139,250,0.25)"; ctx.lineWidth = 1; ctx.stroke();
//       }

//       // Mouth
//       if (mouthL && mouthR) {
//         ctx.beginPath(); ctx.moveTo(mouthL[0], mouthL[1]); ctx.lineTo(mouthR[0], mouthR[1]);
//         ctx.strokeStyle = "rgba(244,114,182,0.85)"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.stroke();
//       }

//       // Eyes
//       for (const eye of [lEye, rEye]) {
//         if (!eye) continue;
//         ctx.beginPath(); ctx.arc(eye[0], eye[1], 3.5, 0, Math.PI * 2);
//         ctx.fillStyle = "#a5b4fc"; ctx.shadowColor = "#818cf8"; ctx.shadowBlur = 8;
//         ctx.fill(); ctx.shadowBlur = 0;
//       }

//       // Ears
//       for (const ear of [lEar, rEar]) {
//         if (!ear) continue;
//         ctx.beginPath(); ctx.arc(ear[0], ear[1], 3, 0, Math.PI * 2);
//         ctx.fillStyle = "#818cf8"; ctx.fill();
//       }

//       // Nose
//       if (nose) {
//         ctx.beginPath(); ctx.arc(nose[0], nose[1], 3, 0, Math.PI * 2);
//         ctx.fillStyle = "#c4b5fd"; ctx.shadowColor = "#a78bfa"; ctx.shadowBlur = 6;
//         ctx.fill(); ctx.shadowBlur = 0;
//       }
//     }

//     // ── Body skeleton (landmarks 11+) ──────────────────────
//     if (pose && pose.length >= 17) {
//       ctx.lineCap = "round";
//       for (const [a, b] of POSE_CONNECTIONS) {
//         if (!pose[a] || !pose[b]) continue;
//         const [ax, ay] = poseXY(pose[a]);
//         const [bx, by] = poseXY(pose[b]);
//         const grad = ctx.createLinearGradient(ax, ay, bx, by);
//         grad.addColorStop(0, "rgba(99,102,241,0.9)");
//         grad.addColorStop(1, "rgba(167,139,250,0.9)");
//         ctx.strokeStyle = grad; ctx.lineWidth = 2.5;
//         ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
//       }
//       for (let i = 11; i <= 32; i++) {
//         if (!pose[i]) continue;
//         const [x, y] = poseXY(pose[i]);
//         const isWrist = i === 15 || i === 16;
//         ctx.beginPath(); ctx.arc(x, y, isWrist ? 5 : 4, 0, Math.PI * 2);
//         ctx.fillStyle   = isWrist ? "#f472b6" : "#818cf8";
//         ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
//         ctx.fill(); ctx.shadowBlur = 0;
//       }
//     }

//     const leftWrist  = pose?.[15] ? poseXY(pose[15]) : [W * 0.65, H * 0.62] as [number,number];
//     const rightWrist = pose?.[16] ? poseXY(pose[16]) : [W * 0.35, H * 0.62] as [number,number];

//     function drawHand(c: CanvasRenderingContext2D, lm: number[][], wx: number, wy: number, lineColor: string, dotColor: string) {
//       if (!lm || lm.length < 21) return;
//       c.lineCap = "round";
//       c.lineJoin = "round";

//       // Each finger as a chain of straight lines — exactly like the Python MediaPipe style
//       // Chains: thumb=[0,1,2,3,4], index=[0,5,6,7,8], middle=[0,9,10,11,12],
//       //         ring=[0,13,14,15,16], pinky=[0,17,18,19,20]
//       // Palm cross-connections: 5-9, 9-13, 13-17
//       const chains = [
//         [0, 1, 2, 3, 4],       // thumb
//         [0, 5, 6, 7, 8],       // index
//         [0, 9, 10, 11, 12],    // middle
//         [0, 13, 14, 15, 16],   // ring
//         [0, 17, 18, 19, 20],   // pinky
//       ];
//       const palmLinks: [number, number][] = [[5,9],[9,13],[13,17]];

//       // ── Bone lines ─────────────────────────────────────────
//       c.strokeStyle = lineColor;
//       // Slightly thicker near palm, thinner near fingertip
//       chains.forEach((chain) => {
//         for (let s = 0; s < chain.length - 1; s++) {
//           const [ax, ay] = handXY(lm[chain[s]],   wx, wy);
//           const [bx, by] = handXY(lm[chain[s+1]], wx, wy);
//           // Thicker at palm (s=0), thinner near tip
//           c.lineWidth = s === 0 ? 2.5 : s === 1 ? 2.0 : 1.6;
//           c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
//         }
//       });

//       // Palm knuckle cross-bar
//       c.lineWidth = 1.8;
//       palmLinks.forEach(([a, b]) => {
//         const [ax, ay] = handXY(lm[a], wx, wy);
//         const [bx, by] = handXY(lm[b], wx, wy);
//         c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
//       });

//       // ── Joint dots ─────────────────────────────────────────
//       for (let i = 0; i < 21; i++) {
//         const [x, y] = handXY(lm[i], wx, wy);
//         // Tips (4,8,12,16,20) are white; knuckles are dotColor; wrist is larger
//         const isTip   = [4, 8, 12, 16, 20].includes(i);
//         const isWrist = i === 0;
//         const r = isWrist ? 5 : isTip ? 3.5 : 2.5;
//         c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
//         c.fillStyle   = isTip ? "#ffffff" : dotColor;
//         c.shadowColor = dotColor;
//         c.shadowBlur  = isTip ? 10 : isWrist ? 14 : 5;
//         c.fill();
//         c.shadowBlur  = 0;
//       }
//     }

//     if (left)  drawHand(ctx, left,  leftWrist[0],  leftWrist[1],  "rgba(251,191,36,0.75)",  "#fbbf24");
//     if (right) drawHand(ctx, right, rightWrist[0], rightWrist[1], "rgba(52,211,153,0.75)",  "#34d399");

//     // Legend
//     ([["#818cf8","Pose"],["#fbbf24","Left Hand"],["#34d399","Right Hand"]] as [string,string][])
//       .forEach(([color, label], i) => {
//         ctx.beginPath(); ctx.arc(14, H - 14 - i * 18, 5, 0, Math.PI * 2);
//         ctx.fillStyle = color; ctx.shadowBlur = 0; ctx.fill();
//         ctx.fillStyle = "rgba(203,213,225,0.7)";
//         ctx.font = "11px monospace"; ctx.fillText(label, 24, H - 10 - i * 18);
//       });

//     ctx.fillStyle = "rgba(129,140,248,0.45)";
//     ctx.font = "10px monospace"; ctx.textAlign = "right";
//     ctx.fillText(`${frameIdx + 1} / ${keypoints.length}`, W - 8, H - 8);
//     ctx.textAlign = "left";
//   }, [keypoints]);

//   // Redraw whenever frameIndex changes
//   useEffect(() => { draw(frameIndex); }, [frameIndex, draw]);

//   // RAF loop for advancing frames
//   useEffect(() => {
//     cancelAnimationFrame(rafRef.current);
//     lastTimeRef.current = 0;
//     if (!isPlaying) return;

//     const loop = (ts: number) => {
//       if (!lastTimeRef.current) lastTimeRef.current = ts;
//       if (ts - lastTimeRef.current >= frameInterval) {
//         lastTimeRef.current = ts;
//         if (frameIndexRef.current < totalRef.current - 1) {
//           onFrameAdvance();
//         }
//       }
//       rafRef.current = requestAnimationFrame(loop);
//     };
//     rafRef.current = requestAnimationFrame(loop);
//     return () => cancelAnimationFrame(rafRef.current);
//   }, [isPlaying, frameInterval, onFrameAdvance]);

//   return (
//     <canvas
//       ref={canvasRef}
//       width={520}
//       height={400}
//       style={{ width: "100%", height: "100%", display: "block" }}
//     />
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    PLAYBACK CONTROLS
// ───────────────────────────────────────────────────────────── */
// function PlaybackControls({
//   isPlaying, onPlay, onPause, onReplay, frameIndex, total,
// }: {
//   isPlaying: boolean;
//   onPlay: () => void;
//   onPause: () => void;
//   onReplay: () => void;
//   frameIndex: number;
//   total: number;
// }) {
//   const pct = total > 1 ? (frameIndex / (total - 1)) * 100 : 0;
//   const base: React.CSSProperties = {
//     display: "flex", alignItems: "center", justifyContent: "center",
//     border: "none", cursor: "pointer", transition: "all 0.15s",
//   };
//   return (
//     <div style={{
//       display: "flex", flexDirection: "column", gap: "8px",
//       padding: "10px 16px 12px", flexShrink: 0,
//       background: "rgba(8,13,26,0.92)",
//       borderTop: "1px solid rgba(99,102,241,0.18)",
//     }}>
//       {/* Progress bar */}
//       <div style={{ height: "4px", borderRadius: "4px", background: "rgba(99,102,241,0.15)", overflow: "hidden" }}>
//         <div style={{
//           height: "100%", width: `${pct}%`,
//           background: "linear-gradient(90deg, #6366f1, #a78bfa)",
//           borderRadius: "4px", transition: "width 0.08s linear",
//         }} />
//       </div>
//       {/* Buttons */}
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
//         <button onClick={onReplay} title="Replay" style={{
//           ...base, width: 36, height: 36, borderRadius: "50%",
//           background: "rgba(99,102,241,0.12)",
//           border: "1px solid rgba(99,102,241,0.35)",
//           color: "#a78bfa", fontSize: "18px",
//         }}
//           onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.28)")}
//           onMouseLeave={e => (e.currentTarget.style.background = "rgba(99,102,241,0.12)")}
//         >↺</button>

//         {isPlaying ? (
//           <button onClick={onPause} title="Pause" style={{
//             ...base, width: 46, height: 46, borderRadius: "50%",
//             background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//             color: "#fff", fontSize: "20px",
//             boxShadow: "0 0 20px rgba(99,102,241,0.5)",
//           }}
//             onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
//             onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
//           >⏸</button>
//         ) : (
//           <button onClick={onPlay} title="Play" style={{
//             ...base, width: 46, height: 46, borderRadius: "50%",
//             background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//             color: "#fff", fontSize: "20px",
//             boxShadow: "0 0 20px rgba(99,102,241,0.5)",
//           }}
//             onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
//             onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
//           >▶</button>
//         )}

//         <span style={{
//           fontSize: "11px", fontFamily: "monospace",
//           color: "rgba(129,140,248,0.5)", minWidth: "70px", textAlign: "center",
//         }}>
//           {total > 0 ? `${frameIndex + 1} / ${total}` : "no data"}
//         </span>
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    ROOT EXPORT
// ───────────────────────────────────────────────────────────── */
// export default function AvatarViewer({ keypoints, fps = 25 }: Props) {
//   const [activeTab,  setActiveTab]  = useState<"avatar" | "skeleton">("avatar");
//   const [isPlaying,  setIsPlaying]  = useState(false);
//   const [frameIndex, setFrameIndex] = useState(0);

//   const advanceFrame = useCallback(() => {
//     setFrameIndex(prev => {
//       const next = prev + 1;
//       if (next >= keypoints.length - 1) setIsPlaying(false);
//       return Math.min(next, keypoints.length - 1);
//     });
//   }, [keypoints.length]);

//   useEffect(() => { setFrameIndex(0); setIsPlaying(false); }, [keypoints]);

//   const tab = (active: boolean): React.CSSProperties => ({
//     flex: 1, padding: "9px 0", border: "none", cursor: "pointer",
//     background: active ? "rgba(99,102,241,0.2)" : "transparent",
//     borderBottom: `2px solid ${active ? "#818cf8" : "transparent"}`,
//     color: active ? "#c7d2fe" : "rgba(148,163,184,0.5)",
//     fontWeight: active ? 600 : 400, fontSize: "13px",
//     letterSpacing: "0.04em", transition: "all 0.18s",
//   });

//   return (
//     <div style={{
//       display: "flex", flexDirection: "column",
//       height: "100%", width: "100%",
//       background: "#080d1a",
//     }}>
//       {/* TAB BAR */}
//       <div style={{
//         display: "flex", flexShrink: 0,
//         background: "rgba(8,13,26,0.98)",
//         borderBottom: "1px solid rgba(99,102,241,0.18)",
//       }}>
//         <button style={tab(activeTab === "avatar")}   onClick={() => setActiveTab("avatar")}>
//           🧍 Avatar
//         </button>
//         <button style={tab(activeTab === "skeleton")} onClick={() => setActiveTab("skeleton")}>
//           🦴 Skeleton
//         </button>
//       </div>

//       {/* VIEWER */}
//       <div style={{ flex: 1, position: "relative", minHeight: 0 }}>

//         {/* Avatar */}
//         <div style={{ position: "absolute", inset: 0, display: activeTab === "avatar" ? "block" : "none" }}>
//           <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
//             <ambientLight intensity={0.6} />
//             <directionalLight position={[2, 4, 3]} intensity={1.4} />
//             <AnimatedAvatar
//               keypoints={keypoints} fps={fps}
//               isPlaying={isPlaying} frameIndex={frameIndex}
//               onFrameAdvance={advanceFrame}
//             />
//           </Canvas>
//         </div>

//         {/* Skeleton */}
//         <div style={{
//           position: "absolute", inset: 0,
//           display: activeTab === "skeleton" ? "flex" : "none",
//           alignItems: "center", justifyContent: "center",
//         }}>
//           {keypoints.length > 0 ? (
//             <SkeletonViewer
//               keypoints={keypoints} fps={fps}
//               isPlaying={isPlaying} frameIndex={frameIndex}
//               onFrameAdvance={advanceFrame}
//             />
//           ) : (
//             <div style={{ textAlign: "center", color: "rgba(148,163,184,0.4)" }}>
//               <div style={{ fontSize: "36px", marginBottom: "8px" }}>🦴</div>
//               <div style={{ fontSize: "13px" }}>No keypoints loaded yet</div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* CONTROLS */}
//       <PlaybackControls
//         isPlaying={isPlaying}
//         onPlay={() => setIsPlaying(true)}
//         onPause={() => setIsPlaying(false)}
//         onReplay={() => { setFrameIndex(0); setIsPlaying(true); }}
//         frameIndex={frameIndex}
//         total={keypoints.length}
//       />
//     </div>
//   );
// }



// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF } from "@react-three/drei";
// import { useEffect, useRef, useState, useCallback } from "react";
// import * as THREE from "three";

// interface Props {
//   keypoints: any[];
//   fps?: number;
// }

// /* ─────────────────────────────────────────────────────────────
//    MIXAMO BONE MAP
// ───────────────────────────────────────────────────────────── */
// const BONES = {
//   l_upperarm: "LeftArm",
//   l_forearm:  "LeftForeArm",
//   l_hand:     "LeftHand",
//   r_upperarm: "RightArm",
//   r_forearm:  "RightForeArm",
//   r_hand:     "RightHand",
//   l_thumb1: "LeftHandThumb1",  l_thumb2: "LeftHandThumb2",  l_thumb3: "LeftHandThumb3",
//   l_index1: "LeftHandIndex1",  l_index2: "LeftHandIndex2",  l_index3: "LeftHandIndex3",
//   l_mid1:   "LeftHandMiddle1", l_mid2:   "LeftHandMiddle2", l_mid3:   "LeftHandMiddle3",
//   l_ring1:  "LeftHandRing1",   l_ring2:  "LeftHandRing2",   l_ring3:  "LeftHandRing3",
//   l_pinky1: "LeftHandPinky1",  l_pinky2: "LeftHandPinky2",  l_pinky3: "LeftHandPinky3",
//   r_thumb1: "RightHandThumb1", r_thumb2: "RightHandThumb2", r_thumb3: "RightHandThumb3",
//   r_index1: "RightHandIndex1", r_index2: "RightHandIndex2", r_index3: "RightHandIndex3",
//   r_mid1:   "RightHandMiddle1",r_mid2:   "RightHandMiddle2",r_mid3:   "RightHandMiddle3",
//   r_ring1:  "RightHandRing1",  r_ring2:  "RightHandRing2",  r_ring3:  "RightHandRing3",
//   r_pinky1: "RightHandPinky1", r_pinky2: "RightHandPinky2", r_pinky3: "RightHandPinky3",
// } as const;

// /* ─────────────────────────────────────────────────────────────
//    MEDIAPIPE HELPERS
// ───────────────────────────────────────────────────────────── */
// function mpToWorld(p: number[]): THREE.Vector3 {
//   return new THREE.Vector3(-p[0], -p[1], p[2]);
// }
// function mpDir(a: number[], b: number[]): THREE.Vector3 {
//   return mpToWorld(b).sub(mpToWorld(a)).normalize();
// }

// /* ─────────────────────────────────────────────────────────────
//    ANIMATED AVATAR (3-D)
// ───────────────────────────────────────────────────────────── */
// function AnimatedAvatar({
//   keypoints,
//   fps = 25,
//   isPlaying,
//   frameIndex,
//   onFrameAdvance,
// }: Props & {
//   isPlaying: boolean;
//   frameIndex: number;
//   onFrameAdvance: () => void;
// }) {
//   const { scene } = useGLTF("/avatar.glb");
//   const bonesRef   = useRef<Record<string, THREE.Bone>>({});
//   const restDir    = useRef<Record<string, THREE.Vector3>>({});
//   const restLocalQ = useRef<Record<string, THREE.Quaternion>>({});
//   const elapsed    = useRef(0);
//   const frameInterval = 1 / fps;

//   useEffect(() => {
//     scene.traverse((obj) => {
//       if (!(obj as THREE.Bone).isBone) return;
//       const bone = obj as THREE.Bone;
//       bonesRef.current[bone.name]   = bone;
//       restLocalQ.current[bone.name] = bone.quaternion.clone();
//     });
//     scene.traverse((obj) => {
//       if (!(obj as THREE.Bone).isBone) return;
//       const bone = obj as THREE.Bone;
//       const childBone = bone.children.find(c => (c as THREE.Bone).isBone) as THREE.Object3D | undefined;
//       if (childBone) {
//         const bPos = new THREE.Vector3();
//         const cPos = new THREE.Vector3();
//         bone.getWorldPosition(bPos);
//         childBone.getWorldPosition(cPos);
//         restDir.current[bone.name] = cPos.sub(bPos).normalize();
//       }
//     });
//   }, [scene]);

//   useEffect(() => { elapsed.current = 0; }, [keypoints]);

//   function rotateBoneToward(boneName: string, targetDir: THREE.Vector3, alpha = 1.0) {
//     const bone  = bonesRef.current[boneName];
//     const rDir  = restDir.current[boneName];
//     const restQ = restLocalQ.current[boneName];
//     if (!bone || !rDir || !restQ || targetDir.lengthSq() < 0.001) return;
//     bone.quaternion.copy(restQ);
//     const restWorldQ = new THREE.Quaternion();
//     bone.getWorldQuaternion(restWorldQ);
//     const dot = rDir.dot(targetDir);
//     if (dot < -0.9999) {
//       const perp = Math.abs(rDir.x) < 0.9 ? new THREE.Vector3(1,0,0) : new THREE.Vector3(0,1,0);
//       const axis = new THREE.Vector3().crossVectors(rDir, perp).normalize();
//       const delta180 = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI);
//       const desired  = delta180.multiply(restWorldQ);
//       const parentWorldQ = new THREE.Quaternion();
//       if (bone.parent) bone.parent.getWorldQuaternion(parentWorldQ);
//       bone.quaternion.copy(parentWorldQ.invert().multiply(desired));
//       return;
//     }
//     const delta = new THREE.Quaternion().setFromUnitVectors(rDir, targetDir);
//     const desiredWorldQ = delta.multiply(restWorldQ);
//     const parentWorldQ  = new THREE.Quaternion();
//     if (bone.parent) bone.parent.getWorldQuaternion(parentWorldQ);
//     bone.quaternion.slerp(parentWorldQ.invert().multiply(desiredWorldQ), alpha);
//   }

//   function driveFinger(lm: number[][], mcp: number, pip: number, dip: number, tip: number,
//     b1: string, b2: string, b3: string) {
//     rotateBoneToward(b1, mpDir(lm[mcp], lm[pip]));
//     rotateBoneToward(b2, mpDir(lm[pip], lm[dip]));
//     rotateBoneToward(b3, mpDir(lm[dip], lm[tip]));
//   }

//   function driveHand(hand: number[][], side: "l" | "r") {
//     if (!hand || hand.length < 21) return;
//     const s = side;
//     rotateBoneToward(BONES[`${s}_hand`], mpDir(hand[0], hand[9]));
//     driveFinger(hand,1,2,3,4,     BONES[`${s}_thumb1`],BONES[`${s}_thumb2`],BONES[`${s}_thumb3`]);
//     driveFinger(hand,5,6,7,8,     BONES[`${s}_index1`],BONES[`${s}_index2`],BONES[`${s}_index3`]);
//     driveFinger(hand,9,10,11,12,  BONES[`${s}_mid1`],  BONES[`${s}_mid2`],  BONES[`${s}_mid3`]);
//     driveFinger(hand,13,14,15,16, BONES[`${s}_ring1`], BONES[`${s}_ring2`], BONES[`${s}_ring3`]);
//     driveFinger(hand,17,18,19,20, BONES[`${s}_pinky1`],BONES[`${s}_pinky2`],BONES[`${s}_pinky3`]);
//   }

//   useFrame((_, delta) => {
//     if (!isPlaying || !keypoints?.length) return;
//     elapsed.current += Math.min(delta, 0.1);
//     if (elapsed.current >= frameInterval) {
//       elapsed.current = 0;
//       if (frameIndex < keypoints.length - 1) onFrameAdvance();
//     }
//     const frame = keypoints[frameIndex];
//     if (!frame) return;
//     const pose  = frame.pose       as number[][] | undefined;
//     const left  = frame.left_hand  as number[][] | undefined;
//     const right = frame.right_hand as number[][] | undefined;
//     if (pose && pose.length >= 17) {
//       rotateBoneToward(BONES.r_upperarm, mpDir(pose[11], pose[13]));
//       rotateBoneToward(BONES.r_forearm,  mpDir(pose[13], pose[15]));
//       rotateBoneToward(BONES.l_upperarm, mpDir(pose[12], pose[14]));
//       rotateBoneToward(BONES.l_forearm,  mpDir(pose[14], pose[16]));
//     }
//     if (left)  driveHand(left,  "r");
//     if (right) driveHand(right, "l");
//   });

//   return (
//     <group position={[0, -0.8, 0]}>
//       <primitive object={scene} scale={1} />
//     </group>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    SKELETON CONNECTIONS
// ───────────────────────────────────────────────────────────── */
// const POSE_CONNECTIONS: [number, number][] = [
//   [11,12],[11,13],[13,15],[12,14],[14,16],
//   [11,23],[12,24],[23,24],[23,25],[24,26],
//   [25,27],[26,28],[27,29],[28,30],[29,31],[30,32],
// ];
// const HAND_CONNECTIONS: [number, number][] = [
//   [0,1],[1,2],[2,3],[3,4],
//   [0,5],[5,6],[6,7],[7,8],
//   [0,9],[9,10],[10,11],[11,12],
//   [0,13],[13,14],[14,15],[15,16],
//   [0,17],[17,18],[18,19],[19,20],
//   [5,9],[9,13],[13,17],
// ];

// /* ─────────────────────────────────────────────────────────────
//    SKELETON VIEWER (2-D canvas)
// ───────────────────────────────────────────────────────────── */
// function SkeletonViewer({
//   keypoints,
//   fps,
//   isPlaying,
//   frameIndex,
//   onFrameAdvance,
// }: {
//   keypoints: any[];
//   fps: number;
//   isPlaying: boolean;
//   frameIndex: number;
//   onFrameAdvance: () => void;
// }) {
//   const canvasRef    = useRef<HTMLCanvasElement>(null);
//   const rafRef       = useRef<number>(0);
//   const lastTimeRef  = useRef<number>(0);
//   const frameInterval = 1000 / fps;

//   // Keep a ref to the latest values so RAF closure stays fresh
//   const isPlayingRef   = useRef(isPlaying);
//   const frameIndexRef  = useRef(frameIndex);
//   const totalRef       = useRef(keypoints.length);
//   useEffect(() => { isPlayingRef.current  = isPlaying;       }, [isPlaying]);
//   useEffect(() => { frameIndexRef.current = frameIndex;      }, [frameIndex]);
//   useEffect(() => { totalRef.current      = keypoints.length;}, [keypoints.length]);

//   // ── draw one frame ──────────────────────────────────────
//   const draw = useCallback((frameIdx: number) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     const W = canvas.width;
//     const H = canvas.height;

//     ctx.fillStyle = "#080d1a";
//     ctx.fillRect(0, 0, W, H);
//     ctx.strokeStyle = "rgba(99,102,241,0.08)";
//     ctx.lineWidth = 1;
//     for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
//     for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

//     const frame = keypoints[frameIdx];
//     if (!frame) return;

//     const pose  = frame.pose       as number[][] | undefined;
//     const left  = frame.left_hand  as number[][] | undefined;
//     const right = frame.right_hand as number[][] | undefined;

//     // pose world coords: negate x to mirror for viewer, keep y natural (up = up)
//     function poseXY(pt: number[]): [number, number] {
//       return [(-pt[0] * 0.55 + 0.5) * W, (pt[1] * 0.55 + 0.38) * H];
//     }
//     // Hand landmarks are in world space (metres), wrist-relative after subtracting lm[0].
//     // Use the SAME scale as poseXY (0.55 * canvas dimension) so the hand
//     // sits flush against the pose wrist with no gap or overlap.
//     function handXY(pt: number[], wristLm: number[], wx: number, wy: number): [number, number] {
//       const rx = pt[0] - wristLm[0]; // relative to wrist landmark
//       const ry = pt[1] - wristLm[1];
//       return [wx + (-rx) * 0.55 * W, wy + ry * 0.55 * H];
//     }

//     // ── Face (landmarks 0–10) ──────────────────────────────
//     if (pose && pose.length >= 11) {
//       const nose   = pose[0]  ? poseXY(pose[0])  : null;
//       const lEye   = pose[2]  ? poseXY(pose[2])  : null;
//       const rEye   = pose[5]  ? poseXY(pose[5])  : null;
//       const lEar   = pose[7]  ? poseXY(pose[7])  : null;
//       const rEar   = pose[8]  ? poseXY(pose[8])  : null;
//       const mouthL = pose[9]  ? poseXY(pose[9])  : null;
//       const mouthR = pose[10] ? poseXY(pose[10]) : null;

//       // Head circle from ear span
//       if (lEar && rEar) {
//         const hcx = (lEar[0] + rEar[0]) / 2;
//         const hcy = (lEar[1] + rEar[1]) / 2;
//         const hr  = Math.hypot(lEar[0] - rEar[0], lEar[1] - rEar[1]) * 0.65;
//         ctx.beginPath(); ctx.arc(hcx, hcy, hr, 0, Math.PI * 2);
//         ctx.strokeStyle = "rgba(167,139,250,0.45)"; ctx.lineWidth = 1.5; ctx.stroke();
//       }

//       // Nose → eye guide lines
//       if (nose && lEye) {
//         ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.lineTo(lEye[0], lEye[1]);
//         ctx.strokeStyle = "rgba(167,139,250,0.25)"; ctx.lineWidth = 1; ctx.stroke();
//       }
//       if (nose && rEye) {
//         ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.lineTo(rEye[0], rEye[1]);
//         ctx.strokeStyle = "rgba(167,139,250,0.25)"; ctx.lineWidth = 1; ctx.stroke();
//       }

//       // Mouth
//       if (mouthL && mouthR) {
//         ctx.beginPath(); ctx.moveTo(mouthL[0], mouthL[1]); ctx.lineTo(mouthR[0], mouthR[1]);
//         ctx.strokeStyle = "rgba(244,114,182,0.85)"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.stroke();
//       }

//       // Eyes
//       for (const eye of [lEye, rEye]) {
//         if (!eye) continue;
//         ctx.beginPath(); ctx.arc(eye[0], eye[1], 3.5, 0, Math.PI * 2);
//         ctx.fillStyle = "#a5b4fc"; ctx.shadowColor = "#818cf8"; ctx.shadowBlur = 8;
//         ctx.fill(); ctx.shadowBlur = 0;
//       }

//       // Ears
//       for (const ear of [lEar, rEar]) {
//         if (!ear) continue;
//         ctx.beginPath(); ctx.arc(ear[0], ear[1], 3, 0, Math.PI * 2);
//         ctx.fillStyle = "#818cf8"; ctx.fill();
//       }

//       // Nose
//       if (nose) {
//         ctx.beginPath(); ctx.arc(nose[0], nose[1], 3, 0, Math.PI * 2);
//         ctx.fillStyle = "#c4b5fd"; ctx.shadowColor = "#a78bfa"; ctx.shadowBlur = 6;
//         ctx.fill(); ctx.shadowBlur = 0;
//       }
//     }

//     // ── Body skeleton (landmarks 11+) ──────────────────────
//     if (pose && pose.length >= 17) {
//       ctx.lineCap = "round";
//       for (const [a, b] of POSE_CONNECTIONS) {
//         if (!pose[a] || !pose[b]) continue;
//         const [ax, ay] = poseXY(pose[a]);
//         const [bx, by] = poseXY(pose[b]);
//         const grad = ctx.createLinearGradient(ax, ay, bx, by);
//         grad.addColorStop(0, "rgba(99,102,241,0.9)");
//         grad.addColorStop(1, "rgba(167,139,250,0.9)");
//         ctx.strokeStyle = grad; ctx.lineWidth = 2.5;
//         ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
//       }
//       for (let i = 11; i <= 32; i++) {
//         if (!pose[i]) continue;
//         const [x, y] = poseXY(pose[i]);
//         const isWrist = i === 15 || i === 16;
//         ctx.beginPath(); ctx.arc(x, y, isWrist ? 5 : 4, 0, Math.PI * 2);
//         ctx.fillStyle   = isWrist ? "#f472b6" : "#818cf8";
//         ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
//         ctx.fill(); ctx.shadowBlur = 0;
//       }
//     }

//     const leftWrist  = pose?.[15] ? poseXY(pose[15]) : [W * 0.65, H * 0.62] as [number,number];
//     const rightWrist = pose?.[16] ? poseXY(pose[16]) : [W * 0.35, H * 0.62] as [number,number];

//     function drawHand(c: CanvasRenderingContext2D, lm: number[][], wx: number, wy: number, lineColor: string, dotColor: string) {
//       if (!lm || lm.length < 21) return;
//       c.lineCap = "round";
//       c.lineJoin = "round";

//       // Each finger as a chain of straight lines — exactly like the Python MediaPipe style
//       // Chains: thumb=[0,1,2,3,4], index=[0,5,6,7,8], middle=[0,9,10,11,12],
//       //         ring=[0,13,14,15,16], pinky=[0,17,18,19,20]
//       // Palm cross-connections: 5-9, 9-13, 13-17
//       const chains = [
//         [0, 1, 2, 3, 4],       // thumb
//         [0, 5, 6, 7, 8],       // index
//         [0, 9, 10, 11, 12],    // middle
//         [0, 13, 14, 15, 16],   // ring
//         [0, 17, 18, 19, 20],   // pinky
//       ];
//       const palmLinks: [number, number][] = [[5,9],[9,13],[13,17]];

//       // ── Bone lines ─────────────────────────────────────────
//       c.strokeStyle = lineColor;
//       // Slightly thicker near palm, thinner near fingertip
//       chains.forEach((chain) => {
//         for (let s = 0; s < chain.length - 1; s++) {
//           const [ax, ay] = handXY(lm[chain[s]],   lm[0], wx, wy);
//           const [bx, by] = handXY(lm[chain[s+1]], lm[0], wx, wy);
//           // Thicker at palm (s=0), thinner near tip
//           c.lineWidth = s === 0 ? 2.5 : s === 1 ? 2.0 : 1.6;
//           c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
//         }
//       });

//       // Palm knuckle cross-bar
//       c.lineWidth = 1.8;
//       palmLinks.forEach(([a, b]) => {
//         const [ax, ay] = handXY(lm[a], lm[0], wx, wy);
//         const [bx, by] = handXY(lm[b], lm[0], wx, wy);
//         c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
//       });

//       // ── Joint dots ─────────────────────────────────────────
//       for (let i = 0; i < 21; i++) {
//         const [x, y] = handXY(lm[i], lm[0], wx, wy);
//         // Tips (4,8,12,16,20) are white; knuckles are dotColor; wrist is larger
//         const isTip   = [4, 8, 12, 16, 20].includes(i);
//         const isWrist = i === 0;
//         const r = isWrist ? 5 : isTip ? 3.5 : 2.5;
//         c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
//         c.fillStyle   = isTip ? "#ffffff" : dotColor;
//         c.shadowColor = dotColor;
//         c.shadowBlur  = isTip ? 10 : isWrist ? 14 : 5;
//         c.fill();
//         c.shadowBlur  = 0;
//       }
//     }

//     if (left)  drawHand(ctx, left,  leftWrist[0],  leftWrist[1],  "rgba(251,191,36,0.75)",  "#fbbf24");
//     if (right) drawHand(ctx, right, rightWrist[0], rightWrist[1], "rgba(52,211,153,0.75)",  "#34d399");

//     // Legend
//     ([["#818cf8","Pose"],["#fbbf24","Left Hand"],["#34d399","Right Hand"]] as [string,string][])
//       .forEach(([color, label], i) => {
//         ctx.beginPath(); ctx.arc(14, H - 14 - i * 18, 5, 0, Math.PI * 2);
//         ctx.fillStyle = color; ctx.shadowBlur = 0; ctx.fill();
//         ctx.fillStyle = "rgba(203,213,225,0.7)";
//         ctx.font = "11px monospace"; ctx.fillText(label, 24, H - 10 - i * 18);
//       });

//     ctx.fillStyle = "rgba(129,140,248,0.45)";
//     ctx.font = "10px monospace"; ctx.textAlign = "right";
//     ctx.fillText(`${frameIdx + 1} / ${keypoints.length}`, W - 8, H - 8);
//     ctx.textAlign = "left";
//   }, [keypoints]);

//   // Redraw whenever frameIndex changes
//   useEffect(() => { draw(frameIndex); }, [frameIndex, draw]);

//   // RAF loop for advancing frames
//   useEffect(() => {
//     cancelAnimationFrame(rafRef.current);
//     lastTimeRef.current = 0;
//     if (!isPlaying) return;

//     const loop = (ts: number) => {
//       if (!lastTimeRef.current) lastTimeRef.current = ts;
//       if (ts - lastTimeRef.current >= frameInterval) {
//         lastTimeRef.current = ts;
//         if (frameIndexRef.current < totalRef.current - 1) {
//           onFrameAdvance();
//         }
//       }
//       rafRef.current = requestAnimationFrame(loop);
//     };
//     rafRef.current = requestAnimationFrame(loop);
//     return () => cancelAnimationFrame(rafRef.current);
//   }, [isPlaying, frameInterval, onFrameAdvance]);

//   return (
//     <canvas
//       ref={canvasRef}
//       width={520}
//       height={400}
//       style={{ width: "100%", height: "100%", display: "block" }}
//     />
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    PLAYBACK CONTROLS
// ───────────────────────────────────────────────────────────── */
// function PlaybackControls({
//   isPlaying, onPlay, onPause, onReplay, frameIndex, total,
// }: {
//   isPlaying: boolean;
//   onPlay: () => void;
//   onPause: () => void;
//   onReplay: () => void;
//   frameIndex: number;
//   total: number;
// }) {
//   const pct = total > 1 ? (frameIndex / (total - 1)) * 100 : 0;
//   const base: React.CSSProperties = {
//     display: "flex", alignItems: "center", justifyContent: "center",
//     border: "none", cursor: "pointer", transition: "all 0.15s",
//   };
//   return (
//     <div style={{
//       display: "flex", flexDirection: "column", gap: "8px",
//       padding: "10px 16px 12px", flexShrink: 0,
//       background: "rgba(8,13,26,0.92)",
//       borderTop: "1px solid rgba(99,102,241,0.18)",
//     }}>
//       {/* Progress bar */}
//       <div style={{ height: "4px", borderRadius: "4px", background: "rgba(99,102,241,0.15)", overflow: "hidden" }}>
//         <div style={{
//           height: "100%", width: `${pct}%`,
//           background: "linear-gradient(90deg, #6366f1, #a78bfa)",
//           borderRadius: "4px", transition: "width 0.08s linear",
//         }} />
//       </div>
//       {/* Buttons */}
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
//         <button onClick={onReplay} title="Replay" style={{
//           ...base, width: 36, height: 36, borderRadius: "50%",
//           background: "rgba(99,102,241,0.12)",
//           border: "1px solid rgba(99,102,241,0.35)",
//           color: "#a78bfa", fontSize: "18px",
//         }}
//           onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.28)")}
//           onMouseLeave={e => (e.currentTarget.style.background = "rgba(99,102,241,0.12)")}
//         >↺</button>

//         {isPlaying ? (
//           <button onClick={onPause} title="Pause" style={{
//             ...base, width: 46, height: 46, borderRadius: "50%",
//             background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//             color: "#fff", fontSize: "20px",
//             boxShadow: "0 0 20px rgba(99,102,241,0.5)",
//           }}
//             onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
//             onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
//           >⏸</button>
//         ) : (
//           <button onClick={onPlay} title="Play" style={{
//             ...base, width: 46, height: 46, borderRadius: "50%",
//             background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//             color: "#fff", fontSize: "20px",
//             boxShadow: "0 0 20px rgba(99,102,241,0.5)",
//           }}
//             onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
//             onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
//           >▶</button>
//         )}

//         <span style={{
//           fontSize: "11px", fontFamily: "monospace",
//           color: "rgba(129,140,248,0.5)", minWidth: "70px", textAlign: "center",
//         }}>
//           {total > 0 ? `${frameIndex + 1} / ${total}` : "no data"}
//         </span>
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    ROOT EXPORT
// ───────────────────────────────────────────────────────────── */
// export default function AvatarViewer({ keypoints, fps = 25 }: Props) {
//   const [activeTab,  setActiveTab]  = useState<"avatar" | "skeleton">("avatar");
//   const [isPlaying,  setIsPlaying]  = useState(false);
//   const [frameIndex, setFrameIndex] = useState(0);

//   const advanceFrame = useCallback(() => {
//     setFrameIndex(prev => {
//       const next = prev + 1;
//       if (next >= keypoints.length - 1) setIsPlaying(false);
//       return Math.min(next, keypoints.length - 1);
//     });
//   }, [keypoints.length]);

//   useEffect(() => { setFrameIndex(0); setIsPlaying(false); }, [keypoints]);

//   const tab = (active: boolean): React.CSSProperties => ({
//     flex: 1, padding: "9px 0", border: "none", cursor: "pointer",
//     background: active ? "rgba(99,102,241,0.2)" : "transparent",
//     borderBottom: `2px solid ${active ? "#818cf8" : "transparent"}`,
//     color: active ? "#c7d2fe" : "rgba(148,163,184,0.5)",
//     fontWeight: active ? 600 : 400, fontSize: "13px",
//     letterSpacing: "0.04em", transition: "all 0.18s",
//   });

//   return (
//     <div style={{
//       display: "flex", flexDirection: "column",
//       height: "100%", width: "100%",
//       background: "#080d1a",
//     }}>
//       {/* TAB BAR */}
//       <div style={{
//         display: "flex", flexShrink: 0,
//         background: "rgba(8,13,26,0.98)",
//         borderBottom: "1px solid rgba(99,102,241,0.18)",
//       }}>
//         <button style={tab(activeTab === "avatar")}   onClick={() => setActiveTab("avatar")}>
//           🧍 Avatar
//         </button>
//         <button style={tab(activeTab === "skeleton")} onClick={() => setActiveTab("skeleton")}>
//           🦴 Skeleton
//         </button>
//       </div>

//       {/* VIEWER */}
//       <div style={{ flex: 1, position: "relative", minHeight: 0 }}>

//         {/* Avatar */}
//         <div style={{ position: "absolute", inset: 0, display: activeTab === "avatar" ? "block" : "none" }}>
//           <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
//             <ambientLight intensity={0.6} />
//             <directionalLight position={[2, 4, 3]} intensity={1.4} />
//             <AnimatedAvatar
//               keypoints={keypoints} fps={fps}
//               isPlaying={isPlaying} frameIndex={frameIndex}
//               onFrameAdvance={advanceFrame}
//             />
//           </Canvas>
//         </div>

//         {/* Skeleton */}
//         <div style={{
//           position: "absolute", inset: 0,
//           display: activeTab === "skeleton" ? "flex" : "none",
//           alignItems: "center", justifyContent: "center",
//         }}>
//           {keypoints.length > 0 ? (
//             <SkeletonViewer
//               keypoints={keypoints} fps={fps}
//               isPlaying={isPlaying} frameIndex={frameIndex}
//               onFrameAdvance={advanceFrame}
//             />
//           ) : (
//             <div style={{ textAlign: "center", color: "rgba(148,163,184,0.4)" }}>
//               <div style={{ fontSize: "36px", marginBottom: "8px" }}>🦴</div>
//               <div style={{ fontSize: "13px" }}>No keypoints loaded yet</div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* CONTROLS */}
//       <PlaybackControls
//         isPlaying={isPlaying}
//         onPlay={() => setIsPlaying(true)}
//         onPause={() => setIsPlaying(false)}
//         onReplay={() => { setFrameIndex(0); setIsPlaying(true); }}
//         frameIndex={frameIndex}
//         total={keypoints.length}
//       />
//     </div>
//   );
// }


// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF } from "@react-three/drei";
// import { useEffect, useRef, useState, useCallback } from "react";
// import * as THREE from "three";

// interface Props {
//   keypoints: any[];
//   fps?: number;
// }

// /* ─────────────────────────────────────────────────────────────
//    MIXAMO BONE MAP
// ───────────────────────────────────────────────────────────── */
// const BONES = {
//   l_upperarm: "LeftArm",
//   l_forearm:  "LeftForeArm",
//   l_hand:     "LeftHand",
//   r_upperarm: "RightArm",
//   r_forearm:  "RightForeArm",
//   r_hand:     "RightHand",
//   l_thumb1: "LeftHandThumb1",  l_thumb2: "LeftHandThumb2",  l_thumb3: "LeftHandThumb3",
//   l_index1: "LeftHandIndex1",  l_index2: "LeftHandIndex2",  l_index3: "LeftHandIndex3",
//   l_mid1:   "LeftHandMiddle1", l_mid2:   "LeftHandMiddle2", l_mid3:   "LeftHandMiddle3",
//   l_ring1:  "LeftHandRing1",   l_ring2:  "LeftHandRing2",   l_ring3:  "LeftHandRing3",
//   l_pinky1: "LeftHandPinky1",  l_pinky2: "LeftHandPinky2",  l_pinky3: "LeftHandPinky3",
//   r_thumb1: "RightHandThumb1", r_thumb2: "RightHandThumb2", r_thumb3: "RightHandThumb3",
//   r_index1: "RightHandIndex1", r_index2: "RightHandIndex2", r_index3: "RightHandIndex3",
//   r_mid1:   "RightHandMiddle1",r_mid2:   "RightHandMiddle2",r_mid3:   "RightHandMiddle3",
//   r_ring1:  "RightHandRing1",  r_ring2:  "RightHandRing2",  r_ring3:  "RightHandRing3",
//   r_pinky1: "RightHandPinky1", r_pinky2: "RightHandPinky2", r_pinky3: "RightHandPinky3",
// } as const;

// /* ─────────────────────────────────────────────────────────────
//    MEDIAPIPE HELPERS
// ───────────────────────────────────────────────────────────── */
// function mpToWorld(p: number[]): THREE.Vector3 {
//   return new THREE.Vector3(-p[0], -p[1], p[2]);
// }
// function mpDir(a: number[], b: number[]): THREE.Vector3 {
//   return mpToWorld(b).sub(mpToWorld(a)).normalize();
// }

// /* ─────────────────────────────────────────────────────────────
//    ANIMATED AVATAR (3-D)
// ───────────────────────────────────────────────────────────── */
// function AnimatedAvatar({
//   keypoints,
//   fps = 25,
//   isPlaying,
//   frameIndex,
//   onFrameAdvance,
// }: Props & {
//   isPlaying: boolean;
//   frameIndex: number;
//   onFrameAdvance: () => void;
// }) {
//   const { scene } = useGLTF("/avatar.glb");
//   const bonesRef   = useRef<Record<string, THREE.Bone>>({});
//   const restDir    = useRef<Record<string, THREE.Vector3>>({});
//   const restLocalQ = useRef<Record<string, THREE.Quaternion>>({});
//   const elapsed    = useRef(0);
//   const frameInterval = 1 / fps;

//   useEffect(() => {
//     scene.traverse((obj) => {
//       if (!(obj as THREE.Bone).isBone) return;
//       const bone = obj as THREE.Bone;
//       bonesRef.current[bone.name]   = bone;
//       restLocalQ.current[bone.name] = bone.quaternion.clone();
//     });
//     scene.traverse((obj) => {
//       if (!(obj as THREE.Bone).isBone) return;
//       const bone = obj as THREE.Bone;
//       const childBone = bone.children.find(c => (c as THREE.Bone).isBone) as THREE.Object3D | undefined;
//       if (childBone) {
//         const bPos = new THREE.Vector3();
//         const cPos = new THREE.Vector3();
//         bone.getWorldPosition(bPos);
//         childBone.getWorldPosition(cPos);
//         restDir.current[bone.name] = cPos.sub(bPos).normalize();
//       }
//     });
//   }, [scene]);

//   useEffect(() => { elapsed.current = 0; }, [keypoints]);

//   function rotateBoneToward(boneName: string, targetDir: THREE.Vector3, alpha = 1.0) {
//     const bone  = bonesRef.current[boneName];
//     const rDir  = restDir.current[boneName];
//     const restQ = restLocalQ.current[boneName];
//     if (!bone || !rDir || !restQ || targetDir.lengthSq() < 0.001) return;
//     bone.quaternion.copy(restQ);
//     const restWorldQ = new THREE.Quaternion();
//     bone.getWorldQuaternion(restWorldQ);
//     const dot = rDir.dot(targetDir);
//     if (dot < -0.9999) {
//       const perp = Math.abs(rDir.x) < 0.9 ? new THREE.Vector3(1,0,0) : new THREE.Vector3(0,1,0);
//       const axis = new THREE.Vector3().crossVectors(rDir, perp).normalize();
//       const delta180 = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI);
//       const desired  = delta180.multiply(restWorldQ);
//       const parentWorldQ = new THREE.Quaternion();
//       if (bone.parent) bone.parent.getWorldQuaternion(parentWorldQ);
//       bone.quaternion.copy(parentWorldQ.invert().multiply(desired));
//       return;
//     }
//     const delta = new THREE.Quaternion().setFromUnitVectors(rDir, targetDir);
//     const desiredWorldQ = delta.multiply(restWorldQ);
//     const parentWorldQ  = new THREE.Quaternion();
//     if (bone.parent) bone.parent.getWorldQuaternion(parentWorldQ);
//     bone.quaternion.slerp(parentWorldQ.invert().multiply(desiredWorldQ), alpha);
//   }

//   function driveFinger(lm: number[][], mcp: number, pip: number, dip: number, tip: number,
//     b1: string, b2: string, b3: string) {
//     rotateBoneToward(b1, mpDir(lm[mcp], lm[pip]));
//     rotateBoneToward(b2, mpDir(lm[pip], lm[dip]));
//     rotateBoneToward(b3, mpDir(lm[dip], lm[tip]));
//   }

//   function driveHand(hand: number[][], side: "l" | "r") {
//     if (!hand || hand.length < 21) return;
//     const s = side;
//     rotateBoneToward(BONES[`${s}_hand`], mpDir(hand[0], hand[9]));
//     driveFinger(hand,1,2,3,4,     BONES[`${s}_thumb1`],BONES[`${s}_thumb2`],BONES[`${s}_thumb3`]);
//     driveFinger(hand,5,6,7,8,     BONES[`${s}_index1`],BONES[`${s}_index2`],BONES[`${s}_index3`]);
//     driveFinger(hand,9,10,11,12,  BONES[`${s}_mid1`],  BONES[`${s}_mid2`],  BONES[`${s}_mid3`]);
//     driveFinger(hand,13,14,15,16, BONES[`${s}_ring1`], BONES[`${s}_ring2`], BONES[`${s}_ring3`]);
//     driveFinger(hand,17,18,19,20, BONES[`${s}_pinky1`],BONES[`${s}_pinky2`],BONES[`${s}_pinky3`]);
//   }

//   useFrame((_, delta) => {
//     if (!isPlaying || !keypoints?.length) return;
//     elapsed.current += Math.min(delta, 0.1);
//     if (elapsed.current >= frameInterval) {
//       elapsed.current = 0;
//       if (frameIndex < keypoints.length - 1) onFrameAdvance();
//     }
//     const frame = keypoints[frameIndex];
//     if (!frame) return;
//     const pose  = frame.pose       as number[][] | undefined;
//     const left  = frame.left_hand  as number[][] | undefined;
//     const right = frame.right_hand as number[][] | undefined;
//     if (pose && pose.length >= 17) {
//       rotateBoneToward(BONES.r_upperarm, mpDir(pose[11], pose[13]));
//       rotateBoneToward(BONES.r_forearm,  mpDir(pose[13], pose[15]));
//       rotateBoneToward(BONES.l_upperarm, mpDir(pose[12], pose[14]));
//       rotateBoneToward(BONES.l_forearm,  mpDir(pose[14], pose[16]));
//     }
//     if (left)  driveHand(left,  "r");
//     if (right) driveHand(right, "l");
//   });

//   return (
//     <group position={[0, -0.8, 0]}>
//       <primitive object={scene} scale={1} />
//     </group>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    SKELETON CONNECTIONS
// ───────────────────────────────────────────────────────────── */
// const POSE_CONNECTIONS: [number, number][] = [
//   [11,12],[11,13],[13,15],[12,14],[14,16],
//   [11,23],[12,24],[23,24],[23,25],[24,26],
//   [25,27],[26,28],[27,29],[28,30],[29,31],[30,32],
// ];
// const HAND_CONNECTIONS: [number, number][] = [
//   [0,1],[1,2],[2,3],[3,4],
//   [0,5],[5,6],[6,7],[7,8],
//   [0,9],[9,10],[10,11],[11,12],
//   [0,13],[13,14],[14,15],[15,16],
//   [0,17],[17,18],[18,19],[19,20],
//   [5,9],[9,13],[13,17],
// ];

// /* ─────────────────────────────────────────────────────────────
//    SKELETON VIEWER (2-D canvas)
// ───────────────────────────────────────────────────────────── */
// function SkeletonViewer({
//   keypoints,
//   fps,
//   isPlaying,
//   frameIndex,
//   onFrameAdvance,
// }: {
//   keypoints: any[];
//   fps: number;
//   isPlaying: boolean;
//   frameIndex: number;
//   onFrameAdvance: () => void;
// }) {
//   const canvasRef    = useRef<HTMLCanvasElement>(null);
//   const rafRef       = useRef<number>(0);
//   const lastTimeRef  = useRef<number>(0);
//   const frameInterval = 1000 / fps;

//   // Keep a ref to the latest values so RAF closure stays fresh
//   const isPlayingRef   = useRef(isPlaying);
//   const frameIndexRef  = useRef(frameIndex);
//   const totalRef       = useRef(keypoints.length);
//   useEffect(() => { isPlayingRef.current  = isPlaying;       }, [isPlaying]);
//   useEffect(() => { frameIndexRef.current = frameIndex;      }, [frameIndex]);
//   useEffect(() => { totalRef.current      = keypoints.length;}, [keypoints.length]);

//   // ── draw one frame ──────────────────────────────────────
//   const draw = useCallback((frameIdx: number) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     const W = canvas.width;
//     const H = canvas.height;

//     ctx.fillStyle = "#080d1a";
//     ctx.fillRect(0, 0, W, H);
//     ctx.strokeStyle = "rgba(99,102,241,0.08)";
//     ctx.lineWidth = 1;
//     for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
//     for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

//     const frame = keypoints[frameIdx];
//     if (!frame) return;

//     const pose  = frame.pose       as number[][] | undefined;
//     const left  = frame.left_hand  as number[][] | undefined;
//     const right = frame.right_hand as number[][] | undefined;

//     // pose world coords: negate x to mirror for viewer, keep y natural (up = up)
//     function poseXY(pt: number[]): [number, number] {
//       return [(-pt[0] * 0.55 + 0.5) * W, (pt[1] * 0.55 + 0.38) * H];
//     }
//     // Hand landmarks are in world space (metres), wrist-relative after subtracting lm[0].
//     // Use the SAME scale as poseXY (0.55 * canvas dimension) so the hand
//     // sits flush against the pose wrist with no gap or overlap.
//     function handXY(pt: number[], wristLm: number[], wx: number, wy: number): [number, number] {
//       const rx = pt[0] - wristLm[0]; // relative to wrist landmark
//       const ry = pt[1] - wristLm[1];
//       return [wx + rx * 0.75 * W, wy + ry * 0.75 * H];
//     }

//     // ── Face (landmarks 0–10) ──────────────────────────────
//     if (pose && pose.length >= 11) {
//       const nose   = pose[0]  ? poseXY(pose[0])  : null;
//       const lEye   = pose[2]  ? poseXY(pose[2])  : null;
//       const rEye   = pose[5]  ? poseXY(pose[5])  : null;
//       const lEar   = pose[7]  ? poseXY(pose[7])  : null;
//       const rEar   = pose[8]  ? poseXY(pose[8])  : null;
//       const mouthL = pose[9]  ? poseXY(pose[9])  : null;
//       const mouthR = pose[10] ? poseXY(pose[10]) : null;

//       // Head circle from ear span
//       if (lEar && rEar) {
//         const hcx = (lEar[0] + rEar[0]) / 2;
//         const hcy = (lEar[1] + rEar[1]) / 2;
//         const hr  = Math.hypot(lEar[0] - rEar[0], lEar[1] - rEar[1]) * 0.65;
//         ctx.beginPath(); ctx.arc(hcx, hcy, hr, 0, Math.PI * 2);
//         ctx.strokeStyle = "rgba(167,139,250,0.45)"; ctx.lineWidth = 1.5; ctx.stroke();
//       }

//       // Nose → eye guide lines
//       if (nose && lEye) {
//         ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.lineTo(lEye[0], lEye[1]);
//         ctx.strokeStyle = "rgba(167,139,250,0.25)"; ctx.lineWidth = 1; ctx.stroke();
//       }
//       if (nose && rEye) {
//         ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.lineTo(rEye[0], rEye[1]);
//         ctx.strokeStyle = "rgba(167,139,250,0.25)"; ctx.lineWidth = 1; ctx.stroke();
//       }

//       // Mouth
//       if (mouthL && mouthR) {
//         ctx.beginPath(); ctx.moveTo(mouthL[0], mouthL[1]); ctx.lineTo(mouthR[0], mouthR[1]);
//         ctx.strokeStyle = "rgba(244,114,182,0.85)"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.stroke();
//       }

//       // Eyes
//       for (const eye of [lEye, rEye]) {
//         if (!eye) continue;
//         ctx.beginPath(); ctx.arc(eye[0], eye[1], 3.5, 0, Math.PI * 2);
//         ctx.fillStyle = "#a5b4fc"; ctx.shadowColor = "#818cf8"; ctx.shadowBlur = 8;
//         ctx.fill(); ctx.shadowBlur = 0;
//       }

//       // Ears
//       for (const ear of [lEar, rEar]) {
//         if (!ear) continue;
//         ctx.beginPath(); ctx.arc(ear[0], ear[1], 3, 0, Math.PI * 2);
//         ctx.fillStyle = "#818cf8"; ctx.fill();
//       }

//       // Nose
//       if (nose) {
//         ctx.beginPath(); ctx.arc(nose[0], nose[1], 3, 0, Math.PI * 2);
//         ctx.fillStyle = "#c4b5fd"; ctx.shadowColor = "#a78bfa"; ctx.shadowBlur = 6;
//         ctx.fill(); ctx.shadowBlur = 0;
//       }
//     }

//     // ── Body skeleton (landmarks 11+) ──────────────────────
//     if (pose && pose.length >= 17) {
//       ctx.lineCap = "round";
//       for (const [a, b] of POSE_CONNECTIONS) {
//         if (!pose[a] || !pose[b]) continue;
//         const [ax, ay] = poseXY(pose[a]);
//         const [bx, by] = poseXY(pose[b]);
//         const grad = ctx.createLinearGradient(ax, ay, bx, by);
//         grad.addColorStop(0, "rgba(99,102,241,0.9)");
//         grad.addColorStop(1, "rgba(167,139,250,0.9)");
//         ctx.strokeStyle = grad; ctx.lineWidth = 2.5;
//         ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
//       }
//       for (let i = 11; i <= 32; i++) {
//         if (!pose[i]) continue;
//         const [x, y] = poseXY(pose[i]);
//         const isWrist = i === 15 || i === 16;
//         ctx.beginPath(); ctx.arc(x, y, isWrist ? 5 : 4, 0, Math.PI * 2);
//         ctx.fillStyle   = isWrist ? "#f472b6" : "#818cf8";
//         ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
//         ctx.fill(); ctx.shadowBlur = 0;
//       }
//     }

//     const leftWrist  = pose?.[15] ? poseXY(pose[15]) : [W * 0.65, H * 0.62] as [number,number];
//     const rightWrist = pose?.[16] ? poseXY(pose[16]) : [W * 0.35, H * 0.62] as [number,number];

//     function drawHand(c: CanvasRenderingContext2D, lm: number[][], wx: number, wy: number, lineColor: string, dotColor: string) {
//       if (!lm || lm.length < 21) return;
//       c.lineCap = "round";
//       c.lineJoin = "round";

//       // Each finger as a chain of straight lines — exactly like the Python MediaPipe style
//       // Chains: thumb=[0,1,2,3,4], index=[0,5,6,7,8], middle=[0,9,10,11,12],
//       //         ring=[0,13,14,15,16], pinky=[0,17,18,19,20]
//       // Palm cross-connections: 5-9, 9-13, 13-17
//       const chains = [
//         [0, 1, 2, 3, 4],       // thumb
//         [0, 5, 6, 7, 8],       // index
//         [0, 9, 10, 11, 12],    // middle
//         [0, 13, 14, 15, 16],   // ring
//         [0, 17, 18, 19, 20],   // pinky
//       ];
//       const palmLinks: [number, number][] = [[5,9],[9,13],[13,17]];

//       // ── Bone lines ─────────────────────────────────────────
//       c.strokeStyle = lineColor;
//       // Slightly thicker near palm, thinner near fingertip
//       chains.forEach((chain) => {
//         for (let s = 0; s < chain.length - 1; s++) {
//           const [ax, ay] = handXY(lm[chain[s]],   lm[0], wx, wy);
//           const [bx, by] = handXY(lm[chain[s+1]], lm[0], wx, wy);
//           // Thicker at palm (s=0), thinner near tip
//           c.lineWidth = s === 0 ? 2.5 : s === 1 ? 2.0 : 1.6;
//           c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
//         }
//       });

//       // Palm knuckle cross-bar
//       c.lineWidth = 1.8;
//       palmLinks.forEach(([a, b]) => {
//         const [ax, ay] = handXY(lm[a], lm[0], wx, wy);
//         const [bx, by] = handXY(lm[b], lm[0], wx, wy);
//         c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
//       });

//       // ── Joint dots ─────────────────────────────────────────
//       for (let i = 0; i < 21; i++) {
//         const [x, y] = handXY(lm[i], lm[0], wx, wy);
//         // Tips (4,8,12,16,20) are white; knuckles are dotColor; wrist is larger
//         const isTip   = [4, 8, 12, 16, 20].includes(i);
//         const isWrist = i === 0;
//         const r = isWrist ? 5 : isTip ? 3.5 : 2.5;
//         c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
//         c.fillStyle   = isTip ? "#ffffff" : dotColor;
//         c.shadowColor = dotColor;
//         c.shadowBlur  = isTip ? 10 : isWrist ? 14 : 5;
//         c.fill();
//         c.shadowBlur  = 0;
//       }
//     }

//     if (left)  drawHand(ctx, left,  rightWrist[0], rightWrist[1], "rgba(251,191,36,0.75)",  "#fbbf24");
//     if (right) drawHand(ctx, right, leftWrist[0],  leftWrist[1],  "rgba(52,211,153,0.75)",  "#34d399");

//     // Legend
//     ([["#818cf8","Pose"],["#fbbf24","Left Hand"],["#34d399","Right Hand"]] as [string,string][])
//       .forEach(([color, label], i) => {
//         ctx.beginPath(); ctx.arc(14, H - 14 - i * 18, 5, 0, Math.PI * 2);
//         ctx.fillStyle = color; ctx.shadowBlur = 0; ctx.fill();
//         ctx.fillStyle = "rgba(203,213,225,0.7)";
//         ctx.font = "11px monospace"; ctx.fillText(label, 24, H - 10 - i * 18);
//       });

//     ctx.fillStyle = "rgba(129,140,248,0.45)";
//     ctx.font = "10px monospace"; ctx.textAlign = "right";
//     ctx.fillText(`${frameIdx + 1} / ${keypoints.length}`, W - 8, H - 8);
//     ctx.textAlign = "left";
//   }, [keypoints]);

//   // Redraw whenever frameIndex changes
//   useEffect(() => { draw(frameIndex); }, [frameIndex, draw]);

//   // RAF loop for advancing frames
//   useEffect(() => {
//     cancelAnimationFrame(rafRef.current);
//     lastTimeRef.current = 0;
//     if (!isPlaying) return;

//     const loop = (ts: number) => {
//       if (!lastTimeRef.current) lastTimeRef.current = ts;
//       if (ts - lastTimeRef.current >= frameInterval) {
//         lastTimeRef.current = ts;
//         if (frameIndexRef.current < totalRef.current - 1) {
//           onFrameAdvance();
//         }
//       }
//       rafRef.current = requestAnimationFrame(loop);
//     };
//     rafRef.current = requestAnimationFrame(loop);
//     return () => cancelAnimationFrame(rafRef.current);
//   }, [isPlaying, frameInterval, onFrameAdvance]);

//   return (
//     <canvas
//       ref={canvasRef}
//       width={520}
//       height={400}
//       style={{ width: "100%", height: "100%", display: "block" }}
//     />
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    PLAYBACK CONTROLS
// ───────────────────────────────────────────────────────────── */
// function PlaybackControls({
//   isPlaying, onPlay, onPause, onReplay, frameIndex, total,
// }: {
//   isPlaying: boolean;
//   onPlay: () => void;
//   onPause: () => void;
//   onReplay: () => void;
//   frameIndex: number;
//   total: number;
// }) {
//   const pct = total > 1 ? (frameIndex / (total - 1)) * 100 : 0;
//   const base: React.CSSProperties = {
//     display: "flex", alignItems: "center", justifyContent: "center",
//     border: "none", cursor: "pointer", transition: "all 0.15s",
//   };
//   return (
//     <div style={{
//       display: "flex", flexDirection: "column", gap: "8px",
//       padding: "10px 16px 12px", flexShrink: 0,
//       background: "rgba(8,13,26,0.92)",
//       borderTop: "1px solid rgba(99,102,241,0.18)",
//     }}>
//       {/* Progress bar */}
//       <div style={{ height: "4px", borderRadius: "4px", background: "rgba(99,102,241,0.15)", overflow: "hidden" }}>
//         <div style={{
//           height: "100%", width: `${pct}%`,
//           background: "linear-gradient(90deg, #6366f1, #a78bfa)",
//           borderRadius: "4px", transition: "width 0.08s linear",
//         }} />
//       </div>
//       {/* Buttons */}
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
//         <button onClick={onReplay} title="Replay" style={{
//           ...base, width: 36, height: 36, borderRadius: "50%",
//           background: "rgba(99,102,241,0.12)",
//           border: "1px solid rgba(99,102,241,0.35)",
//           color: "#a78bfa", fontSize: "18px",
//         }}
//           onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.28)")}
//           onMouseLeave={e => (e.currentTarget.style.background = "rgba(99,102,241,0.12)")}
//         >↺</button>

//         {isPlaying ? (
//           <button onClick={onPause} title="Pause" style={{
//             ...base, width: 46, height: 46, borderRadius: "50%",
//             background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//             color: "#fff", fontSize: "20px",
//             boxShadow: "0 0 20px rgba(99,102,241,0.5)",
//           }}
//             onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
//             onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
//           >⏸</button>
//         ) : (
//           <button onClick={onPlay} title="Play" style={{
//             ...base, width: 46, height: 46, borderRadius: "50%",
//             background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//             color: "#fff", fontSize: "20px",
//             boxShadow: "0 0 20px rgba(99,102,241,0.5)",
//           }}
//             onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
//             onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
//           >▶</button>
//         )}

//         <span style={{
//           fontSize: "11px", fontFamily: "monospace",
//           color: "rgba(129,140,248,0.5)", minWidth: "70px", textAlign: "center",
//         }}>
//           {total > 0 ? `${frameIndex + 1} / ${total}` : "no data"}
//         </span>
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    ROOT EXPORT
// ───────────────────────────────────────────────────────────── */
// export default function AvatarViewer({ keypoints, fps = 25 }: Props) {
//   const [activeTab,  setActiveTab]  = useState<"avatar" | "skeleton">("avatar");
//   const [isPlaying,  setIsPlaying]  = useState(false);
//   const [frameIndex, setFrameIndex] = useState(0);

//   const advanceFrame = useCallback(() => {
//     setFrameIndex(prev => {
//       const next = prev + 1;
//       if (next >= keypoints.length - 1) setIsPlaying(false);
//       return Math.min(next, keypoints.length - 1);
//     });
//   }, [keypoints.length]);

//   useEffect(() => { setFrameIndex(0); setIsPlaying(false); }, [keypoints]);

//   const tab = (active: boolean): React.CSSProperties => ({
//     flex: 1, padding: "9px 0", border: "none", cursor: "pointer",
//     background: active ? "rgba(99,102,241,0.2)" : "transparent",
//     borderBottom: `2px solid ${active ? "#818cf8" : "transparent"}`,
//     color: active ? "#c7d2fe" : "rgba(148,163,184,0.5)",
//     fontWeight: active ? 600 : 400, fontSize: "13px",
//     letterSpacing: "0.04em", transition: "all 0.18s",
//   });

//   return (
//     <div style={{
//       display: "flex", flexDirection: "column",
//       height: "100%", width: "100%",
//       background: "#080d1a",
//     }}>
//       {/* TAB BAR */}
//       <div style={{
//         display: "flex", flexShrink: 0,
//         background: "rgba(8,13,26,0.98)",
//         borderBottom: "1px solid rgba(99,102,241,0.18)",
//       }}>
//         <button style={tab(activeTab === "avatar")}   onClick={() => setActiveTab("avatar")}>
//           🧍 Avatar
//         </button>
//         <button style={tab(activeTab === "skeleton")} onClick={() => setActiveTab("skeleton")}>
//           🦴 Skeleton
//         </button>
//       </div>

//       {/* VIEWER */}
//       <div style={{ flex: 1, position: "relative", minHeight: 0 }}>

//         {/* Avatar */}
//         <div style={{ position: "absolute", inset: 0, display: activeTab === "avatar" ? "block" : "none" }}>
//           <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
//             <ambientLight intensity={0.6} />
//             <directionalLight position={[2, 4, 3]} intensity={1.4} />
//             <AnimatedAvatar
//               keypoints={keypoints} fps={fps}
//               isPlaying={isPlaying} frameIndex={frameIndex}
//               onFrameAdvance={advanceFrame}
//             />
//           </Canvas>
//         </div>

//         {/* Skeleton */}
//         <div style={{
//           position: "absolute", inset: 0,
//           display: activeTab === "skeleton" ? "flex" : "none",
//           alignItems: "center", justifyContent: "center",
//         }}>
//           {keypoints.length > 0 ? (
//             <SkeletonViewer
//               keypoints={keypoints} fps={fps}
//               isPlaying={isPlaying} frameIndex={frameIndex}
//               onFrameAdvance={advanceFrame}
//             />
//           ) : (
//             <div style={{ textAlign: "center", color: "rgba(148,163,184,0.4)" }}>
//               <div style={{ fontSize: "36px", marginBottom: "8px" }}>🦴</div>
//               <div style={{ fontSize: "13px" }}>No keypoints loaded yet</div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* CONTROLS */}
//       <PlaybackControls
//         isPlaying={isPlaying}
//         onPlay={() => setIsPlaying(true)}
//         onPause={() => setIsPlaying(false)}
//         onReplay={() => { setFrameIndex(0); setIsPlaying(true); }}
//         frameIndex={frameIndex}
//         total={keypoints.length}
//       />
//     </div>
//   );
// }

// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF } from "@react-three/drei";
// import { useEffect, useRef, useState, useCallback } from "react";
// import * as THREE from "three";

// interface Props {
//   keypoints: any[];
//   fps?: number;
// }

// /* ─────────────────────────────────────────────────────────────
//    MIXAMO BONE MAP
// ───────────────────────────────────────────────────────────── */
// const BONES = {
//   l_upperarm: "LeftArm",
//   l_forearm:  "LeftForeArm",
//   l_hand:     "LeftHand",
//   r_upperarm: "RightArm",
//   r_forearm:  "RightForeArm",
//   r_hand:     "RightHand",
//   l_thumb1: "LeftHandThumb1",  l_thumb2: "LeftHandThumb2",  l_thumb3: "LeftHandThumb3",
//   l_index1: "LeftHandIndex1",  l_index2: "LeftHandIndex2",  l_index3: "LeftHandIndex3",
//   l_mid1:   "LeftHandMiddle1", l_mid2:   "LeftHandMiddle2", l_mid3:   "LeftHandMiddle3",
//   l_ring1:  "LeftHandRing1",   l_ring2:  "LeftHandRing2",   l_ring3:  "LeftHandRing3",
//   l_pinky1: "LeftHandPinky1",  l_pinky2: "LeftHandPinky2",  l_pinky3: "LeftHandPinky3",
//   r_thumb1: "RightHandThumb1", r_thumb2: "RightHandThumb2", r_thumb3: "RightHandThumb3",
//   r_index1: "RightHandIndex1", r_index2: "RightHandIndex2", r_index3: "RightHandIndex3",
//   r_mid1:   "RightHandMiddle1",r_mid2:   "RightHandMiddle2",r_mid3:   "RightHandMiddle3",
//   r_ring1:  "RightHandRing1",  r_ring2:  "RightHandRing2",  r_ring3:  "RightHandRing3",
//   r_pinky1: "RightHandPinky1", r_pinky2: "RightHandPinky2", r_pinky3: "RightHandPinky3",
// } as const;

// /* ─────────────────────────────────────────────────────────────
//    MEDIAPIPE HELPERS
// ───────────────────────────────────────────────────────────── */
// function mpToWorld(p: number[]): THREE.Vector3 {
//   return new THREE.Vector3(-p[0], -p[1], p[2]);
// }
// function mpDir(a: number[], b: number[]): THREE.Vector3 {
//   return mpToWorld(b).sub(mpToWorld(a)).normalize();
// }

// /* ─────────────────────────────────────────────────────────────
//    ANIMATED AVATAR (3-D)
// ───────────────────────────────────────────────────────────── */
// function AnimatedAvatar({
//   keypoints,
//   fps = 25,
//   isPlaying,
//   frameIndex,
//   onFrameAdvance,
// }: Props & {
//   isPlaying: boolean;
//   frameIndex: number;
//   onFrameAdvance: () => void;
// }) {
//   const { scene } = useGLTF("/avatar.glb");
//   const bonesRef   = useRef<Record<string, THREE.Bone>>({});
//   const restDir    = useRef<Record<string, THREE.Vector3>>({});
//   const restLocalQ = useRef<Record<string, THREE.Quaternion>>({});
//   const elapsed    = useRef(0);
//   const frameInterval = 1 / fps;

//   useEffect(() => {
//     scene.traverse((obj) => {
//       if (!(obj as THREE.Bone).isBone) return;
//       const bone = obj as THREE.Bone;
//       bonesRef.current[bone.name]   = bone;
//       restLocalQ.current[bone.name] = bone.quaternion.clone();
//     });
//     scene.traverse((obj) => {
//       if (!(obj as THREE.Bone).isBone) return;
//       const bone = obj as THREE.Bone;
//       const childBone = bone.children.find(c => (c as THREE.Bone).isBone) as THREE.Object3D | undefined;
//       if (childBone) {
//         const bPos = new THREE.Vector3();
//         const cPos = new THREE.Vector3();
//         bone.getWorldPosition(bPos);
//         childBone.getWorldPosition(cPos);
//         restDir.current[bone.name] = cPos.sub(bPos).normalize();
//       }
//     });
//   }, [scene]);

//   useEffect(() => { elapsed.current = 0; }, [keypoints]);

//   function rotateBoneToward(boneName: string, targetDir: THREE.Vector3, alpha = 1.0) {
//     const bone  = bonesRef.current[boneName];
//     const rDir  = restDir.current[boneName];
//     const restQ = restLocalQ.current[boneName];
//     if (!bone || !rDir || !restQ || targetDir.lengthSq() < 0.001) return;
//     bone.quaternion.copy(restQ);
//     const restWorldQ = new THREE.Quaternion();
//     bone.getWorldQuaternion(restWorldQ);
//     const dot = rDir.dot(targetDir);
//     if (dot < -0.9999) {
//       const perp = Math.abs(rDir.x) < 0.9 ? new THREE.Vector3(1,0,0) : new THREE.Vector3(0,1,0);
//       const axis = new THREE.Vector3().crossVectors(rDir, perp).normalize();
//       const delta180 = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI);
//       const desired  = delta180.multiply(restWorldQ);
//       const parentWorldQ = new THREE.Quaternion();
//       if (bone.parent) bone.parent.getWorldQuaternion(parentWorldQ);
//       bone.quaternion.copy(parentWorldQ.invert().multiply(desired));
//       return;
//     }
//     const delta = new THREE.Quaternion().setFromUnitVectors(rDir, targetDir);
//     const desiredWorldQ = delta.multiply(restWorldQ);
//     const parentWorldQ  = new THREE.Quaternion();
//     if (bone.parent) bone.parent.getWorldQuaternion(parentWorldQ);
//     bone.quaternion.slerp(parentWorldQ.invert().multiply(desiredWorldQ), alpha);
//   }

//   function driveFinger(lm: number[][], mcp: number, pip: number, dip: number, tip: number,
//     b1: string, b2: string, b3: string) {
//     rotateBoneToward(b1, mpDir(lm[mcp], lm[pip]));
//     rotateBoneToward(b2, mpDir(lm[pip], lm[dip]));
//     rotateBoneToward(b3, mpDir(lm[dip], lm[tip]));
//   }

//   function driveHand(hand: number[][], side: "l" | "r") {
//     if (!hand || hand.length < 21) return;
//     const s = side;
//     rotateBoneToward(BONES[`${s}_hand`], mpDir(hand[0], hand[9]));
//     driveFinger(hand,1,2,3,4,     BONES[`${s}_thumb1`],BONES[`${s}_thumb2`],BONES[`${s}_thumb3`]);
//     driveFinger(hand,5,6,7,8,     BONES[`${s}_index1`],BONES[`${s}_index2`],BONES[`${s}_index3`]);
//     driveFinger(hand,9,10,11,12,  BONES[`${s}_mid1`],  BONES[`${s}_mid2`],  BONES[`${s}_mid3`]);
//     driveFinger(hand,13,14,15,16, BONES[`${s}_ring1`], BONES[`${s}_ring2`], BONES[`${s}_ring3`]);
//     driveFinger(hand,17,18,19,20, BONES[`${s}_pinky1`],BONES[`${s}_pinky2`],BONES[`${s}_pinky3`]);
//   }

//   useFrame((_, delta) => {
//     if (!isPlaying || !keypoints?.length) return;
//     elapsed.current += Math.min(delta, 0.1);
//     if (elapsed.current >= frameInterval) {
//       elapsed.current = 0;
//       if (frameIndex < keypoints.length - 1) onFrameAdvance();
//     }
//     const frame = keypoints[frameIndex];
//     if (!frame) return;
//     const pose  = frame.pose       as number[][] | undefined;
//     const left  = frame.left_hand  as number[][] | undefined;
//     const right = frame.right_hand as number[][] | undefined;
//     if (pose && pose.length >= 17) {
//       rotateBoneToward(BONES.r_upperarm, mpDir(pose[11], pose[13]));
//       rotateBoneToward(BONES.r_forearm,  mpDir(pose[13], pose[15]));
//       rotateBoneToward(BONES.l_upperarm, mpDir(pose[12], pose[14]));
//       rotateBoneToward(BONES.l_forearm,  mpDir(pose[14], pose[16]));
//     }
//     if (left)  driveHand(left,  "r");
//     if (right) driveHand(right, "l");
//   });

//   return (
//     <group position={[0, -0.8, 0]}>
//       <primitive object={scene} scale={1} />
//     </group>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    SKELETON CONNECTIONS
// ───────────────────────────────────────────────────────────── */
// const POSE_CONNECTIONS: [number, number][] = [
//   [11,12],[11,13],[13,15],[12,14],[14,16],
//   [11,23],[12,24],[23,24],[23,25],[24,26],
//   [25,27],[26,28],[27,29],[28,30],[29,31],[30,32],
// ];
// const HAND_CONNECTIONS: [number, number][] = [
//   [0,1],[1,2],[2,3],[3,4],
//   [0,5],[5,6],[6,7],[7,8],
//   [0,9],[9,10],[10,11],[11,12],
//   [0,13],[13,14],[14,15],[15,16],
//   [0,17],[17,18],[18,19],[19,20],
//   [5,9],[9,13],[13,17],
// ];

// /* ─────────────────────────────────────────────────────────────
//    SKELETON VIEWER (2-D canvas)
// ───────────────────────────────────────────────────────────── */
// function SkeletonViewer({
//   keypoints,
//   fps,
//   isPlaying,
//   frameIndex,
//   onFrameAdvance,
// }: {
//   keypoints: any[];
//   fps: number;
//   isPlaying: boolean;
//   frameIndex: number;
//   onFrameAdvance: () => void;
// }) {
//   const canvasRef    = useRef<HTMLCanvasElement>(null);
//   const rafRef       = useRef<number>(0);
//   const lastTimeRef  = useRef<number>(0);
//   const frameInterval = 1000 / fps;

//   // Keep a ref to the latest values so RAF closure stays fresh
//   const isPlayingRef   = useRef(isPlaying);
//   const frameIndexRef  = useRef(frameIndex);
//   const totalRef       = useRef(keypoints.length);
//   useEffect(() => { isPlayingRef.current  = isPlaying;       }, [isPlaying]);
//   useEffect(() => { frameIndexRef.current = frameIndex;      }, [frameIndex]);
//   useEffect(() => { totalRef.current      = keypoints.length;}, [keypoints.length]);

//   // ── Zoom / pan state ───────────────────────────────────
//   const zoomRef   = useRef(1);
//   const offsetRef = useRef({ x: 0, y: 0 });
//   const dragRef   = useRef<{ active: boolean; lastX: number; lastY: number; lastDist: number }>({
//     active: false, lastX: 0, lastY: 0, lastDist: 0,
//   });

//   // ── draw one frame ──────────────────────────────────────
//   const draw = useCallback((frameIdx: number) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     const W = canvas.width;
//     const H = canvas.height;

//     ctx.fillStyle = "#080d1a";
//     ctx.fillRect(0, 0, W, H);

//     const z = zoomRef.current;
//     const ox = offsetRef.current.x;
//     const oy = offsetRef.current.y;
//     ctx.save();
//     ctx.setTransform(z, 0, 0, z, ox, oy);

//     ctx.strokeStyle = "rgba(99,102,241,0.08)";
//     ctx.lineWidth = 1 / z;
//     for (let x = -W; x < W * 2; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H*2); ctx.stroke(); }
//     for (let y = -H; y < H * 2; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W*2,y); ctx.stroke(); }

//     const frame = keypoints[frameIdx];
//     if (!frame) return;

//     const pose  = frame.pose       as number[][] | undefined;
//     const left  = frame.left_hand  as number[][] | undefined;
//     const right = frame.right_hand as number[][] | undefined;

//     // pose world coords: negate x to mirror for viewer, keep y natural (up = up)
//     function poseXY(pt: number[]): [number, number] {
//       return [(-pt[0] * 0.55 + 0.5) * W, (pt[1] * 0.55 + 0.38) * H];
//     }
//     // Hand landmarks are in world space (metres), wrist-relative after subtracting lm[0].
//     // Use the SAME scale as poseXY (0.55 * canvas dimension) so the hand
//     // sits flush against the pose wrist with no gap or overlap.
//     function handXY(pt: number[], wristLm: number[], wx: number, wy: number): [number, number] {
//       const rx = pt[0] - wristLm[0]; // relative to wrist landmark
//       const ry = pt[1] - wristLm[1];
//       return [wx + (-rx) * 0.55 * W, wy + ry * 0.55 * H];
//     }

//     // ── Face (landmarks 0–10) ──────────────────────────────
//     if (pose && pose.length >= 11) {
//       const nose   = pose[0]  ? poseXY(pose[0])  : null;
//       const lEye   = pose[2]  ? poseXY(pose[2])  : null;
//       const rEye   = pose[5]  ? poseXY(pose[5])  : null;
//       const lEar   = pose[7]  ? poseXY(pose[7])  : null;
//       const rEar   = pose[8]  ? poseXY(pose[8])  : null;
//       const mouthL = pose[9]  ? poseXY(pose[9])  : null;
//       const mouthR = pose[10] ? poseXY(pose[10]) : null;

//       // Head circle from ear span
//       if (lEar && rEar) {
//         const hcx = (lEar[0] + rEar[0]) / 2;
//         const hcy = (lEar[1] + rEar[1]) / 2;
//         const hr  = Math.hypot(lEar[0] - rEar[0], lEar[1] - rEar[1]) * 0.65;
//         ctx.beginPath(); ctx.arc(hcx, hcy, hr, 0, Math.PI * 2);
//         ctx.strokeStyle = "rgba(167,139,250,0.45)"; ctx.lineWidth = 1.5; ctx.stroke();
//       }

//       // Nose → eye guide lines
//       if (nose && lEye) {
//         ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.lineTo(lEye[0], lEye[1]);
//         ctx.strokeStyle = "rgba(167,139,250,0.25)"; ctx.lineWidth = 1; ctx.stroke();
//       }
//       if (nose && rEye) {
//         ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.lineTo(rEye[0], rEye[1]);
//         ctx.strokeStyle = "rgba(167,139,250,0.25)"; ctx.lineWidth = 1; ctx.stroke();
//       }

//       // Mouth
//       if (mouthL && mouthR) {
//         ctx.beginPath(); ctx.moveTo(mouthL[0], mouthL[1]); ctx.lineTo(mouthR[0], mouthR[1]);
//         ctx.strokeStyle = "rgba(244,114,182,0.85)"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.stroke();
//       }

//       // Eyes
//       for (const eye of [lEye, rEye]) {
//         if (!eye) continue;
//         ctx.beginPath(); ctx.arc(eye[0], eye[1], 3.5, 0, Math.PI * 2);
//         ctx.fillStyle = "#a5b4fc"; ctx.shadowColor = "#818cf8"; ctx.shadowBlur = 8;
//         ctx.fill(); ctx.shadowBlur = 0;
//       }

//       // Ears
//       for (const ear of [lEar, rEar]) {
//         if (!ear) continue;
//         ctx.beginPath(); ctx.arc(ear[0], ear[1], 3, 0, Math.PI * 2);
//         ctx.fillStyle = "#818cf8"; ctx.fill();
//       }

//       // Nose
//       if (nose) {
//         ctx.beginPath(); ctx.arc(nose[0], nose[1], 3, 0, Math.PI * 2);
//         ctx.fillStyle = "#c4b5fd"; ctx.shadowColor = "#a78bfa"; ctx.shadowBlur = 6;
//         ctx.fill(); ctx.shadowBlur = 0;
//       }
//     }

//     // ── Body skeleton (landmarks 11+) ──────────────────────
//     if (pose && pose.length >= 17) {
//       ctx.lineCap = "round";
//       for (const [a, b] of POSE_CONNECTIONS) {
//         if (!pose[a] || !pose[b]) continue;
//         const [ax, ay] = poseXY(pose[a]);
//         const [bx, by] = poseXY(pose[b]);
//         const grad = ctx.createLinearGradient(ax, ay, bx, by);
//         grad.addColorStop(0, "rgba(99,102,241,0.9)");
//         grad.addColorStop(1, "rgba(167,139,250,0.9)");
//         ctx.strokeStyle = grad; ctx.lineWidth = 2.5;
//         ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
//       }
//       for (let i = 11; i <= 32; i++) {
//         if (!pose[i]) continue;
//         const [x, y] = poseXY(pose[i]);
//         const isWrist = i === 15 || i === 16;
//         ctx.beginPath(); ctx.arc(x, y, isWrist ? 5 : 4, 0, Math.PI * 2);
//         ctx.fillStyle   = isWrist ? "#f472b6" : "#818cf8";
//         ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
//         ctx.fill(); ctx.shadowBlur = 0;
//       }
//     }

//     const leftWrist  = pose?.[15] ? poseXY(pose[15]) : [W * 0.65, H * 0.62] as [number,number];
//     const rightWrist = pose?.[16] ? poseXY(pose[16]) : [W * 0.35, H * 0.62] as [number,number];

//     function drawHand(c: CanvasRenderingContext2D, lm: number[][], wx: number, wy: number, lineColor: string, dotColor: string) {
//       if (!lm || lm.length < 21) return;
//       c.lineCap = "round";
//       c.lineJoin = "round";

//       // Each finger as a chain of straight lines — exactly like the Python MediaPipe style
//       // Chains: thumb=[0,1,2,3,4], index=[0,5,6,7,8], middle=[0,9,10,11,12],
//       //         ring=[0,13,14,15,16], pinky=[0,17,18,19,20]
//       // Palm cross-connections: 5-9, 9-13, 13-17
//       const chains = [
//         [0, 1, 2, 3, 4],       // thumb
//         [0, 5, 6, 7, 8],       // index
//         [0, 9, 10, 11, 12],    // middle
//         [0, 13, 14, 15, 16],   // ring
//         [0, 17, 18, 19, 20],   // pinky
//       ];
//       const palmLinks: [number, number][] = [[5,9],[9,13],[13,17]];

//       // ── Bone lines ─────────────────────────────────────────
//       c.strokeStyle = lineColor;
//       // Slightly thicker near palm, thinner near fingertip
//       chains.forEach((chain) => {
//         for (let s = 0; s < chain.length - 1; s++) {
//           const [ax, ay] = handXY(lm[chain[s]],   lm[0], wx, wy);
//           const [bx, by] = handXY(lm[chain[s+1]], lm[0], wx, wy);
//           // Thicker at palm (s=0), thinner near tip
//           c.lineWidth = s === 0 ? 2.5 : s === 1 ? 2.0 : 1.6;
//           c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
//         }
//       });

//       // Palm knuckle cross-bar
//       c.lineWidth = 1.8;
//       palmLinks.forEach(([a, b]) => {
//         const [ax, ay] = handXY(lm[a], lm[0], wx, wy);
//         const [bx, by] = handXY(lm[b], lm[0], wx, wy);
//         c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
//       });

//       // ── Joint dots ─────────────────────────────────────────
//       for (let i = 0; i < 21; i++) {
//         const [x, y] = handXY(lm[i], lm[0], wx, wy);
//         // Tips (4,8,12,16,20) are white; knuckles are dotColor; wrist is larger
//         const isTip   = [4, 8, 12, 16, 20].includes(i);
//         const isWrist = i === 0;
//         const r = isWrist ? 5 : isTip ? 3.5 : 2.5;
//         c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
//         c.fillStyle   = isTip ? "#ffffff" : dotColor;
//         c.shadowColor = dotColor;
//         c.shadowBlur  = isTip ? 10 : isWrist ? 14 : 5;
//         c.fill();
//         c.shadowBlur  = 0;
//       }
//     }

//     if (left)  drawHand(ctx, left,  leftWrist[0],  leftWrist[1],  "rgba(251,191,36,0.75)",  "#fbbf24");
//     if (right) drawHand(ctx, right, rightWrist[0], rightWrist[1], "rgba(52,211,153,0.75)",  "#34d399");

//     ctx.restore(); // end zoom transform

//     // ── HUD fixed to screen ────────────────────────────────
//     ([["#818cf8","Pose"],["#fbbf24","Left Hand"],["#34d399","Right Hand"]] as [string,string][])
//       .forEach(([color, label], i) => {
//         ctx.beginPath(); ctx.arc(14, H - 14 - i * 18, 5, 0, Math.PI * 2);
//         ctx.fillStyle = color; ctx.shadowBlur = 0; ctx.fill();
//         ctx.fillStyle = "rgba(203,213,225,0.7)";
//         ctx.font = "11px monospace"; ctx.fillText(label, 24, H - 10 - i * 18);
//       });
//     ctx.fillStyle = "rgba(129,140,248,0.45)";
//     ctx.font = "10px monospace"; ctx.textAlign = "right";
//     ctx.fillText(`${frameIdx + 1} / ${keypoints.length}`, W - 8, H - 8);
//     if (Math.abs(zoomRef.current - 1) > 0.05)
//       ctx.fillText(`${(zoomRef.current * 100).toFixed(0)}%`, W - 8, H - 20);
//     ctx.textAlign = "left";
//   }, [keypoints]);

//   // Redraw whenever frameIndex changes
//   useEffect(() => { draw(frameIndex); }, [frameIndex, draw]);

//   // RAF loop for advancing frames
//   useEffect(() => {
//     cancelAnimationFrame(rafRef.current);
//     lastTimeRef.current = 0;
//     if (!isPlaying) return;

//     const loop = (ts: number) => {
//       if (!lastTimeRef.current) lastTimeRef.current = ts;
//       if (ts - lastTimeRef.current >= frameInterval) {
//         lastTimeRef.current = ts;
//         if (frameIndexRef.current < totalRef.current - 1) {
//           onFrameAdvance();
//         }
//       }
//       rafRef.current = requestAnimationFrame(loop);
//     };
//     rafRef.current = requestAnimationFrame(loop);
//     return () => cancelAnimationFrame(rafRef.current);
//   }, [isPlaying, frameInterval, onFrameAdvance]);

//   // ── Zoom / pan handlers ───────────────────────────────
//   const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
//     e.preventDefault();
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const rect = canvas.getBoundingClientRect();
//     const sx = canvas.width / rect.width;
//     const sy = canvas.height / rect.height;
//     const mx = (e.clientX - rect.left) * sx;
//     const my = (e.clientY - rect.top)  * sy;
//     const factor = e.deltaY < 0 ? 1.1 : 0.9;
//     const nz = Math.min(Math.max(zoomRef.current * factor, 0.3), 6);
//     offsetRef.current = {
//       x: mx - (mx - offsetRef.current.x) * (nz / zoomRef.current),
//       y: my - (my - offsetRef.current.y) * (nz / zoomRef.current),
//     };
//     zoomRef.current = nz;
//     draw(frameIndexRef.current);
//   }, [draw]);

//   const handleMouseDown = useCallback((e: React.MouseEvent) => {
//     dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY, lastDist: 0 };
//   }, []);
//   const handleMouseMove = useCallback((e: React.MouseEvent) => {
//     if (!dragRef.current.active) return;
//     const canvas = canvasRef.current; if (!canvas) return;
//     const rect = canvas.getBoundingClientRect();
//     offsetRef.current = {
//       x: offsetRef.current.x + (e.clientX - dragRef.current.lastX) * (canvas.width / rect.width),
//       y: offsetRef.current.y + (e.clientY - dragRef.current.lastY) * (canvas.height / rect.height),
//     };
//     dragRef.current.lastX = e.clientX; dragRef.current.lastY = e.clientY;
//     draw(frameIndexRef.current);
//   }, [draw]);
//   const stopDrag = useCallback(() => { dragRef.current.active = false; }, []);

//   const handleTouchStart = useCallback((e: React.TouchEvent) => {
//     if (e.touches.length === 2) {
//       dragRef.current.lastDist = Math.hypot(
//         e.touches[0].clientX - e.touches[1].clientX,
//         e.touches[0].clientY - e.touches[1].clientY
//       );
//     } else {
//       dragRef.current = { active: true, lastX: e.touches[0].clientX, lastY: e.touches[0].clientY, lastDist: 0 };
//     }
//   }, []);
//   const handleTouchMove = useCallback((e: React.TouchEvent) => {
//     e.preventDefault();
//     const canvas = canvasRef.current; if (!canvas) return;
//     const rect = canvas.getBoundingClientRect();
//     const sx = canvas.width / rect.width; const sy = canvas.height / rect.height;
//     if (e.touches.length === 2) {
//       const dist = Math.hypot(
//         e.touches[0].clientX - e.touches[1].clientX,
//         e.touches[0].clientY - e.touches[1].clientY
//       );
//       if (dragRef.current.lastDist > 0) {
//         const factor = dist / dragRef.current.lastDist;
//         const cx = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) * sx;
//         const cy = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top)  * sy;
//         const nz = Math.min(Math.max(zoomRef.current * factor, 0.3), 6);
//         offsetRef.current = {
//           x: cx - (cx - offsetRef.current.x) * (nz / zoomRef.current),
//           y: cy - (cy - offsetRef.current.y) * (nz / zoomRef.current),
//         };
//         zoomRef.current = nz;
//       }
//       dragRef.current.lastDist = dist;
//     } else if (dragRef.current.active) {
//       offsetRef.current = {
//         x: offsetRef.current.x + (e.touches[0].clientX - dragRef.current.lastX) * sx,
//         y: offsetRef.current.y + (e.touches[0].clientY - dragRef.current.lastY) * sy,
//       };
//       dragRef.current.lastX = e.touches[0].clientX; dragRef.current.lastY = e.touches[0].clientY;
//     }
//     draw(frameIndexRef.current);
//   }, [draw]);

//   const handleDoubleClick = useCallback(() => {
//     zoomRef.current = 1; offsetRef.current = { x: 0, y: 0 };
//     draw(frameIndexRef.current);
//   }, [draw]);

//   return (
//     <canvas
//       ref={canvasRef}
//       width={520}
//       height={400}
//       style={{ width: "100%", height: "100%", display: "block", cursor: dragRef.current.active ? "grabbing" : "grab" }}
//       onWheel={handleWheel}
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//       onMouseUp={stopDrag}
//       onMouseLeave={stopDrag}
//       onTouchStart={handleTouchStart}
//       onTouchMove={handleTouchMove}
//       onTouchEnd={stopDrag}
//       onDoubleClick={handleDoubleClick}
//     />
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    PLAYBACK CONTROLS
// ───────────────────────────────────────────────────────────── */
// function PlaybackControls({
//   isPlaying, onPlay, onPause, onReplay, frameIndex, total,
// }: {
//   isPlaying: boolean;
//   onPlay: () => void;
//   onPause: () => void;
//   onReplay: () => void;
//   frameIndex: number;
//   total: number;
// }) {
//   const pct = total > 1 ? (frameIndex / (total - 1)) * 100 : 0;
//   const base: React.CSSProperties = {
//     display: "flex", alignItems: "center", justifyContent: "center",
//     border: "none", cursor: "pointer", transition: "all 0.15s",
//   };
//   return (
//     <div style={{
//       display: "flex", flexDirection: "column", gap: "8px",
//       padding: "10px 16px 12px", flexShrink: 0,
//       background: "rgba(8,13,26,0.92)",
//       borderTop: "1px solid rgba(99,102,241,0.18)",
//     }}>
//       {/* Progress bar */}
//       <div style={{ height: "4px", borderRadius: "4px", background: "rgba(99,102,241,0.15)", overflow: "hidden" }}>
//         <div style={{
//           height: "100%", width: `${pct}%`,
//           background: "linear-gradient(90deg, #6366f1, #a78bfa)",
//           borderRadius: "4px", transition: "width 0.08s linear",
//         }} />
//       </div>
//       {/* Buttons */}
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
//         <button onClick={onReplay} title="Replay" style={{
//           ...base, width: 36, height: 36, borderRadius: "50%",
//           background: "rgba(99,102,241,0.12)",
//           border: "1px solid rgba(99,102,241,0.35)",
//           color: "#a78bfa", fontSize: "18px",
//         }}
//           onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.28)")}
//           onMouseLeave={e => (e.currentTarget.style.background = "rgba(99,102,241,0.12)")}
//         >↺</button>

//         {isPlaying ? (
//           <button onClick={onPause} title="Pause" style={{
//             ...base, width: 46, height: 46, borderRadius: "50%",
//             background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//             color: "#fff", fontSize: "20px",
//             boxShadow: "0 0 20px rgba(99,102,241,0.5)",
//           }}
//             onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
//             onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
//           >⏸</button>
//         ) : (
//           <button onClick={onPlay} title="Play" style={{
//             ...base, width: 46, height: 46, borderRadius: "50%",
//             background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//             color: "#fff", fontSize: "20px",
//             boxShadow: "0 0 20px rgba(99,102,241,0.5)",
//           }}
//             onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
//             onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
//           >▶</button>
//         )}

//         <span style={{
//           fontSize: "11px", fontFamily: "monospace",
//           color: "rgba(129,140,248,0.5)", minWidth: "70px", textAlign: "center",
//         }}>
//           {total > 0 ? `${frameIndex + 1} / ${total}` : "no data"}
//         </span>
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    ROOT EXPORT
// ───────────────────────────────────────────────────────────── */
// export default function AvatarViewer({ keypoints, fps = 25 }: Props) {
//   const [activeTab,  setActiveTab]  = useState<"avatar" | "skeleton">("avatar");
//   const [isPlaying,  setIsPlaying]  = useState(false);
//   const [frameIndex, setFrameIndex] = useState(0);

//   const advanceFrame = useCallback(() => {
//     setFrameIndex(prev => {
//       const next = prev + 1;
//       if (next >= keypoints.length - 1) setIsPlaying(false);
//       return Math.min(next, keypoints.length - 1);
//     });
//   }, [keypoints.length]);

//   useEffect(() => { setFrameIndex(0); setIsPlaying(false); }, [keypoints]);

//   const tab = (active: boolean): React.CSSProperties => ({
//     flex: 1, padding: "9px 0", border: "none", cursor: "pointer",
//     background: active ? "rgba(99,102,241,0.2)" : "transparent",
//     borderBottom: `2px solid ${active ? "#818cf8" : "transparent"}`,
//     color: active ? "#c7d2fe" : "rgba(148,163,184,0.5)",
//     fontWeight: active ? 600 : 400, fontSize: "13px",
//     letterSpacing: "0.04em", transition: "all 0.18s",
//   });

//   return (
//     <div style={{
//       display: "flex", flexDirection: "column",
//       height: "100%", width: "100%",
//       background: "#080d1a",
//     }}>
//       {/* TAB BAR */}
//       <div style={{
//         display: "flex", flexShrink: 0,
//         background: "rgba(8,13,26,0.98)",
//         borderBottom: "1px solid rgba(99,102,241,0.18)",
//       }}>
//         <button style={tab(activeTab === "avatar")}   onClick={() => setActiveTab("avatar")}>
//           🧍 Avatar
//         </button>
//         <button style={tab(activeTab === "skeleton")} onClick={() => setActiveTab("skeleton")}>
//           🦴 Skeleton
//         </button>
//       </div>

//       {/* VIEWER */}
//       <div style={{ flex: 1, position: "relative", minHeight: 0 }}>

//         {/* Avatar */}
//         <div style={{ position: "absolute", inset: 0, display: activeTab === "avatar" ? "block" : "none" }}>
//           <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
//             <ambientLight intensity={0.6} />
//             <directionalLight position={[2, 4, 3]} intensity={1.4} />
//             <AnimatedAvatar
//               keypoints={keypoints} fps={fps}
//               isPlaying={isPlaying} frameIndex={frameIndex}
//               onFrameAdvance={advanceFrame}
//             />
//           </Canvas>
//         </div>

//         {/* Skeleton */}
//         <div style={{
//           position: "absolute", inset: 0,
//           display: activeTab === "skeleton" ? "flex" : "none",
//           alignItems: "center", justifyContent: "center",
//         }}>
//           {keypoints.length > 0 ? (
//             <SkeletonViewer
//               keypoints={keypoints} fps={fps}
//               isPlaying={isPlaying} frameIndex={frameIndex}
//               onFrameAdvance={advanceFrame}
//             />
//           ) : (
//             <div style={{ textAlign: "center", color: "rgba(148,163,184,0.4)" }}>
//               <div style={{ fontSize: "36px", marginBottom: "8px" }}>🦴</div>
//               <div style={{ fontSize: "13px" }}>No keypoints loaded yet</div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* CONTROLS */}
//       <PlaybackControls
//         isPlaying={isPlaying}
//         onPlay={() => setIsPlaying(true)}
//         onPause={() => setIsPlaying(false)}
//         onReplay={() => { setFrameIndex(0); setIsPlaying(true); }}
//         frameIndex={frameIndex}
//         total={keypoints.length}
//       />
//     </div>
//   );
// }
// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF } from "@react-three/drei";
// import { useEffect, useRef, useState, useCallback } from "react";
// import * as THREE from "three";

// interface Props {
//   keypoints: any[];
//   fps?: number;
// }

// /* ─────────────────────────────────────────────────────────────
//    MIXAMO BONE MAP
// ───────────────────────────────────────────────────────────── */
// const BONES = {
//   l_upperarm: "LeftArm",
//   l_forearm:  "LeftForeArm",
//   l_hand:     "LeftHand",
//   r_upperarm: "RightArm",
//   r_forearm:  "RightForeArm",
//   r_hand:     "RightHand",
//   l_thumb1: "LeftHandThumb1",  l_thumb2: "LeftHandThumb2",  l_thumb3: "LeftHandThumb3",
//   l_index1: "LeftHandIndex1",  l_index2: "LeftHandIndex2",  l_index3: "LeftHandIndex3",
//   l_mid1:   "LeftHandMiddle1", l_mid2:   "LeftHandMiddle2", l_mid3:   "LeftHandMiddle3",
//   l_ring1:  "LeftHandRing1",   l_ring2:  "LeftHandRing2",   l_ring3:  "LeftHandRing3",
//   l_pinky1: "LeftHandPinky1",  l_pinky2: "LeftHandPinky2",  l_pinky3: "LeftHandPinky3",
//   r_thumb1: "RightHandThumb1", r_thumb2: "RightHandThumb2", r_thumb3: "RightHandThumb3",
//   r_index1: "RightHandIndex1", r_index2: "RightHandIndex2", r_index3: "RightHandIndex3",
//   r_mid1:   "RightHandMiddle1",r_mid2:   "RightHandMiddle2",r_mid3:   "RightHandMiddle3",
//   r_ring1:  "RightHandRing1",  r_ring2:  "RightHandRing2",  r_ring3:  "RightHandRing3",
//   r_pinky1: "RightHandPinky1", r_pinky2: "RightHandPinky2", r_pinky3: "RightHandPinky3",
// } as const;

// /* ─────────────────────────────────────────────────────────────
//    MEDIAPIPE HELPERS
// ───────────────────────────────────────────────────────────── */
// function mpToWorld(p: number[]): THREE.Vector3 {
//   return new THREE.Vector3(-p[0], -p[1], p[2]);
// }
// function mpDir(a: number[], b: number[]): THREE.Vector3 {
//   return mpToWorld(b).sub(mpToWorld(a)).normalize();
// }

// /* ─────────────────────────────────────────────────────────────
//    ANIMATED AVATAR (3-D)
// ───────────────────────────────────────────────────────────── */
// function AnimatedAvatar({
//   keypoints,
//   fps = 25,
//   isPlaying,
//   frameIndex,
//   onFrameAdvance,
// }: Props & {
//   isPlaying: boolean;
//   frameIndex: number;
//   onFrameAdvance: () => void;
// }) {
//   const { scene } = useGLTF("/avatar.glb");
//   const bonesRef   = useRef<Record<string, THREE.Bone>>({});
//   const restDir    = useRef<Record<string, THREE.Vector3>>({});
//   const restLocalQ = useRef<Record<string, THREE.Quaternion>>({});
//   const elapsed    = useRef(0);
//   const frameInterval = 1 / fps;

//   useEffect(() => {
//     scene.traverse((obj) => {
//       if (!(obj as THREE.Bone).isBone) return;
//       const bone = obj as THREE.Bone;
//       bonesRef.current[bone.name]   = bone;
//       restLocalQ.current[bone.name] = bone.quaternion.clone();
//     });
//     scene.traverse((obj) => {
//       if (!(obj as THREE.Bone).isBone) return;
//       const bone = obj as THREE.Bone;
//       const childBone = bone.children.find(c => (c as THREE.Bone).isBone) as THREE.Object3D | undefined;
//       if (childBone) {
//         const bPos = new THREE.Vector3();
//         const cPos = new THREE.Vector3();
//         bone.getWorldPosition(bPos);
//         childBone.getWorldPosition(cPos);
//         restDir.current[bone.name] = cPos.sub(bPos).normalize();
//       }
//     });
//   }, [scene]);

//   useEffect(() => { elapsed.current = 0; }, [keypoints]);

//   function rotateBoneToward(boneName: string, targetDir: THREE.Vector3, alpha = 1.0) {
//     const bone  = bonesRef.current[boneName];
//     const rDir  = restDir.current[boneName];
//     const restQ = restLocalQ.current[boneName];
//     if (!bone || !rDir || !restQ || targetDir.lengthSq() < 0.001) return;
//     bone.quaternion.copy(restQ);
//     const restWorldQ = new THREE.Quaternion();
//     bone.getWorldQuaternion(restWorldQ);
//     const dot = rDir.dot(targetDir);
//     if (dot < -0.9999) {
//       const perp = Math.abs(rDir.x) < 0.9 ? new THREE.Vector3(1,0,0) : new THREE.Vector3(0,1,0);
//       const axis = new THREE.Vector3().crossVectors(rDir, perp).normalize();
//       const delta180 = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI);
//       const desired  = delta180.multiply(restWorldQ);
//       const parentWorldQ = new THREE.Quaternion();
//       if (bone.parent) bone.parent.getWorldQuaternion(parentWorldQ);
//       bone.quaternion.copy(parentWorldQ.invert().multiply(desired));
//       return;
//     }
//     const delta = new THREE.Quaternion().setFromUnitVectors(rDir, targetDir);
//     const desiredWorldQ = delta.multiply(restWorldQ);
//     const parentWorldQ  = new THREE.Quaternion();
//     if (bone.parent) bone.parent.getWorldQuaternion(parentWorldQ);
//     bone.quaternion.slerp(parentWorldQ.invert().multiply(desiredWorldQ), alpha);
//   }

//   function driveFinger(lm: number[][], mcp: number, pip: number, dip: number, tip: number,
//     b1: string, b2: string, b3: string) {
//     rotateBoneToward(b1, mpDir(lm[mcp], lm[pip]));
//     rotateBoneToward(b2, mpDir(lm[pip], lm[dip]));
//     rotateBoneToward(b3, mpDir(lm[dip], lm[tip]));
//   }

//   function driveHand(hand: number[][], side: "l" | "r") {
//     if (!hand || hand.length < 21) return;
//     const s = side;
//     rotateBoneToward(BONES[`${s}_hand`], mpDir(hand[0], hand[9]));
//     driveFinger(hand,1,2,3,4,     BONES[`${s}_thumb1`],BONES[`${s}_thumb2`],BONES[`${s}_thumb3`]);
//     driveFinger(hand,5,6,7,8,     BONES[`${s}_index1`],BONES[`${s}_index2`],BONES[`${s}_index3`]);
//     driveFinger(hand,9,10,11,12,  BONES[`${s}_mid1`],  BONES[`${s}_mid2`],  BONES[`${s}_mid3`]);
//     driveFinger(hand,13,14,15,16, BONES[`${s}_ring1`], BONES[`${s}_ring2`], BONES[`${s}_ring3`]);
//     driveFinger(hand,17,18,19,20, BONES[`${s}_pinky1`],BONES[`${s}_pinky2`],BONES[`${s}_pinky3`]);
//   }

//   useFrame((_, delta) => {
//     if (!isPlaying || !keypoints?.length) return;
//     elapsed.current += Math.min(delta, 0.1);
//     if (elapsed.current >= frameInterval) {
//       elapsed.current = 0;
//       if (frameIndex < keypoints.length - 1) onFrameAdvance();
//     }
//     const frame = keypoints[frameIndex];
//     if (!frame) return;
//     const pose  = frame.pose       as number[][] | undefined;
//     const left  = frame.left_hand  as number[][] | undefined;
//     const right = frame.right_hand as number[][] | undefined;
//     if (pose && pose.length >= 17) {
//       rotateBoneToward(BONES.r_upperarm, mpDir(pose[11], pose[13]));
//       rotateBoneToward(BONES.r_forearm,  mpDir(pose[13], pose[15]));
//       rotateBoneToward(BONES.l_upperarm, mpDir(pose[12], pose[14]));
//       rotateBoneToward(BONES.l_forearm,  mpDir(pose[14], pose[16]));
//     }
//     if (left)  driveHand(left,  "r");
//     if (right) driveHand(right, "l");
//   });

//   return (
//     <group position={[0, -0.8, 0]}>
//       <primitive object={scene} scale={1} />
//     </group>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    SKELETON CONNECTIONS
// ───────────────────────────────────────────────────────────── */
// const POSE_CONNECTIONS: [number, number][] = [
//   [11,12],[11,13],[13,15],[12,14],[14,16],
//   [11,23],[12,24],[23,24],[23,25],[24,26],
//   [25,27],[26,28],[27,29],[28,30],[29,31],[30,32],
// ];
// const HAND_CONNECTIONS: [number, number][] = [
//   [0,1],[1,2],[2,3],[3,4],
//   [0,5],[5,6],[6,7],[7,8],
//   [0,9],[9,10],[10,11],[11,12],
//   [0,13],[13,14],[14,15],[15,16],
//   [0,17],[17,18],[18,19],[19,20],
//   [5,9],[9,13],[13,17],
// ];

// /* ─────────────────────────────────────────────────────────────
//    SKELETON VIEWER (2-D canvas)
// ───────────────────────────────────────────────────────────── */
// function SkeletonViewer({
//   keypoints,
//   fps,
//   isPlaying,
//   frameIndex,
//   onFrameAdvance,
// }: {
//   keypoints: any[];
//   fps: number;
//   isPlaying: boolean;
//   frameIndex: number;
//   onFrameAdvance: () => void;
// }) {
//   const canvasRef    = useRef<HTMLCanvasElement>(null);
//   const rafRef       = useRef<number>(0);
//   const lastTimeRef  = useRef<number>(0);
//   const frameInterval = 1000 / fps;

//   // Keep a ref to the latest values so RAF closure stays fresh
//   const isPlayingRef   = useRef(isPlaying);
//   const frameIndexRef  = useRef(frameIndex);
//   const totalRef       = useRef(keypoints.length);
//   useEffect(() => { isPlayingRef.current  = isPlaying;       }, [isPlaying]);
//   useEffect(() => { frameIndexRef.current = frameIndex;      }, [frameIndex]);
//   useEffect(() => { totalRef.current      = keypoints.length;}, [keypoints.length]);

//   // ── Zoom / pan state ───────────────────────────────────
//   const zoomRef   = useRef(1);
//   const offsetRef = useRef({ x: 0, y: 0 });
//   const dragRef   = useRef<{ active: boolean; lastX: number; lastY: number; lastDist: number }>({
//     active: false, lastX: 0, lastY: 0, lastDist: 0,
//   });

//   // ── draw one frame ──────────────────────────────────────
//   const draw = useCallback((frameIdx: number) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     const W = canvas.width;
//     const H = canvas.height;

//     ctx.fillStyle = "#080d1a";
//     ctx.fillRect(0, 0, W, H);

//     const z = zoomRef.current;
//     const ox = offsetRef.current.x;
//     const oy = offsetRef.current.y;
//     ctx.save();
//     ctx.setTransform(z, 0, 0, z, ox, oy);

//     ctx.strokeStyle = "rgba(99,102,241,0.08)";
//     ctx.lineWidth = 1 / z;
//     for (let x = -W; x < W * 2; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H*2); ctx.stroke(); }
//     for (let y = -H; y < H * 2; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W*2,y); ctx.stroke(); }

//     const frame = keypoints[frameIdx];
//     if (!frame) return;

//     const pose  = frame.pose       as number[][] | undefined;
//     const left  = frame.left_hand  as number[][] | undefined;
//     const right = frame.right_hand as number[][] | undefined;

//     // pose world coords: negate x to mirror for viewer, keep y natural (up = up)
//     function poseXY(pt: number[]): [number, number] {
//       return [(-pt[0] * 0.55 + 0.5) * W, (pt[1] * 0.55 + 0.38) * H];
//     }
//     // Hand landmarks are in world space (metres), wrist-relative after subtracting lm[0].
//     // Use the SAME scale as poseXY (0.55 * canvas dimension) so the hand
//     // sits flush against the pose wrist with no gap or overlap.
//     // Detect coord space: world landmarks are small (~0.0–0.3), image landmarks are large (0–1)
//     // Image-space landmarks have x already in screen direction; world-space need negation to mirror.
//     function handXY(pt: number[], wristLm: number[], wx: number, wy: number, flipX = false): [number, number] {
//       const rx = pt[0] - wristLm[0];
//       const ry = pt[1] - wristLm[1];
//       return [wx + (flipX ? -rx : rx) * 0.55 * W, wy + ry * 0.55 * H];
//     }

//     // ── Face (landmarks 0–10) ──────────────────────────────
//     if (pose && pose.length >= 11) {
//       const nose   = pose[0]  ? poseXY(pose[0])  : null;
//       const lEye   = pose[2]  ? poseXY(pose[2])  : null;
//       const rEye   = pose[5]  ? poseXY(pose[5])  : null;
//       const lEar   = pose[7]  ? poseXY(pose[7])  : null;
//       const rEar   = pose[8]  ? poseXY(pose[8])  : null;
//       const mouthL = pose[9]  ? poseXY(pose[9])  : null;
//       const mouthR = pose[10] ? poseXY(pose[10]) : null;

//       // Head circle from ear span
//       if (lEar && rEar) {
//         const hcx = (lEar[0] + rEar[0]) / 2;
//         const hcy = (lEar[1] + rEar[1]) / 2;
//         const hr  = Math.hypot(lEar[0] - rEar[0], lEar[1] - rEar[1]) * 0.65;
//         ctx.beginPath(); ctx.arc(hcx, hcy, hr, 0, Math.PI * 2);
//         ctx.strokeStyle = "rgba(167,139,250,0.45)"; ctx.lineWidth = 1.5; ctx.stroke();
//       }

//       // Nose → eye guide lines
//       if (nose && lEye) {
//         ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.lineTo(lEye[0], lEye[1]);
//         ctx.strokeStyle = "rgba(167,139,250,0.25)"; ctx.lineWidth = 1; ctx.stroke();
//       }
//       if (nose && rEye) {
//         ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.lineTo(rEye[0], rEye[1]);
//         ctx.strokeStyle = "rgba(167,139,250,0.25)"; ctx.lineWidth = 1; ctx.stroke();
//       }

//       // Mouth
//       if (mouthL && mouthR) {
//         ctx.beginPath(); ctx.moveTo(mouthL[0], mouthL[1]); ctx.lineTo(mouthR[0], mouthR[1]);
//         ctx.strokeStyle = "rgba(244,114,182,0.85)"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.stroke();
//       }

//       // Eyes
//       for (const eye of [lEye, rEye]) {
//         if (!eye) continue;
//         ctx.beginPath(); ctx.arc(eye[0], eye[1], 3.5, 0, Math.PI * 2);
//         ctx.fillStyle = "#a5b4fc"; ctx.shadowColor = "#818cf8"; ctx.shadowBlur = 8;
//         ctx.fill(); ctx.shadowBlur = 0;
//       }

//       // Ears
//       for (const ear of [lEar, rEar]) {
//         if (!ear) continue;
//         ctx.beginPath(); ctx.arc(ear[0], ear[1], 3, 0, Math.PI * 2);
//         ctx.fillStyle = "#818cf8"; ctx.fill();
//       }

//       // Nose
//       if (nose) {
//         ctx.beginPath(); ctx.arc(nose[0], nose[1], 3, 0, Math.PI * 2);
//         ctx.fillStyle = "#c4b5fd"; ctx.shadowColor = "#a78bfa"; ctx.shadowBlur = 6;
//         ctx.fill(); ctx.shadowBlur = 0;
//       }
//     }

//     // ── Body skeleton (landmarks 11+) ──────────────────────
//     if (pose && pose.length >= 17) {
//       ctx.lineCap = "round";
//       for (const [a, b] of POSE_CONNECTIONS) {
//         if (!pose[a] || !pose[b]) continue;
//         const [ax, ay] = poseXY(pose[a]);
//         const [bx, by] = poseXY(pose[b]);
//         const grad = ctx.createLinearGradient(ax, ay, bx, by);
//         grad.addColorStop(0, "rgba(99,102,241,0.9)");
//         grad.addColorStop(1, "rgba(167,139,250,0.9)");
//         ctx.strokeStyle = grad; ctx.lineWidth = 2.5;
//         ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
//       }
//       for (let i = 11; i <= 32; i++) {
//         if (!pose[i]) continue;
//         const [x, y] = poseXY(pose[i]);
//         const isWrist = i === 15 || i === 16;
//         ctx.beginPath(); ctx.arc(x, y, isWrist ? 5 : 4, 0, Math.PI * 2);
//         ctx.fillStyle   = isWrist ? "#f472b6" : "#818cf8";
//         ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
//         ctx.fill(); ctx.shadowBlur = 0;
//       }
//     }

//     const leftWrist  = pose?.[15] ? poseXY(pose[15]) : [W * 0.65, H * 0.62] as [number,number];
//     const rightWrist = pose?.[16] ? poseXY(pose[16]) : [W * 0.35, H * 0.62] as [number,number];

//     function drawHand(c: CanvasRenderingContext2D, lm: number[][], wx: number, wy: number, lineColor: string, dotColor: string) {
//       if (!lm || lm.length < 21) return;
//       c.lineCap = "round";
//       c.lineJoin = "round";
//       // Detect coordinate space:
//       // - World-space (word animations): all x values are small metres, typically -0.3 to 0.3
//       // - Image-space (fingerspelling): x values are normalised 0–1, so at least some will be > 0.4
//       // We check the wrist (lm[0]) and middle-finger MCP (lm[9]) absolute values.
//       const isImageSpace = lm.some(pt => Math.abs(pt[0]) > 0.4 || Math.abs(pt[1]) > 0.4);
//       // World-space needs x-flip to match mirrored body; image-space already faces correct way.
//       const flipX = !isImageSpace;

//       // Each finger as a chain of straight lines — exactly like the Python MediaPipe style
//       // Chains: thumb=[0,1,2,3,4], index=[0,5,6,7,8], middle=[0,9,10,11,12],
//       //         ring=[0,13,14,15,16], pinky=[0,17,18,19,20]
//       // Palm cross-connections: 5-9, 9-13, 13-17
//       const chains = [
//         [0, 1, 2, 3, 4],       // thumb
//         [0, 5, 6, 7, 8],       // index
//         [0, 9, 10, 11, 12],    // middle
//         [0, 13, 14, 15, 16],   // ring
//         [0, 17, 18, 19, 20],   // pinky
//       ];
//       const palmLinks: [number, number][] = [[5,9],[9,13],[13,17]];

//       // ── Bone lines ─────────────────────────────────────────
//       c.strokeStyle = lineColor;
//       // Slightly thicker near palm, thinner near fingertip
//       chains.forEach((chain) => {
//         for (let s = 0; s < chain.length - 1; s++) {
//           const [ax, ay] = handXY(lm[chain[s]],   lm[0], wx, wy, flipX);
//           const [bx, by] = handXY(lm[chain[s+1]], lm[0], wx, wy, flipX);
//           // Thicker at palm (s=0), thinner near tip
//           c.lineWidth = s === 0 ? 2.5 : s === 1 ? 2.0 : 1.6;
//           c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
//         }
//       });

//       // Palm knuckle cross-bar
//       c.lineWidth = 1.8;
//       palmLinks.forEach(([a, b]) => {
//         const [ax, ay] = handXY(lm[a], lm[0], wx, wy, flipX);
//         const [bx, by] = handXY(lm[b], lm[0], wx, wy, flipX);
//         c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
//       });

//       // ── Joint dots ─────────────────────────────────────────
//       for (let i = 0; i < 21; i++) {
//         const [x, y] = handXY(lm[i], lm[0], wx, wy, flipX);
//         // Tips (4,8,12,16,20) are white; knuckles are dotColor; wrist is larger
//         const isTip   = [4, 8, 12, 16, 20].includes(i);
//         const isWrist = i === 0;
//         const r = isWrist ? 5 : isTip ? 3.5 : 2.5;
//         c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
//         c.fillStyle   = isTip ? "#ffffff" : dotColor;
//         c.shadowColor = dotColor;
//         c.shadowBlur  = isTip ? 10 : isWrist ? 14 : 5;
//         c.fill();
//         c.shadowBlur  = 0;
//       }
//     }

//     if (left)  drawHand(ctx, left,  rightWrist[0], rightWrist[1], "rgba(251,191,36,0.75)",  "#fbbf24");
//     if (right) drawHand(ctx, right, leftWrist[0],  leftWrist[1],  "rgba(52,211,153,0.75)",  "#34d399");

//     ctx.restore(); // end zoom transform

//     // ── HUD fixed to screen ────────────────────────────────
//     ([["#818cf8","Pose"],["#fbbf24","Left Hand"],["#34d399","Right Hand"]] as [string,string][])
//       .forEach(([color, label], i) => {
//         ctx.beginPath(); ctx.arc(14, H - 14 - i * 18, 5, 0, Math.PI * 2);
//         ctx.fillStyle = color; ctx.shadowBlur = 0; ctx.fill();
//         ctx.fillStyle = "rgba(203,213,225,0.7)";
//         ctx.font = "11px monospace"; ctx.fillText(label, 24, H - 10 - i * 18);
//       });
//     ctx.fillStyle = "rgba(129,140,248,0.45)";
//     ctx.font = "10px monospace"; ctx.textAlign = "right";
//     ctx.fillText(`${frameIdx + 1} / ${keypoints.length}`, W - 8, H - 8);
//     if (Math.abs(zoomRef.current - 1) > 0.05)
//       ctx.fillText(`${(zoomRef.current * 100).toFixed(0)}%`, W - 8, H - 20);
//     ctx.textAlign = "left";
//   }, [keypoints]);

//   // Redraw whenever frameIndex changes
//   useEffect(() => { draw(frameIndex); }, [frameIndex, draw]);

//   // RAF loop for advancing frames
//   useEffect(() => {
//     cancelAnimationFrame(rafRef.current);
//     lastTimeRef.current = 0;
//     if (!isPlaying) return;

//     const loop = (ts: number) => {
//       if (!lastTimeRef.current) lastTimeRef.current = ts;
//       if (ts - lastTimeRef.current >= frameInterval) {
//         lastTimeRef.current = ts;
//         if (frameIndexRef.current < totalRef.current - 1) {
//           onFrameAdvance();
//         }
//       }
//       rafRef.current = requestAnimationFrame(loop);
//     };
//     rafRef.current = requestAnimationFrame(loop);
//     return () => cancelAnimationFrame(rafRef.current);
//   }, [isPlaying, frameInterval, onFrameAdvance]);

//   // ── Zoom / pan handlers ───────────────────────────────
//   const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
//     e.preventDefault();
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const rect = canvas.getBoundingClientRect();
//     const sx = canvas.width / rect.width;
//     const sy = canvas.height / rect.height;
//     const mx = (e.clientX - rect.left) * sx;
//     const my = (e.clientY - rect.top)  * sy;
//     const factor = e.deltaY < 0 ? 1.1 : 0.9;
//     const nz = Math.min(Math.max(zoomRef.current * factor, 0.3), 6);
//     offsetRef.current = {
//       x: mx - (mx - offsetRef.current.x) * (nz / zoomRef.current),
//       y: my - (my - offsetRef.current.y) * (nz / zoomRef.current),
//     };
//     zoomRef.current = nz;
//     draw(frameIndexRef.current);
//   }, [draw]);

//   const handleMouseDown = useCallback((e: React.MouseEvent) => {
//     dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY, lastDist: 0 };
//   }, []);
//   const handleMouseMove = useCallback((e: React.MouseEvent) => {
//     if (!dragRef.current.active) return;
//     const canvas = canvasRef.current; if (!canvas) return;
//     const rect = canvas.getBoundingClientRect();
//     offsetRef.current = {
//       x: offsetRef.current.x + (e.clientX - dragRef.current.lastX) * (canvas.width / rect.width),
//       y: offsetRef.current.y + (e.clientY - dragRef.current.lastY) * (canvas.height / rect.height),
//     };
//     dragRef.current.lastX = e.clientX; dragRef.current.lastY = e.clientY;
//     draw(frameIndexRef.current);
//   }, [draw]);
//   const stopDrag = useCallback(() => { dragRef.current.active = false; }, []);

//   const handleTouchStart = useCallback((e: React.TouchEvent) => {
//     if (e.touches.length === 2) {
//       dragRef.current.lastDist = Math.hypot(
//         e.touches[0].clientX - e.touches[1].clientX,
//         e.touches[0].clientY - e.touches[1].clientY
//       );
//     } else {
//       dragRef.current = { active: true, lastX: e.touches[0].clientX, lastY: e.touches[0].clientY, lastDist: 0 };
//     }
//   }, []);
//   const handleTouchMove = useCallback((e: React.TouchEvent) => {
//     e.preventDefault();
//     const canvas = canvasRef.current; if (!canvas) return;
//     const rect = canvas.getBoundingClientRect();
//     const sx = canvas.width / rect.width; const sy = canvas.height / rect.height;
//     if (e.touches.length === 2) {
//       const dist = Math.hypot(
//         e.touches[0].clientX - e.touches[1].clientX,
//         e.touches[0].clientY - e.touches[1].clientY
//       );
//       if (dragRef.current.lastDist > 0) {
//         const factor = dist / dragRef.current.lastDist;
//         const cx = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) * sx;
//         const cy = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top)  * sy;
//         const nz = Math.min(Math.max(zoomRef.current * factor, 0.3), 6);
//         offsetRef.current = {
//           x: cx - (cx - offsetRef.current.x) * (nz / zoomRef.current),
//           y: cy - (cy - offsetRef.current.y) * (nz / zoomRef.current),
//         };
//         zoomRef.current = nz;
//       }
//       dragRef.current.lastDist = dist;
//     } else if (dragRef.current.active) {
//       offsetRef.current = {
//         x: offsetRef.current.x + (e.touches[0].clientX - dragRef.current.lastX) * sx,
//         y: offsetRef.current.y + (e.touches[0].clientY - dragRef.current.lastY) * sy,
//       };
//       dragRef.current.lastX = e.touches[0].clientX; dragRef.current.lastY = e.touches[0].clientY;
//     }
//     draw(frameIndexRef.current);
//   }, [draw]);

//   const handleDoubleClick = useCallback(() => {
//     zoomRef.current = 1; offsetRef.current = { x: 0, y: 0 };
//     draw(frameIndexRef.current);
//   }, [draw]);

//   return (
//     <canvas
//       ref={canvasRef}
//       width={520}
//       height={400}
//       style={{ width: "100%", height: "100%", display: "block", cursor: dragRef.current.active ? "grabbing" : "grab" }}
//       onWheel={handleWheel}
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//       onMouseUp={stopDrag}
//       onMouseLeave={stopDrag}
//       onTouchStart={handleTouchStart}
//       onTouchMove={handleTouchMove}
//       onTouchEnd={stopDrag}
//       onDoubleClick={handleDoubleClick}
//     />
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    PLAYBACK CONTROLS
// ───────────────────────────────────────────────────────────── */
// function PlaybackControls({
//   isPlaying, onPlay, onPause, onReplay, frameIndex, total,
// }: {
//   isPlaying: boolean;
//   onPlay: () => void;
//   onPause: () => void;
//   onReplay: () => void;
//   frameIndex: number;
//   total: number;
// }) {
//   const pct = total > 1 ? (frameIndex / (total - 1)) * 100 : 0;
//   const base: React.CSSProperties = {
//     display: "flex", alignItems: "center", justifyContent: "center",
//     border: "none", cursor: "pointer", transition: "all 0.15s",
//   };
//   return (
//     <div style={{
//       display: "flex", flexDirection: "column", gap: "8px",
//       padding: "10px 16px 12px", flexShrink: 0,
//       background: "rgba(8,13,26,0.92)",
//       borderTop: "1px solid rgba(99,102,241,0.18)",
//     }}>
//       {/* Progress bar */}
//       <div style={{ height: "4px", borderRadius: "4px", background: "rgba(99,102,241,0.15)", overflow: "hidden" }}>
//         <div style={{
//           height: "100%", width: `${pct}%`,
//           background: "linear-gradient(90deg, #6366f1, #a78bfa)",
//           borderRadius: "4px", transition: "width 0.08s linear",
//         }} />
//       </div>
//       {/* Buttons */}
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
//         <button onClick={onReplay} title="Replay" style={{
//           ...base, width: 36, height: 36, borderRadius: "50%",
//           background: "rgba(99,102,241,0.12)",
//           border: "1px solid rgba(99,102,241,0.35)",
//           color: "#a78bfa", fontSize: "18px",
//         }}
//           onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.28)")}
//           onMouseLeave={e => (e.currentTarget.style.background = "rgba(99,102,241,0.12)")}
//         >↺</button>

//         {isPlaying ? (
//           <button onClick={onPause} title="Pause" style={{
//             ...base, width: 46, height: 46, borderRadius: "50%",
//             background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//             color: "#fff", fontSize: "20px",
//             boxShadow: "0 0 20px rgba(99,102,241,0.5)",
//           }}
//             onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
//             onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
//           >⏸</button>
//         ) : (
//           <button onClick={onPlay} title="Play" style={{
//             ...base, width: 46, height: 46, borderRadius: "50%",
//             background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
//             color: "#fff", fontSize: "20px",
//             boxShadow: "0 0 20px rgba(99,102,241,0.5)",
//           }}
//             onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
//             onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
//           >▶</button>
//         )}

//         <span style={{
//           fontSize: "11px", fontFamily: "monospace",
//           color: "rgba(129,140,248,0.5)", minWidth: "70px", textAlign: "center",
//         }}>
//           {total > 0 ? `${frameIndex + 1} / ${total}` : "no data"}
//         </span>
//       </div>
//     </div>
//   );
// }

// /* ─────────────────────────────────────────────────────────────
//    ROOT EXPORT
// ───────────────────────────────────────────────────────────── */
// export default function AvatarViewer({ keypoints, fps = 25 }: Props) {
//   const [activeTab,  setActiveTab]  = useState<"avatar" | "skeleton">("avatar");
//   const [isPlaying,  setIsPlaying]  = useState(false);
//   const [frameIndex, setFrameIndex] = useState(0);

//   const advanceFrame = useCallback(() => {
//     setFrameIndex(prev => {
//       const next = prev + 1;
//       if (next >= keypoints.length - 1) setIsPlaying(false);
//       return Math.min(next, keypoints.length - 1);
//     });
//   }, [keypoints.length]);

//   useEffect(() => { setFrameIndex(0); setIsPlaying(false); }, [keypoints]);

//   const tab = (active: boolean): React.CSSProperties => ({
//     flex: 1, padding: "9px 0", border: "none", cursor: "pointer",
//     background: active ? "rgba(99,102,241,0.2)" : "transparent",
//     borderBottom: `2px solid ${active ? "#818cf8" : "transparent"}`,
//     color: active ? "#c7d2fe" : "rgba(148,163,184,0.5)",
//     fontWeight: active ? 600 : 400, fontSize: "13px",
//     letterSpacing: "0.04em", transition: "all 0.18s",
//   });

//   return (
//     <div style={{
//       display: "flex", flexDirection: "column",
//       height: "100%", width: "100%",
//       background: "#080d1a",
//     }}>
//       {/* TAB BAR */}
//       <div style={{
//         display: "flex", flexShrink: 0,
//         background: "rgba(8,13,26,0.98)",
//         borderBottom: "1px solid rgba(99,102,241,0.18)",
//       }}>
//         <button style={tab(activeTab === "avatar")}   onClick={() => setActiveTab("avatar")}>
//           🧍 Avatar
//         </button>
//         <button style={tab(activeTab === "skeleton")} onClick={() => setActiveTab("skeleton")}>
//           🦴 Skeleton
//         </button>
//       </div>

//       {/* VIEWER */}
//       <div style={{ flex: 1, position: "relative", minHeight: 0 }}>

//         {/* Avatar */}
//         <div style={{ position: "absolute", inset: 0, display: activeTab === "avatar" ? "block" : "none" }}>
//           <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
//             <ambientLight intensity={0.6} />
//             <directionalLight position={[2, 4, 3]} intensity={1.4} />
//             <AnimatedAvatar
//               keypoints={keypoints} fps={fps}
//               isPlaying={isPlaying} frameIndex={frameIndex}
//               onFrameAdvance={advanceFrame}
//             />
//           </Canvas>
//         </div>

//         {/* Skeleton */}
//         <div style={{
//           position: "absolute", inset: 0,
//           display: activeTab === "skeleton" ? "flex" : "none",
//           alignItems: "center", justifyContent: "center",
//         }}>
//           {keypoints.length > 0 ? (
//             <SkeletonViewer
//               keypoints={keypoints} fps={fps}
//               isPlaying={isPlaying} frameIndex={frameIndex}
//               onFrameAdvance={advanceFrame}
//             />
//           ) : (
//             <div style={{ textAlign: "center", color: "rgba(148,163,184,0.4)" }}>
//               <div style={{ fontSize: "36px", marginBottom: "8px" }}>🦴</div>
//               <div style={{ fontSize: "13px" }}>No keypoints loaded yet</div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* CONTROLS */}
//       <PlaybackControls
//         isPlaying={isPlaying}
//         onPlay={() => setIsPlaying(true)}
//         onPause={() => setIsPlaying(false)}
//         onReplay={() => { setFrameIndex(0); setIsPlaying(true); }}
//         frameIndex={frameIndex}
//         total={keypoints.length}
//       />
//     </div>
//   );
// }
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

interface Props {
  keypoints: any[];
  fps?: number;
}

/* ─────────────────────────────────────────────────────────────
   MIXAMO BONE MAP
───────────────────────────────────────────────────────────── */
const BONES = {
  l_upperarm: "LeftArm",
  l_forearm:  "LeftForeArm",
  l_hand:     "LeftHand",
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
} as const;

/* ─────────────────────────────────────────────────────────────
   MEDIAPIPE HELPERS
───────────────────────────────────────────────────────────── */
function mpToWorld(p: number[]): THREE.Vector3 {
  return new THREE.Vector3(-p[0], -p[1], p[2]);
}
function mpDir(a: number[], b: number[]): THREE.Vector3 {
  return mpToWorld(b).sub(mpToWorld(a)).normalize();
}

/* ─────────────────────────────────────────────────────────────
   ANIMATED AVATAR (3-D)
───────────────────────────────────────────────────────────── */
function AnimatedAvatar({
  keypoints,
  fps = 25,
  isPlaying,
  frameIndex,
  onFrameAdvance,
}: Props & {
  isPlaying: boolean;
  frameIndex: number;
  onFrameAdvance: () => void;
}) {
  const { scene } = useGLTF("/avatar.glb");
  const bonesRef   = useRef<Record<string, THREE.Bone>>({});
  const restDir    = useRef<Record<string, THREE.Vector3>>({});
  const restLocalQ = useRef<Record<string, THREE.Quaternion>>({});
  const elapsed    = useRef(0);
  const frameInterval = 1 / fps;

  useEffect(() => {
    scene.traverse((obj) => {
      if (!(obj as THREE.Bone).isBone) return;
      const bone = obj as THREE.Bone;
      bonesRef.current[bone.name]   = bone;
      restLocalQ.current[bone.name] = bone.quaternion.clone();
    });
    scene.traverse((obj) => {
      if (!(obj as THREE.Bone).isBone) return;
      const bone = obj as THREE.Bone;
      const childBone = bone.children.find(c => (c as THREE.Bone).isBone) as THREE.Object3D | undefined;
      if (childBone) {
        const bPos = new THREE.Vector3();
        const cPos = new THREE.Vector3();
        bone.getWorldPosition(bPos);
        childBone.getWorldPosition(cPos);
        restDir.current[bone.name] = cPos.sub(bPos).normalize();
      }
    });
  }, [scene]);

  useEffect(() => { elapsed.current = 0; }, [keypoints]);

  function rotateBoneToward(boneName: string, targetDir: THREE.Vector3, alpha = 1.0) {
    const bone  = bonesRef.current[boneName];
    const rDir  = restDir.current[boneName];
    const restQ = restLocalQ.current[boneName];
    if (!bone || !rDir || !restQ || targetDir.lengthSq() < 0.001) return;
    bone.quaternion.copy(restQ);
    const restWorldQ = new THREE.Quaternion();
    bone.getWorldQuaternion(restWorldQ);
    const dot = rDir.dot(targetDir);
    if (dot < -0.9999) {
      const perp = Math.abs(rDir.x) < 0.9 ? new THREE.Vector3(1,0,0) : new THREE.Vector3(0,1,0);
      const axis = new THREE.Vector3().crossVectors(rDir, perp).normalize();
      const delta180 = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI);
      const desired  = delta180.multiply(restWorldQ);
      const parentWorldQ = new THREE.Quaternion();
      if (bone.parent) bone.parent.getWorldQuaternion(parentWorldQ);
      bone.quaternion.copy(parentWorldQ.invert().multiply(desired));
      return;
    }
    const delta = new THREE.Quaternion().setFromUnitVectors(rDir, targetDir);
    const desiredWorldQ = delta.multiply(restWorldQ);
    const parentWorldQ  = new THREE.Quaternion();
    if (bone.parent) bone.parent.getWorldQuaternion(parentWorldQ);
    bone.quaternion.slerp(parentWorldQ.invert().multiply(desiredWorldQ), alpha);
  }

  function driveFinger(lm: number[][], mcp: number, pip: number, dip: number, tip: number,
    b1: string, b2: string, b3: string) {
    rotateBoneToward(b1, mpDir(lm[mcp], lm[pip]));
    rotateBoneToward(b2, mpDir(lm[pip], lm[dip]));
    rotateBoneToward(b3, mpDir(lm[dip], lm[tip]));
  }

  function driveHand(hand: number[][], side: "l" | "r") {
    if (!hand || hand.length < 21) return;
    const s = side;
    rotateBoneToward(BONES[`${s}_hand`], mpDir(hand[0], hand[9]));
    driveFinger(hand,1,2,3,4,     BONES[`${s}_thumb1`],BONES[`${s}_thumb2`],BONES[`${s}_thumb3`]);
    driveFinger(hand,5,6,7,8,     BONES[`${s}_index1`],BONES[`${s}_index2`],BONES[`${s}_index3`]);
    driveFinger(hand,9,10,11,12,  BONES[`${s}_mid1`],  BONES[`${s}_mid2`],  BONES[`${s}_mid3`]);
    driveFinger(hand,13,14,15,16, BONES[`${s}_ring1`], BONES[`${s}_ring2`], BONES[`${s}_ring3`]);
    driveFinger(hand,17,18,19,20, BONES[`${s}_pinky1`],BONES[`${s}_pinky2`],BONES[`${s}_pinky3`]);
  }

  useFrame((_, delta) => {
    if (!isPlaying || !keypoints?.length) return;
    elapsed.current += Math.min(delta, 0.1);
    if (elapsed.current >= frameInterval) {
      elapsed.current = 0;
      if (frameIndex < keypoints.length - 1) onFrameAdvance();
    }
    const frame = keypoints[frameIndex];
    if (!frame) return;
    const pose  = frame.pose       as number[][] | undefined;
    const left  = frame.left_hand  as number[][] | undefined;
    const right = frame.right_hand as number[][] | undefined;
    if (pose && pose.length >= 17) {
      rotateBoneToward(BONES.r_upperarm, mpDir(pose[11], pose[13]));
      rotateBoneToward(BONES.r_forearm,  mpDir(pose[13], pose[15]));
      rotateBoneToward(BONES.l_upperarm, mpDir(pose[12], pose[14]));
      rotateBoneToward(BONES.l_forearm,  mpDir(pose[14], pose[16]));
    }
    if (left)  driveHand(left,  "r");
    if (right) driveHand(right, "l");
  });

  return (
    <group position={[0, -0.8, 0]}>
      <primitive object={scene} scale={1} />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   SKELETON CONNECTIONS
───────────────────────────────────────────────────────────── */
const POSE_CONNECTIONS: [number, number][] = [
  [11,12],[11,13],[13,15],[12,14],[14,16],
  [11,23],[12,24],[23,24],[23,25],[24,26],
  [25,27],[26,28],[27,29],[28,30],[29,31],[30,32],
];
const HAND_CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
];

/* ─────────────────────────────────────────────────────────────
   SKELETON VIEWER (2-D canvas)
───────────────────────────────────────────────────────────── */
function SkeletonViewer({
  keypoints,
  fps,
  isPlaying,
  frameIndex,
  onFrameAdvance,
}: {
  keypoints: any[];
  fps: number;
  isPlaying: boolean;
  frameIndex: number;
  onFrameAdvance: () => void;
}) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number>(0);
  const lastTimeRef  = useRef<number>(0);
  const frameInterval = 1000 / fps;

  // Keep a ref to the latest values so RAF closure stays fresh
  const isPlayingRef   = useRef(isPlaying);
  const frameIndexRef  = useRef(frameIndex);
  const totalRef       = useRef(keypoints.length);
  useEffect(() => { isPlayingRef.current  = isPlaying;       }, [isPlaying]);
  useEffect(() => { frameIndexRef.current = frameIndex;      }, [frameIndex]);
  useEffect(() => { totalRef.current      = keypoints.length;}, [keypoints.length]);

  // ── Zoom / pan state ───────────────────────────────────
  const zoomRef   = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const dragRef   = useRef<{ active: boolean; lastX: number; lastY: number; lastDist: number }>({
    active: false, lastX: 0, lastY: 0, lastDist: 0,
  });

  // ── draw one frame ──────────────────────────────────────
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
    for (let x = -W; x < W * 2; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H*2); ctx.stroke(); }
    for (let y = -H; y < H * 2; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W*2,y); ctx.stroke(); }

    const frame = keypoints[frameIdx];
    if (!frame) return;

    const pose  = frame.pose       as number[][] | undefined;
    const left  = frame.left_hand  as number[][] | undefined;
    const right = frame.right_hand as number[][] | undefined;

    // pose world coords: negate x to mirror for viewer, keep y natural (up = up)
    function poseXY(pt: number[]): [number, number] {
      return [(-pt[0] * 0.55 + 0.5) * W, (pt[1] * 0.55 + 0.38) * H];
    }
    // Hand landmarks are in world space (metres), wrist-relative after subtracting lm[0].
    // Use the SAME scale as poseXY (0.55 * canvas dimension) so the hand
    // sits flush against the pose wrist with no gap or overlap.
    // Detect coord space: world landmarks are small (~0.0–0.3), image landmarks are large (0–1)
    // Image-space landmarks have x already in screen direction; world-space need negation to mirror.
    function handXY(pt: number[], wristLm: number[], wx: number, wy: number, flipX = false): [number, number] {
      const rx = pt[0] - wristLm[0];
      const ry = pt[1] - wristLm[1];
      return [wx + (flipX ? -rx : rx) * 0.55 * W, wy + ry * 0.55 * H];
    }

    // ── Face (landmarks 0–10) ──────────────────────────────
    if (pose && pose.length >= 11) {
      const nose   = pose[0]  ? poseXY(pose[0])  : null;
      const lEye   = pose[2]  ? poseXY(pose[2])  : null;
      const rEye   = pose[5]  ? poseXY(pose[5])  : null;
      const lEar   = pose[7]  ? poseXY(pose[7])  : null;
      const rEar   = pose[8]  ? poseXY(pose[8])  : null;
      const mouthL = pose[9]  ? poseXY(pose[9])  : null;
      const mouthR = pose[10] ? poseXY(pose[10]) : null;

      // Head circle from ear span
      if (lEar && rEar) {
        const hcx = (lEar[0] + rEar[0]) / 2;
        const hcy = (lEar[1] + rEar[1]) / 2;
        const hr  = Math.hypot(lEar[0] - rEar[0], lEar[1] - rEar[1]) * 0.65;
        ctx.beginPath(); ctx.arc(hcx, hcy, hr, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(167,139,250,0.45)"; ctx.lineWidth = 1.5; ctx.stroke();
      }

      // Nose → eye guide lines
      if (nose && lEye) {
        ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.lineTo(lEye[0], lEye[1]);
        ctx.strokeStyle = "rgba(167,139,250,0.25)"; ctx.lineWidth = 1; ctx.stroke();
      }
      if (nose && rEye) {
        ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.lineTo(rEye[0], rEye[1]);
        ctx.strokeStyle = "rgba(167,139,250,0.25)"; ctx.lineWidth = 1; ctx.stroke();
      }

      // Mouth
      if (mouthL && mouthR) {
        ctx.beginPath(); ctx.moveTo(mouthL[0], mouthL[1]); ctx.lineTo(mouthR[0], mouthR[1]);
        ctx.strokeStyle = "rgba(244,114,182,0.85)"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.stroke();
      }

      // Eyes
      for (const eye of [lEye, rEye]) {
        if (!eye) continue;
        ctx.beginPath(); ctx.arc(eye[0], eye[1], 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#a5b4fc"; ctx.shadowColor = "#818cf8"; ctx.shadowBlur = 8;
        ctx.fill(); ctx.shadowBlur = 0;
      }

      // Ears
      for (const ear of [lEar, rEar]) {
        if (!ear) continue;
        ctx.beginPath(); ctx.arc(ear[0], ear[1], 3, 0, Math.PI * 2);
        ctx.fillStyle = "#818cf8"; ctx.fill();
      }

      // Nose
      if (nose) {
        ctx.beginPath(); ctx.arc(nose[0], nose[1], 3, 0, Math.PI * 2);
        ctx.fillStyle = "#c4b5fd"; ctx.shadowColor = "#a78bfa"; ctx.shadowBlur = 6;
        ctx.fill(); ctx.shadowBlur = 0;
      }
    }

    // ── Body skeleton (landmarks 11+) ──────────────────────
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

    const leftWrist  = pose?.[15] ? poseXY(pose[15]) : [W * 0.65, H * 0.62] as [number,number];
    const rightWrist = pose?.[16] ? poseXY(pose[16]) : [W * 0.35, H * 0.62] as [number,number];

    function drawHand(c: CanvasRenderingContext2D, lm: number[][], wx: number, wy: number, lineColor: string, dotColor: string) {
      if (!lm || lm.length < 21) return;
      c.lineCap = "round";
      c.lineJoin = "round";
      // Detect coordinate space by checking z values:
      // - World-space landmarks (both words AND alphabet): z has meaningful depth, e.g. -0.005 to -0.04
      // - The wrist landmark [0] always has z = 0 (it's the origin), but finger landmarks have real z.
      // - True image-space (0-1 normalised) landmarks would have z near 0 for ALL points.
      // So: if ALL z values are extremely close to 0 (< 0.001), it's image-space.
      // Both word and alphabet keypoints are world-space — they always need the flip.
      const maxAbsZ = Math.max(...lm.slice(1).map(pt => Math.abs(pt[2])));
      const isImageSpace = maxAbsZ < 0.001;
      const flipX = !isImageSpace; // world-space (both words + alphabet) always needs flip

      // Each finger as a chain of straight lines — exactly like the Python MediaPipe style
      // Chains: thumb=[0,1,2,3,4], index=[0,5,6,7,8], middle=[0,9,10,11,12],
      //         ring=[0,13,14,15,16], pinky=[0,17,18,19,20]
      // Palm cross-connections: 5-9, 9-13, 13-17
      const chains = [
        [0, 1, 2, 3, 4],       // thumb
        [0, 5, 6, 7, 8],       // index
        [0, 9, 10, 11, 12],    // middle
        [0, 13, 14, 15, 16],   // ring
        [0, 17, 18, 19, 20],   // pinky
      ];
      const palmLinks: [number, number][] = [[5,9],[9,13],[13,17]];

      // ── Bone lines ─────────────────────────────────────────
      c.strokeStyle = lineColor;
      // Slightly thicker near palm, thinner near fingertip
      chains.forEach((chain) => {
        for (let s = 0; s < chain.length - 1; s++) {
          const [ax, ay] = handXY(lm[chain[s]],   lm[0], wx, wy, flipX);
          const [bx, by] = handXY(lm[chain[s+1]], lm[0], wx, wy, flipX);
          // Thicker at palm (s=0), thinner near tip
          c.lineWidth = s === 0 ? 2.5 : s === 1 ? 2.0 : 1.6;
          c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
        }
      });

      // Palm knuckle cross-bar
      c.lineWidth = 1.8;
      palmLinks.forEach(([a, b]) => {
        const [ax, ay] = handXY(lm[a], lm[0], wx, wy, flipX);
        const [bx, by] = handXY(lm[b], lm[0], wx, wy, flipX);
        c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
      });

      // ── Joint dots ─────────────────────────────────────────
      for (let i = 0; i < 21; i++) {
        const [x, y] = handXY(lm[i], lm[0], wx, wy, flipX);
        // Tips (4,8,12,16,20) are white; knuckles are dotColor; wrist is larger
        const isTip   = [4, 8, 12, 16, 20].includes(i);
        const isWrist = i === 0;
        const r = isWrist ? 5 : isTip ? 3.5 : 2.5;
        c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
        c.fillStyle   = isTip ? "#ffffff" : dotColor;
        c.shadowColor = dotColor;
        c.shadowBlur  = isTip ? 10 : isWrist ? 14 : 5;
        c.fill();
        c.shadowBlur  = 0;
      }
    }

    if (left)  drawHand(ctx, left,  rightWrist[0], rightWrist[1], "rgba(251,191,36,0.75)",  "#fbbf24");
    if (right) drawHand(ctx, right, leftWrist[0],  leftWrist[1],  "rgba(52,211,153,0.75)",  "#34d399");

    ctx.restore(); // end zoom transform

    // ── HUD fixed to screen ────────────────────────────────
    ([["#818cf8","Pose"],["#fbbf24","Left Hand"],["#34d399","Right Hand"]] as [string,string][])
      .forEach(([color, label], i) => {
        ctx.beginPath(); ctx.arc(14, H - 14 - i * 18, 5, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.shadowBlur = 0; ctx.fill();
        ctx.fillStyle = "rgba(203,213,225,0.7)";
        ctx.font = "11px monospace"; ctx.fillText(label, 24, H - 10 - i * 18);
      });
    ctx.fillStyle = "rgba(129,140,248,0.45)";
    ctx.font = "10px monospace"; ctx.textAlign = "right";
    ctx.fillText(`${frameIdx + 1} / ${keypoints.length}`, W - 8, H - 8);
    if (Math.abs(zoomRef.current - 1) > 0.05)
      ctx.fillText(`${(zoomRef.current * 100).toFixed(0)}%`, W - 8, H - 20);
    ctx.textAlign = "left";
  }, [keypoints]);

  // Redraw whenever frameIndex changes
  useEffect(() => { draw(frameIndex); }, [frameIndex, draw]);

  // RAF loop for advancing frames
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    lastTimeRef.current = 0;
    if (!isPlaying) return;

    const loop = (ts: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = ts;
      if (ts - lastTimeRef.current >= frameInterval) {
        lastTimeRef.current = ts;
        if (frameIndexRef.current < totalRef.current - 1) {
          onFrameAdvance();
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, frameInterval, onFrameAdvance]);

  // ── Zoom / pan handlers ───────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * sx;
    const my = (e.clientY - rect.top)  * sy;
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
    dragRef.current.lastX = e.clientX; dragRef.current.lastY = e.clientY;
    draw(frameIndexRef.current);
  }, [draw]);
  const stopDrag = useCallback(() => { dragRef.current.active = false; }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      dragRef.current.lastDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else {
      dragRef.current = { active: true, lastX: e.touches[0].clientX, lastY: e.touches[0].clientY, lastDist: 0 };
    }
  }, []);
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width; const sy = canvas.height / rect.height;
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (dragRef.current.lastDist > 0) {
        const factor = dist / dragRef.current.lastDist;
        const cx = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) * sx;
        const cy = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top)  * sy;
        const nz = Math.min(Math.max(zoomRef.current * factor, 0.3), 6);
        offsetRef.current = {
          x: cx - (cx - offsetRef.current.x) * (nz / zoomRef.current),
          y: cy - (cy - offsetRef.current.y) * (nz / zoomRef.current),
        };
        zoomRef.current = nz;
      }
      dragRef.current.lastDist = dist;
    } else if (dragRef.current.active) {
      offsetRef.current = {
        x: offsetRef.current.x + (e.touches[0].clientX - dragRef.current.lastX) * sx,
        y: offsetRef.current.y + (e.touches[0].clientY - dragRef.current.lastY) * sy,
      };
      dragRef.current.lastX = e.touches[0].clientX; dragRef.current.lastY = e.touches[0].clientY;
    }
    draw(frameIndexRef.current);
  }, [draw]);

  const handleDoubleClick = useCallback(() => {
    zoomRef.current = 1; offsetRef.current = { x: 0, y: 0 };
    draw(frameIndexRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={520}
      height={400}
      style={{ width: "100%", height: "100%", display: "block", cursor: dragRef.current.active ? "grabbing" : "grab" }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={stopDrag}
      onDoubleClick={handleDoubleClick}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   PLAYBACK CONTROLS
───────────────────────────────────────────────────────────── */
function PlaybackControls({
  isPlaying, onPlay, onPause, onReplay, frameIndex, total,
}: {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReplay: () => void;
  frameIndex: number;
  total: number;
}) {
  const pct = total > 1 ? (frameIndex / (total - 1)) * 100 : 0;
  const base: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "none", cursor: "pointer", transition: "all 0.15s",
  };
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: "8px",
      padding: "10px 16px 12px", flexShrink: 0,
      background: "rgba(8,13,26,0.92)",
      borderTop: "1px solid rgba(99,102,241,0.18)",
    }}>
      {/* Progress bar */}
      <div style={{ height: "4px", borderRadius: "4px", background: "rgba(99,102,241,0.15)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: "linear-gradient(90deg, #6366f1, #a78bfa)",
          borderRadius: "4px", transition: "width 0.08s linear",
        }} />
      </div>
      {/* Buttons */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
        <button onClick={onReplay} title="Replay" style={{
          ...base, width: 36, height: 36, borderRadius: "50%",
          background: "rgba(99,102,241,0.12)",
          border: "1px solid rgba(99,102,241,0.35)",
          color: "#a78bfa", fontSize: "18px",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.28)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(99,102,241,0.12)")}
        >↺</button>

        {isPlaying ? (
          <button onClick={onPause} title="Pause" style={{
            ...base, width: 46, height: 46, borderRadius: "50%",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff", fontSize: "20px",
            boxShadow: "0 0 20px rgba(99,102,241,0.5)",
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >⏸</button>
        ) : (
          <button onClick={onPlay} title="Play" style={{
            ...base, width: 46, height: 46, borderRadius: "50%",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff", fontSize: "20px",
            boxShadow: "0 0 20px rgba(99,102,241,0.5)",
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >▶</button>
        )}

        <span style={{
          fontSize: "11px", fontFamily: "monospace",
          color: "rgba(129,140,248,0.5)", minWidth: "70px", textAlign: "center",
        }}>
          {total > 0 ? `${frameIndex + 1} / ${total}` : "no data"}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT EXPORT
───────────────────────────────────────────────────────────── */
export default function AvatarViewer({ keypoints, fps = 25 }: Props) {
  const [activeTab,  setActiveTab]  = useState<"avatar" | "skeleton">("avatar");
  const [isPlaying,  setIsPlaying]  = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);

  const advanceFrame = useCallback(() => {
    setFrameIndex(prev => {
      const next = prev + 1;
      if (next >= keypoints.length - 1) setIsPlaying(false);
      return Math.min(next, keypoints.length - 1);
    });
  }, [keypoints.length]);

  useEffect(() => { setFrameIndex(0); setIsPlaying(false); }, [keypoints]);

  const tab = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "9px 0", border: "none", cursor: "pointer",
    background: active ? "rgba(99,102,241,0.2)" : "transparent",
    borderBottom: `2px solid ${active ? "#818cf8" : "transparent"}`,
    color: active ? "#c7d2fe" : "rgba(148,163,184,0.5)",
    fontWeight: active ? 600 : 400, fontSize: "13px",
    letterSpacing: "0.04em", transition: "all 0.18s",
  });

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", width: "100%",
      background: "#080d1a",
    }}>
      {/* TAB BAR */}
      <div style={{
        display: "flex", flexShrink: 0,
        background: "rgba(8,13,26,0.98)",
        borderBottom: "1px solid rgba(99,102,241,0.18)",
      }}>
        <button style={tab(activeTab === "avatar")}   onClick={() => setActiveTab("avatar")}>
          🧍 Avatar
        </button>
        <button style={tab(activeTab === "skeleton")} onClick={() => setActiveTab("skeleton")}>
          🦴 Skeleton
        </button>
      </div>

      {/* VIEWER */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>

        {/* Avatar */}
        <div style={{ position: "absolute", inset: 0, display: activeTab === "avatar" ? "block" : "none" }}>
          <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 4, 3]} intensity={1.4} />
            <AnimatedAvatar
              keypoints={keypoints} fps={fps}
              isPlaying={isPlaying} frameIndex={frameIndex}
              onFrameAdvance={advanceFrame}
            />
          </Canvas>
        </div>

        {/* Skeleton */}
        <div style={{
          position: "absolute", inset: 0,
          display: activeTab === "skeleton" ? "flex" : "none",
          alignItems: "center", justifyContent: "center",
        }}>
          {keypoints.length > 0 ? (
            <SkeletonViewer
              keypoints={keypoints} fps={fps}
              isPlaying={isPlaying} frameIndex={frameIndex}
              onFrameAdvance={advanceFrame}
            />
          ) : (
            <div style={{ textAlign: "center", color: "rgba(148,163,184,0.4)" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>🦴</div>
              <div style={{ fontSize: "13px" }}>No keypoints loaded yet</div>
            </div>
          )}
        </div>
      </div>

      {/* CONTROLS */}
      <PlaybackControls
        isPlaying={isPlaying}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onReplay={() => { setFrameIndex(0); setIsPlaying(true); }}
        frameIndex={frameIndex}
        total={keypoints.length}
      />
    </div>
  );
}