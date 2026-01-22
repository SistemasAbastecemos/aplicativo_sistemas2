import { apiService } from '../../../../../../../../services/api';

export const useApiService = () => {
  // Adaptador para usar tu apiService existente
  
  const buscarVisitante = async (documento, sedeId) => {
    try {
      return await apiService.buscarVisitantePorDocumento(documento, sedeId);
    } catch (error) {
      // Si no existe, retornar objeto de visitante nuevo
      if (error.message.includes('404') || error.message.includes('no existe')) {
        return {
          documento,
          es_nuevo: true,
          nombres: '',
          apellidos: '',
          es_proveedor: false,
          es_blacklist: false,
          incidentes: [],
          visitas_recientes: []
        };
      }
      throw error;
    }
  };

  const getFichasDisponibles = async (sedeId) => {
    return await apiService.getFichasDisponibles(sedeId);
  };

  const registrarVisita = async (data) => {
    return await apiService.registrarVisita(data);
  };

  const getVisitantesEnSitio = async (sedeId, filtros = {}) => {
    return await apiService.getVisitantesEnSitio(sedeId, filtros);
  };

  const liberarVisita = async (visitaId, datosSalida = {}) => {
    return await apiService.liberarVisita(visitaId, datosSalida);
  };

  const getHistorialVisitas = async (sedeId, filtros = {}) => {
    return await apiService.getHistorialVisitas(sedeId, filtros);
  };

  const sincronizarVisitasOffline = async (datosOffline) => {
    return await apiService.sincronizarVisitasOffline(datosOffline);
  };

  const getEstadisticasVisitas = async (sedeId, periodo = 'hoy') => {
    return await apiService.getEstadisticasVisitas(sedeId, periodo);
  };

  const reportarIncidente = async (data) => {
    return await apiService.reportarIncidente(data);
  };

  const getIncidentesVisitante = async (documento) => {
    return await apiService.getIncidentesVisitante(documento);
  };

  const getConfiguracionVisitantes = async (sedeId) => {
    return await apiService.getConfiguracionVisitantes(sedeId);
  };

  return {
    buscarVisitante,
    getFichasDisponibles,
    registrarVisita,
    getVisitantesEnSitio,
    liberarVisita,
    getHistorialVisitas,
    sincronizarVisitasOffline,
    getEstadisticasVisitas,
    reportarIncidente,
    getIncidentesVisitante,
    getConfiguracionVisitantes,
  };
};