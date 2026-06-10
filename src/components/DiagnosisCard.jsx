import React from 'react';

export default function DiagnosisCard({ diagnosis, animal }) {

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
    };

    return (
        <div className={`health-record-card diagnosis-item-card ${diagnosis.estado}`}>
            <div className="record-header">
                {/* Etiqueta de estado del caso (HU-10) */}
                <span className={`status-pill ${diagnosis.estado === 'activo' ? 'baja' : 'active'}`}>
                    {diagnosis.estado === 'activo' ? '🔴 Caso Activo' : '🟢 Resuelto'}
                </span>
                <span className="record-date">📅 {formatDate(diagnosis.fecha)}</span>
            </div>

            <div className="record-body">
                <div className="record-animal-info">
                    <h4>
                        Animal: <span className="animal-link">{diagnosis.animalId}</span>
                        {animal && animal.arete && <span className="record-arete-tag">🏷️ Arete: {animal.arete}</span>}
                    </h4>
                    {/* Título de la enfermedad */}
                    <h3 className="diagnosis-name-display">{diagnosis.diagnostico}</h3>
                </div>

                {/* Advertencia SENASA si es notificable */}
                {diagnosis.esNotificable && (
                    <div className="senasa-notification-box" style={{ margin: '10px 0', padding: '10px' }}>
                        <strong>⚠️ NOTIFICACIÓN OBLIGATORIA</strong>
                        <p style={{ fontSize: '0.75rem', margin: 0 }}>Este caso requiere reporte inmediato a las autoridades.</p>
                    </div>
                )}

                <div className="record-details-grid">
                    <div className="record-detail-item full-width">
                        <span className="label">Síntomas Observados</span>
                        <span className="value" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                            "{diagnosis.sintomas || 'No se describieron síntomas'}"
                        </span>
                    </div>
                    <div className="record-detail-item full-width">
                        <span className="label">Tratamiento Indicado</span>
                        <span className="value">{diagnosis.tratamiento || 'Sin tratamiento registrado'}</span>
                    </div>
                </div>
            </div>

            <div className="record-footer">
                <span className="record-id-tag">{diagnosis.id}</span>
                <span className="confirmed-pill">📋 Expediente Veterinario</span>
            </div>
        </div>
    );
}