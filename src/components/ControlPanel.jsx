import './ControlPanel.css'

// Predefined elements with their proton and neutron counts
const ELEMENTS = [
    { symbol: 'H', name: 'Водород', protons: 1, neutrons: 0 },
    { symbol: 'He', name: 'Гелий', protons: 2, neutrons: 2 },
    { symbol: 'Li', name: 'Литий', protons: 3, neutrons: 4 },
    { symbol: 'Be', name: 'Бериллий', protons: 4, neutrons: 5 },
    { symbol: 'B', name: 'Бор', protons: 5, neutrons: 6 },
    { symbol: 'C', name: 'Углерод', protons: 6, neutrons: 6 },
    { symbol: 'N', name: 'Азот', protons: 7, neutrons: 7 },
    { symbol: 'O', name: 'Кислород', protons: 8, neutrons: 8 },
    { symbol: 'Fe', name: 'Железо', protons: 26, neutrons: 30 },
    { symbol: 'Au', name: 'Золото', protons: 79, neutrons: 118 },
]

export default function ControlPanel({
    protonCount,
    neutronCount,
    onProtonChange,
    onNeutronChange,
    onReset
}) {
    const handleElementSelect = (element) => {
        onProtonChange(element.protons)
        onNeutronChange(element.neutrons)
    }

    const massNumber = protonCount + neutronCount

    return (
        <div className="control-panel">
            <h1 className="title">⚛️ Моделирование ядра атома</h1>

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

                <div className="particle-controls">
                    <div className="particle-row">
                        <span className="particle-label proton-label">Протоны</span>
                        <div className="button-group">
                            <button
                                className="control-btn minus"
                                onClick={() => onProtonChange(Math.max(0, protonCount - 1))}
                                disabled={protonCount === 0}
                            >
                                −
                            </button>
                            <span className="count">{protonCount}</span>
                            <button
                                className="control-btn plus"
                                onClick={() => onProtonChange(protonCount + 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="particle-row">
                        <span className="particle-label neutron-label">Нейтроны</span>
                        <div className="button-group">
                            <button
                                className="control-btn minus"
                                onClick={() => onNeutronChange(Math.max(0, neutronCount - 1))}
                                disabled={neutronCount === 0}
                            >
                                −
                            </button>
                            <span className="count">{neutronCount}</span>
                            <button
                                className="control-btn plus"
                                onClick={() => onNeutronChange(neutronCount + 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <button className="reset-btn" onClick={onReset}>
                    🔄 Сбросить
                </button>
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
                        <span>Протон (+1)</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color neutron-color"></span>
                        <span>Нейтрон (0)</span>
                    </div>
                </div>
            </div>

            <div className="instructions">
                <p>🖱️ Вращение: зажмите ЛКМ и двигайте мышью</p>
                <p>🔍 Зум: колёсико мыши</p>
            </div>
        </div>
    )
}
