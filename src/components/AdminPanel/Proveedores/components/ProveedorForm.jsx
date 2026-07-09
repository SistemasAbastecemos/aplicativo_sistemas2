import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import styles from "../Proveedores.module.css";

const ProveedorForm = ({
  formData,
  onChange,
  modoEdicion,
  confirmarContrasena,
  setConfirmarContrasena,
  errorContrasena,
}) => (
  <div className={styles.formColumns}>
    <div className={styles.formColumn}>
      <div className={`${styles.formGroup} ${styles.floating}`}>
        <input
          type="text"
          name="nit"
          value={formData.nit}
          onChange={onChange}
          disabled={modoEdicion}
          className={`${styles.formInput} ${!formData.nit && !modoEdicion ? styles.inputError : ""}`}
          placeholder="Ejemplo: 123456789"
        />
        <label>NIT / Identificación *</label>
      </div>

      <div className={`${styles.formGroup} ${styles.floating}`}>
        <input
          type="email"
          name="correo"
          value={formData.correo}
          onChange={onChange}
          className={`${styles.formInput} ${!formData.correo ? styles.inputError : ""}`}
          placeholder="Ejemplo: correo@empresa.com"
        />
        <label>Correo Electrónico *</label>
      </div>
    </div>

    <div className={styles.formColumn}>
      <div className={`${styles.formGroup} ${styles.floating}`}>
        <select
          name="activo"
          value={formData.activo}
          onChange={onChange}
          className={styles.formSelect}
        >
          <option value={1}>Operativo (Habilitado)</option>
          <option value={0}>Inactivo (Deshabilitado)</option>
        </select>
        <label>Estado Operacional</label>
      </div>

      <div className={`${styles.formGroup} ${styles.floating}`}>
        <input
          type="password"
          name="contrasena"
          value={formData.contrasena}
          onChange={onChange}
          className={`${styles.formInput} ${formData.contrasena && errorContrasena && errorContrasena.includes("caracteres") ? styles.inputError : ""}`}
          placeholder="Ejemplo: Contraseña segura"
        />
        <label>
          {modoEdicion ? "Nueva Contraseña (Opcional)" : "Contraseña *"}
        </label>
      </div>

      {(!modoEdicion || formData.contrasena) && (
        <div className={`${styles.formGroup} ${styles.floating}`}>
          <input
            type="password"
            value={confirmarContrasena}
            onChange={(e) => setConfirmarContrasena(e.target.value)}
            className={`${styles.formInput} ${errorContrasena && confirmarContrasena ? styles.inputError : ""}`}
            placeholder="Ejemplo: Contraseña segura"
          />
          <label>Confirmar Contraseña *</label>

          {errorContrasena && confirmarContrasena && (
            <div className={styles.errorText}>
              <FontAwesomeIcon icon={faXmark} /> {errorContrasena}
            </div>
          )}
          {!errorContrasena &&
            confirmarContrasena &&
            formData.contrasena === confirmarContrasena && (
              <div className={styles.successText}>
                <FontAwesomeIcon icon={faCheck} /> Las contraseñas coinciden
              </div>
            )}
        </div>
      )}
    </div>
  </div>
);

export default ProveedorForm;
