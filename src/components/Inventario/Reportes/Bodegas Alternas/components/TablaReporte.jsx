import React from "react";
import styles from "../BodegasAlternas.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";

const TablaReporte = React.memo(({ datos, estructuras }) => {
  const { bodegas02, bodegasAlt } = estructuras;
  const hayB02 = Array.isArray(bodegas02) && bodegas02.length > 0;

  if (!datos || !Array.isArray(datos) || datos.length === 0) {
    return (
      <div className={styles.estadoVacioContainer}>
        No se registran datos para mostrar. Modifique las variables de entrada e
        inicie la consulta.
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
              {bodegasAlt.length > 0 && (
                <th colSpan={bodegasAlt.length}>BODEGAS ALTERNAS</th>
              )}
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

                {/* Columnas Dinámicas Pisos de Venta */}
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

                {/* Totales Consolidados */}
                {hayB02 && (
                  <>
                    <td
                      className={styles.numeroAlineado}
                      style={{ fontWeight: "600" }}
                    >
                      {Number(item.Total_Exist_Und_B02 || 0).toLocaleString()}
                    </td>
                    <td
                      className={styles.numeroAlineado}
                      style={{ fontWeight: "600" }}
                    >
                      {Number(item.Total_Venta_Und || 0).toLocaleString()}
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
                  {Number(item.Total_Exist_Und_Alternas || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

TablaReporte.displayName = "TablaReporte";
export default TablaReporte;
