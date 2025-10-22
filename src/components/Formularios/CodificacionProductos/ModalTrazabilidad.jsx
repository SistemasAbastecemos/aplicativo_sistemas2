import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import styles from "./Modals.module.css";

const ModalTrazabilidad = ({ isOpen, onClose, traceabilityData }) => {
  if (!isOpen) return null;

  const formatDateTime = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("es-CO", options);
  };

  return (
    <div
      className={`${styles.modalOverlay} ${isOpen ? styles.show : ""}`}
      onClick={onClose}
    >
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            <FontAwesomeIcon icon={faHistory} className={styles.modalIcon} />
            Historial de Estados
          </h3>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.traceabilityContent}>
          <div className={styles.timeline}>
            {traceabilityData.map((item, index) => (
              <div key={index} className={styles.timelineItem}>
                <div className={styles.timelineDot}></div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>
                    <span className={styles.timelineDate}>
                      {item.fecha_formateada}
                    </span>
                    <div className={styles.stateTransition}>
                      <span className={styles.stateBadge}>
                        {item.estado_anterior || "N/A"}
                      </span>
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className={styles.arrowIcon}
                      />
                      <span
                        className={`${styles.stateBadge} ${
                          styles[item.estado_nuevo.toLowerCase()]
                        }`}
                      >
                        {item.estado_nuevo}
                      </span>
                    </div>
                  </div>

                  <div className={styles.timelineBody}>
                    {(item.comentarios || item.observaciones) && (
                      <div className={styles.commentsSection}>
                        <h5>Detalles del cambio:</h5>
                        {item.comentarios && <p>{item.comentarios}</p>}
                        {item.observaciones && (
                          <p className={styles.observaciones}>
                            <strong>Observaciones:</strong> {item.observaciones}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalTrazabilidad;
