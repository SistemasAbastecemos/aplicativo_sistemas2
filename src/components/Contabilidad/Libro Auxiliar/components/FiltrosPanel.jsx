import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faMapMarkerAlt,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../LibroAuxiliar.module.css";
import ProveedorAutocomplete from "./ProveedorAutocomplete";
import { EMPRESAS } from "../utils/constants";

/**
 * Panel de filtros del reporte: empresa, sede, tercero (autocomplete),
 * fecha inicio y fecha fin. Layout de 12 columnas en desktop que colapsa
 * a 1 columna en móvil.
 */
const FiltrosPanel = ({
  filtros,
  sedes,
  proveedoresOptions,
  buscandoProveedor,
  onFilterChange,
  onProveedorSearch,
  onSelectProveedor,
  onCerrarOpciones,
}) => (
  <div className={styles.gridContainer}>
    {/* Empresa */}
    <div className={`${styles.formGroup} ${styles.floating} ${styles.colSpan2}`}>
      <select
        name="empresa"
        className={styles.formSelect}
        value={filtros.empresa}
        onChange={onFilterChange}
      >
        {EMPRESAS.map((emp) => (
          <option key={emp.value} value={emp.value}>
            {emp.label}
          </option>
        ))}
      </select>
      <label className={styles.formLabel}>
        <FontAwesomeIcon icon={faBuilding} /> Empresa
      </label>
    </div>

    {/* Sede */}
    <div className={`${styles.formGroup} ${styles.floating} ${styles.colSpan3}`}>
      <select
        name="sede"
        className={styles.formSelect}
        value={filtros.sede}
        onChange={onFilterChange}
      >
        <option value="">Consolidado general</option>
        {sedes.map((s) => (
          <option key={s.codigo} value={s.codigo}>
            {s.codigo} - {s.descripcion}
          </option>
        ))}
      </select>
      <label className={styles.formLabel}>
        <FontAwesomeIcon icon={faMapMarkerAlt} /> Centro de Operación
      </label>
    </div>

    {/* Tercero */}
    <div className={styles.colSpan3}>
      <ProveedorAutocomplete
        value={filtros.proveedor_desc}
        onChange={onProveedorSearch}
        buscando={buscandoProveedor}
        options={proveedoresOptions}
        onSelect={onSelectProveedor}
        onCerrar={onCerrarOpciones}
      />
    </div>

    {/* Fecha Inicio */}
    <div className={`${styles.formGroup} ${styles.floating} ${styles.colSpan2}`}>
      <input
        type="date"
        name="fecha_inicio"
        className={styles.formInput}
        value={filtros.fecha_inicio}
        onChange={onFilterChange}
        placeholder=" "
      />
      <label className={styles.formLabel}>
        <FontAwesomeIcon icon={faCalendarAlt} /> Fecha Inicio
      </label>
    </div>

    {/* Fecha Fin */}
    <div className={`${styles.formGroup} ${styles.floating} ${styles.colSpan2}`}>
      <input
        type="date"
        name="fecha_fin"
        className={styles.formInput}
        value={filtros.fecha_fin}
        onChange={onFilterChange}
        placeholder=" "
      />
      <label className={styles.formLabel}>
        <FontAwesomeIcon icon={faCalendarAlt} /> Fecha Final
      </label>
    </div>
  </div>
);

export default FiltrosPanel;
