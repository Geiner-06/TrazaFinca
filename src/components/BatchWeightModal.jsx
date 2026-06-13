/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { WEIGHT_RANGES, CATEGORY_LABELS } from '../data/weightCategories.js';

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Devuelve la categoría del pesaje más reciente del animal (para prellenar la fila)
const lastCategoriaFor = (animalId, weightRecords) => {
    const recs = weightRecords
        .filter(r => r.animalId === animalId)
        .sort((a, b) => a.fecha.localeCompare(b.fecha));
    return recs.length ? recs[recs.length - 1].categoria : '';
};

export default function BatchWeightModal({ isOpen, onClose, onSave, animals, weightRecords }) {
    const [scopeType, setScopeType] = useState('lote');
    const [scopeValue, setScopeValue] = useState('');
    const [fecha, setFecha] = useState(getTodayStr());
    const [rows, setRows] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    // Opciones de lote / potrero (solo de animales activos)
    const distinctScope = (key) =>
        [...new Set(animals.filter(a => a.estado === 'activo').map(a => a[key]).filter(Boolean))].sort();
    const scopeOptions = scopeType === 'lote' ? distinctScope('lote') : distinctScope('potrero');

    useEffect(() => {
        if (isOpen) {
            setScopeType('lote');
            setScopeValue('');
            setFecha(getTodayStr());
            setRows([]);
            setErrors({});
            setSubmitted(false);
        }
    }, [isOpen]);

    // Reconstruir la lista editable al cambiar el alcance seleccionado
    useEffect(() => {
        if (!scopeValue) {
            setRows([]);
            return;
        }
        const scopeAnimals = animals.filter(a =>
            a.estado === 'activo' &&
            (scopeType === 'lote' ? a.lote === scopeValue : a.potrero === scopeValue)
        );
        setRows(scopeAnimals.map(a => ({
            animalId: a.id,
            arete: a.arete || '',
            categoria: lastCategoriaFor(a.id, weightRecords),
            pesoKg: ''
        })));
    }, [scopeType, scopeValue, animals, weightRecords]);

    if (!isOpen) return null;

    const updateRow = (idx, field, value) => {
        setRows(rows.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    };

    const validate = () => {
        const newErrors = { rows: {} };
        if (!scopeValue) newErrors.scope = `Seleccione un ${scopeType}`;
        if (!fecha) newErrors.fecha = 'La fecha de la sesión es obligatoria';
        else if (fecha > getTodayStr()) newErrors.fecha = 'La fecha no puede ser futura';

        let weighedCount = 0;
        rows.forEach((r, idx) => {
            if (r.pesoKg === '' || r.pesoKg === null) return; // fila no pesada => pendiente
            weighedCount++;
            const peso = parseFloat(r.pesoKg);
            if (!r.categoria) {
                newErrors.rows[idx] = 'Seleccione categoría';
            } else if (isNaN(peso) || peso <= 0) {
                newErrors.rows[idx] = 'Peso inválido';
            } else {
                const range = WEIGHT_RANGES[r.categoria];
                if (range && (peso < range.min || peso > range.max)) {
                    newErrors.rows[idx] = `Fuera de rango (${range.min}–${range.max} kg)`;
                }
            }
        });

        if (weighedCount === 0 && !newErrors.scope) {
            newErrors.general = 'Ingrese el peso de al menos un animal';
        }

        setErrors(newErrors);
        return !newErrors.scope && !newErrors.fecha && !newErrors.general &&
            Object.keys(newErrors.rows).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (validate()) {
            const entries = rows
                .filter(r => r.pesoKg !== '' && r.pesoKg !== null)
                .map(r => ({ animalId: r.animalId, categoria: r.categoria, pesoKg: parseFloat(r.pesoKg) }));
            onSave({
                scope: scopeType,
                scopeValue,
                fecha,
                entries,
                scopeAnimalIds: rows.map(r => r.animalId)
            });
            onClose();
        }
    };

    const weighedNow = rows.filter(r => r.pesoKg !== '' && r.pesoKg !== null).length;

    return (
        <div className="modal-overlay open">
            <div className="modal-card" style={{ maxWidth: '760px' }}>
                <div className="modal-header">
                    <h2>Pesaje Masivo por Lote</h2>
                    <button type="button" aria-label="Cerrar" className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} noValidate style={{ padding: '1.5rem' }}>
                    {submitted && (errors.scope || errors.fecha || errors.general || Object.keys(errors.rows || {}).length > 0) && (
                        <div className="form-alert">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <span>{errors.scope || errors.fecha || errors.general || 'Revise los pesos marcados en la lista.'}</span>
                        </div>
                    )}

                    {/* Selección de alcance y fecha de sesión */}
                    <div className="batch-scope-bar">
                        <div className="form-group">
                            <label>Agrupar por</label>
                            <select value={scopeType} onChange={e => { setScopeType(e.target.value); setScopeValue(''); }}>
                                <option value="lote">Lote</option>
                                <option value="potrero">Potrero</option>
                            </select>
                        </div>
                        <div className={`form-group ${errors.scope ? 'invalid' : ''}`}>
                            <label>{scopeType === 'lote' ? 'Lote' : 'Potrero'} *</label>
                            <select value={scopeValue} onChange={e => setScopeValue(e.target.value)}>
                                <option value="">Seleccionar {scopeType}</option>
                                {scopeOptions.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div className={`form-group ${errors.fecha ? 'invalid' : ''}`}>
                            <label>Fecha de la sesión *</label>
                            <input type="date" max={getTodayStr()} value={fecha} onChange={e => setFecha(e.target.value)} />
                        </div>
                    </div>

                    {/* Lista editable */}
                    {scopeValue ? (
                        rows.length > 0 ? (
                            <>
                                <div className="batch-list-head">
                                    <span>{rows.length} animales en {scopeValue}</span>
                                    <span className="batch-counter">{weighedNow} con peso ingresado</span>
                                </div>
                                <div className="batch-table-wrapper">
                                    <table className="batch-table">
                                        <thead>
                                            <tr>
                                                <th>Animal / Arete</th>
                                                <th>Categoría</th>
                                                <th>Peso (kg)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row, idx) => (
                                                <tr key={row.animalId} className={errors.rows && errors.rows[idx] ? 'batch-row-error' : ''}>
                                                    <td>
                                                        <strong>{row.animalId}</strong>
                                                        {row.arete && <span className="muted-inline"> · {row.arete}</span>}
                                                    </td>
                                                    <td>
                                                        <select
                                                            value={row.categoria}
                                                            onChange={e => updateRow(idx, 'categoria', e.target.value)}
                                                        >
                                                            <option value="">—</option>
                                                            {Object.keys(CATEGORY_LABELS).map(key => (
                                                                <option key={key} value={key}>{CATEGORY_LABELS[key]}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            placeholder="Sin pesar"
                                                            value={row.pesoKg}
                                                            onChange={e => updateRow(idx, 'pesoKg', e.target.value)}
                                                        />
                                                        {errors.rows && errors.rows[idx] && (
                                                            <span className="batch-row-msg">{errors.rows[idx]}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="batch-hint">
                                    Deje el peso en blanco para los animales que no se pesaron: quedarán marcados como <strong>pendiente</strong> en el resumen.
                                </p>
                            </>
                        ) : (
                            <p className="no-records-placeholder">No hay animales activos en {scopeValue}.</p>
                        )
                    ) : (
                        <p className="no-records-placeholder">Seleccione un {scopeType} para cargar la lista de animales.</p>
                    )}

                    <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={!scopeValue || rows.length === 0}>
                            Confirmar Sesión ({weighedNow})
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
