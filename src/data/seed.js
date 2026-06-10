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
        fechaAplicacion: "2026-05-16",
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
