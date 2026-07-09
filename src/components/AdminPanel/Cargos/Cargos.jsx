import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Cargos.module.css";

import { usePermisos } from "../../../hooks/usePermission";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";

import { useCargosData } from "./hooks/useCargosData";
import { useCargoForm } from "./hooks/useCargoForm";

import CargosHeader from "./components/CargosHeader";
import CargosToolbar from "./components/CargosToolbar";
import CargosStats from "./components/CargosStats";
import CargosGrid from "./components/CargosGrid";
import CargoModal from "./components/CargoModal";

const Cargos = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const {
    puedeVer,
    puedeCrear,
    puedeEditar,
    loading: permisosLoading,
  } = usePermisos();

  const data = useCargosData(addNotification);

  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  const form = useCargoForm({
    cargarAreas: data.cargarAreas,
    recargar: data.cargarCargos,
    addNotification,
    puedeCrear,
    puedeEditar,
    pagina: data.pagina,
    search,
  });

  const searchTrimmed = useMemo(() => search.trim(), [search]);

  const cargosFiltrados = useMemo(() => {
    if (!searchTrimmed) return data.cargos;

    const texto = searchTrimmed.toLowerCase();
    return data.cargos.filter(
      (c) =>
        Object.values(c).some(
          (value) => value && value.toString().toLowerCase().includes(texto),
        ) ||
        (data.areas.find((a) => a.id === c.id_area)?.nombre || "")
          .toLowerCase()
          .includes(texto),
    );
  }, [data.cargos, data.areas, searchTrimmed]);

  useEffect(() => {
    if (puedeVer) {
      data.cargarAreas();
      data.cargarCargos(data.pagina, search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puedeVer, data.pagina]);

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
    setSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(
      setTimeout(() => {
        data.setPagina(1);
        data.cargarCargos(1, value.trim());
      }, 500),
    );
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
            de cargos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LoadingScreen
        isVisible={
          data.cargando && data.pagina === 1 && data.cargos.length === 0
        }
        title="Procesando datos"
        subtitle="Sincronizando el repositorio de cargos organizacionales..."
        variant="fullscreen"
      />

      <CargosHeader />

      <CargosToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onRefresh={() => data.cargarCargos(data.pagina, search.trim())}
        cargando={data.cargando}
        puedeCrear={puedeCrear}
        onCreate={form.abrirModalNuevo}
      />

      <CargosStats
        cargos={data.cargos}
        totalCargos={data.totalCargos}
        totalPaginas={data.totalPaginas}
      />

      <main className={styles.mainContent}>
        <CargosGrid
          cargosFiltrados={cargosFiltrados}
          areas={data.areas}
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
        <CargoModal
          modoEdicion={form.modoEdicion}
          formData={form.formData}
          areas={data.areas}
          camposIncompletos={form.camposIncompletos}
          onChange={form.handleChange}
          onSave={form.guardarCargo}
          onClose={form.cerrarModal}
        />
      )}
    </div>
  );
};

export default Cargos;
