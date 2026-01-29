import { useState, useCallback, useRef, useEffect } from 'react'
import * as THREE from 'three'
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
    { id: 'proton-0', position: [0, 0, 0], rotation: [0, 0, 0], color: '#ff3333', emissive: '#ff0000' }
  ])
  const [neutrons, setNeutrons] = useState([])
  const [electrons, setElectrons] = useState([])
  const [arrows, setArrows] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())

  // Snapshot to store initial positions relative to leader at start of drag
  const dragSnapshot = useRef(null)

  // Undo/Redo history
  const historyRef = useRef({
    past: [],
    future: []
  })
  const MAX_HISTORY = 50

  // Save current state to history before making changes
  const saveSnapshot = useCallback(() => {
    const snapshot = {
      protons: JSON.parse(JSON.stringify(protons)),
      neutrons: JSON.parse(JSON.stringify(neutrons)),

      electrons: JSON.parse(JSON.stringify(electrons)),
      arrows: JSON.parse(JSON.stringify(arrows))
    }
    historyRef.current.past.push(snapshot)
    if (historyRef.current.past.length > MAX_HISTORY) {
      historyRef.current.past.shift()
    }
    historyRef.current.future = [] // Clear redo stack on new action
  }, [protons, neutrons, electrons, arrows])

  // Undo last action
  const undo = useCallback(() => {
    if (historyRef.current.past.length === 0) return

    // Save current state to future for redo
    const current = {
      protons: JSON.parse(JSON.stringify(protons)),
      neutrons: JSON.parse(JSON.stringify(neutrons)),
      electrons: JSON.parse(JSON.stringify(electrons))
    }
    historyRef.current.future.push(current)

    // Restore previous state
    const prev = historyRef.current.past.pop()
    setProtons(prev.protons)
    setNeutrons(prev.neutrons)
    setElectrons(prev.electrons)
    setArrows(prev.arrows || [])
    setSelectedIds(new Set())
  }, [protons, neutrons, electrons, arrows])

  // Redo last undone action
  const redo = useCallback(() => {
    if (historyRef.current.future.length === 0) return

    // Save current state to past
    const current = {
      protons: JSON.parse(JSON.stringify(protons)),
      neutrons: JSON.parse(JSON.stringify(neutrons)),
      electrons: JSON.parse(JSON.stringify(electrons))
    }
    historyRef.current.past.push(current)

    // Restore future state
    const next = historyRef.current.future.pop()
    setProtons(next.protons)
    setNeutrons(next.neutrons)
    setElectrons(next.electrons)
    setArrows(next.arrows || [])
    setSelectedIds(new Set())
  }, [protons, neutrons, electrons, arrows])

  const handleProtonCountChange = useCallback((newCount) => {
    saveSnapshot()
    setProtons(prev => {
      if (newCount > prev.length) {
        return generateClusterPositions(newCount, prev)
      }
      return prev.slice(0, newCount)
    })
  }, [saveSnapshot])

  const handleNeutronCountChange = useCallback((newCount) => {
    saveSnapshot()
    setNeutrons(prev => {
      if (newCount > prev.length) {
        return generateClusterPositions(newCount, prev)
      }
      return prev.slice(0, newCount)
    })
  }, [saveSnapshot])

  const handleAddParticleStart = useCallback((type) => {
    saveSnapshot()
    const newId = `${type}-${Date.now()}`
    const newParticle = {
      id: newId,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    }

    if (type === 'proton') {
      newParticle.color = '#ff3333'
      newParticle.emissive = '#ff0000'
      setProtons(prev => [...prev, newParticle])
    } else if (type === 'neutron') {
      newParticle.color = '#bbbbbb'
      newParticle.emissive = '#444444'
      setNeutrons(prev => [...prev, newParticle])
    } else if (type === 'electron') {
      newParticle.color = '#0088ff'
      newParticle.emissive = '#0044aa'
      setElectrons(prev => [...prev, newParticle])
    } else if (type === 'arrow') {
      console.log('App: Adding arrow')
      newParticle.color = '#00ccff'
      newParticle.emissive = '#000000'
      setArrows(prev => [...prev, newParticle])
    }

    // Immediately select the new particle
    setSelectedIds(new Set([newId]))
  }, [saveSnapshot])

  const handleDragStart = useCallback((leaderId) => {
    console.log('App: handleDragStart', leaderId)
    // 1. Find the leader
    const allParticles = [...protons, ...neutrons, ...electrons, ...arrows]
    const leader = allParticles.find(p => p.id === leaderId)

    if (!leader) return

    // 2. Snapshot positions and rotations of ALL selected particles
    const snapshot = {
      leaderId,
      initialLeaderPos: [...leader.position],
      initialLeaderRot: [...(leader.rotation || [0, 0, 0])],
      particles: {}
    }

    // Store initial states for all selected particles
    allParticles.forEach(p => {
      if (selectedIds.has(p.id)) {
        snapshot.particles[p.id] = {
          position: [...p.position],
          rotation: [...(p.rotation || [0, 0, 0])]
        }
      }
    })

    console.log('App: Created snapshot', snapshot)
    dragSnapshot.current = snapshot
  }, [protons, neutrons, electrons, arrows, selectedIds])

  const handleDragEnd = useCallback(() => {
    console.log('App: handleDragEnd')
    dragSnapshot.current = null
  }, [])

  // Helper to update position for a group of selected particles
  const handleBatchMove = useCallback((leaderId, newPosition) => {
    // Lazily create snapshot on first move if it doesn't exist or if selection count mismatches
    if (!dragSnapshot.current ||
      dragSnapshot.current.leaderId !== leaderId ||
      Object.keys(dragSnapshot.current.particles).length !== selectedIds.size) {
      const allParticles = [...protons, ...neutrons, ...electrons, ...arrows]
      const leader = allParticles.find(p => p.id === leaderId)

      if (!leader) {
        console.log('App: handleBatchMove - leader not found', leaderId)
        return
      }

      // Save to history BEFORE modifying positions
      saveSnapshot()

      // Create snapshot now
      const snapshot = {
        leaderId,
        initialLeaderPos: [...leader.position],
        initialLeaderRot: [...(leader.rotation || [0, 0, 0])],
        particles: {}
      }

      allParticles.forEach(p => {
        if (selectedIds.has(p.id)) {
          snapshot.particles[p.id] = {
            position: [...p.position],
            rotation: [...(p.rotation || [0, 0, 0])]
          }
        }
      })

      console.log('App: handleBatchMove - created snapshot lazily', snapshot)
      dragSnapshot.current = snapshot
    }

    const { initialLeaderPos, particles } = dragSnapshot.current

    // Calculate total delta from start of drag
    const deltaX = newPosition[0] - initialLeaderPos[0]
    const deltaY = newPosition[1] - initialLeaderPos[1]
    const deltaZ = newPosition[2] - initialLeaderPos[2]

    // Function to update a specific array if it contains particles in the snapshot
    const updateArray = (arr) => arr.map(p => {
      // Leader gets the exact new position (already moved by gizmo)
      if (p.id === leaderId) {
        return {
          ...p,
          position: [...newPosition]
        }
      }
      // Other selected particles get the delta applied
      if (particles[p.id]) {
        const initial = particles[p.id]
        return {
          ...p,
          position: [
            initial.position[0] + deltaX,
            initial.position[1] + deltaY,
            initial.position[2] + deltaZ
          ]
        }
      }
      return p
    })

    setProtons(prev => updateArray(prev))
    setNeutrons(prev => updateArray(prev))

    setElectrons(prev => updateArray(prev))
    setArrows(prev => updateArray(prev))

  }, [protons, neutrons, electrons, arrows, selectedIds, saveSnapshot])

  // Helper to update rotation for a group of selected particles
  const handleBatchRotate = useCallback((leaderId, newRotation) => {
    // Lazily create snapshot if it doesn't exist or is stale
    if (!dragSnapshot.current ||
      dragSnapshot.current.leaderId !== leaderId ||
      Object.keys(dragSnapshot.current.particles).length !== selectedIds.size) {

      const allParticles = [...protons, ...neutrons, ...electrons, ...arrows]
      const leader = allParticles.find(p => p.id === leaderId)

      if (!leader) return

      saveSnapshot()

      const snapshot = {
        leaderId,
        initialLeaderPos: [...leader.position],
        initialLeaderRot: [...(leader.rotation || [0, 0, 0])],
        particles: {}
      }

      allParticles.forEach(p => {
        if (selectedIds.has(p.id)) {
          snapshot.particles[p.id] = {
            position: [...p.position],
            rotation: [...(p.rotation || [0, 0, 0])]
          }
        }
      })
      dragSnapshot.current = snapshot
    }

    const { initialLeaderPos, initialLeaderRot, particles } = dragSnapshot.current

    // Calculate delta rotation
    const qInitial = new THREE.Quaternion().setFromEuler(new THREE.Euler(...initialLeaderRot))
    const qNew = new THREE.Quaternion().setFromEuler(new THREE.Euler(...newRotation))
    const qDelta = qNew.clone().multiply(qInitial.clone().invert())

    const updateArray = (arr) => arr.map(p => {
      // Leader gets the exact new rotation
      if (p.id === leaderId) {
        return {
          ...p,
          rotation: [...newRotation]
        }
      }

      // Other selected particles get rotated around the leader
      if (particles[p.id]) {
        const initial = particles[p.id]

        // 1. Calculate new position: rotate relative vector around pivot
        const pivot = new THREE.Vector3(...initialLeaderPos)
        const posInitial = new THREE.Vector3(...initial.position)
        const vRelative = posInitial.clone().sub(pivot)
        const vRotated = vRelative.applyQuaternion(qDelta)
        const posNew = pivot.clone().add(vRotated)

        // 2. Calculate new rotation: apply delta to initial rotation
        const qParticleInitial = new THREE.Quaternion().setFromEuler(new THREE.Euler(...initial.rotation))
        const qParticleNew = qDelta.clone().multiply(qParticleInitial)
        const eParticleNew = new THREE.Euler().setFromQuaternion(qParticleNew)

        return {
          ...p,
          position: [posNew.x, posNew.y, posNew.z],
          rotation: [eParticleNew.x, eParticleNew.y, eParticleNew.z]
        }
      }
      return p
    })

    setProtons(prev => updateArray(prev))
    setNeutrons(prev => updateArray(prev))
    setElectrons(prev => updateArray(prev))
    setArrows(prev => updateArray(prev))
  }, [protons, neutrons, electrons, arrows, selectedIds, saveSnapshot])

  // Unified position change handler - routes to batch move for all particle types
  const handlePositionChange = useCallback((id, newPosition) => {
    handleBatchMove(id, newPosition)
  }, [handleBatchMove])

  // Helper to get the correct setter based on particle type
  const getSetterByType = useCallback((type) => {
    const setters = {
      proton: setProtons,
      neutron: setNeutrons,
      electron: setElectrons,
      arrow: setArrows
    }
    return setters[type]
  }, [])

  // Unified rotation change handler
  const handleRotationChange = useCallback((id, newRotation) => {
    handleBatchRotate(id, newRotation)
  }, [handleBatchRotate])

  // Unified scale change handler
  const handleScaleChange = useCallback((id, newScale) => {
    const type = id.split('-')[0]
    const setter = getSetterByType(type)
    if (setter) {
      setter(prev => prev.map(p =>
        p.id === id ? { ...p, scale: newScale } : p
      ))
    }
  }, [getSetterByType])

  // Unified color change handler (supports 'base' or 'emissive')
  const handleColorChange = useCallback((newColor, type = 'base') => {
    saveSnapshot()

    // Helper to update color for selected particles in a list
    const updateColor = (list) => list.map(p =>
      selectedIds.has(p.id) ? {
        ...p,
        [type === 'base' ? 'color' : 'emissive']: newColor
      } : p
    )

    setProtons(prev => updateColor(prev))
    setNeutrons(prev => updateColor(prev))
    setElectrons(prev => updateColor(prev))
    setArrows(prev => updateColor(prev))
  }, [selectedIds, saveSnapshot])

  // Determine current selected colors
  const getSelectedColors = useCallback(() => {
    if (selectedIds.size === 0) return { base: '#ffffff', emissive: '#000000' }

    const firstId = Array.from(selectedIds)[0]
    const allParticles = [...protons, ...neutrons, ...electrons, ...arrows]
    const found = allParticles.find(p => p.id === firstId)
    return {
      base: found ? (found.color || '#ffffff') : '#ffffff',
      emissive: found ? (found.emissive || '#000000') : '#000000'
    }
  }, [selectedIds, protons, neutrons, electrons, arrows])

  const { base: selectedColor, emissive: selectedEmissive } = getSelectedColors()

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
    saveSnapshot()
    setProtons(prev => prev.filter(p => !selectedIds.has(p.id)))
    setNeutrons(prev => prev.filter(n => !selectedIds.has(n.id)))
    setElectrons(prev => prev.filter(e => !selectedIds.has(e.id)))
    setArrows(prev => prev.filter(a => !selectedIds.has(a.id)))
    setSelectedIds(new Set())
  }, [selectedIds, saveSnapshot])

  // Duplicate selected elements
  const handleDuplicateSelected = useCallback(() => {
    if (selectedIds.size === 0) return
    saveSnapshot()

    const offset = 0.5 // Offset for duplicated elements
    const newSelectedIds = new Set()

    // Helper to duplicate a particle with offset
    const duplicateParticle = (particle) => {
      const newId = `${particle.id.split('-')[0]}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      newSelectedIds.add(newId)
      return {
        ...particle,
        id: newId,
        position: [
          particle.position[0] + offset,
          particle.position[1] + offset,
          particle.position[2]
        ],
        rotation: particle.rotation ? [...particle.rotation] : [0, 0, 0],
        scale: particle.scale ? [...particle.scale] : [1, 1, 1],
        color: particle.color,
        emissive: particle.emissive
      }
    }

    // Duplicate selected protons
    setProtons(prev => {
      const toDuplicate = prev.filter(p => selectedIds.has(p.id))
      const duplicated = toDuplicate.map(duplicateParticle)
      return [...prev, ...duplicated]
    })

    // Duplicate selected neutrons
    setNeutrons(prev => {
      const toDuplicate = prev.filter(n => selectedIds.has(n.id))
      const duplicated = toDuplicate.map(duplicateParticle)
      return [...prev, ...duplicated]
    })

    // Duplicate selected electrons
    setElectrons(prev => {
      const toDuplicate = prev.filter(e => selectedIds.has(e.id))
      const duplicated = toDuplicate.map(duplicateParticle)
      return [...prev, ...duplicated]
    })

    // Duplicate selected arrows
    setArrows(prev => {
      const toDuplicate = prev.filter(a => selectedIds.has(a.id))
      const duplicated = toDuplicate.map(duplicateParticle)
      return [...prev, ...duplicated]
    })

    // Select newly duplicated elements
    setSelectedIds(newSelectedIds)

    // Clear drag snapshot to prevent stale position data
    dragSnapshot.current = null
  }, [selectedIds, saveSnapshot])

  // Global keyboard listener for Delete key, Undo/Redo, and Duplicate
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo: Cmd+Z or Ctrl+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      // Redo: Cmd+Shift+Z or Ctrl+Shift+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
        return
      }
      // Duplicate: Cmd+D or Ctrl+D
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault()
        handleDuplicateSelected()
        return
      }
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
  }, [handleDeleteSelected, handleDuplicateSelected, undo, redo])

  // Global listener to disable context menu
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault()
    window.addEventListener('contextmenu', handleContextMenu)
    return () => window.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  const handleReset = useCallback(() => {
    saveSnapshot()
    setProtons([{ id: 'proton-0', position: [0, 0, 0], rotation: [0, 0, 0], color: '#ff3333', emissive: '#ff0000' }])
    setNeutrons([])

    setElectrons([])
    setArrows([])
    setSelectedIds(new Set())
  }, [saveSnapshot])

  // Snap/Step state
  const [moveStep, setMoveStep] = useState(0)
  const [rotateStep, setRotateStep] = useState(0)

  // Set specific element configuration
  const handleSetElement = useCallback((protonCount, neutronCount, electronCount = 0) => {
    saveSnapshot()
    let newProtons = []

    // For single proton (Hydrogen), place it exactly at center to match electron
    if (protonCount === 1) {
      newProtons = [{
        id: `proton-${Date.now()}-center`,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        color: '#ff3333',
        emissive: '#ff0000'
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
        rotation: [0, 0, 0],
        color: '#0088ff',
        emissive: '#0044aa'
      }]
    } else {
      newElectrons = generateClusterPositions(electronCount, [])
    }

    setProtons(newProtons)
    setNeutrons(newNeutrons)
    setElectrons(newElectrons)
    setArrows([]) // Reset arrows on element set
  }, [saveSnapshot])

  return (
    <div className="app">
      <AtomScene
        protons={protons}
        neutrons={neutrons}
        electrons={electrons}
        arrows={arrows}
        selectedIds={selectedIds}
        moveStep={moveStep}
        rotateStep={rotateStep}
        onSelectParticle={handleSelectParticle}
        onDeselectAll={handleDeselectAll}
        onPositionChange={handlePositionChange}
        onRotationChange={handleRotationChange}
        onScaleChange={handleScaleChange}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />
      <ControlPanel
        protonCount={protons.length}
        neutronCount={neutrons.length}
        selectedCount={selectedIds.size}
        selectedColor={selectedColor}
        selectedEmissive={selectedEmissive}
        onColorChange={handleColorChange}
        moveStep={moveStep}
        onMoveStepChange={setMoveStep}
        rotateStep={rotateStep}
        onRotateStepChange={setRotateStep}
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
