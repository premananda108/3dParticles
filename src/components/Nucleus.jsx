import Proton from './Proton'
import Neutron from './Neutron'
import DraggableParticle from './DraggableParticle'

export default function Nucleus({
    protons,
    neutrons,
    onProtonPositionChange,
    onNeutronPositionChange
}) {
    return (
        <group>
            {protons.map((particle) => (
                <DraggableParticle
                    key={particle.id}
                    id={particle.id}
                    position={particle.position}
                    onPositionChange={onProtonPositionChange}
                >
                    <Proton />
                </DraggableParticle>
            ))}
            {neutrons.map((particle) => (
                <DraggableParticle
                    key={particle.id}
                    id={particle.id}
                    position={particle.position}
                    onPositionChange={onNeutronPositionChange}
                >
                    <Neutron />
                </DraggableParticle>
            ))}
        </group>
    )
}
