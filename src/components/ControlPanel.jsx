import './ControlPanel.css'

// Predefined elements with their proton and neutron counts
const ELEMENTS = [
    { symbol: 'H', name: 'Водород', protons: 1, neutrons: 0, electrons: 1 },
]

export default function ControlPanel({
    protonCount,
    neutronCount,
    selectedCount = 0,
    onProtonChange,
    onNeutronChange,
    onSetElement,
    onReset,
    onDeleteSelected,
    onAddParticleStart
}) {
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
                </div>
            </div>

            <div className="instructions">
                <p>🖱️ <b>Выбор</b>: ЛКМ (Ctrl/Cmd для группы)</p>
                <p>✋ <b>Перемещение</b>: Drag на выделенной частице</p>
                <p>🗑️ <b>Удаление</b>: Клавиша <b>Del</b> или кнопка в меню</p>
                <p>🔄 <b>Вращение частицы</b>: ПКМ + Drag</p>
            </div>
        </div>
    )
}
