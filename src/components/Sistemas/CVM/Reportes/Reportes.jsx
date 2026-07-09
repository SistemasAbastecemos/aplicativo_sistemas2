import React, { useState, useCallback, useMemo, useEffect } from "react";
import styles from "./Reportes.module.css";
import LoadingScreen from "../../../UI/LoadingScreen";
import { useNotification } from "../../../../contexts/NotificationContext";
import { usePermisos } from "../../../../hooks/usePermission";
import { useNavigate } from "react-router-dom";

// Hooks
import { useReportesData } from "./hooks/useReportesData";
import { useAccionForm } from "./hooks/useAccionForm";

// Components
import ReportesHeader from "./components/ReportesHeader";
import ReportesToolbar from "./components/ReportesToolbar";
import ReportesActionPanel from "./components/ReportesActionPanel";
import ReportesStats from "./components/ReportesStats";
import ReportesGrid from "./components/ReportesGrid";
import ImagesModal from "./components/ImagesModal";
import ExpandedImageModal from "./components/ExpandedImageModal";

function CvmReportes({ onModalToggle }) {
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  // Consumo de directivas de seguridad basadas en el rol activo
  const { puedeVer, puedeEditar, loading: permisosLoading } = usePermisos();
  const data = useReportesData(addNotification);

  const accionForm = useAccionForm({
    estado: data.estado,
    addNotification,
    onEnviado: data.fetchRegistros,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);

  // Expulsion en caliente reactiva si se revocan permisos
  useEffect(() => {
    if (!permisosLoading && !puedeVer) {
      addNotification({
        message: "Acceso denegado al módulo de Reportes CVM.",
        type: "error",
      });
      navigate("/");
    }
  }, [puedeVer, permisosLoading, navigate, addNotification]);

  const openImagesModal = useCallback(
    (registro) => {
      accionForm.setSelectedRegistro(registro);
      setIsModalOpen(true);
      if (onModalToggle) onModalToggle(true);
    },
    [accionForm, onModalToggle],
  );

  const closeImagesModal = useCallback(() => {
    setIsModalOpen(false);
    if (onModalToggle) onModalToggle(false);
  }, [onModalToggle]);

  const handleImageClick = useCallback((url) => {
    setExpandedImage(url);
  }, []);

  const conIncumplimientos = useMemo(() => {
    return data.registros.filter((r) => r.estado_final === "No cumple").length;
  }, [data.registros]);

  if (permisosLoading) {
    return <LoadingScreen message="Validando credenciales metrológicas..." />;
  }

  return (
    <div className={styles.container}>
      <ReportesHeader />

      <ReportesToolbar
        estado={data.estado}
        onEstadoChange={data.handleEstadoChange}
        sede={data.sede}
        onSedeChange={data.handleSedeChange}
        searchInput={data.searchInput}
        onSearchChange={data.handleSearchInputChange}
        onRefresh={data.fetchRegistros}
        cargando={data.cargando}
      />

      {/* RENDER CONDICIONAL: El panel de solución solo se pinta si cuenta con permisos de edición */}
      {puedeEditar && (
        <ReportesActionPanel
          selectedRegistro={accionForm.selectedRegistro}
          estadoFinal={accionForm.estadoFinal}
          onEstadoFinalChange={(e) => accionForm.setEstadoFinal(e.target.value)}
          accionTomada={accionForm.accionTomada}
          onAccionChange={accionForm.handleAccionChange}
          onEnviar={accionForm.handleEnviar}
          isEnviarDisabled={accionForm.isEnviarDisabled}
        />
      )}

      <ReportesStats
        total={data.filteredRegistros.length}
        totalPaginas={data.paginationData.totalPages}
        conIncumplimientos={conIncumplimientos}
      />

      <main className={styles.content}>
        <ReportesGrid
          registros={data.paginationData.currentItems}
          hayBusqueda={data.hayBusqueda}
          searchTrimmed={data.searchTrimmed}
          selectedId={accionForm.selectedRegistro?.id_registro}
          onSelect={puedeEditar ? accionForm.setSelectedRegistro : () => {}} // Bloquea la selección de filas si no puede editar
          onViewImages={openImagesModal}
          currentPage={data.currentPage}
          totalPages={data.paginationData.totalPages}
          onPageChange={data.setCurrentPage}
          onResetFilters={data.resetFilters}
          puedeEditar={puedeEditar} // Prop opcional por si se desea ocultar el foco o borde de selección en la grilla
        />
      </main>

      {isModalOpen && accionForm.selectedRegistro && (
        <ImagesModal
          registro={accionForm.selectedRegistro}
          onClose={closeImagesModal}
          onImageClick={handleImageClick}
        />
      )}

      {expandedImage && (
        <ExpandedImageModal
          imageUrl={expandedImage}
          onClose={() => setExpandedImage(null)}
        />
      )}
    </div>
  );
}

export default CvmReportes;
