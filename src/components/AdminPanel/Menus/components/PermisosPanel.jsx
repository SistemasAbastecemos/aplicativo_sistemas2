import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import styles from "../Menus.module.css";
import PermisosTabla from "./PermisosTabla";

const ACCIONES = ["ver", "crear", "editar", "eliminar"];

/**
 * Pestaña "Directivas de Acceso" del modal. Alterna entre autorización por
 * roles y por cargos (con filtro por área), y ofrece un atajo para
 * autorizar/remover en bloque respetando la dependencia de "ver".
 */
const PermisosPanel = ({
  roles,
  areas,
  cargosFiltrados,
  permisos,
  areaSeleccionada,
  onAreaChange,
  onTogglePermiso,
}) => {
  const [tipoPermisoTab, setTipoPermisoTab] = useState("roles");

  // Autoriza (solo "ver") o remueve por completo todos los roles según el
  // estado actual del conjunto.
  const toggleTodosRoles = () => {
    const todosMarcados = roles.every((r) => !!permisos?.roles?.[r.id]?.ver);
    roles.forEach((r) => {
      if (todosMarcados) {
        ACCIONES.forEach((accion) => {
          if (permisos?.roles?.[r.id]?.[accion])
            onTogglePermiso("roles", r.id, accion);
        });
      } else if (!permisos?.roles?.[r.id]?.ver) {
        onTogglePermiso("roles", r.id, "ver");
      }
    });
  };

  const toggleTodosCargos = () => {
    const todosMarcados = cargosFiltrados.every(
      (c) => !!permisos?.cargos?.[c.id]?.ver,
    );
    cargosFiltrados.forEach((c) => {
      if (todosMarcados) {
        ACCIONES.forEach((accion) => {
          if (permisos?.cargos?.[c.id]?.[accion])
            onTogglePermiso("cargos", c.id, accion);
        });
      } else if (!permisos?.cargos?.[c.id]?.ver) {
        onTogglePermiso("cargos", c.id, "ver");
      }
    });
  };

  return (
    <div className={styles.politicasAccesoContainer}>
      <div className={styles.tipoPermisoNavbar}>
        <button
          type="button"
          className={`${styles.subTabBtn} ${tipoPermisoTab === "roles" ? styles.subTabActive : ""}`}
          onClick={() => setTipoPermisoTab("roles")}
        >
          Roles del Sistema
        </button>
        <button
          type="button"
          className={`${styles.subTabBtn} ${tipoPermisoTab === "cargos" ? styles.subTabActive : ""}`}
          onClick={() => setTipoPermisoTab("cargos")}
        >
          Estructura por Cargos
        </button>
      </div>

      {tipoPermisoTab === "roles" ? (
        <div className={styles.seccionPermisosDinamica}>
          <div className={styles.headerLine}>
            <h4>Autorización por Roles</h4>
            <button
              type="button"
              className={styles.btnToggleAll}
              onClick={toggleTodosRoles}
            >
              {roles.every((r) => !!permisos?.roles?.[r.id]?.ver)
                ? "Remover Selección"
                : "Autorizar Todos"}
            </button>
          </div>
          <PermisosTabla
            tipo="roles"
            items={roles}
            permisos={permisos}
            togglePermiso={onTogglePermiso}
          />
        </div>
      ) : (
        <div className={styles.seccionPermisosDinamica}>
          <div className={styles.filtroAreaRow}>
            <label>
              <FontAwesomeIcon icon={faFilter} /> Filtrar Estructura por Área:
            </label>
            <select value={areaSeleccionada} onChange={onAreaChange}>
              <option value="">[ Mostrar Todas las Áreas Corporativas ]</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.descripcion || a.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.headerLine}>
            <h4>Cargos de la Organización</h4>
            <button
              type="button"
              className={styles.btnToggleAll}
              onClick={toggleTodosCargos}
            >
              {cargosFiltrados.every((c) => !!permisos?.cargos?.[c.id]?.ver)
                ? "Remover Filtrados"
                : "Autorizar Filtrados"}
            </button>
          </div>

          <PermisosTabla
            tipo="cargos"
            items={cargosFiltrados}
            permisos={permisos}
            togglePermiso={onTogglePermiso}
            mostrarArea
            areas={areas}
          />
        </div>
      )}
    </div>
  );
};

export default PermisosPanel;
