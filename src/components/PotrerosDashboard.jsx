import { useState, useMemo } from 'react';

// Función para inferir categoría (HU-24)
const getCategoria = (animal) => {
    if (animal.categoria) return animal.categoria.toLowerCase();
    const esp = (animal.especie || '').toLowerCase();
    const sexo = (animal.sexo || '').toLowerCase();
    if (esp.includes('engorde')) return sexo === 'macho' ? 'novillo' : 'novilla';
    if (esp.includes('vaca') || esp.includes('leche')) return 'vaca';
    if (esp.includes('toro')) return 'toro';
    return esp || 'desconocido';
};

// HU-29: Colores y estilos por estado de ocupación
const getStatusStyle = (status) => {
    const map = {
        bajo: { bg: '#eaf3de', border: '#639922', bar: '#639922', text: '#27500a', label: 'Baja' },
        normal: { bg: '#e6f1fb', border: '#378add', bar: '#378add', text: '#0c447c', label: 'Media' },
        advertencia: { bg: '#faeeda', border: '#ba7517', bar: '#ef9f27', text: '#633806', label: 'Alta' },
        critico: { bg: '#fcebeb', border: '#e24b4a', bar: '#e24b4a', text: '#501313', label: 'Sobrecarga' },
        inactivo: { bg: '#f1efe8', border: '#888780', bar: '#888780', text: '#444441', label: 'Inactivo' },
    };
    return map[status] || map.bajo;
};

export default function PotrerosDashboard({
    potreros,
    potreroAssignments,
    animals,
    onAddPotrero,
    onEditPotrero,
    onToggleStatus,
    onMassiveMovement
}) {
    const [selectedPotreroId, setSelectedPotreroId] = useState(null);
    const [viewMode, setViewMode] = useState('mapa');

    // Solo asignaciones activas
    const activeAssignments = useMemo(
        () => potreroAssignments.filter(a => a.fechaSalida === null),
        [potreroAssignments]
    );

    const getAnimalsInPotrero = (pId) => {
        const ids = activeAssignments.filter(a => a.potreroId === pId).map(a => a.animalId);
        return animals.filter(a => ids.includes(a.id));
    };

    const getOcupacionInfo = (pId) => {
        const p = potreros.find(pt => pt.id === pId);
        if (!p) return { actual: 0, maxima: 1, porcentaje: 0, status: 'desconocido' };

        const actual = activeAssignments.filter(a => a.potreroId === pId).length;
        const maxima = p.capacidadMaxima || (p.areaHa * p.capacidadPorHa) || 1;
        const porcentaje = (actual / maxima) * 100;

        const inactivo = p.estado === 'en descanso' || p.estado === 'en mantenimiento';
        let status = 'normal';
        if (inactivo) status = 'inactivo';
        else if (porcentaje > 100) status = 'critico';
        else if (porcentaje >= 90) status = 'advertencia';
        else if (porcentaje < 50) status = 'bajo';

        return { actual, maxima, porcentaje, status };
    };

    // Detalle del potrero seleccionado
    const selectedPotrero = potreros.find(p => p.id === selectedPotreroId);
    let selectedAnimals = [];
    let animalsByCategory = {};
    if (selectedPotrero) {
        selectedAnimals = getAnimalsInPotrero(selectedPotrero.id);
        selectedAnimals.forEach(a => {
            const cat = getCategoria(a);
            if (!animalsByCategory[cat]) animalsByCategory[cat] = [];
            animalsByCategory[cat].push(a);
        });
    }

    return (
        <div className="potreros-dashboard">

            {/* Tabs de vista */}
            <div className="report-tabs" style={{ marginBottom: '20px' }}>
                <button
                    className={`report-tab ${viewMode === 'mapa' ? 'active' : ''}`}
                    onClick={() => setViewMode('mapa')}
                >
                    Mapa de Potreros
                </button>
                <button
                    className={`report-tab ${viewMode === 'catalogo' ? 'active' : ''}`}
                    onClick={() => setViewMode('catalogo')}
                >
                    Catálogo de Potreros
                </button>
            </div>

            {/* ── VISTA MAPA (HU-29) ── */}
            {viewMode === 'mapa' && (
                <div className="map-view-container" style={{ display: 'flex', gap: '20px' }}>

                    {/* Mapa visual */}
                    <div className="potreros-map" style={{ flex: '2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3>Distribución Espacial</h3>
                            <button className="btn btn-secondary" onClick={onMassiveMovement}>
                                Traslado Masivo
                            </button>
                        </div>

                        {/* Grid de tarjetas de potrero */}
                        <div className="map-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: '15px'
                        }}>
                            {potreros.map(p => {
                                const info = getOcupacionInfo(p.id);
                                const s = getStatusStyle(info.status);
                                const isSelected = selectedPotreroId === p.id;

                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => setSelectedPotreroId(p.id)}
                                        style={{
                                            position: 'relative',
                                            overflow: 'hidden',
                                            padding: '15px',
                                            borderRadius: '10px',
                                            border: `2px solid ${isSelected ? '#000' : s.border}`,
                                            backgroundColor: s.bg,
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            boxShadow: isSelected ? '0 0 0 3px rgba(0,0,0,0.15)' : 'none',
                                            transition: 'transform 0.15s, box-shadow 0.15s',
                                            transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                                        }}
                                    >
                                        {/* HU-29: patrón de rayas para potreros inactivos */}
                                        {info.status === 'inactivo' && (
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                borderRadius: '10px',
                                                pointerEvents: 'none',
                                                background: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0, rgba(0,0,0,0.04) 6px, transparent 6px, transparent 12px)'
                                            }} />
                                        )}

                                        {/* HU-29: ícono según estado */}
                                        <div style={{ fontSize: '26px', marginBottom: '6px', opacity: 0.75 }}>
                                            {info.status === 'inactivo' ? '💤' : '🐄'}
                                        </div>

                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '13px', color: s.text }}>
                                            {p.nombre}
                                        </h4>
                                        <div style={{ fontSize: '12px', color: s.text, opacity: 0.85 }}>
                                            {info.status === 'inactivo' ? (
                                                <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '11px' }}>
                                                    {p.estado}
                                                </span>
                                            ) : (
                                                <span>{info.actual} / {info.maxima} ({Math.round(info.porcentaje)}%)</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Leyenda HU-29 */}
                        <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.82rem' }}>
                            {[
                                { status: 'bajo', label: 'Baja (<50%)' },
                                { status: 'normal', label: 'Media (50–90%)' },
                                { status: 'advertencia', label: 'Alta (>90%)' },
                                { status: 'critico', label: 'Sobrecarga (>100%)' },
                                { status: 'inactivo', label: 'En descanso / mantenimiento' },
                            ].map(({ status, label }) => {
                                const s = getStatusStyle(status);
                                return (
                                    <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{
                                            width: '14px', height: '14px', borderRadius: '3px',
                                            background: s.bg, border: `1.5px solid ${s.border}`,
                                            flexShrink: 0
                                        }} />
                                        <span style={{ color: '#555' }}>{label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Panel lateral de detalle (HU-24 + HU-29) */}
                    <div
                        className="potrero-detail"
                        style={{
                            flex: '1',
                            background: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: '10px',
                            padding: '20px',
                            maxHeight: '600px',
                            overflowY: 'auto'
                        }}
                    >
                        {selectedPotrero ? (() => {
                            const info = getOcupacionInfo(selectedPotrero.id);
                            const s = getStatusStyle(info.status);
                            return (
                                <>
                                    <h2 style={{ marginBottom: '4px' }}>{selectedPotrero.nombre}</h2>
                                    <p style={{ color: '#666', marginBottom: '16px', fontSize: '13px' }}>
                                        {selectedPotrero.areaHa} ha · Pasto: {selectedPotrero.tipoPasto || 'No definido'}
                                    </p>

                                    {/* HU-29: aviso visual de potrero inactivo */}
                                    {info.status === 'inactivo' && (
                                        <div style={{
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            background: s.bg,
                                            color: s.text,
                                            fontSize: '13px',
                                            marginBottom: '16px',
                                            border: `1px solid ${s.border}`
                                        }}>
                                            ⏸ Potrero <strong>{selectedPotrero.estado}</strong> — sin asignaciones activas
                                        </div>
                                    )}

                                    {/* Barra de ocupación con badge de estado */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '13px', color: '#666' }}>Ocupación</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <strong style={{ fontSize: '13px' }}>
                                                    {Math.round(info.porcentaje)}% ({info.actual}/{info.maxima})
                                                </strong>
                                                {/* HU-29: badge de estado */}
                                                <span style={{
                                                    fontSize: '11px',
                                                    padding: '2px 8px',
                                                    borderRadius: '20px',
                                                    background: s.bg,
                                                    color: s.text,
                                                    fontWeight: 500,
                                                    border: `1px solid ${s.border}`
                                                }}>
                                                    {s.label}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Barra animada */}
                                        <div style={{ height: '10px', background: '#eee', borderRadius: '5px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                background: s.bar,
                                                width: `${Math.min(info.porcentaje, 100)}%`,
                                                transition: 'width 0.4s ease'
                                            }} />
                                        </div>
                                    </div>

                                    {/* Desglose por categoría (HU-24) */}
                                    <h3 style={{ marginBottom: '10px' }}>Desglose de Animales</h3>
                                    {selectedAnimals.length === 0 ? (
                                        <p style={{ fontStyle: 'italic', color: '#888', fontSize: '13px' }}>
                                            No hay animales asignados a este potrero actualmente.
                                        </p>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                                                {Object.keys(animalsByCategory).map(cat => (
                                                    <div key={cat} style={{
                                                        background: '#f0f4f8',
                                                        padding: '4px 10px',
                                                        borderRadius: '15px',
                                                        fontSize: '12px'
                                                    }}>
                                                        <strong style={{ textTransform: 'capitalize' }}>{cat}s:</strong> {animalsByCategory[cat].length}
                                                    </div>
                                                ))}
                                            </div>

                                            <h4 style={{ marginBottom: '8px' }}>Lista Detallada</h4>
                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                {selectedAnimals.map(a => (
                                                    <li key={a.id} style={{
                                                        padding: '8px 0',
                                                        borderBottom: '1px solid #eee',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        fontSize: '13px'
                                                    }}>
                                                        <span>
                                                            <strong>{a.id}</strong>
                                                            {a.arete && ` (${a.arete})`}
                                                        </span>
                                                        <span style={{ color: '#666', textTransform: 'capitalize' }}>
                                                            {getCategoria(a)}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </>
                            );
                        })() : (
                            <div style={{ textAlign: 'center', color: '#888', marginTop: '100px' }}>
                                <div style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.4 }}>🗺️</div>
                                <p style={{ fontSize: '14px' }}>Seleccione un potrero en el mapa para ver sus detalles</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── VISTA CATÁLOGO (HU-27) ── */}
            {viewMode === 'catalogo' && (
                <div className="catalogo-view">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3>Catálogo de Potreros</h3>
                        <button className="btn btn-primary" onClick={onAddPotrero}>Crear Potrero</button>
                    </div>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nombre / Código</th>
                                    <th>Área (ha)</th>
                                    <th>Tipo Pasto</th>
                                    <th>Capacidad Máx.</th>
                                    <th>Ocupación Actual</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {potreros.map(p => {
                                    const info = getOcupacionInfo(p.id);
                                    const s = getStatusStyle(info.status);
                                    return (
                                        <tr key={p.id}>
                                            <td><strong>{p.nombre}</strong></td>
                                            <td>{p.areaHa}</td>
                                            <td>{p.tipoPasto || '—'}</td>
                                            <td>{info.maxima}</td>
                                            <td>
                                                {info.actual}
                                                <span style={{ marginLeft: '5px', color: s.text, fontSize: '12px' }}>
                                                    ({Math.round(info.porcentaje)}%)
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    display: 'inline-block',
                                                    fontSize: '11px',
                                                    padding: '3px 9px',
                                                    borderRadius: '20px',
                                                    background: s.bg,
                                                    color: s.text,
                                                    fontWeight: 500,
                                                    border: `1px solid ${s.border}`
                                                }}>
                                                    {p.estado}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-outline btn-sm"
                                                    onClick={() => onEditPotrero(p)}
                                                >
                                                    Editar
                                                </button>
                                                {info.actual === 0 && p.estado === 'disponible' && (
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        style={{ marginLeft: '5px' }}
                                                        onClick={() => onToggleStatus(p.id, 'en descanso')}
                                                    >
                                                        Dar Descanso
                                                    </button>
                                                )}
                                                {p.estado !== 'disponible' && (
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        style={{ marginLeft: '5px' }}
                                                        onClick={() => onToggleStatus(p.id, 'disponible')}
                                                    >
                                                        Habilitar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}