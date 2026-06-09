import { useState, useEffect } from 'react';
import { SEED_ANIMALS } from './data/seed.js';
import AnimalCard from './components/AnimalCard.jsx';
import AnimalFormModal from './components/AnimalFormModal.jsx';
import AnimalDetailModal from './components/AnimalDatailModal.jsx';
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
  useEffect(() => {
    localStorage.setItem("trazafinca_animals", JSON.stringify(animals));
  }, [animals]);
  const [animalToEdit, setAnimalToEdit] = useState(null);

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

      setAnimals([...animals, { ...formData, id: newId, estado: 'activo' }]);
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

  const stats = {
    total: animals.length,
    activos: animals.filter(a => a.estado === 'activo').length,
    bajas: animals.filter(a => a.estado === 'baja').length
  };

  const openEditModal = (animal) => {
    setAnimalToEdit(animal);
    setSelectedAnimal(null); // Cerramos el detalle
    setIsModalOpen(true);    // Abrimos el formulario
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo"><span>TrazaFinca</span></div>
          <p className="subtitle">Gestión de Animales</p>
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
          </div>
        </div>

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
      </aside>

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
      />
    </div>
  );
}

export default App;