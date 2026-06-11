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