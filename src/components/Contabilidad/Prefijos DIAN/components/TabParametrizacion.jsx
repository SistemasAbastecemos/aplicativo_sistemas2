import React, { useState, useEffect, useRef } from "react";
import styles from "../PrefijosDian.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
  faPlus,
  faTrash,
  faSave,
  faToggleOn,
  faToggleOff,
} from "@fortawesome/free-solid-svg-icons";

const FilaConfiguracionInput = React.memo(
  ({
    row,
    handleConfigChange,
    toggleEstadoActivo,
    handleRemoveConfigRow,
    isTracked,
    setTracked,
  }) => {
    const [localDesde, setLocalDesde] = useState(row.fecha_desde || "");
    const [localHasta, setLocalHasta] = useState(row.fecha_hasta || "");
    const [localGrupoSede, setLocalGrupoSede] = useState(row.grupo_sede || "");
    const rowRef = useRef(null);

    useEffect(() => {
      setLocalDesde(row.fecha_desde || "");
    }, [row.fecha_desde]);
    useEffect(() => {
      setLocalHasta(row.fecha_hasta || "");
    }, [row.fecha_hasta]);
    useEffect(() => {
      setLocalGrupoSede(row.grupo_sede || "");
    }, [row.grupo_sede]);

    // Desplazamiento fluido y foco automático cuando la fila es creada o reubicada
    useEffect(() => {
      if (isTracked && rowRef.current) {
        const timer = setTimeout(() => {
          rowRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          // Hace focus automático en el input de Sede si está vacío para agilizar la edición
          if (!row.grupo_sede) {
            rowRef.current?.querySelector(`.${styles.inputSedeForm}`)?.focus();
          }
        }, 200); // Margen de espera exacto para que el acordeón complete su renderizado de altura
        return () => clearTimeout(timer);
      }
    }, [isTracked, row.grupo_sede, row.fecha_desde, row.fecha_hasta]);

    const despacharGrupoSede = () => {
      const valorLimpio = localGrupoSede.trim().toUpperCase();
      if (valorLimpio !== row.grupo_sede) {
        setTracked(row.indexOriginal); // Fuerza el tracking activo antes de que se mueva de categoría
        handleConfigChange(row.indexOriginal, "grupo_sede", valorLimpio);
      }
    };

    return (
      <tr
        ref={rowRef}
        className={`${row.activo === 0 ? styles.rowConfigInactiva : ""} ${isTracked ? styles.rowFilaTrackedHighlight : ""}`}
      >
        <td>
          <button
            type="button"
            onClick={() => toggleEstadoActivo(row.indexOriginal)}
            className={styles.btnToggleRowState}
          >
            <FontAwesomeIcon
              icon={row.activo === 1 ? faToggleOn : faToggleOff}
              style={{ color: row.activo === 1 ? "#03996b" : "#94a3b8" }}
            />
          </button>
        </td>
        <td>
          <select
            value={row.categoria}
            onChange={(e) => {
              setTracked(row.indexOriginal);
              handleConfigChange(
                row.indexOriginal,
                "categoria",
                e.target.value,
              );
            }}
          >
            <option value="PDV">PDV</option>
            <option value="ESTANDAR">ESTANDAR</option>
          </select>
        </td>
        <td>
          <select
            value={row.tipo_documento}
            onChange={(e) => {
              setTracked(row.indexOriginal);
              handleConfigChange(
                row.indexOriginal,
                "tipo_documento",
                e.target.value,
              );
            }}
          >
            <option value="FACTURA">FACTURA</option>
            <option value="NOTA">NOTA</option>
          </select>
        </td>
        <td>
          <input
            type="text"
            value={row.sub_bloque}
            onChange={(e) =>
              handleConfigChange(
                row.indexOriginal,
                "sub_bloque",
                e.target.value.trim(),
              )
            }
          />
        </td>
        <td>
          <input
            type="text"
            className={styles.inputSedeForm}
            value={localGrupoSede}
            onChange={(e) => setLocalGrupoSede(e.target.value)}
            onBlur={despacharGrupoSede}
            placeholder="Ej: B11"
          />
        </td>
        <td>
          <input
            type="text"
            className={styles.inputShort}
            value={row.tipo_siesa}
            onChange={(e) =>
              handleConfigChange(
                row.indexOriginal,
                "tipo_siesa",
                e.target.value.trim().toUpperCase(),
              )
            }
          />
        </td>
        <td>
          <input
            type="text"
            className={styles.inputShort}
            value={row.co_siesa}
            onChange={(e) =>
              handleConfigChange(
                row.indexOriginal,
                "co_siesa",
                e.target.value.trim(),
              )
            }
          />
        </td>
        <td>
          <input
            type="text"
            className={styles.inputLong}
            value={row.descripcion}
            onChange={(e) =>
              handleConfigChange(
                row.indexOriginal,
                "descripcion",
                e.target.value,
              )
            }
          />
        </td>
        <td>
          <input
            type="text"
            className={styles.inputPrefijos}
            value={row.prefijos_dian}
            onChange={(e) =>
              handleConfigChange(
                row.indexOriginal,
                "prefijos_dian",
                e.target.value.trim().toUpperCase(),
              )
            }
          />
        </td>
        <td>
          <input
            type="date"
            value={localDesde}
            onChange={(e) => setLocalDesde(e.target.value)}
            onBlur={() =>
              handleConfigChange(row.indexOriginal, "fecha_desde", localDesde)
            }
          />
        </td>
        <td>
          <input
            type="date"
            value={localHasta}
            onChange={(e) => setLocalHasta(e.target.value)}
            onBlur={() =>
              handleConfigChange(row.indexOriginal, "fecha_hasta", localHasta)
            }
          />
        </td>
        <td>
          <button
            type="button"
            onClick={() => handleRemoveConfigRow(row.indexOriginal)}
            className={styles.btnTrashRowAction}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </td>
      </tr>
    );
  },
);

FilaConfiguracionInput.displayName = "FilaConfiguracionInput";

export const TabParametrizacion = React.memo(
  ({
    configList,
    sedesAgrupadas,
    handleConfigChange,
    toggleEstadoActivo,
    handleRemoveConfigRow,
    handleAddConfigRow,
    ejecutarGuardadoConfig,
    ultimoIndexCreado,
    setUltimoIndexCreado,
  }) => {
    const [expandedSedes, setExpandedSedes] = useState({});
    const [expandedPeriods, setExpandedPeriods] = useState({});

    // Monitoreo reactivo para expandir instantáneamente las carpetas contenedoras de la fila trackeada
    useEffect(() => {
      if (ultimoIndexCreado === null || ultimoIndexCreado === undefined) return;

      let sedeDestino = null;
      let periodoDestino = null;

      Object.keys(sedesAgrupadas).forEach((sedeKey) => {
        Object.keys(sedesAgrupadas[sedeKey]).forEach((vKey) => {
          if (sedesAgrupadas[sedeKey][vKey].includes(ultimoIndexCreado)) {
            sedeDestino = sedeKey;
            periodoDestino = `${sedeKey}_${vKey}`;
          }
        });
      });

      if (sedeDestino && periodoDestino) {
        setExpandedSedes((prev) => ({ ...prev, [sedeDestino]: true }));
        setExpandedPeriods((prev) => ({ ...prev, [periodoDestino]: true }));
      }
    }, [ultimoIndexCreado, sedesAgrupadas]);

    return (
      <div className={styles.bentoParametrizacionCanvas}>
        <div className={styles.actionBarParametrizacionHeader}>
          <div>
            <h3>Maestro Central de Parametrización</h3>
            <p>
              Reglas de control de enrutamiento gobernadas por vigencias
              cronológicas organizacionales.
            </p>
          </div>
          <div className={styles.btnParametrizacionFlexGroup}>
            <button
              type="button"
              onClick={handleAddConfigRow}
              className={styles.appleBtnSecondary}
            >
              <FontAwesomeIcon icon={faPlus} /> Agregar Fila
            </button>
            <button
              type="button"
              onClick={ejecutarGuardadoConfig}
              className={styles.appleBtnPrimary}
            >
              <FontAwesomeIcon icon={faSave} /> Guardar Cambios
            </button>
          </div>
        </div>

        {Object.keys(sedesAgrupadas).map((sedeKey) => (
          <div key={sedeKey} className={styles.treeSedeCardBlock}>
            <div
              onClick={() =>
                setExpandedSedes((p) => ({ ...p, [sedeKey]: !p[sedeKey] }))
              }
              className={styles.treeSedeHeaderRow}
            >
              <h4>
                <FontAwesomeIcon
                  icon={expandedSedes[sedeKey] ? faChevronDown : faChevronRight}
                />{" "}
                SEDE REPORTE: {sedeKey}
              </h4>
            </div>

            {expandedSedes[sedeKey] && (
              <div className={styles.treeSedeContentChildren}>
                {Object.keys(sedesAgrupadas[sedeKey]).map((vKey) => {
                  const compositePeriodKey = `${sedeKey}_${vKey}`;
                  const isPeriodExpanded =
                    !!expandedPeriods[compositePeriodKey];

                  return (
                    <div key={vKey} className={styles.subTabGroupBlock}>
                      <div
                        onClick={() =>
                          setExpandedPeriods((p) => ({
                            ...p,
                            [compositePeriodKey]: !p[compositePeriodKey],
                          }))
                        }
                        className={styles.treePeriodSubHeaderRow}
                      >
                        <h5 className={styles.titleSubTabIndicator}>
                          <FontAwesomeIcon
                            icon={
                              isPeriodExpanded ? faChevronDown : faChevronRight
                            }
                          />{" "}
                          Vigencia Cronológica: {vKey}
                        </h5>
                      </div>

                      {isPeriodExpanded && (
                        <div className={styles.responsiveTableContainer}>
                          <table className={styles.tableConfigParametros}>
                            <thead>
                              <tr>
                                <th>Est</th>
                                <th>Categoría</th>
                                <th>Comprobante</th>
                                <th>Sub Bloque</th>
                                <th>Sede Reporte</th>
                                <th>Tipo Siesa</th>
                                <th>CO</th>
                                <th>Descripción</th>
                                <th>Prefijos DIAN</th>
                                <th>Desde</th>
                                <th>Hasta</th>
                                <th>Acción</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sedesAgrupadas[sedeKey][vKey].map((idx) => {
                                const row = configList.find(
                                  (c) => c.indexOriginal === idx,
                                );
                                return row ? (
                                  <FilaConfiguracionInput
                                    key={idx}
                                    row={row}
                                    handleConfigChange={handleConfigChange}
                                    toggleEstadoActivo={toggleEstadoActivo}
                                    handleRemoveConfigRow={
                                      handleRemoveConfigRow
                                    }
                                    isTracked={
                                      row.indexOriginal === ultimoIndexCreado
                                    }
                                    setTracked={setUltimoIndexCreado}
                                  />
                                ) : null;
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  },
);

TabParametrizacion.displayName = "TabParametrizacion";
