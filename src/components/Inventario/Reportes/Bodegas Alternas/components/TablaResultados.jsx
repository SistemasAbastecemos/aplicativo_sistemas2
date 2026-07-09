import React, { useState, useMemo } from "react";
import styles from "../BodegasAlternas.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSort,
  faSortUp,
  faSortDown,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

export const TablaResultados = React.memo(
  ({ items, onEditClick, puedeEditar }) => {
    const [sortConfig, setSortConfig] = useState({
      key: null,
      direction: "asc",
    });

    const handleRequestSort = (key) => {
      let direction = "asc";
      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
      }
      setSortConfig({ key, direction });
    };

    const sortedItems = useMemo(() => {
      if (!items || !Array.isArray(items)) return [];

      const listado = [...items];
      if (sortConfig.key) {
        listado.sort((a, b) => {
          const valA = String(a[sortConfig.key] ?? "")
            .trim()
            .toUpperCase();
          const valB = String(b[sortConfig.key] ?? "")
            .trim()
            .toUpperCase();
          return sortConfig.direction === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        });
      }
      return listado;
    }, [items, sortConfig]);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return (
        <div className={styles.estadoVacioContainer}>
          No se registran datos para mostrar. Modifique las variables de entrada
          e inicie la consulta.
        </div>
      );
    }

    return (
      <div className={styles.gridModuloWrapper}>
        <div className={styles.desktopViewContainer}>
          <div className={styles.tableResponsiveContainer}>
            <table className={styles.appleDataTableNative}>
              <thead>
                <tr>
                  <th
                    onClick={() => handleRequestSort("codigo")}
                    className={styles.thSortableHeader}
                  >
                    Código{" "}
                    <FontAwesomeIcon
                      icon={
                        sortConfig.key === "codigo"
                          ? sortConfig.direction === "asc"
                            ? faSortUp
                            : faSortDown
                          : faSort
                      }
                    />
                  </th>
                  <th
                    onClick={() => handleRequestSort("nombre")}
                    className={styles.thSortableHeader}
                  >
                    Nombre de Bodega{" "}
                    <FontAwesomeIcon
                      icon={
                        sortConfig.key === "nombre"
                          ? sortConfig.direction === "asc"
                            ? faSortUp
                            : faSortDown
                          : faSort
                      }
                    />
                  </th>
                  <th
                    onClick={() => handleRequestSort("sede_codigo")}
                    className={styles.thSortableHeader}
                  >
                    Sede Relacionada{" "}
                    <FontAwesomeIcon
                      icon={
                        sortConfig.key === "sede_codigo"
                          ? sortConfig.direction === "asc"
                            ? faSortUp
                            : faSortDown
                          : faSort
                      }
                    />
                  </th>
                  <th>Observaciones Operativas</th>
                  {puedeEditar && (
                    <th style={{ textAlign: "center" }}>Acción</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((bodega) => (
                  <tr key={bodega.id || bodega.codigo}>
                    <td className={styles.tdItemCode}>{bodega.codigo}</td>
                    <td className={styles.tdItemDesc}>{bodega.nombre}</td>
                    <td>
                      <span className={styles.storeBadgeCustom}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} />{" "}
                        {bodega.sede_codigo || "N/A"}
                      </span>
                    </td>
                    <td className={styles.tdObservacionesText}>
                      {bodega.observaciones || "Sin anotaciones."}
                    </td>
                    {puedeEditar && (
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => onEditClick(bodega)}
                          className={styles.btnTableEditAction}
                        >
                          <FontAwesomeIcon icon={faEdit} /> Ajustar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.mobileViewContainer}>
          <div className={styles.appleResponsiveGrid}>
            {sortedItems.map((bodega) => (
              <div
                key={bodega.id || bodega.codigo}
                className={styles.itemBentoCard}
              >
                <div className={styles.cardHeaderFlex}>
                  <span className={styles.badgeCodigoRef}>{bodega.codigo}</span>
                  {puedeEditar && (
                    <button
                      type="button"
                      onClick={() => onEditClick(bodega)}
                      className={styles.btnActionEditCircle}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  )}
                </div>
                <h3 className={styles.itemCardTitle}>{bodega.nombre}</h3>
                <p className={styles.itemCardDesc}>
                  {bodega.observaciones || "Sin anotaciones registradas."}
                </p>
                <div className={styles.diasAsignadosFooter}>
                  <span className={styles.storeBadgeCustom}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> Sede:{" "}
                    {bodega.sede_codigo || "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

TablaResultados.displayName = "TablaResultados";
