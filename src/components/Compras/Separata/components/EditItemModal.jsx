import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import styles from "../ProgramacionSeparata.module.css";

/**
 * Modal para editar precio y descuento de un item ya agregado a la separata.
 * Preserva la lógica original: al cambiar descuento se recalcula precio final
 * con redondeo a múltiplos de 50 hacia abajo, y al cambiar precio final se
 * recalcula el descuento con 2 decimales.
 */
const EditItemModal = ({ item, onClose, onSave }) => {
  const [descuentoEditar, setDescuentoEditar] = useState(item.descuento);
  const [precioRegularEditar, setPrecioRegularEditar] = useState(
    item.precio_antes,
  );
  const [precioConDescuentoEditar, setPrecioConDescuentoEditar] = useState(
    item.precio_ahora,
  );
  const [guardarDescuentoEditar, setGuardarDescuentoEditar] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleDescuentoChange = (e) => {
    const valor = e.target.value;
    setDescuentoEditar(valor);

    if (precioRegularEditar && valor) {
      const regular = parseFloat(precioRegularEditar);
      const valorDescuento = parseFloat(valor) / 100;
      const conDescuento = regular * (1 - valorDescuento);
      setPrecioConDescuentoEditar(Math.floor(conDescuento / 50) * 50);
    }
  };

  const handlePrecioConDescuentoChange = (e) => {
    const valor = e.target.value;
    setPrecioConDescuentoEditar(valor);

    if (precioRegularEditar && valor) {
      const regular = parseFloat(precioRegularEditar);
      const valorConDescuento = parseFloat(valor);
      const valorDescuento = 100 * (1 - valorConDescuento / regular);
      setDescuentoEditar(valorDescuento.toFixed(2));
    }
  };

  const handlePrecioRegularChange = (e) => {
    const valor = e.target.value;
    setPrecioRegularEditar(valor);

    if (descuentoEditar) {
      const regular = parseFloat(valor);
      const valorDescuento = parseFloat(descuentoEditar) / 100;
      const conDescuento = regular * (1 - valorDescuento);
      setPrecioConDescuentoEditar(Math.floor(conDescuento / 50) * 50);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave({
        descuento: guardarDescuentoEditar ? descuentoEditar : 0,
        precio_regular: precioRegularEditar,
        precio_ahora: precioConDescuentoEditar,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Editar Item</h3>
          <button className={styles.modalClose} onClick={onClose} type="button">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.itemInfo}>
            <strong>Ítem:</strong> {item.item} - {item.descripcion}
          </p>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Precio Regular</label>
            <input
              type="number"
              className={styles.formInput}
              value={precioRegularEditar}
              onChange={handlePrecioRegularChange}
              min="0"
              step="50"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Descuento (%)</label>
            <div className={styles.inputWithCheckbox}>
              <input
                type="number"
                className={styles.formInput}
                value={descuentoEditar}
                onChange={handleDescuentoChange}
                min="0"
                max="100"
                step="0.01"
              />
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={guardarDescuentoEditar}
                  onChange={(e) => setGuardarDescuentoEditar(e.target.checked)}
                />
                Guardar %
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Precio Final</label>
            <input
              type="number"
              className={styles.formInput}
              value={precioConDescuentoEditar}
              onChange={handlePrecioConDescuentoChange}
              min="0"
              step="any"
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSubmit}
            disabled={loading}
            type="button"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditItemModal;
