import React from "react";
import { useNotification } from "../../../contexts/NotificationContext";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faDownload,
  faPrint,
  faCalendarAlt,
  faUser,
  faBox,
  faPercent,
  faArrowUp,
  faArrowDown,
  faMinus,
  faDollarSign,
  faClock,
  faEdit,
  faCheckCircle,
  faTimesCircle,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./ActualizacionCostos.module.css";

const ModalDetallesSolicitud = ({ solicitud, onClose }) => {
  if (!solicitud) return null;

  const { addNotification } = useNotification();

  // Función para exportar a Excel mejorada
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
          label: "FECHA DE APLICACIÓN CONTRATO",
          value: formatearFechaExcel(solicitud.fecha_aplicacion_real),
        });
      }

      datosGenerales.push({
        label: "TOTAL DE ITEMS",
        value: solicitud.resumen?.total_items || solicitud.items?.length || 0,
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
      if (solicitud.resumen) {
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

        const datosResumen = [
          {
            label: "VARIACIÓN PROMEDIO",
            value: `${
              solicitud.resumen.variacion_promedio?.toFixed(2) || "0.00"
            }%`,
            color: "FFEB3B", // Amarillo
          },
          {
            label: "ITEMS CON AUMENTO",
            value: solicitud.resumen.items_con_aumento || 0,
            color: "4CAF50", // Verde
          },
          {
            label: "ITEMS CON DISMINUCIÓN",
            value: solicitud.resumen.items_con_disminucion || 0,
            color: "F44336", // Rojo
          },
          {
            label: "ITEMS SIN CAMBIO",
            value: solicitud.resumen.items_sin_cambio || 0,
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
      }

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
        { key: "descripcion", header: "DESCRIPCIÓN", width: 0 },
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
        { key: "ibua", header: "IBUA", width: 12, format: "moneda" },
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
        // { key: "margen", header: "MARGEN %", width: 12, format: "porcentaje" },
        // {
        //   key: "precio_final",
        //   header: "PRECIO FINAL",
        //   width: 14,
        //   format: "moneda",
        // },
        // { key: "pdv", header: "PDV", width: 14, format: "moneda" },
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
      let maxDescripcionLength = 0;

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
              const descripcion = item.descripcion || "";
              // Calcular longitud máxima para autoajuste
              maxDescripcionLength = Math.max(
                maxDescripcionLength,
                descripcion.length
              );
              return descripcion;
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
            case "ibua":
              return formatearNumeroExcel(item.valor_ibua);
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
            // case "margen":
            //   return formatearNumeroExcel(item.margen) / 100;
            // case "precio_final":
            //   return formatearNumeroExcel(item.precio_final);
            // case "pdv":
            //   return formatearNumeroExcel(item.pdv);
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
              wrapText: colConfig.key === "descripcion", // Wrap text solo para descripción
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

          // Ajustar altura de fila para descripciones largas
          if (colConfig.key === "descripcion" && item.descripcion) {
            const descLength = item.descripcion.length;
            if (descLength > 100) {
              row.height = 40;
            } else if (descLength > 50) {
              row.height = 30;
            }
          }
        });
      });

      // Configurar anchos de columnas con autoajuste para descripción
      const columnasConAncho = columnas.map((col) => {
        if (col.key === "descripcion") {
          // Autoajuste basado en la longitud máxima
          const anchoDescripcion = Math.min(
            Math.max(35, maxDescripcionLength * 0.8),
            60
          );
          return { width: anchoDescripcion };
        }
        return { width: col.width };
      });

      wsItems.columns = columnasConAncho;

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

  // Funciones auxiliares
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

  const formatearMoneda = (valor) => {
    if (valor === "" || valor === null || valor === undefined || isNaN(valor))
      return "$0.00";
    const numero =
      typeof valor === "string"
        ? parseFloat(valor.replace(/[^\d.-]/g, "").replace(",", "."))
        : parseFloat(valor);
    if (isNaN(numero)) return "$0.00";
    return `$${numero.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "No definida";

    if (typeof fecha === "string" && fecha.length === 10) {
      const date = new Date(fecha + "T12:00:00");
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    const date = new Date(fecha);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearPorcentaje = (valor) => {
    if (!valor || isNaN(valor)) return "0.00%";
    return `${parseFloat(valor).toFixed(2)}%`;
  };

  const obtenerClaseVariacion = (porcentaje) => {
    if (porcentaje > 0) return styles.variacionPositiva;
    if (porcentaje < 0) return styles.variacionNegativa;
    return styles.variacionNeutra;
  };

  const obtenerIconoVariacion = (porcentaje) => {
    if (porcentaje > 0) return faArrowUp;
    if (porcentaje < 0) return faArrowDown;
    return faMinus;
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
            <button className={styles.botonIcono} title="Imprimir">
              <FontAwesomeIcon icon={faPrint} />
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
          {/* Información general */}
          <div className={styles.seccionInfo}>
            <h3>Información General</h3>
            <div className={styles.gridInfo}>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faUser} />
                <div>
                  <label>Proveedor</label>
                  <span>{solicitud.nombre_proveedor}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                <div>
                  <label>Fecha de Creación</label>
                  <span>{formatearFecha(solicitud.fecha_creacion)}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                <div>
                  <label>Fecha de Aplicación Programada</label>
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
                <FontAwesomeIcon icon={faBox} />
                <div>
                  <label>Total Items</label>
                  <span>
                    {solicitud.resumen?.total_items ||
                      solicitud.items?.length ||
                      0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de variaciones */}
          {solicitud.resumen && (
            <div className={styles.seccionResumen}>
              <h3>Resumen de Variaciones</h3>
              <div className={styles.gridResumen}>
                <div className={styles.resumenItem}>
                  <div className={styles.resumenValor}>
                    {solicitud.resumen.variacion_promedio?.toFixed(2) || "0.00"}
                    %
                  </div>
                  <div className={styles.resumenLabel}>Variación Promedio</div>
                </div>
                <div
                  className={`${styles.resumenItem} ${styles.resumenPositivo}`}
                >
                  <div className={styles.resumenValor}>
                    {solicitud.resumen.items_con_aumento || 0}
                  </div>
                  <div className={styles.resumenLabel}>Items con Aumento</div>
                </div>
                <div
                  className={`${styles.resumenItem} ${styles.resumenNegativo}`}
                >
                  <div className={styles.resumenValor}>
                    {solicitud.resumen.items_con_disminucion || 0}
                  </div>
                  <div className={styles.resumenLabel}>
                    Items con Disminución
                  </div>
                </div>
                <div
                  className={`${styles.resumenItem} ${styles.resumenNeutro}`}
                >
                  <div className={styles.resumenValor}>
                    {solicitud.resumen.items_sin_cambio || 0}
                  </div>
                  <div className={styles.resumenLabel}>Items sin Cambio</div>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de items */}
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
                    <th>IBUA</th>
                    <th>IPO</th>
                    <th>Pie Factura 1</th>
                    <th>Pie Factura 2</th>
                    {esSolicitudAplicada && (
                      <>
                        <th>Valor Pie Factura</th>
                        <th>Costo con Pie</th>
                        <th>Costo + ICUI</th>
                        <th>Valor IVA</th>
                        <th>Costo + IVA</th>
                        {/* <th>Margen</th> */}
                        {/* <th>Precio Final</th> */}
                        {/* <th>PDV</th> */}
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
                          {formatearMoneda(item.valor_ibua)}
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
                            {/* <td className={styles.porcentaje}>
                              {formatearPorcentaje(item.margen)}
                            </td> */}
                            {/* <td className={styles.costoDestacado}>
                              {formatearMoneda(item.precio_final)}
                            </td> */}
                            {/* <td className={styles.costoDestacado}>
                              {formatearMoneda(item.pdv)}
                            </td> */}
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
        </div>
      </div>
    </div>
  );
};

export default ModalDetallesSolicitud;
