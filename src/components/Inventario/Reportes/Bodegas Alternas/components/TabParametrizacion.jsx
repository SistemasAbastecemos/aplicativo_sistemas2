import React from "react";
import styles from "../BodegasAlternas.module.css";
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

const TabParametrizacion = React.memo(
  ({ model, puedeCrear, puedeEditar, puedeEliminar }) => {
    // Si edita (existe id) evalúa puedeEditar, si es registro nuevo evalúa puedeCrear
    const formularioBloqueado = model.form.id ? !puedeEditar : !puedeCrear;

    const renderSortIcon = (key) => {
      if (model.sortConfig.key !== key) {
        return (
          <FontAwesomeIcon
            icon={faSort}
            style={{ marginLeft: "6px", opacity: 0.4 }}
          />
        );
      }
      return model.sortConfig.direction === "asc" ? (
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

    return (
      <div className={styles.paramLayoutGrid}>
        {/* Formulario Izquierdo de Registro/Edición */}
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
            {model.form.id ? "Modificar Bodega" : "Registrar Nueva Bodega"}
          </h4>
          <form
            onSubmit={model.guardarBodega}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div className={styles.controlFormulario}>
              <div className={styles.campoFlotante}>
                <input
                  type="text"
                  value={model.form.codigo_bodega}
                  onChange={(e) =>
                    model.setForm({
                      ...model.form,
                      codigo_bodega: e.target.value,
                    })
                  }
                  required
                  maxLength={10}
                  disabled={model.loading || formularioBloqueado}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
                <label
                  className={
                    model.form.codigo_bodega ? styles.labelColapsado : ""
                  }
                >
                  Código de Bodega
                </label>
              </div>
            </div>

            <div className={styles.controlFormulario}>
              <div className={styles.campoFlotante}>
                <input
                  type="text"
                  value={model.form.descripcion}
                  onChange={(e) =>
                    model.setForm({
                      ...model.form,
                      descripcion: e.target.value,
                    })
                  }
                  required
                  disabled={model.loading || formularioBloqueado}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
                <label
                  className={
                    model.form.descripcion ? styles.labelColapsado : ""
                  }
                >
                  Descripción / Sede
                </label>
              </div>
            </div>

            <div className={styles.controlFormulario}>
              <div className={styles.campoFlotante}>
                <select
                  value={model.form.tipo_bodega}
                  onChange={(e) =>
                    model.setForm({
                      ...model.form,
                      tipo_bodega: e.target.value,
                    })
                  }
                  disabled={model.loading || formularioBloqueado}
                  style={{ width: "100%", boxSizing: "border-box" }}
                >
                  <option value="VENTA">PISO DE VENTA (B02)</option>
                  <option value="ALTERNA">BODEGA ALTERNA (EXTERNA)</option>
                </select>
                <label
                  className={
                    model.form.tipo_bodega ? styles.labelColapsado : ""
                  }
                >
                  Tipo de Operación
                </label>
              </div>
            </div>

            <div className={styles.controlFormulario}>
              <div className={styles.campoFlotante}>
                <select
                  value={model.form.activo}
                  onChange={(e) =>
                    model.setForm({
                      ...model.form,
                      activo: Number(e.target.value),
                    })
                  }
                  disabled={model.loading || formularioBloqueado}
                  style={{ width: "100%", boxSizing: "border-box" }}
                >
                  <option value={1}>ACTIVO</option>
                  <option value={0}>INACTIVO</option>
                </select>
                <label
                  className={
                    model.form.activo !== undefined ? styles.labelColapsado : ""
                  }
                >
                  Estado Operativo
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button
                type="submit"
                className={styles.btnBuscarDatos}
                style={{
                  flex: 1,
                  height: "40px",
                  opacity: formularioBloqueado ? 0.6 : 1,
                  cursor: formularioBloqueado ? "not-allowed" : "pointer",
                }}
                disabled={model.loading || formularioBloqueado}
                title={
                  formularioBloqueado
                    ? "Sin permisos para ejecutar esta acción"
                    : undefined
                }
              >
                <FontAwesomeIcon icon={faSave} style={{ marginRight: "6px" }} />
                {model.form.id ? "Actualizar" : "Guardar"}
              </button>

              {(model.form.id ||
                model.form.codigo_bodega ||
                model.form.descripcion) && (
                <button
                  type="button"
                  onClick={model.handleLimpiarForm}
                  className={styles.btnDescargarExcel}
                  style={{
                    background: "#64748B",
                    padding: "0 14px",
                    height: "40px",
                    color: "#fff",
                  }}
                  disabled={model.loading}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabla Derecha de Parámetros */}
        <div>
          <div className={styles.categoriaFiltrosBar}>
            <button
              type="button"
              className={`${styles.btnFiltroCat} ${model.categoria === "TODAS" ? styles.btnFiltroCatActive : ""}`}
              onClick={() => model.setCategoria("TODAS")}
            >
              Todas ({model.bodegasNormalizadas.length})
            </button>
            <button
              type="button"
              className={`${styles.btnFiltroCat} ${model.categoria === "VENTA" ? styles.btnFiltroCatActive : ""}`}
              onClick={() => model.setCategoria("VENTA")}
            >
              Venta ({model.conteos.venta})
            </button>
            <button
              type="button"
              className={`${styles.btnFiltroCat} ${model.categoria === "ALTERNA" ? styles.btnFiltroCatActive : ""}`}
              onClick={() => model.setCategoria("ALTERNA")}
            >
              Alternas ({model.conteos.alterna})
            </button>
          </div>

          <div className={styles.contenedorTablaMaestra}>
            <div className={styles.tablaResponsivaWrapper}>
              <table className={styles.tablaConfig}>
                <thead>
                  <tr>
                    <th
                      className={styles.thOrdenable}
                      onClick={() => model.handleSort("codigo_bodega")}
                      style={{ width: "18%" }}
                    >
                      Código {renderSortIcon("codigo_bodega")}
                    </th>
                    <th
                      className={styles.thOrdenable}
                      onClick={() => model.handleSort("descripcion")}
                    >
                      Descripción Comercial {renderSortIcon("descripcion")}
                    </th>
                    <th
                      className={styles.thOrdenable}
                      onClick={() => model.handleSort("tipo_bodega")}
                      style={{ width: "22%" }}
                    >
                      Tipo Columna {renderSortIcon("tipo_bodega")}
                    </th>
                    <th
                      className={styles.thOrdenable}
                      onClick={() => model.handleSort("activo")}
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
                  {model.bodegasFiltradas.map((b) => (
                    <tr key={b.id}>
                      <td className={styles.textoDestacado}>
                        {b.codigo_bodega}
                      </td>
                      <td>{b.descripcion}</td>
                      <td>
                        <span
                          className={
                            b._tipo === "VENTA"
                              ? styles.badgeSi
                              : styles.badgeNo
                          }
                        >
                          {b._tipo === "VENTA"
                            ? "PISO DE VENTAS (02)"
                            : "BODEGA ALTERNA"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
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
                      <td style={{ textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "center",
                          }}
                        >
                          {/* Botón Editar deshabilitado si !puedeEditar */}
                          <button
                            type="button"
                            onClick={() => {
                              if (!puedeEditar) return;
                              model.setForm({
                                id: b.id,
                                codigo_bodega: b.codigo_bodega,
                                descripcion: b.descripcion,
                                tipo_bodega: b.tipo_bodega,
                                activo: Number(b.activo),
                              });
                            }}
                            className={styles.btnDescargarExcel}
                            style={{
                              padding: "5px 10px",
                              background: puedeEditar ? "#0EA5E9" : "#CBD5E1",
                              color: "#fff",
                              height: "auto",
                              cursor: puedeEditar ? "pointer" : "not-allowed",
                            }}
                            disabled={!puedeEditar}
                            title={
                              puedeEditar ? "Editar" : "Sin permiso de edición"
                            }
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>

                          {/* Botón Eliminar deshabilitado si !puedeEliminar */}
                          <button
                            type="button"
                            onClick={() => {
                              if (!puedeEliminar) return;
                              model.eliminarBodega(b.id);
                            }}
                            className={styles.btnDescargarExcel}
                            style={{
                              padding: "5px 10px",
                              background: puedeEliminar ? "#EF4444" : "#CBD5E1",
                              color: "#fff",
                              height: "auto",
                              cursor: puedeEliminar ? "pointer" : "not-allowed",
                            }}
                            disabled={!puedeEliminar}
                            title={
                              puedeEliminar
                                ? "Eliminar"
                                : "Sin permiso de eliminación"
                            }
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {model.bodegasFiltradas.length === 0 && (
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
  },
);

TabParametrizacion.displayName = "TabParametrizacion";
export default TabParametrizacion;
