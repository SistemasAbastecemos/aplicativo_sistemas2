import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import styles from "../CVM.module.css";

/**
 * Barra de acción sticky al fondo con un resumen del reporte y el botón
 * de envío. Solo se renderiza cuando el formulario está completo.
 */
const ActionBar = ({ cajaSeleccionada, equipoInfo, cargando, onEnviar }) => {
  const esTodas = cajaSeleccionada?.id_caja === "todas";

  const resumen = esTodas
    ? "Reporte general sin novedades"
    : `Caja ${cajaSeleccionada?.id_caja?.replace("caja", "")} — ${equipoInfo?.tipo}`;

  return (
    <div className={styles.actionBar}>
      <div className={styles.actionSummary}>
        <div className={styles.summaryText}>
          <strong>Reporte listo para enviar</strong>
          <span>{resumen}</span>
        </div>
        <button
          className={styles.submitBtn}
          onClick={onEnviar}
          disabled={cargando}
          type="button"
        >
          {cargando ? (
            <>
              <div className={styles.spinner}></div>
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faArrowRight} />
              <span>Enviar Reporte</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ActionBar;
