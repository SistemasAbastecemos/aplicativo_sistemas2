import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Sedes.module.css";

import { usePermisos } from "../../../hooks/usePermission";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";

import { useSedesData } from "./hooks/useSedesData";
import { useSedeForm } from "./hooks/useSedeForm";

import SedesHeader from "./components/SedesHeader";
import SedesToolbar from "./components/SedesToolbar";
import SedesStats from "./components/SedesStats";
import SedesGrid from "./components/SedesGrid";
import SedeModal from "./components/SedeModal";

/**
 * Contenedor del módulo de sedes. Orquesta la lógica (datos y formulario)
 * mediante hooks y compone los componentes de presentación. No contiene
 * lógica de negocio directamente.
 */
const Sedes = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const { puedeVer, puedeCrear, loading: permisosLoading } = usePermisos();

  const esAdministrador = puedeVer;

  const data = useSedesData({ addNotification, habilitado: esAdministrador });
  const form = useSedeForm({
    recargar: () => data.cargarSedes(data.pagina, data.search.trim()),
    addNotification,
  });

  // Si se revocan los permisos, notifica y redirige.
  useEffect(() => {
    if (!permisosLoading && !puedeVer) {
      addNotification({
        message: "Se revocaron tus permisos para este módulo.",
        type: "error",
      });
      navigate("/inicio", { replace: true });
    }
  }, [permisosLoading, puedeVer, navigate, addNotification]);

  if (permisosLoading) {
    return (
      <LoadingScreen
        isVisible={true}
        title="Verificando seguridad"
        subtitle="Cargando directivas de acceso corporativo..."
        variant="fullscreen"
      />
    );
  }

  if (!esAdministrador) {
    return (
      <div className={styles.container}>
        <div className={styles.errorPermisos}>
          <h2>Acceso Restringido</h2>
          <p>No tienes permisos para acceder a esta sección institucional</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LoadingScreen
        isVisible={
          data.cargando && data.pagina === 1 && data.sedes.length === 0
        }
        title="Procesando datos"
        subtitle="Sincronizando el repositorio de sucursales..."
        variant="fullscreen"
      />

      <SedesHeader />

      <SedesToolbar
        search={data.search}
        onSearchChange={data.handleSearchChange}
        onRefresh={() => data.cargarSedes(data.pagina, data.search.trim())}
        cargando={data.cargando}
        puedeCrear={puedeCrear}
        onCreate={form.abrirModalNueva}
      />

      <SedesStats
        sedes={data.sedes}
        totalSedes={data.totalSedes}
        totalPaginas={data.totalPaginas}
      />

      <main className={styles.content}>
        <SedesGrid
          sedesFiltradas={data.sedesFiltradas}
          search={data.search}
          onEdit={form.abrirModalEditar}
          onCreate={form.abrirModalNueva}
          pagina={data.pagina}
          totalPaginas={data.totalPaginas}
          onPaginaChange={data.setPagina}
        />
      </main>

      {form.mostrarModal && (
        <SedeModal
          modoEdicion={form.modoEdicion}
          formData={form.formData}
          camposIncompletos={form.camposIncompletos}
          onChange={form.handleChange}
          onSave={form.guardarSede}
          onClose={form.cerrarModal}
        />
      )}
    </div>
  );
};

export default Sedes;
