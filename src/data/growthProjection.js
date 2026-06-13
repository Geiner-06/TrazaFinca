// Proyección de fecha estimada de alcance del peso objetivo (Milestone 3)

// Número de pesajes recientes usados para promediar la GDP
export const PROJECTION_WINDOW = 3;

const daysBetween = (a, b) =>
    Math.round((new Date(b.replace(/-/g, '/')) - new Date(a.replace(/-/g, '/'))) / 86400000);

const addDays = (dateStr, n) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + n);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Target efectivo de un animal: el específico del animal tiene prioridad sobre el del lote.
export function getEffectiveTarget(animal, targets) {
    if (!targets) return null;
    if (targets.byAnimal && targets.byAnimal[animal.id] != null) {
        return { value: targets.byAnimal[animal.id], scope: 'animal' };
    }
    if (animal.lote && targets.byLote && targets.byLote[animal.lote] != null) {
        return { value: targets.byLote[animal.lote], scope: 'lote' };
    }
    return null;
}

// Proyecta la fecha de alcance del peso objetivo usando la GDP promedio de los
// últimos PROJECTION_WINDOW pesajes del animal.
// status: sin_datos | sin_objetivo | pocos_pesajes | alcanzado | no_calculable | ok
export function projectTargetDate(records, target) {
    const recs = [...records].sort((a, b) => a.fecha.localeCompare(b.fecha));
    if (recs.length === 0) return { status: 'sin_datos' };

    const currentWeight = recs[recs.length - 1].pesoKg;
    if (target == null) return { status: 'sin_objetivo', currentWeight };
    if (recs.length < 2) return { status: 'pocos_pesajes', currentWeight };

    const window = recs.slice(-PROJECTION_WINDOW);
    const first = window[0];
    const last = window[window.length - 1];
    const days = daysBetween(first.fecha, last.fecha);
    const avgGdp = days > 0 ? Math.round(((last.pesoKg - first.pesoKg) / days) * 1000) / 1000 : 0;

    if (currentWeight >= target) {
        return { status: 'alcanzado', currentWeight, avgGdp, target, basedOn: last.fecha, nPesajes: window.length };
    }
    if (avgGdp <= 0) {
        return { status: 'no_calculable', currentWeight, avgGdp, target, nPesajes: window.length };
    }

    const daysToTarget = Math.ceil((target - currentWeight) / avgGdp);
    return {
        status: 'ok',
        currentWeight,
        avgGdp,
        target,
        daysToTarget,
        estimatedDate: addDays(last.fecha, daysToTarget),
        basedOn: last.fecha,
        nPesajes: window.length
    };
}
