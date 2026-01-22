import { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';

export const useVisitanteSearch = () => {
  const [loading, setLoading] = useState(false);
  const [visitante, setVisitante] = useState(null);
  const [error, setError] = useState(null);
  const { sede, conexion } = useStore();

  const buscarVisitante = useCallback(async (documento) => {
    if (!documento || documento.length < 8) {
      setError('Documento inválido');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Si estamos offline, buscar en cache local
      if (!conexion.online) {
        const cached = localStorage.getItem(`visitante_${documento}`);
        if (cached) {
          const data = JSON.parse(cached);
          setVisitante(data);
          return { data, source: 'cache' };
        }
        throw new Error('Sin conexión y sin datos en caché');
      }

      // Buscar en API
      const response = await fetch(`/api/buscar_visitante.php?documento=${documento}&sede_id=${sede.id}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Guardar en cache local
        localStorage.setItem(`visitante_${documento}`, JSON.stringify(data));
        
        setVisitante(data);
        return { data, source: 'api' };
      } else {
        throw new Error('Visitante no encontrado');
      }
    } catch (err) {
      setError(err.message);
      
      // Intentar con una búsqueda aproximada en cache
      if (err.message.includes('Sin conexión')) {
        const allKeys = Object.keys(localStorage);
        const visitanteKeys = allKeys.filter(key => key.startsWith('visitante_'));
        
        for (const key of visitanteKeys) {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.documento.includes(documento)) {
            setVisitante(data);
            return { data, source: 'cache_aproximado' };
          }
        }
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [sede, conexion.online]);

  const limpiarBusqueda = useCallback(() => {
    setVisitante(null);
    setError(null);
  }, []);

  return {
    visitante,
    loading,
    error,
    buscarVisitante,
    limpiarBusqueda
  };
};