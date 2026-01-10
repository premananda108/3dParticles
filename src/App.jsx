import { useState, useCallback, useRef, useEffect } from 'react'
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
      rotation: [0, 0, 0]
    })
  }

  return positions
}

function App() {
  const [protons, setProtons] = useState([
    { id: 'proton-0', position: [0, 0, 0], rotation: [0, 0, 0] }
  ])
  const [neutrons, setNeutrons] = useState([])
  const [electrons, setElectrons] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [draggedParticleType, setDraggedParticleType] = useState(null)

  // Snapshot to store initial positions relative to leader at start of drag
  const dragSnapshot = useRef(null)

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

  const handleAddParticleStart = useCallback((type) => {
    const newId = `${type}-${Date.now()}`
    const newParticle = {
      id: newId,
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    }

    if (type === 'proton') {
      setProtons(prev => [...prev, newParticle])
    } else if (type === 'neutron') {
      setNeutrons(prev => [...prev, newParticle])
    } else if (type === 'electron') {
      setElectrons(prev => [...prev, newParticle])
    }

    // Immediately select the new particle
    setSelectedIds(new Set([newId]))
  }, [])

  const handleDragStart = useCallback((leaderId) => {
    // 1. Find the leader
    const allParticles = [...protons, ...neutrons, ...electrons]
    const leader = allParticles.find(p => p.id === leaderId)

    if (!leader) return

    // 2. Snapshot positions of ALL selected particles
    const snapshot = {
      leaderId,
      initialLeaderPos: [...leader.position],
      particles: {}
    }

    // Store initial positions for all selected particles
    allParticles.forEach(p => {
      if (selectedIds.has(p.id)) {
        snapshot.particles[p.id] = [...p.position]
      }
    })

    dragSnapshot.current = snapshot
  }, [protons, neutrons, electrons, selectedIds])

  const handleDragEnd = useCallback(() => {
    dragSnapshot.current = null
  }, [])

  // Helper to update position for a group of selected particles
  const handleBatchMove = useCallback((leaderId, newPosition) => {
    if (!dragSnapshot.current || dragSnapshot.current.leaderId !== leaderId) {
      return
    }

    const { initialLeaderPos, particles } = dragSnapshot.current

    // Calculate total delta from start of drag
    const deltaX = newPosition[0] - initialLeaderPos[0]
    const deltaY = newPosition[1] - initialLeaderPos[1]
    const deltaZ = newPosition[2] - initialLeaderPos[2]

    // Function to update a specific array if it contains particles in the snapshot
    const updateArray = (arr) => arr.map(p => {
      // Check if this particle is in our snapshot
      if (particles[p.id]) {
        const initialPos = particles[p.id]
        return {
          ...p,
          position: [
            initialPos[0] + deltaX,
            initialPos[1] + deltaY,
            initialPos[2] + deltaZ
          ]
        }
      }
      return p
    })

    setProtons(prev => updateArray(prev))
    setNeutrons(prev => updateArray(prev))
    setElectrons(prev => updateArray(prev))

  }, [])

  const handleProtonPositionChange = useCallback((id, newPosition) => {
    handleBatchMove(id, newPosition)
  }, [handleBatchMove])

  const handleNeutronPositionChange = useCallback((id, newPosition) => {
    handleBatchMove(id, newPosition)
  }, [handleBatchMove])

  const handleElectronPositionChange = useCallback((id, newPosition) => {
    handleBatchMove(id, newPosition)
  }, [handleBatchMove])

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

  const handleElectronRotationChange = useCallback((id, newRotation) => {
    setElectrons(prev => prev.map(e =>
      e.id === id ? { ...e, rotation: newRotation } : e
    ))
  }, [])

  const handleSelectParticle = useCallback((id, isMultiSelect) => {
    setSelectedIds(prev => {
      const newSelected = new Set(isMultiSelect ? prev : [])
      if (newSelected.has(id)) {
        newSelected.delete(id)
      } else {
        newSelected.add(id)
      }
      return newSelected
    })
  }, [])

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return

    setProtons(prev => prev.filter(p => !selectedIds.has(p.id)))
    setNeutrons(prev => prev.filter(n => !selectedIds.has(n.id)))
    setElectrons(prev => prev.filter(e => !selectedIds.has(e.id)))
    setSelectedIds(new Set())
  }, [selectedIds])

  // Global keyboard listener for Delete key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Prevent accidental navigation back in some browsers on Backspace
        // only if focus is not in an input/textarea
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          handleDeleteSelected()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleDeleteSelected])

  // Global listener to disable context menu
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault()
    window.addEventListener('contextmenu', handleContextMenu)
    return () => window.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  const handleReset = useCallback(() => {
    setProtons([{ id: 'proton-0', position: [0, 0, 0], rotation: [0, 0, 0] }])
    setNeutrons([])
    setElectrons([])
    setSelectedIds(new Set())
  }, [])

  // Set specific element configuration
  const handleSetElement = useCallback((protonCount, neutronCount, electronCount = 0) => {
    let newProtons = []

    // For single proton (Hydrogen), place it exactly at center to match electron
    if (protonCount === 1) {
      newProtons = [{
        id: `proton-${Date.now()}-center`,
        position: [0, 0, 0],
        rotation: [0, 0, 0]
      }]
    } else {
      newProtons = generateClusterPositions(protonCount, [])
    }

    const newNeutrons = generateClusterPositions(neutronCount, [])

    // For Hydrogen (1p, 1e), we want the electron to envelop the proton at the center.
    let newElectrons = []
    if (electronCount === 1) {
      newElectrons = [{
        id: `electron-${Date.now()}-0`,
        position: [0, 0, 0],
        rotation: [0, 0, 0]
      }]
    } else {
      newElectrons = generateClusterPositions(electronCount, [])
    }

    setProtons(newProtons)
    setNeutrons(newNeutrons)
    setElectrons(newElectrons)
  }, [])

  return (
    <div className="app">
      <AtomScene
        protons={protons}
        neutrons={neutrons}
        electrons={electrons}
        selectedIds={selectedIds}
        onSelectParticle={handleSelectParticle}
        onDeselectAll={handleDeselectAll}
        onProtonPositionChange={handleProtonPositionChange}
        onNeutronPositionChange={handleNeutronPositionChange}
        onElectronPositionChange={handleElectronPositionChange}
        onProtonRotationChange={handleProtonRotationChange}
        onNeutronRotationChange={handleNeutronRotationChange}
        onElectronRotationChange={handleElectronRotationChange}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />
      <ControlPanel
        protonCount={protons.length}
        neutronCount={neutrons.length}
        selectedCount={selectedIds.size}
        onProtonChange={handleProtonCountChange}
        onNeutronChange={handleNeutronCountChange}
        onAddParticleStart={handleAddParticleStart}
        onSetElement={handleSetElement}
        onDeleteSelected={handleDeleteSelected}
        onReset={handleReset}
      />
    </div>
  )
}

export default App
