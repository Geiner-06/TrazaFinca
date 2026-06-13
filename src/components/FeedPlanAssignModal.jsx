/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { FEED_PURPOSES, ANIMAL_TO_FEED_PURPOSE, formatFeedDate } from '../data/feedConstants.js';

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function FeedPlanAssignModal({
    isOpen, onClose, onAssign, animals, plans, assignments, preselectedAnimalId
}) {
    const [form, setForm] = useState({ animalId: '', planId: '', fechaInicio: '', responsable: '' });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm({
                animalId: preselectedAnimalId || '',
                planId: '',
                fechaInicio: getTodayStr(),
                responsable: ''
            });
            setErrors({});
            setSubmitted(false);
        }
    }, [isOpen, preselectedAnimalId]);

    if (!isOpen) return null;

    const activeAnimals = animals.filter(a => a.estado === 'activo');
    const selectedAnimal = animals.find(a => a.id === form.animalId);

    // Plan activo actual del animal seleccionado (se archivará al confirmar)
    const currentActive = form.animalId
        ? assignments.find(as => as.animalId === form.animalId && as.estado === 'activo')
        : null;
    const currentPlan = currentActive ? plans.find(p => p.id === currentActive.planId) : null;

    // Sugerencia de plan según propósito del animal
    const suggestedPurpose = selectedAnimal ? ANIMAL_TO_FEED_PURPOSE[selectedAnimal.proposito] : null;
    const selectedPlan = plans.find(p => p.id === form.planId);
    const mismatch = selectedPlan && suggestedPurpose && selectedPlan.proposito !== suggestedPurpose;

    const validate = () => {
        const newErrors = {};
        if (!form.animalId) newErrors.animalId = 'El animal es obligatorio';
        if (!form.planId) newErrors.planId = 'El plan de alimentación es obligatorio';
        if (!form.fechaInicio) {
            newErrors.fechaInicio = 'La fecha de inicio es obligatoria';
        } else if (form.fechaInicio > getTodayStr()) {
            newErrors.fechaInicio = 'La fecha de inicio no puede ser futura';
        }
        if (!form.responsable.trim()) newErrors.responsable = 'El responsable es obligatorio';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (validate()) {
            onAssign({
                animalId: form.animalId,
                planId: form.planId,
                fechaInicio: form.fechaInicio,
                responsable: form.responsable.trim()
            });
            onClose();
        }
    };

    return (
        <div className="modal-overlay open">
            <div className="modal-card" style={{ maxWidth: '650px' }}>
                <div className="modal-header">
                    <h2>Asignar Plan de Alimentación</h2>
                    <button type="button" aria-label="Cerrar" className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} noValidate style={{ padding: '1.5rem' }}>
                    {submitted && Object.keys(errors).length > 0 && (
                        <div className="form-alert">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <span>Revise los campos marcados antes de asignar el plan.</span>
                        </div>
                    )}

                    <div className="form-grid">
                        <div className={`form-group full-width ${errors.animalId ? 'invalid' : ''}`}>
                            <label>Animal *</label>
                            <select
                                value={form.animalId}
                                disabled={!!preselectedAnimalId}
                                onChange={e => setForm({ ...form, animalId: e.target.value })}
                            >
                                <option value="">Seleccione el animal</option>
                                {activeAnimals.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.id} {a.arete ? `[${a.arete}]` : ''} — {a.proposito}
                                    </option>
                                ))}
                            </select>
                            {errors.animalId && <span className="error-msg">{errors.animalId}</span>}
                        </div>

                        {currentPlan && (
                            <div className="form-group full-width">
                                <div className="assign-current-note">
                                    Plan activo actual: <strong>{currentPlan.nombre}</strong> (desde {formatFeedDate(currentActive.fechaInicio)}).
                                    Al confirmar, se archivará automáticamente con fecha de cierre {formatFeedDate(form.fechaInicio)}.
                                </div>
                            </div>
                        )}

                        <div className={`form-group full-width ${errors.planId ? 'invalid' : ''}`}>
                            <label>Plan de Alimentación *</label>
                            <select
                                value={form.planId}
                                onChange={e => setForm({ ...form, planId: e.target.value })}
                            >
                                <option value="">Seleccione el plan</option>
                                {plans.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nombre} ({FEED_PURPOSES[p.proposito] || p.proposito})
                                    </option>
                                ))}
                            </select>
                            {errors.planId && <span className="error-msg">{errors.planId}</span>}
                            {mismatch && (
                                <span className="assign-mismatch-hint">
                                    El propósito del plan no coincide con el del animal ({selectedAnimal.proposito}). Puede continuar si es intencional.
                                </span>
                            )}
                        </div>

                        <div className={`form-group ${errors.fechaInicio ? 'invalid' : ''}`}>
                            <label>Fecha de Inicio *</label>
                            <input
                                type="date"
                                max={getTodayStr()}
                                value={form.fechaInicio}
                                onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
                            />
                            {errors.fechaInicio && <span className="error-msg">{errors.fechaInicio}</span>}
                        </div>

                        <div className={`form-group ${errors.responsable ? 'invalid' : ''}`}>
                            <label>Responsable de la Asignación *</label>
                            <input
                                type="text"
                                placeholder="Nombre del encargado"
                                value={form.responsable}
                                onChange={e => setForm({ ...form, responsable: e.target.value })}
                            />
                            {errors.responsable && <span className="error-msg">{errors.responsable}</span>}
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Asignar Plan</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
