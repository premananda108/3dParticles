import { useRef, useCallback, useContext } from 'react'
import { Outlines } from '@react-three/drei'
import { DragContext } from '../contexts/DragContext'

export default function DraggableParticle({
    position,
    children,
    id,
    name,
    rotation = [0, 0, 0],
    isSelected = false,
    onSelect
}) {
    const groupRef = useRef()
    const innerRef = useRef()

    const { isDragging, gizmoHoveredRef } = useContext(DragContext)

    const handlePointerDown = useCallback((e) => {
        if (e.button !== 0 || isDragging || (gizmoHoveredRef && gizmoHoveredRef.current)) return;
        e.stopPropagation();
        const isMulti = e.metaKey || e.ctrlKey;
        if (onSelect) {
            onSelect(id, isMulti);
        }
    }, [id, onSelect, isDragging]);



    // Prevent context menu on right-click
    const handleContextMenu = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    return (
        <group
            ref={groupRef}
            name={name}
            userData={{ id }}
            position={position}
            onPointerDown={handlePointerDown}

            onContextMenu={handleContextMenu}
        >
            <group
                ref={innerRef}
                scale={isSelected ? 1.15 : 1}
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
