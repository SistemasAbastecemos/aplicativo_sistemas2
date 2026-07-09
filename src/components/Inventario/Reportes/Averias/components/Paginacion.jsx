import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../ExistenciasAverias.module.css";

/**
 * Paginador simple con anterior/siguiente e info textual. Se oculta si
 * hay una sola página.
 */
const Paginacion = ({ pagina, totalPaginas, onCambioPagina }) => {
  if (totalPaginas <= 1) return null;

  return (
    <div className={styles.barraPaginacion}>
      <button
        onClick={() => onCambioPagina(pagina - 1)}
        disabled={pagina === 1}
        type="button"
      >
        <FontAwesomeIcon icon={faChevronLeft} /> Anterior
      </button>
      <span>
        Página <strong>{pagina}</strong> de {totalPaginas}
      </span>
      <button
        onClick={() => onCambioPagina(pagina + 1)}
        disabled={pagina === totalPaginas}
        type="button"
      >
        Siguiente <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
};

export default Paginacion;
