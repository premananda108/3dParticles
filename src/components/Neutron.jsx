import { useRef } from 'react'

export default function Neutron({ color = "#bbbbbb" }) {
    const meshRef = useRef()

    return (
        <mesh ref={meshRef}>
            <torusGeometry args={[0.35, 0.15, 24, 48]} />
            <meshStandardMaterial
                color={color}
                emissive="#444444"
                emissiveIntensity={0.2}
                roughness={0.4}
                metalness={0.4}
            />
        </mesh>
    )
}
