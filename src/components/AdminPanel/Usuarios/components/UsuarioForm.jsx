import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faKey,
  faEnvelope,
  faShield,
  faLayerGroup,
  faBriefcase,
  faBuilding,
  faCheckCircle,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Usuarios.module.css";

/**
 * Cuerpo del modal de usuario: datos personales/credenciales a la izquierda
 * y asignación organizacional a la derecha. Puramente presentacional; el
 * estado y la validación viven en el hook useUsuarioForm.
 */
const UsuarioForm = ({
  formData,
  modoEdicion,
  confirmarContrasena,
  errorContrasena,
  roles,
  areas,
  cargosFiltrados,
  sedes,
  onChange,
  onConfirmarContrasenaChange,
}) => {
  const mostrarConfirmacion = !modoEdicion || formData.contrasena;
  const contrasenasCoinciden =
    !errorContrasena &&
    confirmarContrasena &&
    formData.contrasena === confirmarContrasena;

  return (
    <div className={styles.formColumns}>
      {/* Columna izquierda: identidad y credenciales */}
      <div className={styles.formColumn}>
        <div className={`${styles.formGroup} ${styles.floating}`}>
          <input
            type="text"
            name="nombres_completos"
            value={formData.nombres_completos}
            onChange={onChange}
            className={`${styles.formInput} ${!formData.nombres_completos ? styles.inputError : ""}`}
            placeholder="Ingrese los nombres completos"
          />
          <label className={styles.formLabel}>
            <FontAwesomeIcon icon={faUser} /> Nombres Completos *
          </label>
        </div>

        <div className={`${styles.formGroup} ${styles.floating}`}>
          <input
            type="text"
            name="login"
            value={formData.login}
            onChange={onChange}
            disabled={modoEdicion}
            className={`${styles.formInput} ${!formData.login ? styles.inputError : ""}`}
            placeholder="Nombre de usuario para login"
          />
          <label className={styles.formLabel}>
            <FontAwesomeIcon icon={faUser} /> Login *
          </label>
        </div>

        <div className={`${styles.formGroup} ${styles.floating}`}>
          <input
            type="password"
            name="contrasena"
            value={formData.contrasena}
            onChange={onChange}
            className={`${styles.formInput} ${errorContrasena ? styles.inputError : ""}`}
            placeholder={
              modoEdicion
                ? "Dejar vacío para no cambiar"
                : "Ingrese la contraseña"
            }
          />
          <label className={styles.formLabel}>
            <FontAwesomeIcon icon={faKey} /> Contraseña {!modoEdicion && "*"}
          </label>
        </div>

        {mostrarConfirmacion && (
          <div className={`${styles.formGroup} ${styles.floating}`}>
            <input
              type="password"
              value={confirmarContrasena}
              onChange={(e) => onConfirmarContrasenaChange(e.target.value)}
              className={`${styles.formInput} ${errorContrasena || !confirmarContrasena ? styles.inputError : ""}`}
              placeholder="Repita la contraseña"
            />
            <label className={styles.formLabel}>
              <FontAwesomeIcon icon={faKey} /> Confirmar Contraseña *
            </label>
            {errorContrasena && (
              <div className={styles.errorText}>
                <FontAwesomeIcon icon={faXmark} /> {errorContrasena}
              </div>
            )}
            {contrasenasCoinciden && (
              <div className={styles.successText}>
                <FontAwesomeIcon icon={faCheck} /> Las contraseñas coinciden
              </div>
            )}
          </div>
        )}

        <div className={`${styles.formGroup} ${styles.floating}`}>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={onChange}
            className={styles.formInput}
            placeholder="usuario@empresa.com"
          />
          <label className={styles.formLabel}>
            <FontAwesomeIcon icon={faEnvelope} /> Correo Electrónico
          </label>
        </div>
      </div>

      {/* Columna derecha: asignación organizacional */}
      <div className={styles.formColumn}>
        <div className={`${styles.formGroup} ${styles.floating}`}>
          <select
            name="id_rol"
            value={formData.id_rol}
            onChange={onChange}
            className={`${styles.formSelect} ${!formData.id_rol ? styles.inputError : ""}`}
          >
            <option value="">Seleccione un rol</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.descripcion}
              </option>
            ))}
          </select>
          <label className={styles.formLabel}>
            <FontAwesomeIcon icon={faShield} /> Rol *
          </label>
        </div>

        <div className={`${styles.formGroup} ${styles.floating}`}>
          <select
            name="id_area"
            value={formData.id_area}
            onChange={onChange}
            className={`${styles.formSelect} ${!formData.id_area ? styles.inputError : ""}`}
          >
            <option value="">Seleccione un área</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.descripcion}
              </option>
            ))}
          </select>
          <label className={styles.formLabel}>
            <FontAwesomeIcon icon={faLayerGroup} /> Área *
          </label>
        </div>

        <div className={`${styles.formGroup} ${styles.floating}`}>
          <select
            name="id_cargo"
            value={formData.id_cargo}
            onChange={onChange}
            className={`${styles.formSelect} ${!formData.id_cargo ? styles.inputError : ""}`}
            disabled={!formData.id_area}
          >
            <option value="">
              {formData.id_area
                ? "Seleccione un cargo"
                : "Seleccione un área primero"}
            </option>
            {cargosFiltrados.map((cargo) => (
              <option key={cargo.id} value={cargo.id}>
                {cargo.descripcion}
              </option>
            ))}
          </select>
          <label className={styles.formLabel}>
            <FontAwesomeIcon icon={faBriefcase} /> Cargo *
          </label>
        </div>

        <div className={`${styles.formGroup} ${styles.floating}`}>
          <select
            name="id_sede"
            value={formData.id_sede}
            onChange={onChange}
            className={`${styles.formSelect} ${!formData.id_sede ? styles.inputError : ""}`}
          >
            <option value="">Seleccione una sede</option>
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre}
              </option>
            ))}
          </select>
          <label className={styles.formLabel}>
            <FontAwesomeIcon icon={faBuilding} /> Sede *
          </label>
        </div>

        <div className={`${styles.formGroup} ${styles.floating}`}>
          <select
            name="activo"
            value={formData.activo}
            onChange={onChange}
            className={styles.formSelect}
          >
            <option value={1}>Activo</option>
            <option value={0}>Inactivo</option>
          </select>
          <label className={styles.formLabel}>
            <FontAwesomeIcon icon={faCheckCircle} /> Estado
          </label>
        </div>
      </div>
    </div>
  );
};

export default UsuarioForm;
