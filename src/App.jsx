import { useState, useEffect } from 'react';
import { SEED_ANIMALS, SEED_HEALTH_RECORDS } from './data/seed.js';
import AnimalCard from './components/AnimalCard.jsx';
import AnimalFormModal from './components/AnimalFormModal.jsx';
import AnimalDetailModal from './components/AnimalDatailModal.jsx';
import BajaModal from './components/BajaModal.jsx';
import HealthRecordFormModal from './components/HealthRecordFormModal.jsx';
import HealthRecordCard from './components/HealthRecordCard.jsx';
import AlertDashboard from './components/AlertDashboard.jsx';
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

  // HU-07: Guardar Registro Sanitario
  const handleSaveHealthRecord = (newRecordData) => {
    // 1. Generar ID para el nuevo registro
    const numbers = healthRecords.map(r => {
      const match = r.id.match(/^REC-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const newId = `REC-${String(maxNum + 1).padStart(3, '0')}`;

    // 2. Calcular fecha próxima si aplica
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

    const newRecord = {
      ...newRecordData,
      id: newId,
      fechaProxima,
      notas: [],
      estado: 'confirmado'
    };

    // Buscamos registros antiguos del mismo animal y tipo que tengan una alerta pendiente
    const updatedRecords = healthRecords.map(r => {
      if (
        r.animalId === newRecordData.animalId &&
        r.tipoTratamiento === newRecordData.tipoTratamiento &&
        r.fechaProxima &&
        !r.alertaAtendida
      ) {
        // Marcamos el registro viejo como atendido porque acabamos de crear uno nuevo hoy
        return { ...r, alertaAtendida: true };
      }
      return r;
    });

    // 3. Guardamos tanto los registros actualizados como el nuevo
    setHealthRecords([...updatedRecords, newRecord]);

    // 4. Cerrar modal y limpiar estados
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

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo"><span>TrazaFinca</span></div>
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
              <span className="nav-icon">🏠</span> Inicio
            </button>
            <button
              className={`nav-btn ${activeTab === 'animales' ? 'active' : ''}`}
              onClick={() => setActiveTab('animales')}
            >
              <span className="nav-icon">🐂</span> Animales
            </button>
            <button
              className={`nav-btn ${activeTab === 'salud' ? 'active' : ''}`}
              onClick={() => setActiveTab('salud')}
            >
              <span className="nav-icon">💉</span> Historial Sanitario
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
                  <input type="radio" name="status" checked={statusFilter === f} onChange={() => setStatusFilter(f)} />
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
              <input type="text" disabled />
            </div>
            <button className="btn btn-primary" onClick={() => { setPreselectedAnimalId(null); setPreselectedTipo(null); setPreselectedProducto(null); setIsHealthModalOpen(true); }}>
              Registrar Tratamiento
            </button>
          </header>

          <section className="list-container">
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
                placeholder="Buscar por ID o especie..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={() => { setAnimalToEdit(null); setIsModalOpen(true) }}>
              Registrar Animal
            </button>
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
      ) : (
        <main className="main-content">
          <header className="main-header">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Buscar por arete, producto o veterinario..."
                value={healthSearch}
                onChange={(e) => setHealthSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={() => { setPreselectedAnimalId(null); setPreselectedTipo(null); setPreselectedProducto(null); setIsHealthModalOpen(true); }}>
              Registrar Tratamiento
            </button>
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
          </section>
        </main>
      )}

      {/* Modal de Registro */}
      <AnimalFormModal
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
    </div>
  );
}

export default App;