import { useEffect, useRef } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
export default function AvatarCanvas() {

  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {

    if (!mountRef.current) return

    const width = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#ffffff")

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 1.5, 3)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    mountRef.current.appendChild(renderer.domElement)

    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2)
    scene.add(light)

    const loader = new GLTFLoader()
    loader.load("/models/avatar1.glb", (gltf) => {
      const avatar = gltf.scene
      scene.add(avatar)
    })

    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      mountRef.current?.removeChild(renderer.domElement)
    }

  }, [])

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100%" }}
    />
  )
}