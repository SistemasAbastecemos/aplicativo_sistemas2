import React, { useState, useMemo } from "react";
import styles from "./BodegasAlternas.module.css";
import { apiService } from "../../../../services/api";
import LoadingScreen from "../../../UI/LoadingScreen";
import logoImage from "../../../../assets/images/logo.png";
import { useNotification } from "../../../../contexts/NotificationContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWarehouse,
  faFileExcel,
  faTable,
  faCogs,
  faCalendarAlt,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import TabParametrizacion from "./components/TabParametrizacion";
import TablaResultadosAlternas from "./components/TablaResultados";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const BodegasAlternas = () => {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("analitica");
  const [reporteData, setReporteData] = useState([]);

  const fechaActual = new Date();
  const mesActualStr = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, "0")}`;
  const [lapsoCalendario, setLapsoCalendario] = useState(mesActualStr);

  const handleConsultarReporte = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const lapsoLimpio = lapsoCalendario.replace("-", "");
      const res = await apiService.obtenerReporteBodegasAlternas(lapsoLimpio);
      const apiData = res.resultado ? res.resultado : res;

      if (apiData.success) {
        setReporteData(apiData.data || []);
        addNotification({
          type: "success",
          message: `Datos procesados. ${apiData.data.length} registros cargados.`,
        });
      } else {
        throw new Error(apiData.message || "Error al compilar matrices.");
      }
    } catch (err) {
      addNotification({ type: "error", message: err.message });
      setReporteData([]);
    } finally {
      setLoading(false);
    }
  };

  const estructurasColumnas = useMemo(() => {
    if (reporteData.length === 0) return { bodegas02: [], bodegasAlt: [] };
    const primerRegistro = reporteData[0];
    const llaves = Object.keys(primerRegistro);

    const b02 = [];
    const bAlt = [];

    llaves.forEach((key) => {
      if (key.startsWith("Existencia_Und_")) {
        b02.push(key.replace("Existencia_Und_", ""));
      }
      if (key.startsWith("Exist_")) {
        bAlt.push(key.replace("Exist_", ""));
      }
    });
    return { bodegas02: b02, bodegasAlt: bAlt };
  }, [reporteData]);

  const handleExportarExcel = async () => {
    if (reporteData.length === 0) return;
    setLoading(true);

    try {
      const { bodegas02, bodegasAlt } = estructurasColumnas;
      // Si no hay bodegas de venta 02 activas, se omiten las columnas de totales B02
      const hayB02 = Array.isArray(bodegas02) && bodegas02.length > 0;
      const libroTrabajo = new ExcelJS.Workbook();
      const hojaTrabajo = libroTrabajo.addWorksheet("Bodegas Alternas");

      // 1. Estructurar el arreglo plano de nombres legibles para los encabezados (Fila 6)
      const columnasTabla = ["Item", "Descripción", "Embalaje"];
      bodegas02.forEach((b) => {
        columnasTabla.push(`Existencia Und ${b}`);
        columnasTabla.push(`Venta Und ${b}`);
      });
      bodegasAlt.forEach((a) => {
        columnasTabla.push(`Exist ${a}`);
      });
      if (hayB02) {
        columnasTabla.push("Total Exist Und B02", "Total Venta Und");
      }
      columnasTabla.push("Total Exist Und Alternas");

      // 2. Definición básica y segura de la colección de columnas
      const columnasConfiguradas = columnasTabla.map((col) => {
        return {
          header: col,
          key: col.replace(/[^a-zA-Z0-9_]/g, "_"),
        };
      });
      hojaTrabajo.columns = columnasConfiguradas;

      // 3. Renderizado y formateo del Banner Corporativo Superior (Filas 1 a 4)
      for (let r = 1; r <= 4; r++) {
        hojaTrabajo.getRow(r).height = r === 1 ? 26 : 20;
        for (let c = 1; c <= columnasTabla.length; c++) {
          hojaTrabajo.getCell(r, c).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF2F9F6" },
          };
        }
      }

      // 4. Inyección controlada y segura del Logo Comercial
      try {
        if (logoImage) {
          const logoRes = await fetch(logoImage);
          if (logoRes.ok) {
            const bufferImg = await logoRes.arrayBuffer();
            const logoId = libroTrabajo.addImage({
              buffer: bufferImg,
              extension: "png",
            });

            hojaTrabajo.addImage(logoId, {
              tl: { col: 0.1, row: 0.2 },
              ext: { width: 228, height: 88 },
              editAs: "oneCell",
            });
          }
        }
      } catch (e) {
        console.warn(
          "Aviso: No se pudo incrustar el logo en el archivo Excel:",
          e,
        );
      }

      // 5. Escritura de títulos institucionales de Supermercado Belalcázar
      hojaTrabajo.mergeCells(1, 3, 1, columnasTabla.length);
      hojaTrabajo.mergeCells(2, 3, 2, columnasTabla.length);
      hojaTrabajo.mergeCells(3, 3, 3, columnasTabla.length);

      const cellT1 = hojaTrabajo.getCell(1, 3);
      cellT1.value = "SUPERMERCADO BELALCAZAR - ABASTECEMOS DE OCCIDENTE S.A.S";
      cellT1.font = {
        name: "Arial",
        size: 14,
        bold: true,
        color: { argb: "FF009B6D" },
      };
      cellT1.alignment = { vertical: "middle", horizontal: "left" };

      const cellT2 = hojaTrabajo.getCell(2, 3);
      cellT2.value = "REPORTE DE EXISTENCIAS EN BODEGAS ALTERNAS (UNIDADES)";
      cellT2.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FF404040" },
      };
      cellT2.alignment = { vertical: "middle", horizontal: "left" };

      const cellT3 = hojaTrabajo.getCell(3, 3);
      cellT3.value = `Periodo Contable: ${lapsoCalendario} | Generado: ${new Date().toLocaleDateString("es-CO")}`;
      cellT3.font = {
        name: "Arial",
        size: 9.5,
        italic: true,
        color: { argb: "FF606060" },
      };
      cellT3.alignment = { vertical: "middle", horizontal: "left" };

      // 6. Agrupación Matriz Nivel Superior (Fila 5)
      const estiloGrupo = {
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF007D58" },
        },
        font: {
          bold: true,
          color: { argb: "FFFFFFFF" },
          size: 11,
          name: "Arial",
        },
        alignment: { vertical: "middle", horizontal: "center" },
      };

      hojaTrabajo.mergeCells(5, 1, 5, 3);
      const g1 = hojaTrabajo.getCell(5, 1);
      g1.value = "DATOS MAESTROS";
      g1.fill = estiloGrupo.fill;
      g1.font = estiloGrupo.font;
      g1.alignment = estiloGrupo.alignment;

      let pCol = 4;
      bodegas02.forEach((b) => {
        hojaTrabajo.mergeCells(5, pCol, 5, pCol + 1);
        const gSede = hojaTrabajo.getCell(5, pCol);
        gSede.value = `SEDE ${b.slice(0, 3)} (${b})`;
        gSede.fill = estiloGrupo.fill;
        gSede.font = estiloGrupo.font;
        gSede.alignment = estiloGrupo.alignment;
        pCol += 2;
      });

      if (bodegasAlt.length > 0) {
        hojaTrabajo.mergeCells(5, pCol, 5, pCol + bodegasAlt.length - 1);
        const gAlt = hojaTrabajo.getCell(5, pCol);
        gAlt.value = "BODEGAS ALTERNAS";
        gAlt.fill = estiloGrupo.fill;
        gAlt.font = estiloGrupo.font;
        gAlt.alignment = estiloGrupo.alignment;
        pCol += bodegasAlt.length;
      }

      const totalCols = hayB02 ? 3 : 1;
      if (totalCols > 1) {
        hojaTrabajo.mergeCells(5, pCol, 5, pCol + totalCols - 1);
      }
      const gTot = hojaTrabajo.getCell(5, pCol);
      gTot.value = "TOTALES GENERALES";
      gTot.fill = estiloGrupo.fill;
      gTot.font = estiloGrupo.font;
      gTot.alignment = estiloGrupo.alignment;

      // 7. Subcabeceras del Reporte (Fila 6)
      const fila6 = hojaTrabajo.getRow(6);
      fila6.height = 24;
      fila6.values = columnasTabla;
      fila6.eachCell((c) => {
        c.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF009B6D" },
        };
        c.font = {
          bold: true,
          color: { argb: "FFFFFFFF" },
          size: 10,
          name: "Arial",
        };
        c.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
      });

      // 8. Inyección física de los registros procesados
      reporteData.forEach((item) => {
        const filaCuerpo = [item.Item, item.Descripcion, item.Embalaje];
        bodegas02.forEach((b) => {
          filaCuerpo.push(Number(item[`Existencia_Und_${b}`] || 0));
          filaCuerpo.push(Number(item[`Venta_Und_${b}`] || 0));
        });
        bodegasAlt.forEach((a) => {
          filaCuerpo.push(Number(item[`Exist_${a}`] || 0));
        });
        if (hayB02) {
          filaCuerpo.push(
            Number(item.Total_Exist_Und_B02),
            Number(item.Total_Venta_Und),
          );
        }
        filaCuerpo.push(Number(item.Total_Exist_Und_Alternas));

        const rNueva = hojaTrabajo.addRow(filaCuerpo);
        rNueva.height = 20;
        rNueva.eachCell((cell, cNum) => {
          cell.font = { name: "Arial", size: 9.5 };
          cell.border = {
            top: { style: "thin", color: { argb: "FFE7E6E6" } },
            left: { style: "thin", color: { argb: "FFE7E6E6" } },
            bottom: { style: "thin", color: { argb: "FFE7E6E6" } },
            right: { style: "thin", color: { argb: "FFE7E6E6" } },
          };

          if (cNum > 3) {
            cell.numFmt = "#,##0";
            cell.alignment = { horizontal: "right", vertical: "middle" };
          } else {
            cell.alignment = { vertical: "middle" };
          }
        });
      });

      // 9. ✅ SOLUCIÓN PERMANENTE: Iteración segura usando getColumn por índice correlativo (Base 1)
      for (let i = 1; i <= columnasTabla.length; i++) {
        const colInstancia = hojaTrabajo.getColumn(i);
        let maxLen = columnasTabla[i - 1].length; // Usar longitud del nombre de cabecera como mínimo inicial

        if (colInstancia && colInstancia.values) {
          colInstancia.values.forEach((val, rowIdx) => {
            // Evaluamos solo filas de datos (después de títulos y grupos superiores)
            if (rowIdx > 6 && val !== undefined && val !== null) {
              const strLen = String(val).length;
              if (strLen > maxLen) maxLen = strLen;
            }
          });
        }

        // Forzar ancho expandido cómodo para la columna de descripción comercial (Índice 2)
        if (i === 2) {
          maxLen = Math.max(maxLen, 45);
        }

        colInstancia.width = Math.max(maxLen + 4, 12);
      }

      // Inmovilizar paneles (Primeras 3 columnas fijas, primeras 6 filas de títulos fijas)
      hojaTrabajo.views = [
        { state: "frozen", xSplit: 3, ySplit: 6, topLeftCell: "D7" },
      ];

      const buffer = await libroTrabajo.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `reporte_bodegas_alternas_${lapsoCalendario.replace("-", "")}.xlsx`,
      );
      addNotification({
        type: "success",
        message: "Reporte corporativo exportado con éxito.",
      });
    } catch (err) {
      console.error("Error estructural en ExcelJS:", err);
      addNotification({
        type: "error",
        message: "Error al estructurar el binario del reporte.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.moduloContainer}>
      {loading && (
        <LoadingScreen mensaje="Consolidando balances de inventario analíticos..." />
      )}

      <div className={styles.encabezadoSeccion}>
        <div className={styles.iconContainer}>
          <FontAwesomeIcon icon={faWarehouse} />
        </div>
        <div style={{ flex: 1 }}>
          <h2>Reporte de Existencias en Bodegas Alternas</h2>
          <p>
            Visualización matricial completa de inventarios inmovilizados frente
            a las ventas del periodo contable
          </p>
        </div>
      </div>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === "analitica" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("analitica")}
        >
          <FontAwesomeIcon icon={faTable} /> Visor
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "parametros" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("parametros")}
        >
          <FontAwesomeIcon icon={faCogs} /> Parametrización
        </button>
      </div>

      {activeTab === "analitica" ? (
        <>
          <div className={styles.tarjetaFiltros}>
            <form
              onSubmit={handleConsultarReporte}
              style={{ display: "flex", gap: "20px", alignItems: "flex-end" }}
            >
              <div className={styles.controlFormulario}>
                <div className={styles.campoFlotante}>
                  <input
                    type="month"
                    value={lapsoCalendario}
                    onChange={(e) => setLapsoCalendario(e.target.value)}
                    required
                    style={{ width: "100%", boxSizing: "border-box" }}
                  />
                  <label className={styles.labelFlotante}>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    Periodo Contable
                  </label>
                </div>
              </div>
              <button type="submit" className={styles.btnBuscarDatos}>
                <FontAwesomeIcon icon={faSearch} /> Consultar
              </button>
            </form>
          </div>

          {reporteData.length > 0 ? (
            <div style={{ marginTop: "20px" }}>
              <div className={styles.contenedorAcciones}>
                <button
                  className={styles.btnDescargarExcel}
                  onClick={handleExportarExcel}
                >
                  <FontAwesomeIcon icon={faFileExcel} /> Exportar Excel
                </button>
              </div>

              <TablaResultadosAlternas
                datos={reporteData}
                estructuras={estructurasColumnas}
              />
            </div>
          ) : null}
        </>
      ) : (
        <TabParametrizacion addNotification={addNotification} />
      )}
    </div>
  );
};

export default BodegasAlternas;
