import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Solicitudes.module.css';

const Solicitudes = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.solicitudes}>
      <div className={styles.header}>
        <h1>Gestión de Solicitudes</h1>
        <p>Administra y revisa las solicitudes del sistema</p>
      </div>
      
      <div className={styles.actions}>
        <button 
          className={styles.primaryButton}
          onClick={() => navigate('/solicitudes/nueva')}
        >
          + Nueva Solicitud
        </button>
        <button className={styles.secondaryButton}>
          📋 Ver Todas las Solicitudes
        </button>
      </div>
      
      <div className={styles.content}>
        <div className={styles.placeholder}>
          <h3>Módulo de Solicitudes</h3>
          <p>Esta funcionalidad estará disponible próximamente</p>
          <div className={styles.construction}>🚧 En Desarrollo</div>
        </div>
      </div>
    </div>
  );
};

export default Solicitudes;