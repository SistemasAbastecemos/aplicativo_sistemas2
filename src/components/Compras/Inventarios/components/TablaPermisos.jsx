import React, { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faSort,
  faSortUp,
  faSortDown,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../PermisosInventario.module.css";

function TablaPermisos({ matrix, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

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

  const sortedMatrix = useMemo(() => {
    let sortableItems = [...matrix];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key]
          ? a[sortConfig.key].toString().toLowerCase()
          : "";
        let valB = b[sortConfig.key]
          ? b[sortConfig.key].toString().toLowerCase()
          : "";
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [matrix, sortConfig]);

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
      <FontAwesomeIcon icon={faSortUp} style={{ marginLeft: "0.5rem" }} />
    ) : (
      <FontAwesomeIcon icon={faSortDown} style={{ marginLeft: "0.5rem" }} />
    );
  };

  const totalRows = sortedMatrix.length;
  const totalPages = Math.ceil(totalRows / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedMatrix.slice(start, start + itemsPerPage);
  }, [sortedMatrix, currentPage]);

  const formatColumnas = (cols) => {
    if (!cols) return "Ninguna";
    if (typeof cols === "string") return cols;
    return (
      Object.keys(cols)
        .filter((k) => cols[k])
        .join(", ") || "Ninguna"
    );
  };

  const formatCriterios = (crits) => {
    if (!crits) return "(Todos)";
    if (Array.isArray(crits)) return crits.join(", ") || "(Todos)";
    if (typeof crits === "string") return crits || "(Todos)";
    return "(Todos)";
  };

  const formatExclusiones = (lineas) => {
    if (!lineas) return "Ninguna";
    if (Array.isArray(lineas)) return lineas.join(", ") || "Ninguna";
    return String(lineas);
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("nit_proveedor")}
              style={{ cursor: "pointer" }}
            >
              NIT {renderSortIcon("nit_proveedor")}
            </th>
            <th
              onClick={() => handleSort("razon_social")}
              style={{ cursor: "pointer" }}
            >
              Razón Social {renderSortIcon("razon_social")}
            </th>
            <th>Métricas Permitidas</th>
            <th>Sedes</th>
            <th>Criterios 1</th>
            <th>Exclusiones Línea</th>
            <th
              onClick={() => handleSort("acceso_inventario")}
              style={{ cursor: "pointer" }}
            >
              Estado {renderSortIcon("acceso_inventario")}
            </th>
            <th style={{ textAlign: "right" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row) => (
            <tr key={row.id}>
              <td data-label="NIT" className={styles.textCode}>
                {row.nit_proveedor}
              </td>
              <td data-label="Razón Social">
                <strong>{row.razon_social}</strong>
              </td>
              <td
                data-label="Métricas"
                className={styles.textClip}
                title={formatColumnas(row.columnas_permitidas)}
              >
                {formatColumnas(row.columnas_permitidas)}
              </td>
              <td
                data-label="Sedes"
                className={styles.textClip}
                title={formatExclusiones(row.sedes_permitidas)}
              >
                {formatExclusiones(row.sedes_permitidas)}
              </td>
              <td
                data-label="Criterios"
                className={styles.textClip}
                title={formatCriterios(row.criterios)}
              >
                {formatCriterios(row.criterios)}
              </td>
              <td
                data-label="Exclusiones"
                className={styles.textClip}
                title={formatExclusiones(row.lineas_excluidas)}
              >
                {formatExclusiones(row.lineas_excluidas)}
              </td>
              <td data-label="Estado">
                {Number(row.acceso_inventario) === 1 ? (
                  <span
                    className={styles.badgeActive}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#03996b",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                    }}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} /> Abierto
                  </span>
                ) : (
                  <span
                    className={styles.badgeInactive}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#ff3b30",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                    }}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} /> Bloqueado
                  </span>
                )}
              </td>
              <td data-label="Acciones" style={{ textAlign: "right" }}>
                <div className={styles.actionButtons}>
                  <button
                    className={styles.btnAction}
                    onClick={() => onEdit(row)}
                    type="button"
                  >
                    Ajustar
                  </button>
                  <button
                    className={styles.btnDeleteAction}
                    onClick={() => onDelete(row)}
                    type="button"
                  >
                    Revocar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span className={styles.paginationInfo}>
            Página <strong>{currentPage}</strong> de{" "}
            <strong>{totalPages}</strong> ({totalRows} totales)
          </span>
          <button
            className={styles.paginationButton}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

export default TablaPermisos;
