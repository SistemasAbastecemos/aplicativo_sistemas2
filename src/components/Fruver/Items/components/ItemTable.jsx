import React, { useState, useMemo } from "react";
import styles from "../AdministrarItems.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faUserShield,
  faUserAlt,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";

const ItemTable = React.memo(({ items, onEditClick }) => {
  // Estado local para gobernar la columna activa y direccion del ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Manejador del trigger de ordenamiento por columna
  const handleRequestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Computacion reactiva optimizada para ordenar el set de registros actual
  const sortedItems = useMemo(() => {
    const elementosOrdenables = [...items];
    if (sortConfig.key !== null) {
      elementosOrdenables.sort((a, b) => {
        let valorA = a[sortConfig.key] ?? "";
        let valorB = b[sortConfig.key] ?? "";

        // Normalizacion a strings en mayusculas para ordenamiento alfabetico estricto
        valorA = String(valorA).trim().toUpperCase();
        valorB = String(valorB).trim().toUpperCase();

        if (valorA < valorB) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (valorA > valorB) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return elementosOrdenables;
  }, [items, sortConfig]);

  // Retorna el icono correcto segun el estado actual de la cascada de ordenamiento
  const obtenerIconoOrdenamiento = (key) => {
    if (sortConfig.key !== key) return faSort;
    return sortConfig.direction === "asc" ? faSortUp : faSortDown;
  };

  return (
    <div className={styles.tableResponsiveContainer}>
      <table className={styles.appleDataTableNative}>
        <thead>
          <tr>
            <th
              onClick={() => handleRequestSort("item")}
              className={styles.thSortableHeader}
            >
              Código{" "}
              <FontAwesomeIcon
                icon={obtenerIconoOrdenamiento("item")}
                className={styles.iconSortIndicator}
              />
            </th>
            <th
              onClick={() => handleRequestSort("descripcion")}
              className={styles.thSortableHeader}
            >
              Descripción / Ítem{" "}
              <FontAwesomeIcon
                icon={obtenerIconoOrdenamiento("descripcion")}
                className={styles.iconSortIndicator}
              />
            </th>
            <th
              onClick={() => handleRequestSort("administrador")}
              className={styles.thSortableHeader}
            >
              Tipo Pedido{" "}
              <FontAwesomeIcon
                icon={obtenerIconoOrdenamiento("administrador")}
                className={styles.iconSortIndicator}
              />
            </th>
            <th
              onClick={() => handleRequestSort("comprador")}
              className={styles.thSortableHeader}
            >
              Comprador Asignado{" "}
              <FontAwesomeIcon
                icon={obtenerIconoOrdenamiento("comprador")}
                className={styles.iconSortIndicator}
              />
            </th>
            <th
              onClick={() => handleRequestSort("dias_pedido")}
              className={styles.thSortableHeader}
            >
              Días Pedido{" "}
              <FontAwesomeIcon
                icon={obtenerIconoOrdenamiento("dias_pedido")}
                className={styles.iconSortIndicator}
              />
            </th>
            <th>Observaciones</th>
            <th style={{ textAlign: "center" }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item) => {
            const esAdmin = String(item.administrador) === "1";
            return (
              <tr key={item.item}>
                <td className={styles.tdItemCode}>{item.item}</td>
                <td className={styles.tdItemDesc}>{item.descripcion}</td>
                <td>
                  <span
                    className={
                      esAdmin ? styles.badgeAdminSi : styles.badgeAdminNo
                    }
                  >
                    <FontAwesomeIcon
                      icon={esAdmin ? faUserShield : faUserAlt}
                    />{" "}
                    {esAdmin ? "Administrador" : "Estándar"}
                  </span>
                </td>
                <td>{item.comprador || "No asignado"}</td>
                <td>
                  <span
                    className={
                      item.dias_pedido
                        ? styles.tableDaysText
                        : styles.tableDaysEmpty
                    }
                  >
                    {item.dias_pedido || "Ninguno"}
                  </span>
                </td>
                <td className={styles.tdObservacionesText}>
                  {item.observaciones || "-"}
                </td>
                <td style={{ textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => onEditClick(item)}
                    className={styles.btnTableEditAction}
                  >
                    <FontAwesomeIcon icon={faEdit} /> Editar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

ItemTable.displayName = "ItemTable";
export default ItemTable;
