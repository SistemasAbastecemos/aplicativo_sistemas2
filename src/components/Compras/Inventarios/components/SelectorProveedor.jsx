import React, { useState, useEffect, useRef } from "react";
import styles from "../PermisosInventario.module.css";
import { apiService } from "../../../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faBuilding } from "@fortawesome/free-solid-svg-icons";

function SelectorProveedor({ onSelect, disabled, valueInicial = "" }) {
  const [query, setQuery] = useState(valueInicial);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (valueInicial) setQuery(valueInicial);
  }, [valueInicial]);

  useEffect(() => {
    const cleanQuery = query.trim();
    if (cleanQuery.length < 3) {
      setOptions([]);
      return;
    }
    if (valueInicial && query === valueInicial) return;

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await apiService.buscarProveedoresSiesa(cleanQuery);
        setOptions(data || []);
        setShowDropdown(true);
      } catch (err) {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query, valueInicial]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.autocompleteContainer} ref={containerRef}>
      <div className={`${styles.formGroup} ${styles.floating}`}>
        <input
          type="text"
          className={styles.formInput}
          placeholder=" "
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSelect(null);
          }}
          disabled={disabled}
        />
        <label>Buscar Proveedor Central (Siesa)</label>
        {loading && (
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className={styles.inputSpinner}
          />
        )}
      </div>

      {showDropdown && options.length > 0 && (
        <ul className={styles.dropdownList}>
          {options.map((prov, index) => (
            <li
              key={`${prov.nit}-${index}`}
              onClick={() => {
                onSelect(prov);
                setQuery(`${prov.nit} - ${prov.razon_social.trim()}`);
                setShowDropdown(false);
              }}
            >
              <FontAwesomeIcon icon={faBuilding} /> <strong>{prov.nit}</strong>{" "}
              - {prov.razon_social.trim()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SelectorProveedor;
