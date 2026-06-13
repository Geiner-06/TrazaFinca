/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function FeedStockEntryModal({ isOpen, onClose, onSave, item }) {
    const [form, setForm] = useState({ cantidad: '', proveedor: '', costoUnitario: '', fecha: '' });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen && item) {
            setForm({ cantidad: '', proveedor: item.proveedor || '', costoUnitario: '', fecha: getTodayStr() });
            setErrors({});
            setSubmitted(false);
        }
    }, [isOpen, item]);

    if (!isOpen || !item) return null;

    const cantNum = parseFloat(form.cantidad);
    const costNum = parseFloat(form.costoUnitario);
    const costoTotal = !isNaN(cantNum) && !isNaN(costNum) ? cantNum * costNum : null;

    const validate = () => {
        const newErrors = {};
        if (form.cantidad === '' || isNaN(cantNum) || cantNum <= 0) newErrors.cantidad = 'Cantidad inválida';
        if (!form.proveedor.trim()) newErrors.proveedor = 'El proveedor es obligatorio';
        if (form.costoUnitario === '' || isNaN(costNum) || costNum < 0) newErrors.costoUnitario = 'Costo inválido';
        if (!form.fecha) newErrors.fecha = 'La fecha es obligatoria';
        else if (form.fecha > getTodayStr()) newErrors.fecha = 'La fecha no puede ser futura';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (validate()) {
            onSave({
                feedItemId: item.id,
                cantidad: cantNum,
                proveedor: form.proveedor.trim(),
                costoUnitario: costNum,
                costoTotal: Math.round(cantNum * costNum * 100) / 100,
                fecha: form.fecha
            });
            onClose();
        }
    };

    return (
        <div className="modal-overlay open">
            <div className="modal-card" style={{ maxWidth: '560px' }}>
                <div className="modal-header">
                    <h2>Registrar Entrada de Stock</h2>
                    <button type="button" aria-label="Cerrar" className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} noValidate style={{ padding: '1.5rem' }}>
                    <div className="stock-entry-context">
                        Insumo: <strong>{item.nombre}</strong> · Stock actual: <strong>{item.cantidad} {item.unidad}</strong>
                    </div>

                    {submitted && Object.keys(errors).length > 0 && (
                        <div className="form-alert">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <span>Complete los campos obligatorios.</span>
                        </div>
                    )}

                    <div className="form-grid">
                        <div className={`form-group ${errors.cantidad ? 'invalid' : ''}`}>
                            <label>Cantidad ingresada ({item.unidad}) *</label>
                            <input type="number" step="0.1" min="0" placeholder="Ej. 50"
                                value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} />
                            {errors.cantidad && <span className="error-msg">{errors.cantidad}</span>}
                        </div>

                        <div className={`form-group ${errors.costoUnitario ? 'invalid' : ''}`}>
                            <label>Costo unitario (₡/{item.unidad}) *</label>
                            <input type="number" step="0.01" min="0" placeholder="Ej. 280"
                                value={form.costoUnitario} onChange={e => setForm({ ...form, costoUnitario: e.target.value })} />
                            {errors.costoUnitario && <span className="error-msg">{errors.costoUnitario}</span>}
                        </div>

                        <div className={`form-group full-width ${errors.proveedor ? 'invalid' : ''}`}>
                            <label>Proveedor *</label>
                            <input type="text" placeholder="Ej. Distribuidora El Campo"
                                value={form.proveedor} onChange={e => setForm({ ...form, proveedor: e.target.value })} />
                            {errors.proveedor && <span className="error-msg">{errors.proveedor}</span>}
                        </div>

                        <div className={`form-group ${errors.fecha ? 'invalid' : ''}`}>
                            <label>Fecha *</label>
                            <input type="date" max={getTodayStr()}
                                value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
                            {errors.fecha && <span className="error-msg">{errors.fecha}</span>}
                        </div>

                        <div className="form-group">
                            <label>Costo total</label>
                            <div className="stock-entry-total">
                                {costoTotal !== null ? `₡ ${costoTotal.toLocaleString('es-CR')}` : '—'}
                            </div>
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Registrar Entrada</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
