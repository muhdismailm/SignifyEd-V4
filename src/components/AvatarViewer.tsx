
// // import { Canvas, useFrame } from "@react-three/fiber";
// // import { useGLTF } from "@react-three/drei";
// // import { useEffect, useRef } from "react";
// // import * as THREE from "three";

// // interface Props {
// //   keypoints: any[];
// //   fps?: number;
// // }

// // const CC4_BONES = {
// //   hip:        "CC_Base_Hip_03",
// //   waist:      "CC_Base_Waist_035",
// //   spine1:     "CC_Base_Spine01_036",
// //   spine2:     "CC_Base_Spine02_037",
// //   neck1:      "CC_Base_NeckTwist01_038",
// //   neck2:      "CC_Base_NeckTwist02_039",
// //   head:       "CC_Base_Head_040",
// //   l_clavicle: "CC_Base_L_Clavicle_051",
// //   l_upperarm: "CC_Base_L_Upperarm_052",
// //   l_forearm:  "CC_Base_L_Forearm_053",
// //   l_hand:     "CC_Base_L_Hand_057",
// //   l_thumb1:   "CC_Base_L_Thumb1_070",
// //   l_thumb2:   "CC_Base_L_Thumb2_071",
// //   l_thumb3:   "CC_Base_L_Thumb3_072",
// //   l_index1:   "CC_Base_L_Index1_067",
// //   l_index2:   "CC_Base_L_Index2_068",
// //   l_index3:   "CC_Base_L_Index3_069",
// //   l_mid1:     "CC_Base_L_Mid1_064",
// //   l_mid2:     "CC_Base_L_Mid2_065",
// //   l_mid3:     "CC_Base_L_Mid3_066",
// //   l_ring1:    "CC_Base_L_Ring1_061",
// //   l_ring2:    "CC_Base_L_Ring2_062",
// //   l_ring3:    "CC_Base_L_Ring3_063",
// //   l_pinky1:   "CC_Base_L_Pinky1_058",
// //   l_pinky2:   "CC_Base_L_Pinky2_059",
// //   l_pinky3:   "CC_Base_L_Pinky3_060",
// //   r_clavicle: "CC_Base_R_Clavicle_079",
// //   r_upperarm: "CC_Base_R_Upperarm_080",
// //   r_forearm:  "CC_Base_R_Forearm_081",
// //   r_hand:     "CC_Base_R_Hand_085",
// //   r_thumb1:   "CC_Base_R_Thumb1_092",
// //   r_thumb2:   "CC_Base_R_Thumb2_093",
// //   r_thumb3:   "CC_Base_R_Thumb3_094",
// //   r_index1:   "CC_Base_R_Index1_095",
// //   r_index2:   "CC_Base_R_Index2_096",
// //   r_index3:   "CC_Base_R_Index3_097",
// //   r_mid1:     "CC_Base_R_Mid1_089",
// //   r_mid2:     "CC_Base_R_Mid2_090",
// //   r_mid3:     "CC_Base_R_Mid3_091",
// //   r_ring1:    "CC_Base_R_Ring1_086",
// //   r_ring2:    "CC_Base_R_Ring2_087",
// //   r_ring3:    "CC_Base_R_Ring3_088",
// //   r_pinky1:   "CC_Base_R_Pinky1_00",
// //   r_pinky2:   "CC_Base_R_Pinky2_01",
// //   r_pinky3:   "CC_Base_R_Pinky3_098",
// // } as const;

// // // ─── Coordinate conversion ────────────────────────────────────────────────────
// // // MediaPipe: x=0 left→1 right, y=0 top→1 bottom, z depth into screen
// // // Three.js:  x right, y up, z toward camera
// // // The avatar group has rotation [0.5, 0, -3.2] so we match that orientation.
// // // DO NOT negate X — negating it caused the backward flip.
// // function mpToWorld(p: number[]): THREE.Vector3 {
// //   return new THREE.Vector3(
// //     p[0] - 0.5,   // centre around 0, no flip
// //     0.5 - p[1],   // flip Y (MediaPipe y-down → Three y-up)
// //     -p[2]
// //   );
// // }

// // function mpDir(a: number[], b: number[]): THREE.Vector3 {
// //   return mpToWorld(b).sub(mpToWorld(a)).normalize();
// // }

// // function midpoint(a: number[], b: number[]): number[] {
// //   return a.map((v, i) => (v + b[i]) / 2);
// // }

// // // ─── Animated Avatar ──────────────────────────────────────────────────────────
// // function AnimatedAvatar({ keypoints, fps = 25 }: Props) {
// //   const { scene } = useGLTF("/avatar.glb");

// //   const bones      = useRef<Record<string, THREE.Bone>>({});
// //   const restDir    = useRef<Record<string, THREE.Vector3>>({});
// //   const restLocalQ = useRef<Record<string, THREE.Quaternion>>({});

// //   const frameIndex    = useRef(0);
// //   const elapsed       = useRef(0);
// //   const frameInterval = 1 / fps;

// //   useEffect(() => {
// //     scene.traverse((obj) => {
// //       if (!(obj as THREE.Bone).isBone) return;
// //       const bone = obj as THREE.Bone;
// //       bones.current[bone.name] = bone;

// //       // Freeze rest local quaternion once at load
// //       restLocalQ.current[bone.name] = bone.quaternion.clone();

// //       // World-space rest direction toward first child bone
// //       const childBone = bone.children.find(
// //         (c) => (c as THREE.Bone).isBone
// //       ) as THREE.Object3D | undefined;

// //       if (childBone) {
// //         const bPos = new THREE.Vector3();
// //         const cPos = new THREE.Vector3();
// //         bone.getWorldPosition(bPos);
// //         childBone.getWorldPosition(cPos);
// //         restDir.current[bone.name] = cPos.sub(bPos).normalize();
// //       }
// //     });

// //     console.group("🦴 CC4 Bone verification");
// //     Object.entries(CC4_BONES).forEach(([key, name]) => {
// //       if (bones.current[name]) console.log(`✅ ${key}: "${name}"`);
// //       else console.warn(`❌ MISSING ${key}: "${name}"`);
// //     });
// //     console.groupEnd();
// //   }, [scene]);

// //   useEffect(() => {
// //     frameIndex.current = 0;
// //     elapsed.current = 0;
// //   }, [keypoints]);

// //   // ─── Core rotation ──────────────────────────────────────────────────────────
// //   // Always rotate FROM the frozen rest quaternion, not from current bone state.
// //   // Local-space conversion: localDelta = parentWorldInv * worldDelta
// //   // (NOT the incorrect sandwich: parentWorldInv * worldDelta * parentWorld)
// //   function rotateBoneToward(boneName: string, targetDir: THREE.Vector3, alpha = 0.35) {
// //     const bone  = bones.current[boneName];
// //     const rDir  = restDir.current[boneName];
// //     const restQ = restLocalQ.current[boneName];
// //     if (!bone || !rDir || !restQ || targetDir.lengthSq() < 0.001) return;

// //     // World-space rotation: rest dir → target dir
// //     const worldDelta = new THREE.Quaternion().setFromUnitVectors(rDir, targetDir);

// //     // Convert to local space correctly: localDelta = inv(parentWorld) * worldDelta
// //     const parentWorld = new THREE.Quaternion();
// //     if (bone.parent) bone.parent.getWorldQuaternion(parentWorld);
// //     const localDelta = parentWorld.clone().invert().multiply(worldDelta);

// //     // Apply on top of frozen rest — prevents any accumulation
// //     const targetQuat = restQ.clone().multiply(localDelta);
// //     bone.quaternion.slerp(targetQuat, alpha);
// //   }

// //   // ─── Finger driving ─────────────────────────────────────────────────────────
// //   function driveFinger(
// //     lm: number[][],
// //     mcpIdx: number, pipIdx: number, dipIdx: number, tipIdx: number,
// //     b1: string, b2: string, b3: string,
// //     alpha = 0.3
// //   ) {
// //     if (lm.length <= tipIdx) return;
// //     rotateBoneToward(b1, mpDir(lm[mcpIdx], lm[pipIdx]), alpha);
// //     rotateBoneToward(b2, mpDir(lm[pipIdx], lm[dipIdx]), alpha);
// //     rotateBoneToward(b3, mpDir(lm[dipIdx], lm[tipIdx]), alpha);
// //   }

// //   function driveHand(hand: number[][], side: "l" | "r", alpha = 0.3) {
// //     if (!hand || hand.length < 21) return;
// //     const s = side;
// //     rotateBoneToward(CC4_BONES[`${s}_hand`], mpDir(hand[0], midpoint(hand[5], hand[17])), alpha);
// //     driveFinger(hand, 1,  2,  3,  4,  CC4_BONES[`${s}_thumb1`], CC4_BONES[`${s}_thumb2`], CC4_BONES[`${s}_thumb3`], alpha);
// //     driveFinger(hand, 5,  6,  7,  8,  CC4_BONES[`${s}_index1`], CC4_BONES[`${s}_index2`], CC4_BONES[`${s}_index3`], alpha);
// //     driveFinger(hand, 9,  10, 11, 12, CC4_BONES[`${s}_mid1`],   CC4_BONES[`${s}_mid2`],   CC4_BONES[`${s}_mid3`],   alpha);
// //     driveFinger(hand, 13, 14, 15, 16, CC4_BONES[`${s}_ring1`],  CC4_BONES[`${s}_ring2`],  CC4_BONES[`${s}_ring3`],  alpha);
// //     driveFinger(hand, 17, 18, 19, 20, CC4_BONES[`${s}_pinky1`], CC4_BONES[`${s}_pinky2`], CC4_BONES[`${s}_pinky3`], alpha);
// //   }

// //   // ─── Per-frame loop ──────────────────────────────────────────────────────────
// //   useFrame((_, delta) => {
// //     if (!keypoints?.length) return;

// //     elapsed.current += Math.min(delta, 0.1);
// //     if (elapsed.current >= frameInterval) {
// //       elapsed.current = 0;
// //       frameIndex.current = (frameIndex.current + 1) % keypoints.length;
// //     }

// //     const frame = keypoints[frameIndex.current];
// //     if (!frame) return;

// //     const pose      = frame.pose       as number[][] | undefined;
// //     const leftHand  = frame.left_hand  as number[][] | undefined;
// //     const rightHand = frame.right_hand as number[][] | undefined;

// //     // Arms
// //     if (pose && pose.length >= 17) {
// //       rotateBoneToward(CC4_BONES.l_upperarm, mpDir(pose[11], pose[13]));
// //       rotateBoneToward(CC4_BONES.l_forearm,  mpDir(pose[13], pose[15]));
// //       rotateBoneToward(CC4_BONES.r_upperarm, mpDir(pose[12], pose[14]));
// //       rotateBoneToward(CC4_BONES.r_forearm,  mpDir(pose[14], pose[16]));
// //     }

// //     // Hands + fingers
// //     if (leftHand) {
// //       driveHand(leftHand, "l");
// //     } else if (pose && pose.length >= 22) {
// //       rotateBoneToward(CC4_BONES.l_hand, mpDir(pose[15], midpoint(pose[17], pose[19])), 0.3);
// //     }

// //     if (rightHand) {
// //       driveHand(rightHand, "r");
// //     } else if (pose && pose.length >= 22) {
// //       rotateBoneToward(CC4_BONES.r_hand, mpDir(pose[16], midpoint(pose[18], pose[20])), 0.3);
// //     }
// //   });

// //   return (
// //     <group rotation={[.5, 0, -3.2]} position={[0, -3, 0]}>
// //       <primitive object={scene} scale={1.5} />
// //     </group>
// //   );
// // }

// // export default function AvatarViewer({ keypoints, fps = 25 }: Props) {
// //   return (
// //     <Canvas camera={{ position: [0, -5, -3], fov: 40 }}>
// //       <ambientLight intensity={0.6} />
// //       <directionalLight position={[2, 4, 3]} intensity={1.4} castShadow />
// //       <AnimatedAvatar keypoints={keypoints} fps={fps} />
// //     </Canvas>
// //   );
// // } 

// import { Canvas, useFrame } from "@react-three/fiber";
// import { useGLTF } from "@react-three/drei";
// import { useEffect, useRef } from "react";
// import * as THREE from "three";

// interface Props {
//   keypoints: any[];
//   fps?: number;
// }

// // ─── Mixamo standard bone names ───────────────────────────────────────────────
// const BONES = {
//   // Spine
//   hips:       "Hips",
//   spine:      "Spine",
//   spine1:     "Spine1",
//   spine2:     "Spine2",
//   neck:       "Neck",
//   head:       "Head",

//   // Left arm
//   l_shoulder: "LeftShoulder",
//   l_upperarm: "LeftArm",
//   l_forearm:  "LeftForeArm",
//   l_hand:     "LeftHand",

//   // Left fingers
//   l_thumb1:   "LeftHandThumb1",
//   l_thumb2:   "LeftHandThumb2",
//   l_thumb3:   "LeftHandThumb3",
//   l_index1:   "LeftHandIndex1",
//   l_index2:   "LeftHandIndex2",
//   l_index3:   "LeftHandIndex3",
//   l_mid1:     "LeftHandMiddle1",
//   l_mid2:     "LeftHandMiddle2",
//   l_mid3:     "LeftHandMiddle3",
//   l_ring1:    "LeftHandRing1",
//   l_ring2:    "LeftHandRing2",
//   l_ring3:    "LeftHandRing3",
//   l_pinky1:   "LeftHandPinky1",
//   l_pinky2:   "LeftHandPinky2",
//   l_pinky3:   "LeftHandPinky3",

//   // Right arm
//   r_shoulder: "RightShoulder",
//   r_upperarm: "RightArm",
//   r_forearm:  "RightForeArm",
//   r_hand:     "RightHand",

//   // Right fingers
//   r_thumb1:   "RightHandThumb1",
//   r_thumb2:   "RightHandThumb2",
//   r_thumb3:   "RightHandThumb3",
//   r_index1:   "RightHandIndex1",
//   r_index2:   "RightHandIndex2",
//   r_index3:   "RightHandIndex3",
//   r_mid1:     "RightHandMiddle1",
//   r_mid2:     "RightHandMiddle2",
//   r_mid3:     "RightHandMiddle3",
//   r_ring1:    "RightHandRing1",
//   r_ring2:    "RightHandRing2",
//   r_ring3:    "RightHandRing3",
//   r_pinky1:   "RightHandPinky1",
//   r_pinky2:   "RightHandPinky2",
//   r_pinky3:   "RightHandPinky3",
// } as const;

// // ─── MediaPipe pose landmark indices used ─────────────────────────────────────
// // 11=L_shoulder  12=R_shoulder
// // 13=L_elbow     14=R_elbow
// // 15=L_wrist     16=R_wrist
// // 17=L_pinky     18=R_pinky
// // 19=L_index     20=R_index
// // 21=L_thumb     22=R_thumb
// // 23=L_hip       24=R_hip

// // ─── MediaPipe hand landmark indices ─────────────────────────────────────────
// // 0=wrist
// // 1=thumb_cmc  2=thumb_mcp  3=thumb_ip   4=thumb_tip
// // 5=index_mcp  6=index_pip  7=index_dip  8=index_tip
// // 9=mid_mcp   10=mid_pip   11=mid_dip   12=mid_tip
// // 13=ring_mcp 14=ring_pip  15=ring_dip  16=ring_tip
// // 17=pinky_mcp 18=pinky_pip 19=pinky_dip 20=pinky_tip

// // ─── Coordinate helpers ───────────────────────────────────────────────────────
// function mpToWorld(p: number[]): THREE.Vector3 {
//   return new THREE.Vector3(
//     p[0] - 0.5,    // centre X around 0
//     0.5 - p[1],    // flip Y (MediaPipe y-down → Three y-up)
//     -p[2]
//   );
// }

// function mpDir(a: number[], b: number[]): THREE.Vector3 {
//   return mpToWorld(b).sub(mpToWorld(a)).normalize();
// }

// function midpoint(a: number[], b: number[]): number[] {
//   return a.map((v, i) => (v + b[i]) / 2);
// }

// // ─── Animated Avatar ──────────────────────────────────────────────────────────
// function AnimatedAvatar({ keypoints, fps = 25 }: Props) {
//   const { scene } = useGLTF("/avatar.glb");

//   const bones      = useRef<Record<string, THREE.Bone>>({});
//   const restDir    = useRef<Record<string, THREE.Vector3>>({});
//   // Frozen rest local quaternion — always rotate FROM this, never accumulate
//   const restLocalQ = useRef<Record<string, THREE.Quaternion>>({});

//   const frameIndex    = useRef(0);
//   const elapsed       = useRef(0);
//   const frameInterval = 1 / fps;

//   // ── Bone discovery on load ──────────────────────────────────────────────────
//   useEffect(() => {
//     scene.traverse((obj) => {
//       if (!(obj as THREE.Bone).isBone) return;
//       const bone = obj as THREE.Bone;
//       bones.current[bone.name] = bone;

//       // Freeze rest local quaternion once
//       restLocalQ.current[bone.name] = bone.quaternion.clone();

//       // World-space rest direction toward first child bone
//       const childBone = bone.children.find(
//         (c) => (c as THREE.Bone).isBone
//       ) as THREE.Object3D | undefined;

//       if (childBone) {
//         const bPos = new THREE.Vector3();
//         const cPos = new THREE.Vector3();
//         bone.getWorldPosition(bPos);
//         childBone.getWorldPosition(cPos);
//         restDir.current[bone.name] = cPos.sub(bPos).normalize();
//       }
//     });

//     // Console verification — check for any ❌
//     console.group("🦴 Bone verification");
//     Object.entries(BONES).forEach(([key, name]) => {
//       if (bones.current[name]) console.log(`✅ ${key}: "${name}"`);
//       else console.warn(`❌ MISSING ${key}: "${name}"`);
//     });
//     console.groupEnd();
//   }, [scene]);

//   // Reset animation when new word/keypoints arrive
//   useEffect(() => {
//     frameIndex.current = 0;
//     elapsed.current = 0;
//   }, [keypoints]);

//   // ── Core rotation helper ────────────────────────────────────────────────────
//   function rotateBoneToward(boneName: string, targetDir: THREE.Vector3, alpha = 0.35) {
//     const bone  = bones.current[boneName];
//     const rDir  = restDir.current[boneName];
//     const restQ = restLocalQ.current[boneName];
//     if (!bone || !rDir || !restQ || targetDir.lengthSq() < 0.001) return;

//     // World-space delta: rest direction → target direction
//     const worldDelta = new THREE.Quaternion().setFromUnitVectors(rDir, targetDir);

//     // Convert to bone local space: localDelta = inv(parentWorld) * worldDelta
//     const parentWorld = new THREE.Quaternion();
//     if (bone.parent) bone.parent.getWorldQuaternion(parentWorld);
//     const localDelta = parentWorld.clone().invert().multiply(worldDelta);

//     // Always apply on top of FROZEN rest — never accumulates
//     const targetQuat = restQ.clone().multiply(localDelta);
//     bone.quaternion.slerp(targetQuat, alpha);
//   }

//   // ── Finger driving ──────────────────────────────────────────────────────────
//   function driveFinger(
//     lm: number[][],
//     mcpIdx: number, pipIdx: number, dipIdx: number, tipIdx: number,
//     b1: string, b2: string, b3: string,
//     alpha = 0.3
//   ) {
//     if (lm.length <= tipIdx) return;
//     rotateBoneToward(b1, mpDir(lm[mcpIdx], lm[pipIdx]), alpha);
//     rotateBoneToward(b2, mpDir(lm[pipIdx], lm[dipIdx]), alpha);
//     rotateBoneToward(b3, mpDir(lm[dipIdx], lm[tipIdx]), alpha);
//   }

//   function driveHand(hand: number[][], side: "l" | "r", alpha = 0.3) {
//     if (!hand || hand.length < 21) return;
//     const s = side;

//     // Wrist → palm centre direction
//     rotateBoneToward(BONES[`${s}_hand`], mpDir(hand[0], midpoint(hand[5], hand[17])), alpha);

//     // All 5 fingers
//     driveFinger(hand, 1,  2,  3,  4,  BONES[`${s}_thumb1`], BONES[`${s}_thumb2`], BONES[`${s}_thumb3`], alpha);
//     driveFinger(hand, 5,  6,  7,  8,  BONES[`${s}_index1`], BONES[`${s}_index2`], BONES[`${s}_index3`], alpha);
//     driveFinger(hand, 9,  10, 11, 12, BONES[`${s}_mid1`],   BONES[`${s}_mid2`],   BONES[`${s}_mid3`],   alpha);
//     driveFinger(hand, 13, 14, 15, 16, BONES[`${s}_ring1`],  BONES[`${s}_ring2`],  BONES[`${s}_ring3`],  alpha);
//     driveFinger(hand, 17, 18, 19, 20, BONES[`${s}_pinky1`], BONES[`${s}_pinky2`], BONES[`${s}_pinky3`], alpha);
//   }

//   // ── Per-frame animation loop ────────────────────────────────────────────────
//   useFrame((_, delta) => {
//     if (!keypoints?.length) return;

//     // Advance at correct fps — clamp delta to avoid big jumps
//     elapsed.current += Math.min(delta, 0.1);
//     if (elapsed.current >= frameInterval) {
//       elapsed.current = 0;
//       frameIndex.current = (frameIndex.current + 1) % keypoints.length;
//     }

//     const frame = keypoints[frameIndex.current];
//     if (!frame) return;

//     const pose      = frame.pose       as number[][] | undefined;
//     const leftHand  = frame.left_hand  as number[][] | undefined;
//     const rightHand = frame.right_hand as number[][] | undefined;

//     // Arms (pose landmarks)
//     if (pose && pose.length >= 17) {
//       rotateBoneToward(BONES.l_upperarm, mpDir(pose[11], pose[13]));
//       rotateBoneToward(BONES.l_forearm,  mpDir(pose[13], pose[15]));
//       rotateBoneToward(BONES.r_upperarm, mpDir(pose[12], pose[14]));
//       rotateBoneToward(BONES.r_forearm,  mpDir(pose[14], pose[16]));
//     }

//     // Hands + all fingers
//     // Falls back to pose wrist→fingertip when hand landmarks are null
//     if (leftHand) {
//       driveHand(leftHand, "l");
//     } else if (pose && pose.length >= 22) {
//       rotateBoneToward(BONES.l_hand, mpDir(pose[15], midpoint(pose[17], pose[19])), 0.3);
//     }

//     if (rightHand) {
//       driveHand(rightHand, "r");
//     } else if (pose && pose.length >= 22) {
//       rotateBoneToward(BONES.r_hand, mpDir(pose[16], midpoint(pose[18], pose[20])), 0.3);
//     }
//   });

//   // Mixamo avatars export in A-pose facing +Z
//   // rotation={[0, Math.PI, 0]} makes avatar face the camera
//   // Adjust position Y to vertically centre in your viewport
//   return (
//     <group rotation={[0, Math.PI, 0]} position={[0, -1, 0]}>
//       <primitive object={scene} scale={1} />
//     </group>
//   );
// }

// // ─── Canvas wrapper ───────────────────────────────────────────────────────────
// export default function AvatarViewer({ keypoints, fps = 25 }: Props) {
//   return (
//     <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
//       <ambientLight intensity={0.6} />
//       <directionalLight position={[2, 4, 3]} intensity={1.4} />
//       <AnimatedAvatar keypoints={keypoints} fps={fps} />
//     </Canvas>
//   );
// }


import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
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

  l_thumb1: "LeftHandThumb1",
  l_thumb2: "LeftHandThumb2",
  l_thumb3: "LeftHandThumb3",
  l_index1: "LeftHandIndex1",
  l_index2: "LeftHandIndex2",
  l_index3: "LeftHandIndex3",
  l_mid1:   "LeftHandMiddle1",
  l_mid2:   "LeftHandMiddle2",
  l_mid3:   "LeftHandMiddle3",
  l_ring1:  "LeftHandRing1",
  l_ring2:  "LeftHandRing2",
  l_ring3:  "LeftHandRing3",
  l_pinky1: "LeftHandPinky1",
  l_pinky2: "LeftHandPinky2",
  l_pinky3: "LeftHandPinky3",

  r_thumb1: "RightHandThumb1",
  r_thumb2: "RightHandThumb2",
  r_thumb3: "RightHandThumb3",
  r_index1: "RightHandIndex1",
  r_index2: "RightHandIndex2",
  r_index3: "RightHandIndex3",
  r_mid1:   "RightHandMiddle1",
  r_mid2:   "RightHandMiddle2",
  r_mid3:   "RightHandMiddle3",
  r_ring1:  "RightHandRing1",
  r_ring2:  "RightHandRing2",
  r_ring3:  "RightHandRing3",
  r_pinky1: "RightHandPinky1",
  r_pinky2: "RightHandPinky2",
  r_pinky3: "RightHandPinky3",
} as const;

/* ─────────────────────────────────────────────────────────────
   MEDIAPIPE → THREE CONVERSION
───────────────────────────────────────────────────────────── */
function mpToWorld(p: number[]): THREE.Vector3 {
  return new THREE.Vector3(
    -(p[0] - 0.5),
    0.5 - p[1],
    -p[2]
  );
}

function mpDir(a: number[], b: number[]): THREE.Vector3 {
  return mpToWorld(b).sub(mpToWorld(a)).normalize();
}

function midpoint(a: number[], b: number[]): number[] {
  return a.map((v, i) => (v + b[i]) / 2);
}

/* ─────────────────────────────────────────────────────────────
   ANIMATED AVATAR
───────────────────────────────────────────────────────────── */
function AnimatedAvatar({
  keypoints,
  fps = 25,
  isPlaying,
}: Props & { isPlaying: boolean }) {

  const { scene } = useGLTF("/avatar.glb");

  const bones = useRef<Record<string, THREE.Bone>>({});
  const restDir = useRef<Record<string, THREE.Vector3>>({});
  const restLocalQ = useRef<Record<string, THREE.Quaternion>>({});

  const frameIndex = useRef(0);
  const elapsed = useRef(0);
  const frameInterval = 1 / fps;

  /* ── Bone Discovery ───────────────────────── */
  useEffect(() => {
    scene.traverse((obj) => {
      if (!(obj as THREE.Bone).isBone) return;
      const bone = obj as THREE.Bone;

      bones.current[bone.name] = bone;
      restLocalQ.current[bone.name] = bone.quaternion.clone();

      const childBone = bone.children.find(
        (c) => (c as THREE.Bone).isBone
      ) as THREE.Object3D | undefined;

      if (childBone) {
        const bPos = new THREE.Vector3();
        const cPos = new THREE.Vector3();
        bone.getWorldPosition(bPos);
        childBone.getWorldPosition(cPos);
        restDir.current[bone.name] = cPos.sub(bPos).normalize();
      }
    });
  }, [scene]);

  /* ── Reset when new animation arrives ───────────────────────── */
  useEffect(() => {
    frameIndex.current = 0;
    elapsed.current = 0;
  }, [keypoints]);

  /* ── Rotation Helper (No Drift) ───────────────────────── */
  function rotateBoneToward(
    boneName: string,
    targetDir: THREE.Vector3,
    alpha = 0.35
  ) {
    const bone = bones.current[boneName];
    const rDir = restDir.current[boneName];
    const restQ = restLocalQ.current[boneName];

    if (!bone || !rDir || !restQ || targetDir.lengthSq() < 0.001) return;

    const worldDelta = new THREE.Quaternion()
      .setFromUnitVectors(rDir, targetDir);

    const parentWorld = new THREE.Quaternion();
    if (bone.parent) bone.parent.getWorldQuaternion(parentWorld);

    const localDelta = parentWorld.clone().invert().multiply(worldDelta);
    const targetQuat = restQ.clone().multiply(localDelta);

    bone.quaternion.slerp(targetQuat, alpha);
  }

  /* ── Finger Driver ───────────────────────── */
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

    rotateBoneToward(
      BONES[`${s}_hand`],
      mpDir(hand[0], midpoint(hand[5], hand[17]))
    );

    driveFinger(hand, 1,2,3,4,  BONES[`${s}_thumb1`], BONES[`${s}_thumb2`], BONES[`${s}_thumb3`]);
    driveFinger(hand, 5,6,7,8,  BONES[`${s}_index1`], BONES[`${s}_index2`], BONES[`${s}_index3`]);
    driveFinger(hand, 9,10,11,12,BONES[`${s}_mid1`],   BONES[`${s}_mid2`],   BONES[`${s}_mid3`]);
    driveFinger(hand, 13,14,15,16,BONES[`${s}_ring1`], BONES[`${s}_ring2`],  BONES[`${s}_ring3`]);
    driveFinger(hand, 17,18,19,20,BONES[`${s}_pinky1`],BONES[`${s}_pinky2`], BONES[`${s}_pinky3`]);
  }

  /* ── Animation Loop ───────────────────────── */
  useFrame((_, delta) => {
    if (!isPlaying) return;
    if (!keypoints?.length) return;

    elapsed.current += Math.min(delta, 0.1);

    if (elapsed.current >= frameInterval) {
      elapsed.current = 0;

      // STOP at last frame (no loop)
      if (frameIndex.current < keypoints.length - 1) {
        frameIndex.current++;
      }
    }

    const frame = keypoints[frameIndex.current];
    if (!frame) return;

    const pose = frame.pose as number[][] | undefined;
    const left = frame.left_hand as number[][] | undefined;
    const right = frame.right_hand as number[][] | undefined;

    if (pose && pose.length >= 17) {
      rotateBoneToward(BONES.l_upperarm, mpDir(pose[11], pose[13]));
      rotateBoneToward(BONES.l_forearm,  mpDir(pose[13], pose[15]));
      rotateBoneToward(BONES.r_upperarm, mpDir(pose[12], pose[14]));
      rotateBoneToward(BONES.r_forearm,  mpDir(pose[14], pose[16]));
    }

    if (left) driveHand(left, "l");
    if (right) driveHand(right, "r");
  });

  return (
    <group rotation={[0, Math.PI, 0]} position={[0, -1, 0]}>
      <primitive object={scene} scale={1} />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   CANVAS + PLAY/PAUSE UI
───────────────────────────────────────────────────────────── */
export default function AvatarViewer({ keypoints, fps = 25 }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      <div style={{ position: "absolute", zIndex: 10 }}>
        <button onClick={() => setIsPlaying(true)}>▶ Play</button>
        <button onClick={() => setIsPlaying(false)}>⏸ Pause</button>
      </div>

      <Canvas camera={{ position: [0, 1, -3], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 3]} intensity={1.4} />
        <AnimatedAvatar
          keypoints={keypoints}
          fps={fps}
          isPlaying={isPlaying}
        />
      </Canvas>
    </>
  );
  console.log("Keypoints length:", keypoints?.length);
console.log("First frame:", keypoints?.[0]);
}