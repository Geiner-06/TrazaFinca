const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
};

export default function BatchWeightSummaryModal({ isOpen, onClose, summary, animals }) {
    if (!isOpen || !summary) return null;

    const delta = summary.prevAvg !== null && summary.prevAvg !== undefined
        ? summary.avgWeight - summary.prevAvg
        : null;
    const deltaPct = delta !== null && summary.prevAvg
        ? (delta / summary.prevAvg) * 100
        : null;

    const pendingAnimals = summary.pendingIds.map(id => animals.find(a => a.id === id)).filter(Boolean);

    return (
        <div className="modal-overlay open">
            <div className="modal-card" style={{ maxWidth: '620px' }}>
                <div className="modal-header">
                    <h2>Resumen de la sesión de pesaje</h2>
                    <button type="button" aria-label="Cerrar" className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    <p className="batch-summary-scope">
                        {summary.scope === 'lote' ? 'Lote' : 'Potrero'}: <strong>{summary.scopeValue}</strong>
                        {' · '}Fecha: <strong>{formatDate(summary.fecha)}</strong>
                    </p>

                    <div className="batch-summary-grid">
                        <div className="batch-summary-card">
                            <span className="bs-value">{summary.count}</span>
                            <span className="bs-label">Animales pesados</span>
                        </div>
                        <div className="batch-summary-card">
                            <span className="bs-value">{summary.avgWeight.toFixed(1)} kg</span>
                            <span className="bs-label">Peso promedio del grupo</span>
                        </div>
                        <div className="batch-summary-card">
                            <span className="bs-value">{summary.pendingIds.length}</span>
                            <span className="bs-label">Pendientes</span>
                        </div>
                    </div>

                    {/* Comparación con la sesión anterior (criterio 3) */}
                    <div className="batch-comparison">
                        <h4>Comparación con sesión anterior</h4>
                        {delta === null ? (
                            <p className="batch-comparison-empty">
                                Esta es la primera sesión de pesaje registrada para este lote.
                            </p>
                        ) : (
                            <p className={`batch-comparison-result ${delta >= 0 ? 'positive' : 'negative'}`}>
                                {delta >= 0 ? '↑' : '↓'} {delta >= 0 ? '+' : ''}{delta.toFixed(1)} kg
                                {deltaPct !== null && <> ({deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}%)</>}
                                {' '}respecto a la sesión del <strong>{formatDate(summary.prevFecha)}</strong>
                                {' '}(promedio anterior: {summary.prevAvg.toFixed(1)} kg)
                            </p>
                        )}
                    </div>

                    {/* Animales pendientes (criterio 4) */}
                    {pendingAnimals.length > 0 && (
                        <div className="batch-pending">
                            <h4>Animales pendientes de pesaje ({pendingAnimals.length})</h4>
                            <div className="batch-pending-list">
                                {pendingAnimals.map(a => (
                                    <span key={a.id} className="batch-pending-pill">
                                        {a.id} {a.arete ? `· ${a.arete}` : ''}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-primary" onClick={onClose}>Entendido</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
