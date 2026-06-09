/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';

export default function HealthRecordFormModal({ isOpen, onClose, onSave, animals, preselectedAnimalId, preselectedTipo, preselectedProducto }) {
    const [form, setForm] = useState({
        animalId: '',
        tipoTratamiento: '',
        fechaAplicacion: new Date().toISOString().split('T')[0],
        productoComercial: '',
        lote: '',
        dosis: '',
        viaAdministracion: '',
        veterinario: '',
        periodoRevacunacion: ''
    });

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm({
                animalId: preselectedAnimalId || '',
                tipoTratamiento: preselectedTipo || '',
                fechaAplicacion: new Date().toISOString().split('T')[0],
                productoComercial: preselectedProducto || '',
                lote: '',
                dosis: '',
                viaAdministracion: '',
                veterinario: '',
                periodoRevacunacion: ''
            });
            setErrors({});
            setSubmitted(false);
        }
    }, [isOpen, preselectedAnimalId, preselectedTipo, preselectedProducto]);

    if (!isOpen) return null;

    // Filter active animals only for new records
    const activeAnimals = animals.filter(a => a.estado === 'activo');

    const validate = () => {
        const newErrors = {};
        if (!form.animalId) newErrors.animalId = 'El animal es obligatorio';
        if (!form.tipoTratamiento) newErrors.tipoTratamiento = 'El tipo de tratamiento es obligatorio';
        if (!form.fechaAplicacion) newErrors.fechaAplicacion = 'La fecha de aplicación es obligatoria';
        if (!form.productoComercial.trim()) newErrors.productoComercial = 'El producto comercial es obligatorio';
        if (!form.lote.trim()) newErrors.lote = 'El número de lote es obligatorio';
        if (!form.dosis.trim()) newErrors.dosis = 'La dosis aplicada es obligatoria';
        if (!form.viaAdministracion) newErrors.viaAdministracion = 'La vía de administración es obligatoria';
        if (!form.veterinario.trim()) newErrors.veterinario = 'El veterinario responsable es obligatorio';

        if (form.periodoRevacunacion) {
            const val = parseInt(form.periodoRevacunacion, 10);
            if (isNaN(val) || val < 0) {
                newErrors.periodoRevacunacion = 'Debe ser un número de días válido (0 o más)';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (validate()) {
            onSave({
                ...form,
                periodoRevacunacion: form.periodoRevacunacion ? parseInt(form.periodoRevacunacion, 10) : null
            });
            onClose();
        }
    };

    return (
        <div className="modal-overlay open">
            <div className="modal-card" style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <h2>Registrar Tratamiento Sanitario</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} noValidate style={{ padding: '1.5rem' }}>
                    {submitted && Object.keys(errors).length > 0 && (
                        <div className="form-alert">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <span>Faltan campos obligatorios para el registro oficial.</span>
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
                                {preselectedAnimalId ? (
                                    (() => {
                                        const selected = animals.find(a => a.id === preselectedAnimalId);
                                        return (
                                            <option value={preselectedAnimalId}>
                                                {selected ? `${selected.id} [${selected.arete || 'Sin Arete'}]` : preselectedAnimalId}
                                            </option>
                                        );
                                    })()
                                ) : (
                                    activeAnimals.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.id} {a.arete ? `[${a.arete}]` : ''}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        {/* Tipo */}
                        <div className={`form-group ${errors.tipoTratamiento ? 'invalid' : ''}`}>
                            <label>Tipo de Tratamiento *</label>
                            <select
                                value={form.tipoTratamiento}
                                onChange={e => setForm({ ...form, tipoTratamiento: e.target.value })}
                            >
                                <option value="">Seleccionar tipo</option>
                                <option value="vacuna">Vacuna</option>
                                <option value="desparasitacion_interna">Desparasitación Interna</option>
                                <option value="desparasitacion_externa">Desparasitación Externa</option>
                                <option value="vitamina_mineral">Vitamina / Mineral</option>
                            </select>
                        </div>

                        {/* Fecha */}
                        <div className={`form-group ${errors.fechaAplicacion ? 'invalid' : ''}`}>
                            <label>Fecha de Aplicación *</label>
                            <input
                                type="date"
                                value={form.fechaAplicacion}
                                onChange={e => setForm({ ...form, fechaAplicacion: e.target.value })}
                            />
                        </div>

                        {/* Vía */}
                        <div className={`form-group ${errors.viaAdministracion ? 'invalid' : ''}`}>
                            <label>Vía de Administración *</label>
                            <select
                                value={form.viaAdministracion}
                                onChange={e => setForm({ ...form, viaAdministracion: e.target.value })}
                            >
                                <option value="">Seleccionar vía</option>
                                <option value="Subcutánea">Subcutánea</option>
                                <option value="Intramuscular">Intramuscular</option>
                                <option value="Oral">Oral</option>
                                <option value="Tópica">Tópica (Pour-on)</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        {/* Producto */}
                        <div className={`form-group ${errors.productoComercial ? 'invalid' : ''}`}>
                            <label>Producto Comercial *</label>
                            <input
                                type="text"
                                placeholder="Ej. Dectomax"
                                value={form.productoComercial}
                                onChange={e => setForm({ ...form, productoComercial: e.target.value })}
                            />
                        </div>

                        {/* Lote */}
                        <div className={`form-group ${errors.lote ? 'invalid' : ''}`}>
                            <label>Número de Lote *</label>
                            <input
                                type="text"
                                placeholder="Ej. L-4820X"
                                value={form.lote}
                                onChange={e => setForm({ ...form, lote: e.target.value })}
                            />
                        </div>

                        {/* Dosis */}
                        <div className={`form-group ${errors.dosis ? 'invalid' : ''}`}>
                            <label>Dosis Aplicada *</label>
                            <input
                                type="text"
                                placeholder="Ej. 5 ml"
                                value={form.dosis}
                                onChange={e => setForm({ ...form, dosis: e.target.value })}
                            />
                        </div>

                        {/* Veterinario */}
                        <div className={`form-group ${errors.veterinario ? 'invalid' : ''}`}>
                            <label>Veterinario Responsable *</label>
                            <input
                                type="text"
                                placeholder="Nombre y Licencia"
                                value={form.veterinario}
                                onChange={e => setForm({ ...form, veterinario: e.target.value })}
                            />
                        </div>

                        {/* SECCIÓN ESPECIAL: Revacunación (HU-06 style) */}
                        <div className={`revaccination-container ${errors.periodoRevacunacion ? 'invalid' : ''}`}>
                            <label className="revaccination-label">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                                </svg>
                                Próxima Dosis / Revacunación <span className="optional-tag">(Opcional)</span>
                            </label>

                            <div className="revaccination-content">
                                <div className="input-suffix-wrapper">
                                    <input
                                        type="number"
                                        className="revaccination-input"
                                        placeholder="Ej. 30"
                                        value={form.periodoRevacunacion}
                                        onChange={e => setForm({ ...form, periodoRevacunacion: e.target.value })}
                                    />
                                    <span className="suffix">Días</span>
                                </div>
                                <p className="revaccination-hint">
                                    Indica el plazo para repetir el tratamiento. El sistema generará una alerta automática.
                                </p>
                            </div>
                            {errors.periodoRevacunacion && <span className="error-msg">{errors.periodoRevacunacion}</span>}
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Registrar Tratamiento
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
