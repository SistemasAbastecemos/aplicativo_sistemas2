import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faHistory,
  faUser,
  faCalendar,
  faComment,
  faCircle,
  faArrowRight,
  faEnvelope,
  faTimesCircle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./ActualizacionCostos.module.css";

const ModalTrazabilidad = ({ trazabilidad, onClose }) => {
  if (!trazabilidad) return null;

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obtenerClaseEstado = (estado) => {
    const clases = {
      pendiente: styles.estadoPendiente,
      en_revision: styles.estadoRevision,
      aprobada: styles.estadoAprobada,
      rechazada: styles.estadoRechazada,
      aplicada: styles.estadoAplicada,
    };
    return clases[estado] || styles.estadoPendiente;
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

  return (
    <div className={styles.overlayModal} onClick={onClose}>
      <div className={styles.modalGrande} onClick={(e) => e.stopPropagation()}>
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
            {trazabilidad.map((item, index) => (
              <div key={item.id} className={styles.eventoTiempo}>
                <div className={styles.marcadorTiempo}>
                  <FontAwesomeIcon
                    icon={obtenerIconoEstado(item.estado_nuevo)}
                    className={styles.iconoEvento}
                  />
                </div>
                <div className={styles.contenidoEvento}>
                  <div className={styles.encabezadoEvento}>
                    <span
                      className={`${styles.estado} ${obtenerClaseEstado(
                        item.estado_nuevo
                      )}`}
                    >
                      {item.estado_nuevo.replace("_", " ")}
                    </span>
                    <span className={styles.fechaEvento}>
                      <FontAwesomeIcon icon={faCalendar} />
                      {formatearFecha(item.fecha)}
                    </span>
                  </div>
                  {item.estado_anterior &&
                    item.estado_anterior !== item.estado_nuevo && (
                      <div className={styles.transicionEstado}>
                        {item.estado_anterior && (
                          <>
                            <span className={styles.estadoAnterior}>
                              {item.estado_anterior.replace("_", " ")}
                            </span>
                            <FontAwesomeIcon
                              icon={faArrowRight}
                              className={styles.iconoTransicion}
                            />
                          </>
                        )}
                        <span className={styles.estadoNuevo}>
                          {item.estado_nuevo.replace("_", " ")}
                        </span>
                      </div>
                    )}

                  <div className={styles.infoUsuario}>
                    <FontAwesomeIcon icon={faUser} />
                    <span>{item.nombre_usuario || "Sistema"}</span>
                    {item.email_usuario && (
                      <>
                        <FontAwesomeIcon icon={faEnvelope} />
                        <span className={styles.emailUsuario}>
                          {item.email_usuario}
                        </span>
                      </>
                    )}
                  </div>

                  {item.comentarios && (
                    <div className={styles.comentarios}>
                      <FontAwesomeIcon icon={faComment} />
                      <div>
                        <strong>Comentarios:</strong>
                        <p>
                          {(() => {
                            if (item.estado_nuevo !== "rechazada") {
                              const partes =
                                item.comentarios.split(/Observaciones[:]?/i);
                              return partes[0].trim(); // Muestra solo lo anterior a 'Observaciones'
                            }
                            return item.comentarios;
                          })()}
                        </p>
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
