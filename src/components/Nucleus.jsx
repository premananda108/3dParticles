import Proton from './Proton'
import Neutron from './Neutron'
import DraggableParticle from './DraggableParticle'

export default function Nucleus({
    protons,
    neutrons,
    onProtonPositionChange,
    onNeutronPositionChange,
    onProtonRotationChange,
    onNeutronRotationChange
}) {
    return (
        <group>
            {protons.map((particle) => (
                <DraggableParticle
                    key={particle.id}
                    id={particle.id}
                    position={particle.position}
                    rotation={particle.rotation}
                    onPositionChange={onProtonPositionChange}
                    onRotationChange={onProtonRotationChange}
                >
                    <Proton />
                </DraggableParticle>
            ))}
            {neutrons.map((particle) => (
                <DraggableParticle
                    key={particle.id}
                    id={particle.id}
                    position={particle.position}
                    rotation={particle.rotation}
                    onPositionChange={onNeutronPositionChange}
                    onRotationChange={onNeutronRotationChange}
                >
                    <Neutron />
                </DraggableParticle>
            ))}
        </group>
    )
}
