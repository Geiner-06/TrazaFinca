import { useState, useEffect } from 'react';

export default function DiagnosisFormModal({ isOpen, onClose, onSave, animals }) {
    const [form, setForm] = useState({
        animalId: '',
        fecha: new Date().toISOString().split('T')[0],
        sintomas: '',
        diagnostico: '',
        tratamiento: '',
        estado: 'activo'
    });

    // Catálogo de enfermedades (Criterio 2)
    const enfermedades = [
        { nombre: "Fiebre Aftosa", notificable: true },
        { nombre: "Brucelosis", notificable: true },
        { nombre: "Tuberculosis Bovina", notificable: true },
        { nombre: "Rabia Paralítica", notificable: true },
        { nombre: "Mastitis", notificable: false },
        { nombre: "Neumonía", notificable: false },
        { nombre: "Anaplasmosis", notificable: false },
        { nombre: "Otro / Diagnóstico Presuntivo", notificable: false }
    ];

    if (!isOpen) return null;

    const selectedEnfermedad = enfermedades.find(e => e.nombre === form.diagnostico);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.animalId || !form.diagnostico) return;
        onSave({ ...form, esNotificable: selectedEnfermedad?.notificable || false });
        onClose();
    };

    return (
        <div className="modal-overlay open">
            <div className="modal-card" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2>Registrar Diagnóstico Clínico</h2>
                    <button type="button" aria-label="Cerrar" className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Animal *</label>
                            <select required value={form.animalId} onChange={e => setForm({ ...form, animalId: e.target.value })}>
                                <option value="">Seleccionar Animal</option>
                                {animals.map(a => <option key={a.id} value={a.id}>{a.id} - {a.arete || 'S/A'}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Fecha *</label>
                            <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
                        </div>
                        <div className="form-group full-width">
                            <label>Enfermedad / Diagnóstico *</label>
                            <select required value={form.diagnostico} onChange={e => setForm({ ...form, diagnostico: e.target.value })}>
                                <option value="">Seleccione enfermedad</option>
                                {enfermedades.map(e => <option key={e.nombre} value={e.nombre}>{e.nombre}</option>)}
                            </select>
                        </div>

                        {/* ADVERTENCIA SENASA (Criterio 3) */}
                        {selectedEnfermedad?.notificable && (
                            <div className="senasa-notification-box">
                                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>!</span>
                                <div>
                                    <strong>NOTIFICACIÓN OBLIGATORIA SENASA</strong>
                                    <p>Esta enfermedad es de interés nacional. Debe reportar este caso a las autoridades de salud animal de inmediato.</p>
                                </div>
                            </div>
                        )}

                        <div className="form-group full-width">
                            <label>Síntomas Observados</label>
                            <textarea rows="2" value={form.sintomas} onChange={e => setForm({ ...form, sintomas: e.target.value })} placeholder="Ej: Salivación, cojera, falta de apetito..."></textarea>
                        </div>
                        <div className="form-group full-width">
                            <label>Tratamiento Indicado</label>
                            <input type="text" value={form.tratamiento} onChange={e => setForm({ ...form, tratamiento: e.target.value })} placeholder="Medicamentos o medidas de manejo" />
                        </div>
                        <div className="form-group">
                            <label>Estado del Caso</label>
                            <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                                <option value="activo">Activo (En tratamiento)</option>
                                <option value="resuelto">Resuelto (Recuperado)</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-actions" style={{ marginTop: '20px' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Guardar Diagnóstico</button>
                    </div>
                </form>
            </div>
        </div>
    );
}