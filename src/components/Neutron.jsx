import { useRef } from 'react'

export default function Neutron() {
    const meshRef = useRef()

    return (
        <mesh ref={meshRef}>
            <torusGeometry args={[0.35, 0.15, 24, 48]} />
            <meshStandardMaterial
                color="#4488ff"
                emissive="#2266dd"
                emissiveIntensity={0.3}
                roughness={0.2}
                metalness={0.8}
            />
        </mesh>
    )
}
