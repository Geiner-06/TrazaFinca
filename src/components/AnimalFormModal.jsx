import React, { useState, useEffect } from 'react';

export default function AnimalFormModal({ isOpen, onClose, onSave, animalToEdit }) {
    const [form, setForm] = useState({ especie: '', proposito: '', sexo: '', raza: '', arete: '', fecha: '', dueño: '' });
    const [error, setError] = useState(false);

    // Efecto para precargar datos si estamos editando (HU-05)
    useEffect(() => {
        if (animalToEdit) {
            setForm(animalToEdit);
        } else {
            setForm({ especie: '', proposito: '', sexo: '', raza: '', arete: '', fecha: '', dueño: '' });
        }
    }, [animalToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.especie || !form.proposito || !form.sexo) {
            setError(true);
            return;
        }
        onSave(form);
        setError(false);
    };

    return (
        <div className="modal-overlay open">
            <div className="modal-card">
                <div className="modal-header">
                    <h2>{animalToEdit ? `Editar Animal: ${animalToEdit.id}` : 'Registrar Nuevo Animal'}</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <div className="form-alert">* Completa los campos obligatorios</div>}
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
                            <label>Raza</label>
                            <input type="text" value={form.raza} onChange={e => setForm({ ...form, raza: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Código Arete (Opcional)</label>
                            <input type="text" value={form.arete} onChange={e => setForm({ ...form, arete: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Fecha Ingreso</label>
                            <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
                        </div>
                        <div className="form-group full-width">
                            <label>Finca / Dueño</label>
                            <input type="text" value={form.dueño} onChange={e => setForm({ ...form, dueño: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">{animalToEdit ? 'Guardar Cambios' : 'Registrar Animal'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}