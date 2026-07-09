import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import styles from "../ProgramacionSeparata.module.css";
import { formatearNumero, ordenarExistencias } from "../utils/formatters";

/**
 * Muestra tres estados según lo que ocurre con la búsqueda del ítem:
 *  - itemData presente → tarjeta con información completa
 *  - loadingItem → skeleton corto
 *  - código completo (6 dígitos), última búsqueda coincide y no hay data →
 *    tarjeta "no encontrado"
 *  - cualquier otro caso → null (no renderiza nada)
 */
const ItemPreview = ({
  itemData,
  loadingItem,
  codigoItem,
  ultimoCodigoBuscado,
}) => {
  if (itemData) {
    return (
      <div className={styles.itemPreview}>
        <div className={styles.previewHeader}>
          <FontAwesomeIcon icon={faBox} />
          <h4>Información del Item</h4>
        </div>
        <div className={styles.previewItem}>
          <span className={styles.previewLabel}>Descripción:</span>
          <strong>{itemData.descripcion}</strong>
        </div>
        <div className={styles.previewItem}>
          <span className={styles.previewLabel}>Precio Regular:</span>
          <strong className={styles.precioRegular}>
            ${formatearNumero(itemData.precio_regular)}
          </strong>
        </div>
        <div className={styles.previewItem}>
          <span className={styles.previewLabel}>Medida:</span>
          <span>{formatearNumero(itemData.medida)}</span>
        </div>
        <div className={styles.previewItem}>
          <span className={styles.previewLabel}>Unidad de Medida:</span>
          <span>{itemData.unidad_medida}</span>
        </div>
        {itemData.existencias &&
          Object.keys(itemData.existencias).length > 0 && (
            <div className={styles.previewItem}>
              <span className={styles.previewLabel}>Existencias:</span>
              <div className={styles.existenciasList}>
                {Object.entries(ordenarExistencias(itemData.existencias)).map(
                  ([local, existencia]) => (
                    <span key={local} className={styles.existenciaItem}>
                      {local}: {formatearNumero(existencia)}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}
      </div>
    );
  }

  if (loadingItem) {
    return (
      <div className={styles.itemPreview}>
        <div className={styles.previewHeader}>
          <FontAwesomeIcon icon={faBox} />
          <h4>Buscando información del item...</h4>
        </div>
      </div>
    );
  }

  if (
    codigoItem &&
    codigoItem.length === 6 &&
    ultimoCodigoBuscado === codigoItem &&
    !loadingItem
  ) {
    return (
      <div className={styles.itemNotFound}>
        <div className={styles.notFoundHeader}>
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <h4>Item no encontrado</h4>
        </div>
        <p>
          No se encontró información para el código{" "}
          <strong>{codigoItem}</strong>
        </p>
        <p className={styles.notFoundHint}>
          Verifique que el código sea correcto y esté activo en el sistema.
        </p>
      </div>
    );
  }

  return null;
};

export default ItemPreview;
