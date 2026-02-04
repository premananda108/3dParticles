import './ControlPanel.css'

const ELEMENTS = [
    { symbol: 'H', name: 'Водород', protons: 1, neutrons: 0, electrons: 1 },
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
            <h1 className="title">⚛️ Моделирование атома</h1>

            <div className="info-display">
                <div className="info-item">
                    <span className="info-label">Протоны (Z)</span>
                    <span className="info-value proton-value">{protonCount}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Нейтроны (N)</span>
                    <span className="info-value neutron-value">{neutronCount}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Массовое число (A)</span>
                    <span className="info-value">{massNumber}</span>
                </div>
            </div>

            <div className="controls-section">
                <h2>Управление частицами</h2>

                <div className="particle-tool-group">
                    <div
                        className="particle-tool proton-tool"
                        onClick={() => onAddParticleStart('proton')}
                        title="Кликните, чтобы добавить протон"
                    >
                        <div className="tool-icon proton-icon"></div>
                        <span>Добавить Протон</span>
                    </div>

                    <div
                        className="particle-tool neutron-tool"
                        onClick={() => onAddParticleStart('neutron')}
                        title="Кликните, чтобы добавить нейтрон"
                    >
                        <div className="tool-icon neutron-icon"></div>
                        <span>Добавить Нейтрон</span>
                    </div>

                    <div
                        className="particle-tool electron-tool"
                        onClick={() => onAddParticleStart('electron')}
                        title="Кликните, чтобы добавить электрон"
                    >
                        <div className="tool-icon electron-icon"></div>
                        <span>Добавить Электрон</span>
                    </div>
                    <div
                        className="particle-tool arrow-tool"
                        onClick={() => onAddParticleStart('arrow')}
                        title="Кликните, чтобы добавить стрелку"
                    >
                        <div className="tool-icon arrow-icon">↗️</div>
                        <span>Добавить Стрелку</span>
                    </div>
                </div>

                <div className="settings-section">
                    <div className="setting-item">
                        <label>📏 Шаг (0=выкл):</label>
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
                        <label>🔄 Угол (градусы):</label>
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
                        <label>🎨 Цвет:</label>
                        <div className="color-inputs">
                            <input
                                type="color"
                                value={selectedColor || '#ffffff'}
                                onChange={(e) => onColorChange(e.target.value, 'base')}
                                disabled={selectedCount === 0}
                                className="color-input"
                                title="Основной цвет"
                            />
                            <input
                                type="color"
                                value={selectedEmissive || '#000000'}
                                onChange={(e) => onColorChange(e.target.value, 'emissive')}
                                disabled={selectedCount === 0}
                                className="color-input"
                                title="Цвет свечения (emissive)"
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
                        🗑️ Удалить ({selectedCount})
                    </button>
                    <button className="reset-btn" onClick={onReset}>
                        🔄 Сбросить
                    </button>
                </div>

                <div className="storage-section">
                    <h3>Файл</h3>
                    <div className="storage-buttons">
                        <button className="storage-btn save-btn" onClick={onSave} title="Сохранить в файл">
                            💾 Сохранить
                        </button>
                        <button
                            className="storage-btn load-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Загрузить из файла"
                        >
                            📂 Загрузить
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
                <h2>Быстрый выбор элемента</h2>
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
                <h2>Легенда</h2>
                <div className="legend-items">
                    <div className="legend-item">
                        <span className="legend-color proton-color"></span>
                        <span>Протон</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color neutron-color"></span>
                        <span>Нейтрон</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color electron-color"></span>
                        <span>Электрон</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color arrow-color">↗️</span>
                        <span>Стрелка</span>
                    </div>
                </div>
            </div>

            <div className="instructions">
                <p>🖱️ <b>Выбор</b>: Клик на частице (Ctrl/Cmd для группы)</p>
                <p>⚙️ <b>Режим</b>: Повторный клик для смены (Перемещение/Вращение)</p>
                <p>✋ <b>Манипуляция</b>: Перетаскивайте стрелки или кольца гизмо</p>
                <p>🗑️ <b>Удаление</b>: Клавиша <b>Del</b> или кнопка в меню</p>
                <p>esc <b>Сброс</b>: Снять выделение с частицы</p>
            </div>
        </div>
    )
}
