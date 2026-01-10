import { useRef, useState, useCallback } from 'react'
import { Outlines } from '@react-three/drei'

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
    const [isHovered, setIsHovered] = useState(false)

    const handlePointerDown = useCallback((e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        const isMulti = e.metaKey || e.ctrlKey;
        if (onSelect) {
            onSelect(id, isMulti);
        }
    }, [id, onSelect]);

    const handlePointerOver = useCallback((e) => {
        e.stopPropagation()
        setIsHovered(true)
    }, [])

    const handlePointerOut = useCallback((e) => {
        e.stopPropagation()
        setIsHovered(false)
    }, [])

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
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onContextMenu={handleContextMenu}
        >
            <group
                ref={innerRef}
                scale={isSelected ? 1.15 : (isHovered ? 1.05 : 1)}
                rotation={rotation} // Rotation is applied here from the parent state
            >
                {children}
                {isSelected && (
                    <Outlines thickness={0.05} color="white" />
                )}
            </group>
        </group>
    )
}
