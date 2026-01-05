import React from "react";
import styles from "./ActualizacionCostos.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faHistory,
  faUser,
  faCalendarAlt,
  faComment,
  faArrowRight,
  faEnvelope,
  faTimesCircle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

const ModalTrazabilidad = ({ trazabilidad, onClose }) => {
  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";
    return new Date(fecha).toLocaleString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obtenerClaseEstado = (estado) => {
    switch (estado) {
      case "pendiente":
        return styles.estadoPendiente;
      case "en_revision":
        return styles.estadoRevision;
      case "aprobada":
        return styles.estadoAprobada;
      case "rechazada":
        return styles.estadoRechazada;
      case "aplicada":
        return styles.estadoAplicada;
      default:
        return styles.estadoPendiente;
    }
  };

  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case "pendiente":
        return faHistory;
      case "en_revision":
        return faComment;
      case "aprobada":
        return faCheckCircle;
      case "rechazada":
        return faTimesCircle;
      case "aplicada":
        return faHistory;
      default:
        return faHistory;
    }
  };

  if (!trazabilidad || trazabilidad.length === 0) {
    return (
      <div className={styles.overlayModal} onClick={onClose}>
        <div
          className={`${styles.modalGrande} ${styles.modalPequeño}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.encabezadoModal}>
            <div className={styles.tituloModal}>
              <FontAwesomeIcon icon={faHistory} />
              <div>
                <h2>Trazabilidad de la Solicitud</h2>
                <p>Historial completo de cambios y estados</p>
              </div>
            </div>
            <button className={styles.botonCerrarModal} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className={styles.cuerpoModal}>
            <div className={styles.sinDatos}>
              <FontAwesomeIcon icon={faHistory} />
              <p>No hay información de trazabilidad disponible</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlayModal} onClick={onClose}>
      <div
        className={`${styles.modalGrande} ${styles.modalPequeño}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.encabezadoModal}>
          <div className={styles.tituloModal}>
            <FontAwesomeIcon icon={faHistory} />
            <div>
              <h2>Trazabilidad de la Solicitud</h2>
              <p>Historial completo de cambios y estados</p>
            </div>
          </div>
          <button className={styles.botonCerrarModal} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.cuerpoModal}>
          <div className={styles.lineaTiempo}>
            {trazabilidad.map((evento, index) => (
              <div key={index} className={styles.eventoTiempo}>
                <div className={styles.marcadorTiempo}>
                  <FontAwesomeIcon
                    icon={obtenerIconoEstado(evento.estado_nuevo)}
                    className={styles.iconoEvento}
                  />
                </div>

                <div className={styles.contenidoEvento}>
                  <div className={styles.encabezadoEvento}>
                    <span
                      className={`${styles.estado} ${obtenerClaseEstado(
                        evento.estado_nuevo
                      )}`}
                    >
                      {evento.estado_nuevo.replace("_", " ").toUpperCase()}
                    </span>
                    <span className={styles.fechaEvento}>
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {formatearFecha(evento.fecha_creacion)}
                    </span>
                  </div>

                  {evento.estado_anterior &&
                    evento.estado_anterior !== evento.estado_nuevo && (
                      <div className={styles.transicionEstado}>
                        {evento.estado_anterior && (
                          <>
                            <span className={styles.estadoAnterior}>
                              {evento.estado_anterior.replace("_", " ")}
                            </span>
                            <FontAwesomeIcon
                              icon={faArrowRight}
                              className={styles.iconoTransicion}
                            />
                          </>
                        )}
                        <span className={styles.estadoNuevo}>
                          {evento.estado_nuevo.replace("_", " ")}
                        </span>
                      </div>
                    )}

                  <div className={styles.infoUsuario}>
                    <FontAwesomeIcon icon={faUser} />
                    <span className={styles.nombreUsuario}>
                      {evento.nombre_usuario || "Sistema"}
                    </span>
                    {evento.email_usuario && (
                      <>
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span className={styles.emailUsuario}>
                          {evento.email_usuario}
                        </span>
                      </>
                    )}
                  </div>

                  {evento.comentarios && evento.comentarios.trim() !== "" && (
                    <div className={styles.comentarios}>
                      <FontAwesomeIcon icon={faComment} />
                      <div>
                        <strong>Comentarios:</strong>
                        <p>{evento.comentarios}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.pieModal}>
          <button className={styles.botonPrimario} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalTrazabilidad;
