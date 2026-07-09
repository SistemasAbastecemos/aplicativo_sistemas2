import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDoubleLeft,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Recaudos.module.css";
import { ITEMS_POR_PAGINA } from "../utils/constants";

/**
 * Paginador completo con 4 botones (primera / anterior / siguiente /
 * última) e info de rango. En móvil se reorganiza verticalmente.
 */
const Paginacion = ({
  paginaActual,
  totalPaginas,
  totalRegistros,
  onCambioPagina,
}) => {
  if (totalPaginas <= 1) return null;

  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA + 1;
  const fin = Math.min(paginaActual * ITEMS_POR_PAGINA, totalRegistros);

  return (
    <div className={styles.paginacionContainer}>
      <div className={styles.infoPaginacion}>
        Mostrando {inicio} a {fin} de {totalRegistros}
      </div>
      <div className={styles.controlesPaginacion}>
        <button
          onClick={() => onCambioPagina(1)}
          disabled={paginaActual === 1}
          className={styles.btnPaginacion}
          title="Primera página"
          type="button"
        >
          <FontAwesomeIcon icon={faAngleDoubleLeft} />
        </button>
        <button
          onClick={() => onCambioPagina(Math.max(paginaActual - 1, 1))}
          disabled={paginaActual === 1}
          className={styles.btnPaginacion}
          title="Anterior"
          type="button"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <span className={styles.indicadorPagina}>
          Página <strong>{paginaActual}</strong> de {totalPaginas}
        </span>

        <button
          onClick={() =>
            onCambioPagina(Math.min(paginaActual + 1, totalPaginas))
          }
          disabled={paginaActual === totalPaginas}
          className={styles.btnPaginacion}
          title="Siguiente"
          type="button"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        <button
          onClick={() => onCambioPagina(totalPaginas)}
          disabled={paginaActual === totalPaginas}
          className={styles.btnPaginacion}
          title="Última página"
          type="button"
        >
          <FontAwesomeIcon icon={faAngleDoubleRight} />
        </button>
      </div>
    </div>
  );
};

export default Paginacion;
