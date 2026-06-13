// Rangos de peso válidos (kg) por categoría del animal
export const WEIGHT_RANGES = {
    ternero: { min: 25, max: 250 },
    novillo: { min: 150, max: 550 },
    vaca: { min: 300, max: 800 },
    toro: { min: 450, max: 1200 }
};

export const CATEGORY_LABELS = {
    ternero: 'Ternero(a)',
    novillo: 'Novillo(a)',
    vaca: 'Vaca',
    toro: 'Toro / Buey'
};

// Umbral mínimo de GDP (kg/día) esperado por categoría.
export const GDP_BASE_THRESHOLDS = {
    ternero: 0.50,
    novillo: 0.70,
    vaca: 0.30,
    toro: 0.40
};

// Factor de ajuste del umbral según el propósito productivo del animal.
const PURPOSE_FACTOR = {
    trabajo: 0.8,
    'producción': 1.0,
    produccion: 1.0,
    carne: 1.2
};

// Umbral mínimo esperado de GDP combinando categoría y propósito (criterio 3).
export const getGdpThreshold = (categoria, proposito) => {
    const base = GDP_BASE_THRESHOLDS[categoria] ?? 0.40;
    const factor = PURPOSE_FACTOR[proposito] ?? 1.0;
    return Math.round(base * factor * 100) / 100;
};
