import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Props {
  keypoints: any[];
}

function AnimatedAvatar({ keypoints }: Props) {
  const { scene } = useGLTF("/avatar.glb");

  const bones = useRef<{
    upperL?: THREE.Bone;
    foreL?: THREE.Bone;
    upperR?: THREE.Bone;
    foreR?: THREE.Bone;
  }>({});

  const frameIndex = useRef(0);

  // ✅ CORRECT BONE MAPPING
  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Bone).isBone) {

        // LEFT ARM
        if (obj.name === "Base_HumanLUpperarm_017")
          bones.current.upperL = obj as THREE.Bone;

        if (obj.name === "Base_HumanLForearm_018")
          bones.current.foreL = obj as THREE.Bone;

        // RIGHT ARM
        if (obj.name === "Base_HumanRUpperarm_036")
          bones.current.upperR = obj as THREE.Bone;

        if (obj.name === "Base_HumanRForearm_037")
          bones.current.foreR = obj as THREE.Bone;
      }
    });

    console.log("Mapped bones:", bones.current);
  }, [scene]);

  // Reset animation when new keypoints arrive
  useEffect(() => {
    frameIndex.current = 0;
  }, [keypoints]);

  function applyRotation(bone: THREE.Bone | undefined, vec: number[]) {
    if (!bone || !vec) return;

    const direction = new THREE.Vector3(
      vec[0],
      vec[1],
      vec[2]  // if arms move wrong, change to -vec[2]
    ).normalize();

    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction
    );

    bone.quaternion.slerp(quaternion, 0.5);
  }

  useFrame(() => {
    if (!keypoints || keypoints.length === 0) return;

    const frame = keypoints[frameIndex.current];

    if (!frame) return;

    applyRotation(bones.current.upperL, frame.upper_arm_L);
    applyRotation(bones.current.foreL, frame.forearm_L);
    applyRotation(bones.current.upperR, frame.upper_arm_R);
    applyRotation(bones.current.foreR, frame.forearm_R);

    frameIndex.current =
      (frameIndex.current + 1) % keypoints.length;
  });

  return (
    <primitive
      object={scene}
      scale={1}
      position={[0, -1.2, 0]}
    />
  );
}

export default function AvatarViewer({ keypoints }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 2, 4] }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 2, 2]} />
      <AnimatedAvatar keypoints={keypoints} />
    </Canvas>
  );
}