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
    onDeletePotrero,
    onMassiveMovement
}) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPotrero, setEditingPotrero] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        areaHa: '',
        tipoPasto: '',
        capacidadMaxima: '',
        estado: 'disponible'
    });

    // 1. CONTEO EN TIEMPO REAL: Asignaciones activas
    const activeAssignments = useMemo(() => {
        return potreroAssignments.filter(a => a.fechaSalida === null);
    }, [potreroAssignments]);

    // Mapeo de ocupación en tiempo real por Potrero
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

    // 2. HU-28: GENERACIÓN DE ALERTAS EN TIEMPO REAL (No descartables manualmente)
    const sobrecargaAlertas = useMemo(() => {
        const alertas = [];
        potreros.forEach(p => {
            const info = potrerosOcupacionInfo[p.id];
            if (!info) return;

            if (info.porcentaje > 100) {
                alertas.push({
                    potreroId: p.id,
                    nombre: p.nombre,
                    tipo: 'critica',
                    mensaje: `CRÍTICO: El potrero "${p.nombre}" ha superado su capacidad máxima. Ocupación: ${info.actual}/${info.maxima} (${Math.round(info.porcentaje)}%).`,
                    color: '#f44336',
                    bgColor: '#ffebee',
                    borderColor: '#f44336'
                });
            } else if (info.porcentaje >= 90) {
                alertas.push({
                    potreroId: p.id,
                    nombre: p.nombre,
                    tipo: 'advertencia',
                    mensaje: `ADVERTENCIA: El potrero "${p.nombre}" está cerca del límite de sobrepastoreo. Ocupación: ${info.actual}/${info.maxima} (${Math.round(info.porcentaje)}%).`,
                    color: '#b78103',
                    bgColor: '#fff8e1',
                    borderColor: '#ffb300'
                });
            }
        });
        return alertas;
    }, [potreros, potrerosOcupacionInfo]);

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
        if (info && info.actual > 0) {
            alert("No se puede eliminar un potrero que tenga animales asignados actualmente. Solo se permite desactivarlo.");
            return;
        }
        if (confirm("¿Está seguro de eliminar este potrero?")) {
            onDeletePotrero(potreroId);
        }
    };

    return (
        <div className="potreros-dashboard" style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>

            {/* SECCIÓN HU-28: PANEL DE ALERTAS EN PANTALLA PRINCIPAL */}
            {sobrecargaAlertas.length > 0 && (
                <div className="alerts-section" style={{ marginBottom: '25px' }}>
                    <h3 style={{ color: '#d32f2f', marginTop: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ⚠️ Alertas Activas de Riesgo de Sobrepastoreo
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {sobrecargaAlertas.map((alerta) => (
                            <div
                                key={alerta.potreroId}
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: alerta.bgColor,
                                    color: alerta.color,
                                    border: `1px solid ${alerta.borderColor}`,
                                    borderRadius: '6px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontWeight: '500',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                            >
                                <span>{alerta.mensaje}</span>
                                <span style={{ fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.8, background: '#fff', padding: '4px 8px', borderRadius: '4px', border: `1px solid ${alerta.borderColor}` }}>
                                    Ajuste la capacidad o traslade lotes para solucionar
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* PANEL SUPERIOR: TRASLADO MASIVO Y CONTEO GLOBAL */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '25px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{ margin: 0, color: '#333' }}>Control de Inventario en Tiempo Real</h2>
                    <button
                        onClick={onMassiveMovement}
                        style={{ padding: '10px 20px', backgroundColor: '#2196f3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Movimiento Masivo entre Lotes
                    </button>
                </div>

                <p style={{ margin: '0 0 15px 0', color: '#555' }}>Total de animales en pastoreo: <strong>{globalCounters.total}</strong></p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {Object.keys(globalCounters.byCategory).map(cat => (
                        <div key={cat} style={{ background: '#f0f4f8', padding: '8px 15px', borderRadius: '20px', fontSize: '0.9rem', color: '#333' }}>
                            <strong style={{ textTransform: 'capitalize' }}>{cat}s:</strong> {globalCounters.byCategory[cat].length}
                        </div>
                    ))}
                </div>
            </div>

            {/* SECCIÓN HU-27: CATÁLOGO DE POTREROS */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>Catálogo de Potreros</h3>
                    <button
                        onClick={handleOpenCreate}
                        style={{ padding: '8px 16px', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        + Crear Potrero
                    </button>
                </div>

                {/* FORMULARIO DINÁMICO */}
                {isFormOpen && (
                    <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #eee' }}>
                        <h4 style={{ margin: '0 0 15px 0' }}>{editingPotrero ? 'Editar Potrero' : 'Nuevo Potrero'}</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                Nombre/Código:
                                <input type="text" required value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} />
                            </label>
                            <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                Área (Hectáreas):
                                <input type="number" step="0.01" required value={formData.areaHa} onChange={e => setFormData({ ...formData, areaHa: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} />
                            </label>
                            <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                Tipo de Pasto:
                                <input type="text" value={formData.tipoPasto} onChange={e => setFormData({ ...formData, tipoPasto: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} />
                            </label>
                            <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                Capacidad Máxima (Animales):
                                <input type="number" required value={formData.capacidadMaxima} onChange={e => setFormData({ ...formData, capacidadMaxima: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} />
                            </label>
                            <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                Estado:
                                <select value={formData.estado} onChange={e => setFormData({ ...formData, estado: e.target.value })} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}>
                                    <option value="disponible">Disponible</option>
                                    <option value="en descanso">En descanso</option>
                                    <option value="en mantenimiento">En mantenimiento</option>
                                </select>
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                            <button type="submit" style={{ padding: '8px 16px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar</button>
                        </div>
                    </form>
                )}

                {/* LISTADO DE POTREROS */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', background: '#f4f4f4' }}>
                                <th style={{ padding: '12px' }}>Nombre/Código</th>
                                <th style={{ padding: '12px' }}>Características</th>
                                <th style={{ padding: '12px' }}>Estado</th>
                                <th style={{ padding: '12px', width: '35%' }}>Ocupación Visual vs Capacidad</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {potreros.map(p => {
                                const info = potrerosOcupacionInfo[p.id] || { actual: 0, maxima: 1, porcentaje: 0, canReceiveAnimals: true };

                                let barColor = '#4caf50';
                                if (p.estado !== 'disponible') barColor = '#9e9e9e';
                                else if (info.porcentaje > 100) barColor = '#f44336'; // Crítico
                                else if (info.porcentaje >= 90) barColor = '#ffb300'; // Advertencia

                                return (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #eee', background: info.porcentaje > 100 ? '#ffebee' : info.porcentaje >= 90 ? '#fff8e1' : 'transparent' }}>
                                        <td style={{ padding: '12px' }}>
                                            <strong>{p.nombre}</strong>
                                            {info.porcentaje > 100 && <span style={{ display: 'block', color: '#f44336', fontSize: '0.75rem', fontWeight: 'bold' }}>⚠️ SOBRECARGA</span>}
                                            {info.porcentaje >= 90 && info.porcentaje <= 100 && <span style={{ display: 'block', color: '#b78103', fontSize: '0.75rem', fontWeight: 'bold' }}>⚠️ RIESGO</span>}
                                        </td>
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
                                            {!info.canReceiveAnimals && (
                                                <small style={{ display: 'block', color: '#f44336', marginTop: '4px' }}>🔒 Bloqueado</small>
                                            )}
                                        </td>

                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                                                <span>{info.actual} / {info.maxima} cabezas</span>
                                                <strong style={{ color: info.porcentaje >= 90 ? '#d32f2f' : '#333' }}>{Math.round(info.porcentaje)}%</strong>
                                            </div>
                                            <div style={{ width: '100%', height: '10px', background: '#eee', borderRadius: '5px', overflow: 'hidden' }}>
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