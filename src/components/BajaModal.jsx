import { useState } from 'react';

export default function BajaModal({ isOpen, onClose, onConfirm, animalId }) {
    const [bajaData, setBajaData] = useState({
        motivo: '',
        comentarios: '',
        fecha: new Date().toISOString().split('T')[0] // Fecha de hoy por defecto
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!bajaData.motivo || !bajaData.fecha) return;
        onConfirm(animalId, bajaData);
        onClose();
    };

    return (
        <div className="modal-overlay open modal-nested">
            <div className="modal-card baja-card">
                <div className="modal-header">
                    <h2>Registrar Baja: {animalId}</h2>
                    <button type="button" aria-label="Cerrar" className="btn-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Motivo de la Baja *</label>
                        <select
                            required
                            value={bajaData.motivo}
                            onChange={e => setBajaData({ ...bajaData, motivo: e.target.value })}
                        >
                            <option value="">Seleccione motivo</option>
                            <option value="Vendido">Vendido</option>
                            <option value="Muerto">Muerto</option>
                            <option value="Sacrificado">Sacrificado</option>
                            <option value="Otro">Otro / Traspaso</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Detalles / Comentarios</label>
                        <textarea
                            rows="3"
                            value={bajaData.comentarios}
                            onChange={e => setBajaData({ ...bajaData, comentarios: e.target.value })}
                            placeholder="Ej. Comprador, causa de muerte..."
                        />
                    </div>
                    <div className="form-group">
                        <label>Fecha de Baja *</label>
                        <input
                            type="date"
                            required
                            value={bajaData.fecha}
                            onChange={e => setBajaData({ ...bajaData, fecha: e.target.value })}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-danger">Confirmar Baja</button>
                    </div>
                </form>
            </div>
        </div>
    );
}