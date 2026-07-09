import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  normalizarFechaDian,
  extraerSedeYTipoDianDinamico,
} from "../utils/dianParserUtils";

export const useDianExcelProcessor = (
  maestroDianActivo,
  addNotification,
  setLoading,
) => {
  const [datosDian, setDatosDian] = useState(null);
  const [documentosFaltantesDian, setDocumentosFaltantesDian] = useState([]);

  const procesarExcelDian = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setLoading(true);
      const reader = new FileReader();

      reader.onload = (evt) => {
        try {
          const arrayBuffer = evt.target.result;
          const workbook = XLSX.read(arrayBuffer, {
            type: "array",
            dense: true,
            cellFormula: false,
            cellHTML: false,
            cellText: false,
            cellDates: false,
          });

          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error("El archivo de Excel no contiene hojas validas.");
          }

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet)
            throw new Error(
              "La primera hoja del archivo de Excel no es valida.",
            );

          // Ingesta optimizada de matriz indexada densa
          let datosSabana = worksheet["!data"]
            ? worksheet["!data"]
            : XLSX.utils
                .sheet_to_json(worksheet, { header: 1, defval: null })
                .map((fila) =>
                  Array.isArray(fila)
                    ? fila.map((celda) => ({ v: celda }))
                    : [],
                );

          if (!datosSabana || datosSabana.length === 0)
            throw new Error("El archivo cargado esta vacio.");

          const filaCabecera = datosSabana[0].map((celda) =>
            String(celda?.v || "")
              .trim()
              .toUpperCase(),
          );
          const idxTipoDoc = filaCabecera.indexOf("TIPO DE DOCUMENTO");
          const idxPrefijo = filaCabecera.indexOf("PREFIJO");
          const idxFecha = filaCabecera.indexOf("FECHA EMISIÓN");

          if (idxPrefijo === -1 || idxFecha === -1 || idxTipoDoc === -1) {
            throw new Error(
              "Estructura Invalida. Encabezados requeridos faltantes en la sabana DIAN.",
            );
          }

          const mapaAgrupado = {};
          const mapaHuerfanos = {};

          for (let i = 1; i < datosSabana.length; i++) {
            const fila = datosSabana[i];
            if (!fila || fila.length === 0) continue;

            const valTipoDoc = fila[idxTipoDoc]?.v;
            const valPrefijo = fila[idxPrefijo]?.v;
            const valFecha = fila[idxFecha]?.v;

            if (
              valPrefijo === undefined ||
              valFecha === undefined ||
              valTipoDoc === undefined
            )
              continue;

            const tDocUpper = String(valTipoDoc).trim().toUpperCase();
            const prefijoNorm = String(valPrefijo).trim().toUpperCase();
            const fechaNormalizadaISO = normalizarFechaDian(valFecha);

            if (!fechaNormalizadaISO || fechaNormalizadaISO.length !== 10)
              continue;
            if (
              !tDocUpper.includes("FACTURA") &&
              !tDocUpper.includes("NOTA DE CRÉDITO") &&
              !tDocUpper.includes("NOTA DE CREDITO")
            )
              continue;

            const fKey = fechaNormalizadaISO.replace(/-/g, "");
            if (fKey.length !== 8 || isNaN(Number(fKey))) continue;

            if (!mapaAgrupado[fKey]) {
              mapaAgrupado[fKey] = {
                totales_compuestos: {},
                prefijos: {},
                total_pdv: 0,
                total_estandar: 0,
                total_general: 0,
              };
            }

            const objDia = mapaAgrupado[fKey];
            const infoDian = extraerSedeYTipoDianDinamico(
              tDocUpper,
              prefijoNorm,
              maestroDianActivo,
            );

            if (!infoDian || !infoDian.sede || infoDian.sede === "") {
              const llaveHuerfano = `${prefijoNorm}|${tDocUpper}`;
              if (!mapaHuerfanos[llaveHuerfano]) {
                mapaHuerfanos[llaveHuerfano] = {
                  prefijo: prefijoNorm,
                  tipo_documento: tDocUpper,
                  total_timbrados: 0,
                  fecha_muestra: String(valFecha).trim(),
                };
              }
              mapaHuerfanos[llaveHuerfano].total_timbrados++;
              objDia.total_general++;
              continue;
            }

            const llaveCompuesta = `${String(infoDian.sede).padStart(3, "0")}_${String(infoDian.tipo).trim().toUpperCase()}_${prefijoNorm}`;
            objDia.totales_compuestos[llaveCompuesta] =
              (objDia.totales_compuestos[llaveCompuesta] || 0) + 1;
            objDia.prefijos[prefijoNorm] =
              (objDia.prefijos[prefijoNorm] || 0) + 1;
            objDia.total_general++;

            const esPdv = maestroDianActivo.some(
              (r) =>
                String(r.tipo_siesa).trim().toUpperCase() ===
                  String(infoDian.tipo).trim().toUpperCase() &&
                r.categoria === "PDV",
            );
            if (esPdv) objDia.total_pdv++;
            else objDia.total_estandar++;
          }

          setDatosDian(mapaAgrupado);
          setDocumentosFaltantesDian(Object.values(mapaHuerfanos));
          addNotification({
            type: "success",
            message: "Archivo de la DIAN indexado con exito.",
          });
        } catch (err) {
          addNotification({
            type: "error",
            message: `Error interpretando listado DIAN: ${err.message}`,
          });
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [maestroDianActivo, addNotification, setLoading],
  );

  return {
    datosDian,
    setDatosDian,
    documentosFaltantesDian,
    setDocumentosFaltantesDian,
    procesarExcelDian,
  };
};
