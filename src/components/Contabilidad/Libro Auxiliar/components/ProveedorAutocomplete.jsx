import React, { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie, faSpinner } from "@fortawesome/free-solid-svg-icons";
import styles from "../LibroAuxiliar.module.css";

/**
 * Autocomplete de tercero. Muestra el dropdown de sugerencias cuando hay
 * opciones y las oculta al clickear fuera del contenedor.
 *
 * El input muestra siempre `proveedor_desc` (el texto que el usuario ve),
 * mientras que `proveedor_id` (código real) se setea al elegir una opción.
 */
const ProveedorAutocomplete = ({
  value,
  onChange,
  buscando,
  options,
  onSelect,
  onCerrar,
}) => {
  const containerRef = useRef(null);

  // Click fuera → cerrar opciones
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onCerrar();
      }
    };
    if (options.length > 0) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [options.length, onCerrar]);

  return (
    <div
      ref={containerRef}
      className={`${styles.formGroup} ${styles.floating} ${styles.autocompleteWrapper}`}
    >
      <input
        type="text"
        className={styles.formInput}
        value={value}
        placeholder=" "
        onChange={onChange}
      />
      <label className={styles.formLabel}>
        <FontAwesomeIcon icon={faUserTie} /> Tercero (NIT o descripción)
      </label>
      {buscando && (
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          className={styles.inputSpinner}
        />
      )}

      {options.length > 0 && (
        <ul className={styles.optionsList}>
          {options.map((prov) => (
            <li key={prov.codigo} onClick={() => onSelect(prov)}>
              <strong>{prov.codigo}</strong> - {prov.descripcion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProveedorAutocomplete;
