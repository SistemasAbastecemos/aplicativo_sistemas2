import React, { useState, useEffect } from 'react';
import './ConsultaTab.css';
const ConsultaTab = () => {
  const [filtro, setFiltro] = useState({
    documento: '',
    placa: '',
    estado: 'EN_SITIO',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  const buscarVisitas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filtro).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/consultar_visitas.php?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResultados(data);
      }
    } catch (error) {
      console.error('Error consultando visitas:', error);
    } finally {
      setLoading(false);
    }
  };

  const liberarVisita = async (visitaId) => {
    if (confirm('¿Está seguro de liberar esta visita?')) {
      try {
        const response = await fetch('/api/liberar_visita.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitaId })
        });

        if (response.ok) {
          alert('Visita liberada exitosamente');
          buscarVisitas();
        }
      } catch (error) {
        console.error('Error liberando visita:', error);
      }
    }
  };

  useEffect(() => {
    // Buscar automáticamente al cargar
    buscarVisitas();
  }, []);

  return (
    <div className="consulta-tab">
      <div className="tab-header">
        <h2> Consulta de Visitantes en Sitio</h2>
        <p>Busque y gestione visitantes activos en la sede</p>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtros-grid">
          <div className="form-group">
            <label>Documento</label>
            <input
              type="text"
              value={filtro.documento}
              onChange={(e) => setFiltro({...filtro, documento: e.target.value})}
              placeholder="12345678"
            />
          </div>
          
          <div className="form-group">
            <label>Placa</label>
            <input
              type="text"
              value={filtro.placa}
              onChange={(e) => setFiltro({...filtro, placa: e.target.value.toUpperCase()})}
              placeholder="ABC123"
            />
          </div>
          
          <div className="form-group">
            <label>Estado</label>
            <select
              value={filtro.estado}
              onChange={(e) => setFiltro({...filtro, estado: e.target.value})}
            >
              <option value="EN_SITIO">En Sitio</option>
              <option value="EN_ESPERA">En Espera</option>
              <option value="TODOS">Todos</option>
            </select>
          </div>
          
          <div className="form-group">
            <button 
              onClick={buscarVisitas}
              className="btn-buscar"
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="resultados-container">
        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Buscando visitas...</p>
          </div>
        ) : resultados.length === 0 ? (
          <div className="no-resultados">
             No se encontraron visitas
          </div>
        ) : (
          <div className="resultados-list">
            <div className="resultados-header">
              <div className="total-visitas">
                Total visitas: <strong>{resultados.length}</strong>
              </div>
              <div className="contador-tiempo">
                <span>⏱ Tiempo promedio: 45 min</span>
              </div>
            </div>

            {resultados.map((visita) => (
              <div key={visita.id} className="visita-card">
                <div className="visita-header">
                  <span className="visita-ficha">Ficha #{visita.ficha_numero}</span>
                  <span className={`visita-estado ${visita.estado.toLowerCase()}`}>
                    {visita.estado === 'EN_SITIO' ? '🟢 En Sitio' : '🟡 En Espera'}
                  </span>
                </div>
                
                <div className="visita-body">
                  <div className="visita-info">
                    <div>
                      <strong> {visita.nombres} {visita.apellidos}</strong>
                    </div>
                    <div>
                       {visita.tipo_documento}: {visita.documento}
                    </div>
                    <div>
                       Placa: {visita.placa || 'N/A'}
                    </div>
                    <div>
                       Muelle: {visita.muelle || 'No asignado'}
                    </div>
                  </div>
                  
                  <div className="visita-tiempo">
                    <div className="tiempo-ingreso">
                       Ingreso: {new Date(visita.fecha_ingreso).toLocaleTimeString()}
                    </div>
                    <div className="tiempo-transcurrido">
                      🕐 {visita.tiempo_transcurrido} min
                    </div>
                  </div>
                </div>
                
                <div className="visita-actions">
                  <button
                    onClick={() => liberarVisita(visita.id)}
                    className="btn-liberar"
                    title="Registrar salida"
                  >
                    🏃‍♂️ Liberar
                  </button>
                  <button
                    onClick={() => window.open(`/detalle/${visita.id}`, '_blank')}
                    className="btn-detalle"
                  >
                     Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultaTab;