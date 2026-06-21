// --- DATOS SEMILLA ---
export const SEED_ANIMALS = [
    {
        id: "AN-001",
        especie: "bueyes",
        proposito: "trabajo",
        raza: "Hereford",
        sexo: "Macho",
        fecha: "2023-04-10",
        arete: "EX-001",
        dueño: "Finca La Esperanza / Roberto Solís",
        lote: "Lote Trabajo",
        potrero: "Potrero Norte",
        estado: "activo"
    },
    {
        id: "AN-002",
        especie: "vacas",
        proposito: "producción",
        raza: "Holstein",
        sexo: "Hembra",
        fecha: "2022-11-15",
        arete: "VL-204",
        dueño: "Finca San José / Elena Gómez",
        lote: "Lote Lechero",
        potrero: "Potrero Sur",
        estado: "activo"
    },
    {
        id: "AN-003",
        especie: "caballos",
        proposito: "trabajo",
        raza: "Criollo",
        sexo: "Macho",
        fecha: "2021-08-05",
        arete: "CH-901",
        dueño: "Finca La Esperanza / Roberto Solís",
        lote: "Lote Trabajo",
        potrero: "Potrero Norte",
        estado: "activo"
    },
    {
        id: "AN-004",
        especie: "cabras",
        proposito: "producción",
        raza: "Saanen",
        sexo: "Hembra",
        fecha: "2024-01-20",
        arete: "CG-055",
        dueño: "Rancho Alto / Carlos Mejía",
        lote: "Lote Lechero",
        potrero: "Potrero Este",
        estado: "activo"
    },
    {
        id: "AN-005",
        especie: "ganado de engorde",
        proposito: "carne",
        raza: "Angus",
        sexo: "Macho",
        fecha: "2023-09-12",
        arete: "GE-112",
        dueño: "Finca El Toro / Marcos Alvarado",
        lote: "Lote Engorde",
        potrero: "Potrero Sur",
        estado: "baja",
        bajaMotivo: "Sacrificado",
        bajaComentarios: "Carne destinada al consumo local de la hacienda.",
        bajaFecha: "2025-10-10"
    },
    {
        id: "AN-006",
        especie: "burros",
        proposito: "trabajo",
        raza: "Andaluz",
        sexo: "Macho",
        fecha: "2020-05-18",
        arete: "BA-441",
        dueño: "Finca San José / Elena Gómez",
        lote: "Lote Trabajo",
        potrero: "Potrero Oeste",
        estado: "activo"
    },
    {
        id: "AN-007",
        especie: "ganado de engorde",
        proposito: "carne",
        raza: "Brahman",
        sexo: "Macho",
        fecha: "2025-09-01",
        arete: "GE-201",
        dueño: "Finca El Toro / Marcos Alvarado",
        lote: "Lote Engorde",
        potrero: "Potrero Sur",
        estado: "activo"
    },
    {
        id: "AN-008",
        especie: "ganado de engorde",
        proposito: "carne",
        raza: "Nelore",
        sexo: "Macho",
        fecha: "2025-10-01",
        arete: "GE-202",
        dueño: "Finca El Toro / Marcos Alvarado",
        lote: "Lote Engorde",
        potrero: "Potrero Sur",
        estado: "activo"
    }
];

export const SEED_HEALTH_RECORDS = [
    {
        id: "REC-001",
        animalId: "AN-001",
        tipoTratamiento: "vacuna",
        fechaAplicacion: "2026-05-10",
        productoComercial: "Antraxvac",
        periodoRetiroCarne: 25,
        periodoRetiroLeche: 10,
        lote: "L-9988-A",
        dosis: "2 ml",
        viaAdministracion: "Subcutánea",
        veterinario: "Dr. Rodrigo Arias (Lic. 1124)",
        periodoRevacunacion: 180,
        fechaProxima: "2026-11-06",
        periodoRetiro: 30,
        notas: [
            {
                id: 1,
                texto: "Aplicado sin complicaciones. El animal toleró bien el fármaco.",
                fecha: "2026-05-10"
            }
        ],
        estado: "confirmado"
    },
    {
        id: "REC-002",
        animalId: "AN-002",
        tipoTratamiento: "desparasitacion_interna",
        fechaAplicacion: "2026-06-01",
        periodoRetiroCarne: 25,
        periodoRetiroLeche: 10,
        productoComercial: "Panacur Bovinos",
        lote: "B-7722-X",
        dosis: "10 ml",
        viaAdministracion: "Oral",
        veterinario: "Dr. Rodrigo Arias (Lic. 1124)",
        periodoRevacunacion: 90,
        fechaProxima: "2026-08-30",
        periodoRetiro: 14,
        notas: [],
        estado: "confirmado"
    },
    {
        id: "REC-003",
        animalId: "AN-003",
        tipoTratamiento: "vacuna",
        fechaAplicacion: "2026-05-05",
        periodoRetiroCarne: 20,
        periodoRetiroLeche: 0,
        productoComercial: "Triple Bovino",
        lote: "L-3344",
        dosis: "5 ml",
        viaAdministracion: "Intramuscular",
        veterinario: "Dr. Rodrigo Arias (Lic. 1124)",
        periodoRevacunacion: 30,
        fechaProxima: "2026-06-05",
        periodoRetiro: 28,
        notas: [],
        estado: "confirmado"
    },
    {
        id: "REC-004",
        animalId: "AN-004",
        tipoTratamiento: "desparasitacion_interna",
        fechaAplicacion: "2026-05-05",
        periodoRetiroCarne: 30,
        periodoRetiroLeche: 3,
        productoComercial: "Ivermectina 1%",
        lote: "L-9988",
        dosis: "2 ml",
        viaAdministracion: "Subcutánea",
        veterinario: "Dr. Juan Pérez (Lic. 8855)",
        periodoRevacunacion: 30,
        fechaProxima: "2026-06-12",
        periodoRetiro: 28,
        notas: [],
        estado: "confirmado"
    },
    {
        id: "REC-005",
        animalId: "AN-001",
        tipoTratamiento: "vitamina_mineral",
        fechaAplicacion: "2026-06-05",
        periodoRetiroCarne: 28,
        periodoRetiroLeche: 7,
        productoComercial: "Vigantol",
        lote: "L-4455",
        dosis: "5 ml",
        viaAdministracion: "Intramuscular",
        veterinario: "Dr. Juan Pérez (Lic. 8855)",
        periodoRevacunacion: 30,
        fechaProxima: "2026-06-15",
        periodoRetiro: 0,
        notas: [],
        estado: "confirmado"
    }
];

export const SEED_DIAGNOSES = [
    {
        id: "DX-001",
        animalId: "AN-001",
        fecha: "2026-06-01",
        sintomas: "Fiebre alta y lesiones en la boca.",
        diagnostico: "Fiebre Aftosa",
        esNotificable: true,
        tratamiento: "Aislamiento total y desinfección.",
        estado: "activo"
    }
];

export const SEED_WEIGHT_RECORDS = [
    {
        id: "PES-001",
        animalId: "AN-001",
        categoria: "toro",
        fecha: "2026-03-01",
        pesoKg: 620,
        condicionCorporal: 3,
        observaciones: "Pesaje de rutina trimestral.",
        gdp: null,
        pesoAnterior: null,
        fechaPesajeAnterior: null,
        notas: [],
        estado: "confirmado"
    },
    {
        id: "PES-002",
        animalId: "AN-001",
        categoria: "toro",
        fecha: "2026-04-15",
        pesoKg: 638,
        condicionCorporal: 3,
        observaciones: "",
        gdp: 0.4,
        pesoAnterior: 620,
        fechaPesajeAnterior: "2026-03-01",
        notas: [],
        estado: "confirmado"
    },
    {
        id: "PES-003",
        animalId: "AN-001",
        categoria: "toro",
        fecha: "2026-06-01",
        pesoKg: 652,
        condicionCorporal: 4,
        observaciones: "Buena condición general tras cambio de potrero.",
        gdp: 0.298,
        pesoAnterior: 638,
        fechaPesajeAnterior: "2026-04-15",
        notas: [
            {
                id: 1,
                texto: "La báscula fue calibrada el día anterior al pesaje.",
                fecha: "2026-06-01"
            }
        ],
        estado: "confirmado"
    },
    {
        id: "PES-004",
        animalId: "AN-002",
        categoria: "vaca",
        fecha: "2026-03-10",
        pesoKg: 540,
        condicionCorporal: 3,
        observaciones: "Primer pesaje del año.",
        gdp: null,
        pesoAnterior: null,
        fechaPesajeAnterior: null,
        notas: [],
        estado: "confirmado"
    },
    {
        id: "PES-005",
        animalId: "AN-002",
        categoria: "vaca",
        fecha: "2026-05-09",
        pesoKg: 549,
        condicionCorporal: 2,
        observaciones: "Ganancia menor a la esperada. Revisar plan de alimentación.",
        gdp: 0.15,
        pesoAnterior: 540,
        fechaPesajeAnterior: "2026-03-10",
        notas: [],
        estado: "confirmado"
    },
    {
        id: "PES-006",
        animalId: "AN-005",
        categoria: "novillo",
        fecha: "2025-07-01",
        pesoKg: 380,
        condicionCorporal: 3,
        observaciones: "Ingreso a etapa de engorde.",
        gdp: null,
        pesoAnterior: null,
        fechaPesajeAnterior: null,
        notas: [],
        estado: "confirmado"
    },
    {
        id: "PES-007",
        animalId: "AN-005",
        categoria: "novillo",
        fecha: "2025-09-01",
        pesoKg: 470,
        condicionCorporal: 4,
        observaciones: "Excelente respuesta al plan de engorde.",
        gdp: 1.452,
        pesoAnterior: 380,
        fechaPesajeAnterior: "2025-07-01",
        notas: [],
        estado: "confirmado"
    },
    // Lote Engorde - AN-007 (buen rendimiento)
    {
        id: "PES-008", animalId: "AN-007", categoria: "novillo", fecha: "2026-02-01",
        pesoKg: 300, condicionCorporal: 3, observaciones: "Ingreso al lote de engorde.",
        gdp: null, pesoAnterior: null, fechaPesajeAnterior: null, notas: [], estado: "confirmado"
    },
    {
        id: "PES-009", animalId: "AN-007", categoria: "novillo", fecha: "2026-03-01",
        pesoKg: 330, condicionCorporal: 3, observaciones: "",
        gdp: 1.071, pesoAnterior: 300, fechaPesajeAnterior: "2026-02-01", notas: [], estado: "confirmado"
    },
    {
        id: "PES-010", animalId: "AN-007", categoria: "novillo", fecha: "2026-04-01",
        pesoKg: 362, condicionCorporal: 4, observaciones: "",
        gdp: 1.032, pesoAnterior: 330, fechaPesajeAnterior: "2026-03-01", notas: [], estado: "confirmado"
    },
    {
        id: "PES-011", animalId: "AN-007", categoria: "novillo", fecha: "2026-05-01",
        pesoKg: 395, condicionCorporal: 4, observaciones: "",
        gdp: 1.100, pesoAnterior: 362, fechaPesajeAnterior: "2026-04-01", notas: [], estado: "confirmado"
    },
    {
        id: "PES-012", animalId: "AN-007", categoria: "novillo", fecha: "2026-06-01",
        pesoKg: 428, condicionCorporal: 4, observaciones: "Rendimiento sobresaliente.",
        gdp: 1.065, pesoAnterior: 395, fechaPesajeAnterior: "2026-05-01", notas: [], estado: "confirmado"
    },
    // Lote Engorde - AN-008 (bajo rendimiento)
    {
        id: "PES-013", animalId: "AN-008", categoria: "novillo", fecha: "2026-02-01",
        pesoKg: 310, condicionCorporal: 3, observaciones: "Ingreso al lote de engorde.",
        gdp: null, pesoAnterior: null, fechaPesajeAnterior: null, notas: [], estado: "confirmado"
    },
    {
        id: "PES-014", animalId: "AN-008", categoria: "novillo", fecha: "2026-03-01",
        pesoKg: 325, condicionCorporal: 3, observaciones: "",
        gdp: 0.536, pesoAnterior: 310, fechaPesajeAnterior: "2026-02-01", notas: [], estado: "confirmado"
    },
    {
        id: "PES-015", animalId: "AN-008", categoria: "novillo", fecha: "2026-04-01",
        pesoKg: 338, condicionCorporal: 2, observaciones: "Ganancia menor a la esperada.",
        gdp: 0.419, pesoAnterior: 325, fechaPesajeAnterior: "2026-03-01", notas: [], estado: "confirmado"
    },
    {
        id: "PES-016", animalId: "AN-008", categoria: "novillo", fecha: "2026-05-01",
        pesoKg: 350, condicionCorporal: 2, observaciones: "Revisar plan de alimentación.",
        gdp: 0.400, pesoAnterior: 338, fechaPesajeAnterior: "2026-04-01", notas: [], estado: "confirmado"
    },
    {
        id: "PES-017", animalId: "AN-008", categoria: "novillo", fecha: "2026-06-01",
        pesoKg: 360, condicionCorporal: 2, observaciones: "Rendimiento por debajo del umbral.",
        gdp: 0.323, pesoAnterior: 350, fechaPesajeAnterior: "2026-05-01", notas: [], estado: "confirmado"
    }
];

// Sesiones de pesaje masivo (Milestone 3). Permiten comparar contra la sesión anterior del lote.
export const SEED_WEIGHT_SESSIONS = [
    {
        id: "SES-001",
        scope: "lote",
        scopeValue: "Lote Engorde",
        fecha: "2026-06-01",
        weighedIds: ["AN-007", "AN-008"],
        pendingIds: [],
        count: 2,
        avgWeight: 394,
        prevAvg: null,
        prevFecha: null
    }
];

// --- PLANES DE ALIMENTACIÓN (Milestone 3) ---
// Planes base del sistema (esBase: true) por propósito productivo + un personalizado de ejemplo.
export const SEED_FEED_PLANS = [
    {
        id: "PA-001",
        nombre: "Mantenimiento Animales de Trabajo",
        proposito: "trabajo",
        proteina: 10,
        energia: 2.2,
        fibra: 28,
        ingredientes: "Pasto estrella, heno de calidad, sales minerales",
        cantidadDiaria: 10,
        unidad: "kg",
        frecuencia: "2 veces al día (mañana y tarde)",
        composicion: [
            { feedItemId: "FI-003", kgPorDia: 6 },
            { feedItemId: "FI-004", kgPorDia: 3.5 },
            { feedItemId: "FI-005", kgPorDia: 0.5 }
        ],
        esBase: true
    },
    {
        id: "PA-002",
        nombre: "Lactancia Alta Producción",
        proposito: "produccion",
        proteina: 18,
        energia: 2.7,
        fibra: 17,
        ingredientes: "Concentrado lechero, ensilaje de maíz, pasto de corte, melaza",
        cantidadDiaria: 14,
        unidad: "kg",
        frecuencia: "3 veces al día",
        composicion: [
            { feedItemId: "FI-001", kgPorDia: 5 },
            { feedItemId: "FI-003", kgPorDia: 6 },
            { feedItemId: "FI-006", kgPorDia: 2 },
            { feedItemId: "FI-005", kgPorDia: 1 }
        ],
        esBase: true
    },
    {
        id: "PA-003",
        nombre: "Engorde Intensivo",
        proposito: "engorde",
        proteina: 13,
        energia: 2.9,
        fibra: 15,
        ingredientes: "Maíz molido, afrecho de trigo, melaza, pasto, sales minerales",
        cantidadDiaria: 12,
        unidad: "kg",
        frecuencia: "2 veces al día",
        composicion: [
            { feedItemId: "FI-002", kgPorDia: 5 },
            { feedItemId: "FI-003", kgPorDia: 4 },
            { feedItemId: "FI-006", kgPorDia: 2 },
            { feedItemId: "FI-005", kgPorDia: 1 }
        ],
        esBase: true
    },
    {
        id: "PA-004",
        nombre: "Cabras Lecheras - Pastoreo Suplementado",
        proposito: "produccion",
        proteina: 16,
        energia: 2.5,
        fibra: 20,
        ingredientes: "Forraje verde, concentrado caprino, heno de leguminosas",
        cantidadDiaria: 4,
        unidad: "kg",
        frecuencia: "2 veces al día",
        composicion: [
            { feedItemId: "FI-003", kgPorDia: 2.5 },
            { feedItemId: "FI-001", kgPorDia: 1 },
            { feedItemId: "FI-004", kgPorDia: 0.5 }
        ],
        esBase: false
    }
];

// Insumos de alimentación en inventario (Milestone 3)
export const SEED_FEED_ITEMS = [
    { id: "FI-001", nombre: "Concentrado Lechero", tipo: "concentrado", cantidad: 80, unidad: "kg", fechaIngreso: "2026-06-01", proveedor: "AgroNorte S.A.", costoUnitario: 320 },
    { id: "FI-002", nombre: "Maíz Molido", tipo: "concentrado", cantidad: 50, unidad: "kg", fechaIngreso: "2026-06-05", proveedor: "Distribuidora El Campo", costoUnitario: 280 },
    { id: "FI-003", nombre: "Pasto de Corte", tipo: "forraje", cantidad: 100, unidad: "kg", fechaIngreso: "2026-06-08", proveedor: "Finca propia", costoUnitario: 25 },
    { id: "FI-004", nombre: "Heno", tipo: "forraje", cantidad: 120, unidad: "kg", fechaIngreso: "2026-05-20", proveedor: "AgroNorte S.A.", costoUnitario: 90 },
    { id: "FI-005", nombre: "Sales Minerales", tipo: "suplemento_mineral", cantidad: 40, unidad: "kg", fechaIngreso: "2026-05-15", proveedor: "Veterinaria San Carlos", costoUnitario: 600 },
    { id: "FI-006", nombre: "Melaza", tipo: "concentrado", cantidad: 30, unidad: "kg", fechaIngreso: "2026-06-02", proveedor: "Ingenio Dulce", costoUnitario: 180 },
    { id: "FI-007", nombre: "Sal Común", tipo: "sal", cantidad: 25, unidad: "kg", fechaIngreso: "2026-05-10", proveedor: "Distribuidora El Campo", costoUnitario: 150 }
];

// Ledger de entradas de stock de insumos (control de gasto, criterio 4)
export const SEED_FEED_STOCK_ENTRIES = [
    { id: "FE-001", feedItemId: "FI-004", cantidad: 120, proveedor: "AgroNorte S.A.", costoUnitario: 90, costoTotal: 10800, fecha: "2026-05-20" }
];

// Asignaciones de planes a animales. Solo una activa por animal a la vez.
export const SEED_FEED_ASSIGNMENTS = [
    {
        id: "AS-001",
        animalId: "AN-001",
        planId: "PA-001",
        fechaInicio: "2026-02-01",
        fechaCierre: null,
        responsable: "Roberto Solís",
        estado: "activo"
    },
    {
        id: "AS-002",
        animalId: "AN-002",
        planId: "PA-002",
        fechaInicio: "2026-03-15",
        fechaCierre: null,
        responsable: "Elena Gómez",
        estado: "activo"
    },
    {
        id: "AS-003",
        animalId: "AN-005",
        planId: "PA-001",
        fechaInicio: "2025-06-01",
        fechaCierre: "2025-07-01",
        responsable: "Marcos Alvarado",
        estado: "archivado"
    },
    {
        id: "AS-004",
        animalId: "AN-005",
        planId: "PA-003",
        fechaInicio: "2025-07-01",
        fechaCierre: null,
        responsable: "Marcos Alvarado",
        estado: "activo"
    },
    {
        id: "AS-005",
        animalId: "AN-004",
        planId: "PA-004",
        fechaInicio: "2026-04-10",
        fechaCierre: null,
        responsable: "Carlos Mejía",
        estado: "activo"
    },
    {
        id: "AS-006",
        animalId: "AN-007",
        planId: "PA-003",
        fechaInicio: "2026-02-01",
        fechaCierre: null,
        responsable: "Marcos Alvarado",
        estado: "activo"
    },
    {
        id: "AS-007",
        animalId: "AN-008",
        planId: "PA-003",
        fechaInicio: "2026-02-01",
        fechaCierre: null,
        responsable: "Marcos Alvarado",
        estado: "activo"
    }
];

export const SEED_INVENTORY = [
    {
        id: "INV-001",
        nombre: "Antraxvac",
        principioActivo: "Cepa Sterne",
        lote: "L-9988-A",
        fechaVencimiento: "2026-07-10",
        cantidad: 500,
        unidad: "ml",
        umbralMinimo: 50,
        almacenamiento: "Refrigeración 2-8°C"
    },
    {
        id: "INV-002",
        nombre: "Ivermectina 1%",
        principioActivo: "Ivermectina",
        lote: "L-9988",
        fechaVencimiento: "2027-12-20",
        cantidad: 45,
        unidad: "ml",
        umbralMinimo: 100,
        almacenamiento: "Temperatura ambiente"
    },
    {
        id: "INV-003",
        nombre: "Vacuna Triple Bovina",
        principioActivo: "Clostridium chauvoei y otros",
        lote: "VTB-24001",
        fechaVencimiento: "2027-04-15",
        cantidad: 250,
        unidad: "ml",
        umbralMinimo: 80,
        almacenamiento: "Refrigeración 2-8°C"
    },
    {
        id: "INV-004",
        nombre: "Vitamina ADE",
        principioActivo: "Vitaminas A, D3 y E",
        lote: "ADE-5588",
        fechaVencimiento: "2028-01-10",
        cantidad: 180,
        unidad: "ml",
        umbralMinimo: 50,
        almacenamiento: "Temperatura ambiente"
    },
    {
        id: "INV-005",
        nombre: "Oxitetraciclina LA",
        principioActivo: "Oxitetraciclina",
        lote: "OTC-7781",
        fechaVencimiento: "2027-09-30",
        cantidad: 90,
        unidad: "ml",
        umbralMinimo: 100,
        almacenamiento: "Temperatura ambiente"
    },
    {
        id: "INV-006",
        nombre: "Albendazol Oral",
        principioActivo: "Albendazol",
        lote: "ALB-2309",
        fechaVencimiento: "2026-08-20",
        cantidad: 320,
        unidad: "ml",
        umbralMinimo: 75,
        almacenamiento: "Temperatura ambiente"
    },
    {
        id: "INV-007",
        nombre: "Vacuna Brucelosis RB51",
        principioActivo: "Brucella abortus RB51",
        lote: "BRU-5520",
        fechaVencimiento: "2026-09-05",
        cantidad: 30,
        unidad: "dosis",
        umbralMinimo: 50,
        almacenamiento: "Refrigeración 2-8°C"
    },
    {
        id: "INV-008",
        nombre: "Levamisol 10%",
        principioActivo: "Levamisol",
        lote: "LEV-9087",
        fechaVencimiento: "2027-11-12",
        cantidad: 400,
        unidad: "ml",
        umbralMinimo: 100,
        almacenamiento: "Temperatura ambiente"
    },
    {
        id: "INV-009",
        nombre: "Vacuna Rabia Bovina",
        principioActivo: "Virus inactivado de rabia",
        lote: "RAB-4512",
        fechaVencimiento: "2026-06-25",
        cantidad: 60,
        unidad: "dosis",
        umbralMinimo: 40,
        almacenamiento: "Refrigeración 2-8°C"
    },
    {
        id: "INV-010",
        nombre: "Selenio + Vitamina E",
        principioActivo: "Selenito de sodio y Vitamina E",
        lote: "SEV-1114",
        fechaVencimiento: "2028-02-18",
        cantidad: 120,
        unidad: "ml",
        umbralMinimo: 30,
        almacenamiento: "Temperatura ambiente"
    }
];

export const SEED_POTREROS = [
    { id: "PT-001", nombre: "Potrero Norte", areaHa: 10, capacidadPorHa: 2, estado: "activo" },
    { id: "PT-002", nombre: "Potrero Sur", areaHa: 15, capacidadPorHa: 2, estado: "activo" },
    { id: "PT-003", nombre: "Potrero Este", areaHa: 8, capacidadPorHa: 2, estado: "activo" },
    { id: "PT-004", nombre: "Potrero Oeste", areaHa: 12, capacidadPorHa: 2, estado: "activo" }
];

export const SEED_POTRERO_ASSIGNMENTS = [
    { id: "PA-001", animalId: "AN-001", potreroId: "PT-001", fechaIngreso: "2023-04-10", fechaSalida: null },
    { id: "PA-002", animalId: "AN-002", potreroId: "PT-002", fechaIngreso: "2022-11-15", fechaSalida: null },
    { id: "PA-003", animalId: "AN-003", potreroId: "PT-001", fechaIngreso: "2021-08-05", fechaSalida: null },
    { id: "PA-004", animalId: "AN-004", potreroId: "PT-003", fechaIngreso: "2024-01-20", fechaSalida: null },
    { id: "PA-005", animalId: "AN-005", potreroId: "PT-002", fechaIngreso: "2023-09-12", fechaSalida: "2025-10-10" },
    { id: "PA-006", animalId: "AN-006", potreroId: "PT-004", fechaIngreso: "2020-05-18", fechaSalida: null },
    { id: "PA-007", animalId: "AN-007", potreroId: "PT-002", fechaIngreso: "2025-09-01", fechaSalida: null },
    { id: "PA-008", animalId: "AN-008", potreroId: "PT-002", fechaIngreso: "2025-10-01", fechaSalida: null }
];