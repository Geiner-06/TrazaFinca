import { useState, useMemo } from 'react';
import WeightTrendChart from './WeightTrendChart.jsx';
import { CATEGORY_LABELS, getGdpThreshold } from '../data/weightCategories.js';
import { getEffectiveTarget, projectTargetDate } from '../data/growthProjection.js';

const FINCA_NAME = 'Hacienda TrazaFinca';
const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
};

const daysBetween = (a, b) =>
    Math.round((new Date(b.replace(/-/g, '/')) - new Date(a.replace(/-/g, '/'))) / 86400000);

// Distintos valores no vacíos de un campo
const distinct = (arr, key) => [...new Set(arr.map(x => x[key]).filter(Boolean))].sort();

export default function GrowthReport({ animals, weightRecords, weightTargets, onDefineLoteTarget }) {
    const [filterLote, setFilterLote] = useState('todos');
    const [filterPotrero, setFilterPotrero] = useState('todos');
    const [filterProposito, setFilterProposito] = useState('todos');
    const [dateFrom, setDateFrom] = useState('2026-01-01');
    const [dateTo, setDateTo] = useState(getTodayStr());
    const [sortBy, setSortBy] = useState('animal'); // 'animal' | 'estimada'

    const loteOptions = useMemo(() => distinct(animals, 'lote'), [animals]);
    const potreroOptions = useMemo(() => distinct(animals, 'potrero'), [animals]);
    const propositoOptions = useMemo(() => distinct(animals, 'proposito'), [animals]);

    const report = useMemo(() => {
        // 1. Animales que cumplen los filtros de lote / potrero / propósito
        const matchedAnimals = animals.filter(a =>
            (filterLote === 'todos' || a.lote === filterLote) &&
            (filterPotrero === 'todos' || a.potrero === filterPotrero) &&
            (filterProposito === 'todos' || a.proposito === filterProposito)
        );

        // 2. Filas por animal con GDP diaria/mensual dentro del período
        const rows = [];
        matchedAnimals.forEach(animal => {
            const recs = weightRecords
                .filter(r => r.animalId === animal.id && r.fecha >= dateFrom && r.fecha <= dateTo)
                .sort((a, b) => a.fecha.localeCompare(b.fecha));
            if (recs.length === 0) return;

            const first = recs[0];
            const last = recs[recs.length - 1];
            const days = daysBetween(first.fecha, last.fecha);
            const categoria = last.categoria;
            const threshold = getGdpThreshold(categoria, animal.proposito);

            let dailyGdp = null;
            if (days > 0) dailyGdp = Math.round(((last.pesoKg - first.pesoKg) / days) * 1000) / 1000;

            // Proyección de peso objetivo usando todos los pesajes del animal (criterios 2 y 5)
            const allAnimalRecs = weightRecords.filter(r => r.animalId === animal.id);
            const target = getEffectiveTarget(animal, weightTargets);
            const projection = projectTargetDate(allAnimalRecs, target ? target.value : null);

            rows.push({
                animal,
                categoria,
                pesoInicial: first.pesoKg,
                pesoFinal: last.pesoKg,
                fechaInicial: first.fecha,
                fechaFinal: last.fecha,
                ganancia: Math.round((last.pesoKg - first.pesoKg) * 10) / 10,
                dailyGdp,
                monthlyGdp: dailyGdp !== null ? Math.round(dailyGdp * 30 * 10) / 10 : null,
                threshold,
                below: dailyGdp !== null && dailyGdp < threshold,
                numPesajes: recs.length,
                target: target ? target.value : null,
                projection
            });
        });

        // 3. Serie mensual del peso promedio del lote (para la gráfica)
        const matchedIds = new Set(matchedAnimals.map(a => a.id));
        const buckets = {};
        weightRecords
            .filter(r => matchedIds.has(r.animalId) && r.fecha >= dateFrom && r.fecha <= dateTo)
            .forEach(r => {
                const [y, m] = r.fecha.split('-');
                const key = `${y}-${m}`;
                if (!buckets[key]) buckets[key] = { sum: 0, count: 0, y: +y, m: +m };
                buckets[key].sum += r.pesoKg;
                buckets[key].count += 1;
            });
        const points = Object.keys(buckets).sort().map(key => {
            const b = buckets[key];
            return { label: `${MONTHS_ES[b.m - 1]} ${b.y}`, value: b.sum / b.count };
        });

        // 4. Resumen del lote en el período
        const withData = rows.filter(r => r.dailyGdp !== null);
        const avgInitial = withData.length
            ? withData.reduce((s, r) => s + r.pesoInicial, 0) / withData.length : null;
        const avgFinal = withData.length
            ? withData.reduce((s, r) => s + r.pesoFinal, 0) / withData.length : null;
        const totalGain = withData.reduce((s, r) => s + r.ganancia, 0);

        return { rows, points, avgInitial, avgFinal, totalGain, animalCount: rows.length };
    }, [animals, weightRecords, weightTargets, filterLote, filterPotrero, filterProposito, dateFrom, dateTo]);

    const filtersSummary = [
        filterLote !== 'todos' ? `Lote: ${filterLote}` : null,
        filterPotrero !== 'todos' ? `Potrero: ${filterPotrero}` : null,
        filterProposito !== 'todos' ? `Propósito: ${filterProposito}` : null
    ].filter(Boolean).join(' · ') || 'Todo el hato';

    // Ordenamiento de filas (criterio 5: por fecha estimada de alcance)
    const sortRankForSort = (p) => {
        // alcanzado primero, luego con fecha estimada, luego sin fecha
        if (p.status === 'alcanzado') return 0;
        if (p.status === 'ok') return 1;
        return 2;
    };
    const sortedRows = [...report.rows].sort((a, b) => {
        if (sortBy === 'estimada') {
            const ra = sortRankForSort(a.projection);
            const rb = sortRankForSort(b.projection);
            if (ra !== rb) return ra - rb;
            if (a.projection.status === 'ok' && b.projection.status === 'ok') {
                return a.projection.estimatedDate.localeCompare(b.projection.estimatedDate);
            }
            return a.animal.id.localeCompare(b.animal.id);
        }
        return a.animal.id.localeCompare(b.animal.id);
    });

    const renderProjectionCell = (p) => {
        switch (p.status) {
            case 'ok': return <strong>{formatDate(p.estimatedDate)}</strong>;
            case 'alcanzado': return <span className="status-ok">✓ Alcanzado</span>;
            case 'no_calculable': return <span className="status-below">No calculable</span>;
            case 'pocos_pesajes': return <span className="muted-inline">Pocos pesajes</span>;
            default: return <span className="muted-inline">—</span>;
        }
    };

    const handleExportPDF = () => window.print();

    return (
        <section className="list-container">
            {/* Controles de filtro (no se imprimen) */}
            <div className="report-filters no-print">
                <div className="report-filter-field">
                    <label>Lote</label>
                    <div className="select-wrapper">
                        <select value={filterLote} onChange={e => setFilterLote(e.target.value)}>
                            <option value="todos">Todos</option>
                            {loteOptions.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                </div>
                <div className="report-filter-field">
                    <label>Potrero</label>
                    <div className="select-wrapper">
                        <select value={filterPotrero} onChange={e => setFilterPotrero(e.target.value)}>
                            <option value="todos">Todos</option>
                            {potreroOptions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
                <div className="report-filter-field">
                    <label>Propósito</label>
                    <div className="select-wrapper">
                        <select value={filterProposito} onChange={e => setFilterProposito(e.target.value)}>
                            <option value="todos">Todos</option>
                            {propositoOptions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
                <div className="report-filter-field">
                    <label>Desde</label>
                    <input type="date" value={dateFrom} max={dateTo} onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div className="report-filter-field">
                    <label>Hasta</label>
                    <input type="date" value={dateTo} min={dateFrom} onChange={e => setDateTo(e.target.value)} />
                </div>
                <button className="btn btn-primary report-export-btn" onClick={handleExportPDF}>
                    Exportar PDF
                </button>
            </div>

            {/* Área imprimible del reporte */}
            <div className="report-print-area">
                {/* Encabezado (criterio 5) */}
                <div className="report-header">
                    <div>
                        <h1 className="report-title">{FINCA_NAME}</h1>
                        <p className="report-subtitle">Reporte de Ganancia de Peso por Lote</p>
                    </div>
                    <div className="report-header-meta">
                        <p><strong>Período:</strong> {formatDate(dateFrom)} – {formatDate(dateTo)}</p>
                        <p><strong>Filtro:</strong> {filtersSummary}</p>
                        <p><strong>Generado:</strong> {formatDate(getTodayStr())}</p>
                    </div>
                </div>

                {report.animalCount === 0 ? (
                    <div className="empty-state">
                        <h2>Sin datos para el reporte</h2>
                        <p>Ningún animal con pesajes coincide con los filtros y el período seleccionados.</p>
                    </div>
                ) : (
                    <>
                        {/* Resumen del lote (criterio 4) */}
                        <div className="report-summary-grid">
                            <div className="report-summary-card">
                                <span className="rs-value">{report.avgInitial?.toFixed(1)} kg</span>
                                <span className="rs-label">Peso promedio inicial</span>
                            </div>
                            <div className="report-summary-card">
                                <span className="rs-value">{report.avgFinal?.toFixed(1)} kg</span>
                                <span className="rs-label">Peso promedio final</span>
                            </div>
                            <div className="report-summary-card highlight">
                                <span className="rs-value">+{report.totalGain.toFixed(1)} kg</span>
                                <span className="rs-label">Ganancia total del lote</span>
                            </div>
                            <div className="report-summary-card">
                                <span className="rs-value">{report.animalCount}</span>
                                <span className="rs-label">Animales en el reporte</span>
                            </div>
                        </div>

                        {/* Gráfica (criterio 2) */}
                        <div className="report-chart-section">
                            <h3>Evolución del Peso Promedio del Lote</h3>
                            <WeightTrendChart points={report.points} />
                        </div>

                        {/* Tabla con GDP y proyección de peso objetivo (criterios 2, 3 y 5) */}
                        <div className="report-table-section">
                            <div className="report-table-head no-print">
                                <h3>Ganancia de Peso y Proyección por Animal</h3>
                                <div className="report-table-actions">
                                    <div className="select-wrapper">
                                        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                            <option value="animal">Ordenar por: Animal</option>
                                            <option value="estimada">Ordenar por: Fecha estimada de alcance</option>
                                        </select>
                                    </div>
                                    {filterLote !== 'todos' && onDefineLoteTarget && (
                                        <button className="btn btn-outline btn-sm" onClick={() => onDefineLoteTarget(filterLote)}>
                                            Objetivo del lote
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Animal / Arete</th>
                                            <th>Categoría</th>
                                            <th>Peso final</th>
                                            <th>GDP diaria</th>
                                            <th>Umbral mín.</th>
                                            <th>Estado</th>
                                            <th>Peso objetivo</th>
                                            <th>Fecha estimada</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedRows.map(row => (
                                            <tr key={row.animal.id} className={row.below ? 'row-below-threshold' : ''}>
                                                <td>
                                                    <strong>{row.animal.id}</strong>
                                                    {row.animal.arete && <span className="muted-inline"> · {row.animal.arete}</span>}
                                                </td>
                                                <td>{CATEGORY_LABELS[row.categoria] || row.categoria}</td>
                                                <td>{row.pesoFinal} kg</td>
                                                <td>{row.dailyGdp !== null ? `${row.dailyGdp.toFixed(3)} kg/d` : '—'}</td>
                                                <td>{row.threshold.toFixed(2)} kg/d</td>
                                                <td>
                                                    {row.dailyGdp === null ? (
                                                        <span className="muted-inline">Sin GDP</span>
                                                    ) : row.below ? (
                                                        <span className="status-below">● Bajo umbral</span>
                                                    ) : (
                                                        <span className="status-ok">● Óptimo</span>
                                                    )}
                                                </td>
                                                <td>{row.target !== null ? `${row.target} kg` : <span className="muted-inline">Sin objetivo</span>}</td>
                                                <td>{renderProjectionCell(row.projection)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="report-legend">
                                Resaltado en rojo: animales con GDP por debajo del umbral mínimo esperado para su categoría y propósito.
                                {' '}La fecha estimada usa la GDP promedio de los últimos 3 pesajes.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
