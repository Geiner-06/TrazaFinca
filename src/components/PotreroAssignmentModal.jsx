import { useState, useEffect } from 'react';

export default function PotreroAssignmentModal({ isOpen, onClose, onSave, animals, potreros, potreroAssignments, preselectedAnimalIds = [] }) {
    const [step, setStep] = useState(1);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPotreroId, setSelectedPotreroId] = useState("");
    const [fechaAsignacion, setFechaAsignacion] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (isOpen) {
            setSelectedIds(preselectedAnimalIds);
            setStep(preselectedAnimalIds.length > 0 ? 2 : 1);
            setSelectedPotreroId("");
            setFechaAsignacion(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen, preselectedAnimalIds]);

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
        onSave(selectedIds, selectedPotreroId, fechaAsignacion);
    };

    const allSelected = activeAnimals.length > 0 && selectedIds.length === activeAnimals.length;

    // Calcular ocupación de cada potrero
    const getOcupacion = (pId) => {
        return potreroAssignments.filter(a => a.potreroId === pId && a.fechaSalida === null).length;
    };

    const selectedPotrero = potreros.find(p => p.id === selectedPotreroId);
    let errorCapacidad = null;
    
    if (selectedPotrero) {
        const capacidadMaxima = selectedPotrero.areaHa * selectedPotrero.capacidadPorHa;
        const ocupacionActual = getOcupacion(selectedPotrero.id);
        
        const nuevosAnimales = selectedIds.filter(id => {
            const current = potreroAssignments.find(a => a.animalId === id && a.fechaSalida === null);
            return !current || current.potreroId !== selectedPotrero.id;
        }).length;

        if (ocupacionActual + nuevosAnimales > capacidadMaxima) {
            errorCapacidad = `Capacidad excedida. Capacidad: ${capacidadMaxima}. Ocupación actual: ${ocupacionActual}. Intentando añadir: ${nuevosAnimales}.`;
        }
    }

    return (
        <div className="cv-overlay">
            <div className="cv-modal">
                <div className="cv-header">
                    <div>
                        <p className="cv-title">Asignar a Potrero</p>
                        <p className="cv-subtitle">Seleccione los animales y el potrero destino</p>
                    </div>
                    <button className="cv-close-btn" onClick={onClose} aria-label="Cerrar">
                        &times;
                    </button>
                </div>

                <div className="cv-stepper">
                    <div className={`cv-step ${step === 1 ? 'active' : 'done'}`}>
                        <div className="cv-step-num">1</div>
                        <span>Selección de animales</span>
                    </div>
                    <div className="cv-step-line" />
                    <div className={`cv-step ${step === 2 ? 'active' : ''}`}>
                        <div className="cv-step-num">2</div>
                        <span>Asignación</span>
                    </div>
                </div>

                {step === 1 && (
                    <>
                        <div className="cv-body">
                            <div className="cv-topbar">
                                <div className="cv-search">
                                    <span className="cv-search-icon">🔍</span>
                                    <input
                                        type="text"
                                        aria-label="Buscar" placeholder="Buscar por ID o arete…"
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
                                            <span className="cv-acard-sp">{a.potrero || 'Sin asignar'}</span>
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

                {step === 2 && (
                    <form onSubmit={handleSubmit}>
                        <div className="cv-body">
                            <div className="cv-campaign-note">
                                Asignando <strong>{selectedIds.length} animal{selectedIds.length !== 1 ? 'es' : ''}</strong> a un nuevo potrero.
                            </div>

                            <div className="cv-form-grid">
                                <div className="cv-fg cv-fg-full">
                                    <label>Potrero Destino *</label>
                                    <select
                                        required
                                        value={selectedPotreroId}
                                        onChange={e => setSelectedPotreroId(e.target.value)}
                                    >
                                        <option value="">Seleccione un potrero</option>
                                        {potreros.filter(p => p.estado === 'activo').map(p => {
                                            const ocupacion = getOcupacion(p.id);
                                            const capacidad = p.areaHa * p.capacidadPorHa;
                                            return (
                                                <option key={p.id} value={p.id}>
                                                    {p.nombre} (Ocupación: {ocupacion}/{capacidad})
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>
                                <div className="cv-fg cv-fg-full">
                                    <label>Fecha de Asignación *</label>
                                    <input
                                        type="date"
                                        required
                                        value={fechaAsignacion}
                                        onChange={e => setFechaAsignacion(e.target.value)}
                                    />
                                </div>
                                {errorCapacidad && (
                                    <div className="cv-fg cv-fg-full">
                                        <div style={{ color: '#d32f2f', background: '#ffebee', padding: '10px', borderRadius: '4px', fontSize: '0.9rem' }}>
                                            {errorCapacidad}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="cv-actions">
                            <button type="button" className="cv-btn-sec" onClick={() => setStep(1)}>
                                ← Volver
                            </button>
                            <button type="submit" className="cv-btn-pri" disabled={!selectedPotreroId || !!errorCapacidad}>
                                Confirmar Asignación
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
