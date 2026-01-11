import { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Environment, TransformControls } from '@react-three/drei'
import Nucleus from './Nucleus'
import { DragContext } from '../contexts/DragContext'

export default function AtomScene({
    protons,
    neutrons,
    electrons,
    selectedIds,
    onSelectParticle,
    onDeselectAll,
    onProtonPositionChange,
    onNeutronPositionChange,
    onElectronPositionChange,
    onProtonRotationChange,
    onNeutronRotationChange,
    onElectronRotationChange,
    onDragStart,
    onDragEnd
}) {
    const [isDragging, setIsDragging] = useState(false)
    const [activeParticle, setActiveParticle] = useState(null)
    const [transformMode, setTransformMode] = useState('translate')

    const handleSelect = (particleId, isMultiSelect) => {
        if (activeParticle === particleId && !isMultiSelect) {
            setTransformMode(prev => prev === 'translate' ? 'rotate' : 'translate')
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

    // Auto-activate gizmo when exactly one particle is selected (e.g., when added)
    useEffect(() => {
        if (selectedIds && selectedIds.size === 1) {
            const firstId = Array.from(selectedIds)[0]
            if (activeParticle !== firstId) {
                setActiveParticle(firstId)
            }
        }
    }, [selectedIds, activeParticle])

    return (
        <div className="scene-container">
            <DragContext.Provider value={{ isDragging, setIsDragging }}>
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
                        selectedIds={selectedIds}
                        activeParticle={activeParticle}
                        transformMode={transformMode}
                        onSelectParticle={handleSelect}
                        onProtonPositionChange={onProtonPositionChange}
                        onNeutronPositionChange={onNeutronPositionChange}
                        onElectronPositionChange={onElectronPositionChange}
                        onProtonRotationChange={onProtonRotationChange}
                        onNeutronRotationChange={onNeutronRotationChange}
                        onElectronRotationChange={onElectronRotationChange}
                        isDragging={isDragging}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        setIsDragging={setIsDragging}
                    />
                </Canvas>
            </DragContext.Provider>
        </div>
    )
}

function SceneContent({
    protons,
    neutrons,
    electrons,
    selectedIds,
    activeParticle,
    transformMode,
    onSelectParticle,
    onProtonPositionChange,
    onNeutronPositionChange,
    onElectronPositionChange,
    onProtonRotationChange,
    onNeutronRotationChange,
    onElectronRotationChange,
    isDragging,
    onDragStart,
    onDragEnd,
    setIsDragging
}) {
    const controlsRef = useRef()
    const sceneRef = useRef()
    const [selectedObject, setSelectedObject] = useState(null)

    useEffect(() => {
        if (activeParticle && sceneRef.current) {
            const object = sceneRef.current.getObjectByName(activeParticle)
            setSelectedObject(object)
        } else {
            setSelectedObject(null)
        }
    }, [activeParticle])

    const handleTransform = (e) => {
        if (!e.target.object) return

        const { position, rotation } = e.target.object
        const id = e.target.object.userData.id

        const findAndCallUpdater = (particles, posUpdater, rotUpdater) => {
            const p = particles.find(p => p.id === id)
            if (p) {
                if (transformMode === 'translate') {
                    posUpdater(id, [position.x, position.y, position.z])
                } else {
                    rotUpdater(id, [rotation.x, rotation.y, rotation.z])
                }
            }
        }

        findAndCallUpdater(protons, onProtonPositionChange, onProtonRotationChange)
        findAndCallUpdater(neutrons, onNeutronPositionChange, onNeutronRotationChange)
        findAndCallUpdater(electrons, onElectronPositionChange, onElectronRotationChange)
    }

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

            {/* The nucleus */}
            <Nucleus
                protons={protons}
                neutrons={neutrons}
                electrons={electrons}
                selectedIds={selectedIds}
                onSelectParticle={onSelectParticle}
                onProtonPositionChange={onProtonPositionChange}
                onNeutronPositionChange={onNeutronPositionChange}
                onElectronPositionChange={onElectronPositionChange}
                onProtonRotationChange={onProtonRotationChange}
                onNeutronRotationChange={onNeutronRotationChange}
                onElectronRotationChange={onElectronRotationChange}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
            />

            {selectedObject && (
                <TransformControls
                    object={selectedObject}
                    mode={transformMode}
                    onObjectChange={handleTransform}
                    onDraggingChanged={(e) => setIsDragging(e.value)}
                />
            )}

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
