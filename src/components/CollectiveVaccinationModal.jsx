import { useState } from 'react';

export default function CollectiveVaccinationModal({ isOpen, onClose, onSave, animals }) {
    console.log("Modal colectiva:", isOpen);
    const [step, setStep] = useState(1);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        tipoTratamiento: '',
        fechaAplicacion: new Date().toISOString().split('T')[0],
        productoComercial: '',
        lote: '',
        dosis: '',
        viaAdministracion: '',
        veterinario: '',
        periodoRevacunacion: ''
    });

    if (!isOpen) return null;

    const activeAnimals = animals.filter(a =>
        a.estado === 'activo' &&
        (a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.arete?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const toggleAnimal = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === activeAnimals.length) setSelectedIds([]);
        else setSelectedIds(activeAnimals.map(a => a.id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(selectedIds, formData);
        setStep(1);
        setSelectedIds([]);
        onClose();
    };

    const allSelected = activeAnimals.length > 0 && selectedIds.length === activeAnimals.length;

    return (
        <div className="cv-overlay">
            <div className="cv-modal">

                {/* Header */}
                <div className="cv-header">
                    <div>
                        <p className="cv-title">Campaña colectiva</p>
                        <p className="cv-subtitle">Registro masivo de tratamientos</p>
                    </div>
                    <button className="cv-close-btn" onClick={onClose} aria-label="Cerrar">
                        &times;
                    </button>
                </div>

                {/* Stepper */}
                <div className="cv-stepper">
                    <div className={`cv-step ${step === 1 ? 'active' : 'done'}`}>
                        <div className="cv-step-num">1</div>
                        <span>Selección de animales</span>
                    </div>
                    <div className="cv-step-line" />
                    <div className={`cv-step ${step === 2 ? 'active' : ''}`}>
                        <div className="cv-step-num">2</div>
                        <span>Detalles del lote</span>
                    </div>
                </div>

                {/* Step 1 */}
                {step === 1 && (
                    <>
                        <div className="cv-body">
                            <div className="cv-topbar">
                                <div className="cv-search">
                                    <span className="cv-search-icon">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Buscar por ID o arete…"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <span className="cv-count-badge">
                                    <strong>{selectedIds.length}</strong> seleccionado{selectedIds.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="cv-picker-wrap">
                                <button className="cv-sel-all-btn" onClick={handleSelectAll}>
                                    {allSelected ? '☐ Desmarcar todos' : '☑ Seleccionar todos'}
                                </button>
                                <div className="cv-animal-grid">
                                    {activeAnimals.map(a => (
                                        <div
                                            key={a.id}
                                            className={`cv-acard${selectedIds.includes(a.id) ? ' sel' : ''}`}
                                            onClick={() => toggleAnimal(a.id)}
                                        >
                                            <div className="cv-acard-check">
                                                {selectedIds.includes(a.id) && '✓'}
                                            </div>
                                            <span className="cv-acard-id">{a.id}</span>
                                            <span className="cv-acard-arete">{a.arete || 'S/A'}</span>
                                            <span className="cv-acard-sp">{a.especie}</span>
                                        </div>
                                    ))}
                                    {activeAnimals.length === 0 && (
                                        <p className="cv-empty">Sin resultados para "{searchTerm}"</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="cv-actions">
                            <button className="cv-btn-sec" onClick={onClose}>Cancelar</button>
                            <button
                                className="cv-btn-pri"
                                disabled={selectedIds.length === 0}
                                onClick={() => setStep(2)}
                            >
                                Continuar →
                            </button>
                        </div>
                    </>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <form onSubmit={handleSubmit}>
                        <div className="cv-body">
                            <div className="cv-campaign-note">
                                Trabajando con un lote de{' '}
                                <strong>{selectedIds.length} animal{selectedIds.length !== 1 ? 'es' : ''}</strong>.
                            </div>

                            <div className="cv-form-grid">
                                <div className="cv-fg">
                                    <label>Tipo de tratamiento *</label>
                                    <select
                                        required
                                        value={formData.tipoTratamiento}
                                        onChange={e => setFormData({ ...formData, tipoTratamiento: e.target.value })}
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="vacuna">Vacuna</option>
                                        <option value="desparasitacion_interna">Desparasitación interna</option>
                                        <option value="vitamina_mineral">Vitamina / mineral</option>
                                    </select>
                                </div>

                                <div className="cv-fg">
                                    <label>Fecha de aplicación *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.fechaAplicacion}
                                        onChange={e => setFormData({ ...formData, fechaAplicacion: e.target.value })}
                                    />
                                </div>

                                <div className="cv-fg">
                                    <label>Producto comercial *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Antraxvac"
                                        required
                                        value={formData.productoComercial}
                                        onChange={e => setFormData({ ...formData, productoComercial: e.target.value })}
                                    />
                                </div>

                                <div className="cv-fg">
                                    <label>Dosis por animal *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. 5ml"
                                        required
                                        value={formData.dosis}
                                        onChange={e => setFormData({ ...formData, dosis: e.target.value })}
                                    />
                                </div>

                                <div className="cv-fg cv-fg-full">
                                    <label>Veterinario responsable *</label>
                                    <input
                                        type="text"
                                        placeholder="Nombre completo"
                                        required
                                        value={formData.veterinario}
                                        onChange={e => setFormData({ ...formData, veterinario: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="cv-actions">
                            <button type="button" className="cv-btn-sec" onClick={() => setStep(1)}>
                                ← Volver
                            </button>
                            <button type="submit" className="cv-btn-pri">
                                Confirmar campaña masiva
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}