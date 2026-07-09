import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faRedo } from "@fortawesome/free-solid-svg-icons";
import styles from "../CVM.module.css";
import { getEstadoColor } from "../utils/helpers";
import { ESTADOS_VERIFICACION } from "../utils/constants";

/**
 * Card de una verificación individual (conforme, regularización o precinto).
 * Muestra: imagen ilustrativa, título/descripción, botón "Tomar Foto" (o
 * preview + botón "retomar" si ya hay foto), y select del estado.
 *
 * Puramente presentacional: recibe el estado y los callbacks desde el
 * orquestador. El color del borde del select refleja el estado.
 */
const VerificacionCard = ({
  tipo,
  imagen,
  titulo,
  descripcion,
  foto,
  urlFoto,
  estado,
  onTomarFoto,
  onEstadoChange,
}) => (
  <div className={styles.verificacionCard}>
    <div className={styles.verificacionHeader}>
      <div className={styles.verificacionIcon}>
        <img src={imagen} alt={titulo} />
      </div>
      <div className={styles.verificacionInfo}>
        <h4>{titulo}</h4>
        <p>{descripcion}</p>
      </div>
    </div>

    <div className={styles.verificacionContent}>
      <div className={styles.fotoSection}>
        {!foto ? (
          <button
            className={styles.fotoButton}
            onClick={() => onTomarFoto(tipo)}
            type="button"
          >
            <FontAwesomeIcon icon={faCamera} />
            Tomar Foto
          </button>
        ) : (
          <div className={styles.fotoPreview}>
            <img src={urlFoto} alt={`Foto ${titulo}`} />
            <button
              className={styles.fotoRetake}
              onClick={() => onTomarFoto(tipo)}
              title="Retomar foto"
              type="button"
            >
              <FontAwesomeIcon icon={faRedo} />
            </button>
          </div>
        )}
      </div>

      <div className={styles.estadoSection}>
        <div className={`${styles.formGroup} ${styles.floating}`}>
          <select
            className={styles.formSelect}
            value={estado}
            onChange={(e) => onEstadoChange(tipo, e.target.value)}
            style={{ borderColor: getEstadoColor(estado) }}
          >
            {ESTADOS_VERIFICACION.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <label className={styles.formLabel}>Estado</label>
        </div>
      </div>
    </div>
  </div>
);

export default VerificacionCard;
