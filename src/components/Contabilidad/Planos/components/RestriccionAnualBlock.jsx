import React, { useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../PlanosContables.module.css";

/**
 * Bloque reutilizable para restricciones ANUALES (un solo campo: año).
 * Usado por retefuente, ICA Yumbo e ICA Palmira — todos comparten la misma
 * estructura de input + tags. Elimina el copy-paste del legacy.
 *
 * El input está controlado internamente y bloquea espacios al inicio en
 * tiempo real (aunque type="number" ya lo previene, defendemos también
 * contra pastes accidentales).
 */
const RestriccionAnualBlock = ({
  titulo,
  keyState,
  anios,
  onAdd,
  onRemove,
}) => {
  const [input, setInput] = useState("");

  const handleAdd = useCallback(() => {
    const success = onAdd(keyState, input);
    if (success) setInput("");
  }, [onAdd, keyState, input]);

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
        <FontAwesomeIcon icon={faLock} />
        <h4>{titulo}</h4>
      </div>
      <div className={styles.blockBody}>
        <div className={styles.inputRow}>
          <input
            type="number"
            placeholder="Ej. 2026"
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/^\s+/, ""))}
            onKeyDown={handleKeyDown}
            className={styles.configInput}
          />
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
          {anios.length === 0 ? (
            <span className={styles.emptyTag}>Sin restricciones</span>
          ) : (
            anios.map((anio) => (
              <div key={anio} className={styles.tag}>
                <span>Año {anio}</span>
                <button
                  onClick={() => onRemove(keyState, anio)}
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

export default RestriccionAnualBlock;
