import { useState, useMemo } from 'react';

// Función para inferir categoría (HU-24)
const getCategoria = (animal) => {
    if (animal.categoria) return animal.categoria.toLowerCase();
    const esp = (animal.especie || '').toLowerCase();
    const sexo = (animal.sexo || '').toLowerCase();

    if (esp.includes('engorde')) {
        return sexo === 'macho' ? 'novillo' : 'novilla';
    }
    if (esp.includes('vaca') || esp.includes('leche')) return 'vaca';
    if (esp.includes('toro')) return 'toro';

    return esp || 'desconocido';
};

export default function PotrerosDashboard({
    potreros,
    potreroAssignments,
    animals,
    onAddPotrero,
    onEditPotrero,
    onDeletePotrero, // Para aplicar la regla de borrado
    onMassiveMovement
}) {
    // Estados para el formulario de creación/edición (HU-27)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPotrero, setEditingPotrero] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        areaHa: '',
        tipoPasto: '',
        capacidadMaxima: '',
        estado: 'disponible'
    });

    // 1. CONTEO EN TIEMPO REAL: Asignaciones activas mapeadas por Potrero
    const activeAssignments = useMemo(() => {
        return potreroAssignments.filter(a => a.fechaSalida === null);
    }, [potreroAssignments]);

    // Mapeo en tiempo real de ocupación e información de capacidad
    const potrerosOcupacionInfo = useMemo(() => {
        const info = {};
        potreros.forEach(p => {
            const asignados = activeAssignments.filter(a => a.potreroId === p.id);
            const actual = asignados.length;
            const maxima = Number(p.capacidadMaxima) || 1;
            const porcentaje = (actual / maxima) * 100;

            info[p.id] = {
                actual,
                maxima,
                porcentaje,
                isFull: actual >= maxima,
                canReceiveAnimals: p.estado === 'disponible'
            };
        });
        return info;
    }, [potreros, activeAssignments]);

    // Conteo global por categorías para el Inventario
    const globalCounters = useMemo(() => {
        const activeAnimalIds = activeAssignments.map(a => a.animalId);
        const activeAnimalsList = animals.filter(a => activeAnimalIds.includes(a.id));

        const categories = {};
        activeAnimalsList.forEach(a => {
            const cat = getCategoria(a);
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(a);
        });

        return { total: activeAnimalsList.length, byCategory: categories };
    }, [activeAssignments, animals]);

    // Manejadores del Formulario (HU-27)
    const handleOpenCreate = () => {
        setEditingPotrero(null);
        setFormData({ nombre: '', areaHa: '', tipoPasto: '', capacidadMaxima: '', estado: 'disponible' });
        setIsFormOpen(true);
    };

    const handleOpenEdit = (potrero) => {
        setEditingPotrero(potrero);
        setFormData({
            nombre: potrero.nombre,
            areaHa: potrero.areaHa,
            tipoPasto: potrero.tipoPasto || '',
            capacidadMaxima: potrero.capacidadMaxima,
            estado: potrero.estado
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingPotrero) {
            onEditPotrero({ ...editingPotrero, ...formData });
        } else {
            onAddPotrero({ id: Date.now().toString(), ...formData });
        }
        setIsFormOpen(false);
    };

    const handleDelete = (potreroId) => {
        const info = potrerosOcupacionInfo[potreroId];
        // CRITERIO DE ACEPTACIÓN: Impedir eliminar si tiene animales asignados
        if (info && info.actual > 0) {
            alert("No se puede eliminar un potrero que tenga animales asignados actualmente. Solo se permite desactivarlo/cambiar su estado.");
            return;
        }
        if (confirm("¿Está seguro de eliminar este potrero?")) {
            onDeletePotrero(potreroId);
        }
    };

    return (
        <div className="potreros-dashboard" style={{ padding: '20px', fontFamily: 'sans-serif' }}>

            {/* PANEL SUPERIOR: TRASLADO MASIVO Y CONTEO GLOBAL */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{ margin: 0 }}>Control de Inventario en Tiempo Real</h2>
                    <button
                        onClick={onMassiveMovement}
                        style={{ padding: '10px 20px', backgroundColor: '#2196f3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Movimiento Masivo entre Lotes
                    </button>
                </div>

                <p style={{ margin: '0 0 15px 0' }}>Total de animales en pastoreo: <strong>{globalCounters.total}</strong></p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {Object.keys(globalCounters.byCategory).map(cat => (
                        <div key={cat} style={{ background: '#f0f4f8', padding: '8px 15px', borderRadius: '20px', fontSize: '0.9rem' }}>
                            <strong style={{ textTransform: 'capitalize' }}>{cat}s:</strong> {globalCounters.byCategory[cat].length}
                        </div>
                    ))}
                </div>
            </div>

            {/* SECCIÓN HU-27: CATÁLOGO DE POTREROS */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>Catálogo de Potreros</h3>
                    <button
                        onClick={handleOpenCreate}
                        style={{ padding: '8px 16px', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        + Crear Potrero
                    </button>
                </div>

                {/* FORMULARIO DINÁMICO (CREAR / EDITAR) */}
                {isFormOpen && (
                    <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #eee' }}>
                        <h4>{editingPotrero ? 'Editar Potrero' : 'Nuevo Potrero'}</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                            <label>
                                Nombre/Código:
                                <input type="text" required value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} style={{ width: '100%', padding: '6px', marginTop: '5px' }} />
                            </label>
                            <label>
                                Área (Hectáreas):
                                <input type="number" step="0.01" required value={formData.areaHa} onChange={e => setFormData({ ...formData, areaHa: e.target.value })} style={{ width: '100%', padding: '6px', marginTop: '5px' }} />
                            </label>
                            <label>
                                Tipo de Pasto:
                                <input type="text" value={formData.tipoPasto} onChange={e => setFormData({ ...formData, tipoPasto: e.target.value })} style={{ width: '100%', padding: '6px', marginTop: '5px' }} />
                            </label>
                            <label>
                                Capacidad Máxima:
                                <input type="number" required value={formData.capacidadMaxima} onChange={e => setFormData({ ...formData, capacidadMaxima: e.target.value })} style={{ width: '100%', padding: '6px', marginTop: '5px' }} />
                            </label>
                            <label>
                                Estado:
                                <select value={formData.estado} onChange={e => setFormData({ ...formData, estado: e.target.value })} style={{ width: '100%', padding: '6px', marginTop: '5px' }}>
                                    <option value="disponible">Disponible</option>
                                    <option value="en descanso">En descanso</option>
                                    <option value="en mantenimiento">En mantenimiento</option>
                                </select>
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '6px 12px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                            <button type="submit" style={{ padding: '6px 12px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Guardar</button>
                        </div>
                    </form>
                )}

                {/* LISTADO DE POTREROS CON MAPEO VISUAL DE CAPACIDAD */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', background: '#f4f4f4' }}>
                                <th style={{ padding: '12px' }}>Nombre/Código</th>
                                <th style={{ padding: '12px' }}>Características</th>
                                <th style={{ padding: '12px' }}>Estado</th>
                                <th style={{ padding: '12px', width: '30%' }}>Ocupación Visual vs Capacidad</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {potreros.map(p => {
                                const info = potrerosOcupacionInfo[p.id] || { actual: 0, maxima: 1, porcentaje: 0, canReceiveAnimals: true };

                                // Determinar color del estado de ocupación
                                let barColor = '#4caf50'; // Normal
                                if (p.estado !== 'disponible') barColor = '#9e9e9e'; // Inactivo por descanso/mantenimiento
                                else if (info.porcentaje > 100) barColor = '#f44336'; // Sobrecarga
                                else if (info.porcentaje >= 90) barColor = '#ffb300'; // Advertencia

                                return (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px' }}><strong>{p.nombre}</strong></td>
                                        <td style={{ padding: '12px', fontSize: '0.9rem', color: '#555' }}>
                                            {p.areaHa} ha • Pasto: {p.tipoPasto || 'No definido'}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase',
                                                background: p.estado === 'disponible' ? '#e8f5e9' : '#fff3e0',
                                                color: p.estado === 'disponible' ? '#2e7d32' : '#ef6c00'
                                            }}>
                                                {p.estado}
                                            </span>
                                            {/* Indicador HU-27: bloqueo de asignación si está en descanso o mantenimiento */}
                                            {!info.canReceiveAnimals && (
                                                <small style={{ display: 'block', color: '#f44336', marginTop: '4px' }}>🔒 Bloqueado para animales</small>
                                            )}
                                        </td>

                                        {/* Representación visual de Ocupación actual vs Máxima */}
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                                                <span>{info.actual} / {info.maxima} animales</span>
                                                <strong>{Math.round(info.porcentaje)}%</strong>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${Math.min(info.porcentaje, 100)}%`, height: '100%', background: barColor, transition: 'width 0.3s' }}></div>
                                            </div>
                                        </td>

                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleOpenEdit(p)}
                                                style={{ marginRight: '8px', padding: '5px 10px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                style={{ padding: '5px 10px', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}