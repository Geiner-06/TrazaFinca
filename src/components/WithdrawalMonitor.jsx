import React from 'react';

export default function WithdrawalMonitor({ list }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return dateStr.split('-').reverse().join('/');
    };

    return (
        <div className="withdrawal-monitor-container">
            <div className="toolbar-title">
                <h2>Restricción de Despacho (Retiro)</h2>
                <span className="badge danger">{list.length} Animales Bloqueados</span>
            </div>

            <div className="withdrawal-table-wrapper">
                <table className="withdrawal-table">
                    <thead>
                        <tr>
                            <th>Animal / Arete</th>
                            <th>Tratamiento</th>
                            <th>Retiro Carne</th>
                            <th>Retiro Leche</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, idx) => (
                            <tr key={idx}>
                                <td>
                                    <strong>{item.animalId}</strong>
                                    <div className="sub-text">Arete: {item.arete || 'S/A'}</div>
                                </td>
                                <td>
                                    <strong>{item.producto}</strong>
                                    <div className="sub-text">Aplicado: {formatDate(item.fechaAplicacion)}</div>
                                </td>
                                <td>
                                    {item.isRestrictedCarne ? (
                                        <div className="status-pill-withdrawal meat">
                                            LIBERA: {formatDate(item.releaseCarne)}
                                        </div>
                                    ) : <span className="ok-check">✓ APTO</span>}
                                </td>
                                <td>
                                    {item.isRestrictedLeche ? (
                                        <div className="status-pill-withdrawal milk">
                                            LIBERA: {formatDate(item.releaseLeche)}
                                        </div>
                                    ) : <span className="ok-check">✓ APTO</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {list.length === 0 && (
                    <div className="empty-state-mini">
                        No hay animales en período de retiro actualmente.
                    </div>
                )}
            </div>
        </div>
    );
}