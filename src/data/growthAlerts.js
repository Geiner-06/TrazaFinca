// Lógica de alertas de bajo rendimiento de ganancia de peso (Milestone 3)
import { getGdpThreshold, CATEGORY_LABELS } from './weightCategories.js';

// Se genera alerta cuando la GDP reciente es inferior al 80% del umbral esperado.
export const ALERT_FACTOR = 0.8;

// Metadatos por nivel de desviación (criterio 3)
export const LEVEL_META = {
    critico: { label: 'Crítico', icon: '●', order: 0 },
    moderado: { label: 'Moderado', icon: '●', order: 1 },
    leve: { label: 'Leve', icon: '●', order: 2 }
};

// Tipos de acción correctiva (criterio 4)
export const ACTION_TYPES = {
    cambio_plan: 'Cambio de plan de alimentación',
    revision_veterinaria: 'Revisión veterinaria',
    ajuste_potrero: 'Ajuste de potrero'
};

const daysBetween = (a, b) =>
    Math.round((new Date(b.replace(/-/g, '/')) - new Date(a.replace(/-/g, '/'))) / 86400000);

// Clasifica el nivel de desviación según la razón GDP actual / esperada.
const levelForRatio = (ratio) => {
    if (ratio < 0.4) return 'critico';
    if (ratio < 0.6) return 'moderado';
    return 'leve';
};

// Devuelve la lista de alertas de bajo rendimiento para los animales activos.
export function computeLowGainAlerts(animals, weightRecords, feedAssignments = [], feedPlans = []) {
    const alerts = [];

    animals.filter(a => a.estado === 'activo').forEach(animal => {
        const recs = weightRecords
            .filter(r => r.animalId === animal.id)
            .sort((a, b) => a.fecha.localeCompare(b.fecha));
        if (recs.length < 2) return;

        // GDP del intervalo de pesaje más reciente (≈ últimos 30 días)
        const last = recs[recs.length - 1];
        const prev = recs[recs.length - 2];
        const days = daysBetween(prev.fecha, last.fecha);
        if (days <= 0) return;

        const currentGdp = Math.round(((last.pesoKg - prev.pesoKg) / days) * 1000) / 1000;
        const expectedGdp = getGdpThreshold(last.categoria, animal.proposito);
        if (expectedGdp <= 0) return;

        const ratio = currentGdp / expectedGdp;
        if (ratio >= ALERT_FACTOR) return; // rendimiento aceptable, sin alerta

        const activeAssign = feedAssignments.find(as => as.animalId === animal.id && as.estado === 'activo');
        const activePlan = activeAssign ? feedPlans.find(p => p.id === activeAssign.planId) : null;

        alerts.push({
            animalId: animal.id,
            arete: animal.arete || null,
            categoria: last.categoria,
            categoriaLabel: CATEGORY_LABELS[last.categoria] || last.categoria,
            proposito: animal.proposito,
            currentGdp,
            expectedGdp,
            // Diferencia porcentual por debajo de lo esperado (criterio 2)
            diffPct: Math.round((1 - ratio) * 1000) / 10,
            ratio,
            nivel: levelForRatio(ratio),
            planNombre: activePlan ? activePlan.nombre : null,
            lote: animal.lote || null,
            potrero: animal.potrero || null,
            fechaUltimoPesaje: last.fecha
        });
    });

    return alerts;
}
