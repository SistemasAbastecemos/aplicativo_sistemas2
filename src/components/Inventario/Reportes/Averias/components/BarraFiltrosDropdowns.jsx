import React from "react";
import styles from "../ExistenciasAverias.module.css";
import FiltroDropdown from "./FiltroDropdown";
import { FILTROS_DROPDOWN } from "../utils/constants";

/**
 * Barra que agrupa los 3 dropdowns de filtro de la tabla (Proveedor,
 * Línea, Ítem). Itera sobre FILTROS_DROPDOWN — agregar un cuarto filtro
 * es agregar una entrada al array.
 */
const BarraFiltrosDropdowns = ({
  filtros,
  dropdownAbierto,
  busquedaFiltro,
  opcionesFiltradas,
  esTodosSeleccionado,
  toggleOpcion,
  toggleDropdown,
  onBusquedaChange,
}) => (
  <div className={styles.barraFiltrosDropdowns}>
    {FILTROS_DROPDOWN.map((f) => (
      <FiltroDropdown
        key={f.key}
        label={f.label}
        abierto={dropdownAbierto[f.searchKey]}
        esTodos={esTodosSeleccionado(f.stateKey)}
        selecciones={filtros[f.stateKey]}
        opciones={opcionesFiltradas[f.stateKey]}
        busqueda={busquedaFiltro[f.searchKey]}
        searchName={f.searchKey}
        onToggle={() => toggleDropdown(f.searchKey)}
        onToggleOpcion={(valor) => toggleOpcion(f.stateKey, valor)}
        onBusquedaChange={onBusquedaChange}
      />
    ))}
  </div>
);

export default BarraFiltrosDropdowns;
