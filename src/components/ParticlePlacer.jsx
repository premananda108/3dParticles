import { useRef, useEffect, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Proton from './Proton'
import Neutron from './Neutron'
import Electron from './Electron'
import { useDragContext } from './AtomScene'

export default function ParticlePlacer({
    type, // 'proton' or 'neutron'
    onPlace,
    onCancel
}) {
    const meshRef = useRef()
    const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
    const raycaster = useRef(new THREE.Raycaster())
    const mousePos = useRef(new THREE.Vector2())
    const { camera, gl } = useThree()
    const { setIsDragging } = useDragContext()
    const [position, setPosition] = useState(new THREE.Vector3(0, 0, 0))

    useEffect(() => {
        setIsDragging(true) // Disable OrbitControls while placing
        gl.domElement.style.cursor = 'none' // Hide standard cursor

        const handleMouseMove = (e) => {
            const rect = gl.domElement.getBoundingClientRect()
            mousePos.current.set(
                ((e.clientX - rect.left) / rect.width) * 2 - 1,
                -((e.clientY - rect.top) / rect.height) * 2 + 1
            )

            raycaster.current.setFromCamera(mousePos.current, camera)

            // Update plane to face camera
            const cameraDirection = new THREE.Vector3()
            camera.getWorldDirection(cameraDirection)
            planeRef.current.normal.copy(cameraDirection.negate())

            const intersection = new THREE.Vector3()
            raycaster.current.ray.intersectPlane(planeRef.current, intersection)

            if (intersection) {
                // Snap to grid
                const step = 0.5
                const snapToGrid = (val) => Math.round(val / step) * step

                intersection.x = snapToGrid(intersection.x)
                intersection.y = snapToGrid(intersection.y)
                intersection.z = snapToGrid(intersection.z)

                setPosition(intersection)
            }
        }

        const handleClick = (e) => {
            // Ignore clicks on UI
            if (e.target !== gl.domElement) return

            if (onPlace && meshRef.current) {
                const pos = meshRef.current.position
                onPlace([pos.x, pos.y, pos.z])
            }
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onCancel()
            }
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('click', handleClick)
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            setIsDragging(false)
            gl.domElement.style.cursor = 'auto'
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('click', handleClick)
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [camera, gl, setIsDragging, onPlace, onCancel])

    const getParticleComponent = () => {
        switch (type) {
            case 'proton': return <Proton />
            case 'neutron': return <Neutron />
            case 'electron': return <Electron />
            default: return null
        }
    }

    return (
        <group ref={meshRef} position={position}>
            <group scale={1.2} style={{ opacity: 0.7 }}>
                {getParticleComponent()}
            </group>
        </group>
    )
}
