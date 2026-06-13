/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { WEIGHT_RANGES, CATEGORY_LABELS } from '../data/weightCategories.js';

const BODY_CONDITION_OPTIONS = [
    { value: 1, label: '1 - Emaciado (muy flaco)' },
    { value: 2, label: '2 - Delgado' },
    { value: 3, label: '3 - Ideal' },
    { value: 4, label: '4 - Gordo' },
    { value: 5, label: '5 - Obeso' }
];

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const EMPTY_FORM = {
    animalId: '',
    categoria: '',
    fecha: '',
    pesoKg: '',
    condicionCorporal: '',
    observaciones: ''
};

export default function WeightRecordFormModal({ isOpen, onClose, onSave, animals, preselectedAnimalId }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm({
                ...EMPTY_FORM,
                animalId: preselectedAnimalId || '',
                fecha: getTodayStr()
            });
            setErrors({});
            setSubmitted(false);
        }
    }, [isOpen, preselectedAnimalId]);

    if (!isOpen) return null;

    // Solo se pesa a animales activos
    const activeAnimals = animals.filter(a => a.estado === 'activo');

    const validate = () => {
        const newErrors = {};
        if (!form.animalId) newErrors.animalId = 'El animal es obligatorio';
        if (!form.categoria) newErrors.categoria = 'La categoría del animal es obligatoria';

        if (!form.fecha) {
            newErrors.fecha = 'La fecha de pesaje es obligatoria';
        } else if (form.fecha > getTodayStr()) {
            newErrors.fecha = 'No se permite registrar pesajes con fecha futura';
        }

        const peso = parseFloat(form.pesoKg);
        if (!form.pesoKg || isNaN(peso) || peso <= 0) {
            newErrors.pesoKg = 'El peso debe ser un número mayor a 0';
        } else if (form.categoria && WEIGHT_RANGES[form.categoria]) {
            const { min, max } = WEIGHT_RANGES[form.categoria];
            if (peso < min || peso > max) {
                newErrors.pesoKg = `Peso fuera del rango válido para ${CATEGORY_LABELS[form.categoria]} (${min} – ${max} kg)`;
            }
        }

        if (!form.condicionCorporal) newErrors.condicionCorporal = 'La condición corporal es obligatoria';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (validate()) {
            onSave({
                animalId: form.animalId,
                categoria: form.categoria,
                fecha: form.fecha,
                pesoKg: parseFloat(form.pesoKg),
                condicionCorporal: parseInt(form.condicionCorporal, 10),
                observaciones: form.observaciones.trim()
            });
            onClose();
        }
    };

    const selectedRange = form.categoria ? WEIGHT_RANGES[form.categoria] : null;

    return (
        <div className="modal-overlay open">
            <div className="modal-card" style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <h2>Registrar Pesaje</h2>
                    <button type="button" aria-label="Cerrar" className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} noValidate style={{ padding: '1.5rem' }}>
                    {submitted && Object.keys(errors).length > 0 && (
                        <div className="form-alert">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <span>Revise los campos marcados antes de confirmar el pesaje.</span>
                        </div>
                    )}

                    <div className="form-grid">
                        {/* Selección de Animal */}
                        <div className={`form-group ${errors.animalId ? 'invalid' : ''}`}>
                            <label>Animal (Código / Arete) *</label>
                            <select
                                value={form.animalId}
                                disabled={!!preselectedAnimalId}
                                onChange={e => setForm({ ...form, animalId: e.target.value })}
                            >
                                <option value="">Seleccione el animal</option>
                                {activeAnimals.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.id} {a.arete ? `[${a.arete}]` : ''}
                                    </option>
                                ))}
                            </select>
                            {errors.animalId && <span className="error-msg">{errors.animalId}</span>}
                        </div>

                        {/* Categoría */}
                        <div className={`form-group ${errors.categoria ? 'invalid' : ''}`}>
                            <label>Categoría del Animal *</label>
                            <select
                                value={form.categoria}
                                onChange={e => setForm({ ...form, categoria: e.target.value })}
                            >
                                <option value="">Seleccionar categoría</option>
                                {Object.keys(CATEGORY_LABELS).map(key => (
                                    <option key={key} value={key}>{CATEGORY_LABELS[key]}</option>
                                ))}
                            </select>
                            {errors.categoria && <span className="error-msg">{errors.categoria}</span>}
                        </div>

                        {/* Fecha de pesaje */}
                        <div className={`form-group ${errors.fecha ? 'invalid' : ''}`}>
                            <label>Fecha de Pesaje *</label>
                            <input
                                type="date"
                                max={getTodayStr()}
                                value={form.fecha}
                                onChange={e => setForm({ ...form, fecha: e.target.value })}
                            />
                            {errors.fecha && <span className="error-msg">{errors.fecha}</span>}
                        </div>

                        {/* Peso */}
                        <div className={`form-group ${errors.pesoKg ? 'invalid' : ''}`}>
                            <label>
                                Peso (kg) *
                                {selectedRange && (
                                    <span className="optional-tag"> rango válido: {selectedRange.min} – {selectedRange.max} kg</span>
                                )}
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="Ej. 450.5"
                                value={form.pesoKg}
                                onChange={e => setForm({ ...form, pesoKg: e.target.value })}
                            />
                            {errors.pesoKg && <span className="error-msg">{errors.pesoKg}</span>}
                        </div>

                        {/* Condición corporal */}
                        <div className={`form-group ${errors.condicionCorporal ? 'invalid' : ''}`}>
                            <label>Condición Corporal (escala 1–5) *</label>
                            <select
                                value={form.condicionCorporal}
                                onChange={e => setForm({ ...form, condicionCorporal: e.target.value })}
                            >
                                <option value="">Seleccionar condición</option>
                                {BODY_CONDITION_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {errors.condicionCorporal && <span className="error-msg">{errors.condicionCorporal}</span>}
                        </div>

                        {/* Observaciones */}
                        <div className="form-group full-width">
                            <label>Observaciones <span className="optional-tag">(Opcional)</span></label>
                            <textarea
                                rows="2"
                                placeholder="Ej. Pesaje posterior al destete, animal en ayuno de 12 horas..."
                                value={form.observaciones}
                                onChange={e => setForm({ ...form, observaciones: e.target.value })}
                            />
                        </div>
                    </div>

                    <p className="immutable-warning">
                        Una vez confirmado, el pesaje no podrá modificarse ni eliminarse. Solo se podrán agregar notas aclaratorias.
                    </p>

                    <div className="form-actions" style={{ marginTop: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Confirmar Pesaje
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
