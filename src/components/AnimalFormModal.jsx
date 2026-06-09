import React, { useState } from 'react';

export default function AnimalFormModal({ isOpen, onClose, onSave }) {
    const [form, setForm] = useState({ especie: '', proposito: '', sexo: '', raza: '', arete: '' });
    const [error, setError] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.especie || !form.proposito || !form.sexo) {
            setError(true);
            return;
        }
        onSave(form);
        setForm({ especie: '', proposito: '', sexo: '', raza: '', arete: '' });
        setError(false);
    };

    return (
        <div className="modal-overlay open">
            <div className="modal-card">
                <div className="modal-header">
                    <h2>Registrar Animal</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <p style={{ color: 'red' }}>* Completa los campos obligatorios</p>}
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Especie *</label>
                            <select value={form.especie} onChange={e => setForm({ ...form, especie: e.target.value })}>
                                <option value="">Seleccionar</option>
                                <option value="bueyes">Bueyes</option>
                                <option value="vacas">Vacas</option>
                                <option value="caballos">Caballos</option>
                                <option value="cabras">Cabras</option>
                                <option value="ganado de engorde">Ganado de Engorde</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Propósito *</label>
                            <select value={form.proposito} onChange={e => setForm({ ...form, proposito: e.target.value })}>
                                <option value="">Seleccionar</option>
                                <option value="trabajo">Trabajo</option>
                                <option value="producción">Producción</option>
                                <option value="carne">Carne</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Sexo *</label>
                            <select value={form.sexo} onChange={e => setForm({ ...form, sexo: e.target.value })}>
                                <option value="">Seleccionar</option>
                                <option value="Macho">Macho</option>
                                <option value="Hembra">Hembra</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Arete (Opcional)</label>
                            <input type="text" value={form.arete} onChange={e => setForm({ ...form, arete: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Raza</label>
                            <input type="text" value={form.raza} onChange={e => setForm({ ...form, raza: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}