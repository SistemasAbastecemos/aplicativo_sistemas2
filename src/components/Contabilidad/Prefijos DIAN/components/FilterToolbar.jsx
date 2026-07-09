import React from "react";
import styles from "../PrefijosDian.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCalendarAlt,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";

const FilterToolbar = ({ model }) => {
  return (
    <div className={styles.filtroCard}>
      <form onSubmit={model.consultarAuditoria} className={styles.filtrosForm}>
        <div className={`${styles.formGroup} ${styles.floating}`}>
          <select
            value={model.empresa}
            disabled
            className={styles.inputDisabled}
            required
          >
            <option value="abastecemos">Abastecemos de Occidente S.A.S</option>
          </select>
          <label className={styles.formLabel}>
            <FontAwesomeIcon icon={faBuilding} /> Empresa
          </label>
        </div>

        <div className={`${styles.formGroup} ${styles.floating}`}>
          <input
            type="date"
            value={model.fechaInicio}
            onChange={(e) => model.setFechaInicio(e.target.value)}
            className={styles.appleInput}
            placeholder=" "
            required
          />
          <label className={styles.formLabel}>
            <FontAwesomeIcon icon={faCalendarAlt} /> Fecha Inicial
          </label>
        </div>

        <div className={`${styles.formGroup} ${styles.floating}`}>
          <input
            type="date"
            value={model.fechaFin}
            onChange={(e) => model.setFechaFin(e.target.value)}
            className={styles.appleInput}
            placeholder=" "
            required
          />
          <label className={styles.formLabel}>
            <FontAwesomeIcon icon={faCalendarAlt} /> Fecha Final
          </label>
        </div>

        <button type="submit" className={styles.btnEnviar}>
          <FontAwesomeIcon icon={faSearch} /> Procesar Libros
        </button>
      </form>
    </div>
  );
};

export default FilterToolbar;
