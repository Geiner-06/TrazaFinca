import { useState } from 'react';

export default function AnimalDetailModal({
    animal,
    onClose,
    onEdit,
    onBaja,
    healthRecords = [],
    onAddHealthRecord,
    onAddNoteToRecord
}) {
    const [activeNoteRecordId, setActiveNoteRecordId] = useState(null);
    const [newNoteText, setNewNoteText] = useState('');

    if (!animal) return null;

    const specClass = `species-${animal.especie.replace(/\s+/g, '.')}`;

    const formatDate = (dateString) => {
        if (!dateString) return "No registrada";
        const parts = dateString.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateString;
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

    const animalRecords = healthRecords.filter(r => r.animalId === animal.id);

    return (
        <div className="modal-overlay open">
            <div className="modal-card detail-card">
                <div className="modal-header">
                    <h2>Ficha del Animal</h2>
                    <div className="detail-header-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => onEdit(animal)}>
                            Editar
                        </button>
                    </div>
                </div>

                <div className="detail-content">
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

                    {/* Panel de alerta si es baja (HU-03 Criterio 2) */}
                    {animal.estado === 'baja' && (
                        <div className="baja-alert-panel">
                            <h4>⚠️ Animal Dado de Baja</h4>
                            <p><strong>Motivo:</strong> {animal.bajaMotivo}</p>
                            {animal.bajaComentarios && <p><strong>Detalle:</strong> {animal.bajaComentarios}</p>}
                            <span className="baja-meta">Fecha de baja: {formatDate(animal.bajaFecha)}</span>
                        </div>
                    )}

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
                            <span className="label">Fecha Ingreso/Nacimiento</span>
                            <span className="value">{formatDate(animal.fecha)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Finca / Dueño Asociado</span>
                            <span className="value">{animal.dueño || 'Hacienda General'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Estado de Ficha</span>
                            <span className="value">
                                <span className={`status-pill ${animal.estado === 'activo' ? 'active' : 'baja'}`}>
                                    {animal.estado === 'activo' ? 'Activo' : 'De Baja'}
                                </span>
                            </span>
                        </div>
                    </div>

                    {/* Historial Sanitario (HU-07) */}
                    <div className="detail-health-section">
                        <div className="detail-health-header">
                            <h3>Historial Sanitario</h3>
                            {animal.estado === 'activo' && (
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => onAddHealthRecord(animal.id)}
                                >
                                    💉 Registrar Tratamiento
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
                                            <span className="detail-record-date">📅 {formatDate(record.fechaAplicacion)}</span>
                                        </div>
                                        <div className="detail-record-row-details">
                                            <p><strong>Producto:</strong> {record.productoComercial} (Lote: {record.lote})</p>
                                            <p><strong>Dosis / Vía:</strong> {record.dosis} - {record.viaAdministracion}</p>
                                            <p><strong>Responsable:</strong> {record.veterinario}</p>
                                            {record.fechaProxima && (
                                                <p className="next-date-hint">⏳ Próxima Dosis: <strong>{formatDate(record.fechaProxima)}</strong></p>
                                            )}
                                        </div>

                                        {/* Notes list and input */}
                                        <div className="detail-record-notes">
                                            {record.notas && record.notas.length > 0 && (
                                                <div className="detail-record-notes-list">
                                                    {record.notas.map(note => (
                                                        <div key={note.id} className="detail-note-bubble">
                                                            <p className="note-bubble-text">{note.texto}</p>
                                                            <span className="note-bubble-date">({formatDate(note.fecha)})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {activeNoteRecordId === record.id ? (
                                                <div className="detail-note-input-row">
                                                    <input
                                                        type="text"
                                                        placeholder="Agregar nota aclaratoria..."
                                                        value={newNoteText}
                                                        onChange={e => setNewNoteText(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                submitNote(record.id);
                                                            }
                                                        }}
                                                    />
                                                    <button className="btn btn-primary btn-sm" onClick={() => submitNote(record.id)}>Agregar</button>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveNoteRecordId(null)}>Cancelar</button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="btn-link-note"
                                                    onClick={() => {
                                                        setActiveNoteRecordId(record.id);
                                                        setNewNoteText('');
                                                    }}
                                                >
                                                    📝 Agregar Nota Aclaratoria
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-records-placeholder">No hay tratamientos sanitarios registrados para este animal.</p>
                        )}
                    </div>
                </div>

                <div className="detail-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                    {/* Solo mostrar botón de baja si está activo (HU-06) */}
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