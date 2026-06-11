import React from 'react';

export default function InventoryDashboard({ inventory }) {
    const TODAY = new Date('2026-06-09'); // Fecha prototipo

    const getStatus = (item) => {
        const vencimiento = new Date(item.fechaVencimiento);
        const diffTime = vencimiento - TODAY;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return { label: 'VENCIDO', class: 'vencido' };
        if (diffDays <= 30) return { label: 'PRÓX. A VENCER', class: 'urgente' };
        if (item.cantidad <= item.umbralMinimo) return { label: 'STOCK BAJO', class: 'proximo' };
        return { label: 'OK', class: 'active' };
    };

    return (
        <div className="inventory-section">
            <div className="toolbar-title">
                <h1>Inventario de Fármacos</h1>
                <span className="badge">{inventory.length} productos</span>
            </div>

            <div className="inventory-grid">
                {inventory.map(item => {
                    const status = getStatus(item);
                    return (
                        <div key={item.id} className={`inventory-card ${status.class}`}>
                            <div className="inv-header">
                                <strong>{item.nombre}</strong>
                                <span className={`status-pill ${status.class}`}>{status.label}</span>
                            </div>
                            <div className="inv-body">
                                <p><span>Principio:</span> {item.principioActivo}</p>
                                <p><span>Lote:</span> {item.lote}</p>
                                <p><span>Vence:</span> {item.fechaVencimiento.split('-').reverse().join('/')}</p>
                                <div className="stock-meter">
                                    <div className="stock-info">
                                        <span>Stock disponible:</span>
                                        <strong>{item.cantidad} {item.unidad}</strong>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${Math.min(100, (item.cantidad / (item.umbralMinimo * 2)) * 100)}%`,
                                                backgroundColor: status.class === 'proximo' ? 'var(--warning)' : 'var(--primary)'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}