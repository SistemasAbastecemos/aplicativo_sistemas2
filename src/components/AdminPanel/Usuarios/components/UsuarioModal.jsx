import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import styles from "../Usuarios.module.css";
import UsuarioForm from "./UsuarioForm";

/**
 * Modal de configuración de usuario. Contenedor delgado: encabezado, cuerpo
 * (delegado en UsuarioForm) y acciones. Se cierra al hacer clic fuera.
 */
const UsuarioModal = React.memo(
  ({
    modoEdicion,
    formData,
    confirmarContrasena,
    errorContrasena,
    roles,
    areas,
    cargosFiltrados,
    sedes,
    camposIncompletos,
    onChange,
    onConfirmarContrasenaChange,
    onSave,
    onClose,
  }) => (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{modoEdicion ? "Editar Usuario" : "Nuevo Usuario"}</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <UsuarioForm
            formData={formData}
            modoEdicion={modoEdicion}
            confirmarContrasena={confirmarContrasena}
            errorContrasena={errorContrasena}
            roles={roles}
            areas={areas}
            cargosFiltrados={cargosFiltrados}
            sedes={sedes}
            onChange={onChange}
            onConfirmarContrasenaChange={onConfirmarContrasenaChange}
          />
        </div>

        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} /> Cancelar
          </button>
          <button
            className={`${styles.saveButton} ${camposIncompletos ? styles.disabled : ""}`}
            onClick={onSave}
            disabled={camposIncompletos}
          >
            <FontAwesomeIcon icon={faCheck} />{" "}
            {modoEdicion ? "Actualizar" : "Crear"} Usuario
          </button>
        </div>
      </div>
    </div>
  ),
);

UsuarioModal.displayName = "UsuarioModal";

export default UsuarioModal;
