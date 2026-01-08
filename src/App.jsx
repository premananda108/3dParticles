import { useState, useCallback } from 'react'
import AtomScene from './components/AtomScene'
import ControlPanel from './components/ControlPanel'
import './App.css'

// Generate positions for particles in a cluster formation
function generateClusterPositions(count, existingPositions = []) {
  const positions = [...existingPositions]
  const startIndex = positions.length

  if (count <= positions.length) {
    return positions.slice(0, count)
  }

  const baseRadius = 0.8

  for (let i = startIndex; i < count; i++) {
    // Use golden ratio spiral for distribution
    const layer = Math.floor(Math.cbrt(i + 1))
    const layerRadius = layer * baseRadius

    const phi = Math.acos(1 - 2 * ((i % 10) + 0.5) / 10)
    const theta = Math.PI * (1 + Math.sqrt(5)) * i

    const x = layerRadius * Math.sin(phi) * Math.cos(theta)
    const y = layerRadius * Math.sin(phi) * Math.sin(theta)
    const z = layerRadius * Math.cos(phi)

    // Add some randomness
    const jitter = 0.2
    positions.push({
      id: `particle-${Date.now()}-${i}`,
      position: [
        x + (Math.random() - 0.5) * jitter,
        y + (Math.random() - 0.5) * jitter,
        z + (Math.random() - 0.5) * jitter
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0]
    })
  }

  return positions
}

function App() {
  const [protons, setProtons] = useState([
    { id: 'proton-0', position: [0, 0, 0], rotation: [0, 0, 0] }
  ])
  const [neutrons, setNeutrons] = useState([])

  const handleProtonCountChange = useCallback((newCount) => {
    setProtons(prev => {
      if (newCount > prev.length) {
        return generateClusterPositions(newCount, prev)
      }
      return prev.slice(0, newCount)
    })
  }, [])

  const handleNeutronCountChange = useCallback((newCount) => {
    setNeutrons(prev => {
      if (newCount > prev.length) {
        return generateClusterPositions(newCount, prev)
      }
      return prev.slice(0, newCount)
    })
  }, [])

  const handleProtonPositionChange = useCallback((id, newPosition) => {
    setProtons(prev => prev.map(p =>
      p.id === id ? { ...p, position: newPosition } : p
    ))
  }, [])

  const handleNeutronPositionChange = useCallback((id, newPosition) => {
    setNeutrons(prev => prev.map(n =>
      n.id === id ? { ...n, position: newPosition } : n
    ))
  }, [])

  const handleProtonRotationChange = useCallback((id, newRotation) => {
    setProtons(prev => prev.map(p =>
      p.id === id ? { ...p, rotation: newRotation } : p
    ))
  }, [])

  const handleNeutronRotationChange = useCallback((id, newRotation) => {
    setNeutrons(prev => prev.map(n =>
      n.id === id ? { ...n, rotation: newRotation } : n
    ))
  }, [])

  const handleReset = useCallback(() => {
    setProtons([{ id: 'proton-0', position: [0, 0, 0], rotation: [0, 0, 0] }])
    setNeutrons([])
  }, [])

  // Set specific element configuration
  const handleSetElement = useCallback((protonCount, neutronCount) => {
    const newProtons = generateClusterPositions(protonCount, [])
    const newNeutrons = generateClusterPositions(neutronCount, [])
    setProtons(newProtons)
    setNeutrons(newNeutrons)
  }, [])

  return (
    <div className="app">
      <AtomScene
        protons={protons}
        neutrons={neutrons}
        onProtonPositionChange={handleProtonPositionChange}
        onNeutronPositionChange={handleNeutronPositionChange}
        onProtonRotationChange={handleProtonRotationChange}
        onNeutronRotationChange={handleNeutronRotationChange}
      />
      <ControlPanel
        protonCount={protons.length}
        neutronCount={neutrons.length}
        onProtonChange={handleProtonCountChange}
        onNeutronChange={handleNeutronCountChange}
        onSetElement={handleSetElement}
        onReset={handleReset}
      />
    </div>
  )
}

export default App
