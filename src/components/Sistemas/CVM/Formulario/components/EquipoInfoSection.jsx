import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIdCard,
  faCertificate,
  faShieldAlt,
  faCalendarCheck,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../CVM.module.css";
import { obtenerImagenEquipo } from "../utils/helpers";

/**
 * Muestra la información del equipo asociado a la caja seleccionada, o un
 * mensaje alternativo cuando:
 *  - Se eligió "todas sin novedad" (mensaje explicativo)
 *  - La caja no tiene balanza asignada (aviso)
 */
const EquipoInfoSection = ({ cajaSeleccionada, equipoInfo }) => {
  if (!cajaSeleccionada) return null;

  const esTodas = cajaSeleccionada.id_caja === "todas";

  return (
    <section className={styles.equipoSection}>
      <div className={styles.sectionHeader}>
        <h2>Información del Equipo</h2>
      </div>

      {equipoInfo ? (
        <div className={styles.equipoCard}>
          <div className={styles.equipoHeader}>
            <div className={styles.equipoIcon}>
              <img
                src={obtenerImagenEquipo(equipoInfo)}
                alt={equipoInfo.tipo}
              />
            </div>
            <div className={styles.equipoTitle}>
              <h3>{equipoInfo.tipo}</h3>
            </div>
          </div>
          <div className={styles.equipoDetails}>
            <div className={styles.detailItem}>
              <FontAwesomeIcon icon={faIdCard} />
              <span>
                <strong>Serial:</strong> {equipoInfo.serial}
              </span>
            </div>
            <div className={styles.detailItem}>
              <FontAwesomeIcon icon={faCertificate} />
              <span>
                <strong>NII:</strong> {equipoInfo.nii}
              </span>
            </div>
            <div className={styles.detailItem}>
              <FontAwesomeIcon icon={faShieldAlt} />
              <span>
                <strong>Estado SIMEL:</strong> {equipoInfo.estadoSimel}
              </span>
            </div>
            <div className={styles.detailItem}>
              <FontAwesomeIcon icon={faCalendarCheck} />
              <span>
                <strong>Certificación:</strong> {equipoInfo.fechaCertificacion}
              </span>
            </div>
          </div>
        </div>
      ) : esTodas ? (
        <div className={`${styles.infoCard} ${styles.infoCardSuccess}`}>
          <div className={styles.infoIcon}>
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className={styles.infoContent}>
            <h3>Reporte General</h3>
            <p>
              Esta opción es únicamente para cuando ya has revisado todas las
              balanzas de todas las cajas y ninguna de ellas presenta novedad.
              En caso contrario, selecciona la caja cuya balanza tenga novedad
              y sigue el procedimiento.
            </p>
          </div>
        </div>
      ) : (
        <div className={`${styles.infoCard} ${styles.infoCardWarning}`}>
          <div className={styles.infoIcon}>
            <FontAwesomeIcon icon={faTimesCircle} />
          </div>
          <div className={styles.infoContent}>
            <h3>Sin Equipo</h3>
            <p>La caja seleccionada no tiene balanza asignada.</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default EquipoInfoSection;
