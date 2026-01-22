import React from 'react';

const IncidentesPanel = ({ incidentes, bloqueado = false }) => {
  if (!incidentes || incidentes.length === 0) {
    return null;
  }

  const contarIncidentesPorTipo = () => {
    const conteo = {};
    incidentes.forEach(incidente => {
      const tipo = incidente.tipo || 'Otro';
      conteo[tipo] = (conteo[tipo] || 0) + 1;
    });
    return conteo;
  };

  const conteo = contarIncidentesPorTipo();

  return (
    <div className={`incidentes-panel ${bloqueado ? 'bloqueado' : 'advertencia'}`}>
      <div className="incidentes-header">
        <h4>⚠️ Historial de Incidentes</h4>
        {bloqueado && (
          <span className="badge-bloqueado">ACCESO BLOQUEADO</span>
        )}
      </div>

      <div className="incidentes-resumen">
        <div className="conteo-incidentes">
          {Object.entries(conteo).map(([tipo, cantidad]) => (
            <div key={tipo} className="conteo-item">
              <span className="conteo-tipo">{tipo}:</span>
              <span className="conteo-cantidad">{cantidad}</span>
            </div>
          ))}
        </div>
        <div className="total-incidentes">
          Total incidentes: <strong>{incidentes.length}</strong>
        </div>
      </div>

      <div className="incidentes-lista">
        <h5>Últimos incidentes:</h5>
        {incidentes.slice(0, 3).map((incidente, index) => (
          <div key={index} className="incidente-item">
            <div className="incidente-fecha">
              {new Date(incidente.fecha).toLocaleDateString()}
            </div>
            <div className="incidente-descripcion">
              {incidente.descripcion}
            </div>
            <div className="incidente-sede">
              Sede: {incidente.sede}
            </div>
          </div>
        ))}
      </div>

      {bloqueado && (
        <div className="acciones-bloqueado">
          <p className="instruccion">
            Contacte a su supervisor para autorizar el ingreso
          </p>
          <button className="btn-contactar-supervisor">
            📞 Llamar Supervisor
          </button>
        </div>
      )}
    </div>
  );
};

export default IncidentesPanel;