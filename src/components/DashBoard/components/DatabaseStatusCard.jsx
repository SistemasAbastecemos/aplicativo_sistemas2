import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import styles from "../Dashboard.module.css";
import { formatTimeString } from "../utils/formatters";

const STATUS_META = {
  online: {
    label: "Operativo",
    description: "Conexión estable con el Biable.",
    dotClass: "dbDotOnline",
    textClass: "dbStatusOnline",
  },
  degraded: {
    label: "Degradado",
    description: "El servicio responde con lentitud.",
    dotClass: "dbDotDegraded",
    textClass: "dbStatusDegraded",
  },
  offline: {
    label: "Fuera de servicio",
    description: "Sin respuesta del túnel o de la Base de Datos.",
    dotClass: "dbDotOffline",
    textClass: "dbStatusOffline",
  },
  checking: {
    label: "Verificando…",
    description: "Consultando estado del servicio.",
    dotClass: "dbDotChecking",
    textClass: "dbStatusChecking",
  },
};

const DatabaseStatusCard = ({
  status,
  latencyMs,
  lastCheck,
  error,
  onRefresh,
}) => {
  const meta = STATUS_META[status] || STATUS_META.checking;

  return (
    <section className={styles.infoCard}>
      <div className={styles.cardHeader}>
        <div className={styles.dbHeaderTitle}>
          <FontAwesomeIcon icon={faDatabase} className={styles.dbHeaderIcon} />
          <h3>Estado del Servicio Biable</h3>
        </div>
        <button
          className={styles.dbRefreshButton}
          onClick={onRefresh}
          disabled={status === "checking"}
          aria-label="Verificar ahora"
          title="Verificar ahora"
        >
          <FontAwesomeIcon
            icon={faSyncAlt}
            className={status === "checking" ? styles.dbRefreshSpinning : ""}
          />
        </button>
      </div>

      <div className={styles.dbCardContent}>
        <div className={styles.dbStatusRow}>
          <span className={`${styles.dbDot} ${styles[meta.dotClass]}`} />
          <span className={`${styles.dbStatusLabel} ${styles[meta.textClass]}`}>
            {meta.label}
          </span>
        </div>

        <p className={styles.dbStatusDescription}>
          {error && status === "offline" ? error : meta.description}
        </p>

        <div className={styles.dbMetricsRow}>
          <div className={styles.dbMetric}>
            <span className={styles.dbMetricLabel}>Latencia</span>
            <span className={styles.dbMetricValue}>
              {typeof latencyMs === "number" ? `${latencyMs} ms` : "—"}
            </span>
          </div>
          <div className={styles.dbMetric}>
            <span className={styles.dbMetricLabel}>Última verificación</span>
            <span className={styles.dbMetricValue}>
              {lastCheck ? formatTimeString(lastCheck) : "—"}
            </span>
          </div>
        </div>

        <div className={styles.dbFootnote}>Base de datos · Túnel · Biable</div>
      </div>
    </section>
  );
};

export default DatabaseStatusCard;
