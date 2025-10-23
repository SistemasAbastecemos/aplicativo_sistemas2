import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Perfil.module.css';

const Perfil = () => {
  const { user } = useAuth();

  return (
    <div className={styles.perfil}>
      <div className={styles.header}>
        <h1>Mi Perfil</h1>
        <p>Gestiona tu información personal</p>
      </div>
      
      <div className={styles.content}>
        <div className={styles.card}>
          <h2>Información Personal</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Usuario:</label>
              <span>{user?.login}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Nombres Completos:</label>
              <span>{user?.nombres_completos}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Correo Electrónico:</label>
              <span>{user?.correo}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Rol:</label>
              <span>{user?.rol_nombre}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Área:</label>
              <span>{user?.area_nombre}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Cargo:</label>
              <span>{user?.cargo_nombre}</span>
            </div>
          </div>
          
          <div className={styles.actions}>
            <button className={styles.primaryButton}>
              Editar Información
            </button>
            <button className={styles.secondaryButton}>
              Cambiar Contraseña
            </button>
          </div>
        </div>
        
        <div className={styles.placeholder}>
          <h3>Más opciones próximamente...</h3>
          <p>Estamos trabajando en más funcionalidades para tu perfil</p>
        </div>
      </div>
    </div>
  );
};

export default Perfil;