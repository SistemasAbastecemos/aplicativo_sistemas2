import React, { useEffect, useState, useMemo } from "react";
import styles from "./Informes.module.css";
import LoadingScreen from "../../UI/LoadingScreen";
import { useNotification } from "../../../contexts/NotificationContext";

import { useInformesData } from "./hooks/useInformesData";
import { useInformeForm } from "./hooks/useInformeForm";

import InformesHeader from "./components/InformesHeader";
import InformesToolbar from "./components/InformesToolbar";
import InformesTable from "./components/InformesTable";
import InformeModal from "./components/InformeModal";
import InformesGrid from "./components/InformesGrid";

const AdminInformes = () => {
  const { addNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState("");

  const data = useInformesData(addNotification);
  const form = useInformeForm({
    recargar: data.cargarCatalogos,
    addNotification,
  });

  useEffect(() => {
    data.cargarCatalogos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchTrimmed = useMemo(() => searchTerm.trim(), [searchTerm]);

  const filteredInformes = useMemo(() => {
    if (!searchTrimmed) return data.informes;
    const texto = searchTrimmed.toLowerCase();
    return data.informes.filter(
      (inf) =>
        inf.titulo?.toLowerCase().includes(texto) ||
        inf.descripcion?.toLowerCase().includes(texto),
    );
  }, [data.informes, searchTrimmed]);

  return (
    <div className={styles.container}>
      <LoadingScreen
        isVisible={data.isLoading && data.informes.length === 0}
        message="Sincronizando configuración de informes..."
      />

      {/* Cabecera Pura */}
      <InformesHeader />

      {/* Barra de Controles Desacoplada con Estados Animados Pasados Correctamente */}
      <InformesToolbar
        search={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        onRefresh={data.cargarCatalogos}
        cargando={data.isLoading}
        ordenModificado={data.ordenModificado}
        onGuardarOrden={data.guardarOrdenMasivo}
        onNuevo={form.abrirModalNuevo}
      />

      <main className={styles.mainContent}>
        <InformesGrid
          informes={filteredInformes}
          searchTerm={searchTrimmed}
          draggingIndex={data.draggingIndex}
          onDragStart={data.handleDragStart}
          onDragEnter={data.handleDragEnter}
          onDragEnd={data.handleDragEnd}
          onEditar={form.abrirModalEditar}
          onCreate={form.abrirModalNuevo}
        />
      </main>

      <InformeModal
        modalOpen={form.modalOpen}
        modoEdicion={form.modoEdicion}
        activeTab={form.activeTab}
        setActiveTab={form.setActiveTab}
        formData={form.formData}
        onChange={form.handleChange}
        areas={data.areas}
        cargos={data.cargos}
        cargoFilterArea={form.cargoFilterArea}
        setCargoFilterArea={form.setCargoFilterArea}
        togglePermiso={form.togglePermiso}
        onSave={form.guardarInforme}
        onClose={form.cerrarModal}
      />
    </div>
  );
};

export default AdminInformes;
