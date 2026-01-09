import { useRef, useState, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import * as THREE from 'three'
import { useDragContext } from './AtomScene'

export default function DraggableParticle({
    position,
    onPositionChange,
    onRotationChange,
    children,
    id,
    rotation = [0, 0, 0],
    positionStep = 0.5,
    rotationStep = Math.PI / 12, // 15 degrees
    isSelected = false,
    onSelect,
    onDragStart,
    onDragEnd
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

    // Snap helper
    const snapToGrid = (val, step) => Math.round(val / step) * step

    // Left-click: Select or Move
    const handlePointerDown = useCallback((e) => {
        // Right-click for rotation (only if available)
        if (e.button === 2) {
            e.stopPropagation()
            e.nativeEvent.preventDefault()

            // Only rotate if selected? Or always? Let's allow rotation always for now as utility
            // But aligned with "Select then Act", maybe verify selection? 
            // For now, keep existing rotation logic but maybe restricted?
            // Let's keep rotation as is for power users, but maybe better if it required selection too.
            // User request was focused on movement. Let's stick to movement constraint.

            setIsRotating(true)
            setIsDragging(true)
            gl.domElement.style.cursor = 'crosshair'

            lastMousePos.current = { x: e.clientX, y: e.clientY }

            const handleMouseMove = (moveEvent) => {
                if (!innerRef.current) return

                const deltaX = moveEvent.clientX - lastMousePos.current.x
                const deltaY = moveEvent.clientY - lastMousePos.current.y

                const rawRotY = currentRotation.current.y + deltaX * 0.02
                const rawRotX = currentRotation.current.x + deltaY * 0.02

                currentRotation.current.y = snapToGrid(rawRotY, rotationStep)
                currentRotation.current.x = snapToGrid(rawRotX, rotationStep)

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
                gl.domElement.style.cursor = isHovered ? (isSelected ? 'grab' : 'pointer') : 'auto'

                window.removeEventListener('mousemove', handleMouseMove)
                window.removeEventListener('mouseup', handleMouseUp)
            }

            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
            return
        }

        // Left-click
        if (e.button !== 0) return
        e.stopPropagation()
        if (!groupRef.current) return

        // 1. Handle Selection Logic
        const isMulti = e.metaKey || e.ctrlKey
        // If not selected, just select. don't drag immediately unless we want "click-select, drag-move" in one go?
        // User asked: "first highlight, then move". This implies 2 steps.
        // But standard GUI usually allows "Click+Drag on unselected = Select + Move".
        // Let's try: If not selected, Select. If already selected, Move.

        let proceedToDrag = isSelected

        if (!isSelected) {
            onSelect && onSelect(id, isMulti)
            // If we just gathered selection, we usually wait for next click to drag in "strict" modes,
            // but for fluidity, we can default to: "If I click unselected, it becomes selected".
            // Does it drag immediately? The prompt says "then it can be moved". 
            // Strictly speaking "Click to select, then move" suggests Click (Up) -> Select. Next Down -> Move.
            // Let's implement Strict Mode first as requested.
            proceedToDrag = false
        } else {
            // If already selected, maybe we are deselecting with Ctrl?
            if (isMulti) {
                onSelect && onSelect(id, true) // Toggle off
                proceedToDrag = false
            }
        }

        if (!proceedToDrag) return

        // 2. Handle Drag Logic (Only if proceeding)
        setLocalDragging(true)
        setIsDragging(true)
        gl.domElement.style.cursor = 'grabbing'

        if (onDragStart) {
            onDragStart(id)
        }

        const cameraDirection = new THREE.Vector3()
        camera.getWorldDirection(cameraDirection)
        dragPlane.current.setFromNormalAndCoplanarPoint(
            cameraDirection.negate(),
            groupRef.current.position
        )

        const rect = gl.domElement.getBoundingClientRect()
        mousePos.current.set(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        )

        raycaster.current.setFromCamera(mousePos.current, camera)
        if (raycaster.current.ray.intersectPlane(dragPlane.current, intersection.current)) {
            offset.current.copy(groupRef.current.position).sub(intersection.current)
        }

        const handleMouseMove = (moveEvent) => {
            if (!groupRef.current) return

            const newRect = gl.domElement.getBoundingClientRect()
            mousePos.current.set(
                ((moveEvent.clientX - newRect.left) / newRect.width) * 2 - 1,
                -((moveEvent.clientY - newRect.top) / newRect.height) * 2 + 1
            )

            raycaster.current.setFromCamera(mousePos.current, camera)
            if (raycaster.current.ray.intersectPlane(dragPlane.current, intersection.current)) {
                const rawPosition = intersection.current.clone().add(offset.current)

                const newPosition = new THREE.Vector3(
                    snapToGrid(rawPosition.x, positionStep),
                    snapToGrid(rawPosition.y, positionStep),
                    snapToGrid(rawPosition.z, positionStep)
                )

                groupRef.current.position.copy(newPosition)

                if (onPositionChange) {
                    onPositionChange(id, [newPosition.x, newPosition.y, newPosition.z])
                }
            }
        }

        const handleMouseUp = () => {
            setLocalDragging(false)
            setIsDragging(false)
            gl.domElement.style.cursor = isHovered ? (isSelected ? 'grab' : 'pointer') : 'auto'

            if (onDragEnd) {
                onDragEnd(id)
            }

            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)

    }, [camera, gl, id, onPositionChange, onRotationChange, setIsDragging, isHovered, positionStep, rotationStep, isSelected, onSelect, onDragStart, onDragEnd])

    const handlePointerOver = useCallback((e) => {
        e.stopPropagation()
        setIsHovered(true)
        if (!localDragging && !isRotating) {
            gl.domElement.style.cursor = isSelected ? 'grab' : 'pointer'
        }
    }, [gl, localDragging, isRotating, isSelected])

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
            <group
                ref={innerRef}
                scale={isSelected ? 1.15 : (isHovered ? 1.05 : 1)}
                rotation={rotation}
            >
                {children}
                {isSelected && (
                    <Outlines thickness={0.05} color="white" />
                )}
            </group>
        </group>
    )
}
