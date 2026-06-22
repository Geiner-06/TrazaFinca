import { useMemo } from 'react';

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
    potreroAssignments,
    animals,
    onMassiveMovement
}) {
    // 1. CONTEO EN TIEMPO REAL: Filtrado de asignaciones activas y agrupación por categoría
    const realTimeCounters = useMemo(() => {
        const activeAssignments = potreroAssignments.filter(a => a.fechaSalida === null);
        const activeAnimalIds = activeAssignments.map(a => a.animalId);
        const activeAnimalsList = animals.filter(a => activeAnimalIds.includes(a.id));

        const categories = {};
        activeAnimalsList.forEach(a => {
            const cat = getCategoria(a);
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(a);
        });

        return {
            total: activeAnimalsList.length,
            byCategory: categories,
            detailedList: activeAnimalsList
        };
    }, [potreroAssignments, animals]);

    return (
        <div className="potreros-dashboard" style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>

            {/* CABECERA CON MOVIMIENTO MASIVO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                <h2 style={{ margin: 0 }}>Control de Inventario General</h2>
                <button
                    className="btn btn-primary"
                    onClick={onMassiveMovement}
                    style={{ padding: '10px 20px', backgroundColor: '#2196f3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Movimiento Masivo entre Lotes
                </button>
            </div>

            {/* SECCIÓN DE CONTEO EN TIEMPO REAL */}
            <div className="real-time-conteo">
                <h3>Conteo en Tiempo Real</h3>
                <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
                    Total de animales en potreros: <strong>{realTimeCounters.total}</strong>
                </p>

                {/* Totales por Categoría */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '30px' }}>
                    {Object.keys(realTimeCounters.byCategory).map(cat => (
                        <div
                            key={cat}
                            style={{ background: '#f0f4f8', padding: '15px 20px', borderRadius: '8px', borderLeft: '4px solid #2196f3', minWidth: '120px' }}
                        >
                            <span style={{ textTransform: 'capitalize', color: '#555', display: 'block', fontSize: '0.9rem' }}>{cat}s</span>
                            <strong style={{ fontSize: '1.5rem', color: '#333' }}>{realTimeCounters.byCategory[cat].length}</strong>
                        </div>
                    ))}
                </div>

                {/* Lista Detallada */}
                <h4>Lista de Animales Activos</h4>
                {realTimeCounters.detailedList.length === 0 ? (
                    <p style={{ fontStyle: 'italic', color: '#888' }}>No hay animales en los potreros actualmente.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '6px' }}>
                        {realTimeCounters.detailedList.map(a => (
                            <li key={a.id} style={{ padding: '10px 15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span><strong>ID: {a.id}</strong> {a.arete && `(Arete: ${a.arete})`}</span>
                                <span style={{ fontSize: '0.85rem', color: '#666', textTransform: 'capitalize', background: '#e3f2fd', padding: '3px 8px', borderRadius: '4px' }}>
                                    {getCategoria(a)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

        </div>
    );
}