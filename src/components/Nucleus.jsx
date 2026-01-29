import Proton from './Proton'
import Neutron from './Neutron'
import Electron from './Electron'
import DraggableParticle from './DraggableParticle'

export default function Nucleus({
    protons,
    neutrons,
    electrons,
    selectedIds,
    onSelectParticle
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
                    isSelected={selectedIds?.has(particle.id)}
                    onSelect={onSelectParticle}
                >
                    <Proton color={particle.color} />
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
                    isSelected={selectedIds?.has(particle.id)}
                    onSelect={onSelectParticle}
                >
                    <Neutron color={particle.color} />
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
                    isSelected={selectedIds?.has(particle.id)}
                    onSelect={onSelectParticle}
                >
                    <Electron color={particle.color} />
                </DraggableParticle>
            ))}
        </group>
    )
}

