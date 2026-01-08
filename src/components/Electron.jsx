import { useRef } from 'react'
import * as THREE from 'three'

export default function Electron() {
    const meshRef = useRef()

    return (
        <mesh ref={meshRef}>
            {/* 
        Proton: args={[0.35, 0.15, 24, 48]} 
        Electron req: 5x larger overall, but smaller inner diameter (tube thickness smaller?)
        Let's interpret "inner diameter smaller" = thinner tube relative to size, or absolute.
        Let's try: Radius = 0.35 * 5 = 1.75. Tube = 0.1 (thinner than proton's 0.15)
      */}
            <torusGeometry args={[1.75, 0.1, 32, 64]} />
            <meshPhysicalMaterial
                color="#88ccff"
                emissive="#44aadd"
                emissiveIntensity={0.5}
                transparent={true}
                opacity={0.4}
                roughness={0}
                metalness={0.1}
                transmission={0.2}
                clearcoat={1}
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}
