import React, { useState, useEffect, useCallback } from 'react';
import { useVisitanteSearch } from '../../hooks/useVisitanteSearch';
import { useVisitFormDraft } from '../../hooks/useVisitFormDraft';
import { useFichaManager } from '../../hooks/useFichaManager';
import { FiSearch, FiUserPlus } from 'react-icons/fi'; // Iconos profesionales
import PhotoCapture from './PhotoCapture';
import FichasGrid from './FichasGrid';
import SearchSection from './SearchSection';
import IncidentesPanel from '../shared/IncidentesPanel';
import './RegistroForm.css';

const RegistroForm = ({ sedeId, onRegistroExitoso }) => {
  const [formData, setFormData] = useState({
    tipoDocumento: 'CC',
    documento: '',
    nombres: '',
    apellidos: '',
    arl: '',
    placa: '',
    fichaId: null,
    fichaNumero: null,
    foto: null,
    motivoVisita: '',
    esProveedor: false
  });

  const { draft, persistirDraft, limpiarDraft } = useVisitFormDraft(sedeId);
  const { 
    visitante, 
    loading: searchLoading, 
    buscarVisitante,
    limpiarBusqueda 
  } = useVisitanteSearch();

  const {
    fichas,
    loading: fichasLoading,
    seleccionarFicha,
    fichaSeleccionada
  } = useFichaManager(sedeId);

  useEffect(() => {
    if (draft) setFormData(draft);
  }, [draft]);

  useEffect(() => {
    persistirDraft(formData);
  }, [formData, persistirDraft]);

  // FUNCIÓN DE BÚSQUEDA LIGADA AL ICONO O ACCIÓN EXPLÍCITA
  const ejecutarBusqueda = useCallback(async (documentoManual) => {
    const doc = documentoManual || formData.documento;
    if (!doc || doc.length < 4) {
      alert("Ingrese un número de documento válido");
      return;
    }

    const resultado = await buscarVisitante(doc);
    
    if (resultado?.success && resultado.data) {
      const d = resultado.data;
      setFormData(prev => ({
        ...prev,
        documento: doc,
        nombres: d.nombres || '',
        apellidos: d.apellidos || '',
        arl: d.arl || '',
        placa: d.placa || '',
        esProveedor: d.es_proveedor || false
      }));
    } else {
      // Si no existe, preparamos para nuevo registro manteniendo el documento
      setFormData(prev => ({
        ...prev,
        documento: doc,
        nombres: '',
        apellidos: '',
        arl: '',
        placa: '',
        esProveedor: false
      }));
      alert("Visitante no encontrado. Ingrese los datos manualmente.");
    }
  }, [buscarVisitante, formData.documento]);

  const handleDocumentoChange = (e) => {
    const valor = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, documento: valor }));
  };

  const esValido = () => {
    const { documento, nombres, apellidos, fichaId } = formData;
    return documento.length >= 5 && nombres.length > 1 && apellidos.length > 1 && !!fichaId;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!esValido()) return alert('Faltan campos obligatorios');

    try {
      const response = await fetch('/api/registrar_visita.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify({ ...formData, sedeId })
      });

      const res = await response.json();
      if (res.success) {
        limpiarDraft();
        alert('Visita registrada con éxito');
        window.location.reload();
      }
    } catch (error) {
      alert('Error al conectar con el servidor');
    }
  };

  return (
    <form className="registro-form" onSubmit={handleSubmit}>
      
      {/* 1. BUSCADOR SUPERIOR (Acción rápida) */}
      <div className="quick-search-wrapper">
        <SearchSection
          formData={formData}
          onDocumentoChange={handleDocumentoChange}
          onScannerData={(data) => {
            setFormData(prev => ({ ...prev, documento: data.documento }));
            ejecutarBusqueda(data.documento);
          }}
          // Pasamos la función de búsqueda para que SearchSection use el icono de lupa
          onExecuteSearch={() => ejecutarBusqueda()} 
        />
      </div>

      {visitante?.es_blacklist && (
        <IncidentesPanel incidentes={visitante.incidentes || []} bloqueado={true} />
      )}

      <div className={`form-main-content ${searchLoading ? 'is-searching' : ''}`}>
        
        <div className="form-section">
          <div className="section-header">
            <FiUserPlus />
            <h3>Información del Visitante</h3>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Número de Cédula *</label>
              <div className="input-search-group">
                <input
                  type="text"
                  value={formData.documento}
                  onChange={handleDocumentoChange}
                  placeholder="Cédula"
                  required
                />
                <button 
                  type="button" 
                  className="inline-search-btn"
                  onClick={() => ejecutarBusqueda()}
                  title="Buscar en base de datos"
                >
                  <FiSearch />
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label>Nombres *</label>
              <input
                type="text"
                value={formData.nombres}
                onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Apellidos *</label>
              <input
                type="text"
                value={formData.apellidos}
                onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>ARL (Opcional)</label>
              <input
                type="text"
                value={formData.arl}
                onChange={(e) => setFormData({...formData, arl: e.target.value})}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Placa Vehículo (Opcional)</label>
              <input
                type="text"
                value={formData.placa}
                onChange={(e) => setFormData({...formData, placa: e.target.value.toUpperCase()})}
                placeholder="Ej: ABC123"
              />
            </div>
            <div className="form-group">
              <label>Motivo Visita *</label>
              <select
                value={formData.motivoVisita}
                onChange={(e) => setFormData({...formData, motivoVisita: e.target.value})}
                required
              >
                <option value="">Seleccione...</option>
                <option value="ADMIN">Administrativa</option>
                <option value="OPERATIVA">Operativa / Carga</option>
                <option value="MANT">Mantenimiento</option>
              </select>
            </div>
          </div>
        </div>

        {formData.esProveedor && (
          <div className="form-section">
            <label>Foto Obligatoria (Proveedor) *</label>
            <PhotoCapture onCapture={(foto) => setFormData({...formData, foto})} />
          </div>
        )}

        <div className="form-section">
          <h3>Asignación de Ficha *</h3>
          <FichasGrid
            fichas={fichas}
            fichaSeleccionada={formData.fichaId}
            onSeleccionarFicha={(f) => setFormData({...formData, fichaId: f.id, fichaNumero: f.numero})}
            loading={fichasLoading}
          />
        </div>

        {/* BOTÓN Y ESTADO CENTRADO */}
        <div className="form-footer-actions">
          <button
            type="submit"
            className={`btn-submit-main ${esValido() ? 'btn-valid' : 'btn-disabled'}`}
            disabled={!esValido() || searchLoading}
          >
            {searchLoading ? 'Verificando...' : 'FINALIZAR REGISTRO'}
          </button>
          
          <div className="status-indicator">
            <span className={`dot ${navigator.onLine ? 'online' : 'offline'}`}></span>
            {navigator.onLine ? 'Sistema en línea' : 'Modo fuera de línea'}
          </div>
        </div>
      </div>
    </form>
  );
};

export default RegistroForm;