import React, { useEffect } from "react";
import styles from "./Notification.module.css";

const Notification = ({ message, type, onClose }) => {
  // Limpieza automática defensiva opcional si no se gestiona en el contexto
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStatusIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "•";
    }
  };

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <div className={styles.iconIndicator} aria-hidden="true">
        {getStatusIcon()}
      </div>
      <div className={styles.contentWrapper}>
        <span className={styles.message}>{message}</span>
      </div>
      <button
        className={styles.closeBtn}
        onClick={onClose}
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
};

export default Notification;
