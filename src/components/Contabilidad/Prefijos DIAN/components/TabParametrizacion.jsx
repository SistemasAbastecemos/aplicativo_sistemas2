import React, { useState, useEffect } from "react";
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
  ({ row, handleConfigChange, toggleEstadoActivo, handleRemoveConfigRow }) => {
    const [localDesde, setLocalDesde] = useState(row.fecha_desde || "");
    const [localHasta, setLocalHasta] = useState(row.fecha_hasta || "");
    // Estado local para evitar que la fila salte de grupo concurrentemente al escribir
    const [localGrupoSede, setLocalGrupoSede] = useState(row.grupo_sede || "");

    useEffect(() => {
      setLocalDesde(row.fecha_desde || "");
    }, [row.fecha_desde]);

    useEffect(() => {
      setLocalHasta(row.fecha_hasta || "");
    }, [row.fecha_hasta]);

    useEffect(() => {
      setLocalGrupoSede(row.grupo_sede || "");
    }, [row.grupo_sede]);

    const despacharFechaDesde = () => {
      if (localDesde !== row.fecha_desde)
        handleConfigChange(row.indexOriginal, "fecha_desde", localDesde);
    };

    const despacharFechaHasta = () => {
      if (localHasta !== row.fecha_hasta)
        handleConfigChange(row.indexOriginal, "fecha_hasta", localHasta);
    };

    // Despacha el valor real al padre unicamente cuando el usuario termina la edicion
    const despacharGrupoSede = () => {
      if (localGrupoSede !== row.grupo_sede) {
        handleConfigChange(row.indexOriginal, "grupo_sede", localGrupoSede);
      }
    };

    const verificarTecladoGrupoSede = (e) => {
      if (e.key === "Enter") {
        despacharGrupoSede();
        e.target.blur();
      }
    };

    return (
      <tr
        id={`fila-config-${row.indexOriginal}`}
        className={
          row.activo === 0
            ? styles.filaInactivaOpacidad
            : styles.filaActivaNormal
        }
      >
        <td style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={() => toggleEstadoActivo(row.indexOriginal)}
            className={styles.btnFilaToggle}
          >
            <FontAwesomeIcon
              icon={row.activo === 1 ? faToggleOn : faToggleOff}
              style={{ color: row.activo === 1 ? "#16a34a" : "#94a3b8" }}
            />
          </button>
        </td>
        <td>
          <select
            value={row.categoria}
            onChange={(e) =>
              handleConfigChange(row.indexOriginal, "categoria", e.target.value)
            }
          >
            <option value="PDV">PDV</option>
            <option value="ESTANDAR">ESTANDAR</option>
          </select>
        </td>
        <td>
          <select
            value={row.tipo_documento}
            onChange={(e) =>
              handleConfigChange(
                row.indexOriginal,
                "tipo_documento",
                e.target.value,
              )
            }
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
                e.target.value,
              )
            }
          />
        </td>
        <td>
          <input
            type="text"
            data-primer-input="true"
            value={localGrupoSede}
            onChange={(e) => setLocalGrupoSede(e.target.value)}
            onBlur={despacharGrupoSede}
            onKeyDown={verificarTecladoGrupoSede}
          />
        </td>
        <td>
          <input
            type="text"
            value={row.tipo_siesa}
            onChange={(e) =>
              handleConfigChange(
                row.indexOriginal,
                "tipo_siesa",
                e.target.value,
              )
            }
            className={styles.inputShort}
          />
        </td>
        <td>
          <input
            type="text"
            value={row.co_siesa}
            onChange={(e) =>
              handleConfigChange(row.indexOriginal, "co_siesa", e.target.value)
            }
            className={styles.inputShort}
          />
        </td>
        <td>
          <input
            type="text"
            value={row.descripcion}
            onChange={(e) =>
              handleConfigChange(
                row.indexOriginal,
                "descripcion",
                e.target.value,
              )
            }
            className={styles.inputLong}
          />
        </td>
        <td>
          <input
            type="text"
            value={row.prefijos_dian}
            onChange={(e) =>
              handleConfigChange(
                row.indexOriginal,
                "prefijos_dian",
                e.target.value,
              )
            }
            className={styles.inputPrefijos}
          />
        </td>
        <td>
          <input
            type="date"
            value={localDesde}
            onChange={(e) => setLocalDesde(e.target.value)}
            onBlur={despacharFechaDesde}
          />
        </td>
        <td>
          <input
            type="date"
            value={localHasta}
            onChange={(e) => setLocalHasta(e.target.value)}
            onBlur={despacharFechaHasta}
          />
        </td>
        <td>
          <button
            onClick={() => handleRemoveConfigRow(row.indexOriginal)}
            className={styles.btnEliminarRow}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </td>
      </tr>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.row.activo === nextProps.row.activo &&
      prevProps.row.categoria === nextProps.row.categoria &&
      prevProps.row.tipo_documento === nextProps.row.tipo_documento &&
      prevProps.row.sub_bloque === nextProps.row.sub_bloque &&
      prevProps.row.grupo_sede === nextProps.row.grupo_sede &&
      prevProps.row.tipo_siesa === nextProps.row.tipo_siesa &&
      prevProps.row.co_siesa === nextProps.row.co_siesa &&
      prevProps.row.descripcion === nextProps.row.descripcion &&
      prevProps.row.prefijos_dian === nextProps.row.prefijos_dian &&
      prevProps.row.fecha_desde === nextProps.row.fecha_desde &&
      prevProps.row.fecha_hasta === nextProps.row.fecha_hasta
    );
  },
);

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
    const [expandedVigencias, setExpandedVigencias] = useState({});

    useEffect(() => {
      if (ultimoIndexCreado !== null && ultimoIndexCreado !== undefined) {
        const filaObjetivo = configList.find(
          (r) => r.indexOriginal === ultimoIndexCreado,
        );
        if (filaObjetivo) {
          const sedeObj = filaObjetivo.grupo_sede
            ? filaObjetivo.grupo_sede.trim().toUpperCase()
            : "SIN SEDE";
          const vigenciaObj = `${filaObjetivo.fecha_desde} AL ${filaObjetivo.fecha_hasta}`;

          setExpandedSedes((prev) => ({ ...prev, [sedeObj]: true }));
          setExpandedVigencias((prev) => ({
            ...prev,
            [`${sedeObj}_${vigenciaObj}`]: true,
          }));

          setTimeout(() => {
            const elementoFila = document.getElementById(
              `fila-config-${ultimoIndexCreado}`,
            );
            if (elementoFila) {
              elementoFila.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              const inputAEnfocar = elementoFila.querySelector(
                '[data-primer-input="true"]',
              );
              if (inputAEnfocar) inputAEnfocar.focus();
            }
            setUltimoIndexCreado(null);
          }, 60);
        }
      }
    }, [ultimoIndexCreado, configList, setUltimoIndexCreado]);

    return (
      <div className={styles.configContainer}>
        <div className={styles.configHeaderCard}>
          <div>
            <h3>Maestro Central de Parametrizacion</h3>
            <p>Rangos de operacion gobernados por vigencias cronologicas.</p>
          </div>
          <div className={styles.configActionsBox}>
            <button
              onClick={handleAddConfigRow}
              className={styles.btnAgregarRow}
            >
              <FontAwesomeIcon icon={faPlus} /> Agregar Fila
            </button>
            <button
              onClick={ejecutarGuardadoConfig}
              className={styles.btnGuardarCfg}
            >
              <FontAwesomeIcon icon={faSave} /> Guardar Cambios
            </button>
          </div>
        </div>

        {Object.keys(sedesAgrupadas).map((sedeKey) => (
          <div key={sedeKey} className={styles.accordionSedeCard}>
            <div
              onClick={() =>
                setExpandedSedes((p) => ({ ...p, [sedeKey]: !p[sedeKey] }))
              }
              className={styles.accordionSedeHeader}
            >
              <div>
                <FontAwesomeIcon
                  icon={expandedSedes[sedeKey] ? faChevronDown : faChevronRight}
                />{" "}
                SEDE REPORTE: {sedeKey}
              </div>
            </div>
            {expandedSedes[sedeKey] && (
              <div className={styles.accordionSedeContent}>
                {Object.keys(sedesAgrupadas[sedeKey]).map((vKey) => (
                  <div key={vKey} className={styles.accordionVigenciaCard}>
                    <div
                      onClick={() =>
                        setExpandedVigencias((p) => ({
                          ...p,
                          [`${sedeKey}_${vKey}`]: !p[`${sedeKey}_${vKey}`],
                        }))
                      }
                      className={styles.accordionVigenciaHeader}
                    >
                      <div>
                        <FontAwesomeIcon
                          icon={
                            expandedVigencias[`${sedeKey}_${vKey}`]
                              ? faChevronDown
                              : faChevronRight
                          }
                        />{" "}
                        Periodo: {vKey}
                      </div>
                    </div>
                    {expandedVigencias[`${sedeKey}_${vKey}`] && (
                      <div className={styles.tableResponsiveCfg}>
                        <table className={styles.tablaParametros}>
                          <thead>
                            <tr>
                              <th>Est</th>
                              <th>Categoria</th>
                              <th>Comprobante</th>
                              <th>Sub Bloque</th>
                              <th>Sede Reporte</th>
                              <th>Tipo Siesa</th>
                              <th>CO</th>
                              <th>Descripcion</th>
                              <th>Prefijos DIAN</th>
                              <th>Desde</th>
                              <th>Hasta</th>
                              <th>Accion</th>
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
                                  handleRemoveConfigRow={handleRemoveConfigRow}
                                />
                              ) : null;
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  },
);
