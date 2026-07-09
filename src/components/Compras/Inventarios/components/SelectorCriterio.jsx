import React, { useState, useEffect, useRef } from "react";
import styles from "../PermisosInventario.module.css";
import { apiService } from "../../../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTags } from "@fortawesome/free-solid-svg-icons";

function SelectorCriterio({ onSelect, disabled }) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const cleanQuery = query.trim();
    if (cleanQuery.length < 2) {
      setOptions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await apiService.buscarCriterios1(cleanQuery);
        setOptions(data || []);
        setShowDropdown(true);
      } catch (err) {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

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
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
        />
        <label>Buscar e Incluir Criterio 1</label>
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
          {options.map((crit, index) => (
            <li
              key={`${crit.codigo}-${index}`}
              onClick={() => {
                onSelect(crit.codigo.trim());
                setQuery("");
                setShowDropdown(false);
              }}
            >
              <FontAwesomeIcon icon={faTags} />{" "}
              <strong>{crit.codigo.trim()}</strong> - {crit.descripcion.trim()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SelectorCriterio;
