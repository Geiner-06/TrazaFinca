import { useState, useEffect } from 'react';
import { SEED_ANIMALS } from './data/seed.js';
import AnimalCard from './components/AnimalCard.jsx';
import AnimalFormModal from './components/AnimalFormModal.jsx';
import './App.css';

function App() {
  const [animals, setAnimals] = useState(() => {
    const saved = localStorage.getItem("gestafinca_animals");
    return saved ? JSON.parse(saved) : SEED_ANIMALS;
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("activos");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("trazafinca_animals", JSON.stringify(animals));
  }, [animals]);

  // TF-16: Generación de ID Único
  const handleSaveAnimal = (newData) => {
    const numbers = animals.map(a => {
      const match = a.id.match(/^AN-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextId = maxNum + 1;
    const newId = `AN-${String(nextId).padStart(3, '0')}`;

    setAnimals([...animals, { ...newData, id: newId, estado: 'activo' }]);
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
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
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
              {filteredAnimals.map(a => <AnimalCard key={a.id} animal={a} />)}
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

      <AnimalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAnimal}
      />
    </div>
  );
}

export default App;