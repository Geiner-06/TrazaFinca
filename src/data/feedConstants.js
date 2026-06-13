// Constantes compartidas para el módulo de planes de alimentación (Milestone 3)

// Propósitos productivos que cubren los planes base del sistema
export const FEED_PURPOSES = {
    trabajo: 'Trabajo',
    produccion: 'Producción de Leche',
    engorde: 'Engorde (Carne)'
};

// Mapea el propósito del animal (campo `proposito`) al propósito de plan sugerido
export const ANIMAL_TO_FEED_PURPOSE = {
    trabajo: 'trabajo',
    producción: 'produccion',
    produccion: 'produccion',
    carne: 'engorde'
};

export const formatFeedDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
};
