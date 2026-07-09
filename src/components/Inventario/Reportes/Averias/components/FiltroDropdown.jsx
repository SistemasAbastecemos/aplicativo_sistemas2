import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faSearch,
  faCheckSquare,
  faSquare,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../ExistenciasAverias.module.css";

/**
 * Dropdown genérico multi-select con buscador interno. Reutilizable para
 * los 3 filtros de la tabla (Proveedor, Línea, Ítem) — elimina el
 * copy-paste triple del legacy.
 *
 * Props:
 *  - label: texto mostrado ("Proveedor", "Línea", "Ítem")
 *  - abierto: si el panel está desplegado
 *  - esTodos: si todas las opciones están marcadas
 *  - selecciones: array de valores actualmente seleccionados
 *  - opciones: array de opciones a mostrar (ya filtradas por búsqueda)
 *  - busqueda: string del input de búsqueda
 *  - searchName: name del input (usado para el handler compartido)
 *  - onToggle: abre/cierra este dropdown
 *  - onToggleOpcion: dispara al hacer click en una opción
 *  - onBusquedaChange: dispara al escribir en el buscador
 */
const FiltroDropdown = ({
  label,
  abierto,
  esTodos,
  selecciones,
  opciones,
  busqueda,
  searchName,
  onToggle,
  onToggleOpcion,
  onBusquedaChange,
}) => (
  <div className={styles.dropdownContenedorIndividual}>
    <button
      type="button"
      className={`${styles.botonDropdownDisparador} ${!esTodos ? styles.botonDropdownFiltrando : ""}`}
      onClick={onToggle}
    >
      <span>
        {label}: {esTodos ? "Todos" : `${selecciones.length} sel.`}
      </span>
      <FontAwesomeIcon
        icon={faChevronDown}
        className={styles.iconoChevronFlotante}
      />
    </button>

    {abierto && (
      <div className={styles.panelDesplegableFlotante}>
        <div className={styles.buscadorFiltroWrapper}>
          <FontAwesomeIcon
            icon={faSearch}
            className={styles.iconoLupaBuscador}
          />
          <input
            type="text"
            name={searchName}
            placeholder={`Buscar ${label.toLowerCase()}...`}
            value={busqueda}
            onChange={onBusquedaChange}
            autoComplete="off"
          />
        </div>
        <div className={styles.listaOpcionesSeleccionables}>
          <div
            className={`${styles.opcionFiltroFila} ${esTodos ? styles.opcionFiltroFilaActiva : ""}`}
            onClick={() => onToggleOpcion("TODOS")}
          >
            <FontAwesomeIcon
              icon={esTodos ? faCheckSquare : faSquare}
              className={styles.iconoCasillaCheck}
            />
            <span>[ Seleccionar Todos ]</span>
          </div>
          {opciones.map((valor) => {
            const estaSeleccionado = selecciones.includes(valor);
            return (
              <div
                key={valor}
                className={`${styles.opcionFiltroFila} ${estaSeleccionado ? styles.opcionFiltroFilaActiva : ""}`}
                onClick={() => onToggleOpcion(valor)}
              >
                <FontAwesomeIcon
                  icon={estaSeleccionado ? faCheckSquare : faSquare}
                  className={styles.iconoCasillaCheck}
                />
                <span title={valor}>{valor}</span>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
);

export default FiltroDropdown;
