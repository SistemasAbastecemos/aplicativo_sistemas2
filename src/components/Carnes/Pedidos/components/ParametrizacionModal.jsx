import React from "react";
import styles from "../FormularioPedidos.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSave,
  faTag,
  faBarcode,
  faBoxes,
} from "@fortawesome/free-solid-svg-icons";

export const ParametrizacionModal = React.memo(
  ({ item, setItem, onClose, onSave, guardando }) => {
    if (!item) return null;

    const updateField = (campo, valor) => {
      setItem((prev) => ({ ...prev, [campo]: valor }));
    };

    return (
      <div className={styles.modalBackdropOverlay}>
        <div className={styles.modalAppleSheetContainer}>
          <div className={styles.modalSheetHeader}>
            <h4>
              {item.id ? "Modificar Ítem de Carne" : "Indexar Nuevo Producto"}
            </h4>
            <button
              type="button"
              onClick={onClose}
              className={styles.btnCloseModalX}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className={styles.modalSheetBodyContent}>
            <div className={`${styles.formGroupModal} ${styles.floating}`}>
              <input
                type="text"
                value={item.id_item || ""}
                onChange={(e) => updateField("id_item", e.target.value)}
                className={styles.appleFormInputModal}
                placeholder=" "
                required
              />
              <label className={styles.formLabelModal}>
                <FontAwesomeIcon icon={faBarcode} /> Código Siesa{" "}
                <span className={styles.requiredMark}>*</span>
              </label>
            </div>

            <div className={`${styles.formGroupModal} ${styles.floating}`}>
              <input
                type="text"
                value={item.descripcion || ""}
                onChange={(e) => updateField("descripcion", e.target.value)}
                className={styles.appleFormInputModal}
                placeholder=" "
                required
              />
              <label className={styles.formLabelModal}>
                <FontAwesomeIcon icon={faTag} /> Descripción Comercial{" "}
                <span className={styles.requiredMark}>*</span>
              </label>
            </div>

            <div className={`${styles.formGroupModal} ${styles.floating}`}>
              <select
                value={item.unidad_medida || "KG"}
                onChange={(e) => updateField("unidad_medida", e.target.value)}
                className={styles.appleFormSelectModal}
              >
                <option value="KG">Kilogramos (KG)</option>
                <option value="UND">Unidades (UND)</option>
              </select>
              <label className={styles.formLabelModal}>
                <FontAwesomeIcon icon={faBoxes} /> Unidad de Medida
              </label>
            </div>

            <div className={`${styles.formGroupModal} ${styles.floating}`}>
              <select
                value={item.categoria || "RES"}
                onChange={(e) => updateField("categoria", e.target.value)}
                className={styles.appleFormSelectModal}
              >
                <option value="RES">RES</option>
                <option value="CERDO">CERDO</option>
                <option value="VISCERAS DE RES">VÍSCERAS DE RES</option>
                <option value="CANALES">CANALES</option>
              </select>
              <label className={styles.formLabelModal}>
                Categoría Logística
              </label>
            </div>
          </div>

          <div className={styles.modalSheetFooterActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.appleBtnSecondary}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSave}
              className={styles.appleBtnPrimaryAction}
              disabled={guardando}
            >
              {guardando ? (
                <div className={styles.iosMiniLoaderButton} />
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} /> Guardar Ítem
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  },
);

ParametrizacionModal.displayName = "ParametrizacionModal";
