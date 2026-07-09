import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faHistory,
  faSyncAlt,
  faSearchPlus,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../ProgramacionSeparata.module.css";
import { apiService } from "../../../../services/api";
import { useNotification } from "../../../../contexts/NotificationContext";

/**
 * Modal de historial: busca sugerencias con debounce de 400ms cuando el
 * término tiene ≥3 caracteres, permite seleccionar una sugerencia y muestra
 * el historial de programaciones del item en todas las separatas.
 *
 * Preserva la lógica original: el trim se aplica solo al enviar al backend,
 * no en el input mientras el usuario escribe (los códigos suelen ser
 * numéricos y las descripciones pueden tener espacios internos).
 */
const ItemHistoryModal = ({ onClose }) => {
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrandoSugerencias, setMostrandoSugerencias] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(false);

  const { addNotification } = useNotification();

  // Debounce de 400ms para sugerencias — no dispara si ya se seleccionó un item
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (itemSeleccionado) return;

      const termino = terminoBusqueda.trim();
      if (termino.length >= 3) {
        setLoadingSearch(true);
        try {
          const response =
            await apiService.searchItemHistorySuggestions(termino);
          if (response.success) {
            setSugerencias(response.data);
            setMostrandoSugerencias(true);
          }
        } catch (error) {
          console.error("Error buscando sugerencias:", error);
        } finally {
          setLoadingSearch(false);
        }
      } else {
        setSugerencias([]);
        setMostrandoSugerencias(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [terminoBusqueda, itemSeleccionado]);

  const seleccionarItem = async (item) => {
    setItemSeleccionado(true);
    setTerminoBusqueda(`${item.item} - ${item.descripcion}`);
    setSugerencias([]);
    setMostrandoSugerencias(false);
    setLoadingHistory(true);

    try {
      const response = await apiService.getItemHistoryExact(item.item);
      setHistorial(response.data || []);
      if (response.data.length === 0) {
        addNotification({
          message: "No existen registros en separatas para este item",
          type: "info",
        });
      }
    } catch (error) {
      setHistorial([]);
      addNotification({ message: error.message, type: "error" });
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div
        className={`${styles.modalContent} ${styles.historyModalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>
            <FontAwesomeIcon icon={faHistory} /> Historial de Programaciones
          </h3>
          <button className={styles.modalClose} onClick={onClose} type="button">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={`${styles.modalBody} ${styles.historyModalBody}`}>
          <div className={`${styles.searchGroupContainer} ${styles.floating}`}>
            <div className={styles.searchGroupContainer}>
              <div className={styles.inputFloatingWrapper}>
                <input
                  type="text"
                  className={styles.formInput}
                  value={terminoBusqueda}
                  onChange={(e) => {
                    setTerminoBusqueda(e.target.value);
                    setItemSeleccionado(false);
                  }}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setInputFocused(false), 150);
                  }}
                  placeholder="Ej. 000009 o Gelatina"
                  autoComplete="off"
                />
                <label className={styles.formLabel}>
                  Buscar por Código o Descripción
                </label>
              </div>

              <button
                type="button"
                className={styles.saveButton}
                disabled={loadingHistory || !itemSeleccionado}
                onClick={() => seleccionarItem(terminoBusqueda)}
              >
                <FontAwesomeIcon
                  icon={loadingSearch ? faSyncAlt : faSearchPlus}
                  spin={loadingSearch}
                />
                <span>{loadingSearch ? "Buscando..." : "Buscar"}</span>
              </button>
            </div>

            {inputFocused && mostrandoSugerencias && sugerencias.length > 0 && (
              <ul className={styles.suggestionsList}>
                {sugerencias.map((sug, i) => (
                  <li
                    key={i}
                    className={styles.suggestionItem}
                    onClick={() => seleccionarItem(sug)}
                  >
                    <strong>{sug.item}</strong>
                    <span>{sug.descripcion}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {loadingHistory ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              Extrayendo información histórica...
            </div>
          ) : (
            historial.length > 0 && (
              <div className={styles.historyTableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Separata</th>
                      <th>Vigencia</th>
                      <th>Precio Antes</th>
                      <th>Dcto</th>
                      <th>Precio Ahora</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((reg, i) => (
                      <tr key={i}>
                        <td>
                          <strong>
                            {reg.titulo || `Separata #${reg.separata_id}`}
                          </strong>
                        </td>
                        <td>{`${reg.fecha_inicio} a ${reg.fecha_final}`}</td>
                        <td>
                          $
                          {parseFloat(reg.precio_antes).toLocaleString("es-CO")}
                        </td>
                        <td>{parseFloat(reg.descuento)}%</td>
                        <td style={{ color: "#03996b", fontWeight: "bold" }}>
                          $
                          {parseFloat(reg.precio_ahora).toLocaleString("es-CO")}
                        </td>
                        <td>{reg.usuario}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemHistoryModal;
