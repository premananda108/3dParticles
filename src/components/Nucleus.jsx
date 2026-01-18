import Proton from './Proton'
import Neutron from './Neutron'
import Electron from './Electron'
import DraggableParticle from './DraggableParticle'

export default function Nucleus({
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
    onProtonScaleChange,
    onNeutronScaleChange,
    onElectronScaleChange,
    onDragStart,
    onDragEnd
}) {
    return (
        <group>
            {protons.map((particle) => (
                <DraggableParticle
                    key={particle.id}
                    id={particle.id}
                    name={particle.id}
                    position={particle.position}
                    rotation={particle.rotation}
                    scale={particle.scale}
                    onPositionChange={onProtonPositionChange}
                    onRotationChange={onProtonRotationChange}
                    onScaleChange={onProtonScaleChange}
                    isSelected={selectedIds?.has(particle.id)}
                    onSelect={onSelectParticle}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                >
                    <Proton />
                </DraggableParticle>
            ))}
            {neutrons.map((particle) => (
                <DraggableParticle
                    key={particle.id}
                    id={particle.id}
                    name={particle.id}
                    position={particle.position}
                    rotation={particle.rotation}
                    scale={particle.scale}
                    onPositionChange={onNeutronPositionChange}
                    onRotationChange={onNeutronRotationChange}
                    onScaleChange={onNeutronScaleChange}
                    isSelected={selectedIds?.has(particle.id)}
                    onSelect={onSelectParticle}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                >
                    <Neutron />
                </DraggableParticle>
            ))}
            {electrons?.map((particle) => (
                <DraggableParticle
                    key={particle.id}
                    id={particle.id}
                    name={particle.id}
                    position={particle.position}
                    rotation={particle.rotation}
                    scale={particle.scale}
                    onPositionChange={onElectronPositionChange}
                    onRotationChange={onElectronRotationChange}
                    onScaleChange={onElectronScaleChange}
                    isSelected={selectedIds?.has(particle.id)}
                    onSelect={onSelectParticle}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                >
                    <Electron />
                </DraggableParticle>
            ))}
        </group>
    )
}
