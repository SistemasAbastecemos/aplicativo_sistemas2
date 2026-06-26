import React from "react";
import styles from "../BodegasAlternas.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";

const TablaResultadosAlternas = ({ datos, estructuras }) => {
  const { bodegas02, bodegasAlt } = estructuras;

  // Si no hay bodegas de venta 02 activas/parametrizadas, se ocultan las
  // columnas "Total Exist B02" y "Total Venta M-1".
  const hayB02 = Array.isArray(bodegas02) && bodegas02.length > 0;

  if (!datos || datos.length === 0) {
    return (
      <div
        className={styles.tarjetaFiltros}
        style={{ textAlign: "center", padding: "40px", color: "#64748B" }}
      >
        <FontAwesomeIcon
          icon={faFolderOpen}
          size="2x"
          style={{ marginBottom: "12px", color: "#CBD5E1" }}
        />
        <p style={{ margin: 0, fontSize: "14px" }}>
          No hay datos disponibles para el periodo seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.contenedorTablaMaestra}>
      <div className={styles.tablaResponsivaWrapper}>
        <table className={styles.tablaMatricial}>
          <thead>
            {/* Nivel 1: Agrupaciones de Columnas */}
            <tr>
              <th rowSpan={2} style={{ zIndex: 30 }}>
                Item
              </th>
              <th rowSpan={2} style={{ zIndex: 30 }}>
                Descripción
              </th>
              <th rowSpan={2} style={{ zIndex: 30 }}>
                Embalaje
              </th>
              {bodegas02.map((b) => (
                <th key={`group-b02-${b}`} colSpan={2}>
                  SEDE {b.slice(0, 3)} ({b})
                </th>
              ))}
              {bodegasAlt.length > 0 ? (
                <th colSpan={bodegasAlt.length}>BODEGAS ALTERNAS</th>
              ) : null}
              <th colSpan={hayB02 ? 3 : 1}>TOTALES GENERALES</th>
            </tr>
            {/* Nivel 2: Sub-métricas por Columna */}
            <tr>
              {bodegas02.map((b) => (
                <React.Fragment key={`sub-b02-${b}`}>
                  <th>Exist. Und</th>
                  <th>Venta M-1</th>
                </React.Fragment>
              ))}
              {bodegasAlt.map((a) => (
                <th key={`sub-alt-${a}`}>{a}</th>
              ))}
              {hayB02 && (
                <>
                  <th>Total Exist B02</th>
                  <th>Total Venta M-1</th>
                </>
              )}
              <th>Total Alt.</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((item, idx) => (
              <tr key={`${item.Item}-${idx}`}>
                <td className={styles.textoDestacado}>{item.Item}</td>
                <td>{item.Descripcion}</td>
                <td style={{ color: "#64748B" }}>{item.Embalaje || "N/A"}</td>

                {/* Columnas Dinámicas Pisos de Venta (Cantidades físicas) */}
                {bodegas02.map((b) => (
                  <React.Fragment key={`cell-b02-${b}-${idx}`}>
                    <td className={styles.numeroAlineado}>
                      {(item[`Existencia_Und_${b}`] || 0).toLocaleString()}
                    </td>
                    <td className={styles.numeroAlineado}>
                      {(item[`Venta_Und_${b}`] || 0).toLocaleString()}
                    </td>
                  </React.Fragment>
                ))}

                {/* Columnas Dinámicas Bodegas Alternas */}
                {bodegasAlt.map((a) => (
                  <td
                    key={`cell-alt-${a}-${idx}`}
                    className={styles.numeroAlineado}
                    style={{ color: "#475569" }}
                  >
                    {(item[`Exist_${a}`] || 0).toLocaleString()}
                  </td>
                ))}

                {/* Totales Consolidados por Ítem */}
                {hayB02 && (
                  <>
                    <td
                      className={styles.numeroAlineado}
                      style={{ fontWeight: "600" }}
                    >
                      {Number(item.Total_Exist_Und_B02).toLocaleString()}
                    </td>
                    <td
                      className={styles.numeroAlineado}
                      style={{ fontWeight: "600" }}
                    >
                      {Number(item.Total_Venta_Und).toLocaleString()}
                    </td>
                  </>
                )}
                <td
                  className={styles.numeroAlineado}
                  style={{
                    fontWeight: "700",
                    color: "#B91C1C",
                    backgroundColor: "#FEF2F2",
                  }}
                >
                  {Number(item.Total_Exist_Und_Alternas).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaResultadosAlternas;
