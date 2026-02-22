import { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Environment, TransformControls } from '@react-three/drei'
import Nucleus from './Nucleus'
import { DragContext } from '../contexts/DragContext'
import DraggableParticle from './DraggableParticle'
import CurvedArrow from './CurvedArrow'

export default function AtomScene({
    protons,
    neutrons,
    electrons,
    arrows,
    selectedIds,
    moveStep,
    rotateStep,
    onSelectParticle,
    onDeselectAll,
    onPositionChange,
    onRotationChange,
    onScaleChange,
    onDragStart,
    onDragEnd
}) {
    const [isDragging, setIsDragging] = useState(false)
    const [activeParticle, setActiveParticle] = useState(null)
    const [transformMode, setTransformMode] = useState('translate')

    // Sync activeParticle with selectedIds
    const [prevSelectedIds, setPrevSelectedIds] = useState(selectedIds)
    if (selectedIds !== prevSelectedIds) {
        setPrevSelectedIds(selectedIds)
        if (!selectedIds || selectedIds.size === 0) {
            if (activeParticle !== null) setActiveParticle(null)
        } else if (selectedIds.size === 1) {
            const firstId = Array.from(selectedIds)[0]
            if (activeParticle !== firstId) {
                setActiveParticle(firstId)
            }
        } else {
            // If we have a multi-selection and the current active particle
            // is no longer part of that selection, we pick another one as active.
            if (activeParticle && !selectedIds.has(activeParticle)) {
                setActiveParticle(Array.from(selectedIds)[0])
            }
        }
    }

    const handleSelect = (particleId, isMultiSelect) => {
        if (activeParticle === particleId && !isMultiSelect) {
            setTransformMode(prev => {
                if (prev === 'translate') return 'rotate'
                if (prev === 'rotate') return 'scale'
                return 'translate'
            })
        } else {
            setActiveParticle(particleId)
            setTransformMode('translate')
        }
        onSelectParticle(particleId, isMultiSelect)
    }

    const handleDeselectAll = () => {
        setActiveParticle(null)
        onDeselectAll()
    }

    return (
        <div className="scene-container">
            <Canvas
                camera={{ position: [0, 0, 10], fov: 50 }}
                gl={{ antialias: true }}
                onPointerMissed={(e) => {
                    if (e.type === 'click') {
                        handleDeselectAll()
                    }
                }}
            >
                <SceneContent
                    protons={protons}
                    neutrons={neutrons}
                    electrons={electrons}
                    arrows={arrows}
                    selectedIds={selectedIds}
                    activeParticle={activeParticle}
                    transformMode={transformMode}
                    moveStep={moveStep}
                    rotateStep={rotateStep}
                    onSelectParticle={handleSelect}
                    onPositionChange={onPositionChange}
                    onRotationChange={onRotationChange}
                    onScaleChange={onScaleChange}
                    isDragging={isDragging}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    setIsDragging={setIsDragging}
                />
            </Canvas>
        </div>
    )
}

function SceneContent({
    protons,
    neutrons,
    electrons,
    arrows,
    selectedIds,
    activeParticle,
    transformMode,
    moveStep,
    rotateStep,
    onSelectParticle,
    onPositionChange,
    onRotationChange,
    onScaleChange,
    isDragging,
    onDragStart,
    onDragEnd,
    setIsDragging
}) {
    const controlsRef = useRef()
    const sceneRef = useRef()
    const transformRef = useRef()
    const gizmoHoveredRef = useRef(false)
    const activeParticleRef = useRef(activeParticle)
    const [selectedObject, setSelectedObject] = useState(null)

    // Refs for latest callbacks to avoid stale closures in event listeners
    const onDragStartRef = useRef(onDragStart)
    const onDragEndRef = useRef(onDragEnd)
    const onPositionChangeRef = useRef(onPositionChange)
    const onRotationChangeRef = useRef(onRotationChange)
    const onScaleChangeRef = useRef(onScaleChange)

    useEffect(() => {
        onDragStartRef.current = onDragStart
        onDragEndRef.current = onDragEnd
        onPositionChangeRef.current = onPositionChange
        onRotationChangeRef.current = onRotationChange
        onScaleChangeRef.current = onScaleChange
    }, [onDragStart, onDragEnd, onPositionChange, onRotationChange, onScaleChange])

    useEffect(() => {
        activeParticleRef.current = activeParticle
        if (activeParticle && sceneRef.current) {
            const object = sceneRef.current.getObjectByName(activeParticle)
            setSelectedObject(object)
        } else {
            setSelectedObject(null)
        }
    }, [activeParticle])

    useFrame(() => {
        if (transformRef.current) {
            gizmoHoveredRef.current = !!transformRef.current.axis
        } else {
            gizmoHoveredRef.current = false
        }
    })

    const handleTransform = (e) => {
        if (!e.target.object) return

        const { position, rotation, scale } = e.target.object
        const id = e.target.object.userData.id

        if (transformMode === 'translate') {
            onPositionChangeRef.current(id, [position.x, position.y, position.z])
        } else if (transformMode === 'rotate') {
            onRotationChangeRef.current(id, [rotation.x, rotation.y, rotation.z])
        } else if (transformMode === 'scale') {
            onScaleChangeRef.current(id, [scale.x, scale.y, scale.z])
        }
    }

    // Convert degrees to radians for rotation snap
    const rotationSnap = rotateStep ? (rotateStep * Math.PI) / 180 : null

    return (
        <group ref={sceneRef}>
            {/* Background stars */}
            <Stars
                radius={100}
                depth={50}
                count={3000}
                factor={4}
                saturation={0}
                fade
                speed={0.5}
            />

            {/* Lighting */}
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4488ff" />
            <pointLight position={[0, 10, -10]} intensity={0.5} color="#ff4444" />

            {/* Environment for reflections */}
            <Environment preset="night" />

            <DragContext.Provider value={{ isDragging, setIsDragging, gizmoHoveredRef }}>
                {/* The nucleus */}
                <Nucleus
                    protons={protons}
                    neutrons={neutrons}
                    electrons={electrons}
                    selectedIds={selectedIds}
                    onSelectParticle={onSelectParticle}
                />

                {/* Arrows */}
                {arrows?.map((arrow) => (
                    <DraggableParticle
                        key={arrow.id}
                        id={arrow.id}
                        name={arrow.id}
                        position={arrow.position}
                        rotation={arrow.rotation}
                        scale={arrow.scale}
                        isSelected={selectedIds?.has(arrow.id)}
                        onSelect={onSelectParticle}
                    >
                        <CurvedArrow color={arrow.color} emissive={arrow.emissive} />
                    </DraggableParticle>
                ))}

                {selectedObject && (
                    <TransformControls
                        ref={transformRef}
                        object={selectedObject}
                        mode={transformMode}
                        translationSnap={moveStep > 0 ? moveStep : null}
                        rotationSnap={rotationSnap}
                        onObjectChange={handleTransform}
                        onDraggingChanged={(e) => {
                            setIsDragging(e.value)
                            if (e.value) {
                                onDragStartRef.current(activeParticleRef.current)
                            } else {
                                onDragEndRef.current()
                            }
                        }}
                    />
                )}
            </DragContext.Provider>

            {/* Camera controls - disabled when dragging particles */}
            <OrbitControls
                ref={controlsRef}
                enabled={!isDragging}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                autoRotate={false}
                minDistance={3}
                maxDistance={30}
                mouseButtons={{ LEFT: null, MIDDLE: 2, RIGHT: 0 }}
            />
        </group>
    )
}
