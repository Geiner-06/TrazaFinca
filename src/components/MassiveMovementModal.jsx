import { useState, useEffect } from 'react';

export default function MassiveMovementModal({ isOpen, onClose, onSave, potreros, potreroAssignments, animals }) {
    const [sourcePotreroId, setSourcePotreroId] = useState('');
    const [destPotreroId, setDestPotreroId] = useState('');
    const [fechaAsignacion, setFechaAsignacion] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (isOpen) {
            setSourcePotreroId('');
            setDestPotreroId('');
            setFechaAsignacion(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const getAnimalsInPotrero = (pId) => {
        const activeAssignments = potreroAssignments.filter(a => a.potreroId === pId && a.fechaSalida === null);
        return activeAssignments.map(as => as.animalId);
    };

    const getOcupacion = (pId) => getAnimalsInPotrero(pId).length;

    const animalsToMove = sourcePotreroId ? getAnimalsInPotrero(sourcePotreroId) : [];

    const destPotrero = potreros.find(p => p.id === destPotreroId);
    let errorCapacidad = null;

    if (destPotrero && sourcePotreroId) {
        const capacidadMaxima = destPotrero.capacidadMaxima || (destPotrero.areaHa * destPotrero.capacidadPorHa);
        const ocupacionActual = getOcupacion(destPotrero.id);
        const nuevosAnimales = animalsToMove.length;

        // Validamos la capacidad (Criterio 3 de HU-25)
        if (ocupacionActual + nuevosAnimales > capacidadMaxima) {
            errorCapacidad = `Capacidad excedida. Capacidad Máxima: ${capacidadMaxima}. Ocupación actual: ${ocupacionActual}. Intentando añadir: ${nuevosAnimales}.`;
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(animalsToMove, destPotreroId, fechaAsignacion, sourcePotreroId);
    };

    return (
        <div className="cv-overlay">
            <div className="cv-modal">
                <div className="cv-header">
                    <div>
                        {/* HU-25 */}
                        <p className="cv-title">Traslado Masivo de Lote</p>
                        <p className="cv-subtitle">Mueva todos los animales de un potrero a otro</p>
                    </div>
                    <button className="cv-close-btn" onClick={onClose} aria-label="Cerrar">&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="cv-body">
                        <div className="cv-form-grid">
                            <div className="cv-fg cv-fg-full">
                                <label>Potrero de Origen *</label>
                                <select required value={sourcePotreroId} onChange={e => { setSourcePotreroId(e.target.value); if (e.target.value === destPotreroId) setDestPotreroId(''); }}>
                                    <option value="">Seleccione el potrero origen</option>
                                    {potreros.map(p => {
                                        const count = getOcupacion(p.id);
                                        return (
                                            <option key={p.id} value={p.id} disabled={count === 0}>
                                                {p.nombre} ({count} animales)
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="cv-fg cv-fg-full">
                                <label>Potrero Destino *</label>
                                <select required value={destPotreroId} onChange={e => setDestPotreroId(e.target.value)} disabled={!sourcePotreroId}>
                                    <option value="">Seleccione el potrero destino</option>
                                    {potreros.filter(p => p.id !== sourcePotreroId && p.estado !== 'en descanso' && p.estado !== 'en mantenimiento').map(p => {
                                        const ocupacion = getOcupacion(p.id);
                                        const capacidad = p.capacidadMaxima || (p.areaHa * p.capacidadPorHa);
                                        return (
                                            <option key={p.id} value={p.id}>
                                                {p.nombre} (Ocupación: {ocupacion}/{capacidad})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="cv-fg cv-fg-full">
                                <label>Fecha de Movimiento *</label>
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

                            {sourcePotreroId && animalsToMove.length > 0 && !errorCapacidad && destPotreroId && (
                                <div className="cv-fg cv-fg-full">
                                    <div style={{ color: '#2e7d32', background: '#e8f5e9', padding: '10px', borderRadius: '4px', fontSize: '0.9rem' }}>
                                        Listo para trasladar <strong>{animalsToMove.length} animales</strong>.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="cv-actions">
                        <button type="button" className="cv-btn-sec" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="cv-btn-pri" disabled={!sourcePotreroId || !destPotreroId || animalsToMove.length === 0 || !!errorCapacidad}>
                            Confirmar Movimiento
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
