import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * Genera y descarga el reporte Excel corporativo de una separata.
 * Preserva la lógica original: logo en A1:B4, encabezado con branding
 * Belalcazar, columnas dinámicas por local (excluyendo 00402/00702/01002),
 * cálculo de PUM y existencias-mitad, y estilos verdes corporativos.
 *
 * @param {Object} params
 * @param {Object} params.currentSeparata
 * @param {Array}  params.separataItems
 * @param {string} params.logo - URL del logo importado
 * @param {Function} params.addNotification
 */
export async function exportarAExcel({
  currentSeparata,
  separataItems,
  logo,
  addNotification,
}) {
  if (!currentSeparata || separataItems.length === 0) {
    addNotification({
      message: "No hay datos para exportar",
      type: "warning",
    });
    return;
  }

  try {
    const libroTrabajo = new ExcelJS.Workbook();
    const hojaTrabajo = libroTrabajo.addWorksheet("Separata");

    const localesUnicos = new Set();
    separataItems.forEach((item) => {
      if (item.existencias && typeof item.existencias === "object") {
        Object.keys(item.existencias).forEach((local) => {
          if (!["00402", "00702", "01002"].includes(local)) {
            localesUnicos.add(local);
          }
        });
      }
    });

    const localesArray = Array.from(localesUnicos).sort();
    const totalColumnas = 10 + localesArray.length + 4;

    try {
      const response = await fetch(logo);
      const arrayBuffer = await response.arrayBuffer();

      const logoId = libroTrabajo.addImage({
        buffer: arrayBuffer,
        extension: "png",
      });

      hojaTrabajo.addImage(logoId, {
        tl: { col: 0.6, row: 0.6 },
        br: { col: 1.99, row: 3.6 },
      });
    } catch (error) {
      console.error("Error procesando imagen local", error);
    }

    for (let r = 1; r <= 4; r++) {
      for (let c = 1; c <= totalColumnas; c++) {
        hojaTrabajo.getCell(r, c).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF2F9F6" },
        };
        if (r === 4) {
          hojaTrabajo.getCell(r, c).border = {
            bottom: { style: "thick", color: { argb: "FF009B6D" } },
          };
        }
      }
    }

    for (let i = 1; i <= 4; i++) {
      hojaTrabajo.mergeCells(i, 3, i, totalColumnas);
    }
    hojaTrabajo.mergeCells(1, 1, 4, 2);

    hojaTrabajo.getRow(1).height = 25;
    hojaTrabajo.getRow(2).height = 20;
    hojaTrabajo.getRow(3).height = 20;
    hojaTrabajo.getRow(4).height = 20;
    hojaTrabajo.getRow(5).height = 15;

    const tituloEmpresa = hojaTrabajo.getCell(1, 3);
    tituloEmpresa.value =
      "SUPERMERCADO BELALCAZAR - ABASTECEMOS DE OCCIDENTE S.A.S";
    tituloEmpresa.font = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: "FF009B6D" },
    };
    tituloEmpresa.alignment = { vertical: "middle", horizontal: "left" };

    const subtituloReporte = hojaTrabajo.getCell(2, 3);
    subtituloReporte.value = "REPORTE DETALLADO DE SEPARATA PROMOCIONAL";
    subtituloReporte.font = {
      name: "Arial",
      size: 12,
      bold: true,
      color: { argb: "FF404040" },
    };
    subtituloReporte.alignment = { vertical: "middle", horizontal: "left" };

    const datosSeparata = hojaTrabajo.getCell(3, 3);
    const nombreSeparata =
      currentSeparata.titulo || `Separata ID: ${currentSeparata.id}`;
    datosSeparata.value = `Documento: ${nombreSeparata}`;
    datosSeparata.font = {
      name: "Arial",
      size: 11,
      bold: true,
      color: { argb: "FF202020" },
    };
    datosSeparata.alignment = { vertical: "middle", horizontal: "left" };

    const fechasSeparata = hojaTrabajo.getCell(4, 3);
    const fechaReporte = new Date().toLocaleDateString("es-CO");
    fechasSeparata.value = `Vigencia: ${currentSeparata.fecha_inicio} al ${currentSeparata.fecha_final}  |  Generado: ${fechaReporte}`;
    fechasSeparata.font = {
      name: "Arial",
      size: 10,
      italic: true,
      color: { argb: "FF606060" },
    };
    fechasSeparata.alignment = { vertical: "middle", horizontal: "left" };

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
      },
      border: {
        top: { style: "thin", color: { argb: "FFBFBFBF" } },
        left: { style: "thin", color: { argb: "FFBFBFBF" } },
        bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
        right: { style: "thin", color: { argb: "FFBFBFBF" } },
      },
      alignment: { vertical: "middle", horizontal: "center" },
    };

    const estiloCelda = {
      border: {
        top: { style: "thin", color: { argb: "FFE7E6E6" } },
        left: { style: "thin", color: { argb: "FFE7E6E6" } },
        bottom: { style: "thin", color: { argb: "FFE7E6E6" } },
        right: { style: "thin", color: { argb: "FFE7E6E6" } },
      },
      alignment: { vertical: "middle" },
    };

    const encabezadosBase = [
      "#",
      "Comprador",
      "Linea 2",
      "Item",
      "Descripcion",
      "Unidad",
      "Gramaje",
      "Precio Antes",
      "Precio Ahora",
      "PUM",
    ];

    const encabezadosLocales = localesArray.map((local) => `Local ${local}`);

    const encabezadosFinales = [
      "Total Exist.",
      "Dcto",
      "Observaciones",
      "Ingreso",
    ];

    const encabezados = [
      ...encabezadosBase,
      ...encabezadosLocales,
      ...encabezadosFinales,
    ];

    const filaEncabezadosTabla = hojaTrabajo.getRow(6);
    filaEncabezadosTabla.values = encabezados;
    filaEncabezadosTabla.height = 30;

    filaEncabezadosTabla.eachCell((celda) => {
      celda.fill = estiloEncabezado.fill;
      celda.font = estiloEncabezado.font;
      celda.border = estiloEncabezado.border;
      celda.alignment = estiloEncabezado.alignment;
    });

    separataItems.forEach((item, indice) => {
      const medida = parseFloat(item.medida) || 1;
      const pum =
        medida > 0
          ? parseFloat((parseFloat(item.precio_ahora) / medida).toFixed(2))
          : 0;

      const filaValores = [
        indice + 1,
        item.usuario,
        item.linea2 || "",
        item.item,
        item.descripcion,
        item.unidad_medida,
        parseFloat(item.medida) || 0,
        parseFloat(item.precio_antes) || 0,
        parseFloat(item.precio_ahora) || 0,
        pum,
      ];

      let existenciasTotales = 0;

      localesArray.forEach((local) => {
        const cantidad =
          item.existencias && item.existencias[local]
            ? parseFloat(item.existencias[local]) || 0
            : 0;
        const cantidadMitad = Math.round(cantidad / 2);
        existenciasTotales += cantidadMitad;
        filaValores.push(cantidadMitad);
      });

      filaValores.push(existenciasTotales);
      filaValores.push(parseFloat(item.descuento) / 100);
      filaValores.push(item.observaciones);
      filaValores.push(item.created_at);

      const fila = hojaTrabajo.addRow(filaValores);

      fila.eachCell((celda) => {
        celda.border = estiloCelda.border;
        celda.alignment = estiloCelda.alignment;
      });

      fila.getCell(7).numFmt = "#,##0";
      fila.getCell(8).numFmt = '"$"#,##0';
      fila.getCell(9).numFmt = '"$"#,##0';
      fila.getCell(10).numFmt = '"$"#,##0.00';

      let colIndex = 11;
      localesArray.forEach(() => {
        fila.getCell(colIndex).numFmt = "#,##0";
        colIndex++;
      });

      fila.getCell(colIndex).numFmt = "#,##0";
      colIndex++;
      fila.getCell(colIndex).numFmt = "0%";
    });

    hojaTrabajo.columns.forEach((columna, i) => {
      let longitudMaxima = 12;
      if (i === 4) longitudMaxima = 45;
      if (i === 1) longitudMaxima = 15;

      columna.eachCell({ includeEmpty: false }, (celda, numeroFila) => {
        if (numeroFila > 5) {
          const valor = celda.value ? celda.value.toString() : "";
          const longitud = valor.length;
          if (longitud > longitudMaxima && i !== 4 && i !== 1) {
            longitudMaxima = longitud;
          }
        }
      });
      columna.width = longitudMaxima + 2;
    });

    const buffer = await libroTrabajo.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Separata_${currentSeparata.id}_Belalcazar.xlsx`);

    addNotification({
      message: "Reporte corporativo generado correctamente",
      type: "success",
    });
  } catch (error) {
    console.error(error);
    addNotification({
      message: "Error al generar el archivo corporativo",
      type: "error",
    });
  }
}
