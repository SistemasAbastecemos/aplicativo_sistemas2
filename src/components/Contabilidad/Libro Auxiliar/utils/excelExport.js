import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from "../../../../assets/images/logo.png";
import { EMPRESAS, COLUMNAS_EXPORT } from "./constants";
import { getBase64ImageFromUrl } from "./helpers";

/**
 * Genera y descarga un Excel corporativo con branding de Belalcázar.
 *
 * Estructura preservada del legacy:
 *  - Filas 1-4: logo (A1:C4) + título "LIBRO AUXILIAR POR CUENTA" (D1:J2)
 *    + resumen de filtros aplicados (D3:J4)
 *  - Fila 6: encabezados con fondo verde corporativo #009B6D y letra
 *    blanca, con bordes
 *  - Fila 7+: datos
 *  - Última columna (valor_deb): formato numérico "#,##0.00"
 *  - Nombre: Libro_Auxiliar_{empresa}_{timestamp}.xlsx
 *
 * Si el logo no se puede cargar, el Excel se genera sin él (sin abortar).
 */
export const exportarExcelCorporativo = async ({ datos, filtros, sedes }) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Libro Auxiliar", {
    views: [{ showGridLines: false }],
  });

  // ---------- Logo + header corporativo ----------
  const logoBase64 = await getBase64ImageFromUrl(logo);
  if (logoBase64) {
    const logoId = workbook.addImage({
      base64: logoBase64,
      extension: "png",
    });
    worksheet.mergeCells("A1:C4");
    worksheet.addImage(logoId, {
      tl: { col: 0.1, row: 0.2 },
      ext: { width: 160, height: 65 },
    });
  }

  const empresaNombre =
    EMPRESAS.find((e) => e.value === filtros.empresa)?.label || filtros.empresa;
  const sedeNombre =
    sedes.find((s) => s.codigo === filtros.sede)?.descripcion ||
    "CONSOLIDADO GENERAL";
  const proveedorNombre = filtros.proveedor_desc || "TODOS";
  const fechaTxt = filtros.fecha_inicio
    ? `${filtros.fecha_inicio} al ${filtros.fecha_fin}`
    : "Histórico completo";

  worksheet.mergeCells("D1:J2");
  const titleCell = worksheet.getCell("D1");
  titleCell.value = "LIBRO AUXILIAR POR CUENTA";
  titleCell.font = {
    name: "Arial",
    size: 16,
    bold: true,
    color: { argb: "FF1E293B" },
  };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  worksheet.mergeCells("D3:J4");
  const filterCell = worksheet.getCell("D3");
  filterCell.value = `EMPRESA: ${empresaNombre} | SEDE: ${sedeNombre}\nPROVEEDOR: ${proveedorNombre} | PERIODO: ${fechaTxt}`;
  filterCell.font = {
    name: "Arial",
    size: 9,
    italic: true,
    color: { argb: "FF475569" },
  };
  filterCell.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };

  // ---------- Encabezados (fila 6) ----------
  const encabezadosExcel = COLUMNAS_EXPORT.map((c) => c.labelExcel);
  worksheet.getRow(6).values = encabezadosExcel;
  worksheet.getRow(6).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF009B6D" },
    };
    cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // ---------- Datos (fila 7+) ----------
  const idxValorDeb = COLUMNAS_EXPORT.findIndex((c) => c.isNumber) + 1; // 1-indexed
  datos.forEach((row, index) => {
    const rowIndex = 7 + index;
    const worksheetRow = worksheet.getRow(rowIndex);
    worksheetRow.values = COLUMNAS_EXPORT.map((col) => {
      const valor = row[col.key];
      return col.isNumber ? parseFloat(valor || 0) : valor;
    });
    worksheetRow.getCell(idxValorDeb).numFmt = "#,##0.00";
  });

  // ---------- Descarga ----------
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer]),
    `Libro_Auxiliar_${filtros.empresa}_${new Date().getTime()}.xlsx`,
  );
};
