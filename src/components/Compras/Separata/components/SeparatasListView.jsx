import React, { useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faChevronLeft,
  faChevronRight,
  faCircle,
  faFolderOpen,
  faPencilAlt,
  faCheckCircle,
  faTimesCircle,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../ProgramacionSeparata.module.css";
import EmptyState from "../../../UI/EmptyState";
import { formatearFecha, esSeparataVigente } from "../utils/formatters";

const ITEMS_PER_PAGE = 12;

/**
 * Tabla de separatas con búsqueda (trim aplicado) y paginación.
 * Cada fila muestra título editable inline, fechas, estado (vigente/finalizada)
 * y botón para abrir el detalle.
 */
const SeparatasListView = ({
  separatas,
  onSelectSeparata,
  currentPage,
  onPageChange,
  tituloEditor,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const searchTrimmed = useMemo(() => searchTerm.trim(), [searchTerm]);
  const hayBusqueda = searchTrimmed.length > 0;

  const filteredSeparatas = useMemo(() => {
    if (!searchTrimmed) return separatas;
    const lowerSearch = searchTrimmed.toLowerCase();

    return separatas.filter((sep) => {
      const titulo = (sep.titulo || "").toLowerCase();
      const id = sep.id?.toString() || "";
      const fechaInicio = sep.fecha_inicio || "";
      const fechaFinal = sep.fecha_final || "";
      const limite = sep.fecha_limite_edicion || "";
      const estado = esSeparataVigente(sep.fecha_final)
        ? "vigente"
        : "finalizada";

      return (
        titulo.includes(lowerSearch) ||
        id.includes(lowerSearch) ||
        fechaInicio.includes(lowerSearch) ||
        fechaFinal.includes(lowerSearch) ||
        limite.includes(lowerSearch) ||
        estado.includes(lowerSearch)
      );
    });
  }, [separatas, searchTrimmed]);

  // Al cambiar la búsqueda, siempre volver a la página 1.
  useEffect(() => {
    onPageChange(1);
  }, [searchTrimmed, onPageChange]);

  const totalPages = Math.ceil(filteredSeparatas.length / ITEMS_PER_PAGE);
  const currentItems = filteredSeparatas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSearchChange = (e) => {
    // Bloquea espacios al inicio en tiempo real
    setSearchTerm(e.target.value.replace(/^\s+/, ""));
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeaderGroup}>
        <div className={styles.tableHeaderLeft}>
          <h3>Lista de Separatas</h3>
          <span className={styles.tableCount}>
            {filteredSeparatas.length} resultados
          </span>
        </div>

        <div className={styles.searchListContainer}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchListIcon} />
          <input
            type="text"
            placeholder="Buscar por título, fecha o estado..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchListInput}
          />
        </div>
      </div>

      {filteredSeparatas.length === 0 ? (
        <EmptyState
          icon={hayBusqueda ? faSearch : faClipboardList}
          title={
            hayBusqueda ? "Sin coincidencias" : "No hay separatas registradas"
          }
          description={
            hayBusqueda
              ? `No se encontraron separatas que coincidan con "${searchTrimmed}".`
              : "Comienza creando una nueva separata desde el formulario lateral."
          }
        />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Título</th>
                <th>Fecha Inicio</th>
                <th>Fecha Final</th>
                <th>Límite Edición</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((separata, index) => (
                <tr key={separata.id} className={styles.tableRow}>
                  <td className={styles.rowNumber} data-label="#">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className={styles.titleCell} data-label="Título">
                    {tituloEditor.editingSeparataId === separata.id ? (
                      <div className={styles.editarTituloContainer}>
                        <input
                          type="text"
                          className={styles.inputTitulo}
                          value={tituloEditor.tituloEditar}
                          onChange={tituloEditor.handleTituloChange}
                          placeholder="Ingrese título"
                        />
                        <div className={styles.botonesTitulo}>
                          <button
                            className={styles.botonGuardarTitulo}
                            onClick={() => tituloEditor.guardar(separata.id)}
                            disabled={tituloEditor.editandoTitulo}
                            type="button"
                          >
                            <FontAwesomeIcon icon={faCheckCircle} />
                          </button>
                          <button
                            className={styles.botonCancelarTitulo}
                            onClick={tituloEditor.cancelarEdicion}
                            type="button"
                          >
                            <FontAwesomeIcon icon={faTimesCircle} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.tituloContainer}>
                        <span className={styles.tituloText}>
                          {separata.titulo || `Separata #${separata.id}`}
                        </span>
                        {tituloEditor.puedeEditar && (
                          <button
                            className={styles.botonEditarTitulo}
                            onClick={() =>
                              tituloEditor.iniciarEdicion(separata)
                            }
                            title="Editar título"
                            type="button"
                          >
                            <FontAwesomeIcon icon={faPencilAlt} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td data-label="Fecha Inicio">
                    {formatearFecha(separata.fecha_inicio)}
                  </td>
                  <td data-label="Fecha Final">
                    {formatearFecha(separata.fecha_final)}
                  </td>
                  <td data-label="Fecha Límite Edición">
                    {separata.fecha_limite_edicion
                      ? formatearFecha(separata.fecha_limite_edicion)
                      : "No definida"}
                  </td>
                  <td data-label="Estado">
                    <span
                      className={`${styles.statusBadge} ${
                        esSeparataVigente(separata.fecha_final)
                          ? styles.statusActive
                          : styles.statusInactive
                      }`}
                    >
                      <FontAwesomeIcon icon={faCircle} />
                      {esSeparataVigente(separata.fecha_final)
                        ? "Vigente"
                        : "Finalizada"}
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <button
                      className={styles.tableButton}
                      onClick={() => onSelectSeparata(separata)}
                      type="button"
                    >
                      <FontAwesomeIcon icon={faFolderOpen} />
                      Abrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            type="button"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
            Anterior
          </button>

          <div className={styles.paginationInfo}>
            Página <strong>{currentPage}</strong> de {totalPages}
          </div>

          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            type="button"
          >
            Siguiente
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SeparatasListView;
