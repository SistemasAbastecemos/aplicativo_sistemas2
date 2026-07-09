import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faBars,
  faUserShield,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Menus.module.css";
import MenuForm from "./MenuForm";
import PermisosPanel from "./PermisosPanel";

/**
 * Modal de configuración del menú. Es un contenedor delgado: gestiona el
 * encabezado, las pestañas y las acciones, y delega el contenido en
 * MenuForm (datos) y PermisosPanel (permisos).
 */
const MenuModal = React.memo(
  ({
    modoEdicion,
    formData,
    permisos,
    pestanaActiva,
    areaSeleccionada,
    roles,
    areas,
    cargosFiltrados,
    menus,
    camposIncompletos,
    puedeGuardar,
    onChange,
    onAreaChange,
    onTogglePermiso,
    onPestanaChange,
    onSave,
    onClose,
  }) => {
    const guardarDeshabilitado = camposIncompletos || !puedeGuardar;

    return (
      <div className={styles.modalOverlay}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h2>
              {modoEdicion ? "Propiedades del Nodo" : "Configurar Nuevo Menú"}
            </h2>
            <button className={styles.modalClose} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className={styles.tabContainer}>
            <button
              className={`${styles.tab} ${pestanaActiva === "datos" ? styles.activeTab : ""}`}
              onClick={() => onPestanaChange("datos")}
            >
              <FontAwesomeIcon icon={faBars} /> Parámetros Base
            </button>
            <button
              className={`${styles.tab} ${pestanaActiva === "permisos" ? styles.activeTab : ""}`}
              onClick={() => onPestanaChange("permisos")}
            >
              <FontAwesomeIcon icon={faUserShield} /> Directivas de Acceso
            </button>
          </div>

          <div className={styles.modalBody}>
            {pestanaActiva === "datos" && (
              <MenuForm formData={formData} onChange={onChange} menus={menus} />
            )}

            {pestanaActiva === "permisos" && (
              <PermisosPanel
                roles={roles}
                areas={areas}
                cargosFiltrados={cargosFiltrados}
                permisos={permisos}
                areaSeleccionada={areaSeleccionada}
                onAreaChange={onAreaChange}
                onTogglePermiso={onTogglePermiso}
              />
            )}
          </div>

          <div className={styles.modalActions}>
            <button className={styles.cancelButton} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} /> Cancelar
            </button>
            <button
              className={`${styles.saveButton} ${guardarDeshabilitado ? styles.disabled : ""}`}
              onClick={onSave}
              disabled={guardarDeshabilitado}
            >
              <FontAwesomeIcon icon={faCheck} />{" "}
              {modoEdicion ? "Actualizar Propiedades" : "Registrar Nodo"}
            </button>
          </div>
        </div>
      </div>
    );
  },
);

MenuModal.displayName = "MenuModal";

export default MenuModal;
