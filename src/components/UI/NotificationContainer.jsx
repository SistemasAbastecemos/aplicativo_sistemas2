import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import Notification from './Notification';
import styles from './NotificationContainer.module.css';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className={styles.container}>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;