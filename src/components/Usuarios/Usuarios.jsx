import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Usuarios.module.css';

const Usuarios = () => {
  const { user } = useAuth();

  return (
    <div className={styles.usuarios}>
      <div className={styles.header}>
        <h1>Gestión de Usuarios</h1>
        <p>Administra los usuarios del sistema</p>
      </div>
      
      <div className={styles.content}>
        <div className={styles.card}>
          <h2>Lista de Usuarios</h2>
          <p>Aquí irá la tabla de usuarios...</p>
          <div className={styles.placeholder}>
            🚧 Módulo en construcción - Próximamente
          </div>
        </div>
        
        <div className={styles.infoCard}>
          <h3>Información del Usuario Actual</h3>
          <p><strong>Usuario:</strong> {user?.login}</p>
          <p><strong>Rol:</strong> {user?.rol_nombre}</p>
        </div>
      </div>
    </div>
  );
};

export default Usuarios;