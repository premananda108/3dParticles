import { useRef, useState, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useDragContext } from './AtomScene'

export default function DraggableParticle({
    position,
    onPositionChange,
    onRotationChange,
    children,
    id,
    rotation = [0, 0, 0]
}) {
    const groupRef = useRef()
    const innerRef = useRef()
    const [isHovered, setIsHovered] = useState(false)
    const [localDragging, setLocalDragging] = useState(false)
    const [isRotating, setIsRotating] = useState(false)
    const { camera, gl } = useThree()
    const { setIsDragging } = useDragContext()

    // Drag state refs
    const dragPlane = useRef(new THREE.Plane())
    const intersection = useRef(new THREE.Vector3())
    const offset = useRef(new THREE.Vector3())
    const raycaster = useRef(new THREE.Raycaster())
    const mousePos = useRef(new THREE.Vector2())
    const lastMousePos = useRef({ x: 0, y: 0 })
    const currentRotation = useRef(new THREE.Euler(...rotation))

    // Left-click: Move particle
    const handlePointerDown = useCallback((e) => {
        // Right-click for rotation
        if (e.button === 2) {
            e.stopPropagation()
            e.nativeEvent.preventDefault()

            setIsRotating(true)
            setIsDragging(true)
            gl.domElement.style.cursor = 'crosshair'

            lastMousePos.current = { x: e.clientX, y: e.clientY }

            const handleMouseMove = (moveEvent) => {
                if (!innerRef.current) return

                const deltaX = moveEvent.clientX - lastMousePos.current.x
                const deltaY = moveEvent.clientY - lastMousePos.current.y

                // Rotate based on mouse movement
                currentRotation.current.y += deltaX * 0.02
                currentRotation.current.x += deltaY * 0.02

                innerRef.current.rotation.copy(currentRotation.current)

                if (onRotationChange) {
                    onRotationChange(id, [
                        currentRotation.current.x,
                        currentRotation.current.y,
                        currentRotation.current.z
                    ])
                }

                lastMousePos.current = { x: moveEvent.clientX, y: moveEvent.clientY }
            }

            const handleMouseUp = () => {
                setIsRotating(false)
                setIsDragging(false)
                gl.domElement.style.cursor = isHovered ? 'grab' : 'auto'

                window.removeEventListener('mousemove', handleMouseMove)
                window.removeEventListener('mouseup', handleMouseUp)
            }

            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
            return
        }

        // Left-click for translation
        if (e.button !== 0) return

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
    }, [camera, gl, id, onPositionChange, onRotationChange, setIsDragging, isHovered])

    const handlePointerOver = useCallback((e) => {
        e.stopPropagation()
        setIsHovered(true)
        if (!localDragging && !isRotating) {
            gl.domElement.style.cursor = 'grab'
        }
    }, [gl, localDragging, isRotating])

    const handlePointerOut = useCallback((e) => {
        e.stopPropagation()
        setIsHovered(false)
        if (!localDragging && !isRotating) {
            gl.domElement.style.cursor = 'auto'
        }
    }, [gl, localDragging, isRotating])

    // Prevent context menu on right-click
    const handleContextMenu = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    return (
        <group
            ref={groupRef}
            position={position}
            onPointerDown={handlePointerDown}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onContextMenu={handleContextMenu}
        >
            {/* Scale up slightly when hovering or dragging for feedback */}
            <group
                ref={innerRef}
                scale={localDragging || isRotating ? 1.2 : isHovered ? 1.1 : 1}
                rotation={rotation}
            >
                {children}
            </group>
        </group>
    )
}
