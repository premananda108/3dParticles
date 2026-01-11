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
                    onPositionChange={onProtonPositionChange}
                    onRotationChange={onProtonRotationChange}
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
                    onPositionChange={onNeutronPositionChange}
                    onRotationChange={onNeutronRotationChange}
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
                    onPositionChange={onElectronPositionChange}
                    onRotationChange={onElectronRotationChange}
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
