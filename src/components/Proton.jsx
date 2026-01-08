import { useRef } from 'react'

export default function Proton() {
  const meshRef = useRef()

  return (
    <mesh ref={meshRef}>
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
