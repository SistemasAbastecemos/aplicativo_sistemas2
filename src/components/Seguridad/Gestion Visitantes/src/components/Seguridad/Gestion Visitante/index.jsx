import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../../../../contexts/AuthContext';
import Tabs from './components/ui/Tabs';
import RegistroTab from './components/tabs/RegistroTab';
import ConsultaTab from './components/tabs/ConsultaTab';
import HistorialTab from './components/tabs/HistorialTab';
import Header from './components/ui/Header';
import StatusBadge from './components/ui/StatusBadge';
import { TABS } from './constants';
import './styles.css';

// Importar SOLO los iconos que realmente necesitas
import { 
  FiUser, FiClock, FiSmartphone, FiPrinter, 
  FiPhone, FiRefreshCw, FiHelpCircle, FiAlertCircle,
  FiEdit, FiSearch, FiList, FiSave, FiUpload, FiWifi,
  FiWifiOff, FiLock, FiCheckCircle, FiAlertTriangle,
  FiCamera, FiTag, FiBell, FiMapPin, FiLogOut
} from 'react-icons/fi';

import { 
  MdPerson, MdBusiness, MdAccessTime, MdPrint,
  MdSync, MdSyncProblem, MdSignalWifi4Bar,
  MdSignalWifiOff, MdSecurity, MdHistory
} from 'react-icons/md';

const GestionVisitante = () => {
  const [activeTab, setActiveTab] = useState(TABS.REGISTRO);
  const { user, loading: authLoading } = useAuth();
  const [sede, setSede] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncPending, setSyncPending] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Obtener sede del usuario
  useEffect(() => {
    if (user) {
      setSede({
        id: user.sede_id || 1,
        nombre: user.sede_nombre || user.sede || 'SUPERMERCADO CENTRAL',
        vigilante: user.nombre || user.usuario || 'Vigilante',
        codigo: user.sede_codigo || '001'
      });
    }
  }, [user]);

  // Manejar estado de conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      vibrate(50);
      addNotification('success', 'Conexión restablecida', 'Se ha recuperado la conexión a internet');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      vibrate(200);
      addNotification('warning', 'Modo offline', 'Los datos se guardarán localmente');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Verificar sincronización pendiente
  useEffect(() => {
    const checkPendingSync = () => {
      try {
        const pending = localStorage.getItem('gv_pendientes');
        if (pending) {
          const data = JSON.parse(pending);
          setSyncPending(data.length || 0);
        }
        
        const lastSyncTime = localStorage.getItem('gv_last_sync');
        if (lastSyncTime) {
          setLastSync(new Date(lastSyncTime));
        }
      } catch (error) {
        console.error('Error verificando sincronización:', error);
      }
    };

    checkPendingSync();
    const interval = setInterval(checkPendingSync, 30000);

    return () => clearInterval(interval);
  }, []);

  // Vibrar para feedback táctil
  const vibrate = (duration) => {
    if ('vibrate' in navigator && isMobile) {
      navigator.vibrate(duration);
    }
  };

  // Notificaciones
  const addNotification = (type, title, message) => {
    console.log(`[${type}] ${title}: ${message}`);
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  };

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    vibrate(30);
  }, []);

  const handleManualSync = useCallback(async () => {
    if (!isOnline) {
      addNotification('error', 'Sin conexión', 'No se puede sincronizar sin internet');
      return;
    }

    try {
      addNotification('info', 'Sincronizando...', 'Enviando datos pendientes al servidor');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      localStorage.removeItem('gv_pendientes');
      localStorage.setItem('gv_last_sync', new Date().toISOString());
      
      setSyncPending(0);
      setLastSync(new Date());
      vibrate(100);
      
      addNotification('success', 'Sincronización exitosa', 'Todos los datos han sido enviados');
      
    } catch (error) {
      addNotification('error', 'Error de sincronización', error.message);
    }
  }, [isOnline]);

  const handleEmergencyContact = () => {
    vibrate(100);
    if (isMobile && 'contacts' in navigator) {
      window.location.href = 'tel:+573001234567';
    } else {
      window.open('tel:+573001234567', '_blank');
    }
  };

  const handleQuickPrint = () => {
    vibrate(50);
    const printContent = `
      <html>
        <head><title>Reporte Visitantes</title></head>
        <body>
          <h1>Reporte de Visitantes - ${sede?.nombre}</h1>
          <p>Fecha: ${new Date().toLocaleDateString('es-CO')}</p>
          <p>Operador: ${user?.nombre || user?.usuario}</p>
          <hr>
          <p>Este es un reporte generado desde el sistema de gestión de visitantes.</p>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const renderTab = () => {
    if (authLoading) {
      return (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Cargando módulo de gestión...</p>
          <small>Por favor espere</small>
        </div>
      );
    }

    if (!sede) {
      return (
        <div className="error-state">
          <div className="error-icon">
            <FiAlertTriangle size={48} />
          </div>
          <h3>Sede no configurada</h3>
          <p>No se encontró información de sede para este usuario.</p>
          <button 
            className="btn-secondary"
            onClick={() => window.location.reload()}
          >
            <FiRefreshCw /> Reintentar
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case TABS.REGISTRO:
        return <RegistroTab 
          sedeId={sede.id} 
          sedeCodigo={sede.codigo}
          onSync={handleManualSync}
          isOnline={isOnline}
          addNotification={addNotification}
        />;
      case TABS.CONSULTA:
        return <ConsultaTab 
          sedeId={sede.id}
          isOnline={isOnline}
          addNotification={addNotification}
        />;
      case TABS.HISTORIAL:
        return <HistorialTab 
          sedeId={sede.id}
          isOnline={isOnline}
          addNotification={addNotification}
        />;
      default:
        return <RegistroTab 
          sedeId={sede.id}
          sedeCodigo={sede.codigo}
          onSync={handleManualSync}
          isOnline={isOnline}
          addNotification={addNotification}
        />;
    }
  };

  const tabs = [
    { 
      id: TABS.REGISTRO, 
      label: 'Registro', 
      icon: <FiEdit />,
      description: 'Registro rápido de visitantes',
      badge: syncPending > 0 ? syncPending : null
    },
    { 
      id: TABS.CONSULTA, 
      label: 'Consulta', 
      icon: <FiSearch />,
      description: 'Buscar y gestionar visitas activas'
    },
    { 
      id: TABS.HISTORIAL, 
      label: 'Historial', 
      icon: <FiList />,
      description: 'Historial completo de visitas'
    }
  ];

  // Si está cargando la autenticación
  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="loading-content">
          <div className="spinner large"></div>
          <h2>Gestión de Visitantes</h2>
          <p>Verificando credenciales de acceso...</p>
          <div className="loading-progress">
            <div className="progress-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado
  if (!user) {
    return (
      <div className="auth-required-screen">
        <div className="auth-content">
          <div className="auth-icon">
            <FiLock size={64} />
          </div>
          <h2>Acceso restringido</h2>
          <p>Para acceder al módulo de gestión de visitantes, debe iniciar sesión.</p>
          <div className="auth-actions">
            <button 
              className="btn-primary"
              onClick={() => window.location.href = '/login'}
            >
              Iniciar sesión
            </button>
            <button 
              className="btn-secondary"
              onClick={() => window.history.back()}
            >
              Volver atrás
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`gestion-visitante-container ${isMobile ? 'mobile-view' : ''}`}>
      {/* Modal de ayuda */}
      {showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal" onClick={e => e.stopPropagation()}>
            <div className="help-header">
              <h3><FiHelpCircle /> Ayuda Rápida</h3>
              <button className="close-help" onClick={() => setShowHelp(false)}>
                <FiAlertCircle />
              </button>
            </div>
            <div className="help-content">
              <h4>Instrucciones para vigilantes:</h4>
              <ul className="help-list">
                <li>
                  <strong><FiEdit /> Registro:</strong> 
                  Escanee la cédula o ingrese manualmente el documento
                </li>
                <li>
                  <strong><FiCamera /> Foto:</strong> 
                  Para proveedores es obligatoria la foto
                </li>
                <li>
                  <strong><FiTag /> Ficha:</strong> 
                  Asigne una ficha disponible al visitante
                </li>
                <li>
                  <strong><FiWifiOff /> Offline:</strong> 
                  Los datos se guardan automáticamente si falla la red
                </li>
                <li>
                  <strong><FiBell /> Notificaciones:</strong> 
                  Active las notificaciones del navegador
                </li>
              </ul>
              <div className="emergency-contact">
                <h4><FiPhone /> Contacto de emergencia:</h4>
                <p><strong>Supervisor:</strong> Ext. 1234</p>
                <p><strong>Sistemas:</strong> Ext. 5678</p>
                <button 
                  className="btn-emergency"
                  onClick={handleEmergencyContact}
                >
                  <FiAlertCircle /> Llamar emergencia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Header 
        sede={sede?.nombre}
        usuario={user.nombre || user.usuario}
        onSyncClick={handleManualSync}
        syncPending={syncPending}
      />
      
      <div className="status-bar">
        <StatusBadge 
          online={isOnline}
          pendientes={syncPending}
          lastSync={lastSync}
          onSyncClick={handleManualSync}
        />
        
        <div className="connection-actions">
          {syncPending > 0 && (
            <button 
              className={`btn-sync-now ${!isOnline ? 'disabled' : ''}`}
              onClick={handleManualSync}
              disabled={!isOnline}
              title={isOnline ? 'Sincronizar datos pendientes' : 'Espere conexión a internet'}
            >
              <MdSync /> Sincronizar ({syncPending})
            </button>
          )}
          
          <button 
            className="btn-help"
            onClick={() => setShowHelp(true)}
            title="Mostrar ayuda"
          >
            <FiHelpCircle />
          </button>
        </div>
      </div>

      <Tabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isMobile={isMobile}
      />

      <div className="tab-content">
        {renderTab()}
      </div>

      {/* Footer informativo */}
      <div className="module-footer">
        <div className="footer-info">
          <span className="footer-item">
            <span className="footer-icon"><FiUser /></span>
            <span className="footer-text">{user.role || 'Vigilante'}</span>
          </span>
          <span className="footer-item">
            <span className="footer-icon"><FiMapPin /></span>
            <span className="footer-text">{sede?.codigo || '001'}</span>
          </span>
          <span className="footer-item">
            <span className="footer-icon"><FiClock /></span>
            <span className="footer-text">
              {new Date().toLocaleTimeString('es-CO', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </span>
          </span>
          <span className="footer-item">
            <span className="footer-icon"><FiSmartphone /></span>
            <span className="footer-text">{isMobile ? 'Móvil' : 'Escritorio'}</span>
          </span>
        </div>
        
        <div className="footer-actions">
          <button 
            className="btn-footer-action"
            onClick={handleQuickPrint}
            title="Imprimir reporte"
          >
            <FiPrinter />
          </button>
          <button 
            className="btn-footer-action"
            onClick={handleEmergencyContact}
            title="Contacto de emergencia"
          >
            <FiPhone />
          </button>
          <button 
            className="btn-footer-action"
            onClick={() => window.location.reload()}
            title="Recargar aplicación"
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>
      
      {/* Indicador de modo offline */}
      {!isOnline && (
        <div className="offline-indicator">
          <div className="offline-content">
            <span className="offline-icon">
              {isOnline ? <FiWifi /> : <FiWifiOff />}
            </span>
            <span className="offline-text">MODO OFFLINE - Los datos se guardan localmente</span>
            <span className="offline-pending">{syncPending} pendientes</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionVisitante;