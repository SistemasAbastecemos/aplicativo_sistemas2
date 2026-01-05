import React, { useState } from "react";
import { useNotification } from "../../../contexts/NotificationContext";
import { apiService } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import styles from "./ActualizacionCostos.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faComment,
  faTimes,
  faBuilding,
  faBoxes,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const ModalAprobarRechazar = ({ solicitud, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [accion, setAccion] = useState("aprobar");
  const [observaciones, setObservaciones] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarEnviar = async () => {
    // 1. Validaciones
    if (accion === "aprobar" && !observaciones.trim()) {
      addNotification({
        message: "Las observaciones son obligatorias para aprobar",
        type: "warning",
      });
      return;
    }

    setCargando(true);
    try {
      // 2. Llama al apiService
      const respuesta = await apiService.procesarSolicitud(
        solicitud.id,
        user.id,
        accion,
        observaciones
      );

      // 3. Manejo de éxito
      onSuccess();
      onClose();
      addNotification({
        message: respuesta.mensaje || "Solicitud procesada exitosamente",
        type: "success",
      });
    } catch (error) {
      // 4. Manejo de errores
      addNotification({
        message: "Error al procesar la solicitud: " + error.message,
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.overlayModal} onClick={onClose}>
      <div
        className={`${styles.modalGrande} ${styles.modalPequeño}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.encabezadoModal}>
          <div className={styles.tituloModal}>
            <FontAwesomeIcon icon={faCheckCircle} />
            <div>
              <h2>Gestionar Solicitud #{solicitud.id}</h2>
              <p>Seleccione una acción y agregue observaciones</p>
            </div>
          </div>
          <button className={styles.botonCerrarModal} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.cuerpoModal}>
          {/* Información de la solicitud */}
          <div className={styles.seccionInfo}>
            <h3>Información de la Solicitud</h3>
            <div className={styles.gridInfo}>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faBuilding} />
                <div>
                  <label>Proveedor</label>
                  <span>{solicitud.nombre_proveedor}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faBoxes} />
                <div>
                  <label>Items</label>
                  <span>{solicitud.items?.length || 0} productos</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faUser} />
                <div>
                  <label>Comprador</label>
                  <span>{solicitud.nombre_comprador || "No asignado"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selección de acción */}
          <div className={styles.seccionFormulario}>
            <div className={styles.tarjetaFormulario}>
              <div className={styles.encabezadoTarjetaFormulario}>
                <FontAwesomeIcon icon={faCheckCircle} />
                <h4>Seleccionar Acción</h4>
              </div>
              <div className={styles.cuerpoTarjetaFormulario}>
                <div className={styles.grupoTipoActualizacion}>
                  <label className={styles.opcionTipoActualizacion}>
                    <input
                      type="radio"
                      value="aprobar"
                      checked={accion === "aprobar"}
                      onChange={(e) => setAccion(e.target.value)}
                    />
                    <div className={styles.contenidoOpcion}>
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className={`${styles.iconoOpcion} ${styles.iconoAprobar}`}
                      />
                      <div>
                        <span className={styles.tituloOpcion}>
                          Aprobar Solicitud
                        </span>
                        <span className={styles.descripcionOpcion}>
                          La solicitud será aprobada y procederá a aplicación
                        </span>
                      </div>
                    </div>
                  </label>

                  <label className={styles.opcionTipoActualizacion}>
                    <input
                      type="radio"
                      value="rechazar"
                      checked={accion === "rechazar"}
                      onChange={(e) => setAccion(e.target.value)}
                    />
                    <div className={styles.contenidoOpcion}>
                      <FontAwesomeIcon
                        icon={faTimesCircle}
                        className={`${styles.iconoOpcion} ${styles.iconoRechazar}`}
                      />
                      <div>
                        <span className={styles.tituloOpcion}>
                          Rechazar Solicitud
                        </span>
                        <span className={styles.descripcionOpcion}>
                          La solicitud será rechazada y notificada al proveedor
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className={styles.seccionFormulario}>
            <div className={styles.tarjetaFormulario}>
              <div className={styles.encabezadoTarjetaFormulario}>
                <FontAwesomeIcon icon={faComment} />
                <h4>Observaciones</h4>
              </div>
              <div className={styles.cuerpoTarjetaFormulario}>
                <div className={`${styles.grupoFormulario} ${styles.floating}`}>
                  <label className={styles.etiquetaFormulario}>
                    Observaciones {accion === "aprobar" && "*"}
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder={
                      accion === "aprobar"
                        ? "Ingrese las observaciones obligatorias para la aprobación..."
                        : "Observaciones opcionales para el rechazo..."
                    }
                    rows="4"
                    className={styles.textareaObservaciones}
                  />
                  {accion === "aprobar" && (
                    <p className={styles.ayudaFormulario}>
                      Las observaciones son obligatorias para aprobar la
                      solicitud
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.pieModal}>
          <button
            className={styles.botonSecundario}
            onClick={onClose}
            disabled={cargando}
          >
            <FontAwesomeIcon icon={faTimes} />
            <span>Cancelar</span>
          </button>

          <div className={styles.estadoAvance}>
            <span className={styles.textoAvance}>
              Acción seleccionada:{" "}
              {accion === "aprobar" ? "Aprobar" : "Rechazar"}
            </span>
          </div>

          <button
            className={`${styles.botonPrimario} ${
              accion === "aprobar" ? styles.botonAprobar : styles.botonRechazar
            }`}
            onClick={manejarEnviar}
            disabled={
              cargando || (accion === "aprobar" && !observaciones.trim())
            }
          >
            <FontAwesomeIcon
              icon={accion === "aprobar" ? faCheckCircle : faTimesCircle}
            />
            <span>
              {cargando
                ? "Procesando..."
                : accion === "aprobar"
                ? "Aprobar Solicitud"
                : "Rechazar Solicitud"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAprobarRechazar;
