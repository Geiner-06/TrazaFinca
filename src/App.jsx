import { useState, useEffect } from 'react';
import { SEED_ANIMALS, SEED_HEALTH_RECORDS, SEED_DIAGNOSES, SEED_INVENTORY, SEED_WEIGHT_RECORDS, SEED_FEED_PLANS, SEED_FEED_ASSIGNMENTS, SEED_WEIGHT_SESSIONS, SEED_FEED_ITEMS, SEED_FEED_STOCK_ENTRIES, SEED_POTREROS, SEED_POTRERO_ASSIGNMENTS } from './data/seed.js';
import AnimalCard from './components/AnimalCard.jsx';
import AnimalFormModal from './components/AnimalFormModal.jsx';
import AnimalDetailModal from './components/AnimalDatailModal.jsx';
import BajaModal from './components/BajaModal.jsx';
import HealthRecordFormModal from './components/HealthRecordFormModal.jsx';
import HealthRecordCard from './components/HealthRecordCard.jsx';
import AlertDashboard from './components/AlertDashboard.jsx';
import DiagnosisFormModal from './components/DiagnosisFormModal.jsx';
import DiagnosisCard from './components/DiagnosisCard.jsx';
import CollectiveVaccinationModal from './components/CollectiveVaccinationModal.jsx';
import InventoryDashboard from './components/InventoryDashboard.jsx';
import WithdrawalMonitor from './components/WithdrawalMonitor.jsx';
import WeightRecordFormModal from './components/WeightRecordFormModal.jsx';
import WeightRecordCard from './components/WeightRecordCard.jsx';
import BatchWeightModal from './components/BatchWeightModal.jsx';
import BatchWeightSummaryModal from './components/BatchWeightSummaryModal.jsx';
import FeedPlanCard from './components/FeedPlanCard.jsx';
import FeedPlanFormModal from './components/FeedPlanFormModal.jsx';
import FeedPlanAssignModal from './components/FeedPlanAssignModal.jsx';
import GrowthReport from './components/GrowthReport.jsx';
import FeedCostReport from './components/FeedCostReport.jsx';
import LowGainAlerts from './components/LowGainAlerts.jsx';
import LowGainActionModal from './components/LowGainActionModal.jsx';
import FeedInventoryDashboard from './components/FeedInventoryDashboard.jsx';
import FeedItemFormModal from './components/FeedItemFormModal.jsx';
import FeedStockEntryModal from './components/FeedStockEntryModal.jsx';
import WeightTargetModal from './components/WeightTargetModal.jsx';
import PotreroAssignmentModal from './components/PotreroAssignmentModal.jsx';
import { FEED_PURPOSES, formatFeedDate } from './data/feedConstants.js';
import { computeLowGainAlerts } from './data/growthAlerts.js';
import { computeFeedConsumption } from './data/feedInventory.js';
import { getEffectiveTarget } from './data/growthProjection.js';
import './App.css';

function App() {
  const [animals, setAnimals] = useState(() => {
    const saved = localStorage.getItem("trazafinca_animals");
    return saved ? JSON.parse(saved) : SEED_ANIMALS;
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("activos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isBajaModalOpen, setIsBajaModalOpen] = useState(false);
  const [animalIdToBaja, setAnimalIdToBaja] = useState(null);
  const [diagnoses, setDiagnoses] = useState(() => {
    const saved = localStorage.getItem("trazafinca_diagnoses");
    // Si hay guardados, usarlos; si no, usar los de seed.js
    return saved ? JSON.parse(saved) : SEED_DIAGNOSES;
  });
  const [isCollectiveModalOpen, setIsCollectiveModalOpen] = useState(false);

  // HU-23: Estado para Potreros y Asignaciones
  const [potreros, setPotreros] = useState(() => {
    const saved = localStorage.getItem("trazafinca_potreros");
    return saved ? JSON.parse(saved) : SEED_POTREROS;
  });
  const [potreroAssignments, setPotreroAssignments] = useState(() => {
    const saved = localStorage.getItem("trazafinca_potrero_assignments");
    return saved ? JSON.parse(saved) : SEED_POTRERO_ASSIGNMENTS;
  });
  const [isPotreroModalOpen, setIsPotreroModalOpen] = useState(false);
  const [potreroPreselectedIds, setPotreroPreselectedIds] = useState([]);

  useEffect(() => {
    localStorage.setItem("trazafinca_potreros", JSON.stringify(potreros));
  }, [potreros]);

  useEffect(() => {
    localStorage.setItem("trazafinca_potrero_assignments", JSON.stringify(potreroAssignments));
  }, [potreroAssignments]);

  const handleAssignPotrero = (animalIds, potreroId, fecha) => {
    const potrero = potreros.find(p => p.id === potreroId);
    if (!potrero) return;

    const updatedAssignments = [...potreroAssignments];
    const newAssignments = [];
    
    let maxIdNum = potreroAssignments.reduce((max, a) => {
        const m = a.id.match(/^PA-(\d+)$/);
        return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 0);

    animalIds.forEach(animalId => {
      const activeIdx = updatedAssignments.findIndex(a => a.animalId === animalId && a.fechaSalida === null);
      if (activeIdx !== -1) {
        if (updatedAssignments[activeIdx].potreroId === potreroId) return; 
        updatedAssignments[activeIdx] = { ...updatedAssignments[activeIdx], fechaSalida: fecha };
      }

      maxIdNum++;
      const newId = `PA-${String(maxIdNum).padStart(3, '0')}`;
      newAssignments.push({
        id: newId,
        animalId,
        potreroId,
        fechaIngreso: fecha,
        fechaSalida: null
      });
    });

    setPotreroAssignments([...updatedAssignments, ...newAssignments]);

    const updatedAnimals = animals.map(a => {
        if (animalIds.includes(a.id)) {
            return { ...a, potrero: potrero.nombre };
        }
        return a;
    });
    setAnimals(updatedAnimals);
    setIsPotreroModalOpen(false);
  };

  useEffect(() => {
    localStorage.setItem("trazafinca_animals", JSON.stringify(animals));
  }, [animals]);
  const [animalToEdit, setAnimalToEdit] = useState(null);

  // HU-07: Estado para Registro Sanitario y Navegación
  const [activeTab, setActiveTab] = useState("inicio"); // "inicio" | "animales" | "salud"
  const [healthRecords, setHealthRecords] = useState(() => {
    const saved = localStorage.getItem("trazafinca_health_records");
    return saved ? JSON.parse(saved) : SEED_HEALTH_RECORDS;
  });
  const [healthSearch, setHealthSearch] = useState("");
  const [treatmentFilter, setTreatmentFilter] = useState("todos");
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [preselectedAnimalId, setPreselectedAnimalId] = useState(null);
  const [preselectedTipo, setPreselectedTipo] = useState(null);
  const [preselectedProducto, setPreselectedProducto] = useState(null);

  useEffect(() => {
    localStorage.setItem("trazafinca_health_records", JSON.stringify(healthRecords));
  }, [healthRecords]);

  const [inventorySearch, setInventorySearch] = useState("");
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("trazafinca_inventory");
    return saved ? JSON.parse(saved) : SEED_INVENTORY;
  });

  useEffect(() => {
    localStorage.setItem("trazafinca_inventory", JSON.stringify(inventory));
  }, [inventory]);

  // HU Pesajes (Milestone 3): Estado de registros de peso
  const [weightRecords, setWeightRecords] = useState(() => {
    const saved = localStorage.getItem("trazafinca_weight_records");
    return saved ? JSON.parse(saved) : SEED_WEIGHT_RECORDS;
  });
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [weightSearch, setWeightSearch] = useState("");
  const [weightAnimalFilter, setWeightAnimalFilter] = useState("todos");

  // Pesaje masivo por lote (sesiones)
  const [weightSessions, setWeightSessions] = useState(() => {
    const saved = localStorage.getItem("trazafinca_weight_sessions");
    return saved ? JSON.parse(saved) : SEED_WEIGHT_SESSIONS;
  });
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchSummary, setBatchSummary] = useState(null);

  useEffect(() => {
    localStorage.setItem("trazafinca_weight_records", JSON.stringify(weightRecords));
  }, [weightRecords]);

  useEffect(() => {
    localStorage.setItem("trazafinca_weight_sessions", JSON.stringify(weightSessions));
  }, [weightSessions]);

  // HU Proyección de peso objetivo (Milestone 3)
  const [weightTargets, setWeightTargets] = useState(() => {
    const saved = localStorage.getItem("trazafinca_weight_targets");
    return saved ? JSON.parse(saved) : { byAnimal: {}, byLote: {} };
  });
  const [targetModalCtx, setTargetModalCtx] = useState(null);
  const [reportView, setReportView] = useState('crecimiento'); // 'crecimiento' | 'costos'

  useEffect(() => {
    localStorage.setItem("trazafinca_weight_targets", JSON.stringify(weightTargets));
  }, [weightTargets]);

  const openAnimalTarget = (animalId) => {
    setTargetModalCtx({
      mode: 'animal',
      key: animalId,
      label: `Animal ${animalId}`,
      currentValue: weightTargets.byAnimal[animalId] ?? null
    });
  };

  const openLoteTarget = (lote) => {
    setTargetModalCtx({
      mode: 'lote',
      key: lote,
      label: `Lote ${lote}`,
      currentValue: weightTargets.byLote[lote] ?? null
    });
  };

  const handleSaveTarget = (kg) => {
    if (!targetModalCtx) return;
    if (targetModalCtx.mode === 'animal') {
      setWeightTargets(prev => ({ ...prev, byAnimal: { ...prev.byAnimal, [targetModalCtx.key]: kg } }));
    } else {
      setWeightTargets(prev => ({ ...prev, byLote: { ...prev.byLote, [targetModalCtx.key]: kg } }));
    }
    setTargetModalCtx(null);
  };

  // HU Alimentación (Milestone 3): Planes de alimentación y asignaciones
  const [feedPlans, setFeedPlans] = useState(() => {
    const saved = localStorage.getItem("trazafinca_feed_plans");
    return saved ? JSON.parse(saved) : SEED_FEED_PLANS;
  });
  const [feedAssignments, setFeedAssignments] = useState(() => {
    const saved = localStorage.getItem("trazafinca_feed_assignments");
    return saved ? JSON.parse(saved) : SEED_FEED_ASSIGNMENTS;
  });
  const [isFeedPlanModalOpen, setIsFeedPlanModalOpen] = useState(false);
  const [feedPlanToEdit, setFeedPlanToEdit] = useState(null);
  const [feedPlanIsDuplicate, setFeedPlanIsDuplicate] = useState(false);
  const [isFeedAssignModalOpen, setIsFeedAssignModalOpen] = useState(false);
  const [feedAssignAnimalId, setFeedAssignAnimalId] = useState(null);

  useEffect(() => {
    localStorage.setItem("trazafinca_feed_plans", JSON.stringify(feedPlans));
  }, [feedPlans]);

  useEffect(() => {
    localStorage.setItem("trazafinca_feed_assignments", JSON.stringify(feedAssignments));
  }, [feedAssignments]);

  // HU Inventario de insumos (Milestone 3)
  const [feedItems, setFeedItems] = useState(() => {
    const saved = localStorage.getItem("trazafinca_feed_items");
    return saved ? JSON.parse(saved) : SEED_FEED_ITEMS;
  });
  const [feedStockEntries, setFeedStockEntries] = useState(() => {
    const saved = localStorage.getItem("trazafinca_feed_stock_entries");
    return saved ? JSON.parse(saved) : SEED_FEED_STOCK_ENTRIES;
  });
  const [isFeedItemModalOpen, setIsFeedItemModalOpen] = useState(false);
  const [feedStockEntryTarget, setFeedStockEntryTarget] = useState(null);

  useEffect(() => {
    localStorage.setItem("trazafinca_feed_items", JSON.stringify(feedItems));
  }, [feedItems]);

  useEffect(() => {
    localStorage.setItem("trazafinca_feed_stock_entries", JSON.stringify(feedStockEntries));
  }, [feedStockEntries]);

  // Insumos con consumo diario proyectado y cobertura de stock
  const feedItemsWithConsumption = computeFeedConsumption(feedItems, feedPlans, feedAssignments, animals);

  const handleSaveFeedItem = (data) => {
    const numbers = feedItems.map(i => {
      const m = i.id.match(/^FI-(\d+)$/);
      return m ? parseInt(m[1], 10) : 0;
    });
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const newId = `FI-${String(maxNum + 1).padStart(3, '0')}`;
    setFeedItems([...feedItems, { ...data, id: newId }]);
    setIsFeedItemModalOpen(false);
  };

  const handleAddFeedStockEntry = (data) => {
    const numbers = feedStockEntries.map(e => {
      const m = e.id.match(/^FE-(\d+)$/);
      return m ? parseInt(m[1], 10) : 0;
    });
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const newId = `FE-${String(maxNum + 1).padStart(3, '0')}`;

    // Suma la cantidad al stock del insumo y actualiza el costo unitario registrado
    setFeedItems(feedItems.map(i =>
      i.id === data.feedItemId
        ? { ...i, cantidad: Math.round((i.cantidad + data.cantidad) * 100) / 100, proveedor: data.proveedor, costoUnitario: data.costoUnitario }
        : i
    ));
    setFeedStockEntries([...feedStockEntries, { ...data, id: newId }]);
    setFeedStockEntryTarget(null);
  };

  // HU Alertas de bajo rendimiento (Milestone 3): acciones correctivas
  const [growthActions, setGrowthActions] = useState(() => {
    const saved = localStorage.getItem("trazafinca_growth_actions");
    return saved ? JSON.parse(saved) : [];
  });
  const [isLowGainActionOpen, setIsLowGainActionOpen] = useState(false);
  const [lowGainAlertTarget, setLowGainAlertTarget] = useState(null);

  useEffect(() => {
    localStorage.setItem("trazafinca_growth_actions", JSON.stringify(growthActions));
  }, [growthActions]);

  // Alertas de bajo rendimiento calculadas a partir de pesajes + planes activos
  const lowGainAlerts = computeLowGainAlerts(animals, weightRecords, feedAssignments, feedPlans);

  const handleRegisterGrowthAction = (data) => {
    const newId = `ACC-${String(growthActions.length + 1).padStart(3, '0')}`;
    setGrowthActions([...growthActions, { ...data, id: newId }]);
    setIsLowGainActionOpen(false);
    setLowGainAlertTarget(null);
  };

  const openLowGainAction = (alert) => {
    setLowGainAlertTarget(alert);
    setIsLowGainActionOpen(true);
  };

  // TF-16: Generación de ID Único
  const handleSaveAnimal = (newData) => {
    if (animalToEdit) {
      setAnimals(animals.map(a => a.id === animalToEdit.id ? { ...newData, id: a.id, estado: a.estado } : a));
      setAnimalToEdit(null);
    }
    else {
      const numbers = animals.map(a => {
        const match = a.id.match(/^AN-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      });
      const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
      const newId = `AN-${String(maxNum + 1).padStart(3, '0')}`;

      setAnimals([...animals, { ...newData, id: newId, estado: 'activo' }]);
    }
    setIsModalOpen(false);
  };

  // TF-18: Lógica de filtrado
  const filteredAnimals = animals.filter(a => {
    const matchesSearch =
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.especie.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "todos" ? true :
        statusFilter === "activos" ? a.estado === "activo" : a.estado === "baja";

    return matchesSearch && matchesStatus;
  });

  // HU-07 & HU-12: Guardar Registro Sanitario y Descontar Inventario
  const handleSaveHealthRecord = (newRecordData) => {
    // 1. Generar ID para el nuevo registro sanitario
    const numbers = healthRecords.map(r => {
      const match = r.id.match(/^REC-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const newId = `REC-${String(maxNum + 1).padStart(3, '0')}`;

    // 2. Calcular fecha próxima (Revacunación) si aplica
    let fechaProxima = null;
    if (newRecordData.periodoRevacunacion && parseInt(newRecordData.periodoRevacunacion, 10) > 0) {
      const days = parseInt(newRecordData.periodoRevacunacion, 10);
      const [year, month, day] = newRecordData.fechaAplicacion.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      date.setDate(date.getDate() + days);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      fechaProxima = `${y}-${m}-${d}`;
    }

    // 3. Crear el objeto del nuevo registro
    const newRecord = {
      ...newRecordData,
      id: newId,
      fechaProxima,
      notas: [],
      estado: 'confirmado'
    };

    // 4. LÓGICA DE INVENTARIO (HU-12): Descontar dosis del stock
    const updatedInventory = inventory.map(item => {
      // Comparamos nombre y lote exactamente
      if (item.nombre === newRecordData.productoComercial && item.lote === newRecordData.lote) {
        const dosisNum = parseFloat(newRecordData.dosis); // Extrae el número de "5 ml" o "2 cc"
        if (!isNaN(dosisNum)) {
          return { ...item, cantidad: Math.max(0, item.cantidad - dosisNum) };
        }
      }
      return item;
    });
    setInventory(updatedInventory);

    // 5. LÓGICA DE ALERTAS (HU-08): Resolver alertas antiguas pendientes
    const updatedHealthRecords = healthRecords.map(r => {
      if (
        r.animalId === newRecordData.animalId &&
        r.tipoTratamiento === newRecordData.tipoTratamiento &&
        r.fechaProxima &&
        !r.alertaAtendida
      ) {
        return { ...r, alertaAtendida: true };
      }
      return r;
    });

    // 6. ACTUALIZAR ESTADO FINAL (Un solo setHealthRecords)
    setHealthRecords([...updatedHealthRecords, newRecord]);

    // 7. CERRAR MODAL Y LIMPIAR
    setIsHealthModalOpen(false);
    setPreselectedAnimalId(null);
    setPreselectedTipo(null);
    setPreselectedProducto(null);
  };

  // HU-08: Manejadores para Alertas
  const handleResolveAlert = (recordId) => {
    setHealthRecords(prevRecords =>
      prevRecords.map(r =>
        r.id === recordId ? { ...r, alertaAtendida: true } : r
      )
    );
  };

  const handleQuickRegister = (animalId, tipoTratamiento, producto) => {
    setPreselectedAnimalId(animalId);
    setPreselectedTipo(tipoTratamiento);
    setPreselectedProducto(producto);
    setIsHealthModalOpen(true);
  };

  // Alertas activas para el Dashboard
  const activeAlertsList = healthRecords.filter(r => r.fechaProxima && r.alertaAtendida !== true);

  const handleAddClarificationNote = (recordId, noteText) => {
    const updatedRecords = healthRecords.map(r => {
      if (r.id === recordId) {
        const newNote = {
          id: r.notas.length + 1,
          texto: noteText,
          fecha: new Date().toISOString().split('T')[0]
        };
        return {
          ...r,
          notas: [...r.notas, newNote]
        };
      }
      return r;
    });
    setHealthRecords(updatedRecords);
  };

  // HU-07: Filtrado de registros sanitarios
  const filteredHealthRecords = healthRecords.filter(r => {
    const animal = animals.find(a => a.id === r.animalId);
    const arete = animal ? animal.arete || '' : '';
    const matchesSearch =
      r.animalId.toLowerCase().includes(healthSearch.toLowerCase()) ||
      arete.toLowerCase().includes(healthSearch.toLowerCase()) ||
      r.productoComercial.toLowerCase().includes(healthSearch.toLowerCase()) ||
      r.veterinario.toLowerCase().includes(healthSearch.toLowerCase());

    const matchesTreatment =
      treatmentFilter === 'todos' ? true : r.tipoTratamiento === treatmentFilter;

    return matchesSearch && matchesTreatment;
  });

  const stats = {
    total: animals.length,
    activos: animals.filter(a => a.estado === 'activo').length,
    bajas: animals.filter(a => a.estado === 'baja').length,
    tratamientos: healthRecords.length
  };

  const openEditModal = (animal) => {
    setAnimalToEdit(animal);
    setSelectedAnimal(null); // Cerramos el detalle
    setIsModalOpen(true);    // Abrimos el formulario
  };

  const handleConfirmBaja = (id, bajaInfo) => {
    const updatedAnimals = animals.map(a => {
      if (a.id === id) {
        return {
          ...a,
          estado: 'baja',
          bajaMotivo: bajaInfo.motivo,
          bajaComentarios: bajaInfo.comentarios,
          bajaFecha: bajaInfo.fecha
        };
      }
      return a;
    });
    setAnimals(updatedAnimals);
    setSelectedAnimal(null); // Cerrar ficha de detalle
    setIsBajaModalOpen(false);
  };

  const openBajaModal = (id) => {
    setAnimalIdToBaja(id);
    setIsBajaModalOpen(true);
  };

  const [isDxModalOpen, setIsDxModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("trazafinca_diagnoses", JSON.stringify(diagnoses));
  }, [diagnoses]);

  const handleSaveDiagnosis = (dxData) => {
    const newId = `DX-${String(diagnoses.length + 1).padStart(3, '0')}`;
    setDiagnoses([...diagnoses, { ...dxData, id: newId }]);
    setIsDxModalOpen(false);
  };

  const handleSaveCollectiveCampaign = (animalIds, commonData) => {
    // 1. Crear registros individuales idénticos (Criterio 2)
    const newRecords = animalIds.map((animalId, index) => {
      const nextId = healthRecords.length + 1 + index;
      const newId = `REC-${String(nextId).padStart(3, '0')}`;

      // Calcular fecha próxima si aplica
      let fechaProxima = null;
      if (commonData.periodoRevacunacion) {
        const date = new Date(commonData.fechaAplicacion);
        date.setDate(date.getDate() + parseInt(commonData.periodoRevacunacion));
        fechaProxima = date.toISOString().split('T')[0];
      }

      return {
        ...commonData,
        id: newId,
        animalId: animalId,
        fechaProxima,
        notas: [{ id: 1, texto: "Registro de campaña colectiva.", fecha: commonData.fechaAplicacion }],
        estado: 'confirmado'
      };
    });

    setHealthRecords([...healthRecords, ...newRecords]);
    setIsCollectiveModalOpen(false);

    // 2. Generar resumen para SENASA (Criterio 3)
    const totalDosis = animalIds.length * parseFloat(commonData.dosis || 0);
    alert(`Campaña finalizada con éxito\n` +
      `-------------------------------\n` +
      `Tratamiento: ${commonData.tipoTratamiento.toUpperCase()}\n` +
      `Producto: ${commonData.productoComercial}\n` +
      `Animales Tratados: ${animalIds.length}\n` +
      `Total Dosis Estimada: ${totalDosis} ${commonData.dosis.replace(/[0-9.]/g, '')}`);
  };

  // HU Pesajes: Guardar pesaje con cálculo automático de GDP (Ganancia Diaria de Peso)
  const handleSaveWeightRecord = (data) => {
    const numbers = weightRecords.map(r => {
      const match = r.id.match(/^PES-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const newId = `PES-${String(maxNum + 1).padStart(3, '0')}`;

    // Pesaje anterior del mismo animal (el más reciente con fecha <= a la nueva)
    const previous = weightRecords
      .filter(r => r.animalId === data.animalId && r.fecha <= data.fecha)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .pop();

    let gdp = null;
    if (previous) {
      const days = (new Date(data.fecha.replace(/-/g, '/')) - new Date(previous.fecha.replace(/-/g, '/'))) / 86400000;
      if (days > 0) {
        gdp = Math.round(((data.pesoKg - previous.pesoKg) / days) * 1000) / 1000;
      }
    }

    const newRecord = {
      ...data,
      id: newId,
      gdp,
      pesoAnterior: previous ? previous.pesoKg : null,
      fechaPesajeAnterior: previous ? previous.fecha : null,
      notas: [],
      estado: 'confirmado'
    };

    setWeightRecords([...weightRecords, newRecord]);
    setIsWeightModalOpen(false);
  };

  // HU Pesaje masivo: crea un registro individual por cada animal pesado en la sesión
  const handleSaveBatchWeights = (session) => {
    let counter = weightRecords.reduce((max, r) => {
      const m = r.id.match(/^PES-(\d+)$/);
      return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 0);

    const newRecords = session.entries.map(entry => {
      counter += 1;
      const newId = `PES-${String(counter).padStart(3, '0')}`;

      const previous = weightRecords
        .filter(r => r.animalId === entry.animalId && r.fecha <= session.fecha)
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .pop();

      let gdp = null;
      if (previous) {
        const days = (new Date(session.fecha.replace(/-/g, '/')) - new Date(previous.fecha.replace(/-/g, '/'))) / 86400000;
        if (days > 0) gdp = Math.round(((entry.pesoKg - previous.pesoKg) / days) * 1000) / 1000;
      }

      return {
        id: newId,
        animalId: entry.animalId,
        categoria: entry.categoria,
        fecha: session.fecha,
        pesoKg: entry.pesoKg,
        condicionCorporal: null,
        observaciones: `Pesaje masivo (${session.scope}: ${session.scopeValue})`,
        gdp,
        pesoAnterior: previous ? previous.pesoKg : null,
        fechaPesajeAnterior: previous ? previous.fecha : null,
        notas: [],
        estado: 'confirmado'
      };
    });

    setWeightRecords([...weightRecords, ...newRecords]);

    // Construir la sesión con resumen y comparación contra la anterior del mismo lote
    const weighedIds = session.entries.map(e => e.animalId);
    const pendingIds = session.scopeAnimalIds.filter(id => !weighedIds.includes(id));
    const avgWeight = session.entries.reduce((s, e) => s + e.pesoKg, 0) / session.entries.length;

    const prevSession = weightSessions
      .filter(s => s.scope === session.scope && s.scopeValue === session.scopeValue)
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.id.localeCompare(b.id))
      .pop();

    const sesNum = weightSessions.reduce((max, s) => {
      const m = s.id.match(/^SES-(\d+)$/);
      return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 0);

    const newSession = {
      id: `SES-${String(sesNum + 1).padStart(3, '0')}`,
      scope: session.scope,
      scopeValue: session.scopeValue,
      fecha: session.fecha,
      weighedIds,
      pendingIds,
      count: weighedIds.length,
      avgWeight: Math.round(avgWeight * 10) / 10,
      prevAvg: prevSession ? prevSession.avgWeight : null,
      prevFecha: prevSession ? prevSession.fecha : null
    };

    setWeightSessions([...weightSessions, newSession]);
    setIsBatchModalOpen(false);
    setBatchSummary(newSession);
  };

  // HU Pesajes: El registro es inalterable; solo se agregan notas aclaratorias
  const handleAddWeightNote = (recordId, noteText) => {
    setWeightRecords(prevRecords =>
      prevRecords.map(r => {
        if (r.id === recordId) {
          const newNote = {
            id: r.notas.length + 1,
            texto: noteText,
            fecha: new Date().toISOString().split('T')[0]
          };
          return { ...r, notas: [...r.notas, newNote] };
        }
        return r;
      })
    );
  };

  // HU Pesajes: Filtrado y orden cronológico del historial
  const filteredWeightRecords = weightRecords
    .filter(r => {
      const animal = animals.find(a => a.id === r.animalId);
      const arete = animal ? animal.arete || '' : '';
      const matchesSearch =
        r.animalId.toLowerCase().includes(weightSearch.toLowerCase()) ||
        arete.toLowerCase().includes(weightSearch.toLowerCase());
      const matchesAnimal = weightAnimalFilter === 'todos' ? true : r.animalId === weightAnimalFilter;
      return matchesSearch && matchesAnimal;
    })
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.id.localeCompare(b.id));

  // HU Alimentación: Crear o editar un plan personalizado
  const handleSaveFeedPlan = (data) => {
    if (data.id) {
      // Edición de plan existente
      setFeedPlans(feedPlans.map(p => p.id === data.id ? { ...p, ...data } : p));
    } else {
      const numbers = feedPlans.map(p => {
        const match = p.id.match(/^PA-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      });
      const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
      const newId = `PA-${String(maxNum + 1).padStart(3, '0')}`;
      setFeedPlans([...feedPlans, { ...data, id: newId }]);
    }
    setIsFeedPlanModalOpen(false);
    setFeedPlanToEdit(null);
    setFeedPlanIsDuplicate(false);
  };

  const openFeedPlanModal = (plan = null, isDuplicate = false) => {
    setFeedPlanToEdit(plan);
    setFeedPlanIsDuplicate(isDuplicate);
    setIsFeedPlanModalOpen(true);
  };

  // HU Alimentación: Asignar plan. Solo uno activo por animal; el anterior se archiva.
  const handleAssignFeedPlan = (data) => {
    const numbers = feedAssignments.map(as => {
      const match = as.id.match(/^AS-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const newId = `AS-${String(maxNum + 1).padStart(3, '0')}`;

    // 1. Archivar el plan activo anterior del mismo animal (con fecha de cierre)
    const updated = feedAssignments.map(as => {
      if (as.animalId === data.animalId && as.estado === 'activo') {
        return { ...as, estado: 'archivado', fechaCierre: data.fechaInicio };
      }
      return as;
    });

    // 2. Crear la nueva asignación activa
    const newAssignment = {
      id: newId,
      animalId: data.animalId,
      planId: data.planId,
      fechaInicio: data.fechaInicio,
      fechaCierre: null,
      responsable: data.responsable,
      estado: 'activo'
    };

    setFeedAssignments([...updated, newAssignment]);
    setIsFeedAssignModalOpen(false);
    setFeedAssignAnimalId(null);
  };

  const openFeedAssignModal = (animalId = null) => {
    setFeedAssignAnimalId(animalId);
    setIsFeedAssignModalOpen(true);
  };

  // Helper para mostrar el plan asignado en la tabla de asignaciones
  const getPlanById = (planId) => feedPlans.find(p => p.id === planId);

  const filteredInventory = inventory.filter(item => {
    const term = inventorySearch.toLowerCase();
    return (
      item.nombre.toLowerCase().includes(term) ||
      item.lote.toLowerCase().includes(term) ||
      item.principioActivo.toLowerCase().includes(term)
    );
  });

  const TODAY_STR = '2026-06-09';

  const withdrawalList = healthRecords.reduce((acc, record) => {
    const appDate = new Date(record.fechaAplicacion.replace(/-/g, '/'));
    const today = new Date(TODAY_STR.replace(/-/g, '/'));

    // Calcular fechas de liberación
    const getReleaseDate = (days) => {
      if (!days) return null;
      const date = new Date(appDate);
      date.setDate(appDate.getDate() + days);
      return date;
    };

    const releaseCarne = getReleaseDate(record.periodoRetiroCarne);
    const releaseLeche = getReleaseDate(record.periodoRetiroLeche);

    const isRestrictedCarne = releaseCarne && releaseCarne > today;
    const isRestrictedLeche = releaseLeche && releaseLeche > today;

    if (isRestrictedCarne || isRestrictedLeche) {
      acc.push({
        animalId: record.animalId,
        arete: animals.find(a => a.id === record.animalId)?.arete,
        producto: record.productoComercial,
        fechaAplicacion: record.fechaAplicacion,
        isRestrictedCarne,
        isRestrictedLeche,
        releaseCarne: releaseCarne?.toISOString().split('T')[0],
        releaseLeche: releaseLeche?.toISOString().split('T')[0]
      });
    }
    return acc;
  }, []);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo"><span>FincaTraza</span></div>
          <p className="subtitle">Gestión Pecuaria</p>
        </div>

        {/* Menú de Navegación lateral */}
        <div className="sidebar-menu">
          <h3>Menú</h3>
          <div className="nav-buttons">
            <button
              className={`nav-btn ${activeTab === 'inicio' ? 'active' : ''}`}
              onClick={() => setActiveTab('inicio')}
            >
Inicio
            </button>
            <button
              className={`nav-btn ${activeTab === 'animales' ? 'active' : ''}`}
              onClick={() => setActiveTab('animales')}
            >
Animales
            </button>
            <button
              className={`nav-btn ${activeTab === 'salud' ? 'active' : ''}`}
              onClick={() => setActiveTab('salud')}
            >
Historial Sanitario
            </button>
            <button
              className={`nav-btn ${activeTab === 'crecimiento' ? 'active' : ''}`}
              onClick={() => setActiveTab('crecimiento')}
            >
Peso y Crecimiento
            </button>
            <button
              className={`nav-btn ${activeTab === 'alimentacion' ? 'active' : ''}`}
              onClick={() => setActiveTab('alimentacion')}
            >
Alimentación
            </button>
            <button
              className={`nav-btn ${activeTab === 'reportes' ? 'active' : ''}`}
              onClick={() => setActiveTab('reportes')}
            >
Reportes
            </button>
            <button
              className={`nav-btn ${activeTab === 'inventario' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventario')}
            >
Inventario
            </button>
          </div>
        </div>

        <div className="stats-section">
          <h3>Resumen</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-num">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-card active">
              <span className="stat-num">{stats.activos}</span>
              <span className="stat-label">Activos</span>
            </div>
            <div className="stat-card health">
              <span className="stat-num">{stats.tratamientos}</span>
              <span className="stat-label">Tratamientos</span>
            </div>
          </div>
        </div>

        {activeTab === 'animales' && (
          <div className="filter-group-sidebar">
            <h3>Filtrar por Estado</h3>
            <div className="radio-buttons-filter">
              {['activos', 'bajas', 'todos'].map(f => (
                <label key={f} className="radio-label">
                  <input type="radio" name="status" value={f} checked={statusFilter === f} onChange={() => setStatusFilter(f)} />
                  <span className="custom-radio">{f.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </aside>

      {activeTab === 'inicio' ? (
        <main className="main-content">
          <header className="main-header">
            <div className="search-wrapper" style={{ visibility: 'hidden' }}>
              <input type="text" disabled value="" readOnly aria-hidden="true" tabIndex={-1} />
            </div>
            <button className="btn btn-primary" onClick={() => { setPreselectedAnimalId(null); setPreselectedTipo(null); setPreselectedProducto(null); setIsHealthModalOpen(true); }}>
              Registrar Tratamiento
            </button>
          </header>

          <section className="list-container">
            <WithdrawalMonitor list={withdrawalList} />
            <LowGainAlerts
              alerts={lowGainAlerts}
              actions={growthActions}
              onRegisterAction={openLowGainAction}
            />
            <AlertDashboard
              alerts={activeAlertsList}
              animals={animals}
              healthRecords={healthRecords}
              onResolveAlert={handleResolveAlert}
              onQuickRegister={handleQuickRegister}
            />
          </section>
        </main>
      ) : activeTab === 'animales' ? (
        <main className="main-content">
          <header className="main-header">
            <div className="search-wrapper">
              <input
                type="text"
                aria-label="Buscar" placeholder="Buscar por ID o especie..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => { setPotreroPreselectedIds([]); setIsPotreroModalOpen(true); }}>
                Asignar a Potrero
              </button>
              <button className="btn btn-primary" onClick={() => { setAnimalToEdit(null); setIsModalOpen(true) }}>
                Registrar Animal
              </button>
            </div>
          </header>

          <section className="list-container">
            <div className="toolbar-title">
              <h1>Animales {statusFilter}</h1>
              <span className="badge">{filteredAnimals.length} animales</span>
            </div>

            {filteredAnimals.length > 0 ? (
              <div className="animals-grid">
                {filteredAnimals.map(a => (
                  <AnimalCard
                    key={a.id}
                    animal={a}
                    onClick={() => setSelectedAnimal(a)} // Abrir detalle al hacer clic
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h2>No hay animales</h2>
                <p>No se encontraron registros para esta selección.</p>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Registrar Animal</button>
              </div>
            )}
          </section>
        </main>
      ) : activeTab === 'crecimiento' ? (
        <main className="main-content">
          <header className="main-header">
            <div className="search-wrapper">
              <input
                type="text"
                aria-label="Buscar" placeholder="Buscar por ID o arete del animal..."
                value={weightSearch}
                onChange={(e) => setWeightSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setIsBatchModalOpen(true)}>
                Pesaje Masivo
              </button>
              <button className="btn btn-primary" onClick={() => setIsWeightModalOpen(true)}>
                Registrar Pesaje
              </button>
            </div>
          </header>

          <section className="list-container">
            <div className="filters-toolbar">
              <div className="toolbar-title">
                <h1>Historial de Pesajes</h1>
                <span className="badge">{filteredWeightRecords.length} pesajes</span>
              </div>

              <div className="toolbar-filters">
                <div className="select-wrapper">
                  <select value={weightAnimalFilter} onChange={(e) => setWeightAnimalFilter(e.target.value)}>
                    <option value="todos">Todos los animales</option>
                    {animals.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.id} {a.arete ? `[${a.arete}]` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filteredWeightRecords.length > 0 ? (
              <div className="health-records-grid">
                {filteredWeightRecords.map(record => {
                  const animal = animals.find(a => a.id === record.animalId);
                  return (
                    <WeightRecordCard
                      key={record.id}
                      record={record}
                      animal={animal}
                      onAddNote={(text) => handleAddWeightNote(record.id, text)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <h2>No hay pesajes registrados</h2>
                <p>No se encontraron registros de peso para esta selección.</p>
                <button className="btn btn-primary" onClick={() => setIsWeightModalOpen(true)}>
                  Registrar Pesaje
                </button>
              </div>
            )}
          </section>
        </main>
      ) : activeTab === 'reportes' ? (
        <main className="main-content">
          <header className="main-header">
            <div className="report-tabs">
              <button
                className={`report-tab ${reportView === 'crecimiento' ? 'active' : ''}`}
                onClick={() => setReportView('crecimiento')}
              >
Ganancia de Peso
              </button>
              <button
                className={`report-tab ${reportView === 'costos' ? 'active' : ''}`}
                onClick={() => setReportView('costos')}
              >
Costo de Alimentación
              </button>
            </div>
          </header>
          {reportView === 'crecimiento' ? (
            <GrowthReport
              animals={animals}
              weightRecords={weightRecords}
              weightTargets={weightTargets}
              onDefineLoteTarget={openLoteTarget}
            />
          ) : (
            <FeedCostReport
              animals={animals}
              weightRecords={weightRecords}
              feedPlans={feedPlans}
              feedAssignments={feedAssignments}
              feedItems={feedItems}
            />
          )}
        </main>
      ) : activeTab === 'alimentacion' ? (
        <main className="main-content">
          <header className="main-header">
            <div className="search-wrapper" style={{ visibility: 'hidden' }}>
              <input type="text" disabled value="" readOnly aria-hidden="true" tabIndex={-1} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => openFeedAssignModal(null)}>
                Asignar Plan a Animal
              </button>
              <button className="btn btn-primary" onClick={() => openFeedPlanModal(null, false)}>
                Crear Plan
              </button>
            </div>
          </header>

          <section className="list-container">
            {/* Catálogo de planes */}
            <div className="toolbar-title">
              <h1>Catálogo de Planes de Alimentación</h1>
              <span className="badge">{feedPlans.length} planes</span>
            </div>

            <div className="feed-plans-grid">
              {feedPlans.map(plan => (
                <FeedPlanCard
                  key={plan.id}
                  plan={plan}
                  assignedCount={feedAssignments.filter(as => as.planId === plan.id && as.estado === 'activo').length}
                  onEdit={openFeedPlanModal}
                />
              ))}
            </div>

            {/* Asignaciones activas por animal */}
            <div className="toolbar-title" style={{ marginTop: '40px' }}>
              <h1>Asignaciones Activas</h1>
              <span className="badge">
                {feedAssignments.filter(as => as.estado === 'activo').length} animales
              </span>
            </div>

            {feedAssignments.filter(as => as.estado === 'activo').length > 0 ? (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Animal / Arete</th>
                      <th>Plan Activo</th>
                      <th>Propósito</th>
                      <th>Inicio</th>
                      <th>Responsable</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedAssignments
                      .filter(as => as.estado === 'activo')
                      .map(as => {
                        const animal = animals.find(a => a.id === as.animalId);
                        const plan = getPlanById(as.planId);
                        return (
                          <tr key={as.id}>
                            <td>
                              <strong>{as.animalId}</strong>
                              {animal && animal.arete && <span className="muted-inline"> · {animal.arete}</span>}
                            </td>
                            <td>{plan ? plan.nombre : 'Plan eliminado'}</td>
                            <td>{plan ? (FEED_PURPOSES[plan.proposito] || plan.proposito) : '—'}</td>
                            <td>{formatFeedDate(as.fechaInicio)}</td>
                            <td>{as.responsable}</td>
                            <td>
                              <button className="btn btn-outline btn-sm" onClick={() => openFeedAssignModal(as.animalId)}>
                                Cambiar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No hay planes de alimentación asignados todavía.</p>
                <button className="btn btn-primary" onClick={() => openFeedAssignModal(null)}>
                  Asignar Plan a Animal
                </button>
              </div>
            )}

            {/* Inventario de insumos de alimentación (Milestone 3) */}
            <div style={{ marginTop: '40px' }}>
              <FeedInventoryDashboard
                items={feedItemsWithConsumption}
                entries={feedStockEntries}
                onAddItem={() => setIsFeedItemModalOpen(true)}
                onAddEntry={(item) => setFeedStockEntryTarget(item)}
              />
            </div>
          </section>
        </main>
      ) : activeTab === 'inventario' ? (

        <main className="main-content">
          <header className="main-header">
            <div className="search-wrapper">
              <input
                type="text"
                aria-label="Buscar" placeholder="Buscar por Lote o Nombre del producto..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
              />
            </div>
          </header>
          <section className="list-container">
            <InventoryDashboard
              inventory={filteredInventory}
            />
            {filteredInventory.length === 0 && (
              <div className="empty-state">
                <p>No se encontraron productos que coincidan con "{inventorySearch}"</p>
              </div>
            )}
          </section>
        </main>

      ) : (
        <main className="main-content">
          <header className="main-header">
            <div className="search-wrapper">
              <input
                type="text"
                aria-label="Buscar" placeholder="Buscar por arete, producto o veterinario..."
                value={healthSearch}
                onChange={(e) => setHealthSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setIsCollectiveModalOpen(true)}>
                Vacunación Colectiva
              </button>
              <button className="btn btn-outline" onClick={() => setIsDxModalOpen(true)}>
                Registrar Diagnóstico
              </button>
              <button className="btn btn-primary" onClick={() => { setPreselectedAnimalId(null); setPreselectedTipo(null); setPreselectedProducto(null); setIsHealthModalOpen(true); }}>
                Registrar Tratamiento
              </button>
            </div>
          </header>

          <section className="list-container">
            <div className="filters-toolbar">
              <div className="toolbar-title">
                <h1>Registro Sanitario</h1>
                <span className="badge">{filteredHealthRecords.length} registros</span>
              </div>

              <div className="toolbar-filters">
                <div className="select-wrapper">
                  <select value={treatmentFilter} onChange={(e) => setTreatmentFilter(e.target.value)}>
                    <option value="todos">Todos los tratamientos</option>
                    <option value="vacuna">Vacunas</option>
                    <option value="desparasitacion_interna">Desparasitaciones Internas</option>
                    <option value="desparasitacion_externa">Desparasitaciones Externas</option>
                    <option value="vitamina_mineral">Vitaminas / Minerales</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredHealthRecords.length > 0 ? (
              <div className="health-records-grid">
                {filteredHealthRecords.map(record => {
                  const animal = animals.find(a => a.id === record.animalId);
                  return (
                    <HealthRecordCard
                      key={record.id}
                      record={record}
                      animal={animal}
                      onAddNote={(text) => handleAddClarificationNote(record.id, text)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <h2>No hay registros sanitarios</h2>
                <p>No se encontraron tratamientos registrados para esta selección.</p>
                <button className="btn btn-primary" onClick={() => { setPreselectedAnimalId(null); setPreselectedTipo(null); setPreselectedProducto(null); setIsHealthModalOpen(true); }}>
                  Registrar Tratamiento
                </button>
              </div>
            )}
            <div className="toolbar-title" style={{ marginTop: '40px' }}>
              <h1>Historial de Diagnósticos y Morbilidad</h1>
              <span className="badge">{diagnoses.length} casos</span>
            </div>

            {diagnoses.length > 0 ? (
              <div className="health-records-grid"> {/* Reutilizamos el grid de salud */}
                {diagnoses.map(dx => (
                  <DiagnosisCard
                    key={dx.id}
                    diagnosis={dx}
                    animal={animals.find(a => a.id === dx.animalId)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No hay diagnósticos médicos registrados aún.</p>
              </div>
            )}
          </section>
        </main>
      )}

      {/* Modal de Registro */}
      <AnimalFormModal
        key={isModalOpen ? `animal-form-${animalToEdit ? animalToEdit.id : 'nuevo'}` : 'animal-form-cerrado'}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setAnimalToEdit(null); }}
        onSave={handleSaveAnimal}
        animalToEdit={animalToEdit}
      />

      {/* Modal de Detalle (HU-03 / TF-17) */}
      <AnimalDetailModal
        animal={selectedAnimal}
        onClose={() => setSelectedAnimal(null)}
        onEdit={openEditModal}
        onBaja={openBajaModal}
        healthRecords={healthRecords}
        diagnoses={diagnoses}
        feedPlans={feedPlans}
        feedAssignments={selectedAnimal ? feedAssignments.filter(as => as.animalId === selectedAnimal.id) : []}
        potreros={potreros}
        potreroAssignments={potreroAssignments}
        onReassignPotrero={(animalId) => {
          setPotreroPreselectedIds([animalId]);
          setIsPotreroModalOpen(true);
        }}
        onAssignFeedPlan={(animalId) => openFeedAssignModal(animalId)}
        animalWeightRecords={selectedAnimal ? weightRecords.filter(r => r.animalId === selectedAnimal.id) : []}
        weightTarget={selectedAnimal ? getEffectiveTarget(selectedAnimal, weightTargets) : null}
        onSetWeightTarget={(animalId) => openAnimalTarget(animalId)}
        onAddHealthRecord={(animalId) => {
          setPreselectedAnimalId(animalId);
          setPreselectedTipo(null);
          setPreselectedProducto(null);
          setIsHealthModalOpen(true);
        }}
        onAddNoteToRecord={handleAddClarificationNote}
      />

      {/* Modal de Baja (HU-06) */}
      <BajaModal
        isOpen={isBajaModalOpen}
        animalId={animalIdToBaja}
        onClose={() => setIsBajaModalOpen(false)}
        onConfirm={handleConfirmBaja}
      />

      {/* Modal de Registro de Tratamiento (HU-07) */}
      <HealthRecordFormModal
        isOpen={isHealthModalOpen}
        onClose={() => {
          setIsHealthModalOpen(false);
          setPreselectedAnimalId(null);
          setPreselectedTipo(null);
          setPreselectedProducto(null);
        }}
        onSave={handleSaveHealthRecord}
        animals={animals}
        preselectedAnimalId={preselectedAnimalId}
        preselectedTipo={preselectedTipo}
        preselectedProducto={preselectedProducto}
      />
      {/* Modal de Diagnostico */}
      <DiagnosisFormModal
        isOpen={isDxModalOpen}
        onClose={() => setIsDxModalOpen(false)}
        onSave={handleSaveDiagnosis}
        animals={animals}
      />
      {/* Modal de Registro de Pesaje (Milestone 3) */}
      <WeightRecordFormModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        onSave={handleSaveWeightRecord}
        animals={animals}
      />
      {/* Modal de Pesaje Masivo (Milestone 3) */}
      <BatchWeightModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSave={handleSaveBatchWeights}
        animals={animals}
        weightRecords={weightRecords}
      />
      <BatchWeightSummaryModal
        isOpen={!!batchSummary}
        onClose={() => setBatchSummary(null)}
        summary={batchSummary}
        animals={animals}
      />
      {/* Modales de Planes de Alimentación (Milestone 3) */}
      <FeedPlanFormModal
        isOpen={isFeedPlanModalOpen}
        onClose={() => { setIsFeedPlanModalOpen(false); setFeedPlanToEdit(null); setFeedPlanIsDuplicate(false); }}
        onSave={handleSaveFeedPlan}
        planToEdit={feedPlanToEdit}
        isDuplicate={feedPlanIsDuplicate}
      />
      <FeedPlanAssignModal
        isOpen={isFeedAssignModalOpen}
        onClose={() => { setIsFeedAssignModalOpen(false); setFeedAssignAnimalId(null); }}
        onAssign={handleAssignFeedPlan}
        animals={animals}
        plans={feedPlans}
        assignments={feedAssignments}
        preselectedAnimalId={feedAssignAnimalId}
      />
      {/* Modal de Acción Correctiva por bajo rendimiento (Milestone 3) */}
      <LowGainActionModal
        isOpen={isLowGainActionOpen}
        onClose={() => { setIsLowGainActionOpen(false); setLowGainAlertTarget(null); }}
        onSave={handleRegisterGrowthAction}
        alert={lowGainAlertTarget}
      />
      {/* Modales de Inventario de Insumos (Milestone 3) */}
      <FeedItemFormModal
        isOpen={isFeedItemModalOpen}
        onClose={() => setIsFeedItemModalOpen(false)}
        onSave={handleSaveFeedItem}
      />
      <FeedStockEntryModal
        isOpen={!!feedStockEntryTarget}
        onClose={() => setFeedStockEntryTarget(null)}
        onSave={handleAddFeedStockEntry}
        item={feedStockEntryTarget}
      />
      {/* Modal de Peso Objetivo (Milestone 3) */}
      <WeightTargetModal
        isOpen={!!targetModalCtx}
        onClose={() => setTargetModalCtx(null)}
        onSave={handleSaveTarget}
        ctx={targetModalCtx}
      />
      {/* Modal de Vacunación Colectiva (HU-11) */}
      <CollectiveVaccinationModal
        isOpen={isCollectiveModalOpen}
        onClose={() => setIsCollectiveModalOpen(false)}
        onSave={handleSaveCollectiveCampaign}
        animals={animals}
      />
      {/* Modal de Asignación a Potrero (HU-23) */}
      <PotreroAssignmentModal
        isOpen={isPotreroModalOpen}
        onClose={() => setIsPotreroModalOpen(false)}
        onSave={handleAssignPotrero}
        animals={animals}
        potreros={potreros}
        potreroAssignments={potreroAssignments}
        preselectedAnimalIds={potreroPreselectedIds}
      />
    </div>
  );
}

export default App;