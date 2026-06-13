/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { FEED_TYPES } from '../data/feedInventory.js';

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const EMPTY_FORM = {
    nombre: '', tipo: '', cantidad: '', unidad: 'kg', fechaIngreso: '', proveedor: ''
};

export default function FeedItemFormModal({ isOpen, onClose, onSave }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm({ ...EMPTY_FORM, fechaIngreso: getTodayStr() });
            setErrors({});
            setSubmitted(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};
        if (!form.nombre.trim()) newErrors.nombre = 'El nombre del insumo es obligatorio';
        if (!form.tipo) newErrors.tipo = 'El tipo es obligatorio';
        if (!form.proveedor.trim()) newErrors.proveedor = 'El proveedor es obligatorio';
        if (!form.fechaIngreso) newErrors.fechaIngreso = 'La fecha de ingreso es obligatoria';
        else if (form.fechaIngreso > getTodayStr()) newErrors.fechaIngreso = 'La fecha no puede ser futura';
        const cant = parseFloat(form.cantidad);
        if (form.cantidad === '' || isNaN(cant) || cant < 0) newErrors.cantidad = 'Cantidad inválida';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (validate()) {
            onSave({
                nombre: form.nombre.trim(),
                tipo: form.tipo,
                cantidad: parseFloat(form.cantidad),
                unidad: form.unidad,
                fechaIngreso: form.fechaIngreso,
                proveedor: form.proveedor.trim()
            });
            onClose();
        }
    };

    return (
        <div className="modal-overlay open">
            <div className="modal-card" style={{ maxWidth: '640px' }}>
                <div className="modal-header">
                    <h2>Registrar Insumo de Alimentación</h2>
                    <button type="button" aria-label="Cerrar" className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} noValidate style={{ padding: '1.5rem' }}>
                    {submitted && Object.keys(errors).length > 0 && (
                        <div className="form-alert">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <span>Complete los campos obligatorios.</span>
                        </div>
                    )}

                    <div className="form-grid">
                        <div className={`form-group full-width ${errors.nombre ? 'invalid' : ''}`}>
                            <label>Nombre del Insumo *</label>
                            <input type="text" placeholder="Ej. Concentrado lechero"
                                value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                            {errors.nombre && <span className="error-msg">{errors.nombre}</span>}
                        </div>

                        <div className={`form-group ${errors.tipo ? 'invalid' : ''}`}>
                            <label>Tipo *</label>
                            <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                                <option value="">Seleccionar tipo</option>
                                {Object.keys(FEED_TYPES).map(key => (
                                    <option key={key} value={key}>{FEED_TYPES[key]}</option>
                                ))}
                            </select>
                            {errors.tipo && <span className="error-msg">{errors.tipo}</span>}
                        </div>

                        <div className="form-group">
                            <label>Unidad *</label>
                            <select value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })}>
                                <option value="kg">Kilogramos (kg)</option>
                                <option value="unidades">Unidades</option>
                            </select>
                        </div>

                        <div className={`form-group ${errors.cantidad ? 'invalid' : ''}`}>
                            <label>Cantidad Disponible *</label>
                            <input type="number" step="0.1" min="0" placeholder="Ej. 100"
                                value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} />
                            {errors.cantidad && <span className="error-msg">{errors.cantidad}</span>}
                        </div>

                        <div className={`form-group ${errors.fechaIngreso ? 'invalid' : ''}`}>
                            <label>Fecha de Ingreso *</label>
                            <input type="date" max={getTodayStr()}
                                value={form.fechaIngreso} onChange={e => setForm({ ...form, fechaIngreso: e.target.value })} />
                            {errors.fechaIngreso && <span className="error-msg">{errors.fechaIngreso}</span>}
                        </div>

                        <div className={`form-group full-width ${errors.proveedor ? 'invalid' : ''}`}>
                            <label>Proveedor *</label>
                            <input type="text" placeholder="Ej. AgroNorte S.A."
                                value={form.proveedor} onChange={e => setForm({ ...form, proveedor: e.target.value })} />
                            {errors.proveedor && <span className="error-msg">{errors.proveedor}</span>}
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Registrar Insumo</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
