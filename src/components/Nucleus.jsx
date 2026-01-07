import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import Proton from './Proton'
import Neutron from './Neutron'

// Generate positions for particles in a cluster formation
function generateClusterPositions(protonCount, neutronCount) {
    const positions = []
    const totalParticles = protonCount + neutronCount

    if (totalParticles === 0) return { protonPositions: [], neutronPositions: [] }

    // Radius scaling based on number of particles
    const baseRadius = 0.6

    // Generate positions using a spherical packing algorithm
    let index = 0
    let layer = 0
    let particlesPlaced = 0

    while (particlesPlaced < totalParticles) {
        if (layer === 0) {
            // Center particle
            positions.push([0, 0, 0])
            particlesPlaced++
        } else {
            // Calculate particles in this layer using icosahedral-like distribution
            const layerRadius = layer * baseRadius
            const particlesInLayer = Math.min(
                Math.floor(4 * Math.PI * layer * layer / 2.5),
                totalParticles - particlesPlaced
            )

            for (let i = 0; i < particlesInLayer && particlesPlaced < totalParticles; i++) {
                // Golden ratio spiral for even distribution
                const phi = Math.acos(1 - 2 * (i + 0.5) / particlesInLayer)
                const theta = Math.PI * (1 + Math.sqrt(5)) * i

                const x = layerRadius * Math.sin(phi) * Math.cos(theta)
                const y = layerRadius * Math.sin(phi) * Math.sin(theta)
                const z = layerRadius * Math.cos(phi)

                // Add some randomness for more natural look
                const jitter = 0.1
                positions.push([
                    x + (Math.random() - 0.5) * jitter,
                    y + (Math.random() - 0.5) * jitter,
                    z + (Math.random() - 0.5) * jitter
                ])
                particlesPlaced++
            }
        }
        layer++
    }

    // Shuffle positions and assign to protons and neutrons
    const shuffled = positions.sort(() => Math.random() - 0.5)

    return {
        protonPositions: shuffled.slice(0, protonCount),
        neutronPositions: shuffled.slice(protonCount, protonCount + neutronCount)
    }
}

export default function Nucleus({ protonCount = 1, neutronCount = 0 }) {
    const groupRef = useRef()

    // Generate positions - memoized to avoid recalculation on every frame
    const { protonPositions, neutronPositions } = useMemo(() => {
        return generateClusterPositions(protonCount, neutronCount)
    }, [protonCount, neutronCount])

    // Slow rotation of the entire nucleus
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1
        }
    })

    return (
        <group ref={groupRef}>
            {protonPositions.map((pos, index) => (
                <Proton key={`proton-${index}`} position={pos} />
            ))}
            {neutronPositions.map((pos, index) => (
                <Neutron key={`neutron-${index}`} position={pos} />
            ))}
        </group>
    )
}
