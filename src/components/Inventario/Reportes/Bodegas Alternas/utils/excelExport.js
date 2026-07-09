import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logoImage from "../../../../../assets/images/logo.png";
import { EXCEL_CONFIG } from "./constants";

export const exportarReporteBodegasAlternasExcel = async (
  reporteData,
  estructuras,
  lapsoCalendario,
) => {
  if (!reporteData || reporteData.length === 0) return false;

  const { bodegas02, bodegasAlt } = estructuras;
  const hayB02 = Array.isArray(bodegas02) && bodegas02.length > 0;

  const libroTrabajo = new ExcelJS.Workbook();
  const hojaTrabajo = libroTrabajo.addWorksheet("Bodegas Alternas");

  // Construccion dinamica de encabezados
  const columnasTabla = ["Item", "Descripcion", "Embalaje"];
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

  hojaTrabajo.columns = columnasTabla.map((col) => ({
    header: col,
    key: col.replace(/[^a-zA-Z0-9_]/g, "_"),
  }));

  // Renderizado del banner superior corporativo
  for (let r = 1; r <= 4; r++) {
    hojaTrabajo.getRow(r).height = r === 1 ? 26 : 20;
    for (let c = 1; c <= columnasTabla.length; c++) {
      hojaTrabajo.getCell(r, c).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: EXCEL_CONFIG.COLOR_BG_BANNER },
      };
    }
  }

  // Inyeccion del logo institucional
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
    console.warn("No se pudo incrustar el logo corporativo:", e);
  }

  // Textos y titulos institucionales
  hojaTrabajo.mergeCells(1, 3, 1, columnasTabla.length);
  hojaTrabajo.mergeCells(2, 3, 2, columnasTabla.length);
  hojaTrabajo.mergeCells(3, 3, 3, columnasTabla.length);

  const cellT1 = hojaTrabajo.getCell(1, 3);
  cellT1.value = "SUPERMERCADO BELALCAZAR - ABASTECEMOS DE OCCIDENTE S.A.S";
  cellT1.font = {
    name: "Arial",
    size: 14,
    bold: true,
    color: { argb: EXCEL_CONFIG.COLOR_PRIMARY },
  };
  cellT1.alignment = { vertical: "middle", horizontal: "left" };

  const cellT2 = hojaTrabajo.getCell(2, 3);
  cellT2.value = "REPORTE DE EXISTENCIAS EN BODEGAS ALTERNAS (UNIDADES)";
  cellT2.font = {
    name: "Arial",
    size: 11,
    bold: true,
    color: { argb: EXCEL_CONFIG.COLOR_SECONDARY },
  };
  cellT2.alignment = { vertical: "middle", horizontal: "left" };

  const cellT3 = hojaTrabajo.getCell(3, 3);
  cellT3.value = `Periodo Contable: ${lapsoCalendario} | Generado: ${new Date().toLocaleDateString("es-CO")}`;
  cellT3.font = {
    name: "Arial",
    size: 9.5,
    italic: true,
    color: { argb: EXCEL_CONFIG.COLOR_TEXT_MUTED },
  };
  cellT3.alignment = { vertical: "middle", horizontal: "left" };

  // Agrupacion superior (Fila 5)
  const estiloGrupo = {
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: EXCEL_CONFIG.COLOR_BG_GRUPO },
    },
    font: { bold: true, color: { argb: "FFFFFFFF" }, size: 11, name: "Arial" },
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

  // Subcabeceras reales (Fila 6)
  const fila6 = hojaTrabajo.getRow(6);
  fila6.height = 24;
  fila6.values = columnasTabla;
  fila6.eachCell((c) => {
    c.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: EXCEL_CONFIG.COLOR_PRIMARY },
    };
    c.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
      size: 10,
      name: "Arial",
    };
    c.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });

  // Iteracion e inyeccion fisica del cuerpo
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
        Number(item.Total_Exist_Und_B02 || 0),
        Number(item.Total_Venta_Und || 0),
      );
    }
    filaCuerpo.push(Number(item.Total_Exist_Und_Alternas || 0));

    const rNueva = hojaTrabajo.addRow(filaCuerpo);
    rNueva.height = 20;
    rNueva.eachCell((cell, cNum) => {
      cell.font = { name: "Arial", size: 9.5 };
      cell.border = {
        top: { style: "thin", color: { argb: EXCEL_CONFIG.COLOR_BORDER } },
        left: { style: "thin", color: { argb: EXCEL_CONFIG.COLOR_BORDER } },
        bottom: { style: "thin", color: { argb: EXCEL_CONFIG.COLOR_BORDER } },
        right: { style: "thin", color: { argb: EXCEL_CONFIG.COLOR_BORDER } },
      };

      if (cNum > 3) {
        cell.numFmt = "#,##0";
        cell.alignment = { horizontal: "right", vertical: "middle" };
      } else {
        cell.alignment = { vertical: "middle" };
      }
    });
  });

  // Autoajuste dinámico de anchos de columna
  for (let i = 1; i <= columnasTabla.length; i++) {
    const colInstancia = hojaTrabajo.getColumn(i);
    let maxLen = columnasTabla[i - 1].length;

    if (colInstancia && colInstancia.values) {
      colInstancia.values.forEach((val, rowIdx) => {
        if (rowIdx > 6 && val !== undefined && val !== null) {
          const strLen = String(val).length;
          if (strLen > maxLen) maxLen = strLen;
        }
      });
    }

    if (i === 2) maxLen = Math.max(maxLen, 45); // Descripcion
    colInstancia.width = Math.max(maxLen + 4, 12);
  }

  hojaTrabajo.views = [
    { state: "frozen", xSplit: 3, ySplit: 6, topLeftCell: "D7" },
  ];

  const buffer = await libroTrabajo.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer]),
    `reporte_bodegas_alternas_${lapsoCalendario.replace("-", "")}.xlsx`,
  );
  return true;
};
