/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { ACTION_TYPES } from '../data/growthAlerts.js';

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function LowGainActionModal({ isOpen, onClose, onSave, alert }) {
    const [form, setForm] = useState({ tipo: '', descripcion: '', responsable: '', fecha: '' });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm({ tipo: '', descripcion: '', responsable: '', fecha: getTodayStr() });
            setErrors({});
            setSubmitted(false);
        }
    }, [isOpen]);

    if (!isOpen || !alert) return null;

    const validate = () => {
        const newErrors = {};
        if (!form.tipo) newErrors.tipo = 'El tipo de acción es obligatorio';
        if (!form.descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria';
        if (!form.responsable.trim()) newErrors.responsable = 'El responsable es obligatorio';
        if (!form.fecha) newErrors.fecha = 'La fecha es obligatoria';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (validate()) {
            onSave({
                animalId: alert.animalId,
                alertaFecha: alert.fechaUltimoPesaje,
                tipo: form.tipo,
                descripcion: form.descripcion.trim(),
                responsable: form.responsable.trim(),
                fecha: form.fecha
            });
            onClose();
        }
    };

    return (
        <div className="modal-overlay open">
            <div className="modal-card" style={{ maxWidth: '560px' }}>
                <div className="modal-header">
                    <h2>Registrar Acción Correctiva</h2>
                    <button type="button" aria-label="Cerrar" className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} noValidate style={{ padding: '1.5rem' }}>
                    <div className="action-alert-context">
                        Animal <strong>{alert.animalId}</strong>
                        {alert.arete && <> · {alert.arete}</>} · GDP actual <strong>{alert.currentGdp.toFixed(3)} kg/d</strong>
                        {' '}vs esperada <strong>{alert.expectedGdp.toFixed(2)} kg/d</strong> ({alert.diffPct}% por debajo)
                    </div>

                    {submitted && Object.keys(errors).length > 0 && (
                        <div className="form-alert">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <span>Complete los campos obligatorios.</span>
                        </div>
                    )}

                    <div className="form-grid">
                        <div className={`form-group full-width ${errors.tipo ? 'invalid' : ''}`}>
                            <label>Tipo de Acción *</label>
                            <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                                <option value="">Seleccionar acción</option>
                                {Object.keys(ACTION_TYPES).map(key => (
                                    <option key={key} value={key}>{ACTION_TYPES[key]}</option>
                                ))}
                            </select>
                            {errors.tipo && <span className="error-msg">{errors.tipo}</span>}
                        </div>

                        <div className={`form-group full-width ${errors.descripcion ? 'invalid' : ''}`}>
                            <label>Descripción *</label>
                            <textarea
                                rows="2"
                                placeholder="Ej. Se cambia al plan de engorde intensivo y se programa revisión veterinaria."
                                value={form.descripcion}
                                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                            />
                            {errors.descripcion && <span className="error-msg">{errors.descripcion}</span>}
                        </div>

                        <div className={`form-group ${errors.responsable ? 'invalid' : ''}`}>
                            <label>Responsable *</label>
                            <input
                                type="text"
                                placeholder="Nombre del mandador"
                                value={form.responsable}
                                onChange={e => setForm({ ...form, responsable: e.target.value })}
                            />
                            {errors.responsable && <span className="error-msg">{errors.responsable}</span>}
                        </div>

                        <div className={`form-group ${errors.fecha ? 'invalid' : ''}`}>
                            <label>Fecha *</label>
                            <input
                                type="date"
                                max={getTodayStr()}
                                value={form.fecha}
                                onChange={e => setForm({ ...form, fecha: e.target.value })}
                            />
                            {errors.fecha && <span className="error-msg">{errors.fecha}</span>}
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Registrar Acción</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
