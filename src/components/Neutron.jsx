import { useRef } from 'react'

export default function Neutron({ color = "#bbbbbb", emissive = "#444444" }) {
    const meshRef = useRef()

    return (
        <mesh ref={meshRef}>
            <torusGeometry args={[0.35, 0.15, 24, 48]} />
            <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={0.2}
                roughness={0.4}
                metalness={0.4}
            />
        </mesh>
    )
}
