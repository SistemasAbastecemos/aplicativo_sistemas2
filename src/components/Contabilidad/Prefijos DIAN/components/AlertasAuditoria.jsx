import React, { useState, useMemo, useEffect } from "react";
import styles from "../PrefijosDian.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
  faChevronLeft,
  faExclamationTriangle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

export const AlertasAuditoria = React.memo(
  ({
    alertasSiesaHuerfanos,
    documentosFaltantesDian,
    datosDian,
    formatMiles,
  }) => {
    const [expandSiesa, setExpandSiesa] = useState(false);
    const [expandDian, setExpandDian] = useState(false);

    // Estados independientes de paginacion local
    const [pageSiesa, setPageSiesa] = useState(1);
    const [pageDian, setPageDian] = useState(1);
    const elementosPorPagina = 5; // Cuota fija para evitar desbordamiento vertical

    // Resetea a la primera pagina si los datasets aguas arriba cambian de tamano
    useEffect(() => {
      setPageSiesa(1);
    }, [alertasSiesaHuerfanos.length]);
    useEffect(() => {
      setPageDian(1);
    }, [documentosFaltantesDian.length]);

    // Segmentacion reactiva de registros Siesa
    const totalPagesSiesa =
      Math.ceil(alertasSiesaHuerfanos.length / elementosPorPagina) || 1;
    const paginatedSiesa = useMemo(() => {
      const inicio = (pageSiesa - 1) * elementosPorPagina;
      return alertasSiesaHuerfanos.slice(inicio, inicio + elementosPorPagina);
    }, [alertasSiesaHuerfanos, pageSiesa]);

    // Segmentacion reactiva de registros DIAN
    const totalPagesDian =
      Math.ceil(documentosFaltantesDian.length / elementosPorPagina) || 1;
    const paginatedDian = useMemo(() => {
      const inicio = (pageDian - 1) * elementosPorPagina;
      return documentosFaltantesDian.slice(inicio, inicio + elementosPorPagina);
    }, [documentosFaltantesDian, pageDian]);

    return (
      <>
        {alertasSiesaHuerfanos.length > 0 && (
          <div className={`${styles.alertContainer} ${styles.alertSiesa}`}>
            <div
              className={styles.alertHeader}
              onClick={() => setExpandSiesa(!expandSiesa)}
            >
              <div className={styles.alertHeaderTitleWrapper}>
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className={styles.alertIconSiesa}
                />
                <h4>
                  Documentos Detectados en Siesa sin Parametrización (
                  {alertasSiesaHuerfanos.length})
                </h4>
              </div>
              <button type="button" className={styles.btnExpand}>
                <FontAwesomeIcon
                  icon={expandSiesa ? faChevronDown : faChevronRight}
                />{" "}
                {expandSiesa ? "Contraer" : "Expandir"}
              </button>
            </div>

            <p className={styles.alertSiesaText}>
              Los siguientes tipos registraron movimientos en Siesa, pero no
              están incluidos en tu configuración actual.
            </p>

            {expandSiesa && (
              <div className={styles.alertContent}>
                <table className={styles.alertSiesaTable}>
                  <thead>
                    <tr className={styles.alertSiesaThRow}>
                      <th>Origen Tabla Siesa</th>
                      <th>Tipo Doc</th>
                      <th>CO</th>
                      <th>Fecha</th>
                      <th>Documentos Emitidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSiesa.map((h, idx) => (
                      <tr key={idx} className={styles.alertSiesaTdRow}>
                        <td>{h.origen}</td>
                        <td>{h.tipo}</td>
                        <td>{h.co}</td>
                        <td>{h.fecha}</td>
                        <td>{formatMiles(h.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Controles de paginacion interna de Siesa */}
                {totalPagesSiesa > 1 && (
                  <div className={styles.paginationAlertsWrapper}>
                    <button
                      type="button"
                      disabled={pageSiesa === 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPageSiesa((p) => Math.max(p - 1, 1));
                      }}
                      className={styles.btnPageAlert}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} /> Anterior
                    </button>
                    <span className={styles.infoPageAlert}>
                      Página <strong>{pageSiesa}</strong> de {totalPagesSiesa}
                    </span>
                    <button
                      type="button"
                      disabled={pageSiesa === totalPagesSiesa}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPageSiesa((p) => Math.min(p + 1, totalPagesSiesa));
                      }}
                      className={styles.btnPageAlert}
                    >
                      Siguiente <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {datosDian && documentosFaltantesDian.length > 0 && (
          <div className={`${styles.alertContainer} ${styles.alertDian}`}>
            <div
              className={styles.alertHeader}
              onClick={() => setExpandDian(!expandDian)}
            >
              <div className={styles.alertHeaderTitleWrapper}>
                <div className={styles.alertDianBadge}>
                  <FontAwesomeIcon icon={faExclamationCircle} /> Alerta Crítica
                </div>
                <h4 className={styles.alertDianTitle}>
                  Documentos Timbrados en la DIAN sin Parametrización en el
                  Sistema ({documentosFaltantesDian.length})
                </h4>
              </div>
              <button type="button" className={styles.btnExpand}>
                <FontAwesomeIcon
                  icon={expandDian ? faChevronDown : faChevronRight}
                />{" "}
                {expandDian ? "Contraer" : "Expandir"}
              </button>
            </div>

            {expandDian && (
              <div className={styles.alertContent}>
                <table className={styles.alertDianTable}>
                  <thead>
                    <tr className={styles.alertDianThRow}>
                      <th>Prefijo</th>
                      <th>Comprobante Oficial</th>
                      <th>Transacciones Omitidas</th>
                      <th>Fecha Muestra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDian.map((item, idx) => (
                      <tr key={idx} className={styles.alertDianTdRow}>
                        <td>{item.prefijo}</td>
                        <td>{item.tipo_documento}</td>
                        <td>{formatMiles(item.total_timbrados)}</td>
                        <td>{item.fecha_muestra}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Controles de paginacion interna de la DIAN */}
                {totalPagesDian > 1 && (
                  <div className={styles.paginationAlertsWrapper}>
                    <button
                      type="button"
                      disabled={pageDian === 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPageDian((p) => Math.max(p - 1, 1));
                      }}
                      className={styles.btnPageAlert}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} /> Anterior
                    </button>
                    <span className={styles.infoPageAlert}>
                      Página <strong>{pageDian}</strong> de {totalPagesDian}
                    </span>
                    <button
                      type="button"
                      disabled={pageDian === totalPagesDian}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPageDian((p) => Math.min(p + 1, totalPagesDian));
                      }}
                      className={styles.btnPageAlert}
                    >
                      Siguiente <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </>
    );
  },
);

AlertasAuditoria.displayName = "AlertasAuditoria";
