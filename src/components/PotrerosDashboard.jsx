import { useState, useMemo } from 'react';

// Función para inferir categoría (HU-24)
const getCategoria = (animal) => {
    if (animal.categoria) return animal.categoria.toLowerCase();

    // Inferencia simple
    const esp = (animal.especie || '').toLowerCase();
    const sexo = (animal.sexo || '').toLowerCase();

    if (esp.includes('engorde')) {
        return sexo === 'macho' ? 'novillo' : 'novilla';
    }
    if (esp.includes('vaca') || esp.includes('leche')) return 'vaca';
    if (esp.includes('toro')) return 'toro';

    // Por defecto retornar la especie o 'desconocido'
    return esp || 'desconocido';
};

export default function PotrerosDashboard({
    potreros,
    potreroAssignments,
    animals
}) {
    const [selectedPotreroId, setSelectedPotreroId] = useState(null);

    const activeAssignments = useMemo(
        () => potreroAssignments.filter(a => a.fechaSalida === null),
        [potreroAssignments]
    );

    const getAnimalsInPotrero = (pId) => {
        const ids = activeAssignments.filter(a => a.potreroId === pId).map(a => a.animalId);
        return animals.filter(a => ids.includes(a.id));
    };

    // Conteo y porcentaje de ocupación en tiempo real (HU-24)
    const getOcupacionInfo = (pId) => {
        const p = potreros.find(pt => pt.id === pId);
        if (!p) return { actual: 0, maxima: 1, porcentaje: 0, status: 'desconocido' };

        const actual = activeAssignments.filter(a => a.potreroId === pId).length;
        const maxima = p.capacidadMaxima || (p.areaHa * p.capacidadPorHa) || 1;
        const porcentaje = (actual / maxima) * 100;

        let status = 'normal';
        if (p.estado === 'en descanso' || p.estado === 'en mantenimiento') {
            status = 'inactivo';
        } else if (porcentaje > 100) {
            status = 'critico';
        } else if (porcentaje >= 90) {
            status = 'advertencia';
        } else if (porcentaje < 50) {
            status = 'bajo';
        }

        return { actual, maxima, porcentaje, status };
    };

    const statusColor = (status) => {
        if (status === 'inactivo') return '#9e9e9e';
        if (status === 'critico') return '#f44336';
        if (status === 'advertencia') return '#ffb300';
        if (status === 'bajo') return '#4caf50';
        return '#2196f3';
    };

    // Detalle del potrero seleccionado
    const selectedPotrero = potreros.find(p => p.id === selectedPotreroId);
    let selectedAnimals = [];
    let animalsByCategory = {};
    if (selectedPotrero) {
        selectedAnimals = getAnimalsInPotrero(selectedPotrero.id);
        // Desglose por categoría (HU-24)
        selectedAnimals.forEach(a => {
            const cat = getCategoria(a);
            if (!animalsByCategory[cat]) animalsByCategory[cat] = [];
            animalsByCategory[cat].push(a);
        });
    }

    return (
        <div className="potreros-dashboard">
            <div className="conteo-container" style={{ display: 'flex', gap: '20px' }}>
                {/* Listado con conteo en tiempo real */}
                <div className="potreros-lista" style={{ flex: '1' }}>
                    <h3 style={{ marginBottom: '15px' }}>Conteo en Tiempo Real por Potrero</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {potreros.map(p => {
                            const info = getOcupacionInfo(p.id);
                            const color = statusColor(info.status);
                            return (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPotreroId(p.id)}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        border: `1px solid ${selectedPotreroId === p.id ? '#000' : '#ddd'}`,
                                        backgroundColor: '#fff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <strong>{p.nombre}</strong>
                                        {info.status === 'inactivo' && (
                                            <span style={{ marginLeft: '10px', fontSize: '0.85rem', color: '#888' }}>
                                                {p.estado.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '0.95rem' }}>
                                            {info.actual} / {info.maxima}
                                        </span>
                                        <span style={{
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold',
                                            color: color
                                        }}>
                                            {Math.round(info.porcentaje)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Panel Lateral: Detalle del Potrero (HU-24) */}
                <div className="potrero-detail" style={{ flex: '1', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', maxHeight: '600px', overflowY: 'auto' }}>
                    {selectedPotrero ? (
                        <>
                            <h2>{selectedPotrero.nombre}</h2>
                            <p style={{ color: '#666', marginBottom: '15px' }}>Área: {selectedPotrero.areaHa} ha | Pasto: {selectedPotrero.tipoPasto || 'No definido'}</p>

                            {(() => {
                                const info = getOcupacionInfo(selectedPotrero.id);
                                return (
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <span>Ocupación</span>
                                            <strong>{Math.round(info.porcentaje)}% ({info.actual}/{info.maxima})</strong>
                                        </div>
                                        <div style={{ height: '10px', background: '#eee', borderRadius: '5px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                background: statusColor(info.status),
                                                width: `${Math.min(info.porcentaje, 100)}%`
                                            }}></div>
                                        </div>
                                    </div>
                                );
                            })()}

                            <h3>Desglose por Categoría</h3>
                            {selectedAnimals.length === 0 ? (
                                <p style={{ fontStyle: 'italic', color: '#888' }}>No hay animales asignados a este potrero actualmente.</p>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                                        {Object.keys(animalsByCategory).map(cat => (
                                            <div key={cat} style={{ background: '#f0f4f8', padding: '5px 10px', borderRadius: '15px', fontSize: '0.9rem' }}>
                                                <strong style={{ textTransform: 'capitalize' }}>{cat}s:</strong> {animalsByCategory[cat].length}
                                            </div>
                                        ))}
                                    </div>
                                    <h4>Lista Detallada</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {selectedAnimals.map(a => (
                                            <li key={a.id} style={{ padding: '8px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                                                <span><strong>{a.id}</strong> {a.arete && `(${a.arete})`}</span>
                                                <span style={{ fontSize: '0.85rem', color: '#666', textTransform: 'capitalize' }}>{getCategoria(a)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#888', marginTop: '100px' }}>
                            <p>Seleccione un potrero de la lista para ver sus detalles</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}