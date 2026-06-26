import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./PermisosInventario.module.css";
import ModalConfiguracion from "./components/ModalConfiguracion";
import TablaPermisos from "./components/TablaPermisos";
import { useNotification } from "../../../contexts/NotificationContext";
import { apiService } from "../../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";

function PermisosInventario() {
  const { addNotification } = useNotification();

  const [matrix, setMatrix] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addNotificationRef = useRef(addNotification);
  useEffect(() => {
    addNotificationRef.current = addNotification;
  }, [addNotification]);

  const fetchMatrix = useCallback(async (textSearch) => {
    setLoading(true);
    try {
      const result = await apiService.getPermisosInventario(textSearch);
      setMatrix(result.rows || []);
    } catch (err) {
      addNotificationRef.current({
        message: "Fallo consultando la matriz unificada de proveedores",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    fetchMatrix(debouncedSearch);
  }, [debouncedSearch, fetchMatrix]);

  const handleSavePermisos = async (payload) => {
    try {
      await apiService.guardarPermisoInventario(payload);
      addNotificationRef.current({
        message: "Parámetros de proveedor sincronizados",
        type: "success",
      });
      fetchMatrix(debouncedSearch);
      return true;
    } catch (err) {
      addNotificationRef.current({
        message: err.message || "Error guardando políticas",
        type: "error",
      });
      return false;
    }
  };

  const handleEliminarRegla = async (row) => {
    if (
      !window.confirm(
        `¿Remover toda la configuración de acceso para el proveedor: ${row.razon_social}?`,
      )
    )
      return;
    try {
      await apiService.eliminarPermisoInventario(row.id);
      addNotificationRef.current({
        message: "Accesos revocados exitosamente",
        type: "success",
      });
      fetchMatrix(debouncedSearch);
    } catch (err) {
      addNotificationRef.current({
        message: "Error al purgar registro",
        type: "error",
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Matriz de Permisos de Inventario</h1>
          <p className={styles.subtitle}>
            Configuración unificada y granular por cuenta de proveedor.
          </p>
        </div>
      </div>

      <div className={styles.controlCard}>
        <div className={styles.actionBar}>
          <div className={styles.searchWrapper}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por NIT o Razón Social..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className={styles.createBtn}
            onClick={() => {
              setModalData(null);
              setIsModalOpen(true);
            }}
          >
            <FontAwesomeIcon icon={faPlus} /> Configurar Proveedor
          </button>
        </div>

        <TablaPermisos
          matrix={matrix}
          loading={loading}
          onEdit={(row) => {
            setModalData(row);
            setIsModalOpen(true);
          }}
          onDelete={handleEliminarRegla}
        />
      </div>

      {isModalOpen && (
        <ModalConfiguracion
          data={modalData}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSavePermisos}
        />
      )}
    </div>
  );
}

export default PermisosInventario;
