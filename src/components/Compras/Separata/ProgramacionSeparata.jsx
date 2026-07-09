import React, { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./ProgramacionSeparata.module.css";
import LoadingScreen from "../../UI/LoadingScreen";
import { apiService } from "../../../services/api";
import { useNotification } from "../../../contexts/NotificationContext";
import { useAuth } from "../../../contexts/AuthContext";
import logo from "../../../assets/images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

// Hooks
import { useSeparatasData } from "./hooks/useSeparatasData";
import { useItemForm } from "./hooks/useItemForm";
import { useTituloEditor } from "./hooks/useTituloEditor";
import { useSidebar } from "./hooks/useSidebar";

// Components
import SeparataHeader from "./components/SeparataHeader";
import SeparataToolbar from "./components/SeparataToolbar";
import SeparataStats from "./components/SeparataStats";
import SeparataSidebar from "./components/SeparataSidebar";
import SeparatasListView from "./components/SeparatasListView";
import SeparataDetailView from "./components/SeparataDetailView";
import EditItemModal from "./components/EditItemModal";
import ExportModal from "./components/ExportModal";
import ItemHistoryModal from "./components/ItemHistoryModal";

// Utils
import { exportarAExcel } from "./utils/excelExport";
import { exportarATxt } from "./utils/txtExport";
import { puedeEditarMeta } from "./utils/permissions";

const ITEMS_PER_PAGE = 12;

/**
 * Orquestador del módulo de Programación de Separatas.
 *
 * Es intencionalmente delgado: coordina hooks y componentes, no contiene
 * lógica de negocio directa (esa vive en los hooks/utils). Estado propio del
 * orquestador: fechas seleccionadas, separata actual, paginación, y modales
 * abiertos.
 */
const ProgramacionSeparata = () => {
  const { addNotification } = useNotification();
  const { user } = useAuth();
  const login = user?.login;

  // Data
  const data = useSeparatasData(addNotification);

  // Estado propio del orquestador
  const [currentSeparata, setCurrentSeparata] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [mostrarBotonReporte, setMostrarBotonReporte] = useState(false);
  const [listasPreciosSeleccionadas, setListasPreciosSeleccionadas] = useState([
    "01",
    "30",
    "50",
    "06",
    "08",
    "13",
    "011",
  ]);

  const sidebar = useSidebar();

  // Al seleccionar una separata, carga sus items y sincroniza fechas.
  const handleSelectSeparata = useCallback(
    async (separata) => {
      setCurrentSeparata(separata);
      setFechaInicio(separata.fecha_inicio);
      setFechaFinal(separata.fecha_final);
      setFechaLimite(separata.fecha_limite_edicion || "");
      await data.fetchSeparataItems(separata.id);
    },
    [data],
  );

  // Item form — necesita saber cuándo se guardó exitosamente para refrescar
  const itemForm = useItemForm({
    currentSeparata,
    fechaInicio,
    fechaFinal,
    fechaLimite,
    login,
    addNotification,
    onSaved: async (response) => {
      if (currentSeparata) {
        await data.fetchSeparataItems(currentSeparata.id);
      } else if (response.data?.separata_id) {
        const nuevaSeparata = {
          id: response.data.separata_id,
          fecha_inicio: fechaInicio,
          fecha_final: fechaFinal,
        };
        await handleSelectSeparata(nuevaSeparata);
        await data.fetchSeparatas();
      }
    },
  });

  // Editor inline de títulos
  const tituloEditor = useTituloEditor({
    login,
    addNotification,
    onUpdated: async (separataId, nuevoTitulo) => {
      await data.fetchSeparatas();
      if (currentSeparata && currentSeparata.id === separataId) {
        setCurrentSeparata({ ...currentSeparata, titulo: nuevoTitulo });
      }
    },
  });

  // Búsqueda de items dentro de la separata actual — trim aplicado
  const searchTrimmed = useMemo(() => searchInput.trim(), [searchInput]);

  const filteredItems = useMemo(() => {
    if (!searchTrimmed) return data.separataItems;
    const searchLower = searchTrimmed.toLowerCase();
    return data.separataItems.filter((item) =>
      Object.values(item).some(
        (value) =>
          value && value.toString().toLowerCase().includes(searchLower),
      ),
    );
  }, [data.separataItems, searchTrimmed]);

  const paginationData = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    return {
      currentItems,
      totalPages,
      hasItems: filteredItems.length > 0,
    };
  }, [filteredItems, currentPage]);

  // Carga inicial
  useEffect(() => {
    data.fetchSeparatas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling cada 5s
  useEffect(() => {
    data.startPolling({ currentSeparata });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSeparata]);

  // Debounce 800ms para verificar separata existente al cambiar fechas
  useEffect(() => {
    if (!fechaInicio || !fechaFinal || currentSeparata) return;
    const timer = setTimeout(() => {
      data.checkExistingSeparata(
        fechaInicio,
        fechaFinal,
        currentSeparata,
        handleSelectSeparata,
      );
    }, 800);
    return () => clearTimeout(timer);
  }, [fechaInicio, fechaFinal, currentSeparata, data, handleSelectSeparata]);

  // Mostrar botón de reporte si la fecha final ya pasó
  useEffect(() => {
    if (currentSeparata?.fecha_final) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaFinalObj = new Date(currentSeparata.fecha_final);
      fechaFinalObj.setHours(0, 0, 0, 0);
      setMostrarBotonReporte(hoy > fechaFinalObj);
    } else {
      setMostrarBotonReporte(false);
    }
  }, [currentSeparata]);

  // ==================== Handlers ====================

  const handleDateChange = (field, value) => {
    if (field === "inicio") setFechaInicio(value);
    if (field === "final") setFechaFinal(value);
    setCurrentPage(1);
  };

  const handleBackToSeparatas = () => {
    setCurrentSeparata(null);
    data.setSeparataItems([]);
    setCurrentPage(1);
    setFechaInicio("");
    setFechaFinal("");
    setFechaLimite("");
    itemForm.resetForm();
  };

  const handleUpdateItem = async (itemData) => {
    try {
      const payload = {
        id: editingItem.id,
        descuento: itemData.descuento,
        precio_antes: itemData.precio_regular,
        precio_ahora: itemData.precio_ahora,
        usuario: login,
      };

      const response = await apiService.updateSeparataItem(payload);

      if (response.success) {
        addNotification({
          message: response.message || "Ítem actualizado correctamente",
          type: "success",
        });
        setEditingItem(null);
        if (currentSeparata) {
          await data.fetchSeparataItems(currentSeparata.id);
        }
      } else {
        addNotification({
          message: response.message || "Error al actualizar el item",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error en handleUpdateItem:", error);
      if (error.response) {
        addNotification({
          message: error.response.data?.message || "Error del servidor",
          type: "error",
        });
      } else if (error.request) {
        addNotification({
          message: "Error de conexión al actualizar el item",
          type: "error",
        });
      } else {
        addNotification({
          message: "Error actualizando item: " + error.message,
          type: "error",
        });
      }
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("¿Está seguro de eliminar este ítem?")) return;

    try {
      const response = await apiService.deleteSeparataItem(itemId, login);

      if (response.success) {
        addNotification({
          message: response.message || "Ítem eliminado correctamente",
          type: "success",
        });
        if (currentSeparata) {
          await data.fetchSeparataItems(currentSeparata.id);
        }
      } else {
        addNotification({
          message: response.message || "Error al eliminar el item",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error en handleDeleteItem:", error);
      if (error.response) {
        addNotification({
          message: error.response.message || "Error del servidor",
          type: "error",
        });
      } else if (error.request) {
        addNotification({
          message: "Error de conexión al eliminar el item",
          type: "error",
        });
      } else {
        addNotification({
          message: "Error eliminando item: " + error.message,
          type: "error",
        });
      }
    }
  };

  const handleUpdateFechaLimite = async () => {
    if (!currentSeparata || !puedeEditarMeta(login)) return;

    try {
      const response = await apiService.updateFechaLimite(
        currentSeparata.id,
        fechaLimite,
      );

      if (response.success) {
        addNotification({
          message: response.message || "Fecha límite actualizada correctamente",
          type: "success",
        });
        setCurrentSeparata({
          ...currentSeparata,
          fecha_limite_edicion: fechaLimite,
        });
      } else {
        addNotification({
          message: response.message || "Error al actualizar la fecha límite",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error en handleUpdateFechaLimite:", error);
      addNotification({
        message: error.message || "Error actualizando fecha límite",
        type: "error",
      });
    }
  };

  const descargarReporteVentas = async () => {
    if (!currentSeparata) return;

    try {
      const blob = await apiService.downloadReporteVentas(currentSeparata.id);
      const fechaInicioFormateada = currentSeparata.fecha_inicio.replace(
        /-/g,
        "",
      );
      const fechaFinalFormateada = currentSeparata.fecha_final.replace(
        /-/g,
        "",
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `reporte_ventas_${fechaInicioFormateada}_${fechaFinalFormateada}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      addNotification({
        message: "Reporte de ventas descargado correctamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error descargando reporte:", error);
      addNotification({
        message: error.message || "Error al descargar el reporte de ventas",
        type: "error",
      });
    }
  };

  const validarFechas = () => {
    let mensajeError = "";
    if (
      fechaInicio &&
      fechaFinal &&
      new Date(fechaFinal) < new Date(fechaInicio)
    ) {
      mensajeError = "La fecha final no puede ser anterior a la fecha inicial";
    }
    if (
      fechaLimite &&
      fechaInicio &&
      new Date(fechaLimite) > new Date(fechaInicio)
    ) {
      mensajeError = mensajeError
        ? `${mensajeError} | La fecha límite no puede ser posterior a la fecha de inicio`
        : "La fecha límite no puede ser posterior a la fecha de inicio";
    }
    return mensajeError;
  };

  const errorFecha = validarFechas();

  // ==================== Render ====================

  if (data.loading && data.separatas.length === 0) {
    return (
      <LoadingScreen
        isVisible={true}
        title="Cargando separatas"
        subtitle="Sincronizando el repositorio corporativo..."
        variant="fullscreen"
      />
    );
  }

  const totalPaginasStats = currentSeparata
    ? paginationData.totalPages
    : Math.ceil(data.separatas.length / ITEMS_PER_PAGE);

  return (
    <div className={styles.container}>
      <SeparataHeader />

      <SeparataToolbar
        fechaInicio={fechaInicio}
        fechaFinal={fechaFinal}
        onFechaChange={handleDateChange}
        onRefresh={
          currentSeparata
            ? () => data.fetchSeparataItems(currentSeparata.id)
            : data.fetchSeparatas
        }
        onOpenHistory={() => setShowHistoryModal(true)}
        sidebarVisible={sidebar.visible}
        onToggleSidebar={sidebar.toggle}
        toggleRef={sidebar.toggleRef}
        cargando={data.loading}
      />

      <SeparataStats
        totalSeparatas={data.separatas.length}
        totalItems={data.separataItems.length}
        totalPaginas={totalPaginasStats}
      />

      <div className={styles.mainLayout}>
        <SeparataSidebar
          sidebarRef={sidebar.sidebarRef}
          visible={sidebar.visible}
          onClose={sidebar.close}
          currentSeparata={currentSeparata}
          login={login}
          fechaLimite={fechaLimite}
          onFechaLimiteChange={setFechaLimite}
          onSaveFechaLimite={handleUpdateFechaLimite}
          itemForm={itemForm}
          errorFecha={errorFecha}
        />

        <div className={styles.mainContent}>
          {/* Búsqueda de items dentro de la separata (solo en vista detalle) */}
          {currentSeparata && (
            <div className={styles.itemsSearchBar}>
              <FontAwesomeIcon
                icon={faSearch}
                className={styles.searchListIcon}
              />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Buscar en items de esta separata..."
                value={searchInput}
                onChange={(e) => {
                  // Bloquea espacios al inicio en tiempo real
                  setSearchInput(e.target.value.replace(/^\s+/, ""));
                  setCurrentPage(1);
                }}
              />
            </div>
          )}

          <div className={styles.content}>
            {currentSeparata ? (
              <SeparataDetailView
                separata={currentSeparata}
                items={paginationData.currentItems}
                paginationData={paginationData}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onBack={handleBackToSeparatas}
                onEditItem={setEditingItem}
                onDeleteItem={handleDeleteItem}
                login={login}
                onExport={() => setShowExportModal(true)}
                onDownloadReport={descargarReporteVentas}
                mostrarBotonReporte={mostrarBotonReporte}
                tituloEditor={tituloEditor}
              />
            ) : (
              <SeparatasListView
                separatas={data.separatas}
                onSelectSeparata={handleSelectSeparata}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                tituloEditor={tituloEditor}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleUpdateItem}
        />
      )}

      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          listasPrecios={listasPreciosSeleccionadas}
          onListasChange={setListasPreciosSeleccionadas}
          itemsSeparata={data.separataItems}
          onExportTxt={(tipo) =>
            exportarATxt({
              tipoPrecio: tipo,
              currentSeparata,
              separataItems: data.separataItems,
              listasPreciosSeleccionadas,
              addNotification,
            })
          }
          onExportExcel={() =>
            exportarAExcel({
              currentSeparata,
              separataItems: data.separataItems,
              logo,
              addNotification,
            })
          }
        />
      )}

      {showHistoryModal && (
        <ItemHistoryModal onClose={() => setShowHistoryModal(false)} />
      )}
    </div>
  );
};

export default ProgramacionSeparata;
