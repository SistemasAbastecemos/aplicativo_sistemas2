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
      if (subA !== subB)
        return (subA === "NORMAL" ? 1 : 2) - (subB === "NORMAL" ? 1 : 2);
      return (a.tipo || "").localeCompare(b.tipo || "");
    };

    const registrosPDV = reporte
      .filter((r) => r.bloque === "PDV")
      .sort(ordenarResultadosMatriz);
    const registrosEstandar = reporte
      .filter((r) => r.bloque === "ESTANDAR")
      .sort(ordenarResultadosMatriz);

    const evaluarFilaPorColumna = (item, col) => {
      const fk = col.replace(/-/g, "");
      const totalSiesa = item.dias?.[fk]?.total || 0;
      let totalDianFresco = 0;
      let existeExcel = !!datosDian;

      if (datosDian && datosDian[fk]) {
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

      let totalDianHistorico = null;
      let existeHistorico = false;
      const snapshotDia = diasConciliados[col];

      if (snapshotDia && Array.isArray(snapshotDia.detalle_filas)) {
        existeHistorico = true;
        const limpiarCodigo = (cd) =>
          String(cd || "")
            .replace(/^0+/, "")
            .trim();
        const filaGuardada = snapshotDia.detalle_filas.find(
          (f) =>
            limpiarCodigo(f.co_siesa) === limpiarCodigo(item.co_siesa) &&
            String(f.tipo).trim().toUpperCase() ===
              String(item.tipo).trim().toUpperCase(),
        );
        totalDianHistorico = filaGuardada ? Number(filaGuardada.total_dian) : 0;
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

    const obtenerTotalesColumnaBloque = (conjuntoFilas, col) => {
      let acumuladoSiesa = 0;
      let acumuladoDianFresco = 0;
      let acumuladoDianHist = 0;
      let tieneHist = !!diasConciliados[col];

      conjuntoFilas.forEach((row) => {
        const res = evaluarFilaPorColumna(row, col);
        acumuladoSiesa += res.totalSiesa;
        acumuladoDianFresco += res.totalDianFresco;
        if (res.totalDianHistorico !== null)
          acumuladoDianHist += res.totalDianHistorico;
      });

      return {
        siesa: acumuladoSiesa,
        dianFresco: acumuladoDianFresco,
        difFresco: acumuladoSiesa - acumuladoDianFresco,
        dianHist: acumuladoDianHist,
        difHist: acumuladoSiesa - acumuladoDianHist,
        tieneHist,
      };
    };

    return (
      <div className={styles.resultadosCard}>
        <div className={styles.scrollXContainer}>
          <table className={styles.appleMatrixTable}>
            <thead>
              <tr>
                <th rowSpan="2" className={styles.stickyColSede}>
                  Sede
                </th>
                <th rowSpan="2" className={styles.stickyColTipo}>
                  Tipo
                </th>
                <th
                  rowSpan="2"
                  className={styles.stickyColDesc}
                  style={{ borderRight: "2px solid #cbd5e1" }}
                >
                  Descripción de Comprobante
                </th>
                {columnas.map((col) => {
                  const conExcel = !!datosDian;
                  const conHist = !!diasConciliados[col];
                  let colSpan = 3;
                  if (conExcel && conHist) colSpan = 5;
                  else if (conExcel || conHist) colSpan = 4;

                  return (
                    <th
                      key={col}
                      colSpan={colSpan}
                      className={`${styles.fechaHeader} ${conHist ? styles.fechaHeaderCerrada : ""}`}
                    >
                      <div className={styles.flexThHeaderContainer}>
                        <span>{col}</span>
                        {conHist && (
                          <span className={styles.badgeColumnaCerrada}>
                            <FontAwesomeIcon icon={faLock} /> guardado
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
              <tr>
                {columnas.map((col, idx) => (
                  <React.Fragment key={`sh-${idx}`}>
                    <th className={styles.thSubHeaderMonto}>Inicial</th>
                    <th className={styles.thSubHeaderMonto}>Final</th>
                    <th className={styles.thSubHeaderMonto}>Total Siesa</th>
                    {!!datosDian && (
                      <th className={styles.thSubHeaderDiferencia}>
                        Diferencia Actual
                      </th>
                    )}
                    {!!diasConciliados[col] && (
                      <th className={styles.thSubHeaderSnapshot}>
                        Diferencia Hist. 🔒
                      </th>
                    )}
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* FILA 1 DE TOTALES EN EL TOPE: CONSOLIDADO DIARIO GENERAL */}
              <tr className={styles.rowGranTotalFinalTop}>
                <td
                  colSpan="3"
                  className={`${styles.stickyColumnLeft} ${styles.tdGranSumLabelTop}`}
                >
                  CONSOLIDADO DIARIO GENERAL (PDV + ESTANDAR)
                </td>
                {columnas.map((col) => {
                  const tPdv = obtenerTotalesColumnaBloque(registrosPDV, col);
                  const tEst = obtenerTotalesColumnaBloque(
                    registrosEstandar,
                    col,
                  );

                  const siesaGen = tPdv.siesa + tEst.siesa;
                  const frescoGen = tPdv.dianFresco + tEst.dianFresco;
                  const histGen = tPdv.dianHist + tEst.dianHist;

                  const difFrescaGen = siesaGen - frescoGen;
                  const difHistGen = siesaGen - histGen;

                  return (
                    <React.Fragment key={`gt-${col}`}>
                      <td className={styles.tdFilaTotalGeneralBase}>—</td>
                      <td className={styles.tdFilaTotalGeneralBase}>—</td>
                      <td className={styles.tdMontoGeneralValTop}>
                        {formatMiles(siesaGen)}
                      </td>

                      {/* Diferencia Fresca General */}
                      {!!datosDian && (
                        <td
                          className={`${styles.tdDiferenciaFila} ${difFrescaGen === 0 ? styles.conciliadoFilaTop : styles.descuadradoFilaTop}`}
                        >
                          {difFrescaGen === 0
                            ? `✔ 0`
                            : formatMiles(difFrescaGen)}
                          <span className={styles.lblDianSubVolumenTop}>
                            {" "}
                            (DIAN: {formatMiles(frescoGen)})
                          </span>
                        </td>
                      )}

                      {/* Diferencia Histórica General */}
                      {!!diasConciliados[col] && (
                        <td
                          className={`${styles.tdDiferenciaFila} ${difHistGen === 0 ? styles.conciliadoFilaTop : styles.descuadradoFilaTop}`}
                        >
                          🔒{" "}
                          {difHistGen === 0 ? `✔ 0` : formatMiles(difHistGen)}
                          <span className={styles.lblDianSubVolumenTop}>
                            {" "}
                            (DIAN: {formatMiles(histGen)})
                          </span>
                        </td>
                      )}
                    </React.Fragment>
                  );
                })}
              </tr>

              {/* FILA 2 DE TOTALES EN EL TOPE: TOTAL COMPROBANTES EMITIDOS EN PUNTOS DE VENTA (PDV) */}
              <tr className={styles.rowSubtotalBloqueTopHeader}>
                <td
                  colSpan="3"
                  className={`${styles.stickyColumnLeft} ${styles.tdLabelSubtotalTop}`}
                >
                  TOTAL COMPROBANTES EMITIDOS EN PUNTOS DE VENTA (PDV)
                </td>
                {columnas.map((col) => {
                  const tBlk = obtenerTotalesColumnaBloque(registrosPDV, col);
                  return (
                    <React.Fragment key={`subtop-pdv-${col}`}>
                      <td className={styles.tdFilaTotalSubTopBase}>—</td>
                      <td className={styles.tdFilaTotalSubTopBase}>—</td>
                      <td className={styles.tdMontoSubtotalValTop}>
                        {formatMiles(tBlk.siesa)}
                      </td>
                      {!!datosDian && (
                        <td
                          className={`${styles.tdDiferenciaFila} ${tBlk.difFresco === 0 ? styles.conciliadoFila : styles.descuadradoFila}`}
                        >
                          {tBlk.difFresco === 0
                            ? `✔ 0 (DIAN: ${formatMiles(tBlk.dianFresco)})`
                            : `${formatMiles(tBlk.difFresco)} (DIAN: ${formatMiles(tBlk.dianFresco)})`}
                        </td>
                      )}
                      {tBlk.tieneHist && (
                        <td
                          className={`${styles.tdDiferenciaFila} ${tBlk.difHist === 0 ? styles.conciliadoFila : styles.descuadradoFila}`}
                        >
                          {tBlk.difHist === 0
                            ? `🔒 ✔ 0 (DIAN: ${formatMiles(tBlk.dianHist)})`
                            : `🔒 ${formatMiles(tBlk.difHist)} (DIAN: ${formatMiles(tBlk.dianHist)})`}
                        </td>
                      )}
                    </React.Fragment>
                  );
                })}
              </tr>

              {/* FILA 3 DE TOTALES EN EL TOPE: TOTAL COMPROBANTES FACTURACION ESTANDAR (EST) */}
              <tr className={styles.rowSubtotalBloqueTopHeader}>
                <td
                  colSpan="3"
                  className={`${styles.stickyColumnLeft} ${styles.tdLabelSubtotalTop}`}
                >
                  TOTAL COMPROBANTES FACTURACION ESTANDAR (EST)
                </td>
                {columnas.map((col) => {
                  const tBlk = obtenerTotalesColumnaBloque(
                    registrosEstandar,
                    col,
                  );
                  return (
                    <React.Fragment key={`subtop-est-${col}`}>
                      <td className={styles.tdFilaTotalSubTopBase}>—</td>
                      <td className={styles.tdFilaTotalSubTopBase}>—</td>
                      <td className={styles.tdMontoSubtotalValTop}>
                        {formatMiles(tBlk.siesa)}
                      </td>
                      {!!datosDian && (
                        <td
                          className={`${styles.tdDiferenciaFila} ${tBlk.difFresco === 0 ? styles.conciliadoFila : styles.descuadradoFila}`}
                        >
                          {tBlk.difFresco === 0
                            ? `✔ 0 (DIAN: ${formatMiles(tBlk.dianFresco)})`
                            : `${formatMiles(tBlk.difFresco)} (DIAN: ${formatMiles(tBlk.dianFresco)})`}
                        </td>
                      )}
                      {tBlk.tieneHist && (
                        <td
                          className={`${styles.tdDiferenciaFila} ${tBlk.difHist === 0 ? styles.conciliadoFila : styles.descuadradoFila}`}
                        >
                          {tBlk.difHist === 0
                            ? `🔒 ✔ 0 (DIAN: ${formatMiles(tBlk.dianHist)})`
                            : `🔒 ${formatMiles(tBlk.difHist)} (DIAN: ${formatMiles(tBlk.dianHist)})`}
                        </td>
                      )}
                    </React.Fragment>
                  );
                })}
              </tr>

              {/* DESGLOSE SECCIONAL: DETALLE INDIVIDUAL PDV */}
              <tr className={styles.subTabGroupBlock}>
                <td
                  colSpan={3 + columnas.length * 5}
                  className={styles.categoryDividerLabel}
                >
                  <span className={styles.stickySectionLabel}>
                    DETALLE PUNTOS DE VENTA (PDV)
                  </span>
                </td>
              </tr>
              {registrosPDV.map((row, rIdx) => (
                <tr key={`pdv-${rIdx}`}>
                  <td className={styles.stickyColSede}>{row.grupo}</td>
                  <td className={styles.stickyColTipo}>
                    <span className={styles.textCodeBadge}>{row.tipo}</span>
                  </td>
                  <td
                    className={styles.stickyColDesc}
                    style={{ borderRight: "2px solid #cbd5e1" }}
                  >
                    {row.descripcion}
                  </td>
                  {columnas.map((col) => {
                    const fk = col.replace(/-/g, "");
                    const diaData = row.dias?.[fk] || {
                      inicial: "-",
                      final: "-",
                      total: 0,
                    };
                    const resFila = evaluarFilaPorColumna(row, col);
                    return (
                      <React.Fragment key={`cell-pdv-${col}`}>
                        <td>{diaData.inicial}</td>
                        <td>{diaData.final}</td>
                        <td style={{ fontWeight: "600" }}>
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
                          >
                            {resFila.difHistorica === 0
                              ? `🔒 ✔ 0 (DIAN: ${formatMiles(resFila.totalDianHistorico)})`
                              : `🔒 ${formatMiles(resFila.difHistorica)} (DIAN: ${formatMiles(resFila.totalDianHistorico)})`}
                          </td>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}

              {/* DESGLOSE SECCIONAL: DETALLE INDIVIDUAL ESTANDAR */}
              <tr className={styles.subTabGroupBlock}>
                <td
                  colSpan={3 + columnas.length * 5}
                  className={styles.categoryDividerLabel}
                >
                  <span className={styles.stickySectionLabel}>
                    DETALLE FACTURACIÓN ESTÁNDAR (EST)
                  </span>
                </td>
              </tr>
              {registrosEstandar.map((row, rIdx) => (
                <tr key={`est-${rIdx}`}>
                  <td className={styles.stickyColSede}>{row.grupo}</td>
                  <td className={styles.stickyColTipo}>
                    <span className={styles.textCodeBadge}>{row.tipo}</span>
                  </td>
                  <td className={styles.stickyColDesc}>{row.descripcion}</td>
                  {columnas.map((col) => {
                    const fk = col.replace(/-/g, "");
                    const diaData = row.dias?.[fk] || {
                      inicial: "-",
                      final: "-",
                      total: 0,
                    };
                    const resFila = evaluarFilaPorColumna(row, col);
                    return (
                      <React.Fragment key={`cell-est-${col}`}>
                        <td>{diaData.inicial}</td>
                        <td>{diaData.final}</td>
                        <td style={{ fontWeight: "600" }}>
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
                          >
                            {resFila.difHistorica === 0
                              ? `🔒 ✔ 0 (DIAN: ${formatMiles(resFila.totalDianHistorico)})`
                              : `🔒 ${formatMiles(resFila.difHistorica)} (DIAN: ${formatMiles(resFila.totalDianHistorico)})`}
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

TabAuditoriaMatriz.displayName = "TabAuditoriaMatriz";
