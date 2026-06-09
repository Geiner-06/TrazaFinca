import React from 'react';

export default function AnimalDetailModal({ animal, onClose, onEdit }) {
    if (!animal) return null;

    const specClass = `species-${animal.especie.replace(/\s+/g, '.')}`;

    // Función para formatear fecha (opcional, basada en tu código original)
    const formatDate = (dateString) => {
        if (!dateString) return "No registrada";
        const parts = dateString.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateString;
    };

    return (
        <div className="modal-overlay open">
            <div className="modal-card detail-card">
                <div className="modal-header">
                    <h2>Ficha del Animal</h2>
                    <div className="detail-header-actions">
                        {/* Botón de editar (TF-19) */}
                        <button className="btn btn-outline btn-sm" onClick={() => onEdit(animal)}>
                            Editar
                        </button>
                        <button className="btn-close" onClick={onClose}>&times;</button>
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
                </div>

                <div className="detail-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                    {/* Los botones de Editar y Dar de Baja los activaremos en los siguientes commits */}
                </div>
            </div>
        </div>
    );
}