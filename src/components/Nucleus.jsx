import Proton from './Proton'
import Neutron from './Neutron'
import Electron from './Electron'
import DraggableParticle from './DraggableParticle'

export default function Nucleus({
    protons,
    neutrons,
    electrons,
    onProtonPositionChange,
    onNeutronPositionChange,
    onElectronPositionChange,
    onProtonRotationChange,
    onNeutronRotationChange,
    onElectronRotationChange
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
            {electrons?.map((particle) => (
                <DraggableParticle
                    key={particle.id}
                    id={particle.id}
                    position={particle.position}
                    rotation={particle.rotation}
                    onPositionChange={onElectronPositionChange}
                    onRotationChange={onElectronRotationChange}
                >
                    <Electron />
                </DraggableParticle>
            ))}
        </group>
    )
}
