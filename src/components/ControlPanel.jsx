import './ControlPanel.css'

const ELEMENTS = [
    { symbol: 'H', name: 'Hydrogen', protons: 1, neutrons: 0, electrons: 1 },
]

import { useRef } from 'react'

export default function ControlPanel({
    protonCount,
    neutronCount,
    selectedCount = 0,
    onProtonChange,
    onNeutronChange,
    onSetElement,
    onReset,
    onAddParticleStart,
    moveStep,
    onDeleteSelected,
    onMoveStepChange,
    rotateStep,
    onRotateStepChange,
    selectedColor,
    selectedEmissive,
    onColorChange,
    onSave,
    onLoad
}) {
    const fileInputRef = useRef(null)

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            onLoad(file)
        }
        // Reset input so same file can be selected again
        e.target.value = ''
    }
    const handleElementSelect = (element) => {
        if (onSetElement) {
            // Pass protons, neutrons, AND electrons
            onSetElement(element.protons, element.neutrons, element.electrons || 0)
        } else {
            onProtonChange(element.protons)
            onNeutronChange(element.neutrons)
        }
    }

    const massNumber = protonCount + neutronCount

    return (
        <div className="control-panel">
            <h1 className="title">⚛️ Atom Modeling</h1>

            <div className="info-display">
                <div className="info-item">
                    <span className="info-label">Protons (Z)</span>
                    <span className="info-value proton-value">{protonCount}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Neutrons (N)</span>
                    <span className="info-value neutron-value">{neutronCount}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Mass Number (A)</span>
                    <span className="info-value">{massNumber}</span>
                </div>
            </div>

            <div className="controls-section">
                <h2>Particle Management</h2>

                <div className="particle-tool-group">
                    <div
                        className="particle-tool proton-tool"
                        onClick={() => onAddParticleStart('proton')}
                        title="Click to add a proton"
                    >
                        <div className="tool-icon proton-icon"></div>
                        <span>Add Proton</span>
                    </div>

                    <div
                        className="particle-tool neutron-tool"
                        onClick={() => onAddParticleStart('neutron')}
                        title="Click to add a neutron"
                    >
                        <div className="tool-icon neutron-icon"></div>
                        <span>Add Neutron</span>
                    </div>

                    <div
                        className="particle-tool electron-tool"
                        onClick={() => onAddParticleStart('electron')}
                        title="Click to add an electron"
                    >
                        <div className="tool-icon electron-icon"></div>
                        <span>Add Electron</span>
                    </div>
                    <div
                        className="particle-tool arrow-tool"
                        onClick={() => onAddParticleStart('arrow')}
                        title="Click to add an arrow"
                    >
                        <div className="tool-icon arrow-icon">↗️</div>
                        <span>Add Arrow</span>
                    </div>
                </div>

                <div className="settings-section">
                    <div className="setting-item">
                        <label>📏 Step (0=off):</label>
                        <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={moveStep}
                            onChange={(e) => onMoveStepChange(Number(e.target.value))}
                            className="step-input"
                        />
                    </div>
                    <div className="setting-item">
                        <label>🔄 Angle (deg):</label>
                        <input
                            type="number"
                            min="0"
                            step="15"
                            value={rotateStep}
                            onChange={(e) => onRotateStepChange(Number(e.target.value))}
                            className="step-input"
                        />
                    </div>
                    <div className="setting-item">
                        <label>🎨 Color:</label>
                        <div className="color-inputs">
                            <input
                                type="color"
                                value={selectedColor || '#ffffff'}
                                onChange={(e) => onColorChange(e.target.value, 'base')}
                                disabled={selectedCount === 0}
                                className="color-input"
                                title="Base color"
                            />
                            <input
                                type="color"
                                value={selectedEmissive || '#000000'}
                                onChange={(e) => onColorChange(e.target.value, 'emissive')}
                                disabled={selectedCount === 0}
                                className="color-input"
                                title="Emissive color"
                            />
                        </div>
                    </div>
                </div>

                <div className="reset-section">
                    <button
                        className={`delete-btn ${selectedCount > 0 ? 'active' : 'disabled'}`}
                        onClick={onDeleteSelected}
                        disabled={selectedCount === 0}
                    >
                        🗑️ Delete ({selectedCount})
                    </button>
                    <button className="reset-btn" onClick={onReset}>
                        🔄 Reset
                    </button>
                </div>

                <div className="storage-section">
                    <h3>File</h3>
                    <div className="storage-buttons">
                        <button className="storage-btn save-btn" onClick={onSave} title="Save to file">
                            💾 Save
                        </button>
                        <button
                            className="storage-btn load-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Load from file"
                        >
                            📂 Load
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".json"
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>
            </div>

            <div className="elements-section">
                <h2>Quick Element Select</h2>
                <div className="elements-grid">
                    {ELEMENTS.map((element) => (
                        <button
                            key={element.symbol}
                            className="element-btn"
                            onClick={() => handleElementSelect(element)}
                            title={`${element.name}: ${element.protons}p + ${element.neutrons}n`}
                        >
                            <span className="element-symbol">{element.symbol}</span>
                            <span className="element-name">{element.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="legend">
                <h2>Legend</h2>
                <div className="legend-items">
                    <div className="legend-item">
                        <span className="legend-color proton-color"></span>
                        <span>Proton</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color neutron-color"></span>
                        <span>Neutron</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color electron-color"></span>
                        <span>Electron</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color arrow-color">↗️</span>
                        <span>Arrow</span>
                    </div>
                </div>
            </div>

            <div className="instructions">
                <p>🖱️ <b>Selection</b>: Click on particle (Ctrl/Cmd for group)</p>
                <p>⚙️ <b>Mode</b>: Click again to toggle (Move/Rotate)</p>
                <p>✋ <b>Manipulation</b>: Drag gizmo arrows or rings</p>
                <p>🗑️ <b>Deletion</b>: <b>Del</b> key or button in menu</p>
                <p>esc <b>Reset</b>: Deselect all</p>
            </div>
        </div>
    )
}
