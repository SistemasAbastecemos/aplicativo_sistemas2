import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhoneAlt,
  faEnvelope,
  faGlobe,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Dashboard.module.css";

const SoporteSistemas = () => (
  <section className={styles.infoCard}>
    <div className={styles.cardHeader}>
      <h3>Soporte y Sistemas</h3>
    </div>
    <div className={styles.cardContent}>
      <div className={styles.contactGrid}>
        <div className={styles.contactItem}>
          <FontAwesomeIcon icon={faPhoneAlt} className={styles.contactIcon} />
          <div className={styles.contactInfo}>
            <span className={styles.contactLabel}>Ext. Área de Sistemas</span>
            <span className={styles.contactValue}>
              669 5778 | Ext 132 - 109
            </span>
          </div>
        </div>

        <div className={styles.contactItem}>
          <FontAwesomeIcon icon={faEnvelope} className={styles.contactIcon} />
          <div className={styles.contactInfo}>
            <span className={styles.contactLabel}>Canal de Correo</span>
            <a
              href="mailto:sistemas@supermercadobelalcazar.com.co"
              className={styles.contactLink}
            >
              sistemas@supermercadobelalcazar.com.co
            </a>
          </div>
        </div>

        <div className={styles.contactItem}>
          <FontAwesomeIcon icon={faGlobe} className={styles.contactIcon} />
          <div className={styles.contactInfo}>
            <span className={styles.contactLabel}>Portal Corporativo</span>
            <a
              href="https://supermercadobelalcazar.com.co"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactLink}
            >
              supermercadobelalcazar.com.co
            </a>
          </div>
        </div>

        <div className={styles.contactItem}>
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            className={styles.contactIcon}
          />
          <div className={styles.contactInfo}>
            <span className={styles.contactLabel}>Sede Administrativa</span>
            <span className={styles.contactValue}>
              Cra. 5 # 5-48, Yumbo, Valle
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default SoporteSistemas;
