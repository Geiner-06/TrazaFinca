// Inventario de insumos de alimentación y consumo proyectado (Milestone 3)

export const FEED_TYPES = {
    concentrado: 'Concentrado',
    forraje: 'Forraje',
    suplemento_mineral: 'Suplemento Mineral',
    sal: 'Sal'
};

// Umbral de cobertura: se alerta si el stock cubre menos de 7 días.
export const COVERAGE_ALERT_DAYS = 7;

// Calcula, para cada insumo, el consumo diario proyectado a partir de los planes
// activos de los animales activos, y los días de cobertura del stock actual.
export function computeFeedConsumption(feedItems, feedPlans, feedAssignments, animals) {
    const activeAnimalIds = new Set(
        animals.filter(a => a.estado === 'activo').map(a => a.id)
    );

    // kg/día por insumo sumando las raciones de cada animal con plan activo
    const consumption = {};
    feedAssignments
        .filter(as => as.estado === 'activo' && activeAnimalIds.has(as.animalId))
        .forEach(as => {
            const plan = feedPlans.find(p => p.id === as.planId);
            if (!plan || !plan.composicion) return;
            plan.composicion.forEach(c => {
                consumption[c.feedItemId] = (consumption[c.feedItemId] || 0) + c.kgPorDia;
            });
        });

    return feedItems.map(item => {
        const dailyConsumption = Math.round((consumption[item.id] || 0) * 100) / 100;
        const daysCoverage = dailyConsumption > 0
            ? Math.round((item.cantidad / dailyConsumption) * 10) / 10
            : null;
        return {
            ...item,
            dailyConsumption,
            daysCoverage,
            low: daysCoverage !== null && daysCoverage < COVERAGE_ALERT_DAYS
        };
    });
}
