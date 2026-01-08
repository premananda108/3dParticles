import { useRef, useState, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDragContext } from './AtomScene'

export default function DraggableParticle({
    position,
    onPositionChange,
    children,
    id
}) {
    const groupRef = useRef()
    const [isHovered, setIsHovered] = useState(false)
    const [localDragging, setLocalDragging] = useState(false)
    const { camera, gl } = useThree()
    const { setIsDragging } = useDragContext()

    // Drag state refs
    const dragPlane = useRef(new THREE.Plane())
    const intersection = useRef(new THREE.Vector3())
    const offset = useRef(new THREE.Vector3())
    const raycaster = useRef(new THREE.Raycaster())
    const mousePos = useRef(new THREE.Vector2())

    const handlePointerDown = useCallback((e) => {
        e.stopPropagation()

        if (!groupRef.current) return

        setLocalDragging(true)
        setIsDragging(true)
        gl.domElement.style.cursor = 'grabbing'

        // Set up drag plane facing camera, passing through object
        const cameraDirection = new THREE.Vector3()
        camera.getWorldDirection(cameraDirection)
        dragPlane.current.setFromNormalAndCoplanarPoint(
            cameraDirection.negate(),
            groupRef.current.position
        )

        // Get mouse position in normalized device coordinates
        const rect = gl.domElement.getBoundingClientRect()
        mousePos.current.set(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        )

        // Calculate offset from intersection to object center
        raycaster.current.setFromCamera(mousePos.current, camera)
        if (raycaster.current.ray.intersectPlane(dragPlane.current, intersection.current)) {
            offset.current.copy(groupRef.current.position).sub(intersection.current)
        }

        // Add global mouse listeners
        const handleMouseMove = (moveEvent) => {
            if (!groupRef.current) return

            const newRect = gl.domElement.getBoundingClientRect()
            mousePos.current.set(
                ((moveEvent.clientX - newRect.left) / newRect.width) * 2 - 1,
                -((moveEvent.clientY - newRect.top) / newRect.height) * 2 + 1
            )

            raycaster.current.setFromCamera(mousePos.current, camera)
            if (raycaster.current.ray.intersectPlane(dragPlane.current, intersection.current)) {
                const newPosition = intersection.current.clone().add(offset.current)
                groupRef.current.position.copy(newPosition)

                if (onPositionChange) {
                    onPositionChange(id, [newPosition.x, newPosition.y, newPosition.z])
                }
            }
        }

        const handleMouseUp = () => {
            setLocalDragging(false)
            setIsDragging(false)
            gl.domElement.style.cursor = isHovered ? 'grab' : 'auto'

            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }, [camera, gl, id, onPositionChange, setIsDragging, isHovered])

    const handlePointerOver = useCallback((e) => {
        e.stopPropagation()
        setIsHovered(true)
        if (!localDragging) {
            gl.domElement.style.cursor = 'grab'
        }
    }, [gl, localDragging])

    const handlePointerOut = useCallback((e) => {
        e.stopPropagation()
        setIsHovered(false)
        if (!localDragging) {
            gl.domElement.style.cursor = 'auto'
        }
    }, [gl, localDragging])

    return (
        <group
            ref={groupRef}
            position={position}
            onPointerDown={handlePointerDown}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            {/* Scale up slightly when hovering or dragging for feedback */}
            <group scale={localDragging ? 1.2 : isHovered ? 1.1 : 1}>
                {children}
            </group>
        </group>
    )
}
