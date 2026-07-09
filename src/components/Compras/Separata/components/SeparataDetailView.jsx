import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faFileExcel,
  faFileDownload,
  faExclamationTriangle,
  faPencilAlt,
  faCheckCircle,
  faTimesCircle,
  faChevronLeft,
  faChevronRight,
  faEdit,
  faTrash,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../ProgramacionSeparata.module.css";
import EmptyState from "../../../UI/EmptyState";
import { formatearNumero, formatearFecha } from "../utils/formatters";
import { puedeEditarItems, haPasadoFechaLimite } from "../utils/permissions";

const ITEMS_PER_PAGE = 12;

/**
 * Vista de detalle de una separata: título editable inline, banner de aviso
 * cuando la fecha límite venció (para usuarios no autorizados), tabla de items
 * con acciones edit/delete y paginación. Botones de exportar y descarga de
 * reporte de ventas viven acá.
 */
const SeparataDetailView = ({
  separata,
  items,
  paginationData,
  currentPage,
  onPageChange,
  onBack,
  onEditItem,
  onDeleteItem,
  login,
  onExport,
  onDownloadReport,
  mostrarBotonReporte,
  tituloEditor,
}) => {
  const puedeEditar = puedeEditarItems(login);
  const fechaLimiteVencida = haPasadoFechaLimite(separata);

  return (
    <div className={styles.detailView}>
      <div className={styles.detailHeader}>
        <div className={styles.headerMain}>
          <button className={styles.backButton} onClick={onBack} type="button">
            <FontAwesomeIcon icon={faArrowLeft} />
            Volver
          </button>
          <div className={styles.headerTitle}>
            {tituloEditor.editingSeparataId === separata.id ? (
              <div className={styles.editarTituloContainer}>
                <input
                  type="text"
                  className={styles.inputTituloGrande}
                  value={tituloEditor.tituloEditar}
                  onChange={tituloEditor.handleTituloChange}
                  placeholder="Ingrese título de la separata"
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
                <h2>{separata.titulo || "Separata Sin Título"}</h2>
                {tituloEditor.puedeEditar && (
                  <button
                    className={styles.botonEditarTitulo}
                    onClick={() => tituloEditor.iniciarEdicion(separata)}
                    title="Editar título"
                    type="button"
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </button>
                )}
              </div>
            )}
            <span className={styles.dateRange}>
              {formatearFecha(separata.fecha_inicio)} a{" "}
              {formatearFecha(separata.fecha_final)}
            </span>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.exportButton}
            onClick={onExport}
            type="button"
          >
            <FontAwesomeIcon icon={faFileExcel} />
            Exportar
          </button>

          {mostrarBotonReporte && (
            <button
              className={styles.reportButton}
              onClick={onDownloadReport}
              title="Descargar reporte de ventas"
              type="button"
            >
              <FontAwesomeIcon icon={faFileDownload} />
              Reporte Ventas
            </button>
          )}
        </div>
      </div>

      {!puedeEditar && fechaLimiteVencida && (
        <div className={styles.warningBanner}>
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>
            La fecha límite de edición ha pasado (
            {formatearFecha(separata.fecha_limite_edicion)}). Solo usuarios
            autorizados pueden modificar items.
          </span>
        </div>
      )}

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3>Items de la Separata</h3>
          <span className={styles.tableCount}>{items.length} items</span>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={faBoxOpen}
            title="No hay items en esta separata"
            description="Agrega items usando el formulario lateral."
          />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Precio Antes</th>
                  <th>Descuento</th>
                  <th>Precio Final</th>
                  <th>Unidad</th>
                  <th>Usuario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td className={styles.rowNumber} data-label="#">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className={styles.codeCell} data-label="Código">
                      {item.item}
                    </td>
                    <td
                      className={styles.descriptionCell}
                      data-label="Descripción"
                    >
                      <div>
                        <strong>{item.descripcion}</strong>
                        {item.linea2 && (
                          <div className={styles.linea2}>{item.linea2}</div>
                        )}
                      </div>
                    </td>
                    <td className={styles.priceCell} data-label="Precio Antes">
                      ${formatearNumero(item.precio_antes)}
                    </td>
                    <td className={styles.discountCell} data-label="Descuento">
                      <span className={styles.discountValue}>
                        {item.descuento}%
                      </span>
                    </td>
                    <td
                      className={styles.finalPriceCell}
                      data-label="Precio Final"
                    >
                      <strong>${formatearNumero(item.precio_ahora)}</strong>
                    </td>
                    <td data-label="Unidad">{item.unidad_medida}</td>
                    <td className={styles.userCell} data-label="Usuario">
                      {item.usuario}
                    </td>
                    <td data-label="Acciones">
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.tableActionButton}
                          onClick={() => onEditItem(item)}
                          disabled={!puedeEditar && fechaLimiteVencida}
                          title={
                            !puedeEditar && fechaLimiteVencida
                              ? "No tiene permisos para editar"
                              : "Editar item"
                          }
                          type="button"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className={`${styles.tableActionButton} ${styles.danger}`}
                          onClick={() => onDeleteItem(item.id)}
                          disabled={!puedeEditar && fechaLimiteVencida}
                          title={
                            !puedeEditar && fechaLimiteVencida
                              ? "No tiene permisos para eliminar"
                              : "Eliminar item"
                          }
                          type="button"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {paginationData.totalPages > 1 && (
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
            Página <strong>{currentPage}</strong> de {paginationData.totalPages}
          </div>

          <button
            className={styles.paginationButton}
            onClick={() =>
              onPageChange(Math.min(currentPage + 1, paginationData.totalPages))
            }
            disabled={currentPage === paginationData.totalPages}
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

export default SeparataDetailView;
