import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Neutron({ position = [0, 0, 0] }) {
    const meshRef = useRef()

    useFrame((state) => {
        if (meshRef.current) {
            // Subtle pulsing animation with offset
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + Math.PI) * 0.02
            meshRef.current.scale.setScalar(scale)
        }
    })

    return (
        <mesh ref={meshRef} position={position}>
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

