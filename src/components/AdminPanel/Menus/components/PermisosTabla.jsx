import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import styles from "../Menus.module.css";

const ACCIONES = ["ver", "crear", "editar", "eliminar"];

/**
 * Tabla de permisos para un tipo (roles o cargos). Cada fila permite marcar
 * ver/crear/editar/eliminar; las acciones distintas de "ver" quedan
 * deshabilitadas mientras "ver" no esté activo.
 */
const PermisosTabla = React.memo(
  ({
    tipo,
    items,
    permisos,
    togglePermiso,
    mostrarArea = false,
    areas = [],
  }) => {
    const getAreaNombre = (idArea) => {
      const area = areas.find((a) => a.id == idArea);
      return area ? area.nombre : "";
    };

    if (!items || items.length === 0) {
      return (
        <div className={styles.emptyPermisos}>
          No existen {tipo === "roles" ? "roles" : "cargos corporativos"}{" "}
          configurados en el sistema
        </div>
      );
    }

    return (
      <div className={styles.permisosTableContainer}>
        <table className={styles.permisosTable}>
          <thead>
            <tr>
              <th>
                {tipo === "roles" ? "Rol Operativo" : "Cargo Institucional"}
              </th>
              {mostrarArea && <th>Área</th>}
              <th title="Acceder / ver el menú">
                <FontAwesomeIcon icon={faEye} /> Ver
              </th>
              <th title="Crear registros">Crear</th>
              <th title="Editar registros">Editar</th>
              <th title="Eliminar registros">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className={styles.permisoNombre}>
                  {item.descripcion || item.nombre}
                </td>
                {mostrarArea && (
                  <td className={styles.permisoArea}>
                    {getAreaNombre(item.id_area)}
                  </td>
                )}
                {ACCIONES.map((perm) => {
                  const puedeVer = !!permisos?.[tipo]?.[item.id]?.ver;
                  const dependiente = perm !== "ver" && !puedeVer;
                  return (
                    <td key={perm} className={styles.permisoCheckbox}>
                      <input
                        type="checkbox"
                        checked={!!permisos?.[tipo]?.[item.id]?.[perm]}
                        onChange={() => togglePermiso(tipo, item.id, perm)}
                        disabled={dependiente}
                        className={styles.permisoInput}
                        style={dependiente ? { opacity: 0.3 } : undefined}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);

PermisosTabla.displayName = "PermisosTabla";

export default PermisosTabla;
