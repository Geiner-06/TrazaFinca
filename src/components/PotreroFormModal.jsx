import { useState, useEffect } from 'react';
export default function PotreroFormModal({ isOpen, onClose, onSave, potreroToEdit, potreroAssignments }) {
    const [formData, setFormData] = useState({
        nombre: '',
        areaHa: '',
        tipoPasto: '',
        capacidadMaxima: '',
        estado: 'disponible'
    });
    const [error, setError] = useState(null);
    useEffect(() => {
        if (isOpen) {
            if (potreroToEdit) {
                setFormData({
                    nombre: potreroToEdit.nombre || '',
                    areaHa: potreroToEdit.areaHa || '',
                    tipoPasto: potreroToEdit.tipoPasto || '',
                    capacidadMaxima: potreroToEdit.capacidadMaxima || (potreroToEdit.areaHa * potreroToEdit.capacidadPorHa) || '',
                    estado: potreroToEdit.estado || 'disponible'
                });
            } else {
                setFormData({
                    nombre: '',
                    areaHa: '',
                    tipoPasto: '',
                    capacidadMaxima: '',
                    estado: 'disponible'
                });
            }
            setError(null);
        }
    }, [isOpen, potreroToEdit]);
    if (!isOpen) return null;
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation for state changes if there are animals assigned
        if (potreroToEdit && (formData.estado === 'en descanso' || formData.estado === 'en mantenimiento')) {
            const ocupacion = potreroAssignments.filter(a => a.potreroId === potreroToEdit.id && a.fechaSalida === null).length;
            if (ocupacion > 0) {
                setError(`No se puede poner en estado "${formData.estado}" un potrero que tiene animales asignados (${ocupacion} animales).`);
                return;
            }
        }

        onSave({
            ...potreroToEdit,
            nombre: formData.nombre,
            areaHa: parseFloat(formData.areaHa),
            tipoPasto: formData.tipoPasto,
            capacidadMaxima: parseInt(formData.capacidadMaxima, 10),
            estado: formData.estado
        });
    };
    return (
        <div className="cv-overlay">
            <div className="cv-modal">
                <div className="cv-header">
                    <div>
                        {/* HU-27 */}
                        <p className="cv-title">{potreroToEdit ? 'Editar Potrero' : 'Registrar Nuevo Potrero'}</p>
                        <p className="cv-subtitle">Ingrese los datos del potrero</p>
                    </div>
                    <button className="cv-close-btn" onClick={onClose} aria-label="Cerrar">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="cv-body">
                        {error && (
                            <div style={{ color: '#d32f2f', background: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
                                {error}
                            </div>
                        )}
                        <div className="cv-form-grid">
                            <div className="cv-fg">
                                <label>Nombre o Código *</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    required
                                    value={formData.nombre}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="cv-fg">
                                <label>Área en Hectáreas *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="areaHa"
                                    required
                                    value={formData.areaHa}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="cv-fg">
                                <label>Tipo de Pasto</label>
                                <input
                                    type="text"
                                    name="tipoPasto"
                                    placeholder="Ej: Estrella, Brachiaria..."
                                    value={formData.tipoPasto}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="cv-fg">
                                <label>Capacidad Máxima de Animales *</label>
                                <input
                                    type="number"
                                    name="capacidadMaxima"
                                    required
                                    min="1"
                                    value={formData.capacidadMaxima}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="cv-fg cv-fg-full">
                                <label>Estado *</label>
                                <select name="estado" required value={formData.estado} onChange={handleChange}>
                                    <option value="disponible">Disponible (Activo)</option>
                                    <option value="en descanso">En Descanso</option>
                                    <option value="en mantenimiento">En Mantenimiento</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="cv-actions">
                        <button type="button" className="cv-btn-sec" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="cv-btn-pri">Guardar Potrero</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
