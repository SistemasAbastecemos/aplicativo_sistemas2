import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Proveedores.module.css";

import { usePermisos } from "../../../hooks/usePermission";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";

import { useProveedoresData } from "./hooks/useProveedoresData";
import { useProveedorForm } from "./hooks/useProveedorForm";

import ProveedoresHeader from "./components/ProveedoresHeader";
import ProveedoresToolbar from "./components/ProveedoresToolbar";
import ProveedoresGrid from "./components/ProveedoresGrid";
import ProveedorModal from "./components/ProveedorModal";

const Proveedores = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const {
    puedeVer,
    puedeCrear,
    puedeEditar,
    loading: permisosLoading,
  } = usePermisos();

  const data = useProveedoresData(addNotification);
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  const form = useProveedorForm({
    recargar: data.cargarProveedores,
    addNotification,
    puedeCrear,
    puedeEditar,
    pagina: data.pagina,
    search,
  });

  const searchTrimmed = useMemo(() => search.trim(), [search]);

  const proveedoresFiltrados = useMemo(() => {
    if (!searchTrimmed) return data.proveedores;
    const texto = searchTrimmed.toLowerCase();
    return data.proveedores.filter((p) =>
      Object.values(p).some(
        (val) => val && val.toString().toLowerCase().includes(texto),
      ),
    );
  }, [data.proveedores, searchTrimmed]);

  useEffect(() => {
    if (puedeVer) {
      data.cargarProveedores(data.pagina, searchTrimmed);
    }
    // Depender de searchTrimmed, no de search — así solo re-fetch cuando cambia el contenido "real"
  }, [puedeVer, data.pagina, searchTrimmed, data.cargarProveedores]);

  useEffect(() => {
    if (!permisosLoading && !puedeVer) {
      addNotification({
        message: "Se revocaron tus permisos para este módulo.",
        type: "error",
      });
      navigate("/inicio", { replace: true });
    }
  }, [permisosLoading, puedeVer, navigate, addNotification]);

  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value); // Mantiene lo que el usuario escribe en pantalla

    if (searchTimeout) clearTimeout(searchTimeout);

    const nuevoTimeout = setTimeout(() => {
      const textoLimpio = value.trim();
      data.setPagina(1);
      data.cargarProveedores(1, textoLimpio);
    }, 600);

    setSearchTimeout(nuevoTimeout);
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
            de proveedores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LoadingScreen
        isVisible={
          data.cargando && data.pagina === 1 && data.proveedores.length === 0
        }
        title="Procesando datos"
        subtitle="Sincronizando el repositorio de proveedores corporativos..."
        variant="fullscreen"
      />

      <ProveedoresHeader totalDisponibles={proveedoresFiltrados.length} />

      <ProveedoresToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onRefresh={() => data.cargarProveedores(data.pagina, search)}
        cargando={data.cargando}
        puedeCrear={puedeCrear}
        onCreate={form.abrirModalNuevo}
      />

      <main className={styles.mainContent}>
        <ProveedoresGrid
          proveedoresFiltrados={proveedoresFiltrados}
          search={search}
          puedeCrear={puedeCrear}
          pagina={data.pagina}
          totalPaginas={data.totalPaginas}
          onPaginaChange={data.setPagina}
          onEdit={form.abrirModalEditar}
          onCreate={form.abrirModalNuevo}
        />
      </main>

      {form.mostrarModal && (
        <ProveedorModal
          modoEdicion={form.modoEdicion}
          formData={form.formData}
          confirmarContrasena={form.confirmarContrasena}
          setConfirmarContrasena={form.setConfirmarContrasena}
          errorContrasena={form.errorContrasena}
          camposIncompletos={form.camposIncompletos}
          onChange={form.handleChange}
          onSave={form.guardarProveedor}
          onClose={form.cerrarModal}
        />
      )}
    </div>
  );
};

export default Proveedores;
