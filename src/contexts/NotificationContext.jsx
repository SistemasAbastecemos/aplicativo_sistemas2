import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification debe ser usado dentro de un NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // useCallback con dependencia vacia garantiza una identidad de funcion inmutable
  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  // Depende unicamente de removeNotification, cuya referencia ya es estable
  const addNotification = useCallback(
    (notification) => {
      const id = Date.now();
      const newNotification = { ...notification, id };

      setNotifications((prev) => [...prev, newNotification]);

      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    },
    [removeNotification],
  );

  //useMemo evita que los componentes que solo envian alertas se re-rendericen innecesariamente
  const value = useMemo(
    () => ({
      notifications,
      addNotification,
      removeNotification,
    }),
    [notifications, addNotification, removeNotification],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
