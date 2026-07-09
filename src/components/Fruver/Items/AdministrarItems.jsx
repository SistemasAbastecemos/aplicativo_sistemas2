import React from "react";
import styles from "./AdministrarItems.module.css";
import LoadingScreen from "../../UI/LoadingScreen";
import { useNotification } from "../../../contexts/NotificationContext";
import { useAdministrarItems } from "./hooks/useAdministrarItems";

import ItemsHeader from "./components/ItemsHeader";
import ItemsToolbar from "./components/ItemsToolbar";
import { ItemsGrid } from "./components/ItemsGrid";
import { ItemModal } from "./components/ItemModal";

const AdministrarItems = () => {
  const { addNotification } = useNotification();
  const model = useAdministrarItems(addNotification);

  return (
    <div className={styles.canvasModuloContainer}>
      {/* Consumo nativo del LoadingScreen corporativo parametrizado en fullscreen */}
      {model.cargando && (
        <LoadingScreen
          isVisible={true}
          title="Sincronizando Base de Datos"
          subtitle="Recuperando catálogo maestro de ítems activos..."
          variant="fullscreen"
        />
      )}

      {model.guardando && (
        <LoadingScreen
          isVisible={true}
          title="Almacenando Registros"
          subtitle="Escribiendo cambios transaccionales en el servidor fiscal..."
          variant="fullscreen"
        />
      )}

      <ItemsHeader />

      <main className={styles.cuerpoMainCanvas}>
        <ItemsToolbar
          search={model.search}
          setSearch={model.setSearch}
          onCrearClick={model.iniciarCreacion}
          onRefresh={model.recargarCatalogo}
          cargando={model.cargando}
        />

        <ItemsGrid
          items={model.items}
          pagina={model.pagina}
          totalPaginas={model.totalPaginas}
          onPageChange={model.handlePageChange}
          onEditClick={model.iniciarEdicion}
        />
      </main>

      {model.isModalOpen && (
        <ItemModal
          editItem={model.editItem}
          newItem={model.newItem}
          setEditItem={model.setEditItem}
          setNewItem={model.setNewItem}
          onClose={model.cerrarModal}
          onSave={model.ejecutarGuardadoItem}
        />
      )}
    </div>
  );
};

export default AdministrarItems;
