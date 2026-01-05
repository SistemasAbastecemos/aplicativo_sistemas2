import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNotification } from "../../../contexts/NotificationContext";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import logo from "../../../assets/images/logo.png";
import styles from "./ActualizacionCostos.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faBuilding,
  faCalendarAlt,
  faUser,
  faBoxes,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faEdit,
  faSave,
  faDownload,
  faBox,
  faArrowUp,
  faArrowDown,
  faCalculator,
  faCheckSquare,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";

const ModalDetallesSolicitud = ({
  solicitud,
  onClose,
  onAprobarRechazar,
  onAplicarPrecios,
  onAplicarCambioPrecio,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  if (!solicitud) return null;

  // ===== FUNCIÓN PARA EXPORTAR A EXCEL =====
  const exportarAExcel = async () => {
    if (!solicitud) return;

    try {
      // Crear un nuevo libro de trabajo
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "ABASTECEMOS DE OCCIDENTE S.A.S";
      workbook.lastModifiedBy = "Sistema de Actualización de Costos";
      workbook.created = new Date();
      workbook.modified = new Date();

      // ===== PALETA DE COLORES CORPORATIVA (VERDE) =====
      const colores = {
        verdeOscuro: "1B5E20",
        verdeMedio: "2E7D32",
        verdeClaro: "4CAF50",
        verdeMuyClaro: "E8F5E8",
        verdeSuave: "A5D6A7",
        blanco: "FFFFFF",
        grisClaro: "F5F5F5",
        grisMedio: "E0E0E0",
        textoOscuro: "212121",
        textoMedio: "666666",
      };

      // ===== HOJA 1: INFORMACIÓN GENERAL =====
      const wsGeneral = workbook.addWorksheet("INFORMACIÓN GENERAL");

      // Configurar márgenes
      wsGeneral.pageSetup = {
        margins: {
          left: 0.5,
          right: 0.5,
          top: 0.75,
          bottom: 0.75,
          header: 0.3,
          footer: 0.3,
        },
        orientation: "portrait",
        paperSize: 9, // A4
      };

      // ===== ENCABEZADO =====
      // Título principal
      wsGeneral.mergeCells("A1:D2");
      const tituloCell = wsGeneral.getCell("A1");
      tituloCell.value =
        "ABASTECEMOS DE OCCIDENTE S.A.S\nSOLICITUD #" + solicitud.id;
      tituloCell.style = {
        font: {
          name: "Arial",
          size: 16,
          bold: true,
          color: { argb: colores.verdeOscuro },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
          wrapText: true,
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colores.verdeMuyClaro },
        },
        border: {
          top: { style: "medium", color: { argb: colores.verdeOscuro } },
          left: { style: "medium", color: { argb: colores.verdeOscuro } },
          bottom: { style: "medium", color: { argb: colores.verdeOscuro } },
          right: { style: "medium", color: { argb: colores.verdeOscuro } },
        },
      };

      // Fila 4: Información de contacto
      wsGeneral.mergeCells("A3:D3");
      const contactoCell = wsGeneral.getCell("A3");
      contactoCell.value =
        "Oficina Principal: Cra. 5 # 5-48, Yumbo, Valle del Cauca";
      contactoCell.style = {
        font: {
          name: "Arial",
          size: 10,
          color: { argb: colores.textoOscuro },
          bold: true,
        },
        alignment: { horizontal: "center", vertical: "center" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colores.verdeSuave },
        },
      };

      // Fila 5: Información de contacto 2
      wsGeneral.mergeCells("A4:D4");
      const contacto2Cell = wsGeneral.getCell("A4");
      contacto2Cell.value =
        "Tel: 669 5778 | Ext 132 - 109 • NIT: 900203566 • www.supermercadobelalcazar.com.co";
      contacto2Cell.style = {
        font: { name: "Arial", size: 9, color: { argb: colores.textoOscuro } },
        alignment: { horizontal: "center", vertical: "center" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colores.verdeSuave },
        },
      };

      // Fila 6: Separador
      wsGeneral.mergeCells("A5:D5");
      const separadorCell = wsGeneral.getCell("A5");
      separadorCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colores.verdeMedio },
      };
      separadorCell.border = {
        top: { style: "thin", color: { argb: colores.verdeOscuro } },
        left: { style: "thin", color: { argb: colores.verdeOscuro } },
        bottom: { style: "thin", color: { argb: colores.verdeOscuro } },
        right: { style: "thin", color: { argb: colores.verdeOscuro } },
      };

      let filaActual = 6;

      // ===== INFORMACIÓN DE LA SOLICITUD =====
      wsGeneral.mergeCells(`A${filaActual}:D${filaActual}`);
      const infoTitle = wsGeneral.getCell(`A${filaActual}`);
      infoTitle.value = "INFORMACIÓN DE LA SOLICITUD";
      infoTitle.style = {
        font: {
          name: "Arial",
          size: 12,
          bold: true,
          color: { argb: colores.blanco },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colores.verdeMedio },
        },
      };
      filaActual++;

      const datosGenerales = [
        { label: "NÚMERO DE SOLICITUD", value: solicitud.id },
        { label: "PROVEEDOR", value: solicitud.nombre_proveedor },
        {
          label: "ESTADO",
          value: solicitud.estado.replace("_", " ").toUpperCase(),
        },
        {
          label: "FECHA DE CREACIÓN",
          value: formatearFechaExcel(solicitud.fecha_creacion),
        },
        {
          label: "FECHA DE APLICACIÓN PROGRAMADA",
          value: formatearFechaExcel(solicitud.fecha_aplicacion),
        },
      ];

      if (esSolicitudAplicada) {
        datosGenerales.push({
          label: "FECHA DE APLICACION CONTRATO",
          value: formatearFechaExcel(solicitud.fecha_aplicacion_real),
        });
      }

      datosGenerales.push({
        label: "TOTAL DE ITEMS",
        value: solicitud.items?.length || 0,
      });

      datosGenerales.forEach((item) => {
        // Etiqueta
        wsGeneral.mergeCells(`A${filaActual}:B${filaActual}`);
        const labelCell = wsGeneral.getCell(`A${filaActual}`);
        labelCell.value = item.label;
        labelCell.style = {
          font: {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: colores.verdeOscuro },
          },
          alignment: {
            horizontal: "left",
            vertical: "center",
          },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: colores.verdeMuyClaro },
          },
        };

        // Valor
        wsGeneral.mergeCells(`C${filaActual}:D${filaActual}`);
        const valueCell = wsGeneral.getCell(`C${filaActual}`);
        valueCell.value = item.value;
        valueCell.style = {
          font: {
            name: "Arial",
            size: 10,
            color: { argb: colores.textoOscuro },
          },
          alignment: {
            horizontal: "left",
            vertical: "center",
          },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: colores.blanco },
          },
        };

        filaActual++;
      });

      filaActual++;

      // ===== RESUMEN DE VARIACIONES =====
      wsGeneral.mergeCells(`A${filaActual}:D${filaActual}`);
      const resumenTitle = wsGeneral.getCell(`A${filaActual}`);
      resumenTitle.value = "RESUMEN DE VARIACIONES";
      resumenTitle.style = {
        font: {
          name: "Arial",
          size: 12,
          bold: true,
          color: { argb: colores.blanco },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colores.verdeMedio },
        },
      };
      filaActual++;

      // Calcular resumen
      const itemsConAumento =
        solicitud.items?.filter((item) => item.porcentaje_variacion > 0)
          .length || 0;
      const itemsConDisminucion =
        solicitud.items?.filter((item) => item.porcentaje_variacion < 0)
          .length || 0;
      const itemsSinCambio =
        solicitud.items?.filter(
          (item) =>
            !item.porcentaje_variacion || item.porcentaje_variacion === 0
        ).length || 0;
      const variacionPromedio =
        solicitud.items?.reduce(
          (acc, item) => acc + (item.porcentaje_variacion || 0),
          0
        ) / (solicitud.items?.length || 1);

      const datosResumen = [
        {
          label: "VARIACIÓN PROMEDIO",
          value: `${variacionPromedio?.toFixed(2) || "0.00"}%`,
          color: "FFEB3B", // Amarillo
        },
        {
          label: "ITEMS CON AUMENTO",
          value: itemsConAumento,
          color: "4CAF50", // Verde
        },
        {
          label: "ITEMS CON DISMINUCIÓN",
          value: itemsConDisminucion,
          color: "F44336", // Rojo
        },
        {
          label: "ITEMS SIN CAMBIO",
          value: itemsSinCambio,
          color: "9E9E9E", // Gris
        },
      ];

      datosResumen.forEach((item) => {
        // Etiqueta
        wsGeneral.mergeCells(`A${filaActual}:B${filaActual}`);
        const labelCell = wsGeneral.getCell(`A${filaActual}`);
        labelCell.value = item.label;
        labelCell.style = {
          font: {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: colores.verdeOscuro },
          },
          alignment: {
            horizontal: "left",
            vertical: "center",
          },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: colores.verdeMuyClaro },
          },
        };

        // Valor
        wsGeneral.mergeCells(`C${filaActual}:D${filaActual}`);
        const valueCell = wsGeneral.getCell(`C${filaActual}`);
        valueCell.value = item.value;
        valueCell.style = {
          font: {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: colores.textoOscuro },
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: item.color },
          },
        };

        filaActual++;
      });

      // Ajustar anchos de columnas para hoja general
      wsGeneral.columns = [
        { width: 25 }, // Columna A
        { width: 25 }, // Columna B
        { width: 30 }, // Columna C
        { width: 30 }, // Columna D
      ];

      // Ajustar alturas de filas del encabezado
      wsGeneral.getRow(1).height = 30;
      wsGeneral.getRow(2).height = 30;
      wsGeneral.getRow(3).height = 20;
      wsGeneral.getRow(4).height = 20;
      wsGeneral.getRow(5).height = 20;

      // ===== HOJA 2: DETALLES DE ITEMS =====
      const wsItems = workbook.addWorksheet("ITEMS DETALLADOS");

      // Configurar página
      wsItems.pageSetup = {
        margins: {
          left: 0.4,
          right: 0.4,
          top: 0.75,
          bottom: 0.75,
          header: 0.3,
          footer: 0.3,
        },
        orientation: "landscape",
        paperSize: 9, // A4
      };

      // ===== DEFINIR COLUMNAS Y SUS FORMATOS =====
      const columnasBase = [
        { key: "numero", header: "#", width: 6 },
        { key: "codigo_barras", header: "CÓDIGO DE BARRAS", width: 18 },
        { key: "item", header: "ITEM", width: 12 },
        { key: "descripcion", header: "DESCRIPCIÓN", width: 40 },
        { key: "unidad", header: "U.M", width: 8 },
        { key: "gramaje", header: "GRAMAJE", width: 10 },
        {
          key: "costo_actual",
          header: "COSTO ACTUAL",
          width: 14,
          format: "moneda",
        },
        {
          key: "costo_nuevo",
          header: "COSTO NUEVO",
          width: 14,
          format: "moneda",
        },
        {
          key: "variacion",
          header: "VARIACIÓN %",
          width: 12,
          format: "porcentaje",
        },
        { key: "iva", header: "IVA %", width: 10, format: "porcentaje" },
        { key: "icui", header: "ICUI", width: 12, format: "moneda" },
        { key: "ipo", header: "IPO", width: 12, format: "moneda" },
        { key: "pie1", header: "PIE/FACT 1", width: 14, format: "porcentaje" },
        { key: "pie2", header: "PIE/FACT 2", width: 14, format: "porcentaje" },
      ];

      const columnasAplicadas = [
        {
          key: "valor_pie",
          header: "VALOR PIE FACTURA",
          width: 16,
          format: "moneda",
        },
        {
          key: "costo_con_pie",
          header: "COSTO CON PIE",
          width: 14,
          format: "moneda",
        },
        {
          key: "costo_mas_icui",
          header: "COSTO + ICUI",
          width: 14,
          format: "moneda",
        },
        { key: "valor_iva", header: "VALOR IVA", width: 14, format: "moneda" },
        {
          key: "costo_mas_iva",
          header: "COSTO + IVA",
          width: 14,
          format: "moneda",
        },
        { key: "margen", header: "MARGEN %", width: 12, format: "porcentaje" },
        {
          key: "precio_final",
          header: "PRECIO FINAL",
          width: 14,
          format: "moneda",
        },
        { key: "pdv", header: "PDV", width: 14, format: "moneda" },
      ];

      const columnas = esSolicitudAplicada
        ? [...columnasBase, ...columnasAplicadas]
        : columnasBase;

      // Calcular el rango de columnas para el encabezado
      const totalColumnas = columnas.length;
      const ultimaColumna = String.fromCharCode(64 + totalColumnas);

      // ===== ENCABEZADO CORPORATIVO PARA ITEMS =====
      // Título principal
      wsItems.mergeCells(`A1:${ultimaColumna}2`);
      const itemsTitleCell = wsItems.getCell("A1");
      itemsTitleCell.value =
        "ABASTECEMOS DE OCCIDENTE S.A.S\nDETALLE DE ITEMS - SOLICITUD #" +
        solicitud.id;
      itemsTitleCell.style = {
        font: {
          name: "Arial",
          size: 14,
          bold: true,
          color: { argb: colores.verdeOscuro },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
          wrapText: true,
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colores.verdeMuyClaro },
        },
        border: {
          top: { style: "medium", color: { argb: colores.verdeOscuro } },
          left: { style: "medium", color: { argb: colores.verdeOscuro } },
          bottom: { style: "medium", color: { argb: colores.verdeOscuro } },
          right: { style: "medium", color: { argb: colores.verdeOscuro } },
        },
      };

      // Fila 4: Información de contacto
      wsItems.mergeCells(`A3:${ultimaColumna}3`);
      const itemsContactoCell = wsItems.getCell("A3");
      itemsContactoCell.value =
        "Oficina Principal: Cra. 5 # 5-48, Yumbo, Valle del Cauca • www.supermercadobelalcazar.com.co";
      itemsContactoCell.style = {
        font: {
          name: "Arial",
          size: 9,
          color: { argb: colores.textoOscuro },
          bold: true,
        },
        alignment: { horizontal: "center", vertical: "center" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colores.verdeSuave },
        },
      };

      // Fila 5: Información de contacto 2
      wsItems.mergeCells(`A4:${ultimaColumna}4`);
      const itemsContacto2Cell = wsItems.getCell("A4");
      itemsContacto2Cell.value =
        "Tel: 669 5778 | Ext 132 - 109 • NIT: 900203566";
      itemsContacto2Cell.style = {
        font: { name: "Arial", size: 9, color: { argb: colores.textoOscuro } },
        alignment: { horizontal: "center", vertical: "center" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colores.verdeSuave },
        },
      };

      // Fila 6: Separador
      wsItems.mergeCells(`A5:${ultimaColumna}5`);
      const espacioCell = wsItems.getCell("A5");
      espacioCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colores.verdeMuyClaro },
      };
      espacioCell.border = {
        top: { style: "thin", color: { argb: colores.verdeOscuro } },
        left: { style: "thin", color: { argb: colores.verdeOscuro } },
        bottom: { style: "thin", color: { argb: colores.verdeOscuro } },
        right: { style: "thin", color: { argb: colores.verdeOscuro } },
      };

      // ===== ENCABEZADOS DE LA TABLA =====
      const headerRow = wsItems.addRow(columnas.map((col) => col.header));
      headerRow.height = 25;

      // Aplicar estilos a los encabezados
      headerRow.eachCell((cell) => {
        cell.style = {
          font: {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: colores.blanco },
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: colores.verdeMedio },
          },
          border: {
            top: { style: "thin", color: { argb: colores.verdeOscuro } },
            left: { style: "thin", color: { argb: colores.verdeOscuro } },
            bottom: { style: "thin", color: { argb: colores.verdeOscuro } },
            right: { style: "thin", color: { argb: colores.verdeOscuro } },
          },
        };
      });

      // ===== AGREGAR DATOS DE ITEMS =====
      solicitud.items?.forEach((item, index) => {
        const rowData = columnas.map((col) => {
          switch (col.key) {
            case "numero":
              return index + 1;
            case "codigo_barras":
              return item.codigo_barras || "";
            case "item":
              return item.id_item || "";
            case "descripcion":
              return item.descripcion || "";
            case "unidad":
              return item.unidad_medida || "";
            case "gramaje":
              return item.gramaje || "";
            case "costo_actual":
              return formatearNumeroExcel(item.costo_sin_iva_actual);
            case "costo_nuevo":
              return formatearNumeroExcel(item.costo_sin_iva_nuevo);
            case "variacion":
              return formatearNumeroExcel(item.porcentaje_variacion) / 100;
            case "iva":
              return formatearNumeroExcel(item.iva) / 100;
            case "icui":
              return formatearNumeroExcel(item.valor_icui);
            case "ipo":
              return formatearNumeroExcel(item.valor_ipo);
            case "pie1":
              return formatearNumeroExcel(item.porcentaje_pie_factura1) / 100;
            case "pie2":
              return formatearNumeroExcel(item.porcentaje_pie_factura2) / 100;
            case "valor_pie":
              return formatearNumeroExcel(item.valor_pie_factura);
            case "costo_con_pie":
              return formatearNumeroExcel(item.costo_con_pie_factura);
            case "costo_mas_icui":
              return formatearNumeroExcel(item.costo_mas_icui);
            case "valor_iva":
              return formatearNumeroExcel(item.valor_iva_calculado);
            case "costo_mas_iva":
              return formatearNumeroExcel(item.costo_mas_iva);
            case "margen":
              return formatearNumeroExcel(item.margen) / 100;
            case "precio_final":
              return formatearNumeroExcel(item.precio_final);
            case "pdv":
              return formatearNumeroExcel(item.pdv);
            default:
              return "";
          }
        });

        const row = wsItems.addRow(rowData);

        // Aplicar estilos y formatos a cada celda
        row.eachCell((cell, colNumber) => {
          const colConfig = columnas[colNumber - 1];

          // Estilo base
          cell.style = {
            font: {
              name: "Arial",
              size: 9,
              color: { argb: colores.textoOscuro },
            },
            alignment: {
              vertical: "center",
              horizontal:
                colConfig.format === "moneda" ||
                colConfig.format === "porcentaje"
                  ? "right"
                  : "left",
              wrapText: colConfig.key === "descripcion",
            },
            border: {
              top: { style: "thin", color: { argb: colores.grisMedio } },
              left: { style: "thin", color: { argb: colores.grisMedio } },
              bottom: { style: "thin", color: { argb: colores.grisMedio } },
              right: { style: "thin", color: { argb: colores.grisMedio } },
            },
          };

          // Aplicar formato específico
          if (colConfig.format === "moneda") {
            cell.numFmt = '"$"#,##0.00';
          } else if (colConfig.format === "porcentaje") {
            cell.numFmt = "0.00%";
          }

          // Colores condicionales para la columna de variación
          if (colConfig.key === "variacion" && item.porcentaje_variacion) {
            if (item.porcentaje_variacion > 0) {
              cell.style.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "C8E6C9" },
              };
              cell.style.font.color = { argb: "2E7D32" };
              cell.style.font.bold = true;
            } else if (item.porcentaje_variacion < 0) {
              cell.style.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFCDD2" },
              };
              cell.style.font.color = { argb: "C62828" };
              cell.style.font.bold = true;
            } else {
              cell.style.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF9C4" },
              };
              cell.style.font.color = { argb: "F57F17" };
              cell.style.font.bold = true;
            }
          }
        });
      });

      // Configurar anchos de columnas
      wsItems.columns = columnas.map((col) => ({ width: col.width }));

      // Ajustar alturas de filas del encabezado
      wsItems.getRow(1).height = 30;
      wsItems.getRow(2).height = 30;
      wsItems.getRow(3).height = 30;
      wsItems.getRow(4).height = 20;
      wsItems.getRow(5).height = 20;
      wsItems.getRow(6).height = 15;

      // Congelar paneles (encabezados fijos)
      wsItems.views = [{ state: "frozen", xSplit: 0, ySplit: 6 }];

      // Agregar filtros
      if (solicitud.items && solicitud.items.length > 0) {
        wsItems.autoFilter = {
          from: { row: 6, column: 1 },
          to: { row: 6 + solicitud.items.length, column: totalColumnas },
        };
      }

      // ===== GENERAR ARCHIVO =====
      const buffer = await workbook.xlsx.writeBuffer();
      const fechaExportacion = new Date().toISOString().split("T")[0];
      const nombreArchivo = `Solicitud_${solicitud.id}_${fechaExportacion}.xlsx`;

      saveAs(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        nombreArchivo
      );
      addNotification({
        message: "Se ha descargado el archivo excel correctamente",
        type: "success",
      });
    } catch (error) {
      addNotification({
        message:
          "Error al generar el archivo Excel. Por favor, intente nuevamente." +
          error,
        type: "error",
      });
    }
  };

  // Funciones auxiliares para Excel
  const formatearFechaExcel = (fecha) => {
    if (!fecha) return "No definida";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearNumeroExcel = (valor) => {
    if (valor === "" || valor === null || valor === undefined || isNaN(valor))
      return 0;
    const numero =
      typeof valor === "string"
        ? parseFloat(valor.replace(/[^\d.-]/g, "").replace(",", "."))
        : parseFloat(valor);
    return isNaN(numero) ? 0 : numero;
  };

  // FUNCION PARA EXPORTAR A PDF
  const exportarAPDF = () => {
    if (!solicitud) return;

    try {
      // Crear nuevo documento PDF en orientación horizontal
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // ===== CONFIGURACIÓN DE COLORES =====
      const colores = {
        verdeOscuro: [27, 94, 32],
        verdeMedio: [46, 125, 50],
        verdeClaro: [76, 175, 80],
        verdeMuyClaro: [232, 245, 232],
        textoOscuro: [33, 33, 33],
        textoMedio: [102, 102, 102],
        borde: [200, 200, 200],
      };

      // ===== ENCABEZADO CON LOGO =====
      let yPos = 15;

      // Agregar logo (si está disponible)
      try {
        const img = new Image();
        img.src = logo;
        doc.addImage(img, "PNG", 15, 10, 30, 15);
      } catch (error) {
        console.log("Logo no disponible, continuando sin él");
      }

      // Título de la empresa al lado del logo
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colores.verdeOscuro);
      doc.text("ABASTECEMOS DE OCCIDENTE S.A.S", 50, yPos);

      yPos += 6;
      doc.setFontSize(14);
      doc.text(`SOLICITUD #${solicitud.id}`, 50, yPos);

      // Información de contacto en el lado derecho
      const pageWidth = 297; // Ancho total de página A4 en landscape
      const rightMargin = 20; // Margen derecho
      const contactWidth = 80; // Ancho estimado del bloque de contacto

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colores.textoMedio);

      // Calcular posición X para alinear a la derecha
      const contactX = pageWidth - rightMargin - contactWidth;

      doc.text("Oficina Principal:", contactX, 15);
      doc.text("Cra. 5 # 5-48, Yumbo, Valle", contactX, 18);
      doc.text("del Cauca", contactX, 21);

      doc.text("Tel: 669 5778 | Ext 132 - 109", contactX, 25);
      doc.text("NIT: 900203566", contactX, 28);
      doc.text("www.supermercadobelalcazar.com.co", contactX, 31);

      // Línea separadora
      yPos = 35;
      doc.setDrawColor(...colores.verdeMedio);
      doc.setLineWidth(0.5);
      doc.line(15, yPos, pageWidth - 15, yPos);

      // ===== INFORMACIÓN GENERAL EN DOS COLUMNAS =====
      yPos += 15;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colores.verdeOscuro);
      doc.text("INFORMACIÓN GENERAL", 15, yPos);

      // Datos generales - Columna izquierda
      const datosGeneralesIzq = [
        { label: "NÚMERO DE SOLICITUD", value: solicitud.id },
        { label: "PROVEEDOR", value: solicitud.nombre_proveedor },
        {
          label: "ESTADO",
          value: solicitud.estado.replace("_", " ").toUpperCase(),
        },
      ];

      // Datos generales - Columna derecha
      const datosGeneralesDer = [
        {
          label: "FECHA DE CREACIÓN",
          value: formatearFechaPDF(solicitud.fecha_creacion),
        },
        {
          label: "FECHA PROGRAMADA",
          value: formatearFechaPDF(solicitud.fecha_aplicacion),
        },
      ];

      if (esSolicitudAplicada) {
        datosGeneralesDer.push({
          label: "FECHA CONTRATO",
          value: formatearFechaPDF(solicitud.fecha_aplicacion_real),
        });
      }

      datosGeneralesDer.push({
        label: "TOTAL DE ITEMS",
        value: solicitud.items?.length || 0,
      });

      yPos += 8;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      // Columna izquierda
      datosGeneralesIzq.forEach((item, index) => {
        const startY = yPos + index * 6;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...colores.verdeOscuro);
        doc.text(item.label + ":", 20, startY);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...colores.textoOscuro);
        doc.text(item.value.toString(), 70, startY);
      });

      // Columna derecha
      datosGeneralesDer.forEach((item, index) => {
        const startY = yPos + index * 6;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...colores.verdeOscuro);
        doc.text(item.label + ":", 150, startY);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...colores.textoOscuro);
        doc.text(item.value.toString(), 200, startY);
      });

      yPos +=
        Math.max(datosGeneralesIzq.length, datosGeneralesDer.length) * 6 + 10;

      // ===== RESUMEN DE VARIACIONES EN UNA FILA =====
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colores.verdeOscuro);
      doc.text("RESUMEN DE VARIACIONES", 15, yPos);

      // Calcular resumen
      const itemsConAumento =
        solicitud.items?.filter((item) => item.porcentaje_variacion > 0)
          .length || 0;
      const itemsConDisminucion =
        solicitud.items?.filter((item) => item.porcentaje_variacion < 0)
          .length || 0;
      const itemsSinCambio =
        solicitud.items?.filter(
          (item) =>
            !item.porcentaje_variacion || item.porcentaje_variacion === 0
        ).length || 0;
      const variacionPromedio =
        solicitud.items?.reduce(
          (acc, item) => acc + (item.porcentaje_variacion || 0),
          0
        ) / (solicitud.items?.length || 1);

      const datosResumen = [
        {
          label: "VARIACIÓN PROMEDIO",
          value: `${variacionPromedio?.toFixed(2) || "0.00"}%`,
        },
        { label: "ITEMS CON AUMENTO", value: itemsConAumento },
        { label: "ITEMS CON DISMINUCIÓN", value: itemsConDisminucion },
        { label: "ITEMS SIN CAMBIO", value: itemsSinCambio },
      ];

      yPos += 8;
      doc.setFontSize(9);

      // Mostrar resumen en una fila horizontal
      const resumenWidth = 60; // Ancho de cada caja de resumen
      datosResumen.forEach((item, index) => {
        const startX = 20 + index * resumenWidth;

        // Fondo de la caja
        doc.setFillColor(...colores.verdeMuyClaro);
        doc.rect(startX, yPos, resumenWidth - 5, 15, "F");

        // Borde
        doc.setDrawColor(...colores.verdeClaro);
        doc.rect(startX, yPos, resumenWidth - 5, 15);

        // Texto
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...colores.verdeOscuro);
        doc.text(item.label, startX + 3, yPos + 5);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(...colores.textoOscuro);
        doc.text(item.value.toString(), startX + 3, yPos + 11);
      });

      yPos += 25;

      // ===== TABLA DE ITEMS OPTIMIZADA =====
      // Verificar si necesitamos una nueva página
      if (yPos > 160) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colores.verdeOscuro);
      doc.text(`DETALLE DE ITEMS (${solicitud.items?.length || 0})`, 15, yPos);

      yPos += 8;

      // Función auxiliar para convertir valores a números seguros
      const convertirANumero = (valor) => {
        if (valor === null || valor === undefined || valor === "") return 0;
        if (typeof valor === "number") return valor;
        if (typeof valor === "string") {
          const numero = parseFloat(valor.replace(/[^\d.-]/g, ""));
          return isNaN(numero) ? 0 : numero;
        }
        return 0;
      };

      // Preparar datos para la tabla
      const tableData =
        solicitud.items?.map((item, index) => {
          const baseData = [
            (index + 1).toString(),
            item.codigo_barras || "",
            item.id_item || "",
            item.descripcion || "",
            item.unidad_medida || "",
            item.gramaje || "",
            formatearMonedaPDF(convertirANumero(item.costo_sin_iva_actual)),
            formatearMonedaPDF(convertirANumero(item.costo_sin_iva_nuevo)),
            `${convertirANumero(item.porcentaje_variacion).toFixed(2)}%`,
            `${convertirANumero(item.iva).toFixed(2)}%`,
            formatearMonedaPDF(convertirANumero(item.valor_icui)),
            formatearMonedaPDF(convertirANumero(item.valor_ipo)),
            `${convertirANumero(item.porcentaje_pie_factura1).toFixed(2)}%`,
            `${convertirANumero(item.porcentaje_pie_factura2).toFixed(2)}%`,
          ];

          if (esSolicitudAplicada) {
            baseData.push(
              formatearMonedaPDF(convertirANumero(item.valor_pie_factura)),
              formatearMonedaPDF(convertirANumero(item.costo_con_pie_factura)),
              formatearMonedaPDF(convertirANumero(item.costo_mas_icui)),
              formatearMonedaPDF(convertirANumero(item.valor_iva_calculado)),
              formatearMonedaPDF(convertirANumero(item.costo_mas_iva)),
              `${convertirANumero(item.margen).toFixed(2)}%`,
              formatearMonedaPDF(convertirANumero(item.precio_final)),
              formatearMonedaPDF(convertirANumero(item.pdv))
            );
          }

          return baseData;
        }) || [];

      // Configurar columnas
      const baseColumns = [
        { header: "#", dataKey: "numero" },
        { header: "CÓDIGO", dataKey: "codigo_barras" },
        { header: "ITEM", dataKey: "item" },
        { header: "DESCRIPCIÓN", dataKey: "descripcion" },
        { header: "U.M", dataKey: "unidad" },
        { header: "GRAMAJE", dataKey: "gramaje" },
        { header: "COST ACT", dataKey: "costo_actual" },
        { header: "COST NVO", dataKey: "costo_nuevo" },
        { header: "VAR %", dataKey: "variacion" },
        { header: "IVA %", dataKey: "iva" },
        { header: "ICUI", dataKey: "icui" },
        { header: "IPO", dataKey: "ipo" },
        { header: "PIE1%", dataKey: "pie1" },
        { header: "PIE2%", dataKey: "pie2" },
      ];

      const columnasAplicadas = [
        { header: "VLR PIE", dataKey: "valor_pie" },
        { header: "COST PIE", dataKey: "costo_con_pie" },
        { header: "C+ICUI", dataKey: "costo_mas_icui" },
        { header: "VLR IVA", dataKey: "valor_iva" },
        { header: "C+IVA", dataKey: "costo_mas_iva" },
        { header: "MARG%", dataKey: "margen" },
        { header: "PREC FIN", dataKey: "precio_final" },
        { header: "PDV", dataKey: "pdv" },
      ];

      const allColumns = esSolicitudAplicada
        ? [...baseColumns, ...columnasAplicadas]
        : baseColumns;

      // CALCULAR ANCHO TOTAL DE LA TABLA
      const calculateTotalWidth = (columns) => {
        return columns.reduce((total, col) => total + (col.cellWidth || 15), 0);
      };

      // Configurar anchos de columnas
      const baseColumnStyles = {
        0: { cellWidth: 6 }, // #
        1: { cellWidth: 16 }, // CÓDIGO
        2: { cellWidth: 10 }, // ITEM
        3: { cellWidth: 35 }, // DESCRIPCIÓN
        4: { cellWidth: 8 }, // U.M
        5: { cellWidth: 10 }, // GRAMAJE
        6: { cellWidth: 12 }, // COST ACT
        7: { cellWidth: 12 }, // COST NVO
        8: { cellWidth: 10 }, // VAR %
        9: { cellWidth: 8 }, // IVA %
        10: { cellWidth: 10 }, // ICUI
        11: { cellWidth: 10 }, // IPO
        12: { cellWidth: 10 }, // PIE1%
        13: { cellWidth: 10 }, // PIE2%
      };

      const appliedColumnStyles = {
        14: { cellWidth: 12 }, // VLR PIE
        15: { cellWidth: 12 }, // COST PIE
        16: { cellWidth: 12 }, // C+ICUI
        17: { cellWidth: 12 }, // VLR IVA
        18: { cellWidth: 12 }, // C+IVA
        19: { cellWidth: 10 }, // MARG%
        20: { cellWidth: 12 }, // PREC FIN
        21: { cellWidth: 10 }, // PDV
      };

      const allColumnStyles = esSolicitudAplicada
        ? { ...baseColumnStyles, ...appliedColumnStyles }
        : baseColumnStyles;

      // Verificar si la tabla cabe en el ancho disponible
      const totalTableWidth = calculateTotalWidth(
        Object.keys(allColumnStyles).map((key) => ({
          cellWidth: allColumnStyles[key].cellWidth,
        }))
      );
      const availableWidth = pageWidth - 30; // 15mm de margen a cada lado

      console.log(
        `Ancho total tabla: ${totalTableWidth}mm, Ancho disponible: ${availableWidth}mm`
      );

      // Configurar estilo de la tabla optimizado
      const tableConfig = {
        startY: yPos,
        head: [allColumns.map((col) => col.header)],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 5, // Tamaño de fuente más pequeño
          cellPadding: 1,
          overflow: "linebreak",
          lineWidth: 0.1,
          lineColor: colores.borde,
        },
        headStyles: {
          fillColor: colores.verdeMedio,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 5, // Tamaño de fuente más pequeño para encabezados
        },
        alternateRowStyles: {
          fillColor: colores.verdeMuyClaro,
        },
        columnStyles: allColumnStyles,
        margin: { left: 15, right: 15 },
        // Forzar el ancho de la tabla para que quepa
        tableWidth: "auto",
        // Reducir el padding horizontal
        cellPadding: { top: 1, right: 1, bottom: 1, left: 1 },
      };

      // Generar tabla
      autoTable(doc, tableConfig);

      // ===== PIE DE PÁGINA =====
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...colores.textoMedio);
        doc.text(
          `Página ${i} de ${pageCount} • Generado el ${new Date().toLocaleDateString(
            "es-CO"
          )} a las ${new Date().toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          pageWidth / 2,
          200,
          { align: "center" }
        );

        // Firma o información adicional en el pie
        doc.text(
          "Sistema de Actualización de Costos - ABASTECEMOS DE OCCIDENTE S.A.S",
          pageWidth / 2,
          205,
          { align: "center" }
        );
      }

      // ===== GUARDAR ARCHIVO =====
      const fechaExportacion = new Date().toISOString().split("T")[0];
      const nombreArchivo = `Solicitud_${solicitud.id}_${fechaExportacion}.pdf`;

      doc.save(nombreArchivo);

      addNotification({
        message: "Se ha descargado el archivo PDF correctamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error al generar PDF:", error);
      addNotification({
        message:
          "Error al generar el archivo PDF. Por favor, intente nuevamente.",
        type: "error",
      });
    }
  };

  // Funciones auxiliares para PDF
  const formatearFechaPDF = (fecha) => {
    if (!fecha) return "No definida";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearMonedaPDF = (valor) => {
    if (!valor || isNaN(valor)) return "$0.00";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(valor);
  };

  const formatearMoneda = (valor) => {
    if (!valor || isNaN(valor)) return "$0.00";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(valor);
  };

  const formatearPorcentaje = (valor) => {
    if (!valor || isNaN(valor)) return "0.00%";
    return `${parseFloat(valor).toFixed(2)}%`;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "No definida";

    // Si es solo fecha (sin hora), agregar tiempo para evitar conversión de zona horaria
    if (typeof fecha === "string" && fecha.length === 10) {
      const date = new Date(fecha + "T12:00:00"); // Mediodía para evitar cambios de día
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    // Si ya incluye hora, formatear normalmente
    const date = new Date(fecha);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obtenerClaseVariacion = (porcentaje) => {
    if (!porcentaje || porcentaje === 0) return styles.variacionNeutra;
    return porcentaje > 0 ? styles.variacionPositiva : styles.variacionNegativa;
  };

  const obtenerIconoVariacion = (porcentaje) => {
    if (porcentaje > 0) return faArrowUp;
    if (porcentaje < 0) return faArrowDown;
    return null;
  };

  const renderizarBadgeEstado = (estado) => {
    const configuraciones = {
      pendiente: { clase: styles.badgePendiente, icono: faClock },
      en_revision: { clase: styles.badgeRevision, icono: faEdit },
      aprobada: { clase: styles.badgeAprobada, icono: faCheckCircle },
      rechazada: { clase: styles.badgeRechazada, icono: faTimesCircle },
      aplicada: { clase: styles.badgeAplicada, icono: faSave },
    };

    const config = configuraciones[estado] || configuraciones.pendiente;

    return (
      <span className={`${styles.badgeEstado} ${config.clase}`}>
        <FontAwesomeIcon icon={config.icono} />
        {estado.replace("_", " ")}
      </span>
    );
  };

  // Determinar qué acción mostrar
  const puedeGestionar = () => {
    // JOHANAB puede gestionar cuando el estado es "en_revision"
    if (user.login === "JOHANAB") return solicitud.estado === "en_revision";

    // ANDREA puede gestionar cuando el estado es "aprobada"
    if (user.login === "ANDREA") return solicitud.estado === "aprobada";

    // Otros usuarios pueden gestionar cuando el estado es "pendiente"
    return solicitud.estado === "pendiente";
  };

  const obtenerTextoBoton = () => {
    if (user.login === "JOHANAB") return "Cambio Precio Realizado";
    if (user.login === "ANDREA") return "Aplicar Precios";
    return "Gestionar Solicitud";
  };

  const obtenerIconoBoton = () => {
    if (user.login === "JOHANAB") return faCheckSquare;
    if (user.login === "ANDREA") return faCalculator;
    return faCheckCircle;
  };

  const manejarAccionPrincipal = async () => {
    if (user.login === "JOHANAB") {
      // Para JOHANAB, ejecutar la acción directamente
      if (onAplicarCambioPrecio) {
        try {
          await onAplicarCambioPrecio();
          addNotification({
            message: "Cambio de precio aplicado exitosamente",
            type: "success",
          });
          onClose();
          if (onSuccess) onSuccess();
        } catch (error) {
          addNotification({
            message: "Error al aplicar cambio de precio: " + error.message,
            type: "error",
          });
        }
      }
    } else if (user.login === "ANDREA") {
      onAplicarPrecios();
      onClose(); // Cerrar modal de detalles al abrir el de aplicar precios
    } else {
      onAprobarRechazar();
      onClose(); // Cerrar modal de detalles al abrir el de aprobar/rechazar
    }
  };

  const esSolicitudAplicada = solicitud.estado === "aplicada";

  return (
    <div className={styles.overlayModal} onClick={onClose}>
      <div className={styles.modalGrande} onClick={(e) => e.stopPropagation()}>
        <div className={styles.encabezadoModal}>
          <div className={styles.tituloModal}>
            <FontAwesomeIcon icon={faBox} />
            <div>
              <h2>Detalles de la Solicitud #{solicitud.id}</h2>
              <p>Información completa de la solicitud</p>
            </div>
            {renderizarBadgeEstado(solicitud.estado)}
          </div>
          <div className={styles.modalAcciones}>
            <button
              className={styles.botonIcono}
              title="Exportar a PDF"
              onClick={exportarAPDF}
            >
              <FontAwesomeIcon icon={faFilePdf} />
            </button>
            <button
              className={styles.botonIcono}
              title="Exportar a Excel"
              onClick={exportarAExcel}
            >
              <FontAwesomeIcon icon={faDownload} />
            </button>
            <button className={styles.botonCerrarModal} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        <div className={styles.cuerpoModal}>
          {/* Información General */}
          <div className={styles.seccionInfo}>
            <h3>Información General</h3>
            <div className={styles.gridInfo}>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faBuilding} />
                <div>
                  <label>Proveedor</label>
                  <span>{solicitud.nombre_proveedor}</span>
                  <small>NIT: {solicitud.nit_proveedor}</small>
                </div>
              </div>

              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                <div>
                  <label>Fecha de Aplicación</label>
                  <span>{formatearFecha(solicitud.fecha_aplicacion)}</span>
                </div>
              </div>

              {esSolicitudAplicada && (
                <div className={styles.infoItem}>
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <div>
                    <label>Fecha de Aplicación Contrato</label>
                    <span>
                      {formatearFecha(solicitud.fecha_aplicacion_real)}
                    </span>
                  </div>
                </div>
              )}

              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faUser} />
                <div>
                  <label>Comprador Asignado</label>
                  <span>{solicitud.nombre_comprador || "No asignado"}</span>
                </div>
              </div>

              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faBoxes} />
                <div>
                  <label>Total de Items</label>
                  <span>{solicitud.items?.length || 0} productos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de Variaciones */}
          <div className={styles.seccionResumen}>
            <h3>Resumen de Variaciones</h3>
            <div className={styles.gridResumen}>
              <div className={styles.resumenItem}>
                <div className={styles.resumenValor}>
                  {formatearPorcentaje(
                    solicitud.items?.reduce(
                      (acc, item) => acc + (item.porcentaje_variacion || 0),
                      0
                    ) / (solicitud.items?.length || 1)
                  )}
                </div>
                <div className={styles.resumenLabel}>Variación Promedio</div>
              </div>
              <div
                className={`${styles.resumenItem} ${styles.resumenPositivo}`}
              >
                <div className={styles.resumenValor}>
                  {solicitud.items?.filter(
                    (item) => item.porcentaje_variacion > 0
                  ).length || 0}
                </div>
                <div className={styles.resumenLabel}>Items con Aumento</div>
              </div>

              <div
                className={`${styles.resumenItem} ${styles.resumenNegativo}`}
              >
                <div className={styles.resumenValor}>
                  {solicitud.items?.filter(
                    (item) => item.porcentaje_variacion < 0
                  ).length || 0}
                </div>
                <div className={styles.resumenLabel}>Items con Disminución</div>
              </div>

              <div className={`${styles.resumenItem} ${styles.resumenNeutro}`}>
                <div className={styles.resumenValor}>
                  {solicitud.items?.filter(
                    (item) =>
                      !item.porcentaje_variacion ||
                      item.porcentaje_variacion === 0
                  ).length || 0}
                </div>
                <div className={styles.resumenLabel}>Items Sin Cambio</div>
              </div>
            </div>
          </div>

          {/* Detalles de Items */}
          <div className={styles.seccionItems}>
            <h3>Items de la Solicitud ({solicitud.items?.length || 0})</h3>
            <div className={styles.tablaContenedor}>
              <table className={styles.tablaDetalles}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Código de Barras</th>
                    <th>Item</th>
                    <th>Descripción</th>
                    <th>U.M</th>
                    <th>Gramaje</th>
                    <th>Costo Actual</th>
                    <th>Costo Nuevo</th>
                    <th>Variación</th>
                    <th>IVA</th>
                    <th>ICUI</th>
                    <th>IPO</th>
                    <th>Pie Factura 1</th>
                    <th>Pie Factura 2</th>
                    {/* Columnas adicionales para solicitudes aplicadas */}
                    {esSolicitudAplicada && (
                      <>
                        <th>Valor Pie Factura</th>
                        <th>Costo con Pie</th>
                        <th>Costo + ICUI</th>
                        <th>Valor IVA</th>
                        <th>Costo + IVA</th>
                        <th>Margen</th>
                        <th>Precio Final</th>
                        <th>PDV</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {solicitud.items?.map((item, index) => {
                    const iconoVariacion = obtenerIconoVariacion(
                      item.porcentaje_variacion
                    );
                    return (
                      <tr key={index}>
                        <td className={styles.columnaNumero}>{index + 1}</td>
                        <td className={styles.codigoBarras}>
                          {item.codigo_barras}
                        </td>
                        <td className={styles.codigoItem}>{item.id_item}</td>
                        <td className={styles.descripcion}>
                          {item.descripcion}
                        </td>
                        <td className={styles.unidad}>{item.unidad_medida}</td>
                        <td className={styles.gramaje}>{item.gramaje}</td>
                        <td className={styles.costo}>
                          {formatearMoneda(item.costo_sin_iva_actual)}
                        </td>
                        <td className={styles.costo}>
                          {formatearMoneda(item.costo_sin_iva_nuevo)}
                        </td>
                        <td
                          className={`${
                            styles.variacion
                          } ${obtenerClaseVariacion(
                            item.porcentaje_variacion
                          )}`}
                        >
                          {iconoVariacion && (
                            <FontAwesomeIcon icon={iconoVariacion} />
                          )}
                          {item.porcentaje_variacion
                            ? Math.abs(item.porcentaje_variacion).toFixed(2)
                            : "0.00"}
                          %
                        </td>
                        <td className={styles.iva}>
                          {formatearPorcentaje(item.iva)}
                        </td>
                        <td className={styles.impuesto}>
                          {formatearMoneda(item.valor_icui)}
                        </td>
                        <td className={styles.impuesto}>
                          {formatearMoneda(item.valor_ipo)}
                        </td>
                        <td className={styles.impuesto}>
                          {formatearPorcentaje(item.porcentaje_pie_factura1)}
                        </td>
                        <td className={styles.impuesto}>
                          {formatearPorcentaje(item.porcentaje_pie_factura2)}
                        </td>

                        {/* Columnas adicionales para solicitudes aplicadas */}
                        {esSolicitudAplicada && (
                          <>
                            <td className={styles.costo}>
                              {formatearMoneda(item.valor_pie_factura)}
                            </td>
                            <td className={styles.costo}>
                              {formatearMoneda(item.costo_con_pie_factura)}
                            </td>
                            <td className={styles.costo}>
                              {formatearMoneda(item.costo_mas_icui)}
                            </td>
                            <td className={styles.costo}>
                              {formatearMoneda(item.valor_iva_calculado)}
                            </td>
                            <td className={styles.costo}>
                              {formatearMoneda(item.costo_mas_iva)}
                            </td>
                            <td className={styles.porcentaje}>
                              {formatearPorcentaje(item.margen)}
                            </td>
                            <td className={styles.costoDestacado}>
                              {formatearMoneda(item.precio_final)}
                            </td>
                            <td className={styles.costoDestacado}>
                              {formatearMoneda(item.pdv)}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={styles.pieModal}>
          <button className={styles.botonSecundario} onClick={onClose}>
            Cerrar
          </button>

          {puedeGestionar() && (
            <button
              className={styles.botonPrimario}
              onClick={manejarAccionPrincipal}
            >
              <FontAwesomeIcon icon={obtenerIconoBoton()} />
              {obtenerTextoBoton()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalDetallesSolicitud;
