import React, { useState, useRef, useEffect } from "react";
import styles from "../ExistenciasAverias.module.css";
import { apiService } from "../../../../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBuilding,
  faCalendarAlt,
  faChevronDown,
  faCheckSquare,
  faSquare,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const FiltrosReporte = ({ onBuscar, loading }) => {
  const [maestroSedes, setMaestroSedes] = useState([]);
  const [sedesSeleccionadas, setSedesSeleccionadas] = useState([]);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [loadingSedes, setLoadingSedes] = useState(false);

  const fechaActual = new Date();
  const mesActualStr = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, "0")}`;
  const [lapsoCalendario, setLapsoCalendario] = useState(mesActualStr);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const cargarSedesMaestro = async () => {
      setLoadingSedes(true);
      try {
        const sedesData = await apiService.getSedes(true);
        const listaSedes = sedesData || [];
        setMaestroSedes(listaSedes);

        // Extraer el codigo analitico de Siesa, nunca el ID secuencial web
        const todosLosCodigos = listaSedes.map((s) => {
          const codigoRaw = s.co_siesa || s.codigo || s.id_co;
          return String(codigoRaw).trim().padStart(3, "0");
        });

        setSedesSeleccionadas(todosLosCodigos);
      } catch (error) {
        console.error("Error recuperando el maestro de sedes:", error);
      } finally {
        setLoadingSedes(false);
      }
    };

    cargarSedesMaestro();
  }, []);

  useEffect(() => {
    const handleClickAfuera = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickAfuera);
    return () => document.removeEventListener("mousedown", handleClickAfuera);
  }, []);

  const handleToggleSede = (codigoSede) => {
    const codigoLimpio = String(codigoSede).trim().padStart(3, "0");
    if (sedesSeleccionadas.includes(codigoLimpio)) {
      setSedesSeleccionadas(
        sedesSeleccionadas.filter((cd) => cd !== codigoLimpio),
      );
    } else {
      setSedesSeleccionadas([...sedesSeleccionadas, codigoLimpio]);
    }
  };

  const handleToggleTodas = () => {
    if (sedesSeleccionadas.length === maestroSedes.length) {
      setSedesSeleccionadas([]);
    } else {
      const todosLosCodigos = maestroSedes.map((s) =>
        String(s.co_siesa || s.codigo || s.id_co)
          .trim()
          .padStart(3, "0"),
      );
      setSedesSeleccionadas(todosLosCodigos);
    }
  };

  const handleProcesarFormulario = (e) => {
    e.preventDefault();

    if (sedesSeleccionadas.length === 0) {
      alert(
        "Debe seleccionar al menos una sede operativa para realizar la auditoria.",
      );
      return;
    }

    if (!lapsoCalendario) {
      alert("Debe seleccionar un año y mes valido en el calendario.");
      return;
    }

    const lapsoFormateado = lapsoCalendario.replace("-", "");
    onBuscar(sedesSeleccionadas, [lapsoFormateado]);
  };

  const obtenerLabelSedes = () => {
    if (loadingSedes) return "Cargando sedes...";
    if (sedesSeleccionadas.length === 0) return "Seleccione sedes...";
    if (sedesSeleccionadas.length === maestroSedes.length)
      return "Todas las Sedes (Seleccionadas)";
    return `${sedesSeleccionadas.length} Sede(s) seleccionada(s)`;
  };

  return (
    <form className={styles.tarjetaFiltros} onSubmit={handleProcesarFormulario}>
      <div className={styles.controlFormulario} ref={dropdownRef}>
        <div className={styles.campoFlotante}>
          <div className={styles.dropdownPersonalizado}>
            <div
              className={`${styles.dropdownTrigger} ${loading || loadingSedes ? styles.disabledElement : ""}`}
              onClick={() =>
                !loading &&
                !loadingSedes &&
                setDropdownAbierto(!dropdownAbierto)
              }
            >
              <span>{obtenerLabelSedes()}</span>
              {loadingSedes ? (
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  className={styles.iconoChevron}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={styles.iconoChevron}
                />
              )}
            </div>

            {dropdownAbierto && maestroSedes.length > 0 && (
              <div className={styles.dropdownMenuContent}>
                <div
                  className={styles.dropdownMenuItem}
                  onClick={handleToggleTodas}
                >
                  <FontAwesomeIcon
                    icon={
                      sedesSeleccionadas.length === maestroSedes.length
                        ? faCheckSquare
                        : faSquare
                    }
                    className={
                      sedesSeleccionadas.length === maestroSedes.length
                        ? styles.checkboxIconActive
                        : styles.checkboxIcon
                    }
                  />
                  <span className={styles.textoItemBold}>[ MARCAR TODAS ]</span>
                </div>

                {maestroSedes.map((sede, idx) => {
                  // Evaluacion rigurosa por Codigo Siesa corporativo
                  const codigoSede = String(
                    sede.co_siesa || sede.codigo || s.id_co,
                  )
                    .trim()
                    .padStart(3, "0");
                  const nombreSede =
                    sede.descripcion || sede.nombre || `Sede ${codigoSede}`;
                  const estaMarcada = sedesSeleccionadas.includes(codigoSede);

                  return (
                    <div
                      key={`${codigoSede}-${idx}`}
                      className={styles.dropdownMenuItem}
                      onClick={() => handleToggleSede(codigoSede)}
                    >
                      <FontAwesomeIcon
                        icon={estaMarcada ? faCheckSquare : faSquare}
                        className={
                          estaMarcada
                            ? styles.checkboxIconActive
                            : styles.checkboxIcon
                        }
                      />
                      <span>
                        {codigoSede} - {nombreSede}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <label className={styles.labelFlotante}>
            <FontAwesomeIcon icon={faBuilding} />
            Sedes Operativas
          </label>
        </div>
      </div>

      <div className={styles.controlFormulario}>
        <div className={styles.campoFlotante}>
          <input
            type="month"
            value={lapsoCalendario}
            onChange={(e) => setLapsoCalendario(e.target.value)}
            disabled={loading}
            className={styles.inputMesCalendario}
            style={{ width: "100%", boxSizing: "border-box" }}
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
