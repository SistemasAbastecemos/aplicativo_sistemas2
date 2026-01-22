import React, { useEffect, useState } from "react";
import { useStore } from "./store/visitanteStore"; 
import { useNotification } from "../../../contexts/NotificationContext";
import { useAuth } from "../../../contexts/AuthContext";
import LoadingScreen from "../../UI/LoadingScreen";
import debounce from "lodash/debounce";

// Importar subcomponentes del mismo módulo
import { Header } from "./components/Header";
import { Tabs } from "./components/Tabs";
import { SearchSection } from "./components/SearchSection";
import { RegistroForm } from "./components/RegistroForm";
import { VisitasTab } from "./components/VisitasTab";
import { ConsultaTab } from "./components/ConsultaTab";
import { ScannerModal } from "./components/ScannerModal";
import { PhotoCapture } from "./components/PhotoCapture";

// Importar utils del módulo
import { parsearDatosEscaneados } from "./utils/parsearDatosEscaneados";

import styles from "./GestionVisitantes.module.css";

const GestionVisitantes = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("registro");
  const [proveedores, setProveedores] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [cedulaInput, setCedulaInput] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [documentos, setDocumentos] = useState({
    foto_cedula: null,
    foto_escarapela: null,
  });

  const { addNotification } = useNotification();
  const { user } = useAuth();

  // Hooks personalizados
  const {
    visitanteEncontrado,
    buscandoVisitante,
    buscarVisitantePorCedula,
    setVisitanteEncontrado,
  } = useVisitanteSearch();

  const {
    showScanner,
    openScanner,
    closeScanner,
    handleBarcodeScan,
  } = useScanner();

  const {
    formData,
    visitaData,
    setFormData,
    setVisitaData,
    handleFormChange,
    handleVisitaChange,
    resetForm,
  } = useVisitFormDraft();

  // ... resto del componente principal (mover lógica específica aquí)
  // Mantener efectos, handlers específicos, etc.

  return (
    <div className={`${styles.container} ${isMobile ? styles.mobileSafeArea : ''}`}>
      <ScannerModal
        isOpen={showScanner}
        onClose={closeScanner}
        onScan={handleBarcodeScan}
      />

      <PhotoCapture
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onPhotoTaken={handlePhotoTaken}
      />

      <Header isMobile={isMobile} />
      
      <Tabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobile={isMobile} 
      />

      <div className={`${styles.content} ${isMobile ? styles.mobileContent : ''}`}>
        {activeTab === "registro" && (
          <div className={`${styles.registroContainer} ${isMobile ? styles.mobileRegistroContainer : ''}`}>
            <SearchSection
              cedulaInput={cedulaInput}
              handleCedulaChange={handleCedulaChange}
              onOpenScanner={openScanner}
              onOpenPhotoModal={() => setShowPhotoModal(true)}
              buscandoVisitante={buscandoVisitante}
              visitanteEncontrado={visitanteEncontrado}
              isMobile={isMobile}
            />

            <RegistroForm
              formData={formData}
              visitaData={visitaData}
              handleFormChange={handleFormChange}
              handleVisitaChange={handleVisitaChange}
              handleProveedorSelect={handleProveedorSelect}
              handleProveedorVisitaSelect={handleProveedorVisitaSelect}
              proveedores={proveedores}
              sedes={sedes}
              visitanteEncontrado={visitanteEncontrado}
              onSave={guardarVisitante}
              onClear={limpiarFormulario}
              onRegisterVisit={registrarVisita}
              loading={loading}
              isMobile={isMobile}
              user={user}
              addNotification={addNotification}
            />
          </div>
        )}

        {activeTab === "visitas" && (
          <VisitasTab
            sedes={sedes}
            proveedores={proveedores}
            user={user}
            addNotification={addNotification}
            isMobile={isMobile}
          />
        )}

        {activeTab === "consulta" && (
          <ConsultaTab
            proveedores={proveedores}
            setActiveTab={setActiveTab}
            buscarVisitantePorCedula={buscarVisitantePorCedula}
            addNotification={addNotification}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
};

export default GestionVisitantes;