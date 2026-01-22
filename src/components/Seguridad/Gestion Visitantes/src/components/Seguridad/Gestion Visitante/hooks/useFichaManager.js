import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';

export const useFichaManager = (sedeId) => {
  const [fichas, setFichas] = useState([]);
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { agregarPendiente, conexion } = useStore();

  const fetchFichas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Si está offline, buscar en cache
      if (!conexion.online) {
        const cached = localStorage.getItem(`fichas_sede_${sedeId}`);
        if (cached) {
          setFichas(JSON.parse(cached));
          setLoading(false);
          return;
        }
        throw new Error('Sin conexión y sin caché disponible');
      }

      // Fetch desde API
      const response = await fetch(`/api/fichas.php?sede_id=${sedeId}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Guardar en cache
      localStorage.setItem(`fichas_sede_${sedeId}`, JSON.stringify(data));
      setFichas(data);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching fichas:', err);
    } finally {
      setLoading(false);
    }
  }, [sedeId, conexion.online]);

  const seleccionarFicha = useCallback((fichaId) => {
    const ficha = fichas.find(f => f.id === fichaId);
    
    if (ficha && ficha.estado === 'DISPONIBLE') {
      setFichaSeleccionada(ficha);
      
      // Actualizar estado visualmente
      setFichas(prev => prev.map(f => 
        f.id === fichaId 
          ? { ...f, estado: 'RESERVADA' }
          : f
      ));
      
      return true;
    }
    return false;
  }, [fichas]);

  const liberarFicha = useCallback((fichaId) => {
    setFichas(prev => prev.map(f => 
      f.id === fichaId 
        ? { ...f, estado: 'DISPONIBLE' }
        : f
    ));
    
    if (fichaSeleccionada?.id === fichaId) {
      setFichaSeleccionada(null);
    }
  }, [fichaSeleccionada]);

  const ocuparFicha = useCallback((fichaId, visitaId) => {
    setFichas(prev => prev.map(f => 
      f.id === fichaId 
        ? { ...f, estado: 'OCUPADA', visita_id: visitaId }
        : f
    ));
  }, []);

  // Sincronizar cambios cuando se recupera conexión
  useEffect(() => {
    if (conexion.online) {
      // Verificar si hay fichas pendientes de sincronizar
      const fichasPendientes = JSON.parse(
        localStorage.getItem(`fichas_pendientes_${sedeId}`) || '[]'
      );
      
      if (fichasPendientes.length > 0) {
        fichasPendientes.forEach(ficha => {
          agregarPendiente({
            type: 'UPDATE_FICHA',
            data: ficha,
            timestamp: new Date().toISOString()
          });
        });
        localStorage.removeItem(`fichas_pendientes_${sedeId}`);
      }
    }
  }, [conexion.online, sedeId, agregarPendiente]);

  // Cargar fichas al montar
  useEffect(() => {
    fetchFichas();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchFichas, 30000);
    return () => clearInterval(interval);
  }, [fetchFichas]);

  return {
    fichas,
    fichaSeleccionada,
    loading,
    error,
    seleccionarFicha,
    liberarFicha,
    ocuparFicha,
    refreshFichas: fetchFichas
  };
};