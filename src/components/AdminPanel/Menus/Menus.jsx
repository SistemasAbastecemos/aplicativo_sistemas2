import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Menus.module.css";

import { usePermisos } from "../../../hooks/usePermission";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";

import { useMenusData } from "./hooks/useMenusData";
import { useMenuReorder } from "./hooks/useMenuReorder";
import { useMenuForm } from "./hooks/useMenuForm";

import MenusHeader from "./components/MenusHeader";
import MenusToolbar from "./components/MenusToolbar";
import MenusStats from "./components/MenusStats";
import MenusGrid from "./components/MenusGrid";
import MenuModal from "./components/MenuModal";

/**
 * Contenedor del módulo de menús. Orquesta la lógica (datos, reordenamiento y
 * formulario) mediante hooks y compone los componentes de presentación.
 * No contiene lógica de negocio directamente.
 */
const Menus = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    puedeVer,
    puedeCrear,
    puedeEditar,
    loading: permisosLoading,
  } = usePermisos();

  const data = useMenusData(addNotification);
  const drag = useMenuReorder({
    menus: data.menus,
    setMenus: data.setMenus,
    cargarDatos: data.cargarDatos,
    addNotification,
  });
  const form = useMenuForm({
    cargos: data.cargos,
    asegurarCatalogos: data.asegurarCatalogos,
    recargar: data.cargarDatos,
    addNotification,
    puedeCrear,
    puedeEditar,
  });

  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Lista visible: durante el arrastre usa la lista en vivo; si no, la
  // ordenada por 'orden'. Luego aplica el filtro de búsqueda.
  const searchTrimmed = useMemo(() => search.trim(), [search]);

  const menusFiltrados = useMemo(() => {
    const base = drag.draggingId
      ? [...drag.liveMenus]
      : [...data.menus].sort(
          (a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0),
        );

    if (!searchTrimmed) return base;
    const texto = searchTrimmed.toLowerCase();
    return base.filter((m) =>
      Object.values(m).some(
        (value) => value && value.toString().toLowerCase().includes(texto),
      ),
    );
  }, [data.menus, drag.liveMenus, drag.draggingId, searchTrimmed]);

  // Carga inicial cuando el usuario tiene permiso de ver.
  useEffect(() => {
    if (puedeVer) data.cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puedeVer]);

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

  // Limpia el temporizador de búsqueda al desmontar.
  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => data.setPagina(1), 500));
  };

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

  if (!puedeVer) {
    return (
      <div className={styles.container}>
        <div className={styles.errorPermisos}>
          <h2>Restricción de Seguridad</h2>
          <p>
            Credenciales insuficientes para acceder al módulo de configuración
            de menús.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LoadingScreen
        isVisible={data.cargando && data.pagina === 1}
        title="Procesando datos"
        subtitle="Sincronizando el repositorio de navegación..."
        variant="fullscreen"
      />

      <MenusHeader />

      <MenusToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onRefresh={data.cargarDatos}
        cargando={data.cargando}
        puedeCrear={puedeCrear}
        onCreate={form.abrirModalNuevo}
      />

      <MenusStats menus={data.menus} totalMenus={data.totalMenus} />

      <main className={styles.mainContent}>
        <MenusGrid
          menusFiltrados={menusFiltrados}
          menus={data.menus}
          search={search}
          puedeEditar={puedeEditar}
          puedeCrear={puedeCrear}
          currentPath={location.pathname}
          pagina={data.pagina}
          totalPaginas={data.totalPaginas}
          onPaginaChange={data.setPagina}
          drag={drag}
          onEdit={form.abrirModalEditar}
          onNuevoMenu={form.abrirModalNuevo}
        />
      </main>

      {form.mostrarModal && (
        <MenuModal
          modoEdicion={form.modoEdicion}
          formData={form.formData}
          permisos={form.permisos}
          pestanaActiva={form.pestanaActiva}
          areaSeleccionada={form.areaSeleccionada}
          roles={data.roles}
          areas={data.areas}
          cargosFiltrados={form.cargosFiltrados}
          menus={data.menus}
          camposIncompletos={form.camposIncompletos}
          puedeGuardar={form.puedeGuardar}
          onChange={form.handleChange}
          onAreaChange={form.handleAreaChange}
          onTogglePermiso={form.togglePermiso}
          onPestanaChange={form.setPestanaActiva}
          onSave={form.guardarMenu}
          onClose={form.cerrarModal}
        />
      )}
    </div>
  );
};

export default Menus;
