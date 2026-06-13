// Reporte de costo de alimentación y costo por kg ganado (CKG) — Milestone 3

export const COST_GROUP_BY = {
    lote: 'Lote',
    proposito: 'Propósito productivo',
    plan: 'Plan de alimentación'
};

const daysBetween = (a, b) =>
    Math.round((new Date(b.replace(/-/g, '/')) - new Date(a.replace(/-/g, '/'))) / 86400000);

const maxDate = (a, b) => (a > b ? a : b);
const minDate = (a, b) => (a < b ? a : b);

// Calcula el costo de alimentación por animal, kg ganados y CKG en el período.
export function computeFeedCostReport(animals, weightRecords, feedPlans, feedAssignments, feedItems, dateFrom, dateTo, groupBy = 'lote') {
    const itemById = Object.fromEntries(feedItems.map(i => [i.id, i]));
    const planById = Object.fromEntries(feedPlans.map(p => [p.id, p]));
    const costOf = id => (itemById[id]?.costoUnitario) || 0;

    const insumoTotals = {}; // detalle global de insumos (criterio 4)
    const rows = [];

    animals.filter(a => a.estado === 'activo').forEach(animal => {
        const assigns = feedAssignments.filter(as => as.animalId === animal.id);
        let cost = 0;
        let activePlanId = null;

        assigns.forEach(as => {
            const plan = planById[as.planId];
            if (!plan) return;
            const start = as.fechaInicio;
            const end = as.fechaCierre || dateTo; // asignación activa -> hasta fin del período
            const oStart = maxDate(start, dateFrom);
            const oEnd = minDate(end, dateTo);
            const days = daysBetween(oStart, oEnd);
            if (days <= 0) return;
            if (as.estado === 'activo') activePlanId = as.planId;

            (plan.composicion || []).forEach(c => {
                const lineCost = days * c.kgPorDia * costOf(c.feedItemId);
                cost += lineCost;
                if (!insumoTotals[c.feedItemId]) insumoTotals[c.feedItemId] = { kg: 0, cost: 0 };
                insumoTotals[c.feedItemId].kg += days * c.kgPorDia;
                insumoTotals[c.feedItemId].cost += lineCost;
            });
        });

        // kg ganados en el período
        const recs = weightRecords
            .filter(r => r.animalId === animal.id && r.fecha >= dateFrom && r.fecha <= dateTo)
            .sort((a, b) => a.fecha.localeCompare(b.fecha));
        const kgGained = recs.length >= 2
            ? Math.round((recs[recs.length - 1].pesoKg - recs[0].pesoKg) * 10) / 10
            : null;

        if (cost <= 0 && kgGained === null) return;

        rows.push({
            animal,
            cost: Math.round(cost),
            kgGained,
            ckg: (kgGained && kgGained > 0) ? Math.round(cost / kgGained) : null,
            planId: activePlanId,
            plan: activePlanId ? planById[activePlanId] : null
        });
    });

    // Agrupación (criterio 3)
    const groupKeyFn = (row) => {
        if (groupBy === 'proposito') return row.animal.proposito || 'Sin propósito';
        if (groupBy === 'plan') return row.plan ? row.plan.nombre : 'Sin plan';
        return row.animal.lote || 'Sin lote';
    };
    const groupsMap = {};
    rows.forEach(r => {
        const k = groupKeyFn(r);
        if (!groupsMap[k]) groupsMap[k] = { key: k, rows: [], cost: 0, kg: 0 };
        groupsMap[k].rows.push(r);
        groupsMap[k].cost += r.cost;
        groupsMap[k].kg += (r.kgGained || 0);
    });
    const groups = Object.values(groupsMap)
        .map(g => ({ ...g, ckg: g.kg > 0 ? Math.round(g.cost / g.kg) : null }))
        .sort((a, b) => a.key.localeCompare(b.key));

    const totalCost = rows.reduce((s, r) => s + r.cost, 0);
    const totalKg = Math.round(rows.reduce((s, r) => s + (r.kgGained || 0), 0) * 10) / 10;

    const insumoDetail = Object.keys(insumoTotals).map(id => ({
        id,
        nombre: itemById[id]?.nombre || id,
        unidad: itemById[id]?.unidad || 'kg',
        kg: Math.round(insumoTotals[id].kg * 10) / 10,
        costoUnitario: costOf(id),
        cost: Math.round(insumoTotals[id].cost)
    })).sort((a, b) => b.cost - a.cost);

    return {
        rows,
        groups,
        totalCost,
        totalKg,
        totalCkg: totalKg > 0 ? Math.round(totalCost / totalKg) : null,
        insumoDetail
    };
}
