import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from "../../../../assets/images/logo.png";

/**
 * Genera y descarga un Excel corporativo con branding de Belalcázar.
 *
 * Estructura preservada del legacy:
 *  - Filas 1-4: fondo verde tenue (#F2F9F6) + logo (A1:C4)
 *  - Fila 1 col 4-10: título corporativo "SUPERMERCADO BELALCAZAR..."
 *  - Fila 2 col 4-10: subtítulo "REPORTE DE MEDIOS DE RECAUDO"
 *  - Fila 3 col 4-10: parámetros del filtro aplicado
 *  - Fila 4: borde inferior verde grueso (#009B6D)
 *  - Fila 6: encabezados con fondo verde y letra blanca
 *  - Fila 7+: datos, con columna 9 (valor) en formato "$"#,##0
 *  - Ancho de columnas: auto según contenido (min 12, +2 padding)
 *
 * El nombre del archivo se arma dinámicamente según filtros:
 *   Reporte_Recaudos_{fechaInicio}_al_{fechaFin}_{transaccion}.xlsx
 *   o
 *   Reporte_Recaudos_{lapso}_{transaccion}.xlsx
 */
export const exportarExcelRecaudos = async ({
  datos,
  filtros,
}) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Recaudos");

  // ---------- Logo corporativo ----------
  try {
    const response = await fetch(logo);
    const arrayBuffer = await response.arrayBuffer();
    const logoId = workbook.addImage({
      buffer: arrayBuffer,
      extension: "png",
    });
    worksheet.addImage(logoId, {
      tl: { col: 0.5, row: 0.5 },
      br: { col: 2.5, row: 3.5 },
    });
  } catch (error) {
    // Si el logo no carga, el Excel se genera igual sin él
    console.error("Error al cargar el logo corporativo", error);
  }

  // ---------- Fondo verde tenue + borde inferior (filas 1-4) ----------
  for (let r = 1; r <= 4; r++) {
    for (let c = 1; c <= 10; c++) {
      worksheet.getCell(r, c).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2F9F6" },
      };
      if (r === 4) {
        worksheet.getCell(r, c).border = {
          bottom: { style: "thick", color: { argb: "FF009B6D" } },
        };
      }
    }
  }

  // ---------- Merge cells para header corporativo ----------
  worksheet.mergeCells(1, 4, 1, 10);
  worksheet.mergeCells(2, 4, 2, 10);
  worksheet.mergeCells(3, 4, 3, 10);
  worksheet.mergeCells(4, 4, 4, 10);

  const tituloCelda = worksheet.getCell(1, 4);
  tituloCelda.value =
    "SUPERMERCADO BELALCAZAR - ABASTECEMOS DE OCCIDENTE S.A.S";
  tituloCelda.font = {
    name: "Arial",
    size: 16,
    bold: true,
    color: { argb: "FF009B6D" },
  };
  tituloCelda.alignment = { vertical: "middle", horizontal: "left" };

  const subtituloCelda = worksheet.getCell(2, 4);
  subtituloCelda.value = "REPORTE DE MEDIOS DE RECAUDO";
  subtituloCelda.font = {
    name: "Arial",
    size: 12,
    bold: true,
    color: { argb: "FF404040" },
  };
  subtituloCelda.alignment = { vertical: "middle", horizontal: "left" };

  const parametrosCelda = worksheet.getCell(3, 4);
  const textoParametros =
    filtros.tipoFiltro === "fecha"
      ? `Rango: ${filtros.fechaInicio} al ${filtros.fechaFin}`
      : `Lapso: ${filtros.lapso}`;
  parametrosCelda.value = `Filtro: ${textoParametros} | Transacciones: ${filtros.tipoTransaccion}`;
  parametrosCelda.font = {
    name: "Arial",
    size: 11,
    color: { argb: "FF202020" },
  };
  parametrosCelda.alignment = { vertical: "middle", horizontal: "left" };

  // ---------- Encabezados (fila 6) ----------
  worksheet.getRow(6).values = [
    "Sede",
    "Tipo Doc",
    "Nº Documento",
    "Fecha",
    "Lapso",
    "Modo",
    "Medio Recaudo",
    "Referencia",
    "Valor",
  ];

  worksheet.getRow(6).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF009B6D" },
    };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFBFBFBF" } },
      left: { style: "thin", color: { argb: "FFBFBFBF" } },
      bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
      right: { style: "thin", color: { argb: "FFBFBFBF" } },
    };
  });

  // ---------- Datos (fila 7+) ----------
  datos.forEach((row) => {
    const rowData = [
      row.id_co,
      row.id_tipdoc,
      row.documento_fc,
      row.fecha_fc,
      row.lapso_doc,
      row.ind_modo,
      row.medio_desc,
      row.medio_refer,
      parseFloat(row.vlr_recaudo) || 0,
    ];

    const dataRow = worksheet.addRow(rowData);
    dataRow.eachCell((cell) => {
      cell.alignment = { vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE7E6E6" } },
        left: { style: "thin", color: { argb: "FFE7E6E6" } },
        bottom: { style: "thin", color: { argb: "FFE7E6E6" } },
        right: { style: "thin", color: { argb: "FFE7E6E6" } },
      };
    });
    dataRow.getCell(9).numFmt = '"$"#,##0';
  });

  // ---------- Anchos de columna auto ----------
  worksheet.columns.forEach((column) => {
    let maxLength = 12;
    column.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 5) {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) maxLength = columnLength;
      }
    });
    column.width = maxLength + 2;
  });

  // ---------- Nombre dinámico del archivo ----------
  let nombreArchivo = "Reporte_Recaudos_";
  nombreArchivo +=
    filtros.tipoFiltro === "fecha"
      ? `${filtros.fechaInicio}_al_${filtros.fechaFin}`
      : `${filtros.lapso}`;
  nombreArchivo += `_${filtros.tipoTransaccion}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, nombreArchivo);
};
