import React from "react";
import styles from "../ExistenciasCostos.module.css";
import EmptyState from "../../../../UI/EmptyState";
import {
  faBuilding,
  faSort,
  faSortUp,
  faSortDown,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TablaReporte = React.memo(({ model }) => {
  const {
    dataPaginada,
    dataProcesada,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    sortConfig,
    handleSort,
  } = model;

  if (!model.reporteData || model.reporteData.length === 0) {
    return (
      <EmptyState
        icon={faBuilding}
        title="Sin balances para mostrar"
        description="Fije un periodo contable valido para procesar el inventario."
      />
    );
  }

  if (dataProcesada.length === 0) {
    return (
      <EmptyState
        icon={faBuilding}
        title="Sin resultados en filtros"
        description="No se hallaron coincidencias para los criterios de busqueda aplicados."
      />
    );
  }

  const getAbcBadge = (abc) => {
    if (abc === "A") return styles.badgeA;
    if (abc === "B") return styles.badgeB;
    return styles.badgeC;
  };

  const formatFecha = (rawDate) => {
    if (!rawDate || String(rawDate).length !== 8) return rawDate;
    const str = String(rawDate);
    return `${str.substring(0, 4)}-${str.substring(4, 6)}-${str.substring(6, 8)}`;
  };

  const totalPages = Math.ceil(dataProcesada.length / rowsPerPage);
  const inicioRegistro = (currentPage - 1) * rowsPerPage + 1;
  const finRegistro = Math.min(currentPage * rowsPerPage, dataProcesada.length);

  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FontAwesomeIcon icon={faSort} className={styles.iconSortMuted} />;
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className={styles.iconSortActive} />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className={styles.iconSortActive} />
    );
  };

  return (
    <div className={styles.contenedorTablaMaestra}>
      <div className={styles.tablaResponsivaWrapper}>
        <table className={styles.tablaConfig} style={{ fontSize: "0.78rem" }}>
          <thead>
            <tr
              style={{
                backgroundColor: "#f5f5f7",
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              {/* --- BLOQUE 1: JERARQUIAS Y MAESTROS --- */}
              <th
                onClick={() => handleSort("sede")}
                className={styles.thSortable}
              >
                Sede {renderSortIcon("sede")}
              </th>
              <th
                onClick={() => handleSort("local")}
                className={styles.thSortable}
              >
                Local {renderSortIcon("local")}
              </th>
              <th
                onClick={() => handleSort("grupo1")}
                className={styles.thSortable}
              >
                Grupo 1 {renderSortIcon("grupo1")}
              </th>
              <th
                onClick={() => handleSort("linea1")}
                className={styles.thSortable}
              >
                Linea 1 {renderSortIcon("linea1")}
              </th>
              <th
                onClick={() => handleSort("linea2")}
                className={styles.thSortable}
              >
                Linea 2 {renderSortIcon("linea2")}
              </th>
              <th
                onClick={() => handleSort("linea3")}
                className={styles.thSortable}
              >
                Linea 3 {renderSortIcon("linea3")}
              </th>
              <th
                onClick={() => handleSort("criterio")}
                className={styles.thSortable}
              >
                Criterio {renderSortIcon("criterio")}
              </th>
              <th
                onClick={() => handleSort("item")}
                className={styles.thSortable}
              >
                Item {renderSortIcon("item")}
              </th>
              <th
                onClick={() => handleSort("descripcion")}
                className={styles.thSortable}
              >
                Descripcion {renderSortIcon("descripcion")}
              </th>
              <th
                onClick={() => handleSort("proveedor")}
                className={styles.thSortable}
              >
                Proveedor {renderSortIcon("proveedor")}
              </th>
              <th
                onClick={() => handleSort("fecha_ultima_compra")}
                className={styles.thSortable}
              >
                Ult. Compra {renderSortIcon("fecha_ultima_compra")}
              </th>

              {/* --- BLOQUE 2: SALDOS Y PRECIOS --- */}
              <th
                onClick={() => handleSort("precio_venta")}
                className={`${styles.numeroAlineado} ${styles.thSortable}`}
              >
                Precio Venta {renderSortIcon("precio_venta")}
              </th>
              <th
                onClick={() => handleSort("existencia_final")}
                className={`${styles.numeroAlineado} ${styles.thSortable}`}
              >
                Exist. Final {renderSortIcon("existencia_final")}
              </th>
              <th
                onClick={() => handleSort("costo_final")}
                className={`${styles.numeroAlineado} ${styles.thSortable}`}
              >
                Costo Final {renderSortIcon("costo_final")}
              </th>

              {/* --- BLOQUE 3: VENTAS HISTORICAS TRAZABLES --- */}
              <th
                onClick={() => handleSort("cantidad_vendida_ayer")}
                className={`${styles.numeroAlineado} ${styles.thSortable}`}
              >
                Cant. Ayer {renderSortIcon("cantidad_vendida_ayer")}
              </th>
              <th
                onClick={() => handleSort("valor_ventas_ayer")}
                className={`${styles.numeroAlineado} ${styles.thSortable}`}
              >
                Vlr. Ayer {renderSortIcon("valor_ventas_ayer")}
              </th>
              <th
                onClick={() => handleSort("cantidad_vendida")}
                className={`${styles.numeroAlineado} ${styles.thSortable}`}
              >
                Cant. Mes {renderSortIcon("cantidad_vendida")}
              </th>
              <th
                onClick={() => handleSort("valor_ventas")}
                className={`${styles.numeroAlineado} ${styles.thSortable}`}
              >
                Vlr. Mes {renderSortIcon("valor_ventas")}
              </th>
              <th
                onClick={() => handleSort("cantidad_vendida_mes_anterior")}
                className={`${styles.numeroAlineado} ${styles.thSortable}`}
              >
                Cant. Mes Ant. {renderSortIcon("cantidad_vendida_mes_anterior")}
              </th>
              <th
                onClick={() => handleSort("valor_ventas_mes_anterior")}
                className={`${styles.numeroAlineado} ${styles.thSortable}`}
              >
                Vlr. Mes Ant. {renderSortIcon("valor_ventas_mes_anterior")}
              </th>
              <th
                onClick={() => handleSort("cantidad_promedio_4m")}
                className={`${styles.numeroAlineado} ${styles.thSortable}`}
              >
                Cant. Prom 4M {renderSortIcon("cantidad_promedio_4m")}
              </th>
              <th
                onClick={() => handleSort("valor_promedio_4m")}
                className={`${styles.numeroAlineado} ${styles.thSortable}`}
              >
                Vlr. Prom 4M {renderSortIcon("valor_promedio_4m")}
              </th>

              {/* --- BLOQUE 4: PARAMETROS ANALITICOS --- */}
              <th
                onClick={() => handleSort("consumo_promedio")}
                className={`${styles.numeroAlineado} ${styles.thSortable}`}
              >
                Consumo Prom. {renderSortIcon("consumo_promedio")}
              </th>
              <th
                onClick={() => handleSort("dias_promedio")}
                className={`${styles.numeroAlineado} ${styles.thSortable}`}
              >
                Dias Inv. {renderSortIcon("dias_promedio")}
              </th>
              <th
                onClick={() => handleSort("valor_exceso")}
                className={`${styles.numeroAlineado} ${styles.thSortable}`}
              >
                Valor Exceso {renderSortIcon("valor_exceso")}
              </th>
              <th
                onClick={() => handleSort("clasificacion_abc")}
                className={styles.thSortable}
                style={{ textAlign: "center" }}
              >
                ABC {renderSortIcon("clasificacion_abc")}
              </th>
            </tr>
          </thead>
          <tbody>
            {dataPaginada.map((item, idx) => (
              <tr key={`${item.item}-${item.local}-${idx}`}>
                {/* Maestros */}
                <td>{item.sede}</td>
                <td>{item.local}</td>
                <td style={{ whiteSpace: "nowrap" }}>{item.grupo1}</td>
                <td style={{ whiteSpace: "nowrap" }}>{item.linea1}</td>
                <td style={{ whiteSpace: "nowrap" }}>{item.linea2}</td>
                <td style={{ whiteSpace: "nowrap" }}>{item.linea3}</td>
                <td>{item.criterio}</td>
                <td style={{ fontWeight: "600" }}>{item.item}</td>
                <td style={{ minWidth: "220px" }}>{item.descripcion}</td>
                <td style={{ whiteSpace: "nowrap" }}>{item.proveedor}</td>
                <td>{formatFecha(item.fecha_ultima_compra)}</td>

                {/* Saldos */}
                <td className={styles.numeroAlineado}>
                  $
                  {item.precio_venta.toLocaleString("es-CO", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className={styles.numeroAlineado}>
                  {item.existencia_final.toLocaleString("es-CO")}
                </td>
                <td className={styles.numeroAlineado}>
                  $
                  {item.costo_final.toLocaleString("es-CO", {
                    minimumFractionDigits: 2,
                  })}
                </td>

                {/* Ventas */}
                <td className={styles.numeroAlineado}>
                  {item.cantidad_vendida_ayer.toLocaleString("es-CO")}
                </td>
                <td className={styles.numeroAlineado}>
                  $
                  {item.valor_ventas_ayer.toLocaleString("es-CO", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className={styles.numeroAlineado}>
                  {item.cantidad_vendida.toLocaleString("es-CO")}
                </td>
                <td className={styles.numeroAlineado}>
                  $
                  {item.valor_ventas.toLocaleString("es-CO", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className={styles.numeroAlineado}>
                  {item.cantidad_vendida_mes_anterior.toLocaleString("es-CO")}
                </td>
                <td className={styles.numeroAlineado}>
                  $
                  {item.valor_ventas_mes_anterior.toLocaleString("es-CO", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className={styles.numeroAlineado}>
                  {item.cantidad_promedio_4m.toLocaleString("es-CO", {
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className={styles.numeroAlineado}>
                  $
                  {item.valor_promedio_4m.toLocaleString("es-CO", {
                    minimumFractionDigits: 2,
                  })}
                </td>

                {/* Analitica */}
                <td className={styles.numeroAlineado}>
                  {item.consumo_promedio.toLocaleString("es-CO", {
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td
                  className={styles.numeroAlineado}
                  style={{ fontWeight: "600" }}
                >
                  {Math.round(item.dias_promedio)} d
                </td>
                <td
                  className={styles.numeroAlineado}
                  style={{
                    color: item.valor_exceso > 0 ? "#b91c1c" : "inherit",
                  }}
                >
                  $
                  {item.valor_exceso.toLocaleString("es-CO", {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td style={{ textAlign: "center" }}>
                  <span className={getAbcBadge(item.clasificacion_abc)}>
                    {item.clasificacion_abc}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- PANEL DE CONTROL DE PAGINACION --- */}
      <div className={styles.paginacionContainer}>
        <div className={styles.paginacionMeta}>
          Mostrando <strong>{inicioRegistro}</strong> al{" "}
          <strong>{finRegistro}</strong> de{" "}
          <strong>{dataProcesada.length}</strong> registros
          {dataProcesada.length !== model.reporteData.length &&
            ` (filtrados de ${model.reporteData.length})`}
        </div>

        <div className={styles.paginacionControles}>
          <div className={styles.rowsSelectorWrapper}>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={25}>25 Filas</option>
              <option value={50}>50 Filas</option>
              <option value={100}>100 Filas</option>
              <option value={200}>200 Filas</option>
            </select>
          </div>

          <div className={styles.paginacionBotonera}>
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <FontAwesomeIcon icon={faAngleDoubleLeft} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <span className={styles.paginacionLabel}>
              Pagina {currentPage} de {totalPages || 1}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <FontAwesomeIcon icon={faAngleDoubleRight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

TablaReporte.displayName = "TablaReporte";
export default TablaReporte;
