import React from 'react';
import styles from './Reportes.module.css';

const Reportes = () => {
  return (
    <div className={styles.reportes}>
      <div className={styles.header}>
        <h1>Reportes y Análisis</h1>
        <p>Visualiza reportes y métricas del sistema</p>
      </div>
      
      <div className={styles.content}>
        <div className={styles.placeholder}>
          <h3>Módulo de Reportes</h3>
          <p>Esta funcionalidad estará disponible próximamente</p>
          <div className={styles.construction}>📊 En Desarrollo</div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;