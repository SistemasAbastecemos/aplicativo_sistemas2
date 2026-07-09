import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import styles from "../ExistenciasAverias.module.css";
import SelectorSedes from "./SelectorSedes";
import { useSedesMaestro } from "../hooks/useSedesMaestro";

/**
 * Formulario de filtros que dispara la consulta al backend. Compone:
 *  - Selector multi-sede (con carga automática del catálogo)
 *  - Input de mes/año (formato YYYY-MM del input `type="month"`)
 *  - Botón "Consultar"
 *
 * Al submit, formatea el lapso a YYYYMM (sin guion) — formato esperado
 * por el backend.
 */
const FiltrosReporte = ({ onBuscar, loading, addNotification }) => {
  const {
    maestroSedes,
    sedesSeleccionadas,
    loadingSedes,
    toggleSede,
    toggleTodasSedes,
  } = useSedesMaestro();

  const fechaActual = new Date();
  const mesActualStr = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, "0")}`;
  const [lapsoCalendario, setLapsoCalendario] = useState(mesActualStr);

  const handleProcesarFormulario = (e) => {
    e.preventDefault();

    if (sedesSeleccionadas.length === 0) {
      addNotification({
        type: "warning",
        message:
          "Debe seleccionar al menos una sede operativa para realizar la auditoría.",
      });
      return;
    }

    if (!lapsoCalendario) {
      addNotification({
        type: "warning",
        message: "Debe seleccionar un año y mes válido en el calendario.",
      });
      return;
    }

    const lapsoFormateado = lapsoCalendario.replace("-", "");
    onBuscar(sedesSeleccionadas, [lapsoFormateado]);
  };

  return (
    <form className={styles.tarjetaFiltros} onSubmit={handleProcesarFormulario}>
      <SelectorSedes
        maestroSedes={maestroSedes}
        sedesSeleccionadas={sedesSeleccionadas}
        loadingSedes={loadingSedes}
        disabled={loading}
        onToggleSede={toggleSede}
        onToggleTodas={toggleTodasSedes}
      />

      <div className={styles.controlFormulario}>
        <div className={styles.campoFlotante}>
          <input
            type="month"
            value={lapsoCalendario}
            onChange={(e) => setLapsoCalendario(e.target.value)}
            disabled={loading}
            className={styles.inputMesCalendario}
            required
          />
          <label className={styles.labelFlotante}>
            <FontAwesomeIcon icon={faCalendarAlt} />
            Mes de Historial (Periodo)
          </label>
        </div>
      </div>

      <button
        type="submit"
        className={styles.btnBuscarDatos}
        disabled={loading || loadingSedes}
      >
        <FontAwesomeIcon icon={faSearch} className={styles.btnIconoMargen} />
        Consultar
      </button>
    </form>
  );
};

export default FiltrosReporte;
