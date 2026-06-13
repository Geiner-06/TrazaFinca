// Gráfica de línea (SVG) de la evolución del peso promedio del lote.
// points: [{ label: 'Feb 2026', value: 305 }]
export default function WeightTrendChart({ points }) {
    if (!points || points.length === 0) {
        return <p className="no-records-placeholder">No hay datos de peso en el período seleccionado.</p>;
    }

    const W = 720;
    const H = 280;
    const PAD = { top: 20, right: 24, bottom: 40, left: 56 };
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;

    const values = points.map(p => p.value);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    // Margen visual del 8% arriba/abajo
    const span = rawMax - rawMin || 1;
    const yMin = Math.floor((rawMin - span * 0.08) / 10) * 10;
    const yMax = Math.ceil((rawMax + span * 0.08) / 10) * 10;

    const xFor = (i) => points.length === 1
        ? PAD.left + innerW / 2
        : PAD.left + (innerW * i) / (points.length - 1);
    const yFor = (v) => PAD.top + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

    // Líneas guía horizontales (5 divisiones)
    const yTicks = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) * i) / 4);

    const linePath = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(p.value).toFixed(1)}`)
        .join(' ');

    return (
        <div className="weight-chart-wrap">
            <svg viewBox={`0 0 ${W} ${H}`} className="weight-chart-svg" role="img" aria-label="Evolución del peso promedio del lote">
                {/* Líneas guía y etiquetas eje Y */}
                {yTicks.map((t, i) => (
                    <g key={i}>
                        <line
                            x1={PAD.left} y1={yFor(t)} x2={W - PAD.right} y2={yFor(t)}
                            className="chart-gridline"
                        />
                        <text x={PAD.left - 8} y={yFor(t) + 4} textAnchor="end" className="chart-axis-label">
                            {Math.round(t)}
                        </text>
                    </g>
                ))}

                {/* Área bajo la línea */}
                <path
                    d={`${linePath} L ${xFor(points.length - 1)} ${PAD.top + innerH} L ${xFor(0)} ${PAD.top + innerH} Z`}
                    className="chart-area"
                />

                {/* Línea principal */}
                <path d={linePath} className="chart-line" fill="none" />

                {/* Puntos + etiquetas eje X */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={xFor(i)} cy={yFor(p.value)} r="4" className="chart-dot" />
                        <text x={xFor(i)} y={yFor(p.value) - 10} textAnchor="middle" className="chart-point-label">
                            {p.value.toFixed(0)}
                        </text>
                        <text x={xFor(i)} y={H - PAD.bottom + 20} textAnchor="middle" className="chart-axis-label">
                            {p.label}
                        </text>
                    </g>
                ))}
            </svg>
            <p className="chart-caption">Peso promedio del lote (kg) por mes</p>
        </div>
    );
}
