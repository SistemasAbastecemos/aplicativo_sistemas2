import React from 'react';
import RegistroForm from '../registro/RegistroForm';
import './RegistroTab.css';

const RegistroTab = ({ sedeId }) => {
  const handleRegistroExitoso = (resultado) => {
    console.log('Visita registrada:', resultado);
    // Aquí podrías emitir un sonido o notificación
  };

  return (
    <div className="registro-tab">
      <div className="tab-header">
        <h2>Registro de Visitante</h2>
        <p className="tab-description">
          Complete los datos del visitante y asigne una ficha disponible
        </p>
      </div>

      <RegistroForm 
        sedeId={sedeId}
        onRegistroExitoso={handleRegistroExitoso}
      />

      <div className="tab-footer">
        <div className="quick-actions">
          <button className="btn-quick" onClick={() => window.print()}>
             Imprimir Ficha
          </button>
          <button className="btn-quick" onClick={() => {
            // Limpiar formulario
            window.location.reload();
          }}>
            Nuevo Formulario
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistroTab;