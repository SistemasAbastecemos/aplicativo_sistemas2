import React, { useState, useEffect, useRef } from "react";
import styles from "../ExistenciasAverias.module.css";
import { apiService } from "../../../../../services/api";
import { useAuth } from "../../../../../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEdit,
  faSave,
  faTimes,
  faSpinner,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

const TabParametrizacion = ({ addNotification, permisos = {} }) => {
  const { user } = useAuth();
  const loginUsuario = user?.login || "sistema";

  // Capacidades operativas controladas por RBAC
  const puedeCrear = !!permisos.crear;
  const puedeEditar = !!permisos.editar;
  const puedeEliminar = !!permisos.eliminar;

  const [listaConfig, setListaConfig] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const [form, setForm] = useState({
    id: null,
    codigo_proveedor: "",
    descripcion: "",
    activo: 1,
  });
  const [termBusqueda, setTermBusqueda] = useState("");
  const [resultadosCriterios, setResultadosCriterios] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const cargarProveedoresParametrizados = async () => {
    setLoading(true);
    try {
      const res = await apiService.listarProveedoresConfig();
      if (res.success) setListaConfig(res.data || []);
    } catch (e) {
      addNotification({
        type: "error",
        message: "Error al recuperar exclusiones de cPanel.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProveedoresParametrizados();
    const closeClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", closeClickOutside);
    return () => document.removeEventListener("mousedown", closeClickOutside);
  }, []);

  useEffect(() => {
    const limpio = termBusqueda.trim();
    if (limpio.length < 2) {
      setResultadosCriterios([]);
      setSearching(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await apiService.buscarCriterios1(limpio);
        setResultadosCriterios(data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Fallo en buscador de criterios:", err);
        setResultadosCriterios([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [termBusqueda]);

  const handleSeleccionarCriterio = (c) => {
    setForm({
      ...form,
      codigo_proveedor: c.codigo,
      descripcion: c.descripcion,
    });
    setTermBusqueda(`${c.codigo} - ${c.descripcion}`);
    setShowDropdown(false);
    addNotification({
      type: "info",
      message: "Criterio estructurado cargado correctamente en el formulario.",
    });
  };

  const handleGuardarForm = async (e) => {
    e.preventDefault();

    const esEdicion = !!form.id;
    if ((esEdicion && !puedeEditar) || (!esEdicion && !puedeCrear)) {
      addNotification({
        type: "error",
        message: "No tiene permisos para realizar esta acción.",
      });
      return;
    }

    const payloadLimpio = {
      ...form,
      codigo_proveedor: form.codigo_proveedor.trim(),
      descripcion: form.descripcion.trim(),
      usuario_operacion: loginUsuario,
    };

    if (!payloadLimpio.codigo_proveedor || !payloadLimpio.descripcion) {
      alert("Por favor seleccione un Criterio 1 corporativo.");
      return;
    }

    try {
      const res = await apiService.guardarProveedorConfig(payloadLimpio);
      if (res.success) {
        addNotification({ type: "success", message: res.message });
        handleLimpiarForm();
        cargarProveedoresParametrizados();
      } else {
        addNotification({
          type: "error",
          message: res.message || "Error al guardar.",
        });
      }
    } catch (err) {
      addNotification({
        type: "error",
        message: "No se pudo conectar con el servicio.",
      });
    }
  };

  const handleEliminar = async (id) => {
    if (!puedeEliminar) return;
    if (
      !window.confirm(
        "¿Desea remover este proveedor de la lista? Volverá a asumir que SÍ RECOGE averías.",
      )
    )
      return;
    try {
      const res = await apiService.eliminarProveedorConfig(id);
      if (res.success) {
        addNotification({ type: "success", message: res.message });
        cargarProveedoresParametrizados();
      }
    } catch (err) {
      addNotification({
        type: "error",
        message: "Error al eliminar la exclusión.",
      });
    }
  };

  const handleLimpiarForm = () => {
    setForm({ id: null, codigo_proveedor: "", descripcion: "", activo: 1 });
    setTermBusqueda("");
    setResultadosCriterios([]);
    setSearching(false);
  };

  return (
    <div className={styles.paramContainer} style={{ marginTop: "10px" }}>
      <div
        className={styles.tarjetaFiltros}
        style={{ flexDirection: "column", alignItems: "stretch", gap: "20px" }}
      >
        <div
          style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}
        >
          <h3
            style={{
              margin: 0,
              color: "#1E293B",
              fontSize: "16px",
              fontWeight: "700",
            }}
          >
            Maestro de Proveedores que NO Recogen Averías
          </h3>
          <p
            style={{ margin: "4px 0 0 0", color: "#64748B", fontSize: "13px" }}
          >
            Los criterios aquí configurados marcarán como{" "}
            <span style={{ color: "#EF4444", fontWeight: "bold" }}>"No"</span>{" "}
            en la columna Recoge Averías del reporte.
          </p>
        </div>

        <form
          onSubmit={handleGuardarForm}
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div
            className={styles.controlFormulario}
            style={{ flex: 2, position: "relative" }}
            ref={dropdownRef}
          >
            <div className={styles.campoFlotante}>
              <input
                type="text"
                placeholder="Escriba el codigo o descripcion del criterio..."
                value={termBusqueda}
                onChange={(e) => {
                  setTermBusqueda(e.target.value);
                  setShowDropdown(true);
                }}
                required={!form.codigo_proveedor}
                disabled={form.id ? !puedeEditar : !puedeCrear}
                style={{ width: "100%", boxSizing: "border-box" }}
              />
              {searching && (
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "12px",
                    color: "#6b7280",
                  }}
                />
              )}
              <label className={styles.labelFlotante}>Buscar Criterio 1*</label>
            </div>

            {showDropdown && resultadosCriterios.length > 0 && (
              <div
                className={styles.dropdownMenuContent}
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  overflowY: "auto",
                  zIndex: 100,
                }}
              >
                {resultadosCriterios.map((c, idx) => (
                  <div
                    key={`${c.codigo}-${idx}`}
                    className={styles.dropdownMenuItem}
                    onClick={() => handleSeleccionarCriterio(c)}
                  >
                    <strong>{c.codigo}</strong> - {c.descripcion}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.controlFormulario} style={{ flex: 0.8 }}>
            <div className={styles.campoFlotante}>
              <input
                type="text"
                value={form.codigo_proveedor}
                readOnly
                disabled
                placeholder="Código"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "#f1f5f9",
                  cursor: "not-allowed",
                }}
              />
              <label className={styles.labelFlotante}>
                Criterio Confirmado
              </label>
            </div>
          </div>

          <div className={styles.controlFormulario} style={{ flex: 1.5 }}>
            <div className={styles.campoFlotante}>
              <input
                type="text"
                value={form.descripcion}
                readOnly
                disabled
                placeholder="Razón Social"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "#f1f5f9",
                  cursor: "not-allowed",
                }}
              />
              <label className={styles.labelFlotante}>
                Descripción del Criterio
              </label>
            </div>
          </div>

          <div className={styles.controlFormulario} style={{ flex: 0.8 }}>
            <div className={styles.campoFlotante}>
              <select
                value={form.activo}
                onChange={(e) =>
                  setForm({ ...form, activo: Number(e.target.value) })
                }
                disabled={form.id ? !puedeEditar : !puedeCrear}
                style={{ width: "100%", boxSizing: "border-box" }}
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
              <label className={styles.labelFlotante}>Estado</label>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="submit"
              className={styles.btnBuscarDatos}
              disabled={
                !form.codigo_proveedor || (form.id ? !puedeEditar : !puedeCrear)
              }
              title={
                form.id
                  ? !puedeEditar
                    ? "No tiene permiso para editar"
                    : undefined
                  : !puedeCrear
                    ? "No tiene permiso para crear"
                    : undefined
              }
              style={{
                height: "42px",
                padding: "0 20px",
                opacity:
                  !form.codigo_proveedor ||
                  (form.id ? !puedeEditar : !puedeCrear)
                    ? 0.6
                    : 1,
                cursor:
                  !form.codigo_proveedor ||
                  (form.id ? !puedeEditar : !puedeCrear)
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <FontAwesomeIcon icon={faSave} style={{ marginRight: "6px" }} />
              {form.id ? "Actualizar" : "Guardar"}
            </button>
            {(form.id ||
              form.codigo_proveedor ||
              form.descripcion ||
              termBusqueda) && (
              <button
                type="button"
                onClick={handleLimpiarForm}
                className={styles.btnDescargarExcel}
                style={{ height: "42px", background: "#64748B" }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </form>
      </div>

      <div
        className={styles.contenedorTablaMaestra}
        style={{ marginTop: "20px" }}
      >
        {loading ? (
          <div style={{ padding: "30px", textAlign: "center" }}>
            <FontAwesomeIcon icon={faSpinner} spin size="2x" color="#009B6D" />
          </div>
        ) : (
          <div className={styles.tablaResponsivaWrapper}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "25%" }}>Criterio 1 (id_cricla1)</th>
                  <th>Proveedor / Descripción Exclusión</th>
                  <th style={{ width: "12%", textAlign: "center" }}>Estado</th>
                  <th style={{ width: "15%", textAlign: "center" }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {listaConfig.map((item) => (
                  <tr key={item.id}>
                    <td className={styles.textoDestacado}>
                      {item.codigo_proveedor}
                    </td>
                    <td>{item.descripcion}</td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        className={
                          Number(item.activo) === 1
                            ? styles.badgeSi
                            : styles.badgeNo
                        }
                      >
                        {Number(item.activo) === 1 ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {/* Botón Editar deshabilitado visual y lógicamente si !puedeEditar */}
                      <button
                        onClick={() => {
                          if (!puedeEditar) return;
                          setForm({
                            id: item.id,
                            codigo_proveedor: item.codigo_proveedor,
                            descripcion: item.descripcion,
                            activo: Number(item.activo),
                          });
                          setTermBusqueda(
                            `${item.codigo_proveedor} - ${item.descripcion}`,
                          );
                        }}
                        className={styles.btnDescargarExcel}
                        disabled={!puedeEditar}
                        style={{
                          padding: "5px 10px",
                          background: puedeEditar ? "#0EA5E9" : "#CBD5E1",
                          marginRight: "6px",
                          cursor: puedeEditar ? "pointer" : "not-allowed",
                        }}
                        title={
                          puedeEditar ? "Editar" : "Sin permiso de modificación"
                        }
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>

                      {/* Botón Eliminar deshabilitado visual y lógicamente si !puedeEliminar */}
                      <button
                        onClick={() => {
                          if (!puedeEliminar) return;
                          handleEliminar(item.id);
                        }}
                        className={styles.btnDescargarExcel}
                        disabled={!puedeEliminar}
                        style={{
                          padding: "5px 10px",
                          background: puedeEliminar ? "#EF4444" : "#CBD5E1",
                          cursor: puedeEliminar ? "pointer" : "not-allowed",
                        }}
                        title={
                          puedeEliminar
                            ? "Eliminar"
                            : "Sin permiso de eliminación"
                        }
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
                {listaConfig.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#64748B",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        style={{ marginRight: "6px" }}
                      />
                      No hay proveedores registrados en la exclusión. Todos se
                      asumen como "SÍ RECOGE AVERÍAS".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabParametrizacion;
