import { useRef } from 'react'
import * as THREE from 'three'

export default function Electron({ color = "#0088ff", emissive = "#0044aa" }) {
    const meshRef = useRef()

    return (
        <mesh ref={meshRef}>
            {/* 
                Proton: args={[0.35, 0.15, ...]} -> Inner Radius = 0.2
                Electron Req: 
                1. "Envelop proton" -> Thick tube
                2. "Inner diameter < proton's" -> Inner Radius < 0.2
                
                New Args: [0.8, 0.75, 32, 64]
                - Main Radius: 0.8
                - Tube Radius: 0.75
                - Inner Radius = 0.8 - 0.75 = 0.05 (Very small hole)
                - Outer Radius = 0.8 + 0.75 = 1.55 (Large cloud)
            */}
            <torusGeometry args={[0.8, 0.75, 32, 64]} />
            <meshPhysicalMaterial
                color={color} // Customizeable color
                emissive={emissive} // Deep blue emission
                emissiveIntensity={0.5} // Higher emission for glowing effect
                transparent={true}
                opacity={0.35}
                roughness={0.2}
                metalness={0.1}
                clearcoat={0.3}
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    )
}
