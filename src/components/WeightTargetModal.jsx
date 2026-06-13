/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';

export default function WeightTargetModal({ isOpen, onClose, onSave, ctx }) {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && ctx) {
            setValue(ctx.currentValue != null ? String(ctx.currentValue) : '');
            setError('');
        }
    }, [isOpen, ctx]);

    if (!isOpen || !ctx) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const num = parseFloat(value);
        if (value === '' || isNaN(num) || num <= 0) {
            setError('Ingrese un peso objetivo válido (kg en pie)');
            return;
        }
        onSave(num);
        onClose();
    };

    return (
        <div className="modal-overlay open">
            <div className="modal-card" style={{ maxWidth: '480px' }}>
                <div className="modal-header">
                    <h2>Definir Peso Objetivo</h2>
                    <button type="button" aria-label="Cerrar" className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} noValidate style={{ padding: '1.5rem' }}>
                    <p className="target-ctx">
                        {ctx.mode === 'animal'
                            ? <>Objetivo individual para <strong>{ctx.label}</strong>.</>
                            : <>Objetivo aplicado a todos los animales del <strong>{ctx.label}</strong> (sin objetivo individual propio).</>}
                    </p>

                    <div className={`form-group ${error ? 'invalid' : ''}`}>
                        <label>Peso objetivo de faena / venta (kg en pie) *</label>
                        <input
                            type="number"
                            step="1"
                            min="0"
                            placeholder="Ej. 480"
                            value={value}
                            autoFocus
                            onChange={e => setValue(e.target.value)}
                        />
                        {error && <span className="error-msg">{error}</span>}
                    </div>

                    <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Guardar Objetivo</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
