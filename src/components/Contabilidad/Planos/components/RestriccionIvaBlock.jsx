import React, { useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../PlanosContables.module.css";
import { BIMESTRES_IVA } from "../utils/constants";

/**
 * Bloque específico para restricciones de ReteIVA (año + bimestre). Se
 * mantiene aparte del bloque anual porque la lógica de validación y el
 * shape del payload son distintos: aquí guardamos objetos { anio, bimestre }
 * en vez de números sueltos.
 */
const RestriccionIvaBlock = ({ restricciones, onAdd, onRemove }) => {
  const [inputAnio, setInputAnio] = useState("");
  const [inputBimestre, setInputBimestre] = useState("1");

  const handleAdd = useCallback(() => {
    const success = onAdd(inputAnio, inputBimestre);
    if (success) setInputAnio("");
  }, [onAdd, inputAnio, inputBimestre]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAdd();
      }
    },
    [handleAdd],
  );

  return (
    <div className={styles.configBlock}>
      <div className={styles.blockHeader}>
        <FontAwesomeIcon icon={faCalendarAlt} />
        <h4>Bloquear ReteIVA</h4>
      </div>
      <div className={styles.blockBody}>
        <div className={styles.inputRow}>
          <input
            type="number"
            placeholder="Año"
            value={inputAnio}
            onChange={(e) => setInputAnio(e.target.value.replace(/^\s+/, ""))}
            onKeyDown={handleKeyDown}
            className={styles.configInput}
          />
          <select
            value={inputBimestre}
            onChange={(e) => setInputBimestre(e.target.value)}
            className={styles.configSelect}
          >
            {BIMESTRES_IVA.map((b) => (
              <option key={b} value={b}>
                Bimestre {b}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            className={styles.addBtn}
            type="button"
          >
            <FontAwesomeIcon icon={faPlus} />
            Agregar
          </button>
        </div>

        <div className={styles.tagContainer}>
          {restricciones.length === 0 ? (
            <span className={styles.emptyTag}>Sin restricciones</span>
          ) : (
            restricciones.map((res) => (
              <div
                key={`${res.anio}-${res.bimestre}`}
                className={styles.tag}
              >
                <span>
                  {res.anio} - Bim {res.bimestre}
                </span>
                <button
                  onClick={() => onRemove(res.anio, res.bimestre)}
                  type="button"
                  title="Remover restricción"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RestriccionIvaBlock;
