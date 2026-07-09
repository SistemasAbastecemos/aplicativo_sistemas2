import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Areas.module.css";

import { usePermisos } from "../../../hooks/usePermission";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";

import { useAreasData } from "./hooks/useAreasData";
import { useAreaForm } from "./hooks/useAreaForm";

import AreasHeader from "./components/AreasHeader";
import AreasToolbar from "./components/AreasToolbar";
import AreasStats from "./components/AreasStats";
import AreasGrid from "./components/AreasGrid";
import AreaModal from "./components/AreaModal";

/**
 * Contenedor del módulo de áreas. Orquesta la lógica (datos y formulario)
 * mediante hooks y compone los componentes de presentación. No contiene
 * lógica de negocio directamente.
 */
const Areas = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const { puedeVer, puedeCrear, loading: permisosLoading } = usePermisos();

  const esAdministrador = puedeVer;

  const data = useAreasData({ addNotification, habilitado: esAdministrador });
  const form = useAreaForm({
    recargar: () => data.cargarAreas(data.pagina, data.search.trim()),
    addNotification,
  });

  // Expulsión en vivo si se revoca el permiso de ver durante la sesión.
  useEffect(() => {
    if (!permisosLoading && !puedeVer) {
      addNotification({
        message: "Se revocaron tus permisos para este modulo.",
        type: "error",
      });
      navigate("/inicio", { replace: true });
    }
  }, [permisosLoading, puedeVer, navigate, addNotification]);

  if (!esAdministrador) {
    return (
      <div className={styles.container}>
        <div className={styles.errorPermisos}>
          <h2>Acceso restringido</h2>
          <p>No tienes permisos para acceder a esta sección</p>
        </div>
      </div>
    );
  }

  if (data.cargando && data.pagina === 1 && data.areas.length === 0) {
    return <LoadingScreen message="Cargando áreas..." />;
  }

  return (
    <div className={styles.container}>
      <AreasHeader />

      <AreasToolbar
        search={data.search}
        onSearchChange={data.handleSearchChange}
        onRefresh={() => data.cargarAreas(data.pagina, data.search.trim())}
        cargando={data.cargando}
        puedeCrear={puedeCrear}
        onCreate={form.abrirModalNueva}
      />

      <AreasStats
        areas={data.areas}
        totalAreas={data.totalAreas}
        totalPaginas={data.totalPaginas}
      />

      <div className={styles.content}>
        <AreasGrid
          areasFiltradas={data.areasFiltradas}
          search={data.search}
          onEdit={form.abrirModalEditar}
          onCreate={form.abrirModalNueva}
          pagina={data.pagina}
          totalPaginas={data.totalPaginas}
          onPaginaChange={data.setPagina}
        />
      </div>

      {form.mostrarModal && (
        <AreaModal
          modoEdicion={form.modoEdicion}
          formData={form.formData}
          camposIncompletos={form.camposIncompletos}
          onChange={form.handleChange}
          onSave={form.guardarArea}
          onClose={form.cerrarModal}
        />
      )}
    </div>
  );
};

export default Areas;
