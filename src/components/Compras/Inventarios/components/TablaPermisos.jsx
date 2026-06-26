import React, { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faEdit,
  faTrash,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../PermisosInventario.module.css";

function TablaPermisos({ matrix, loading, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Tamaño de bloque visual solicitado

  // Estado para la ordenación global
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Si cambian los registros o el criterio de ordenación, regresamos a la primera página
  useEffect(() => {
    setCurrentPage(1);
  }, [matrix, sortConfig]);

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
          style={{ marginLeft: "0.5rem", opacity: 0.3 }}
        />
      );
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon
        icon={faSortUp}
        style={{ marginLeft: "0.5rem", color: "#009b6d" }}
      />
    ) : (
      <FontAwesomeIcon
        icon={faSortDown}
        style={{ marginLeft: "0.5rem", color: "#009b6d" }}
      />
    );
  };

  // 1. ORDENACIÓN GLOBAL: Se procesa sobre el 100% de los datos devueltos
  const sortedMatrix = useMemo(() => {
    if (!matrix) return [];
    let sortableItems = [...matrix];

    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (valA === undefined || valA === null) valA = "";
        if (valB === undefined || valB === null) valB = "";

        if (typeof valA === "string" && typeof valB === "string") {
          return sortConfig.direction === "asc"
            ? valA.localeCompare(valB, "es")
            : valB.localeCompare(valA, "es");
        }

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [matrix, sortConfig]);

  // 2. PAGINACIÓN LOCAL: Segmentamos el resultado ya ordenado globalmente
  const totalRows = sortedMatrix.length;
  const totalPages = Math.ceil(totalRows / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = sortedMatrix.slice(startIndex, endIndex);

  if (loading && matrix.length === 0) {
    return (
      <div className={styles.loaderArea}>
        <FontAwesomeIcon icon={faSpinner} spin className={styles.spinner} />
        <p>Consultando repositorio...</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("nit_proveedor")}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              NIT {renderSortIcon("nit_proveedor")}
            </th>
            <th
              onClick={() => handleSort("razon_social")}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              Razón Social {renderSortIcon("razon_social")}
            </th>
            <th
              onClick={() => handleSort("origen_consulta_saldo")}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              Estrategia {renderSortIcon("origen_consulta_saldo")}
            </th>
            <th>Criterios Asociados</th>
            <th
              onClick={() => handleSort("acceso_inventario")}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              Estado {renderSortIcon("acceso_inventario")}
            </th>
            <th className={styles.centerAlign}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentRecords.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#64748b",
                }}
              >
                No existen proveedores parametrizados.
              </td>
            </tr>
          ) : (
            currentRecords.map((row) => (
              <tr key={row.id}>
                <td className={styles.boldText}>{row.nit_proveedor}</td>
                <td>{row.razon_social}</td>
                <td>
                  <span className={styles.badgeEstrategia}>
                    {row.origen_consulta_saldo}
                  </span>
                </td>
                <td>
                  <div className={styles.inlineCriteriosGrid}>
                    {(row.criterios || []).length === 0 ? (
                      <span className={styles.noData}>Ninguno</span>
                    ) : (
                      row.criterios.map((c) => (
                        <span key={c} className={styles.badgeGridCriterio}>
                          {c}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td>
                  <span
                    className={`${styles.statusLabel} ${row.acceso_inventario === 1 ? styles.statusOk : styles.statusBad}`}
                  >
                    {row.acceso_inventario === 1 ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className={styles.centerAlign}>
                  <div className={styles.actionButtonsGroup}>
                    <button
                      className={styles.editActionBtn}
                      onClick={() => onEdit(row)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Modificar
                    </button>
                    <button
                      className={styles.deleteActionBtn}
                      onClick={() => onDelete(row)}
                    >
                      <FontAwesomeIcon icon={faTrash} /> Revocar
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* BLOQUE DE PAGINACIÓN VISUAL INTERNA (Alineado dentro del wrapper) */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Anterior
          </button>
          <span className={styles.pageInfo}>
            Página <b>{currentPage}</b> de <b>{totalPages}</b> ({totalRows}{" "}
            registros totales)
          </span>
          <button
            className={styles.pageBtn}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

export default TablaPermisos;
