import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Usuarios.module.css";

import { usePermisos } from "../../../hooks/usePermission";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";

import { useUsuariosData } from "./hooks/useUsuariosData";
import { useUsuarioForm } from "./hooks/useUsuarioForm";

import UsuariosHeader from "./components/UsuariosHeader";
import UsuariosToolbar from "./components/UsuariosToolbar";
import UsuariosStats from "./components/UsuariosStats";
import UsuariosGrid from "./components/UsuariosGrid";
import UsuarioModal from "./components/UsuarioModal";

/**
 * Contenedor del módulo de usuarios. Orquesta la lógica (datos y formulario)
 * mediante hooks y compone los componentes de presentación. No contiene
 * lógica de negocio directamente.
 */
const Usuarios = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const { puedeVer, puedeCrear, loading: permisosLoading } = usePermisos();

  const esAdministrador = puedeVer;

  const data = useUsuariosData({
    addNotification,
    habilitado: esAdministrador,
  });
  const form = useUsuarioForm({
    cargos: data.cargos,
    recargar: () => data.cargarUsuarios(data.pagina, data.search),
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

  if (data.cargando && data.pagina === 1 && data.usuarios.length === 0) {
    return <LoadingScreen message="Cargando usuarios..." />;
  }

  return (
    <div className={styles.container}>
      <UsuariosHeader />

      <UsuariosToolbar
        search={data.search}
        onSearchChange={data.handleSearchChange}
        onRefresh={() => data.cargarUsuarios(data.pagina, data.search)}
        cargando={data.cargando}
        puedeCrear={puedeCrear}
        onCreate={form.abrirModalNuevo}
      />

      <UsuariosStats
        usuarios={data.usuarios}
        totalUsuarios={data.totalUsuarios}
        totalPaginas={data.totalPaginas}
      />

      <div className={styles.content}>
        <UsuariosGrid
          usuarios={data.usuarios}
          roles={data.roles}
          sedes={data.sedes}
          search={data.search}
          puedeCrear={puedeCrear}
          pagina={data.pagina}
          totalPaginas={data.totalPaginas}
          onPaginaChange={data.setPagina}
          onEdit={form.abrirModalEditar}
          onCreate={form.abrirModalNuevo}
        />
      </div>

      {form.mostrarModal && (
        <UsuarioModal
          modoEdicion={form.modoEdicion}
          formData={form.formData}
          confirmarContrasena={form.confirmarContrasena}
          errorContrasena={form.errorContrasena}
          roles={data.roles}
          areas={data.areas}
          cargosFiltrados={form.cargosFiltrados}
          sedes={data.sedes}
          camposIncompletos={form.camposIncompletos}
          onChange={form.handleChange}
          onConfirmarContrasenaChange={form.setConfirmarContrasena}
          onSave={form.guardarUsuario}
          onClose={form.cerrarModal}
        />
      )}
    </div>
  );
};

export default Usuarios;
