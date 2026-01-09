import { useState, useRef, createContext, useContext } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Environment } from '@react-three/drei'
import Nucleus from './Nucleus'
import ParticlePlacer from './ParticlePlacer'

// Context to control OrbitControls from child components
export const DragContext = createContext({
    isDragging: false,
    setIsDragging: () => { }
})

export function useDragContext() {
    return useContext(DragContext)
}

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
    draggedParticleType,
    onPlaceParticle,
    onCancelPlacement,
    onDragStart,
    onDragEnd
}) {
    const [isDragging, setIsDragging] = useState(false)

    return (
        <div className="scene-container">
            <DragContext.Provider value={{ isDragging, setIsDragging }}>
                <Canvas
                    camera={{ position: [0, 0, 10], fov: 50 }}
                    gl={{ antialias: true }}
                    onPointerMissed={(e) => {
                        // Only deselect if we clicked on the background (type 'click')
                        if (e.type === 'click') {
                            onDeselectAll && onDeselectAll()
                        }
                    }}
                >
                    <SceneContent
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
                        isDragging={isDragging}
                        draggedParticleType={draggedParticleType}
                        onPlaceParticle={onPlaceParticle}
                        onCancelPlacement={onCancelPlacement}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
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
    onSelectParticle,
    onProtonPositionChange,
    onNeutronPositionChange,
    onElectronPositionChange,
    onProtonRotationChange,
    onNeutronRotationChange,
    onElectronRotationChange,
    isDragging,
    draggedParticleType,
    onPlaceParticle,
    onCancelPlacement,
    onDragStart,
    onDragEnd
}) {
    const controlsRef = useRef()

    return (
        <>
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

            {/* Ghost particle for placement */}
            {draggedParticleType && (
                <ParticlePlacer
                    type={draggedParticleType}
                    onPlace={onPlaceParticle}
                    onCancel={onCancelPlacement}
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
            />
        </>
    )
}
