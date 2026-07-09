import React from "react";
import styles from "../AdministrarItems.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSave,
  faTag,
  faBarcode,
  faUserTie,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";

const LISTADO_DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export const ItemModal = React.memo(
  ({ editItem, newItem, setEditItem, setNewItem, onClose, onSave }) => {
    const dataActiva = editItem || newItem;
    if (!dataActiva) return null;

    const handleMudarCampo = (campo, valor) => {
      if (editItem) {
        setEditItem((prev) => ({ ...prev, [campo]: valor }));
      } else {
        setNewItem((prev) => ({ ...prev, [campo]: valor }));
      }
    };

    const handleToggleDiaSemana = (dia) => {
      let listadoActual = dataActiva.dias_pedido
        ? dataActiva.dias_pedido
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : [];

      const indice = listadoActual.indexOf(dia);
      if (indice > -1) {
        listadoActual.splice(indice, 1);
      } else {
        listadoActual.push(dia);
      }

      handleMudarCampo("dias_pedido", listadoActual.join(", "));
    };

    const currentDaysList = dataActiva.dias_pedido
      ? dataActiva.dias_pedido
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
      : [];

    const checkedAdmin = String(dataActiva.administrador) === "1";

    return (
      <div className={styles.modalBackdropOverlay}>
        <div className={styles.modalAppleSheetContainer}>
          <div className={styles.modalSheetHeader}>
            <h4>
              {editItem
                ? "Modificar Parámetros de Ítem"
                : "Indexar Nuevo Ítem Operativo"}
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
                value={dataActiva.item || ""}
                disabled={!!editItem}
                onChange={(e) => handleMudarCampo("item", e.target.value)}
                className={`${styles.appleFormInputModal} ${editItem ? styles.inputDisabledModal : ""}`}
                placeholder=" "
                required
              />
              <label className={styles.formLabelModal}>
                <FontAwesomeIcon icon={faBarcode} /> Código del Ítem{" "}
                <span className={styles.requiredMark}>*</span>
              </label>
            </div>

            <div className={`${styles.formGroupModal} ${styles.floating}`}>
              <input
                type="text"
                value={dataActiva.descripcion || ""}
                onChange={(e) =>
                  handleMudarCampo("descripcion", e.target.value)
                }
                className={styles.appleFormInputModal}
                placeholder=" "
                required
              />
              <label className={styles.formLabelModal}>
                <FontAwesomeIcon icon={faTag} /> Descripción / Nombre del Ítem{" "}
                <span className={styles.requiredMark}>*</span>
              </label>
            </div>

            <div className={`${styles.formGroupModal} ${styles.floating}`}>
              <input
                type="text"
                value={dataActiva.comprador || ""}
                onChange={(e) => handleMudarCampo("comprador", e.target.value)}
                className={styles.appleFormInputModal}
                placeholder=" "
              />
              <label className={styles.formLabelModal}>
                <FontAwesomeIcon icon={faUserTie} /> Nombre Comprador
              </label>
            </div>

            <div className={styles.appleSwitchRowContainer}>
              <div className={styles.switchRowInfo}>
                <FontAwesomeIcon
                  icon={faUserShield}
                  className={styles.iconSwitchLabel}
                />
                <div>
                  <span className={styles.titleSwitchLabel}>
                    Pedido por Administrador
                  </span>
                  <p className={styles.descSwitchLabel}>
                    Restringe la solicitud de este ítem exclusivamente al rol
                    administrativo.
                  </p>
                </div>
              </div>
              <label className={styles.appleCheckboxWrapper}>
                <input
                  type="checkbox"
                  checked={checkedAdmin}
                  onChange={(e) =>
                    handleMudarCampo(
                      "administrador",
                      e.target.checked ? "1" : "0",
                    )
                  }
                  className={styles.appleNativeCheckbox}
                />
                <span className={styles.appleCustomCheckboxCheck} />
              </label>
            </div>

            <div className={`${styles.formGroupModal} ${styles.floating}`}>
              <textarea
                rows={2}
                value={dataActiva.observaciones || ""}
                onChange={(e) =>
                  handleMudarCampo("observaciones", e.target.value)
                }
                className={styles.appleFormTextareaModal}
                placeholder=" "
              />
              <label className={styles.formLabelModal}>
                Observaciones descriptivas
              </label>
            </div>

            <div className={styles.seccionDiasModalContainer}>
              <label className={styles.labelTituloSeccionDias}>
                Ventana Semanal Pedidos
              </label>
              <div className={styles.gridPillsModalSeleccion}>
                {LISTADO_DIAS_SEMANA.map((dia) => {
                  const isSelected = currentDaysList.includes(dia);
                  return (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => handleToggleDiaSemana(dia)}
                      className={`${styles.pillDiaSeleccionableBtn} ${isSelected ? styles.pillDiaSeleccionadoActive : ""}`}
                    >
                      {dia}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.modalSheetFooterActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSave}
              className={styles.saveButton}
            >
              <FontAwesomeIcon icon={faSave} /> Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    );
  },
);

ItemModal.displayName = "ItemModal";
