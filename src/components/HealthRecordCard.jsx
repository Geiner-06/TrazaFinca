import { useState } from 'react';

export default function HealthRecordCard({ record, animal, onAddNote }) {
    const [noteText, setNoteText] = useState('');
    const [showNoteForm, setShowNoteForm] = useState(false);

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

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
    };

    const handleNoteSubmit = (e) => {
        e.preventDefault();
        if (!noteText.trim()) return;
        onAddNote(noteText.trim());
        setNoteText('');
        setShowNoteForm(false);
    };

    return (
        <div className="health-record-card">
            <div className="record-header">
                <span className={`treatment-badge ${getTreatmentBadgeClass(record.tipoTratamiento)}`}>
                    {getTreatmentLabel(record.tipoTratamiento)}
                </span>
                <span className="record-date">📅 {formatDate(record.fechaAplicacion)}</span>
            </div>

            <div className="record-body">
                <div className="record-animal-info">
                    <h4>
                        Animal: <span className="animal-link">{record.animalId}</span>
                        {animal && animal.arete && <span className="record-arete-tag">🏷️ Arete: {animal.arete}</span>}
                    </h4>
                    {animal && (
                        <p className="animal-meta">
                            {animal.especie.toUpperCase()} • {animal.raza || 'Sin raza'} • {animal.sexo}
                        </p>
                    )}
                </div>

                <div className="record-details-grid">
                    <div className="record-detail-item">
                        <span className="label">Producto</span>
                        <span className="value">{record.productoComercial}</span>
                    </div>
                    <div className="record-detail-item">
                        <span className="label">Lote</span>
                        <span className="value code-font">{record.lote}</span>
                    </div>
                    <div className="record-detail-item">
                        <span className="label">Dosis</span>
                        <span className="value">{record.dosis}</span>
                    </div>
                    <div className="record-detail-item">
                        <span className="label">Vía</span>
                        <span className="value">{record.viaAdministracion}</span>
                    </div>
                    <div className="record-detail-item full-width">
                        <span className="label">Veterinario Responsable</span>
                        <span className="value">{record.veterinario}</span>
                    </div>
                </div>

                {record.fechaProxima && (
                    <div className="next-dose-banner">
                        <span className="icon">⏳</span>
                        <span>
                            Próxima dosis recomendada: <strong>{formatDate(record.fechaProxima)}</strong>
                            {record.periodoRevacunacion && ` (cada ${record.periodoRevacunacion} días)`}
                        </span>
                    </div>
                )}

                {/* Clarification Notes Section */}
                <div className="record-notes-section">
                    <h5>Notas Aclaratorias ({record.notas ? record.notas.length : 0})</h5>
                    {record.notas && record.notas.length > 0 ? (
                        <div className="notes-list">
                            {record.notas.map(note => (
                                <div key={note.id} className="note-item">
                                    <p className="note-text">{note.texto}</p>
                                    <span className="note-date">Añadida el {formatDate(note.fecha)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-notes-text">No hay notas aclaratorias en este registro.</p>
                    )}

                    {showNoteForm ? (
                        <form onSubmit={handleNoteSubmit} className="inline-note-form">
                            <textarea
                                required
                                rows="2"
                                placeholder="Escriba una nota aclaratoria sobre este tratamiento..."
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                            />
                            <div className="inline-note-actions">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowNoteForm(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary btn-sm">
                                    Guardar Nota
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button className="btn btn-outline btn-sm add-note-trigger" onClick={() => setShowNoteForm(true)}>
                            📝 Agregar Nota Aclaratoria
                        </button>
                    )}
                </div>
            </div>

            <div className="record-footer">
                <span className="confirmed-pill">✔️ Registro Confirmado (SENASA)</span>
                <span className="record-id-tag">{record.id}</span>
            </div>
        </div>
    );
}
