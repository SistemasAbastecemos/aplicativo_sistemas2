import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logoImage from "../../../../../assets/images/logo.png";

/**
 * Genera y descarga un Excel corporativo con branding de Belalcázar.
 *
 * Estructura preservada del legacy:
 *  - Filas 1-4: fondo verde tenue (#F2F9F6), borde inferior grueso en fila 4
 *  - Logo con ancho dinámico calculado según relación de aspecto y anchos
 *    de columnas A/B; si el logo cabe en A queda en A, sino se hace merge
 *    A:B para las filas 1-4
 *  - Header corporativo (título + subtítulo + doc + fechas) merged desde
 *    la columna siguiente al logo hasta la última columna
 *  - Fila 6: encabezados verdes con bordes grises
 *  - Fila 7+: datos con bordes grises tenues; centrado específico en
 *    columnas 4, 5, 6, 7, 9, 13; formato numérico en 10, moneda en 11 y 12
 *  - Autofilter en fila 6
 *  - Freeze pane en fila 6 (los encabezados quedan fijos al scrollear)
 *
 * Nombre del archivo: `existencias_averias_YYYYMMDD.xlsx`.
 */
export const exportarExcelCorporativo = async ({ reporteData }) => {
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

  // ---------- Anchos dinámicos por columna ----------
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
      if (valorStr.length > longitudMaxima && i !== 7 && i !== 0 && i !== 1) {
        longitudMaxima = valorStr.length;
      }
    });

    return {
      key: col.toLowerCase().replace(/ /g, "_"),
      width: Math.min(longitudMaxima + 3, 50),
    };
  });

  hojaTrabajo.columns = columnasConfiguradas;

  // ---------- Alturas de filas del header ----------
  hojaTrabajo.getRow(1).height = 25;
  hojaTrabajo.getRow(2).height = 20;
  hojaTrabajo.getRow(3).height = 20;
  hojaTrabajo.getRow(4).height = 20;
  hojaTrabajo.getRow(5).height = 15;

  // ---------- Fondo verde tenue + borde inferior grueso ----------
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

  // ---------- Cálculo dinámico del ancho/posición del logo ----------
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

  // ---------- Logo ----------
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
    // Si el logo no carga, el Excel se genera igual sin él
    console.error("Error logo:", error);
  }

  // ---------- Header corporativo (título + subtítulo + doc + fechas) ----------
  const colInicioTexto = rangoFinLogoCol + 1;
  for (let i = 1; i <= 4; i++) {
    if (colInicioTexto < totalColumnas) {
      hojaTrabajo.mergeCells(i, colInicioTexto, i, totalColumnas);
    }
  }

  const cellTitulo = hojaTrabajo.getCell(1, colInicioTexto);
  cellTitulo.value = "SUPERMERCADO BELALCAZAR - ABASTECEMOS DE OCCIDENTE S.A.S";
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

  // ---------- Fila 6: encabezados verdes ----------
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

  // ---------- Datos (fila 7+) ----------
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

    // Centrado específico por columna
    [4, 5, 6, 7, 9, 13].forEach((colIdx) => {
      nuevaFila.getCell(colIdx).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
    });

    // Formatos numéricos
    nuevaFila.getCell(10).numFmt = "#,##0.00";
    nuevaFila.getCell(11).numFmt = '"$"#,##0.00';
    nuevaFila.getCell(12).numFmt = '"$"#,##0.00';
  });

  // ---------- Autofilter y freeze pane ----------
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

  // ---------- Descarga ----------
  const buffer = await libroTrabajo.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const fechaArchivo = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  saveAs(blob, `existencias_averias_${fechaArchivo}.xlsx`);
};
