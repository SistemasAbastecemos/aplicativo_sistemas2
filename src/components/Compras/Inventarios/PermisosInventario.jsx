import React, { useEffect } from "react";
import styles from "./PermisosInventario.module.css";
import LoadingScreen from "../../UI/LoadingScreen";
import { useNotification } from "../../../contexts/NotificationContext";
import { usePermisosInventario } from "./hooks/usePermisosInventario";
import { usePermisos } from "../../../hooks/usePermission"; // Hook maestro de seguridad
import { useNavigate } from "react-router-dom";

import PermisosHeader from "./components/PermisosHeader";
import PermisosToolbar from "./components/PermisosToolbar";
import PermisosInventarioGrid from "./components/PermisosInventarioGrid";
import ModalConfiguracion from "./components/ModalConfiguracion";

function PermisosInventario() {
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  // Desestructuración de las banderas desde el hook maestro de seguridad
  const {
    puedeVer,
    puedeCrear,
    puedeEditar,
    puedeEliminar,
    loading: permisosLoading,
  } = usePermisos();
  const model = usePermisosInventario(addNotification);

  // Expulsión en vivo reactiva si se revocan privilegios en caliente
  useEffect(() => {
    if (!permisosLoading && !puedeVer) {
      addNotification({
        message:
          "Se revocaron tus privilegios de acceso para el módulo de inventarios.",
        type: "error",
      });
      navigate("/");
    }
  }, [puedeVer, permisosLoading, navigate, addNotification]);

  if (permisosLoading) {
    return (
      <LoadingScreen message="Validando directivas de seguridad corporativa..." />
    );
  }

  return (
    <div className={styles.container}>
      <LoadingScreen
        isVisible={model.loading && model.matrix.length === 0}
        message="Sincronizando matriz de privilegios..."
      />

      <PermisosHeader />

      <PermisosToolbar
        search={model.search}
        onSearchChange={(e) => model.setSearch(e.target.value)}
        onRefresh={() => model.fetchMatrix(model.search)} // Llama al consultor real forzando el refresco inmediato
        cargando={model.loading}
        puedeCrear={puedeCrear}
        onNuevo={() => {
          model.setModalData(null);
          model.setIsModalOpen(true);
        }}
      />

      <main className={styles.mainContent}>
        <PermisosInventarioGrid
          matrix={model.matrix}
          loading={model.loading}
          search={model.search}
          puedeEditar={puedeEditar}
          puedeEliminar={puedeEliminar}
          onEdit={(row) => {
            model.setModalData(row);
            model.setIsModalOpen(true);
          }}
          onDelete={model.handleEliminarRegla}
        />
      </main>

      {model.isModalOpen && (
        <ModalConfiguracion
          data={model.modalData}
          sedesDisponibles={model.sedesCatalog}
          onClose={() => model.setIsModalOpen(false)}
          onSave={model.handleSavePermisos}
        />
      )}
    </div>
  );
}

export default PermisosInventario;
