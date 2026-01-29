import { useMemo } from 'react'
import * as THREE from 'three'

export default function CurvedArrow({ color = "#00ccff" }) {
    const { tubeGeometry, coneGeometry } = useMemo(() => {
        // Create a straight arrow
        const curve = new THREE.LineCurve3(
            new THREE.Vector3(-0.4, 0, 0),
            new THREE.Vector3(0.4, 0, 0)
        )

        const tube = new THREE.TubeGeometry(curve, 1, 0.03, 8, false)
        const cone = new THREE.ConeGeometry(0.08, 0.2, 16)

        // Align cone with the end of the line
        cone.rotateZ(-Math.PI / 2) // Point along +X axis
        cone.translate(0.4 + 0.1, 0, 0)

        return { tubeGeometry: tube, coneGeometry: cone }
    }, [])

    return (
        <group>
            <mesh geometry={tubeGeometry}>
                <meshStandardMaterial
                    color={color}
                    roughness={0.3}
                    metalness={0.2}
                />
            </mesh>
            <mesh geometry={coneGeometry}>
                <meshStandardMaterial
                    color={color}
                    roughness={0.3}
                    metalness={0.2}
                />
            </mesh>
        </group>
    )
}
