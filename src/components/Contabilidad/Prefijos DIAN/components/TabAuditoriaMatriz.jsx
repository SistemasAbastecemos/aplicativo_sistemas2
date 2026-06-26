import React from "react";
import styles from "../PrefijosDian.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";

export const TabAuditoriaMatriz = React.memo(
  ({
    columnas,
    reporte,
    datosDian,
    maestroDianActivo,
    formatMiles,
    diasConciliados = {},
  }) => {
    if (columnas.length === 0 || reporte.length === 0) {
      return (
        <div className={styles.vacioState}>
          <p>
            No hay datos cargados para el rango seleccionado. Ejecuta una
            consulta para visualizar el consolidado.
          </p>
        </div>
      );
    }

    const ordenarResultadosMatriz = (a, b) => {
      const sedeA = a.grupo ? a.grupo.trim().toUpperCase() : "";
      const sedeB = b.grupo ? b.grupo.trim().toUpperCase() : "";
      if (sedeA !== sedeB)
        return sedeA.localeCompare(sedeB, undefined, {
          numeric: true,
          sensitivity: "base",
        });

      const subA = a.sub_bloque ? a.sub_bloque.trim().toUpperCase() : "";
      const subB = b.sub_bloque ? b.sub_bloque.trim().toUpperCase() : "";
      if (subA !== subB) {
        return (
          (subA === "NORMAL" ? 1 : subA === "ALTERNA" ? 2 : 3) -
          (subB === "NORMAL" ? 1 : subB === "ALTERNA" ? 2 : 3)
        );
      }
      return (a.tipo_documento || "").localeCompare(b.tipo_documento || "");
    };

    const registrosPDV = reporte
      .filter((r) => r.bloque === "PDV")
      .sort(ordenarResultadosMatriz);
    const registrosEstandar = reporte
      .filter((r) => r.bloque === "ESTANDAR")
      .sort(ordenarResultadosMatriz);

    const tieneExcel = (col) => {
      return !!datosDian;
    };

    const tieneHistorico = (col) => {
      return !!diasConciliados[col];
    };

    const calcularTotalSiesaPorBloque = (bloque, col) => {
      const fk = col.replace(/-/g, "");
      const conjunto =
        bloque === "TOTAL"
          ? reporte
          : bloque === "PDV"
            ? registrosPDV
            : registrosEstandar;
      return conjunto.reduce(
        (sum, item) => sum + (item.dias[fk]?.total || 0),
        0,
      );
    };

    const evaluarFilaPorColumna = (item, col) => {
      const fk = col.replace(/-/g, "");
      const totalSiesa = item.dias[fk]?.total || 0;

      let totalDianFresco = 0;
      let existeExcel = false;

      if (datosDian) {
        existeExcel = true;
        if (datosDian[fk]) {
          const centroOad = item.co_siesa
            ? String(item.co_siesa).padStart(3, "0")
            : "";
          const reglasAsociadas = maestroDianActivo.filter(
            (r) =>
              String(r.co_siesa).padStart(3, "0") === centroOad &&
              String(r.tipo_siesa).trim().toUpperCase() ===
                String(item.tipo).trim().toUpperCase(),
          );

          reglasAsociadas.forEach((reglaAsoc) => {
            const prefijos = String(reglaAsoc.prefijos_dian || "")
              .split(",")
              .map((x) => x.trim().toUpperCase())
              .filter(Boolean);
            prefijos.forEach((prefijo) => {
              const llaveCompuesta = `${centroOad}_${String(item.tipo).trim().toUpperCase()}_${prefijo}`;
              if (datosDian[fk].totales_compuestos?.[llaveCompuesta]) {
                totalDianFresco +=
                  datosDian[fk].totales_compuestos[llaveCompuesta];
              }
            });
          });
        }
      }

      let totalDianHistorico = null;
      let existeHistorico = false;
      const h = diasConciliados[col];

      if (h) {
        existeHistorico = true;
        if (Array.isArray(h.detalle_filas)) {
          const limpiarCodigo = (cd) =>
            String(cd || "")
              .replace(/^0+/, "")
              .trim();

          const filaGuardada = h.detalle_filas.find(
            (f) =>
              limpiarCodigo(f.co_siesa) === limpiarCodigo(item.co_siesa) &&
              String(f.tipo).trim().toUpperCase() ===
                String(item.tipo).trim().toUpperCase(),
          );

          if (filaGuardada) {
            totalDianHistorico = Number(filaGuardada.total_dian);
          } else {
            totalDianHistorico = 0;
          }
        } else {
          totalDianHistorico = 0;
        }
      }

      return {
        totalSiesa,
        existeExcel,
        totalDianFresco,
        difFresca: totalSiesa - totalDianFresco,
        existeHistorico,
        totalDianHistorico,
        difHistorica:
          totalDianHistorico !== null ? totalSiesa - totalDianHistorico : null,
      };
    };

    return (
      <div className={styles.resultadosCard}>
        <div className={styles.scrollXContainer}>
          <table className={styles.tablaMatriz}>
            <thead>
              <tr>
                <th
                  rowSpan="2"
                  className={`${styles.fixedTh} ${styles.fixedCol1} ${styles.fixedThSede}`}
                >
                  Sede
                </th>
                <th
                  rowSpan="2"
                  className={`${styles.fixedTh} ${styles.fixedCol2} ${styles.fixedThTipo}`}
                >
                  Tipo
                </th>
                <th
                  rowSpan="2"
                  className={`${styles.fixedTh} ${styles.fixedCol3} ${styles.fixedThDesc}`}
                >
                  Descripcion de Comprobante
                </th>
                {columnas.map((col) => {
                  const conExcel = tieneExcel(col);
                  const conHist = tieneHistorico(col);

                  let colSpan = 3;
                  if (conExcel && conHist) colSpan = 5;
                  else if (conExcel || conHist) colSpan = 4;

                  return (
                    <th
                      key={col}
                      colSpan={colSpan}
                      className={`${styles.fechaHeader} ${conHist ? styles.fechaHeaderCerrada : ""}`}
                    >
                      {col}
                      {conHist && (
                        <span
                          className={styles.badgeColumnaCerrada}
                          title="Conciliacion guardada en BD"
                        >
                          {" "}
                          <FontAwesomeIcon icon={faLock} /> guardado
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
              <tr>
                {columnas.map((col, idx) => {
                  const conExcel = tieneExcel(col);
                  const conHist = tieneHistorico(col);
                  return (
                    <React.Fragment key={`sub-headers-${idx}`}>
                      <th className={styles.subHeader}>Inicial</th>
                      <th className={styles.subHeader}>Final</th>
                      <th className={styles.subHeaderCant}>Total Siesa</th>
                      {conExcel && (
                        <th className={styles.subHeaderDian}>
                          Diferencia Actual
                        </th>
                      )}
                      {conHist && (
                        <th
                          className={styles.subHeaderDian}
                          style={{ backgroundColor: "#1e3a8a", color: "#fff" }}
                        >
                          Diferencia Hist. 🔒
                        </th>
                      )}
                    </React.Fragment>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Fila 1: CONSOLIDADO DIARIO GENERAL */}
              <tr className={styles.rowGranTotalFinalTop}>
                <td
                  colSpan="3"
                  className={`${styles.fixedTd} ${styles.fixedCol1} ${styles.tdGranSumLabelTop}`}
                >
                  CONSOLIDADO DIARIO GENERAL (PDV + ESTANDAR)
                </td>
                {columnas.map((col) => {
                  const totalSiesa = calcularTotalSiesaPorBloque("TOTAL", col);
                  const conExcel = tieneExcel(col);
                  const conHist = tieneHistorico(col);

                  const fk = col.replace(/-/g, "");
                  const totalDianExcel =
                    conExcel && datosDian && datosDian[fk]
                      ? datosDian[fk].total_general
                      : 0;
                  const totalDianHist = conHist
                    ? diasConciliados[col].total_dian_general
                    : 0;

                  const difExcel = totalSiesa - totalDianExcel;
                  const difHist = totalSiesa - totalDianHist;

                  return (
                    <React.Fragment key={`gt-${col}`}>
                      <td className={styles.tdVacioFinalTop}></td>
                      <td className={styles.tdVacioFinalTop}></td>
                      <td className={styles.tdGranTotalCellTop}>
                        {formatMiles(totalSiesa)}
                      </td>

                      {conExcel && (
                        <td
                          className={`${styles.tdDiferencia} ${difExcel === 0 ? styles.conciliado : styles.descuadrado}`}
                        >
                          {difExcel === 0
                            ? `✔ 0 (DIAN: ${formatMiles(totalDianExcel)})`
                            : `${formatMiles(difExcel)} (DIAN: ${formatMiles(totalDianExcel)})`}
                        </td>
                      )}
                      {conHist && (
                        <td
                          className={`${styles.tdDiferencia} ${difHist === 0 ? styles.conciliado : styles.descuadrado}`}
                          style={{ fontWeight: "bold" }}
                        >
                          {difHist === 0
                            ? `✔ 0 (HIST: ${formatMiles(totalDianHist)}) 🔒`
                            : `${formatMiles(difHist)} (HIST: ${formatMiles(totalDianHist)}) 🔒`}
                        </td>
                      )}
                    </React.Fragment>
                  );
                })}
              </tr>

              {/* Fila 2: TOTAL COMPROBANTES EMITIDOS EN PUNTOS DE VENTA (PDV) */}
              <tr className={styles.rowResumenPdvTop}>
                <td
                  colSpan="3"
                  className={`${styles.fixedTd} ${styles.fixedCol1} ${styles.tdResumenPdvLabel}`}
                >
                  TOTAL COMPROBANTES EMITIDOS EN PUNTOS DE VENTA (PDV)
                </td>
                {columnas.map((col) => {
                  const totalSiesa = calcularTotalSiesaPorBloque("PDV", col);
                  const conExcel = tieneExcel(col);
                  const conHist = tieneHistorico(col);

                  const fk = col.replace(/-/g, "");
                  const totalDianExcel =
                    conExcel && datosDian && datosDian[fk]
                      ? datosDian[fk].total_pdv
                      : 0;
                  const totalDianHist = conHist
                    ? diasConciliados[col].total_dian_pdv
                    : 0;

                  const difExcel = totalSiesa - totalDianExcel;
                  const difHist = totalSiesa - totalDianHist;

                  return (
                    <React.Fragment key={`pdv-sum-${col}`}>
                      <td className={styles.tdVacioPdvTop}></td>
                      <td className={styles.tdVacioPdvTop}></td>
                      <td className={styles.tdResumenPdvCell}>
                        {formatMiles(totalSiesa)}
                      </td>
                      {conExcel && (
                        <td
                          className={`${styles.tdResumenPdvCellDian} ${difExcel === 0 ? styles.conciliado : styles.descuadrado}`}
                        >
                          {difExcel === 0
                            ? `✔ 0 (DIAN: ${formatMiles(totalDianExcel)})`
                            : `${formatMiles(difExcel)} (DIAN: ${formatMiles(totalDianExcel)})`}
                        </td>
                      )}
                      {conHist && (
                        <td
                          className={`${styles.tdResumenPdvCellDian} ${difHist === 0 ? styles.conciliado : styles.descuadrado}`}
                          style={{ fontStyle: "italic" }}
                        >
                          {difHist === 0
                            ? `✔ 0 (HIST: ${formatMiles(totalDianHist)}) 🔒`
                            : `${formatMiles(difHist)} (HIST: ${formatMiles(totalDianHist)}) 🔒`}
                        </td>
                      )}
                    </React.Fragment>
                  );
                })}
              </tr>

              {/* Fila 3: TOTAL COMPROBANTES FACTURACION ESTANDAR (EST) */}
              <tr className={styles.rowResumenEstTop}>
                <td
                  colSpan="3"
                  className={`${styles.fixedTd} ${styles.fixedCol1} ${styles.tdResumenEstLabel}`}
                >
                  TOTAL COMPROBANTES FACTURACION ESTANDAR (EST)
                </td>
                {columnas.map((col) => {
                  const totalSiesa = calcularTotalSiesaPorBloque(
                    "ESTANDAR",
                    col,
                  );
                  const conExcel = tieneExcel(col);
                  const conHist = tieneHistorico(col);

                  const fk = col.replace(/-/g, "");
                  const totalDianExcel =
                    conExcel && datosDian && datosDian[fk]
                      ? datosDian[fk].total_estandar
                      : 0;
                  const totalDianHist = conHist
                    ? diasConciliados[col].total_dian_est
                    : 0;

                  const difExcel = totalSiesa - totalDianExcel;
                  const difHist = totalSiesa - totalDianHist;

                  return (
                    <React.Fragment key={`est-sum-${col}`}>
                      <td className={styles.tdVacioEstTop}></td>
                      <td className={styles.tdVacioEstTop}></td>
                      <td className={styles.tdResumenEstCell}>
                        {formatMiles(totalSiesa)}
                      </td>
                      {conExcel && (
                        <td
                          className={`${styles.tdResumenEstCellDian} ${difExcel === 0 ? styles.conciliado : styles.descuadrado}`}
                        >
                          {difExcel === 0
                            ? `✔ 0 (DIAN: ${formatMiles(totalDianExcel)})`
                            : `${formatMiles(difExcel)} (DIAN: ${formatMiles(totalDianExcel)})`}
                        </td>
                      )}
                      {conHist && (
                        <td
                          className={`${styles.tdResumenEstCellDian} ${difHist === 0 ? styles.conciliado : styles.descuadrado}`}
                          style={{ fontStyle: "italic" }}
                        >
                          {difHist === 0
                            ? `✔ 0 (HIST: ${formatMiles(totalDianHist)}) 🔒`
                            : `${formatMiles(difHist)} (HIST: ${formatMiles(totalDianHist)}) 🔒`}
                        </td>
                      )}
                    </React.Fragment>
                  );
                })}
              </tr>

              {/* Separador para filas individuales PDV */}
              <tr className={styles.rowSeparadora}>
                <td colSpan={3 + columnas.length * 4}>
                  <div className={styles.stickySeparadorTexto}>
                    BLOQUE COMPROBANTES PUNTOS DE VENTA (PDV)
                  </div>
                </td>
              </tr>

              {/* Mapeo de filas individuales de PDV */}
              {registrosPDV.map((row, rIdx) => (
                <tr
                  key={`pdv-row-${rIdx}`}
                  className={
                    row.sub_bloque === "ALTERNA" ? styles.rowAlternaColor : ""
                  }
                >
                  <td
                    className={`${styles.fixedTd} ${styles.fixedCol1} ${styles.tdGrupo}`}
                  >
                    {row.grupo}
                  </td>
                  <td
                    className={`${styles.fixedTd} ${styles.fixedCol2} ${styles.tdCenter}`}
                  >
                    <span className={styles.badgeTipo}>{row.tipo}</span>
                  </td>
                  <td
                    className={`${styles.fixedTd} ${styles.fixedCol3} ${styles.tdDesc}`}
                  >
                    {row.descripcion}{" "}
                    <small style={{ color: "#64748b" }}>
                      ({row.sub_bloque})
                    </small>
                  </td>
                  {columnas.map((col) => {
                    const fk = col.replace(/-/g, "");
                    const diaData = row.dias[fk] || {
                      inicial: "-",
                      final: "-",
                      total: 0,
                      sin_movimiento: true,
                    };
                    const resFila = evaluarFilaPorColumna(row, col);

                    return (
                      <React.Fragment key={`pdv-data-${col}`}>
                        <td
                          className={`${styles.tdNum} ${diaData.sin_movimiento ? styles.sinMovimientoCelda : ""}`}
                        >
                          {diaData.inicial}
                        </td>
                        <td
                          className={`${styles.tdNum} ${diaData.sin_movimiento ? styles.sinMovimientoCelda : ""}`}
                        >
                          {diaData.final}
                        </td>
                        <td className={styles.tdSiesaCant}>
                          {formatMiles(diaData.total)}
                        </td>

                        {resFila.existeExcel && (
                          <td
                            className={`${styles.tdDiferenciaFila} ${resFila.difFresca === 0 ? styles.conciliadoFila : styles.descuadradoFila}`}
                          >
                            {resFila.difFresca === 0
                              ? `✔ 0 (DIAN: ${formatMiles(resFila.totalDianFresco)})`
                              : `${formatMiles(resFila.difFresca)} (DIAN: ${formatMiles(resFila.totalDianFresco)})`}
                          </td>
                        )}
                        {resFila.existeHistorico && (
                          <td
                            className={`${styles.tdDiferenciaFila} ${resFila.difHistorica === 0 ? styles.conciliadoFila : styles.descuadradoFila}`}
                            style={{ backgroundColor: "#f0fdf4" }}
                          >
                            {resFila.totalDianHistorico !== null ? (
                              resFila.difHistorica === 0 ? (
                                `🔒 ✔ 0 (DIAN: ${formatMiles(resFila.totalDianHistorico)})`
                              ) : (
                                `🔒 ${formatMiles(resFila.difHistorica)} (DIAN: ${formatMiles(resFila.totalDianHistorico)})`
                              )
                            ) : (
                              <span className={styles.textoSinDatosFila}>
                                Sin Snapshot
                              </span>
                            )}
                          </td>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}

              {/* Separador para filas individuales ESTANDAR */}
              <tr className={styles.rowSeparadora}>
                <td colSpan={3 + columnas.length * 4}>
                  <div className={styles.stickySeparadorTexto}>
                    BLOQUE COMPROBANTES FACTURACION ESTANDAR (EST)
                  </div>
                </td>
              </tr>

              {/* Mapeo de filas individuales de ESTANDAR */}
              {registrosEstandar.map((row, rIdx) => (
                <tr
                  key={`est-row-${rIdx}`}
                  className={
                    row.sub_bloque === "ALTERNA" ? styles.rowAlternaColor : ""
                  }
                >
                  <td
                    className={`${styles.fixedTd} ${styles.fixedCol1} ${styles.tdGrupo}`}
                  >
                    {row.grupo}
                  </td>
                  <td
                    className={`${styles.fixedTd} ${styles.fixedCol2} ${styles.tdCenter}`}
                  >
                    <span className={styles.badgeTipo}>{row.tipo}</span>
                  </td>
                  <td
                    className={`${styles.fixedTd} ${styles.fixedCol3} ${styles.tdDesc}`}
                  >
                    {row.descripcion}{" "}
                    <small style={{ color: "#64748b" }}>
                      ({row.sub_bloque})
                    </small>
                  </td>
                  {columnas.map((col) => {
                    const fk = col.replace(/-/g, "");
                    const diaData = row.dias[fk] || {
                      inicial: "-",
                      final: "-",
                      total: 0,
                      sin_movimiento: true,
                    };
                    const resFila = evaluarFilaPorColumna(row, col);

                    return (
                      <React.Fragment key={`est-data-${col}`}>
                        <td
                          className={`${styles.tdNum} ${diaData.sin_movimiento ? styles.sinMovimientoCelda : ""}`}
                        >
                          {diaData.inicial}
                        </td>
                        <td
                          className={`${styles.tdNum} ${diaData.sin_movimiento ? styles.sinMovimientoCelda : ""}`}
                        >
                          {diaData.final}
                        </td>
                        <td className={styles.tdSiesaCant}>
                          {formatMiles(diaData.total)}
                        </td>

                        {resFila.existeExcel && (
                          <td
                            className={`${styles.tdDiferenciaFila} ${resFila.difFresca === 0 ? styles.conciliadoFila : styles.descuadradoFila}`}
                          >
                            {resFila.difFresca === 0
                              ? `✔ 0 (DIAN: ${formatMiles(resFila.totalDianFresco)})`
                              : `${formatMiles(resFila.difFresca)} (DIAN: ${formatMiles(resFila.totalDianFresco)})`}
                          </td>
                        )}
                        {resFila.existeHistorico && (
                          <td
                            className={`${styles.tdDiferenciaFila} ${resFila.difHistorica === 0 ? styles.conciliadoFila : styles.descuadradoFila}`}
                            style={{ backgroundColor: "#f0fdf4" }}
                          >
                            {resFila.totalDianHistorico !== null ? (
                              resFila.difHistorica === 0 ? (
                                `🔒 ✔ 0 (DIAN: ${formatMiles(resFila.totalDianHistorico)})`
                              ) : (
                                `🔒 ${formatMiles(resFila.difHistorica)} (DIAN: ${formatMiles(resFila.totalDianHistorico)})`
                              )
                            ) : (
                              <span className={styles.textoSinDatosFila}>
                                Sin Snapshot
                              </span>
                            )}
                          </td>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);
