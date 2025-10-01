import React from 'react';
import styles from './Notification.module.css';

const Notification = ({ message, type, onClose }) => {
  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <span className={styles.message}>{message}</span>
      <button className={styles.closeBtn} onClick={onClose}>×</button>
    </div>
  );
};

export default Notification;