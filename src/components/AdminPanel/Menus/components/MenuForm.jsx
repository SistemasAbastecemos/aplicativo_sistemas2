import React from "react";
import styles from "../Menus.module.css";

const MenuForm = ({ formData, onChange, menus }) => (
  <div className={styles.formColumns}>
    <div className={styles.formColumn}>
      <div className={`${styles.formGroup} ${styles.floating}`}>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={onChange}
          className={`${styles.formInput} ${!formData.nombre ? styles.inputError : ""}`}
          placeholder="Ejemplo: Inventario"
        />
        <label>Nombre del Menú *</label>
      </div>

      <div className={`${styles.formGroup} ${styles.floating}`}>
        <input
          type="text"
          name="ruta"
          value={formData.ruta}
          onChange={onChange}
          className={`${styles.formInput} ${!formData.ruta ? styles.inputError : ""}`}
          placeholder="Ejemplo: /inventario"
        />
        <label>Ruta Relativa *</label>
      </div>

      <div className={`${styles.formGroup} ${styles.floating}`}>
        <input
          type="text"
          name="icono"
          value={formData.icono}
          onChange={onChange}
          className={styles.formInput}
          placeholder="Ejemplo: inventory"
        />
        <label>Identificador del Icono</label>
      </div>
    </div>

    <div className={styles.formColumn}>
      <div className={`${styles.formGroup} ${styles.floating}`}>
        <input
          type="number"
          name="orden"
          value={formData.orden}
          onChange={onChange}
          className={styles.formInput}
          placeholder=" Ejemplo: 1"
        />
        <label>Orden de Visualización</label>
      </div>

      <div className={`${styles.formGroup} ${styles.floating}`}>
        <select
          name="id_parent"
          value={formData.id_parent}
          onChange={onChange}
          className={styles.formSelect}
        >
          <option value="">(Menú Raíz Principal)</option>
          {menus.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </select>
        <label>Eje Jerárquico (Padre)</label>
      </div>

      <div className={`${styles.formGroup} ${styles.floating}`}>
        <select
          name="activo"
          value={formData.activo}
          onChange={onChange}
          className={styles.formSelect}
        >
          <option value={1}>Operativo (En Línea)</option>
          <option value={0}>Inactivo (Deshabilitado)</option>
        </select>
        <label>Estado Operacional</label>
      </div>
    </div>
  </div>
);

export default MenuForm;
