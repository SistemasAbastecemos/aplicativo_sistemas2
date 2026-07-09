import React from "react";
import TablaPermisos from "./TablaPermisos";
import EmptyState from "../../../UI/EmptyState";
import styles from "../PermisosInventario.module.css";

/**
 * Componente intermedio Grid.
 * Encargado de evaluar el estado de la matriz y renderizar la vista correspondiente.
 */
const PermisosInventarioGrid = ({
  matrix,
  loading,
  onEdit,
  onDelete,
  search,
}) => {
  if (matrix.length === 0 && !loading) {
    const hasSearchActive = search.trim() !== "";
    return (
      <EmptyState
        icon="🔒"
        title={
          hasSearchActive ? "Sin coincidencias" : "Matriz de Proveedores limpia"
        }
        description={
          hasSearchActive
            ? `No se encontraron configuraciones que coincidan con "${search.trim()}". Intenta con otro término.`
            : "No se registran directivas granulares de inventario configuradas en el sistema."
        }
      />
    );
  }

  return (
    <div className={styles.gridCanvas}>
      <TablaPermisos
        matrix={matrix}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default PermisosInventarioGrid;
