import React, { useState, useEffect, useMemo } from "react";
import styles from "./PrefijosDian.module.css";
import { apiService } from "../../../services/api";
import LoadingScreen from "../../UI/LoadingScreen";
import { useNotification } from "../../../contexts/NotificationContext";
import { useAuth } from "../../../contexts/AuthContext";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faServer,
  faCalendarAlt,
  faBuilding,
  faFileExcel,
  faCogs,
  faTable,
  faSave,
  faLock,
} from "@fortawesome/free-solid-svg-icons";

import { AlertasAuditoria } from "./components/AlertasAuditoria";
import { TabAuditoriaMatriz } from "./components/TabAuditoriaMatriz";
import { TabParametrizacion } from "./components/TabParametrizacion";

const AuditoriaDian = () => {
  const { addNotification } = useNotification();
  const { user } = useAuth();
  const loginUsuario = user?.login || "sistema";
  const [activeTab, setActiveTab] = useState("auditoria");
  const [empresa, setEmpresa] = useState("abastecemos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [columnas, setColumnas] = useState([]);
  const [reporte, setReporte] = useState([]);
  const [error, setError] = useState(null);
  const [datosDian, setDatosDian] = useState(null);

  // configList representa el maestro persistido oficialmente (usado para calcular alertas)
  const [configList, setConfigList] = useState([]);
  // configListEdit representa el estado volátil de edición usado en TabParametrizacion
  const [configListEdit, setConfigListEdit] = useState([]);

  const [maestroDianActivo, setMaestroDianActivo] = useState([]);
  const [documentosFaltantesDian, setDocumentosFaltantesDian] = useState([]);
  const [alertasSiesaHuerfanos, setAlertasSiesaHuerfanos] = useState([]);
  const [ultimoIndexCreado, setUltimoIndexCreado] = useState(null);

  const [diasConciliados, setDiasConciliados] = useState({});
  const [guardandoConciliacion, setGuardandoConciliacion] = useState(false);

  useEffect(() => {
    const ahora = new Date();
    const primerDia = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const ayer = new Date();
    ayer.setDate(ahora.getDate() - 1);

    const formatFecha = (d) => {
      const mes = String(d.getMonth() + 1).padStart(2, "0");
      const dia = String(d.getDate()).padStart(2, "0");
      return `${d.getFullYear()}-${mes}-${dia}`;
    };

    setFechaInicio(formatFecha(primerDia));
    setFechaFin(formatFecha(ayer));
    cargarConfiguracionMaestra();
  }, []);

  // Si el usuario cambia a la pestaña de configuracion, sincronizamos el espejo con los datos oficiales
  useEffect(() => {
    if (activeTab === "configuracion") {
      setConfigListEdit(JSON.parse(JSON.stringify(configList)));
    }
  }, [activeTab, configList]);

  const cargarConfiguracionMaestra = async () => {
    try {
      const res = await apiService.obtenerConfiguracionDian();
      const dataRaiz = res.resultado ? res.resultado : res;

      if (res && (res.success || dataRaiz.success)) {
        const listadoLimpio = Array.isArray(dataRaiz)
          ? dataRaiz
          : dataRaiz.resultado || [];
        const datosConIndice = listadoLimpio.map((item, idx) => ({
          ...item,
          indexOriginal: idx,
          activo: item.activo !== undefined ? Number(item.activo) : 1,
        }));
        setConfigList(datosConIndice);
        setConfigListEdit(JSON.parse(JSON.stringify(datosConIndice)));
        setMaestroDianActivo(listadoLimpio);
      }
    } catch (err) {
      console.error("Error cargando configuracion maestro DIAN:", err);
    }
  };

  const cargarDiasConciliados = async (inicio, fin) => {
    try {
      const res = await apiService.obtenerDiasConciliados(empresa, inicio, fin);
      if (res && res.success) {
        setDiasConciliados(res.dias_cerrados || {});
      }
    } catch (err) {
      console.error("Error cargando dias conciliados:", err);
    }
  };

  const sedesAgrupadas = useMemo(() => {
    const estructuraIntermedia = {};
    // La interfaz de parametrizacion ahora consume exclusivamente el espejo editable
    configListEdit.forEach((row) => {
      const sede = row.grupo_sede
        ? row.grupo_sede.trim().toUpperCase()
        : "SIN SEDE";
      const rangoStr = `${row.fecha_desde} AL ${row.fecha_hasta}`;
      if (!estructuraIntermedia[sede]) estructuraIntermedia[sede] = {};
      if (!estructuraIntermedia[sede][rangoStr])
        estructuraIntermedia[sede][rangoStr] = [];
      estructuraIntermedia[sede][rangoStr].push(row.indexOriginal);
    });

    const ordenarSedesNatural = (a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
    const ordenarPeriodosInverso = (a, b) =>
      new Date(b.substring(0, 10)) - new Date(a.substring(0, 10));

    const estructuraFinalOrdenada = {};
    Object.keys(estructuraIntermedia)
      .sort(ordenarSedesNatural)
      .forEach((sede) => {
        estructuraFinalOrdenada[sede] = {};
        Object.keys(estructuraIntermedia[sede])
          .sort(ordenarPeriodosInverso)
          .forEach((periodo) => {
            estructuraFinalOrdenada[sede][periodo] =
              estructuraIntermedia[sede][periodo];
          });
      });

    return estructuraFinalOrdenada;
  }, [configListEdit]);

  const consultarAuditoria = async (e) => {
    e.preventDefault();
    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
      setError("La fecha inicial no puede ser mayor a la fecha final.");
      return;
    }
    setLoading(true);
    setError(null);
    setDatosDian(null);
    setDocumentosFaltantesDian([]);
    setAlertasSiesaHuerfanos([]);
    setDiasConciliados({});

    try {
      const response = await apiService.obtenerAuditoriaDian(
        empresa,
        fechaInicio,
        fechaFin,
      );
      const dataInner =
        response && response.resultado ? response.resultado : response;

      if (dataInner && dataInner.success) {
        setColumnas(dataInner.columnas || []);
        setReporte(dataInner.reporte || []);
        setMaestroDianActivo(dataInner.maestro_config || []);
        if (dataInner.huerfanos_siesa) {
          setAlertasSiesaHuerfanos(dataInner.huerfanos_siesa);
        }
        await cargarDiasConciliados(fechaInicio, fechaFin);
        addNotification({
          type: "success",
          message: "Auditoria cargada con exito",
        });
      } else {
        setError(
          dataInner?.message ||
            "No se encontraron registros en el periodo de tiempo evaluado.",
        );
      }
    } catch (err) {
      setError(
        err.message || "Fallo la conexion con el servidor interno de Siesa.",
      );
    } finally {
      setLoading(false);
    }
  };

  const extraerSedeYTipoDianDinamico = (tipoDocRaw, prefijoRaw) => {
    const tipoDoc = String(tipoDocRaw).trim().toUpperCase();
    const p = String(prefijoRaw).trim().toUpperCase();
    const esNota =
      tipoDoc.includes("NOTA DE CRÉDITO") ||
      tipoDoc.includes("NOTA DE CREDITO");

    const reglaMatch = maestroDianActivo.find((regla) => {
      if (regla.activo !== undefined && Number(regla.activo) === 0)
        return false;
      const prefijosPermitidos = String(regla.prefijos_dian || "")
        .split(",")
        .map((x) => x.trim().toUpperCase())
        .filter(Boolean);
      return (
        prefijosPermitidos.includes(p) &&
        esNota === (regla.tipo_documento === "NOTA")
      );
    });

    if (reglaMatch) {
      return {
        sede: reglaMatch.co_siesa
          ? String(reglaMatch.co_siesa).padStart(3, "0")
          : "",
        tipo: reglaMatch.tipo_siesa
          ? String(reglaMatch.tipo_siesa).trim().toUpperCase()
          : p,
      };
    }
    return { sede: "", tipo: p };
  };

  const normalizarFechaDian = (fechaRaw) => {
    if (fechaRaw === null || fechaRaw === undefined) return "";

    if (
      typeof fechaRaw === "number" ||
      (!isNaN(fechaRaw) &&
        !String(fechaRaw).includes("-") &&
        !String(fechaRaw).includes("/"))
    ) {
      const numeroExcel = Number(fechaRaw);
      const fechaJs = new Date((numeroExcel - 25569) * 86400000);

      if (!isNaN(fechaJs.getTime())) {
        const ano = fechaJs.getUTCFullYear();
        const mes = String(fechaJs.getUTCMonth() + 1).padStart(2, "0");
        const dia = String(fechaJs.getUTCDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
      }
    }

    const fechaStr = String(fechaRaw).trim();
    const soloFecha = fechaStr.split(" ")[0];

    const regexFormatTradicional = /^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/;
    const matchTradicional = soloFecha.match(regexFormatTradicional);

    if (matchTradicional) {
      const [_, dia, mes, ano] = matchTradicional;
      const diaPad = dia.padStart(2, "0");
      const mesPad = mes.padStart(2, "0");
      return `${ano}-${mesPad}-${diaPad}`;
    }

    const regexFormatISO = /^(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})$/;
    const matchISO = soloFecha.match(regexFormatISO);

    if (matchISO) {
      const [_, ano, mes, dia] = matchISO;
      const diaPad = dia.padStart(2, "0");
      const mesPad = mes.padStart(2, "0");
      return `${ano}-${mesPad}-${diaPad}`;
    }

    return soloFecha;
  };

  const procesarExcelDian = (e) => {
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

        if (!worksheet) {
          throw new Error("La primera hoja del archivo de Excel no es valida.");
        }

        let datosSábana = [];

        if (worksheet["!data"]) {
          datosSábana = worksheet["!data"];
        } else {
          datosSábana = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null,
            setIsolateStyles: false,
          });

          datosSábana = datosSábana.map((fila) =>
            Array.isArray(fila) ? fila.map((celda) => ({ v: celda })) : [],
          );
        }

        if (!datosSábana || datosSábana.length === 0) {
          throw new Error(
            "El archivo cargado no contiene registros procesables o esta vacio.",
          );
        }

        const filaCabecera = datosSábana[0].map((celda) =>
          String(celda?.v || "")
            .trim()
            .toUpperCase(),
        );

        const idxTipoDoc = filaCabecera.indexOf("TIPO DE DOCUMENTO");
        const idxPrefijo = filaCabecera.indexOf("PREFIJO");
        const idxFecha = filaCabecera.indexOf("FECHA EMISIÓN");

        if (idxPrefijo === -1 || idxFecha === -1 || idxTipoDoc === -1) {
          throw new Error(
            `Estructura Invalida. Encabezados requeridos faltantes. Encontrados: [${filaCabecera.join(", ")}]`,
          );
        }

        const mapaAgrupado = {};
        const mapaHuerfanos = {};

        for (let i = 1; i < datosSábana.length; i++) {
          const fila = datosSábana[i];
          if (!fila || fila.length === 0) continue;

          const valTipoDoc = fila[idxTipoDoc]?.v;
          const valPrefijo = fila[idxPrefijo]?.v;
          const valFecha = fila[idxFecha]?.v;

          if (
            valPrefijo === undefined ||
            valFecha === undefined ||
            valTipoDoc === undefined
          ) {
            continue;
          }

          const tDocUpper = String(valTipoDoc).trim().toUpperCase();
          const prefijoNorm = String(valPrefijo).trim().toUpperCase();

          const fechaNormalizadaISO = normalizarFechaDian(valFecha);
          if (!fechaNormalizadaISO || fechaNormalizadaISO.length !== 10) {
            continue;
          }

          if (
            !tDocUpper.includes("FACTURA ELECTRÓNICA") &&
            !tDocUpper.includes("FACTURA ELECTRONICA") &&
            !tDocUpper.includes("NOTA DE CRÉDITO") &&
            !tDocUpper.includes("NOTA DE CREDITO")
          ) {
            continue;
          }

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
          const infoDian = extraerSedeYTipoDianDinamico(tDocUpper, prefijoNorm);

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
        console.error("Error critico en procesamiento DIAN:", err);
        addNotification({
          type: "error",
          message: `Error interpretando listado de folios: ${err.message}`,
        });
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      addNotification({
        type: "error",
        message: "Error al leer el archivo fisico.",
      });
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const ejecutarGuardadoConciliacion = async () => {
    if (!datosDian || Object.keys(datosDian).length === 0) {
      addNotification({
        type: "error",
        message: "No hay informacion cargada de la DIAN para guardar.",
      });
      return;
    }

    setGuardandoConciliacion(true);
    try {
      const diasAPescar = [];
      columnas.forEach((col) => {
        const fk = col.replace(/-/g, "");
        if (diasConciliados[col]) return;

        const dianDia = datosDian[fk];
        if (!dianDia || dianDia.total_general === 0) return;

        const totalSiesaPdv = reporte
          .filter((r) => r.bloque === "PDV")
          .reduce((sum, r) => sum + (r.dias[fk]?.total || 0), 0);
        const totalSiesaEst = reporte
          .filter((r) => r.bloque === "ESTANDAR")
          .reduce((sum, r) => sum + (r.dias[fk]?.total || 0), 0);
        const totalSiesaGen = totalSiesaPdv + totalSiesaEst;

        const detalleFilas = reporte.map((item) => {
          const diaData = item.dias[fk] || { total: 0 };
          const centroOad = item.co_siesa
            ? String(item.co_siesa).padStart(3, "0")
            : "";
          let totalDianFila = 0;

          const reglasAsoc = maestroDianActivo.filter(
            (r) =>
              String(r.co_siesa).padStart(3, "0") === centroOad &&
              String(r.tipo_siesa).trim().toUpperCase() ===
                String(item.tipo).trim().toUpperCase(),
          );

          reglasAsoc.forEach((reg) => {
            const prefijos = String(reg.prefijos_dian || "")
              .split(",")
              .map((x) => x.trim().toUpperCase())
              .filter(Boolean);

            prefijos.forEach((pref) => {
              const llave = `${centroOad}_${String(item.tipo).trim().toUpperCase()}_${pref}`;
              if (dianDia.totales_compuestos?.[llave]) {
                totalDianFila += dianDia.totales_compuestos[llave];
              }
            });
          });

          return {
            co_siesa: item.co_siesa,
            tipo: item.tipo,
            total_siesa: diaData.total || 0,
            total_dian: totalDianFila,
            diferencia: (diaData.total || 0) - totalDianFila,
          };
        });

        diasAPescar.push({
          fecha: col,
          total_siesa_pdv: totalSiesaPdv,
          total_siesa_est: totalSiesaEst,
          total_siesa_general: totalSiesaGen,
          total_dian_pdv: dianDia.total_pdv,
          total_dian_est: dianDia.total_estandar,
          total_dian_general: dianDia.total_general,
          detalle_filas: detalleFilas,
        });
      });

      if (diasAPescar.length === 0) {
        addNotification({
          type: "info",
          message: "No hay dias nuevos pendientes por guardar.",
        });
        return;
      }

      const res = await apiService.guardarConciliacionDian(
        empresa,
        loginUsuario,
        diasAPescar,
      );
      if (res && res.success) {
        addNotification({
          type: "success",
          message: res.message || "Conciliacion guardada.",
        });
        await cargarDiasConciliados(fechaInicio, fechaFin);
      }
    } catch (err) {
      addNotification({
        type: "error",
        message: err.message || "Error al procesar guardado de conciliacion.",
      });
    } finally {
      setGuardandoConciliacion(false);
    }
  };

  const handleConfigChange = (indexReal, campo, valor) => {
    setConfigListEdit((prev) =>
      prev.map((row) =>
        row.indexOriginal === indexReal ? { ...row, [campo]: valor } : row,
      ),
    );
  };

  const toggleEstadoActivo = (indexReal) => {
    setConfigListEdit((prev) =>
      prev.map((row) =>
        row.indexOriginal === indexReal
          ? { ...row, activo: row.activo === 1 ? 0 : 1 }
          : row,
      ),
    );
  };

  const handleRemoveConfigRow = (indexReal) => {
    setConfigListEdit((prev) =>
      prev.filter((row) => row.indexOriginal !== indexReal),
    );
  };

  const handleAddConfigRow = () => {
    const nuevoIdx =
      configListEdit.length > 0
        ? Math.max(...configListEdit.map((r) => r.indexOriginal)) + 1
        : 0;

    const nuevoFila = {
      indexOriginal: nuevoIdx,
      categoria: "PDV",
      tipo_documento: "FACTURA",
      sub_bloque: "NORMAL",
      grupo_sede: "",
      tipo_siesa: "",
      co_siesa: "",
      descripcion: "",
      prefijos_dian: "",
      fecha_desde: fechaInicio || "2026-01-01",
      fecha_hasta: fechaFin || "2030-12-31",
      activo: 1,
    };

    setUltimoIndexCreado(nuevoIdx);
    setConfigListEdit((prev) => [...prev, nuevoFila]);
  };

  const ejecutarGuardadoConfig = async () => {
    for (let i = 0; i < configListEdit.length; i++) {
      const r = configListEdit[i];
      if (!r.tipo_siesa || !r.co_siesa || !r.grupo_sede) {
        addNotification({
          type: "error",
          message: `Fila ${i + 1}: Hay campos obligatorios vacios.`,
        });
        return;
      }
    }
    setLoading(true);
    try {
      const res = await apiService.guardarConfiguracionDian(configListEdit);
      if (res && res.success) {
        addNotification({
          type: "success",
          message: "Parametrizacion fiscal actualizada con exito",
        });
        // Al guardar con exito, el espejo pasa a ser el estado oficial permanente
        setConfigList(JSON.parse(JSON.stringify(configListEdit)));
        setActiveTab("auditoria");
      }
    } catch (err) {
      addNotification({
        type: "error",
        message: "Fallo el almacenamiento de configuraciones.",
      });
    } finally {
      setLoading(false);
    }
  };

  const alertasHuerfanasConsolidadas = useMemo(() => {
    const listaAlertas = [...alertasSiesaHuerfanos];
    if (!reporte || reporte.length === 0) return listaAlertas;

    reporte.forEach((item) => {
      if (!item.dias) return;

      // El calculo de alertas siempre lee del estado oficial consolidado
      const reglasCandidatas = configList.filter(
        (c) =>
          Number(c.activo) === 1 &&
          String(c.co_siesa).padStart(3, "0") ===
            String(item.co_siesa).padStart(3, "0") &&
          String(c.tipo_siesa).trim().toUpperCase() ===
            String(item.tipo).trim().toUpperCase(),
      );

      if (reglasCandidatas.length === 0) return;

      Object.keys(item.dias).forEach((fechaKey) => {
        const diaData = item.dias[fechaKey];
        const año = fechaKey.substring(0, 4);
        const mes = fechaKey.substring(4, 6);
        const dia = fechaKey.substring(6, 8);

        const fechaFormateadaLegible = `${año}-${mes}-${dia}`;
        const fechaMovimiento = new Date(`${año}-${mes}-${dia}T00:00:00`);

        let regla = reglasCandidatas.find((c) => {
          const d = new Date(`${c.fecha_desde}T00:00:00`);
          const h = new Date(`${c.fecha_hasta}T00:00:00`);
          return fechaMovimiento >= d && fechaMovimiento <= h;
        });

        if (!regla) {
          regla = reglasCandidatas[0];
        }

        const desde = new Date(`${regla.fecha_desde}T00:00:00`);
        const hasta = new Date(`${regla.fecha_hasta}T00:00:00`);

        let totalDianFila = 0;
        const fk = fechaKey;

        if (datosDian && datosDian[fk]) {
          const centroOad = item.co_siesa
            ? String(item.co_siesa).padStart(3, "0")
            : "";

          const reglasAsociadas = configList.filter(
            (r) =>
              Number(r.activo) === 1 &&
              String(r.co_siesa).padStart(3, "0") === centroOad &&
              String(r.tipo_siesa).trim().toUpperCase() ===
                String(item.tipo).trim().toUpperCase(),
          );

          reglasAsociadas.forEach((reglaAsoc) => {
            const prefijos = String(reglaAsoc.prefijos_dian || "")
              .split(",")
              .map((x) => x.trim().toUpperCase())
              .filter(Boolean);
            prefijos.forEach((prefijo) => {
              const llaveCompuesta = `${centroOad}_${String(item.tipo).trim().toUpperCase()}_${prefijo}`;
              if (datosDian[fk].totales_compuestos?.[llaveCompuesta]) {
                totalDianFila +=
                  datosDian[fk].totales_compuestos[llaveCompuesta];
              }
            });
          });
        }

        if (
          diaData &&
          diaData.total > 0 &&
          (fechaMovimiento < desde || fechaMovimiento > hasta)
        ) {
          const yaExiste = listaAlertas.some(
            (a) =>
              a.tipo === item.tipo &&
              a.co === item.co_siesa &&
              a.fecha === fechaFormateadaLegible &&
              a.origen.includes("VIGENCIA VIOLADA EN SIESA"),
          );
          if (!yaExiste) {
            listaAlertas.push({
              origen: `cmmovimiento_pdv (VIGENCIA VIOLADA EN SIESA)`,
              tipo: item.tipo,
              co: item.co_siesa,
              total: diaData.total,
              fecha: fechaFormateadaLegible,
              detalle_error: `Movimiento detectado fuera del rango parametrizado (${regla.fecha_desde} al ${regla.fecha_hasta})`,
            });
          }
        }

        if (
          (diaData?.total || 0) === 0 &&
          totalDianFila > 0 &&
          (fechaMovimiento < desde || fechaMovimiento > hasta)
        ) {
          const yaExiste = listaAlertas.some(
            (a) =>
              a.tipo === item.tipo &&
              a.co === item.co_siesa &&
              a.fecha === fechaFormateadaLegible &&
              a.origen.includes("DIAN FUERA DE VIGENCIA"),
          );
          if (!yaExiste) {
            listaAlertas.push({
              origen: `DIAN FUERA DE VIGENCIA PARAMETRIZADA`,
              tipo: item.tipo,
              co: item.co_siesa,
              total: totalDianFila,
              fecha: fechaFormateadaLegible,
              detalle_error: `La DIAN reporta ${totalDianFila} documentos pero Siesa tiene 0 movimientos debido a que la vigencia inicia en ${regla.fecha_desde}`,
            });
          }
        }
      });
    });

    return listaAlertas;
  }, [alertasSiesaHuerfanos, reporte, configList, datosDian]);

  const formatMiles = (numero) => {
    if (
      numero === null ||
      numero === undefined ||
      isNaN(numero) ||
      numero === "-"
    )
      return numero;
    return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(
      numero,
    );
  };

  const diasNuevosParaGuardar = useMemo(() => {
    if (!datosDian) return 0;
    return columnas.filter((col) => {
      const fk = col.replace(/-/g, "");
      return (
        datosDian[fk] &&
        datosDian[fk].total_general > 0 &&
        !diasConciliados[col]
      );
    }).length;
  }, [datosDian, columnas, diasConciliados]);

  if (loading) {
    return (
      <LoadingScreen
        isVisible={true}
        title="Cargando"
        subtitle="Ejecutando cruce transaccional en la red interna..."
      />
    );
  }

  return (
    <div className={styles.auditoriaContainer}>
      <div className={styles.tabNavbar}>
        <button
          className={`${styles.tabBtn} ${activeTab === "auditoria" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("auditoria")}
        >
          <FontAwesomeIcon icon={faTable} /> Consolidado Matricial
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "configuracion" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("configuracion")}
        >
          <FontAwesomeIcon icon={faCogs} /> Parametrizacion
        </button>
      </div>

      {activeTab === "auditoria" ? (
        <>
          <div className={styles.filtroCard}>
            <div className={styles.brandTitle}>
              <div className={styles.iconBox}>
                <FontAwesomeIcon icon={faServer} />
              </div>
              <div>
                <h2>Auditoria Matricial Avanzada DIAN</h2>
                <p>
                  Monitoreo dinamico sin codigo duro gobernado por rangos de
                  fecha
                </p>
              </div>
            </div>

            <form onSubmit={consultarAuditoria} className={styles.filtrosForm}>
              <div className={styles.inputGroup}>
                <label>
                  <FontAwesomeIcon icon={faBuilding} /> Empresa
                </label>
                <select
                  value={empresa}
                  disabled={true}
                  className={styles.inputDisabled}
                >
                  <option value="abastecemos">
                    Abastecemos de Occidente S.A.S
                  </option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>
                  <FontAwesomeIcon icon={faCalendarAlt} /> Fecha Inicial
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>
                  <FontAwesomeIcon icon={faCalendarAlt} /> Fecha Final
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
              <button type="submit" className={styles.btnEnviar}>
                <FontAwesomeIcon icon={faSearch} /> Procesar Libros
              </button>
            </form>
          </div>

          {reporte.length > 0 && (
            <div className={styles.conciliacionCard}>
              <div className={styles.excelBranding}>
                <FontAwesomeIcon
                  icon={faFileExcel}
                  className={styles.excelIcon}
                />
                <div>
                  <h4>Cruzar Informacion con Listado Oficial DIAN</h4>
                  <p>
                    Mapeo asincrono utilizando la matriz inyectada por el
                    endpoint
                  </p>
                </div>
              </div>
              <div className={styles.fileUploadWrapper}>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={procesarExcelDian}
                  id="excelFile"
                  className={styles.fileInput}
                />
                <label htmlFor="excelFile" className={styles.fileLabel}>
                  Seleccionar Archivo DIAN
                </label>
                {datosDian && (
                  <span className={styles.badgeSuccessFile}>
                    Listado DIAN Indexado
                  </span>
                )}
              </div>

              {datosDian && (
                <div className={styles.guardarConciliacionWrapper}>
                  <button
                    className={styles.btnGuardarConciliacion}
                    onClick={ejecutarGuardadoConciliacion}
                    disabled={
                      guardandoConciliacion || diasNuevosParaGuardar === 0
                    }
                    title={
                      diasNuevosParaGuardar === 0
                        ? "Todos los dias con datos DIAN ya fueron guardados"
                        : `Guardar ${diasNuevosParaGuardar} dia(s) nuevo(s)`
                    }
                  >
                    <FontAwesomeIcon
                      icon={guardandoConciliacion ? faLock : faSave}
                    />
                    {guardandoConciliacion
                      ? " Guardando..."
                      : diasNuevosParaGuardar === 0
                        ? " Todo guardado"
                        : ` Guardar Conciliacion (${diasNuevosParaGuardar} dia${diasNuevosParaGuardar > 1 ? "s" : ""})`}
                  </button>

                  {Object.keys(diasConciliados).length > 0 && (
                    <span className={styles.badgeDiasCerrados}>
                      <FontAwesomeIcon icon={faLock} />{" "}
                      {Object.keys(diasConciliados).length} dia(s) ya
                      conciliado(s)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {error && <div className={styles.errorBox}>{error}</div>}

          <AlertasAuditoria
            alertasSiesaHuerfanos={alertasHuerfanasConsolidadas}
            documentosFaltantesDian={documentosFaltantesDian}
            datosDian={datosDian}
            formatMiles={formatMiles}
          />

          <TabAuditoriaMatriz
            columnas={columnas}
            reporte={reporte}
            datosDian={datosDian}
            maestroDianActivo={maestroDianActivo}
            formatMiles={formatMiles}
            diasConciliados={diasConciliados}
          />
        </>
      ) : (
        <TabParametrizacion
          configList={configListEdit}
          sedesAgrupadas={sedesAgrupadas}
          handleConfigChange={handleConfigChange}
          toggleEstadoActivo={toggleEstadoActivo}
          handleRemoveConfigRow={handleRemoveConfigRow}
          handleAddConfigRow={handleAddConfigRow}
          ejecutarGuardadoConfig={ejecutarGuardadoConfig}
          ultimoIndexCreado={ultimoIndexCreado}
          setUltimoIndexCreado={setUltimoIndexCreado}
        />
      )}
    </div>
  );
};

export default AuditoriaDian;
