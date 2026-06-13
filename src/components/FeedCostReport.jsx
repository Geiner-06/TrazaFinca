import { useState, useMemo } from 'react';
import { computeFeedCostReport, COST_GROUP_BY } from '../data/feedCost.js';

const FINCA_NAME = 'Hacienda TrazaFinca';

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
};

const money = (n) => `₡ ${Number(n).toLocaleString('es-CR')}`;

export default function FeedCostReport({ animals, weightRecords, feedPlans, feedAssignments, feedItems }) {
    const [dateFrom, setDateFrom] = useState('2026-01-01');
    const [dateTo, setDateTo] = useState(getTodayStr());
    const [groupBy, setGroupBy] = useState('lote');

    const report = useMemo(
        () => computeFeedCostReport(animals, weightRecords, feedPlans, feedAssignments, feedItems, dateFrom, dateTo, groupBy),
        [animals, weightRecords, feedPlans, feedAssignments, feedItems, dateFrom, dateTo, groupBy]
    );

    const handleExportPDF = () => window.print();

    return (
        <section className="list-container">
            {/* Filtros (no se imprimen) */}
            <div className="report-filters no-print">
                <div className="report-filter-field">
                    <label>Desde</label>
                    <input type="date" value={dateFrom} max={dateTo} onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div className="report-filter-field">
                    <label>Hasta</label>
                    <input type="date" value={dateTo} min={dateFrom} onChange={e => setDateTo(e.target.value)} />
                </div>
                <div className="report-filter-field">
                    <label>Agrupar por</label>
                    <div className="select-wrapper">
                        <select value={groupBy} onChange={e => setGroupBy(e.target.value)}>
                            {Object.keys(COST_GROUP_BY).map(k => (
                                <option key={k} value={k}>{COST_GROUP_BY[k]}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button className="btn btn-primary report-export-btn" onClick={handleExportPDF}>
                    Exportar PDF
                </button>
            </div>

            <div className="report-print-area">
                <div className="report-header">
                    <div>
                        <h1 className="report-title">{FINCA_NAME}</h1>
                        <p className="report-subtitle">Reporte de Costo de Alimentación y Costo por Kg Ganado (CKG)</p>
                    </div>
                    <div className="report-header-meta">
                        <p><strong>Período:</strong> {formatDate(dateFrom)} – {formatDate(dateTo)}</p>
                        <p><strong>Agrupado por:</strong> {COST_GROUP_BY[groupBy]}</p>
                        <p><strong>Generado:</strong> {formatDate(getTodayStr())}</p>
                    </div>
                </div>

                {report.rows.length === 0 ? (
                    <div className="empty-state">
                        <h2>Sin datos para el reporte</h2>
                        <p>No hay animales con planes activos ni pesajes en el período seleccionado.</p>
                    </div>
                ) : (
                    <>
                        {/* Resumen */}
                        <div className="report-summary-grid">
                            <div className="report-summary-card">
                                <span className="rs-value">{money(report.totalCost)}</span>
                                <span className="rs-label">Costo total de alimentación</span>
                            </div>
                            <div className="report-summary-card">
                                <span className="rs-value">{report.totalKg} kg</span>
                                <span className="rs-label">Kg ganados (total)</span>
                            </div>
                            <div className="report-summary-card highlight">
                                <span className="rs-value">{report.totalCkg !== null ? `${money(report.totalCkg)}/kg` : '—'}</span>
                                <span className="rs-label">CKG promedio del hato</span>
                            </div>
                            <div className="report-summary-card">
                                <span className="rs-value">{report.rows.length}</span>
                                <span className="rs-label">Animales en el reporte</span>
                            </div>
                        </div>

                        {/* Tablas agrupadas (criterio 2 y 3) */}
                        {report.groups.map(group => (
                            <div key={group.key} className="cost-group">
                                <div className="cost-group-head">
                                    <h3>{COST_GROUP_BY[groupBy]}: {group.key}</h3>
                                    <span className="cost-group-stats">
                                        {money(group.cost)} · {Math.round(group.kg * 10) / 10} kg ·
                                        {' '}<strong>CKG {group.ckg !== null ? `${money(group.ckg)}/kg` : '—'}</strong>
                                    </span>
                                </div>
                                <div className="table-wrapper">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Animal / Arete</th>
                                                <th>Plan activo</th>
                                                <th>Costo alimentación</th>
                                                <th>Kg ganados</th>
                                                <th>Costo por kg (CKG)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {group.rows.map(row => (
                                                <tr key={row.animal.id}>
                                                    <td>
                                                        <strong>{row.animal.id}</strong>
                                                        {row.animal.arete && <span className="muted-inline"> · {row.animal.arete}</span>}
                                                    </td>
                                                    <td>{row.plan ? row.plan.nombre : <span className="muted-inline">Sin plan</span>}</td>
                                                    <td>{money(row.cost)}</td>
                                                    <td>{row.kgGained !== null ? `${row.kgGained} kg` : <span className="muted-inline">Sin pesajes</span>}</td>
                                                    <td>
                                                        {row.ckg !== null
                                                            ? <strong>{money(row.ckg)}/kg</strong>
                                                            : <span className="muted-inline">No calculable</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}

                        {/* Detalle de insumos y precios unitarios (criterio 4 - respaldo de costos) */}
                        <div className="report-table-section">
                            <h3>Detalle de Insumos Utilizados (Respaldo de Costos)</h3>
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Insumo</th>
                                            <th>Cantidad utilizada</th>
                                            <th>Precio unitario</th>
                                            <th>Costo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.insumoDetail.map(d => (
                                            <tr key={d.id}>
                                                <td><strong>{d.nombre}</strong></td>
                                                <td>{d.kg} {d.unidad}</td>
                                                <td>{money(d.costoUnitario)}/{d.unidad}</td>
                                                <td><strong>{money(d.cost)}</strong></td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'right' }}><strong>Total</strong></td>
                                            <td><strong>{money(report.totalCost)}</strong></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
