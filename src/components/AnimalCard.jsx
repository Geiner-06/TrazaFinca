import React from 'react';

export default function AnimalCard({ animal, onClick }) {
    const specClass = `species-${animal.especie.replace(/\s+/g, '.')}`;

    return (
        <div className={`animal-card ${animal.estado === 'baja' ? 'baja' : ''}`}
            onClick={onClick}
            style={{ cursor: "pointer" }}>
            <div className="card-badge-row">
                <span className={`species-badge ${specClass}`}>{animal.especie}</span>
                <span className={`status-pill ${animal.estado === 'activo' ? 'active' : 'baja'}`}>
                    {animal.estado === 'activo' ? 'Activo' : 'De Baja'}
                </span>
            </div>
            <h2 className="card-id">
                {animal.id} {animal.arete && <span className="card-tag">🏷️ {animal.arete}</span>}
            </h2>
            <div className="card-details">
                <div className="card-detail-item">
                    <span className="label">Raza</span>
                    <span className="value">{animal.raza || 'No esp.'}</span>
                </div>
                <div className="card-detail-item">
                    <span className="label">Sexo</span>
                    <span className="value">{animal.sexo}</span>
                </div>
            </div>
            <div className="card-footer">
                <span className="card-purpose">{animal.proposito}</span>
                <button className="btn-view-profile">Ver Ficha</button>
            </div>
        </div>
    );
}