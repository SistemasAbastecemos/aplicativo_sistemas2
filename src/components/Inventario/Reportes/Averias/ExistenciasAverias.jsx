import React, { useState, useEffect } from "react";
import styles from "./ExistenciasAverias.module.css";
import { apiService } from "../../../../services/api";
import LoadingScreen from "../../../UI/LoadingScreen";
import logoImage from "../../../../assets/images/logo.png";
import { useNotification } from "../../../../contexts/NotificationContext";
import { usePermisos } from "../../../../hooks/usePermission";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxes,
  faFileExcel,
  faTable,
  faCogs,
} from "@fortawesome/free-solid-svg-icons";
import FiltrosReporte from "./components/FiltrosReporte";
import TablaResultados from "./components/TablaResultados";
import TarjetasKpi from "./components/TarjetasKpi";
import TabParametrizacion from "./components/TabParametrizacion";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const ExistenciasAverias = () => {
  const { addNotification } = useNotification();

  // Permisos del usuario sobre ESTE menu (ruta resuelta automaticamente).
  const { permisos } = usePermisos();
  // La pestaña de Parametrizacion es administrativa: visible si el usuario
  // tiene cualquier accion de gestion sobre el menu.
  const puedeParametrizar =
    permisos.crear || permisos.editar || permisos.eliminar;

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("analitica"); // Control de pestañas: 'analitica' | 'parametros'
  const [reporteData, setReporteData] = useState([]);
  const [filtrosActivos, setFiltrosActivos] = useState(null);

  // Si el usuario esta en Parametrizacion pero no tiene (o pierde) el permiso,
  // se le regresa al Visor Analitico.
  useEffect(() => {
    if (activeTab === "parametros" && !puedeParametrizar) {
      setActiveTab("analitica");
    }
  }, [activeTab, puedeParametrizar]);

  const handleEjecutarConsulta = async (
    sedesSeleccionadas,
    lapsosSeleccionados,
  ) => {
    setLoading(true);
    try {
      const response = await apiService.obtenerExistenciasAverias(
        sedesSeleccionadas,
        lapsosSeleccionados,
      );

      const apiData = response.resultado ? response.resultado : response;

      if (apiData.success) {
        setReporteData(apiData.data || []);
        setFiltrosActivos({
          sedes: sedesSeleccionadas,
          lapsos: lapsosSeleccionados,
        });
        addNotification({
          type: "success",
          message: `Consulta exitosa. Se recuperaron ${apiData.data.length} registros.`,
        });
      } else {
        throw new Error(
          apiData.message || "No se obtuvieron resultados del servidor.",
        );
      }
    } catch (error) {
      addNotification({
        type: "error",
        message:
          error.message || "Fallo al conectar con el tunel de Cloudflare.",
      });
      setReporteData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportarExcel = async () => {
    if (reporteData.length === 0) return;

    setLoading(true);
    try {
      const libroTrabajo = new ExcelJS.Workbook();
      const hojaTrabajo = libroTrabajo.addWorksheet("Existencias Averias");

      const totalColumnas = 13;
      const lapsoIdentificado = reporteData[0]?.lapso || "General";
      const fechaActualStr = new Date().toLocaleDateString("es-CO");

      const columnasTabla = [
        "Proveedor",
        "Linea",
        "Criterio Item",
        "Sede",
        "Local",
        "Fecha Ultima Entrada",
        "Item",
        "Nombre Item",
        "Lapso",
        "Existencia Final",
        "Costo Unitario",
        "Costo Total",
        "Recoge Averias",
      ];

      const columnasConfiguradas = columnasTabla.map((col, i) => {
        let longitudMaxima = 12;
        if (i === 0) longitudMaxima = 25;
        if (i === 1) longitudMaxima = 25;
        if (i === 7) longitudMaxima = 45;

        reporteData.forEach((item) => {
          const valoresFila = [
            item.proveedor,
            item.linea,
            item.criterio_item,
            item.sede,
            item.local,
            item.fecha_ultima_entrada,
            item.item,
            item.nombre_item,
            item.lapso,
            item.existencia_final,
            item.costo_unitario,
            item.costo_total,
            item.recoge_averias,
          ];
          const valorStr = valoresFila[i] ? valoresFila[i].toString() : "";
          if (
            valorStr.length > longitudMaxima &&
            i !== 7 &&
            i !== 0 &&
            i !== 1
          ) {
            longitudMaxima = valorStr.length;
          }
        });

        return {
          key: col.toLowerCase().replace(/ /g, "_"),
          width: Math.min(longitudMaxima + 3, 50),
        };
      });

      hojaTrabajo.columns = columnasConfiguradas;

      hojaTrabajo.getRow(1).height = 25;
      hojaTrabajo.getRow(2).height = 20;
      hojaTrabajo.getRow(3).height = 20;
      hojaTrabajo.getRow(4).height = 20;
      hojaTrabajo.getRow(5).height = 15;

      for (let r = 1; r <= 4; r++) {
        for (let c = 1; c <= totalColumnas; c++) {
          const celdaFondo = hojaTrabajo.getCell(r, c);
          celdaFondo.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF2F9F6" },
          };
          if (r === 4) {
            celdaFondo.border = {
              bottom: { style: "thick", color: { argb: "FF009B6D" } },
            };
          }
        }
      }

      const anchoColumnaA = hojaTrabajo.getColumn(1).width || 25;
      const anchoColumnaB = hojaTrabajo.getColumn(2).width || 15;

      const altoFijoLogoPx = 98;
      const relacionAspectoOriginal = 2.4;
      const anchoLogoDeseadoPx = altoFijoLogoPx * relacionAspectoOriginal;

      const anchoAPx = anchoColumnaA * 7.25 + 12;
      const anchoBPx = anchoColumnaB * 7.25 + 12;

      const paddingIzquierdoPx = 0.15 * anchoAPx;
      const pixelFinNecesario = paddingIzquierdoPx + anchoLogoDeseadoPx;

      let colFinFloating = 1.0;
      let rangoFinLogoCol = 1;

      if (pixelFinNecesario <= anchoAPx) {
        rangoFinLogoCol = 1;
        colFinFloating = pixelFinNecesario / anchoAPx;
      } else {
        rangoFinLogoCol = 2;
        for (let f = 1; f <= 4; f++) {
          hojaTrabajo.mergeCells(f, 1, f, 2);
        }
        const pixelesRestantesEnB = pixelFinNecesario - anchoAPx;
        colFinFloating = 1.0 + pixelesRestantesEnB / anchoBPx;
      }

      try {
        const logoResponse = await fetch(logoImage);
        const arrayBuffer = await logoResponse.arrayBuffer();
        const logoId = libroTrabajo.addImage({
          buffer: arrayBuffer,
          extension: "png",
        });
        hojaTrabajo.addImage(logoId, {
          tl: { col: 0.15, row: 0.3 },
          br: { col: colFinFloating, row: 3.8 },
          editAs: "oneCell",
        });
      } catch (error) {
        console.error("Error logo:", error);
      }

      const colInicioTexto = rangoFinLogoCol + 1;

      for (let i = 1; i <= 4; i++) {
        if (colInicioTexto < totalColumnas) {
          hojaTrabajo.mergeCells(i, colInicioTexto, i, totalColumnas);
        }
      }

      const cellTitulo = hojaTrabajo.getCell(1, colInicioTexto);
      cellTitulo.value =
        "SUPERMERCADO BELALCAZAR - ABASTECEMOS DE OCCIDENTE S.A.S";
      cellTitulo.font = {
        name: "Arial",
        size: 15,
        bold: true,
        color: { argb: "FF009B6D" },
      };
      cellTitulo.alignment = { vertical: "middle", horizontal: "left" };

      const cellSubtitulo = hojaTrabajo.getCell(2, colInicioTexto);
      cellSubtitulo.value = "REPORTE GLOBAL DE EXISTENCIAS DE AVERIAS";
      cellSubtitulo.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FF404040" },
      };
      cellSubtitulo.alignment = { vertical: "middle", horizontal: "left" };

      const cellDoc = hojaTrabajo.getCell(3, colInicioTexto);
      cellDoc.value = `Documento: Analisis de Mermas Lapso ${lapsoIdentificado}`;
      cellDoc.font = {
        name: "Arial",
        size: 10.5,
        bold: true,
        color: { argb: "FF202020" },
      };
      cellDoc.alignment = { vertical: "middle", horizontal: "left" };

      const cellFechas = hojaTrabajo.getCell(4, colInicioTexto);
      cellFechas.value = `Corte: Vigente a la fecha  |  Generado: ${fechaActualStr}`;
      cellFechas.font = {
        name: "Arial",
        size: 9.5,
        italic: true,
        color: { argb: "FF606060" },
      };
      cellFechas.alignment = { vertical: "middle", horizontal: "left" };

      const filaEncabezados = hojaTrabajo.getRow(6);
      filaEncabezados.values = columnasTabla;
      filaEncabezados.height = 28;

      const estiloEncabezado = {
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF009B6D" },
        },
        font: {
          bold: true,
          color: { argb: "FFFFFFFF" },
          size: 11,
          name: "Arial",
        },
        border: {
          top: { style: "thin", color: { argb: "FFBFBFBF" } },
          left: { style: "thin", color: { argb: "FFBFBFBF" } },
          bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
          right: { style: "thin", color: { argb: "FFBFBFBF" } },
        },
        alignment: { vertical: "middle", horizontal: "center", wrapText: true },
      };

      filaEncabezados.eachCell((celda) => {
        celda.fill = estiloEncabezado.fill;
        celda.font = estiloEncabezado.font;
        celda.border = estiloEncabezado.border;
        celda.alignment = estiloEncabezado.alignment;
      });

      const estiloCellCuerpo = {
        font: { name: "Arial", size: 10 },
        border: {
          top: { style: "thin", color: { argb: "FFE7E6E6" } },
          left: { style: "thin", color: { argb: "FFE7E6E6" } },
          bottom: { style: "thin", color: { argb: "FFE7E6E6" } },
          right: { style: "thin", color: { argb: "FFE7E6E6" } },
        },
        alignment: { vertical: "middle" },
      };

      reporteData.forEach((item) => {
        const filaValores = [
          item.proveedor,
          item.linea,
          item.criterio_item,
          item.sede,
          item.local,
          item.fecha_ultima_entrada,
          item.item,
          item.nombre_item,
          item.lapso,
          parseFloat(item.existencia_final || 0),
          parseFloat(item.costo_unitario || 0),
          parseFloat(item.costo_total || 0),
          item.recoge_averias,
        ];

        const nuevaFila = hojaTrabajo.addRow(filaValores);
        nuevaFila.height = 20;

        nuevaFila.eachCell((celda) => {
          celda.font = estiloCellCuerpo.font;
          celda.border = estiloCellCuerpo.border;
          celda.alignment = estiloCellCuerpo.alignment;
        });

        nuevaFila.getCell(4).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        nuevaFila.getCell(5).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        nuevaFila.getCell(6).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        nuevaFila.getCell(7).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        nuevaFila.getCell(9).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        nuevaFila.getCell(13).alignment = {
          horizontal: "center",
          vertical: "middle",
        };

        nuevaFila.getCell(10).numFmt = "#,##0.00";
        nuevaFila.getCell(11).numFmt = '"$"#,##0.00';
        nuevaFila.getCell(12).numFmt = '"$"#,##0.00';
      });

      if (!hojaTrabajo.empty) {
        hojaTrabajo.autoFilter = {
          from: { row: 6, column: 1 },
          to: { row: 6, column: totalColumnas },
        };
      }

      hojaTrabajo.views = [
        {
          state: "frozen",
          xSplit: 0,
          ySplit: 6,
          topLeftCell: "A7",
          activePane: "bottomLeft",
        },
      ];

      const buffer = await libroTrabajo.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fechaArchivo = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");
      saveAs(blob, `existencias_averias_${fechaArchivo}.xlsx`);

      addNotification({
        message: "Reporte corporativo generado con exito",
        type: "success",
      });
    } catch (error) {
      console.error("Error excel:", error);
      addNotification({
        message: "Error al estructurar el archivo corporativo",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.moduloContainer}>
      {loading && (
        <LoadingScreen mensaje="Procesando flujos de datos en el Canal LAN seguro de la compañia..." />
      )}

      {/* Título de la Sección Remodelado sin la botonera en la esquina */}
      <div className={styles.encabezadoSeccion}>
        <div className={styles.iconContainer}>
          <FontAwesomeIcon icon={faBoxes} />
        </div>
        <div>
          <h2>Auditoría de Existencias y Averías</h2>
          <p>
            Análisis en tiempo real de saldos inmovilizados en Bodegas 03 y
            cruce de gobernanza de proveedores
          </p>
        </div>
      </div>

      {/* BARRA DE PESTAÑAS HORIZONTAL */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === "analitica" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("analitica")}
        >
          <FontAwesomeIcon icon={faTable} className={styles.btnIconoMargen} />
          Visor Analítico
        </button>
        {puedeParametrizar && (
          <button
            className={`${styles.tabButton} ${activeTab === "parametros" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("parametros")}
          >
            <FontAwesomeIcon icon={faCogs} className={styles.btnIconoMargen} />
            Parametrización
          </button>
        )}
      </div>

      {/* Renderizado de Módulos según Tab Seleccionada */}
      {activeTab === "parametros" && puedeParametrizar ? (
        <TabParametrizacion
          addNotification={addNotification}
          permisos={permisos}
        />
      ) : (
        <>
          <FiltrosReporte onBuscar={handleEjecutarConsulta} loading={loading} />

          {reporteData.length > 0 && (
            <>
              <TarjetasKpi datos={reporteData} />
              <div className={styles.contenedorAcciones}>
                <button
                  className={styles.btnDescargarExcel}
                  onClick={handleExportarExcel}
                >
                  <FontAwesomeIcon
                    icon={faFileExcel}
                    className={styles.btnIconoMargen}
                  />{" "}
                  Exportar Excel
                </button>
              </div>
            </>
          )}

          <TablaResultados
            datos={reporteData}
            key={`tabla-${reporteData.length}-${filtrosActivos?.sedes?.join("") || ""}`}
          />
        </>
      )}
    </div>
  );
};

export default ExistenciasAverias;
