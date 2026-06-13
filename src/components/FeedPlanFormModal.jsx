/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { FEED_PURPOSES } from '../data/feedConstants.js';

const EMPTY_FORM = {
    nombre: '',
    proposito: '',
    proteina: '',
    energia: '',
    fibra: '',
    ingredientes: '',
    cantidadDiaria: '',
    unidad: 'kg',
    frecuencia: ''
};

export default function FeedPlanFormModal({ isOpen, onClose, onSave, planToEdit, isDuplicate }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (planToEdit) {
                setForm({
                    nombre: isDuplicate ? `${planToEdit.nombre} (copia)` : planToEdit.nombre,
                    proposito: planToEdit.proposito,
                    proteina: String(planToEdit.proteina),
                    energia: String(planToEdit.energia),
                    fibra: String(planToEdit.fibra),
                    ingredientes: planToEdit.ingredientes,
                    cantidadDiaria: String(planToEdit.cantidadDiaria),
                    unidad: planToEdit.unidad,
                    frecuencia: planToEdit.frecuencia
                });
            } else {
                setForm(EMPTY_FORM);
            }
            setErrors({});
            setSubmitted(false);
        }
    }, [isOpen, planToEdit, isDuplicate]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};
        if (!form.nombre.trim()) newErrors.nombre = 'El nombre del plan es obligatorio';
        if (!form.proposito) newErrors.proposito = 'El propósito productivo es obligatorio';
        if (!form.ingredientes.trim()) newErrors.ingredientes = 'Los insumos son obligatorios';
        if (!form.frecuencia.trim()) newErrors.frecuencia = 'La frecuencia es obligatoria';

        const numeric = [
            ['proteina', 'La proteína'],
            ['energia', 'La energía'],
            ['fibra', 'La fibra'],
            ['cantidadDiaria', 'La cantidad diaria']
        ];
        numeric.forEach(([key, label]) => {
            const val = parseFloat(form[key]);
            if (form[key] === '' || isNaN(val) || val <= 0) {
                newErrors[key] = `${label} debe ser un número mayor a 0`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (validate()) {
            onSave({
                // Editar plan existente (no duplicado) conserva su id
                id: planToEdit && !isDuplicate ? planToEdit.id : null,
                nombre: form.nombre.trim(),
                proposito: form.proposito,
                proteina: parseFloat(form.proteina),
                energia: parseFloat(form.energia),
                fibra: parseFloat(form.fibra),
                ingredientes: form.ingredientes.trim(),
                cantidadDiaria: parseFloat(form.cantidadDiaria),
                unidad: form.unidad,
                frecuencia: form.frecuencia.trim(),
                esBase: false
            });
            onClose();
        }
    };

    const title = planToEdit
        ? (isDuplicate ? 'Duplicar Plan de Alimentación' : 'Editar Plan de Alimentación')
        : 'Crear Plan de Alimentación';

    return (
        <div className="modal-overlay open">
            <div className="modal-card" style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button type="button" aria-label="Cerrar" className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} noValidate style={{ padding: '1.5rem' }}>
                    {submitted && Object.keys(errors).length > 0 && (
                        <div className="form-alert">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <span>Revise los campos marcados antes de guardar el plan.</span>
                        </div>
                    )}

                    <div className="form-grid">
                        <div className={`form-group full-width ${errors.nombre ? 'invalid' : ''}`}>
                            <label>Nombre del Plan *</label>
                            <input
                                type="text"
                                placeholder="Ej. Engorde acelerado novillos"
                                value={form.nombre}
                                onChange={e => setForm({ ...form, nombre: e.target.value })}
                            />
                            {errors.nombre && <span className="error-msg">{errors.nombre}</span>}
                        </div>

                        <div className={`form-group full-width ${errors.proposito ? 'invalid' : ''}`}>
                            <label>Propósito Productivo *</label>
                            <select
                                value={form.proposito}
                                onChange={e => setForm({ ...form, proposito: e.target.value })}
                            >
                                <option value="">Seleccionar propósito</option>
                                {Object.keys(FEED_PURPOSES).map(key => (
                                    <option key={key} value={key}>{FEED_PURPOSES[key]}</option>
                                ))}
                            </select>
                            {errors.proposito && <span className="error-msg">{errors.proposito}</span>}
                        </div>

                        <div className={`form-group ${errors.proteina ? 'invalid' : ''}`}>
                            <label>Proteína (%) *</label>
                            <input type="number" step="0.1" min="0" placeholder="Ej. 14"
                                value={form.proteina}
                                onChange={e => setForm({ ...form, proteina: e.target.value })} />
                            {errors.proteina && <span className="error-msg">{errors.proteina}</span>}
                        </div>

                        <div className={`form-group ${errors.energia ? 'invalid' : ''}`}>
                            <label>Energía (Mcal/kg) *</label>
                            <input type="number" step="0.1" min="0" placeholder="Ej. 2.8"
                                value={form.energia}
                                onChange={e => setForm({ ...form, energia: e.target.value })} />
                            {errors.energia && <span className="error-msg">{errors.energia}</span>}
                        </div>

                        <div className={`form-group ${errors.fibra ? 'invalid' : ''}`}>
                            <label>Fibra (%) *</label>
                            <input type="number" step="0.1" min="0" placeholder="Ej. 18"
                                value={form.fibra}
                                onChange={e => setForm({ ...form, fibra: e.target.value })} />
                            {errors.fibra && <span className="error-msg">{errors.fibra}</span>}
                        </div>

                        <div className={`form-group full-width ${errors.ingredientes ? 'invalid' : ''}`}>
                            <label>Ingredientes / Insumos *</label>
                            <textarea rows="2" placeholder="Ej. Maíz molido, melaza, pasto de corte, sales minerales"
                                value={form.ingredientes}
                                onChange={e => setForm({ ...form, ingredientes: e.target.value })} />
                            {errors.ingredientes && <span className="error-msg">{errors.ingredientes}</span>}
                        </div>

                        <div className={`form-group ${errors.cantidadDiaria ? 'invalid' : ''}`}>
                            <label>Cantidad Diaria por Animal *</label>
                            <input type="number" step="0.1" min="0" placeholder="Ej. 12"
                                value={form.cantidadDiaria}
                                onChange={e => setForm({ ...form, cantidadDiaria: e.target.value })} />
                            {errors.cantidadDiaria && <span className="error-msg">{errors.cantidadDiaria}</span>}
                        </div>

                        <div className="form-group">
                            <label>Unidad *</label>
                            <select value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })}>
                                <option value="kg">Kilogramos (kg)</option>
                                <option value="litros">Litros</option>
                            </select>
                        </div>

                        <div className={`form-group full-width ${errors.frecuencia ? 'invalid' : ''}`}>
                            <label>Frecuencia de Suministro *</label>
                            <input type="text" placeholder="Ej. 2 veces al día (mañana y tarde)"
                                value={form.frecuencia}
                                onChange={e => setForm({ ...form, frecuencia: e.target.value })} />
                            {errors.frecuencia && <span className="error-msg">{errors.frecuencia}</span>}
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Guardar Plan</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
