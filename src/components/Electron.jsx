import { useRef } from 'react'
import * as THREE from 'three'

export default function Electron() {
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
                color="#aaddff" // Lighter blue
                emissive="#4488bb"
                emissiveIntensity={0.2} // Lower emission to see inside better
                transparent={true}
                opacity={0.3} // More transparent to see enveloped protons
                roughness={0.1}
                metalness={0.1}
                transmission={0.1}
                clearcoat={0.5}
                side={THREE.DoubleSide}
                depthWrite={false} // Helps with transparency rendering inside-out
            />
        </mesh>
    )
}
