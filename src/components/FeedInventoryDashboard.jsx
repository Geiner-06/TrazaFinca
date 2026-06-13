import { FEED_TYPES, COVERAGE_ALERT_DAYS } from '../data/feedInventory.js';

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
};

export default function FeedInventoryDashboard({ items, entries = [], onAddItem, onAddEntry }) {
    const lowItems = items.filter(i => i.low);
    const totalGasto = entries.reduce((s, e) => s + (e.costoTotal || 0), 0);

    return (
        <div className="feed-inventory">
            <div className="toolbar-title">
                <h1>Inventario de Insumos de Alimentación</h1>
                <span className="badge">{items.length} insumos</span>
                <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={onAddItem}>
                    + Registrar Insumo
                </button>
            </div>

            {/* Alerta de cobertura < 7 días (criterio 3) */}
            {lowItems.length > 0 && (
                <div className="feed-coverage-alert">
                    <strong>{lowItems.length} insumo(s) con menos de {COVERAGE_ALERT_DAYS} días de stock:</strong>
                    {' '}
                    {lowItems.map((i, idx) => (
                        <span key={i.id}>
                            {i.nombre} ({i.daysCoverage} d){idx < lowItems.length - 1 ? ', ' : ''}
                        </span>
                    ))}
                </div>
            )}

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Insumo</th>
                            <th>Tipo</th>
                            <th>Stock</th>
                            <th>Consumo diario</th>
                            <th>Cobertura</th>
                            <th>Proveedor</th>
                            <th>Ingreso</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} className={item.low ? 'row-below-threshold' : ''}>
                                <td><strong>{item.nombre}</strong></td>
                                <td>{FEED_TYPES[item.tipo] || item.tipo}</td>
                                <td>{item.cantidad} {item.unidad}</td>
                                <td>
                                    {item.dailyConsumption > 0
                                        ? `${item.dailyConsumption} ${item.unidad}/día`
                                        : <span className="muted-inline">Sin consumo</span>}
                                </td>
                                <td>
                                    {item.daysCoverage === null ? (
                                        <span className="muted-inline">—</span>
                                    ) : item.low ? (
                                        <span className="status-below">● {item.daysCoverage} días</span>
                                    ) : (
                                        <span className="status-ok">● {item.daysCoverage} días</span>
                                    )}
                                </td>
                                <td>{item.proveedor}</td>
                                <td>{formatDate(item.fechaIngreso)}</td>
                                <td>
                                    <button className="btn btn-outline btn-sm" onClick={() => onAddEntry(item)}>
                                        + Entrada
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Ledger de entradas / control de gasto (criterio 4) */}
            <div className="toolbar-title" style={{ marginTop: '30px' }}>
                <h1>Entradas de Stock (Control de Gasto)</h1>
                <span className="badge">Gasto total: ₡ {totalGasto.toLocaleString('es-CR')}</span>
            </div>

            {entries.length > 0 ? (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Insumo</th>
                                <th>Cantidad</th>
                                <th>Costo unitario</th>
                                <th>Costo total</th>
                                <th>Proveedor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...entries].sort((a, b) => b.fecha.localeCompare(a.fecha)).map(e => {
                                const item = items.find(i => i.id === e.feedItemId);
                                return (
                                    <tr key={e.id}>
                                        <td>{formatDate(e.fecha)}</td>
                                        <td>{item ? item.nombre : e.feedItemId}</td>
                                        <td>{e.cantidad} {item ? item.unidad : ''}</td>
                                        <td>₡ {e.costoUnitario.toLocaleString('es-CR')}</td>
                                        <td><strong>₡ {e.costoTotal.toLocaleString('es-CR')}</strong></td>
                                        <td>{e.proveedor}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="no-records-placeholder">No hay entradas de stock registradas.</p>
            )}
        </div>
    );
}
