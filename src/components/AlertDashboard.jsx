import { useState } from 'react';

export default function AlertDashboard({ alerts = [], animals = [], healthRecords = [], onResolveAlert, onQuickRegister }) {
    // Fecha simulada para el prototipo (ajustar según sea necesario)
    const TODAY_STR = '2026-06-09';
    const [warningAlert, setWarningAlert] = useState(null);

    const getAlertUrgency = (fechaProxima) => {
        const pDate = new Date(fechaProxima);
        const tDate = new Date(TODAY_STR);
        const diffTime = pDate - tDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'vencido'; // Rojo
        if (diffDays <= 3) return 'urgente'; // Naranja
        if (diffDays <= 7) return 'proximo'; // Amarillo
        return null;
    };

    const getTreatmentLabel = (type) => {
        const labels = {
            vacuna: 'Vacuna',
            desparasitacion_interna: 'Desp. Interna',
            desparasitacion_external: 'Desp. Externa',
            vitamina_mineral: 'Vit. / Mineral'
        };
        return labels[type] || type;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    const activeAlerts = alerts
        .map(alert => ({ ...alert, urgency: getAlertUrgency(alert.fechaProxima) }))
        .filter(alert => alert.urgency !== null)
        .sort((a, b) => {
            const order = { vencido: 0, urgente: 1, proximo: 2 };
            return order[a.urgency] - order[b.urgency] || new Date(a.fechaProxima) - new Date(b.fechaProxima);
        });

    const counts = {
        vencido: activeAlerts.filter(a => a.urgency === 'vencido').length,
        urgente: activeAlerts.filter(a => a.urgency === 'urgente').length,
        proximo: activeAlerts.filter(a => a.urgency === 'proximo').length
    };

    const handleMarkAsAttended = (alert) => {
        const hasTodayRecord = healthRecords.some(r =>
            r.animalId === alert.animalId &&
            r.tipoTratamiento === alert.tipoTratamiento &&
            r.fechaAplicacion === TODAY_STR
        );

        if (hasTodayRecord) {
            onResolveAlert(alert.id);
        } else {
            setWarningAlert(alert);
        }
    };

    return (
        <div className="alert-dashboard">
            {/* 1. RESUMEN DE ALERTAS (Criterio 5) */}
            <div className="alert-summary-grid">
                <div className="stat-card alert-stat vencido">
                    <span className="stat-num">{counts.vencido}</span>
                    <span className="stat-label">Vencidos</span>
                </div>
                <div className="stat-card alert-stat urgente">
                    <span className="stat-num">{counts.urgente}</span>
                    <span className="stat-label">Urgentes</span>
                </div>
                <div className="stat-card alert-stat proximo">
                    <span className="stat-num">{counts.proximo}</span>
                    <span className="stat-label">Próximos</span>
                </div>
            </div>

            {/* 2. LISTADO DE ALERTAS (Criterios 1, 2 y 3) */}
            <div className="alerts-list-container">
                <div className="toolbar-title" style={{ marginBottom: '1.5rem' }}>
                    <h2>Alertas de Tratamiento</h2>
                    <span className="badge">{activeAlerts.length} pendientes</span>
                </div>

                <div className="alerts-stack">
                    {activeAlerts.length > 0 ? (
                        activeAlerts.map(alert => {
                            const animal = animals.find(a => a.id === alert.animalId);
                            return (
                                <div key={alert.id} className={`alert-card-item status-${alert.urgency}`}>
                                    <div className="alert-info-main">
                                        <div className="alert-animal-info">
                                            <span className="id-tag">{alert.animalId}</span>
                                            <span className="arete-tag">Arete: {animal?.arete || 'S/A'}</span>
                                        </div>
                                        <h4 className="treatment-name">
                                            {getTreatmentLabel(alert.tipoTratamiento)}: <strong>{alert.productoComercial}</strong>
                                        </h4>
                                        <div className="alert-meta-data">
                                            <span>Programado: <strong>{formatDate(alert.fechaProxima)}</strong></span>
                                            <span>Lote previo: <strong>{alert.lote}</strong></span>
                                        </div>
                                    </div>
                                    <div className="alert-action-side">
                                        <button className="btn btn-primary btn-sm" onClick={() => handleMarkAsAttended(alert)}>
                                            Marcar Atendido
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="empty-state">
                            <p>🎉 No hay alertas sanitarias pendientes.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DE ADVERTENCIA (Criterio 4) */}
            {warningAlert && (
                <div className="modal-overlay open" style={{ zIndex: 9999 }}>
                    <div className="modal-card warning-card">
                        <div className="modal-header">
                            <h3>Registro Obligatorio Requerido</h3>
                        </div>
                        <div className="modal-body" style={{ padding: '1.5rem' }}>
                            <p>Para cerrar esta alerta, SENASA exige el registro sanitario de la aplicación de hoy.</p>
                            <div className="warning-box">
                                <strong>Animal: {warningAlert.animalId}</strong><br />
                                Tratamiento: {getTreatmentLabel(warningAlert.tipoTratamiento)}
                            </div>
                        </div>
                        <div className="form-actions">
                            <button className="btn btn-secondary" onClick={() => setWarningAlert(null)}>Cerrar</button>
                            <button className="btn btn-primary" onClick={() => {
                                onQuickRegister(warningAlert.animalId, warningAlert.tipoTratamiento, warningAlert.productoComercial);
                                setWarningAlert(null);
                            }}>
                                Ir a Registrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}