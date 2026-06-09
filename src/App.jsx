import { useState } from 'react';
import { SEED_ANIMALS } from './data/seed.js';
import AnimalCard from './components/AnimalCard.jsx';

function App() {
  const [animals, setAnimals] = useState(SEED_ANIMALS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("activos");

  const filteredAnimals = animals.filter(a => {
    const matchesSearch =
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.especie.toLowerCase().includes(search.toLowerCase()) ||
      a.proposito.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "todos" ? true :
        statusFilter === "activos" ? a.estado === "activo" : a.estado === "baja";

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header"><div className="logo"><span>TrazaFinca</span></div></div>
        <div className="filter-group-sidebar">
          <h3>Filtrar por Estado</h3>
          <div className="radio-buttons-filter">
            {['activos', 'bajas', 'todos'].map(status => (
              <label key={status} className="radio-label">
                <input type="radio" name="status" value={status}
                  checked={statusFilter === status}
                  onChange={() => setStatusFilter(status)} />
                <span className="custom-radio">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <div className="search-wrapper">
            <input type="text" placeholder="Buscar por ID, especie..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary">Registrar Animal</button>
        </header>

        <section className="list-container">
          <div className="toolbar-title">
            <h1>{statusFilter === 'activos' ? 'Animales Activos' : statusFilter === 'bajas' ? 'Animales de Baja' : 'Todos'}</h1>
            <span className="badge">{filteredAnimals.length} animales</span>
          </div>

          {filteredAnimals.length > 0 ? (
            <div className="animals-grid">
              {filteredAnimals.map(a => {
                console.log("Renderizando:", a.id);
                return <AnimalCard key={a.id} animal={a} />;
              })}

            </div>
          ) : (
            <div className="empty-state">
              <h2>Sin resultados</h2>
              <p>No hay animales que coincidan con los filtros.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
export default App;