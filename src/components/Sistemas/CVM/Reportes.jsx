import React, { useState, useEffect, useMemo, useCallback } from "react";
import styles from "./Reportes.module.css";
import { apiService } from "../../../services/api";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";
import {
  faSearch,
  faFilter,
  faSyncAlt,
  faPaperPlane,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faCheckCircle,
  faTimesCircle,
  faEye,
  faUser,
  faClipboardCheck,
  faMicrochip,
  faStickyNote,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Importar imágenes
import imagenGramera from "../../../assets/images/gramera.png";
import imagenScannerBalanza from "../../../assets/images/scannerbalanza.png";
import imagenAdvertencia from "../../../assets/images/advertencia.png";

const SEDES_OPTIONS = [
  { value: "Todas", label: "Todas las sedes" },
  { value: "001", label: "B1" },
  { value: "002", label: "B2" },
  { value: "004", label: "B4" },
  { value: "005", label: "B5" },
  { value: "006", label: "B6" },
  { value: "007", label: "B7" },
  { value: "008", label: "B8" },
  { value: "010", label: "B10" },
  { value: "013", label: "B9" },
];

const ESTADOS_OPTIONS = [
  { value: "No cumple", label: "No Cumple", color: "#ef4444" },
  { value: "Cumple", label: "Cumple", color: "#10b981" },
  { value: "Resueltos", label: "Resueltos", color: "#3b82f6" },
];

function CvmReportes({ onModalToggle }) {
  const { addNotification } = useNotification();
  const [cargando, setCargando] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [estado, setEstado] = useState("No cumple");
  const [sede, setSede] = useState("Todas");
  const [searchInput, setSearchInput] = useState("");
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [accionTomada, setAccionTomada] = useState("");
  const [estadoFinal, setEstadoFinal] = useState("Bueno");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Memoized filtered registros
  const filteredRegistros = useMemo(() => {
    if (!searchInput) return registros;

    const searchLower = searchInput.toLowerCase();
    return registros.filter((registro) =>
      Object.values(registro).some(
        (value) => value && value.toString().toLowerCase().includes(searchLower)
      )
    );
  }, [registros, searchInput]);

  // Pagination calculations
  const paginationData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRegistros.slice(
      indexOfFirstItem,
      indexOfLastItem
    );
    const totalPages = Math.ceil(filteredRegistros.length / itemsPerPage);

    return {
      currentItems,
      totalPages,
      hasItems: filteredRegistros.length > 0,
    };
  }, [filteredRegistros, currentPage, itemsPerPage]);

  const fetchRegistros = useCallback(async () => {
    setCargando(true);
    try {
      const response = await apiService.getReportesCVM(estado, sede, "");
      if (Array.isArray(response.data?.registros)) {
        setRegistros(response.data.registros);
      } else {
        setRegistros([]);
      }
    } catch (error) {
      addNotification({
        message: "Error cargando registros: " + (error.message || error),
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  }, [estado, sede, addNotification]);

  useEffect(() => {
    fetchRegistros();
  }, [fetchRegistros]);

  const handleEstadoChange = (e) => {
    setEstado(e.target.value);
    setCurrentPage(1);
  };

  const handleSedeChange = (e) => {
    setSede(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
    setCurrentPage(1);
  };

  const isEnviarDisabled = useMemo(
    () =>
      estadoFinal !== "Bueno" ||
      accionTomada.trim() === "" ||
      estado !== "No cumple",
    [estadoFinal, accionTomada, estado]
  );

  const handleEnviar = async () => {
    if (isEnviarDisabled || !selectedRegistro) {
      addNotification({
        message:
          "Por favor, completa todos los campos requeridos antes de enviar.",
        type: "warning",
      });
      return;
    }

    try {
      const payload = {
        id_registro: selectedRegistro.id_registro,
        estado_final: estadoFinal,
        observaciones: accionTomada,
      };

      const response = await apiService.updateReporteCVM(payload);

      if (response.success) {
        addNotification({
          message: "Registro actualizado correctamente.",
          type: "success",
        });
        setSelectedRegistro(null);
        setAccionTomada("");
        setEstadoFinal("Bueno");
        await fetchRegistros();
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (error) {
      addNotification({
        message: "Error al actualizar el registro: " + (error.message || error),
        type: "error",
      });
    }
  };

  const getTipoBalanzaImagen = (tipoBalanza) => {
    switch (tipoBalanza) {
      case "GRAMERA":
        return imagenGramera;
      case "SCANNER BALANZA":
        return imagenScannerBalanza;
      default:
        return imagenAdvertencia;
    }
  };

  const getEstadoColor = (valor) => {
    return valor === "Malo" ? styles.estadoMalo : styles.estadoBueno;
  };

  const openModal = useCallback(
    (registro) => {
      setSelectedRegistro(registro);
      setIsModalOpen(true);
      onModalToggle?.(true);
    },
    [onModalToggle]
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedRegistro(null);
    onModalToggle?.(false);
  }, [onModalToggle]);

  const handleImageClick = useCallback((imageUrl) => {
    setExpandedImage(imageUrl);
  }, []);

  const resetFilters = useCallback(() => {
    setEstado("No cumple");
    setSede("Todas");
    setSearchInput("");
    setCurrentPage(1);
  }, []);

  if (cargando) {
    return <LoadingScreen message="Cargando reportes..." />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Reportes CVM</h1>
          <p className={styles.subtitle}>
            Gestión y seguimiento de verificaciones metrológicas
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filters}>
          {/* Estado con floating label */}
          <div className={`${styles.formGroup} ${styles.floating}`}>
            <select
              className={styles.formSelect}
              value={estado}
              onChange={handleEstadoChange}
            >
              {ESTADOS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faFilter} />
              Estado
            </label>
          </div>

          {/* Sede con floating label */}
          <div className={`${styles.formGroup} ${styles.floating}`}>
            <select
              className={styles.formSelect}
              value={sede}
              onChange={handleSedeChange}
            >
              {SEDES_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label className={styles.formLabel}>Sede</label>
          </div>

          {/* Búsqueda con floating label */}
          <div className={`${styles.formGroup} ${styles.floating}`}>
            <div className={styles.searchGroup}>
              <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.formInput}
                value={searchInput}
                onChange={handleSearchInputChange}
                placeholder=" "
              />
              <label className={styles.formLabel}>Buscar registros</label>
            </div>
          </div>

          <button
            className={styles.refreshButton}
            onClick={fetchRegistros}
            title="Actualizar datos"
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
        </div>

        <div className={styles.actionPanel}>
          {/* Estado Final con floating label */}
          <div className={`${styles.formGroup} ${styles.floating}`}>
            <select
              className={styles.formSelect}
              value={estadoFinal}
              onChange={(e) => setEstadoFinal(e.target.value)}
            >
              <option value="Bueno">Bueno</option>
            </select>
            <label className={styles.formLabel}>Estado Solución</label>
          </div>

          {/* Acción Tomada con floating label */}
          <div className={`${styles.formGroup} ${styles.floating}`}>
            <input
              type="text"
              className={styles.formInput}
              value={accionTomada}
              onChange={(e) => setAccionTomada(e.target.value)}
              placeholder=" "
            />
            <label className={styles.formLabel}>Acción Tomada</label>
          </div>

          <button
            className={`${styles.submitButton} ${
              isEnviarDisabled ? styles.disabled : ""
            }`}
            onClick={handleEnviar}
            disabled={isEnviarDisabled}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
            Enviar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{filteredRegistros.length}</span>
          <span className={styles.statLabel}>Registros totales</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{paginationData.totalPages}</span>
          <span className={styles.statLabel}>Páginas</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {filteredRegistros.filter((r) => r.conforme === "Malo").length}
          </span>
          <span className={styles.statLabel}>Con incumplimientos</span>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {!paginationData.hasItems ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>No hay registros disponibles</h3>
            <p>No se encontraron datos con los filtros actuales</p>
            <button className={styles.resetButton} onClick={resetFilters}>
              <FontAwesomeIcon icon={faSyncAlt} />
              Restablecer filtros
            </button>
          </div>
        ) : (
          <>
            <div className={styles.registrosGrid}>
              {paginationData.currentItems.map((registro) => (
                <RegistroCard
                  key={registro.id_registro}
                  registro={registro}
                  isSelected={
                    selectedRegistro?.id_registro === registro.id_registro
                  }
                  onSelect={setSelectedRegistro}
                  onViewImages={openModal}
                  getTipoBalanzaImagen={getTipoBalanzaImagen}
                  getEstadoColor={getEstadoColor}
                />
              ))}
            </div>

            {/* Pagination */}
            {paginationData.totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                  Anterior
                </button>

                <div className={styles.paginationInfo}>
                  Página <strong>{currentPage}</strong> de{" "}
                  {paginationData.totalPages}
                </div>

                <button
                  className={styles.paginationButton}
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(p + 1, paginationData.totalPages)
                    )
                  }
                  disabled={currentPage === paginationData.totalPages}
                >
                  Siguiente
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && selectedRegistro && (
        <ImagesModal
          registro={selectedRegistro}
          onClose={closeModal}
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

// Componente de Tarjeta de Registro
const RegistroCard = React.memo(
  ({
    registro,
    isSelected,
    onSelect,
    onViewImages,
    getTipoBalanzaImagen,
    getEstadoColor,
  }) => {
    const handleClick = useCallback(() => {
      onSelect(registro);
    }, [registro, onSelect]);

    const handleViewImages = useCallback(
      (e) => {
        e.stopPropagation();
        onViewImages(registro);
      },
      [registro, onViewImages]
    );

    // Función para renderizar el estado con ícono
    const renderEstadoConIcono = (valor) => {
      const esBueno = valor === "Bueno";
      return (
        <span
          className={`${styles.statusValue} ${
            esBueno ? styles.estadoBueno : styles.estadoMalo
          }`}
        >
          {valor}
          {esBueno ? (
            <FontAwesomeIcon icon={faCheckCircle} />
          ) : (
            <FontAwesomeIcon icon={faTimesCircle} />
          )}
        </span>
      );
    };

    return (
      <div
        className={`${styles.registroCard} ${
          isSelected ? styles.selected : ""
        }`}
        onClick={handleClick}
      >
        {/* Header con información principal */}
        <div className={styles.cardHeader}>
          <div className={styles.headerMain}>
            <div className={styles.deviceInfo}>
              <img
                src={getTipoBalanzaImagen(registro.tipo_balanza)}
                alt={registro.tipo_balanza}
                className={styles.deviceImage}
              />
              <div className={styles.deviceDetails}>
                <h3 className={styles.deviceType}>{registro.tipo_balanza}</h3>
                <div className={styles.metaInfo}>
                  <span className={styles.registroId}>
                    ID: #{registro.id_registro}
                  </span>
                  <span className={styles.separator}>•</span>
                  <span className={styles.sede}>Sede: {registro.id_sede}</span>
                  <span className={styles.separator}>•</span>
                  <span className={styles.caja}>Caja: {registro.id_caja}</span>
                </div>
              </div>
            </div>

            <div className={styles.headerStatus}>
              <div className={styles.dateInfo}>
                <span className={styles.dateLabel}>Fecha</span>
                <span className={styles.dateValue}>{registro.fecha}</span>
              </div>
              <button
                className={styles.viewImagesButton}
                onClick={handleViewImages}
                title="Ver imágenes"
              >
                <FontAwesomeIcon icon={faEye} />
                <span>Ver Imágenes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal organizado en secciones */}
        <div className={styles.cardContent}>
          {/* Sección 1: Información del Responsable y Ubicación */}
          <div className={styles.contentSection}>
            <h4 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faUser} className={styles.sectionIcon} />
              Responsable & Ubicación
            </h4>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Responsable:</span>
                <span className={styles.infoValue}>{registro.responsable}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Cédula:</span>
                <span className={styles.infoValue}>
                  {registro.cedula_responsable || "N/A"}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Sede:</span>
                <span className={styles.infoValue}>{registro.id_sede}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Caja:</span>
                <span className={styles.infoValue}>{registro.id_caja}</span>
              </div>
            </div>
          </div>

          {/* Sección 2: Estados de Verificación */}
          <div className={styles.contentSection}>
            <h4 className={styles.sectionTitle}>
              <FontAwesomeIcon
                icon={faClipboardCheck}
                className={styles.sectionIcon}
              />
              Estados de Verificación
            </h4>
            <div className={styles.statusGrid}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Conforme</span>
                {renderEstadoConIcono(registro.conforme)}
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Regularización</span>
                {renderEstadoConIcono(registro.regularizacion)}
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Precintos</span>
                {renderEstadoConIcono(registro.precintos)}
              </div>
            </div>
          </div>

          {/* Sección 3: Información Técnica */}
          <div className={styles.contentSection}>
            <h4 className={styles.sectionTitle}>
              <FontAwesomeIcon
                icon={faMicrochip}
                className={styles.sectionIcon}
              />
              Información Técnica
            </h4>
            <div className={styles.techGrid}>
              <div className={styles.techItem}>
                <span className={styles.techLabel}>Serial:</span>
                <span className={styles.techValue}>{registro.serial}</span>
              </div>
              <div className={styles.techItem}>
                <span className={styles.techLabel}>NII:</span>
                <span className={styles.techValue}>{registro.nii}</span>
              </div>
              <div className={styles.techItem}>
                <span className={styles.techLabel}>Estado Simel:</span>
                <span className={styles.techValue}>
                  {registro.estado_simel}
                </span>
              </div>
              <div className={styles.techItem}>
                <span className={styles.techLabel}>Certificación:</span>
                <span className={styles.techValue}>
                  {registro.fecha_certificacion}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con observaciones */}
        {registro.observaciones && (
          <div className={styles.cardFooter}>
            <div className={styles.observaciones}>
              <h4 className={styles.observacionesTitle}>
                <FontAwesomeIcon
                  icon={faStickyNote}
                  className={styles.observacionesIcon}
                />
                Observaciones
              </h4>
              <p className={styles.observacionesText}>
                {registro.observaciones}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

// Componente Modal de Imágenes
const ImagesModal = React.memo(({ registro, onClose, onImageClick }) => {
  const images = [
    {
      src: registro.imagen_conforme,
      title: "Imagen Conforme",
      key: "conforme",
    },
    {
      src: registro.imagen_regularizacion,
      title: "Imagen Regularización",
      key: "regularizacion",
    },
    {
      src: registro.imagen_precintos,
      title: "Imagen Precinto",
      key: "precintos",
    },
  ].filter((img) => img.src);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Imágenes del Registro #{registro.id_registro}</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.imagesGrid}>
          {images.map((image) => (
            <div key={image.key} className={styles.imageContainer}>
              <h4>{image.title}</h4>
              <img
                src={image.src}
                alt={image.title}
                onClick={() => onImageClick(image.src)}
                className={styles.modalImage}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Componente Modal de Imagen Expandida
const ExpandedImageModal = React.memo(({ imageUrl, onClose }) => {
  return (
    <div className={styles.expandedOverlay} onClick={onClose}>
      <div
        className={styles.expandedContent}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.expandedClose} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <img src={imageUrl} alt="Imagen expandida" />
      </div>
    </div>
  );
});

export default CvmReportes;
