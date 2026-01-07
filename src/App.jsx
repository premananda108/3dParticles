import { useState } from 'react'
import AtomScene from './components/AtomScene'
import ControlPanel from './components/ControlPanel'
import './App.css'

function App() {
  const [protonCount, setProtonCount] = useState(1)
  const [neutronCount, setNeutronCount] = useState(0)

  const handleReset = () => {
    setProtonCount(1)
    setNeutronCount(0)
  }

  return (
    <div className="app">
      <AtomScene protonCount={protonCount} neutronCount={neutronCount} />
      <ControlPanel
        protonCount={protonCount}
        neutronCount={neutronCount}
        onProtonChange={setProtonCount}
        onNeutronChange={setNeutronCount}
        onReset={handleReset}
      />
    </div>
  )
}

export default App
