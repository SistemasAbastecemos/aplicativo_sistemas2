import React, { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faEye,
  faUser,
  faClipboardCheck,
  faMicrochip,
  faStickyNote,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Reportes.module.css";
import { getTipoBalanzaImagen } from "../utils/deviceImages";

/**
 * Tarjeta detallada de un registro CVM. Organiza la información en cuatro
 * secciones: header con dispositivo y fecha, responsable/ubicación, estados
 * de verificación e información técnica. Observaciones aparecen en footer
 * solo si existen.
 *
 * El click sobre la card selecciona el registro (para llenar el panel de
 * acción). El botón "Ver Imágenes" abre el modal correspondiente.
 */
const RegistroCard = React.memo(
  ({ registro, isSelected, onSelect, onViewImages }) => {
    const handleClick = useCallback(() => {
      onSelect(registro);
    }, [registro, onSelect]);

    const handleViewImages = useCallback(
      (e) => {
        e.stopPropagation();
        onViewImages(registro);
      },
      [registro, onViewImages],
    );

    const renderEstadoConIcono = (valor) => {
      const esBueno = valor === "Bueno";
      return (
        <span
          className={`${styles.statusValue} ${
            esBueno ? styles.estadoBueno : styles.estadoMalo
          }`}
        >
          {valor}
          <FontAwesomeIcon icon={esBueno ? faCheckCircle : faTimesCircle} />
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
                type="button"
              >
                <FontAwesomeIcon icon={faEye} />
                <span>Ver Imágenes</span>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.cardContent}>
          {/* Sección 1: Responsable & Ubicación */}
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
  },
);

RegistroCard.displayName = "RegistroCard";

export default RegistroCard;
