import { LEVEL_META, ACTION_TYPES } from '../data/growthAlerts.js';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
};

function AlertCard({ alert, actions, onRegisterAction }) {
    const animalActions = actions.filter(ac => ac.animalId === alert.animalId);
    const atendida = animalActions.length > 0;

    return (
        <div className={`lowgain-card nivel-${alert.nivel} ${atendida ? 'atendida' : ''}`}>
            <div className="lowgain-card-head">
                <div>
                    <span className="lowgain-arete">{alert.arete || alert.animalId}</span>
                    <span className="lowgain-animal-id">{alert.animalId}</span>
                </div>
                <span className={`lowgain-level-badge nivel-${alert.nivel}`}>
                    {LEVEL_META[alert.nivel].icon} {LEVEL_META[alert.nivel].label}
                </span>
            </div>

            <p className="lowgain-meta">
                {alert.categoriaLabel} · {alert.proposito}
                {alert.lote && <> · {alert.lote}</>}
            </p>

            <div className="lowgain-gdp-grid">
                <div className="lowgain-gdp-item">
                    <span className="lg-value below">{alert.currentGdp.toFixed(3)}</span>
                    <span className="lg-label">GDP actual (kg/d)</span>
                </div>
                <div className="lowgain-gdp-item">
                    <span className="lg-value">{alert.expectedGdp.toFixed(2)}</span>
                    <span className="lg-label">GDP esperada (kg/d)</span>
                </div>
                <div className="lowgain-gdp-item">
                    <span className="lg-value below">-{alert.diffPct}%</span>
                    <span className="lg-label">Diferencia</span>
                </div>
            </div>

            <p className="lowgain-plan">
                Plan activo: <strong>{alert.planNombre || 'Sin plan asignado'}</strong>
            </p>

            {atendida && (
                <div className="lowgain-actions-log">
                    <h5>Acciones correctivas ({animalActions.length})</h5>
                    {animalActions.map(ac => (
                        <div key={ac.id} className="lowgain-action-item">
                            <span className="lg-action-type">{ACTION_TYPES[ac.tipo] || ac.tipo}</span>
                            <p className="lg-action-desc">{ac.descripcion}</p>
                            <span className="lg-action-meta">{ac.responsable} · {formatDate(ac.fecha)}</span>
                        </div>
                    ))}
                </div>
            )}

            <button className="btn btn-outline btn-sm lowgain-action-btn" onClick={() => onRegisterAction(alert)}>
                {atendida ? '+ Agregar otra acción' : 'Registrar acción correctiva'}
            </button>
        </div>
    );
}

export default function LowGainAlerts({ alerts, actions = [], onRegisterAction }) {
    const groups = { critico: [], moderado: [], leve: [] };
    alerts.forEach(a => groups[a.nivel].push(a));

    const orderedLevels = Object.keys(groups).sort((a, b) => LEVEL_META[a].order - LEVEL_META[b].order);

    return (
        <div className="lowgain-dashboard">
            <div className="lowgain-header">
                <h2>Alertas de Bajo Rendimiento (GDP)</h2>
                <span className="badge">{alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}</span>
            </div>

            {alerts.length === 0 ? (
                <div className="lowgain-empty">
                    Ningún animal presenta ganancia de peso por debajo del umbral esperado.
                </div>
            ) : (
                orderedLevels.map(level => (
                    groups[level].length > 0 && (
                        <div key={level} className="lowgain-group">
                            <h3 className={`lowgain-group-title nivel-${level}`}>
                                {LEVEL_META[level].icon} Nivel {LEVEL_META[level].label}
                                <span className="lowgain-group-count">{groups[level].length}</span>
                            </h3>
                            <div className="lowgain-grid">
                                {groups[level].map(alert => (
                                    <AlertCard
                                        key={alert.animalId}
                                        alert={alert}
                                        actions={actions}
                                        onRegisterAction={onRegisterAction}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                ))
            )}
        </div>
    );
}
