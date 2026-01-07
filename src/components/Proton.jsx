import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Proton({ position = [0, 0, 0] }) {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle pulsing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[0.35, 0.15, 24, 48]} />
      <meshStandardMaterial
        color="#ff3333"
        emissive="#ff0000"
        emissiveIntensity={0.3}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  )
}

