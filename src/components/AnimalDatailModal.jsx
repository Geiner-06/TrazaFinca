import { useState } from 'react';
import "../App.css"
import { SEED_DIAGNOSES } from '../data/seed';
import DiagnosisCard from './DiagnosisCard';
import { FEED_PURPOSES, formatFeedDate } from '../data/feedConstants.js';
import { projectTargetDate } from '../data/growthProjection.js';

export default function AnimalDetailModal({
    animal,
    onClose,
    onEdit,
    onBaja,
    healthRecords = [],
    onAddHealthRecord,
    onAddNoteToRecord,
    diagnoses = SEED_DIAGNOSES,
    feedPlans = [],
    feedAssignments = [],
    potreros = [],
    potreroAssignments = [],
    onReassignPotrero,
    onAssignFeedPlan,
    animalWeightRecords = [],
    weightTarget = null,
    onSetWeightTarget
}) {
    const [activeNoteRecordId, setActiveNoteRecordId] = useState(null);
    const [newNoteText, setNewNoteText] = useState('');

    // Fecha de referencia para el prototipo
    const TODAY_STR = '2026-06-09';

    if (!animal) return null;

    const specClass = `species-${animal.especie.replace(/\s+/g, '.')}`;
    // 1. Filtrar y ordenar historial (Cronológico Descendente - HU-09 Criterio 1)
    const animalRecords = healthRecords
        .filter(r => r.animalId === animal.id)
        .sort((a, b) => new Date(b.fechaAplicacion) - new Date(a.fechaAplicacion));

    // 2. Calcular Período de Retiro (HU-09 Criterio 3 y 4)
    const getWithdrawalStatus = () => {
        // Buscamos el tratamiento más reciente que tenga periodo de retiro
        const lastWithRetiro = animalRecords.find(r => r.periodoRetiro && r.periodoRetiro > 0);
        if (!lastWithRetiro) return null;

        const appDate = new Date(lastWithRetiro.fechaAplicacion.replace(/-/g, '/'));
        const expiryDate = new Date(appDate);
        expiryDate.setDate(appDate.getDate() + lastWithRetiro.periodoRetiro);

        const todayDate = new Date(TODAY_STR.replace(/-/g, '/'));

        if (expiryDate > todayDate) {
            const diffDays = Math.ceil((expiryDate - todayDate) / (1000 * 60 * 60 * 24));
            return {
                expiryDate: expiryDate.toISOString().split('T')[0],
                daysLeft: diffDays,
                product: lastWithRetiro.productoComercial
            };
        }
        return null;
    };

    const withdrawal = getWithdrawalStatus();

    // Plan de alimentación: activo + historial archivado (Milestone 3, criterio 5)
    const activeAssignment = feedAssignments.find(as => as.estado === 'activo');
    const activePlan = activeAssignment ? feedPlans.find(p => p.id === activeAssignment.planId) : null;
    const archivedAssignments = feedAssignments
        .filter(as => as.estado === 'archivado')
        .sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));

    // Proyección de peso objetivo (Milestone 3, criterios 3 y 4)
    const projection = projectTargetDate(animalWeightRecords, weightTarget ? weightTarget.value : null);

    // Potrero Actual (HU-23)
    const activePotreroAssignment = potreroAssignments.find(a => a.animalId === animal.id && a.fechaSalida === null);
    const activePotrero = activePotreroAssignment ? potreros.find(p => p.id === activePotreroAssignment.potreroId) : null;

    const formatDate = (dateString) => {
        if (!dateString) return "No registrada";
        const parts = dateString.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateString;
    };

    // HU-09 Criterio 5: Exportación PDF (Simulada)
    const handleExportPDF = () => {
        alert(`Generando Reporte Sanitario Oficial...\nFinca: Hacienda TrazaFinca\nAnimal: ${animal.id}\nArete: ${animal.arete || 'S/A'}\nFecha: ${formatDate(TODAY_STR)}`);
        window.print();
    };

    const getTreatmentBadgeClass = (type) => {
        switch (type) {
            case 'vacuna': return 'badge-vacuna';
            case 'desparasitacion_interna': return 'badge-desparasitacion-int';
            case 'desparasitacion_externa': return 'badge-desparasitacion-ext';
            case 'vitamina_mineral': return 'badge-vitamina';
            default: return 'badge-default';
        }
    };

    const getTreatmentLabel = (type) => {
        switch (type) {
            case 'vacuna': return 'Vacuna';
            case 'desparasitacion_interna': return 'Desparasitación Interna';
            case 'desparasitacion_externa': return 'Desparasitación Externa';
            case 'vitamina_mineral': return 'Vitamina / Mineral';
            default: return type;
        }
    };

    const submitNote = (recordId) => {
        if (!newNoteText.trim()) return;
        onAddNoteToRecord(recordId, newNoteText.trim());
        setNewNoteText('');
        setActiveNoteRecordId(null);
    };

    return (
        <div className="modal-overlay open">
            <div className="modal-card detail-card" style={{ maxWidth: '750px' }}>
                <div className="modal-header">
                    <h2>Ficha Clínica Completa</h2>
                    <div className="detail-header-actions">
                        <button className="btn btn-secondary btn-sm" onClick={handleExportPDF}>
                            Exportar Reporte
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => onEdit(animal)}>
                            Editar Datos
                        </button>
                    </div>
                </div>

                <div className="detail-content scrollable-history">
                    {/* ADVERTENCIA DE RETIRO (HU-09 Criterio 4) */}
                    {withdrawal && (
                        <div className="withdrawal-banner">
                            <div className="withdrawal-banner-header">
                                <span>Restricción sanitaria activa </span>
                                <span className="badge-bloqueado">BLOQUEADO</span>
                            </div>
                            <div className="withdrawal-banner-body">
                                <p>
                                    Prohibido el sacrificio o consumo humano. Animal en período de retiro
                                    por tratamiento con <strong>{withdrawal.product}</strong>.
                                </p>
                                <div className="withdrawal-apt-date">
                                    <span>Apto para consumo el:</span>
                                    <strong>{formatDate(withdrawal.expiryDate)} — {withdrawal.daysLeft} días restantes</strong>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="detail-profile-banner">
                        <div className="detail-profile-info">
                            <h3>
                                {animal.id}
                                <span className="card-tag" style={{ marginLeft: '10px' }}>
                                    {animal.arete ? `Arete: ${animal.arete}` : 'Sin Arete'}
                                </span>
                            </h3>
                            <div className="detail-spec">
                                <span className={`species-badge ${specClass}`}>{animal.especie}</span>
                                <span>•</span>
                                <span style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {animal.proposito}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-grid">
                        <div className="detail-item">
                            <span className="label">Raza</span>
                            <span className="value">{animal.raza || 'No especificada'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Sexo</span>
                            <span className="value">{animal.sexo}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Ingreso/Nacimiento</span>
                            <span className="value">{formatDate(animal.fecha)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Dueño / Finca</span>
                            <span className="value">{animal.dueño || 'Hacienda General'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Lote</span>
                            <span className="value">{animal.lote || 'Sin Lote'}</span>
                        </div>
                        <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                            <span className="label">Potrero Actual</span>
                            <div className="value" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {activePotrero ? (
                                    <>
                                        <strong>{activePotrero.nombre}</strong>
                                        <span style={{ fontSize: '0.85rem', color: '#666' }}>(Ingreso: {formatDate(activePotreroAssignment.fechaIngreso)})</span>
                                    </>
                                ) : (
                                    <span>Sin potrero asignado</span>
                                )}
                                {animal.estado === 'activo' && onReassignPotrero && (
                                    <button className="btn btn-outline btn-sm" onClick={() => onReassignPotrero(animal.id)}>
                                        Reasignar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Plan de Alimentación (Milestone 3) */}
                    <div className="detail-health-section" style={{ marginTop: '30px' }}>
                        <div className="detail-health-header">
                            <h3>Plan de Alimentación</h3>
                            {animal.estado === 'activo' && onAssignFeedPlan && (
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => onAssignFeedPlan(animal.id)}
                                >
                                    {activePlan ? 'Cambiar Plan' : '+ Asignar Plan'}
                                </button>
                            )}
                        </div>

                        {activePlan ? (
                            <div className="active-feed-plan">
                                <div className="active-feed-plan-head">
                                    <span className={`feed-purpose-badge feed-purpose-${activePlan.proposito}`}>
                                        {activePlan.nombre}
                                    </span>
                                    <span className="feed-active-pill">● Activo</span>
                                </div>
                                <div className="active-feed-plan-meta">
                                    <span><strong>Propósito:</strong> {FEED_PURPOSES[activePlan.proposito] || activePlan.proposito}</span>
                                    <span><strong>Inicio:</strong> {formatFeedDate(activeAssignment.fechaInicio)}</span>
                                    <span><strong>Asignado por:</strong> {activeAssignment.responsable}</span>
                                </div>
                                <div className="active-feed-nutrition">
                                    <span>Proteína: <strong>{activePlan.proteina}%</strong></span>
                                    <span>Energía: <strong>{activePlan.energia} Mcal/kg</strong></span>
                                    <span>Fibra: <strong>{activePlan.fibra}%</strong></span>
                                </div>
                                <p className="active-feed-ration">
                                    <strong>Ración:</strong> {activePlan.cantidadDiaria} {activePlan.unidad}/día · {activePlan.frecuencia}
                                </p>
                                <p className="active-feed-ingredients">
                                    <strong>Insumos:</strong> {activePlan.ingredientes}
                                </p>

                                {archivedAssignments.length > 0 && (
                                    <div className="feed-history">
                                        <h5>Planes anteriores ({archivedAssignments.length})</h5>
                                        {archivedAssignments.map(as => {
                                            const plan = feedPlans.find(p => p.id === as.planId);
                                            return (
                                                <div key={as.id} className="feed-history-item">
                                                    <span>{plan ? plan.nombre : 'Plan eliminado'}</span>
                                                    <span className="feed-history-dates">
                                                        {formatFeedDate(as.fechaInicio)} → {formatFeedDate(as.fechaCierre)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="no-records-placeholder">Este animal no tiene un plan de alimentación asignado.</p>
                        )}
                    </div>

                    {/* Proyección de Peso Objetivo (Milestone 3) */}
                    <div className="detail-health-section" style={{ marginTop: '30px' }}>
                        <div className="detail-health-header">
                            <h3>Proyección de Peso Objetivo</h3>
                            {animal.estado === 'activo' && onSetWeightTarget && (
                                <button className="btn btn-primary btn-sm" onClick={() => onSetWeightTarget(animal.id)}>
                                    {weightTarget ? 'Editar Objetivo' : '+ Definir Objetivo'}
                                </button>
                            )}
                        </div>

                        {projection.status === 'sin_datos' ? (
                            <p className="no-records-placeholder">Este animal no tiene pesajes registrados.</p>
                        ) : projection.status === 'sin_objetivo' ? (
                            <p className="no-records-placeholder">
                                Defina un peso objetivo para calcular la fecha estimada de alcance.
                                {' '}Peso actual: <strong>{projection.currentWeight} kg</strong>.
                            </p>
                        ) : projection.status === 'pocos_pesajes' ? (
                            <p className="no-records-placeholder">
                                Se requieren al menos 2 pesajes para proyectar. Peso actual: <strong>{projection.currentWeight} kg</strong>,
                                objetivo: <strong>{weightTarget.value} kg</strong>.
                            </p>
                        ) : projection.status === 'no_calculable' ? (
                            <div className="projection-box no-calculable">
                                <div className="projection-grid">
                                    <div><span className="pj-label">Peso actual</span><span className="pj-value">{projection.currentWeight} kg</span></div>
                                    <div><span className="pj-label">Peso objetivo</span><span className="pj-value">{projection.target} kg</span></div>
                                    <div><span className="pj-label">GDP promedio</span><span className="pj-value below">{projection.avgGdp} kg/d</span></div>
                                </div>
                                <p className="projection-warning">
                                    Proyección no calculable: la GDP promedio de los últimos {projection.nPesajes} pesajes es cero o negativa.
                                    Se recomienda <strong>revisar el plan de alimentación</strong> del animal.
                                </p>
                            </div>
                        ) : projection.status === 'alcanzado' ? (
                            <div className="projection-box reached">
                                <div className="projection-grid">
                                    <div><span className="pj-label">Peso actual</span><span className="pj-value">{projection.currentWeight} kg</span></div>
                                    <div><span className="pj-label">Peso objetivo</span><span className="pj-value">{projection.target} kg</span></div>
                                    <div><span className="pj-label">GDP promedio</span><span className="pj-value">{projection.avgGdp} kg/d</span></div>
                                </div>
                                <p className="projection-reached-msg">✓ El animal ya alcanzó o superó su peso objetivo.</p>
                            </div>
                        ) : (
                            <div className="projection-box ok">
                                <div className="projection-grid">
                                    <div><span className="pj-label">Peso actual</span><span className="pj-value">{projection.currentWeight} kg</span></div>
                                    <div><span className="pj-label">Peso objetivo</span><span className="pj-value">{projection.target} kg</span></div>
                                    <div><span className="pj-label">GDP promedio ({projection.nPesajes} pesajes)</span><span className="pj-value">{projection.avgGdp} kg/d</span></div>
                                    <div><span className="pj-label">Fecha estimada de alcance</span><span className="pj-value highlight">{formatFeedDate(projection.estimatedDate)}</span></div>
                                </div>
                                <p className="projection-note">
                                    Faltan ~{projection.daysToTarget} días{weightTarget.scope === 'lote' && ' · objetivo definido a nivel de lote'}.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Historial Sanitario (HU-09) */}
                    <div className="detail-health-section">
                        <div className="detail-health-header">
                            <h3>Historial Sanitario (Inalterable)</h3>
                            {animal.estado === 'activo' && (
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => onAddHealthRecord(animal.id)}
                                >
                                    + Registrar Tratamiento
                                </button>
                            )}
                        </div>

                        {animalRecords.length > 0 ? (
                            <div className="detail-records-list">
                                {animalRecords.map(record => (
                                    <div key={record.id} className="detail-record-item">
                                        <div className="detail-record-row-main">
                                            <span className={`treatment-badge badge-sm ${getTreatmentBadgeClass(record.tipoTratamiento)}`}>
                                                {getTreatmentLabel(record.tipoTratamiento)}
                                            </span>
                                            <span className="detail-record-date">Aplicación: {formatDate(record.fechaAplicacion)}</span>
                                        </div>
                                        <div className="detail-record-row-details">
                                            <p><strong>Producto:</strong> {record.productoComercial} (Lote: {record.lote})</p>
                                            <p><strong>Dosis:</strong> {record.dosis} | <strong>Vía:</strong> {record.viaAdministracion}</p>
                                            <p><strong>Responsable:</strong> {record.veterinario}</p>

                                            {record.periodoRetiro && (
                                                <p className={`retiro-info-text ${withdrawal && withdrawal.product === record.productoComercial ? 'active-retiro' : ''}`}>
                                                    Período de retiro: <strong>{record.periodoRetiro} días</strong>
                                                </p>
                                            )}

                                            {record.fechaProxima && (
                                                <p className="next-date-hint">Próxima dosis: <strong>{formatDate(record.fechaProxima)}</strong></p>
                                            )}
                                        </div>

                                        <div className="detail-record-notes">
                                            {record.notas && record.notas.length > 0 && (
                                                <div className="detail-record-notes-list">
                                                    {record.notas.map(note => (
                                                        <div key={note.id} className="detail-note-bubble">
                                                            <p className="note-bubble-text"><strong>Obs:</strong> {note.texto}</p>
                                                            <span className="note-bubble-date">{formatDate(note.fecha)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {activeNoteRecordId === record.id ? (
                                                <div className="detail-note-input-row">
                                                    <input
                                                        type="text"
                                                        placeholder="Agregar nota..."
                                                        value={newNoteText}
                                                        onChange={e => setNewNoteText(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <button className="btn btn-primary btn-sm" onClick={() => submitNote(record.id)}>Guardar</button>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveNoteRecordId(null)}>x</button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="btn-link-note"
                                                    onClick={() => {
                                                        setActiveNoteRecordId(record.id);
                                                        setNewNoteText('');
                                                    }}
                                                >
                                                    Agregar nota aclaratoria
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-records-placeholder">Sin antecedentes sanitarios registrados.</p>
                        )}
                    </div>
                    <div className="detail-health-section" style={{ marginTop: '30px' }}>
                        <h3>Morbilidad y Diagnósticos</h3>
                        {diagnoses.filter(d => d.animalId === animal.id).length > 0 ? (
                            <div className="health-records-grid" style={{ gridTemplateColumns: '1fr' }}>
                                {diagnoses.filter(d => d.animalId === animal.id).map(dx => (
                                    <DiagnosisCard key={dx.id} diagnosis={dx} animal={animal} />
                                ))}
                            </div>
                        ) : (
                            <p className="no-records-placeholder">No se registran enfermedades previas.</p>
                        )}
                    </div>
                </div>

                <div className="detail-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                    {animal.estado === 'activo' && (
                        <button className="btn btn-danger" onClick={() => onBaja(animal.id)}>
                            Dar de Baja
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}