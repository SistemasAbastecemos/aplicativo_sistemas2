import { useState, useEffect, useCallback, useMemo } from "react";
import { apiService } from "../../../../../services/api";
import { useAuth } from "../../../../../contexts/AuthContext";
import { TABS_BODEGAS } from "../utils/constants";
import { exportarReporteBodegasAlternasExcel } from "../utils/excelExport";

const normalizarTipo = (tipo) => {
  const t = String(tipo || "")
    .trim()
    .toUpperCase();
  return t === "VENTA" ? "VENTA" : "ALTERNA";
};

export const useBodegasAlternas = (addNotification) => {
  const { user } = useAuth();
  const loginUsuario = user?.login || "sistema";

  const [activeTab, setActiveTab] = useState(TABS_BODEGAS.ANALITICA);
  const [loading, setLoading] = useState(false);

  // Estados del Visor Analitico
  const [reporteData, setReporteData] = useState([]);
  const fechaActual = new Date();
  const mesActualStr = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, "0")}`;
  const [lapsoCalendario, setLapsoCalendario] = useState(mesActualStr);

  // Estados de Parametrizacion
  const [bodegas, setBodegas] = useState([]);
  const [categoria, setCategoria] = useState("TODAS");
  const [sortConfig, setSortConfig] = useState({
    key: "codigo_bodega",
    direction: "asc",
  });
  const [form, setForm] = useState({
    id: null,
    codigo_bodega: "",
    descripcion: "",
    tipo_bodega: "VENTA",
    activo: 1,
  });

  // --- LOGICA REPORTE ---
  const consultarReporte = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      setLoading(true);
      try {
        const lapsoLimpio = lapsoCalendario.replace("-", "");
        const res = await apiService.obtenerReporteBodegasAlternas(lapsoLimpio);
        const apiData = res?.resultado ? res.resultado : res;

        if (apiData?.success || Array.isArray(apiData)) {
          const registros = Array.isArray(apiData)
            ? apiData
            : apiData.data || [];
          setReporteData(registros);
          addNotification({
            type: "success",
            message: `Datos procesados. ${registros.length} registros cargados.`,
          });
        } else {
          throw new Error(apiData?.message || "Error al compilar matrices.");
        }
      } catch (err) {
        addNotification({ type: "error", message: err.message });
        setReporteData([]);
      } finally {
        setLoading(false);
      }
    },
    [lapsoCalendario, addNotification],
  );

  const estructurasColumnas = useMemo(() => {
    if (reporteData.length === 0) return { bodegas02: [], bodegasAlt: [] };
    const primerRegistro = reporteData[0];
    const llaves = Object.keys(primerRegistro);

    const b02 = [];
    const bAlt = [];

    llaves.forEach((key) => {
      if (key.startsWith("Existencia_Und_")) {
        b02.push(key.replace("Existencia_Und_", ""));
      }
      if (key.startsWith("Exist_")) {
        bAlt.push(key.replace("Exist_", ""));
      }
    });
    return { bodegas02: b02, bodegasAlt: bAlt };
  }, [reporteData]);

  const ejecutarExportacionExcel = useCallback(async () => {
    setLoading(true);
    try {
      const exito = await exportarReporteBodegasAlternasExcel(
        reporteData,
        estructurasColumnas,
        lapsoCalendario,
      );
      if (exito) {
        addNotification({
          type: "success",
          message: "Reporte corporativo exportado con exito.",
        });
      }
    } catch (err) {
      addNotification({
        type: "error",
        message: "Error al estructurar el binario del reporte.",
      });
    } finally {
      setLoading(false);
    }
  }, [reporteData, estructurasColumnas, lapsoCalendario, addNotification]);

  // --- LOGICA PARAMETRIZACION ---
  const cargarBodegasConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.listarBodegasConfig();
      const apiData = res?.resultado ? res.resultado : res;
      if (apiData?.success || Array.isArray(apiData)) {
        setBodegas(Array.isArray(apiData) ? apiData : apiData.data || []);
      }
    } catch (e) {
      addNotification({
        type: "error",
        message: "Error cargando la configuracion de bodegas.",
      });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    if (activeTab === TABS_BODEGAS.PARAMETROS) {
      cargarBodegasConfig();
    }
  }, [activeTab, cargarBodegasConfig]);

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const bodegasNormalizadas = useMemo(() => {
    return (Array.isArray(bodegas) ? bodegas : []).map((b) => ({
      ...b,
      _tipo: normalizarTipo(b.tipo_bodega),
    }));
  }, [bodegas]);

  const conteos = useMemo(() => {
    return {
      venta: bodegasNormalizadas.filter((b) => b._tipo === "VENTA").length,
      alterna: bodegasNormalizadas.filter((b) => b._tipo === "ALTERNA").length,
    };
  }, [bodegasNormalizadas]);

  const bodegasFiltradas = useMemo(() => {
    let arr =
      categoria === "TODAS"
        ? bodegasNormalizadas
        : bodegasNormalizadas.filter((b) => b._tipo === categoria);
    arr = [...arr];
    if (sortConfig.key) {
      arr.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return arr;
  }, [bodegasNormalizadas, categoria, sortConfig]);

  const handleLimpiarForm = useCallback(() => {
    setForm({
      id: null,
      codigo_bodega: "",
      descripcion: "",
      tipo_bodega: "VENTA",
      activo: 1,
    });
  }, []);

  const guardarBodega = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      const cleanForm = {
        ...form,
        codigo_bodega: form.codigo_bodega.trim(),
        descripcion: form.descripcion.trim(),
        tipo_bodega: form.tipo_bodega.trim().toUpperCase(),
        usuario_operacion: loginUsuario,
      };

      if (!cleanForm.codigo_bodega || !cleanForm.descripcion) return;

      setLoading(true);
      try {
        const res = await apiService.guardarBodegaConfig(cleanForm);
        const apiData = res?.resultado ? res.resultado : res;
        if (apiData?.success) {
          addNotification({
            type: "success",
            message: apiData.message || "Cambios salvados.",
          });
          handleLimpiarForm();
          cargarBodegasConfig();
        }
      } catch (err) {
        addNotification({
          type: "error",
          message: "Fallo de red al registrar la bodega.",
        });
      } finally {
        setLoading(false);
      }
    },
    [
      form,
      loginUsuario,
      handleLimpiarForm,
      cargarBodegasConfig,
      addNotification,
    ],
  );

  const eliminarBodega = useCallback(
    async (id) => {
      if (
        !window.confirm(
          "¿Desea remover esta bodega de la grilla matricial del reporte?",
        )
      )
        return;
      setLoading(true);
      try {
        const res = await apiService.eliminarBodegaConfig(id);
        const apiData = res?.resultado ? res.resultado : res;
        if (apiData?.success) {
          addNotification({
            type: "success",
            message: apiData.message || "Registro eliminado.",
          });
          cargarBodegasConfig();
        }
      } catch (e) {
        addNotification({ type: "error", message: "Error al borrar la fila." });
      } finally {
        setLoading(false);
      }
    },
    [cargarBodegasConfig, addNotification],
  );

  return {
    activeTab,
    setActiveTab,
    loading,
    reporteData,
    lapsoCalendario,
    setLapsoCalendario,
    consultarReporte,
    estructurasColumnas,
    ejecutarExportacionExcel,
    bodegasNormalizadas,
    conteos,
    bodegasFiltradas,
    categoria,
    setCategoria,
    sortConfig,
    handleSort,
    form,
    setForm,
    guardarBodega,
    eliminarBodega,
    handleLimpiarForm,
  };
};
