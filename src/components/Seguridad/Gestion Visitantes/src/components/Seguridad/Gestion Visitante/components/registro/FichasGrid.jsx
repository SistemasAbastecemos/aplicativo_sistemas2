import React from 'react';
import { ESTADOS_FICHA, COLORES_FICHA } from '../../constants';

const FichasGrid = ({ fichas, fichaSeleccionada, onSeleccionarFicha, loading }) => {
  const handleClick = (ficha) => {
    if (ficha.estado === ESTADOS_FICHA.DISPONIBLE && onSeleccionarFicha) {
      onSeleccionarFicha(ficha);
    }
  };

  const getColor = (ficha) => {
    if (fichaSeleccionada?.id === ficha.id) {
      return COLORES_FICHA.SELECCIONADA;
    }
    return COLORES_FICHA[ficha.estado] || COLORES_FICHA.OCUPADA;
  };

  if (loading) {
    return (
      <div className="fichas-grid-loading">
        <div className="spinner"></div>
        <p>Cargando fichas disponibles...</p>
      </div>
    );
  }

  return (
    <div className="fichas-grid-container">
      <h3>Fichas Disponibles ({fichas.filter(f => f.estado === ESTADOS_FICHA.DISPONIBLE).length})</h3>
      
      <div className="fichas-grid">
        {fichas.map((ficha) => (
          <button
            key={ficha.id}
            className={`ficha-button ${ficha.estado === ESTADOS_FICHA.DISPONIBLE ? 'clickable' : 'disabled'}`}
            style={{
              backgroundColor: getColor(ficha),
              minWidth: '44px',
              minHeight: '44px',
              width: '44px',
              height: '44px'
            }}
            onClick={() => handleClick(ficha)}
            disabled={ficha.estado !== ESTADOS_FICHA.DISPONIBLE}
            title={`Ficha #${ficha.numero} - ${ficha.estado}`}
          >
            <span className="ficha-numero">{ficha.numero}</span>
            <span className="ficha-estado">
              {ficha.estado === ESTADOS_FICHA.OCUPADA ? '✗' : 
               ficha.estado === ESTADOS_FICHA.DISPONIBLE ? '✓' : '⊙'}
            </span>
          </button>
        ))}
      </div>

      <div className="fichas-leyenda">
        <div className="leyenda-item">
          <div className="leyenda-color" style={{ backgroundColor: COLORES_FICHA.DISPONIBLE }}></div>
          <span>Disponible</span>
        </div>
        <div className="leyenda-item">
          <div className="leyenda-color" style={{ backgroundColor: COLORES_FICHA.OCUPADA }}></div>
          <span>Ocupada</span>
        </div>
        <div className="leyenda-item">
          <div className="leyenda-color" style={{ backgroundColor: COLORES_FICHA.SELECCIONADA }}></div>
          <span>Seleccionada</span>
        </div>
      </div>
    </div>
  );
};

export default FichasGrid;