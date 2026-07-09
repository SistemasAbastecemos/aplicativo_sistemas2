import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faChevronDown,
  faCheckSquare,
  faSquare,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../ExistenciasAverias.module.css";
import { normalizarCodigoSede } from "../utils/helpers";

/**
 * Dropdown multi-select de sedes operativas. Muestra el label del campo
 * flotante arriba y el trigger con el estado actual de la selección.
 *
 * Los códigos de sede se normalizan a formato de 3 dígitos con padding
 * de ceros a la izquierda (via `normalizarCodigoSede`).
 */
const SelectorSedes = ({
  maestroSedes,
  sedesSeleccionadas,
  loadingSedes,
  disabled,
  onToggleSede,
  onToggleTodas,
}) => {
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickAfuera = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickAfuera);
    return () => document.removeEventListener("mousedown", handleClickAfuera);
  }, []);

  const obtenerLabel = () => {
    if (loadingSedes) return "Cargando sedes...";
    if (sedesSeleccionadas.length === 0) return "Seleccione sedes...";
    if (sedesSeleccionadas.length === maestroSedes.length)
      return "Todas las Sedes (Seleccionadas)";
    return `${sedesSeleccionadas.length} Sede(s) seleccionada(s)`;
  };

  const todasMarcadas =
    maestroSedes.length > 0 && sedesSeleccionadas.length === maestroSedes.length;

  return (
    <div className={styles.controlFormulario} ref={dropdownRef}>
      <div className={styles.campoFlotante}>
        <div className={styles.dropdownPersonalizado}>
          <div
            className={`${styles.dropdownTrigger} ${disabled || loadingSedes ? styles.disabledElement : ""}`}
            onClick={() =>
              !disabled && !loadingSedes && setDropdownAbierto(!dropdownAbierto)
            }
          >
            <span>{obtenerLabel()}</span>
            <FontAwesomeIcon
              icon={loadingSedes ? faSpinner : faChevronDown}
              spin={loadingSedes}
              className={styles.iconoChevron}
            />
          </div>

          {dropdownAbierto && maestroSedes.length > 0 && (
            <div className={styles.dropdownMenuContent}>
              <div
                className={styles.dropdownMenuItem}
                onClick={onToggleTodas}
              >
                <FontAwesomeIcon
                  icon={todasMarcadas ? faCheckSquare : faSquare}
                  className={
                    todasMarcadas
                      ? styles.checkboxIconActive
                      : styles.checkboxIcon
                  }
                />
                <span className={styles.textoItemBold}>[ MARCAR TODAS ]</span>
              </div>

              {maestroSedes.map((sede, idx) => {
                const codigoSede = normalizarCodigoSede(sede);
                const nombreSede =
                  sede.descripcion || sede.nombre || `Sede ${codigoSede}`;
                const estaMarcada = sedesSeleccionadas.includes(codigoSede);

                return (
                  <div
                    key={`${codigoSede}-${idx}`}
                    className={styles.dropdownMenuItem}
                    onClick={() => onToggleSede(codigoSede)}
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
  );
};

export default SelectorSedes;
