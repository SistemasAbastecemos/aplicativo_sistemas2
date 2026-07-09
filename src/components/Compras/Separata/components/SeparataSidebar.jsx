import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faSave,
  faTimes,
  faDollarSign,
  faPercent,
  faStickyNote,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../ProgramacionSeparata.module.css";
import ItemPreview from "./ItemPreview";
import { puedeEditarMeta } from "../utils/permissions";

/**
 * Formulario lateral: fecha límite (solo editable por usuarios autorizados
 * cuando ya hay una separata seleccionada), buscador de item, preview,
 * descuento/precio con cálculo bidireccional y observaciones. Se abre/cierra
 * con `useSidebar`. Toda la lógica de estado vive en `useItemForm`; este
 * componente es puramente presentacional.
 */
const SeparataSidebar = ({
  sidebarRef,
  visible,
  onClose,
  currentSeparata,
  login,
  // Fecha límite
  fechaLimite,
  onFechaLimiteChange,
  onSaveFechaLimite,
  // Item form (viene de useItemForm)
  itemForm,
  // Validación
  errorFecha,
}) => {
  const puedeEditarLimite = puedeEditarMeta(login);
  const fechaLimiteDeshabilitada = currentSeparata && !puedeEditarLimite;

  return (
    <div
      ref={sidebarRef}
      className={`${styles.sidebar} ${visible ? styles.open : ""}`}
    >
      <div className={styles.sidebarHeader}>
        <h3 className={styles.sidebarTitle}>
          {currentSeparata ? "Agregar Item" : "Nueva Separata"}
        </h3>
        <button
          className={styles.closeSidebar}
          onClick={onClose}
          title="Cerrar formulario"
          type="button"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      <div className={styles.sidebarContent}>
        {/* Fecha Límite */}
        <div className={`${styles.formGroup} ${styles.floating}`}>
          <div className={styles.searchGroup}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.searchIcon} />
            <input
              type="date"
              className={styles.formInput}
              value={fechaLimite}
              onChange={(e) => onFechaLimiteChange(e.target.value)}
              disabled={fechaLimiteDeshabilitada}
              placeholder=" "
            />
            <label className={styles.formLabel}>Fecha Límite Edición</label>
            {currentSeparata && puedeEditarLimite && (
              <button
                className={styles.saveDateButton}
                onClick={onSaveFechaLimite}
                type="button"
              >
                <FontAwesomeIcon icon={faSave} />
                Guardar
              </button>
            )}
          </div>
        </div>

        {errorFecha && <div className={styles.error}>{errorFecha}</div>}

        {/* Código Item */}
        <div className={`${styles.formGroup} ${styles.floating}`}>
          <input
            type="text"
            className={styles.formInput}
            value={itemForm.codigoItem}
            onChange={itemForm.handleCodigoItemChange}
            onBlur={itemForm.handleCodigoItemBlur}
            onKeyPress={itemForm.handleCodigoItemKeyPress}
            maxLength={6}
            placeholder=" "
          />
          <label className={styles.formLabel}>Código Item (6 dígitos)</label>
          {itemForm.loadingItem && (
            <div className={styles.loadingItem}>Buscando item...</div>
          )}
        </div>

        <ItemPreview
          itemData={itemForm.itemData}
          loadingItem={itemForm.loadingItem}
          codigoItem={itemForm.codigoItem}
          ultimoCodigoBuscado={itemForm.ultimoCodigoBuscado}
        />

        {/* Descuento */}
        <div className={`${styles.formGroup} ${styles.floating}`}>
          <div className={styles.inputWithCheckbox}>
            <input
              type="number"
              className={styles.formInput}
              value={itemForm.descuento}
              onChange={itemForm.handleDescuentoChange}
              min="0"
              max="100"
              placeholder=" "
            />
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faPercent} />
              Descuento (%)
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={itemForm.guardarDescuento}
                onChange={(e) => itemForm.setGuardarDescuento(e.target.checked)}
              />
              Guardar %
            </label>
          </div>
        </div>

        {/* Precio Final */}
        <div className={`${styles.formGroup} ${styles.floating}`}>
          <input
            type="number"
            className={styles.formInput}
            value={itemForm.precioConDescuento}
            onChange={itemForm.handlePrecioConDescuentoChange}
            placeholder=" "
          />
          <label className={styles.formLabel}>
            <FontAwesomeIcon icon={faDollarSign} />
            Precio Final
          </label>
        </div>

        {/* Observaciones */}
        <div className={`${styles.formGroup} ${styles.floating}`}>
          <input
            type="text"
            className={styles.formInput}
            value={itemForm.observaciones}
            onChange={itemForm.handleObservacionesChange}
            placeholder=" "
          />
          <label className={styles.formLabel}>
            <FontAwesomeIcon icon={faStickyNote} />
            Observaciones
          </label>
        </div>

        <button
          className={styles.saveButton}
          onClick={itemForm.handleSaveItem}
          disabled={!itemForm.itemData || !!errorFecha}
          type="button"
        >
          <FontAwesomeIcon icon={faSave} />
          {currentSeparata ? "Agregar a Separata" : "Crear Separata"}
        </button>
      </div>
    </div>
  );
};

export default SeparataSidebar;
