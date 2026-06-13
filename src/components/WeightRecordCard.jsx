import { useState } from 'react';
import { CATEGORY_LABELS } from '../data/weightCategories.js';

// Umbral de referencia (kg/día) bajo el cual se marca rendimiento bajo
const LOW_GDP_THRESHOLD = 0.3;

export default function WeightRecordCard({ record, animal, onAddNote }) {
    const [noteText, setNoteText] = useState('');
    const [showNoteForm, setShowNoteForm] = useState(false);

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

    const getGdpInfo = () => {
        if (record.gdp === null || record.gdp === undefined) {
            return { className: 'gdp-first', text: 'Primer pesaje registrado', icon: '–' };
        }
        const formatted = `${record.gdp > 0 ? '+' : ''}${record.gdp.toFixed(3)} kg/día`;
        if (record.gdp < 0) {
            return { className: 'gdp-negative', text: `${formatted} — Pérdida de peso`, icon: '↓' };
        }
        if (record.gdp < LOW_GDP_THRESHOLD) {
            return { className: 'gdp-low', text: `${formatted} — Bajo rendimiento`, icon: '!' };
        }
        return { className: 'gdp-good', text: formatted, icon: '↑' };
    };

    const gdpInfo = getGdpInfo();

    return (
        <div className="health-record-card">
            <div className="record-header">
                <span className="treatment-badge badge-pesaje">
                    Pesaje · {CATEGORY_LABELS[record.categoria] || record.categoria}
                </span>
                <span className="record-date">{formatDate(record.fecha)}</span>
            </div>

            <div className="record-body">
                <div className="record-animal-info">
                    <h4>
                        Animal: <span className="animal-link">{record.animalId}</span>
                        {animal && animal.arete && <span className="record-arete-tag">Arete: {animal.arete}</span>}
                    </h4>
                    {animal && (
                        <p className="animal-meta">
                            {animal.especie.toUpperCase()} • {animal.raza || 'Sin raza'} • {animal.sexo}
                        </p>
                    )}
                </div>

                <div className="record-details-grid">
                    <div className="record-detail-item">
                        <span className="label">Peso Registrado</span>
                        <span className="value weight-value">{record.pesoKg} kg</span>
                    </div>
                    <div className="record-detail-item">
                        <span className="label">Condición Corporal</span>
                        <span className="value">
                            {record.condicionCorporal ? (
                                <>
                                    {record.condicionCorporal} / 5
                                    <span className="cc-dots">
                                        {' '}{'●'.repeat(record.condicionCorporal)}{'○'.repeat(5 - record.condicionCorporal)}
                                    </span>
                                </>
                            ) : (
                                <span className="muted-inline">No registrada</span>
                            )}
                        </span>
                    </div>
                    {record.pesoAnterior !== null && record.pesoAnterior !== undefined && (
                        <div className="record-detail-item full-width">
                            <span className="label">Pesaje Anterior</span>
                            <span className="value">
                                {record.pesoAnterior} kg el {formatDate(record.fechaPesajeAnterior)}
                            </span>
                        </div>
                    )}
                    {record.observaciones && (
                        <div className="record-detail-item full-width">
                            <span className="label">Observaciones</span>
                            <span className="value">{record.observaciones}</span>
                        </div>
                    )}
                </div>

                {/* Ganancia Diaria de Peso (GDP) */}
                <div className={`gdp-banner ${gdpInfo.className}`}>
                    <span className="icon">{gdpInfo.icon}</span>
                    <span>
                        Ganancia Diaria de Peso (GDP): <strong>{gdpInfo.text}</strong>
                    </span>
                </div>

                {/* Notas Aclaratorias (el registro es inalterable) */}
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
                        <p className="no-notes-text">No hay notas aclaratorias en este pesaje.</p>
                    )}

                    {showNoteForm ? (
                        <form onSubmit={handleNoteSubmit} className="inline-note-form">
                            <textarea
                                required
                                rows="2"
                                placeholder="Escriba una nota aclaratoria sobre este pesaje..."
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
                            Agregar nota aclaratoria
                        </button>
                    )}
                </div>
            </div>

            <div className="record-footer">
                <span className="confirmed-pill">Registro inalterable</span>
                <span className="record-id-tag">{record.id}</span>
            </div>
        </div>
    );
}
