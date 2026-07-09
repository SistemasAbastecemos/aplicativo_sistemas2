import React, { useRef, useState } from "react";
import styles from "../ExistenciasAverias.module.css";
import { COLUMNAS_TABLA } from "../utils/constants";

import BarraFiltrosDropdowns from "./BarraFiltrosDropdowns";
import EncabezadoTabla from "./EncabezadoTabla";
import FilaTabla from "./FilaTabla";
import Paginacion from "./Paginacion";

import { useFiltrosTabla } from "../hooks/useFiltrosTabla";
import { useSortPaginacion } from "../hooks/useSortPaginacion";

/**
 * Componente principal de la tabla de resultados. Compone los filtros
 * multi-select, el sort, la paginación y el renderizado.
 *
 * Si no hay datos, muestra el estado vacío. Si hay datos pero los
 * filtros dejan la lista sin resultados, muestra un mensaje inline.
 */
const TablaResultados = ({ datos }) => {
  const containerRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const filtrosTabla = useFiltrosTabla({ datos, containerRef });

  const { fragmentoDatos, pagina, totalPaginas, cambiarPagina } =
    useSortPaginacion({
      datos,
      filtros: filtrosTabla.filtros,
      sortConfig,
    });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      const direction =
        prev.key === key && prev.direction === "asc" ? "desc" : "asc";
      return { key, direction };
    });
  };

  if (!datos || datos.length === 0) {
    return (
      <div className={styles.estadoVacioContainer}>
        No se registran datos para mostrar. Modifique las variables de entrada
        e inicie la consulta.
      </div>
    );
  }

  return (
    <div className={styles.contenedorTablaMaestra} ref={containerRef}>
      <BarraFiltrosDropdowns {...filtrosTabla} onBusquedaChange={filtrosTabla.handleBusquedaChange} />

      <div className={styles.tablaResponsivaWrapper}>
        <table>
          <EncabezadoTabla sortConfig={sortConfig} onSort={handleSort} />
          <tbody>
            {fragmentoDatos.length > 0 ? (
              fragmentoDatos.map((item, index) => (
                <FilaTabla key={`${item.item}-${index}`} item={item} />
              ))
            ) : (
              <tr>
                <td
                  colSpan={COLUMNAS_TABLA.length}
                  className={styles.celdaParametrizacionVacia}
                >
                  No se encontraron registros que coincidan con los filtros
                  aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        onCambioPagina={cambiarPagina}
      />
    </div>
  );
};

export default TablaResultados;
