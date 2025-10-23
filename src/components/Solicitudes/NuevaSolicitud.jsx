import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Solicitudes.module.css';

const NuevaSolicitud = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: '',
    prioridad: 'media'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para enviar la solicitud
    alert('Solicitud creada exitosamente (simulación)');
    navigate('/solicitudes');
  };

  return (
    <div className={styles.nuevaSolicitud}>
      <div className={styles.header}>
        <h1>Nueva Solicitud</h1>
        <p>Completa el formulario para crear una nueva solicitud</p>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Título de la Solicitud</label>
          <input
            type="text"
            value={formData.titulo}
            onChange={(e) => setFormData({...formData, titulo: e.target.value})}
            placeholder="Ingresa el título de la solicitud"
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Descripción</label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            placeholder="Describe detalladamente tu solicitud..."
            rows="5"
            required
          />
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Tipo de Solicitud</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              required
            >
              <option value="">Selecciona un tipo</option>
              <option value="soporte">Soporte Técnico</option>
              <option value="requerimiento">Nuevo Requerimiento</option>
              <option value="incidente">Reportar Incidente</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label>Prioridad</label>
            <select
              value={formData.prioridad}
              onChange={(e) => setFormData({...formData, prioridad: e.target.value})}
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>
        
        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => navigate('/solicitudes')}
          >
            Cancelar
          </button>
          <button type="submit" className={styles.submitButton}>
            Crear Solicitud
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevaSolicitud;