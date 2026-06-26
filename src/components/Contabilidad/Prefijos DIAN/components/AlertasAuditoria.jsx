import React, { useState } from "react";
import styles from "../PrefijosDian.module.css";

export const AlertasAuditoria = React.memo(
  ({
    alertasSiesaHuerfanos,
    documentosFaltantesDian,
    datosDian,
    formatMiles,
  }) => {
    const [expandSiesa, setExpandSiesa] = useState(false);
    const [expandDian, setExpandDian] = useState(false);

    return (
      <>
        {alertasSiesaHuerfanos.length > 0 && (
          <div className={`${styles.alertContainer} ${styles.alertSiesa}`}>
            <div
              className={styles.alertHeader}
              onClick={() => setExpandSiesa(!expandSiesa)}
            >
              <h4>
                ⚠️ Documentos Detectados en Siesa sin Parametrizacion (
                {alertasSiesaHuerfanos.length})
              </h4>
              <p className={styles.alertSiesaText}>
                Los siguientes tipos de documentos registraron movimientos en
                Siesa durante el periodo consultado, pero no estan incluidos en
                tu configuracion actual. Esto causara diferencias ficticias en
                los totales superiores.
              </p>
              <button className={styles.btnExpand}>
                {expandSiesa ? "Contraer" : "Expandir"}
              </button>
            </div>
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
                    {alertasSiesaHuerfanos.map((h, idx) => (
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
              <div className={styles.alertDianHeaderBox}>
                <div className={styles.alertDianBadge}>
                  ALERTA CRITICA DE CONTROL ({documentosFaltantesDian.length})
                </div>
                <h4 className={styles.alertDianTitle}>
                  Documentos Timbrados en la DIAN sin Parametrizacion en el
                  Sistema
                </h4>
                <p className={styles.alertDianText}>
                  Los siguientes prefijos registran transacciones autorizadas
                  ante la DIAN, pero no se encuentran mapeados en el Maestro de
                  Configuracion. Esto puede significar que se estan emitiendo
                  documentos electronicos usando resoluciones vencidas, o tipos
                  de documentos no configurados para transmision.
                </p>
              </div>

              <button className={styles.btnExpand}>
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
                    {documentosFaltantesDian.map((item, idx) => (
                      <tr key={idx} className={styles.alertDianTdRow}>
                        <td>{item.prefijo}</td>
                        <td>{item.tipo_documento}</td>
                        <td>{formatMiles(item.total_timbrados)}</td>
                        <td>{item.fecha_muestra}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </>
    );
  },
);
