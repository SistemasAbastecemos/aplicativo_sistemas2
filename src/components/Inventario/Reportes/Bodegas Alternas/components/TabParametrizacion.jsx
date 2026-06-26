import React, { useState, useEffect, useMemo } from "react";
import styles from "../BodegasAlternas.module.css";
import { apiService } from "../../../../../services/api";
import { useAuth } from "../../../../../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEdit,
  faSave,
  faTimes,
  faSort,
  faSortUp,
  faSortDown,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";

const normalizarTipo = (tipo) => {
  const t = String(tipo || "")
    .trim()
    .toUpperCase();
  return t === "VENTA" ? "VENTA" : "ALTERNA";
};

// Subcomponente 1: Formulario de Registro / Edición (labels flotantes con clases existentes)
const FormularioBodega = ({ form, setForm, onSubmit, onCancelar, loading }) => {
  return (
    <div
      className={styles.tarjetaFiltros}
      style={{ padding: "20px", border: "1px solid #e2e8f0" }}
    >
      <h4
        style={{
          margin: "0 0 16px 0",
          color: "#1E293B",
          fontSize: "14px",
          fontWeight: "700",
        }}
      >
        {form.id ? "Modificar Bodega" : "Registrar Nueva Bodega"}
      </h4>
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <div className={styles.controlFormulario}>
          <div className={styles.campoFlotante}>
            <input
              type="text"
              placeholder="Ej: 00102 o 00604"
              value={form.codigo_bodega}
              onChange={(e) =>
                setForm({ ...form, codigo_bodega: e.target.value })
              }
              required
              maxLength={10}
              disabled={loading}
              style={{ width: "100%", boxSizing: "border-box" }}
            />
            <label className={styles.labelFlotante}>Código de Bodega</label>
          </div>
        </div>

        <div className={styles.controlFormulario}>
          <div className={styles.campoFlotante}>
            <input
              type="text"
              placeholder="Ej: Piso de Venta Rozo"
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
              required
              disabled={loading}
              style={{ width: "100%", boxSizing: "border-box" }}
            />
            <label className={styles.labelFlotante}>Descripción / Sede</label>
          </div>
        </div>

        <div className={styles.controlFormulario}>
          <div className={styles.campoFlotante}>
            <select
              value={form.tipo_bodega}
              onChange={(e) =>
                setForm({ ...form, tipo_bodega: e.target.value })
              }
              disabled={loading}
              style={{ width: "100%", boxSizing: "border-box" }}
            >
              <option value="VENTA">PISO DE VENTA (B02)</option>
              <option value="ALTERNA">BODEGA ALTERNA (EXTERNA)</option>
            </select>
            <label className={styles.labelFlotante}>Tipo de Operación</label>
          </div>
        </div>

        <div className={styles.controlFormulario}>
          <div className={styles.campoFlotante}>
            <select
              value={form.activo}
              onChange={(e) =>
                setForm({ ...form, activo: Number(e.target.value) })
              }
              disabled={loading}
              style={{ width: "100%", boxSizing: "border-box" }}
            >
              <option value={1}>ACTIVO</option>
              <option value={0}>INACTIVO</option>
            </select>
            <label className={styles.labelFlotante}>Estado Operativo</label>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          <button
            type="submit"
            className={styles.btnBuscarDatos}
            style={{ flex: 1, height: "40px" }}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faSave} style={{ marginRight: "6px" }} />
            {form.id ? "Actualizar" : "Guardar"}
          </button>
          {(form.id || form.codigo_bodega || form.descripcion) && (
            <button
              type="button"
              onClick={onCancelar}
              className={styles.btnDescargarExcel}
              style={{
                background: "#64748B",
                padding: "0 14px",
                height: "40px",
              }}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

// Componente Orquestador de la pestaña de parametrización
const TabParametrizacion = ({ addNotification }) => {
  const { user } = useAuth();
  const loginUsuario = user?.login || "sistema";

  const [bodegas, setBodegas] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const cargarBodegas = async () => {
    setLoading(true);
    try {
      const res = await apiService.listarBodegasConfig();
      if (res.success) setBodegas(res.data || []);
    } catch (e) {
      addNotification({
        type: "error",
        message: "Error cargando la configuración de bodegas.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBodegas();
  }, []);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <FontAwesomeIcon
          icon={faSort}
          style={{ marginLeft: "6px", opacity: 0.4 }}
        />
      );
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon
        icon={faSortUp}
        style={{ marginLeft: "6px", color: "#009B6D" }}
      />
    ) : (
      <FontAwesomeIcon
        icon={faSortDown}
        style={{ marginLeft: "6px", color: "#009B6D" }}
      />
    );
  };

  const bodegasNormalizadas = useMemo(
    () =>
      (Array.isArray(bodegas) ? bodegas : []).map((b) => ({
        ...b,
        _tipo: normalizarTipo(b.tipo_bodega),
      })),
    [bodegas],
  );

  const conteoVenta = useMemo(
    () => bodegasNormalizadas.filter((b) => b._tipo === "VENTA").length,
    [bodegasNormalizadas],
  );
  const conteoAlterna = useMemo(
    () => bodegasNormalizadas.filter((b) => b._tipo === "ALTERNA").length,
    [bodegasNormalizadas],
  );

  // Filtrado por categoría + ordenamiento
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      if (res.success) {
        addNotification({ type: "success", message: res.message });
        handleLimpiar();
        cargarBodegas();
      }
    } catch (err) {
      addNotification({
        type: "error",
        message: "Fallo de red al registrar la bodega.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (
      !window.confirm(
        "¿Desea remover esta bodega de la grilla matricial del reporte?",
      )
    )
      return;
    setLoading(true);
    try {
      const res = await apiService.eliminarBodegaConfig(id);
      if (res.success) {
        addNotification({ type: "success", message: res.message });
        cargarBodegas();
      }
    } catch (e) {
      addNotification({ type: "error", message: "Error al borrar la fila." });
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setForm({
      id: null,
      codigo_bodega: "",
      descripcion: "",
      tipo_bodega: "VENTA",
      activo: 1,
    });
  };

  return (
    <div className={styles.paramLayoutGrid}>
      <FormularioBodega
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        onCancelar={handleLimpiar}
        loading={loading}
      />

      <div>
        {/* Categorización por botones (Todas / Venta / Alternas) */}
        <div className={styles.categoriaFiltrosBar}>
          <button
            className={`${styles.btnFiltroCat} ${categoria === "TODAS" ? styles.btnFiltroCatActive : ""}`}
            onClick={() => setCategoria("TODAS")}
          >
            Todas ({bodegasNormalizadas.length})
          </button>
          <button
            className={`${styles.btnFiltroCat} ${categoria === "VENTA" ? styles.btnFiltroCatActive : ""}`}
            onClick={() => setCategoria("VENTA")}
          >
            Venta ({conteoVenta})
          </button>
          <button
            className={`${styles.btnFiltroCat} ${categoria === "ALTERNA" ? styles.btnFiltroCatActive : ""}`}
            onClick={() => setCategoria("ALTERNA")}
          >
            Alternas ({conteoAlterna})
          </button>
        </div>

        <div className={styles.contenedorTablaMaestra}>
          <div className={styles.tablaResponsivaWrapper}>
            <table className={styles.tablaConfig}>
              <thead>
                <tr>
                  <th
                    className={styles.thOrdenable}
                    onClick={() => handleSort("codigo_bodega")}
                    style={{ width: "18%" }}
                  >
                    Código {renderSortIcon("codigo_bodega")}
                  </th>
                  <th
                    className={styles.thOrdenable}
                    onClick={() => handleSort("descripcion")}
                  >
                    Descripción Comercial {renderSortIcon("descripcion")}
                  </th>
                  <th
                    className={styles.thOrdenable}
                    onClick={() => handleSort("tipo_bodega")}
                    style={{ width: "22%" }}
                  >
                    Tipo Columna {renderSortIcon("tipo_bodega")}
                  </th>
                  <th
                    className={styles.thOrdenable}
                    onClick={() => handleSort("activo")}
                    style={{ width: "14%", textAlign: "center" }}
                  >
                    Estado {renderSortIcon("activo")}
                  </th>
                  <th style={{ width: "120px", textAlign: "center" }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {bodegasFiltradas.map((b) => (
                  <tr key={b.id}>
                    <td data-label="Código" className={styles.textoDestacado}>
                      {b.codigo_bodega}
                    </td>
                    <td data-label="Descripción">{b.descripcion}</td>
                    <td data-label="Tipo">
                      <span
                        className={
                          b._tipo === "VENTA" ? styles.badgeSi : styles.badgeNo
                        }
                      >
                        {b._tipo === "VENTA"
                          ? "PISO DE VENTAS (02)"
                          : "BODEGA ALTERNA"}
                      </span>
                    </td>
                    <td data-label="Estado" style={{ textAlign: "center" }}>
                      <span
                        className={
                          Number(b.activo) === 1
                            ? styles.badgeSi
                            : styles.badgeNo
                        }
                      >
                        {Number(b.activo) === 1 ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </td>
                    <td data-label="Acciones" style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={() =>
                            setForm({
                              id: b.id,
                              codigo_bodega: b.codigo_bodega,
                              descripcion: b.descripcion,
                              tipo_bodega: b.tipo_bodega,
                              activo: Number(b.activo),
                            })
                          }
                          className={styles.btnDescargarExcel}
                          style={{ padding: "5px 10px", background: "#0EA5E9" }}
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleEliminar(b.id)}
                          className={styles.btnDescargarExcel}
                          style={{ padding: "5px 10px", background: "#EF4444" }}
                          title="Eliminar"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {bodegasFiltradas.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#64748B",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faFolderOpen}
                        style={{ marginRight: "8px" }}
                      />
                      No se registran bodegas bajo la categoría seleccionada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabParametrizacion;
