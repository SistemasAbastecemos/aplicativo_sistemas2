import React, { useEffect, useState, useCallback } from "react";
import { apiService } from "../../../services/api";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";
import styles from "./AdministrarItems.module.css";
import {
  faBox,
  faSearch,
  faPlus,
  faEdit,
  faTimes,
  faSave,
  faCalendarAlt,
  faUser,
  faFileAlt,
  faCheckCircle,
  faChevronLeft,
  faChevronRight,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DIAS = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const AdminItems = () => {
  const { addNotification } = useNotification();
  const [items, setItems] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState(null);
  const [previousDias, setPreviousDias] = useState([]);

  const fetchItems = useCallback(
    async (page = 1, searchText = "") => {
      setCargando(true);
      try {
        const response = await apiService.getItemsFruver(page, 20, searchText);
        if (response.success) {
          setItems(response.data.items);
          setPagina(response.data.paginacion.pagina_actual);
          setTotalPaginas(response.data.paginacion.total_paginas);
        } else {
          addNotification({
            message: "Error cargando items",
            type: "error",
          });
        }
      } catch (error) {
        addNotification({
          message: "Error cargando items: " + (error.message || error),
          type: "error",
        });
      } finally {
        setCargando(false);
      }
    },
    [addNotification]
  );

  useEffect(() => {
    fetchItems(pagina, search);
  }, [fetchItems, pagina]);

  const removeAccents = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (searchTimeout) clearTimeout(searchTimeout);

    setSearchTimeout(
      setTimeout(() => {
        setPagina(1);
        fetchItems(1, value);
      }, 500)
    );
  };

  const handleEditItem = (item) => {
    const dias = item.dias_pedido
      ? item.dias_pedido
          .split(",")
          .map((d) => removeAccents(d.trim().toLowerCase()))
      : [];
    setPreviousDias(dias);
    setEditItem({ ...item, dias });
    setNewItem(null);
  };

  const handleNewItem = () => {
    setNewItem({
      item: "",
      descripcion: "",
      dias: [],
      comprador: "",
      observaciones: "",
      administrador: "0",
    });
    setEditItem(null);
  };

  const handleCancel = () => {
    setEditItem(null);
    setNewItem(null);
  };

  const toggleDay = (dia, payload) => {
    const dias = payload.dias.includes(dia)
      ? payload.dias.filter((d) => d !== dia)
      : [...payload.dias, dia];
    editItem
      ? setEditItem({ ...editItem, dias })
      : setNewItem({ ...newItem, dias });
  };

  const toggleAdminCheckbox = (e) => {
    const isChecked = e.target.checked ? "1" : "0";
    if (editItem) {
      setEditItem({
        ...editItem,
        administrador: isChecked,
        dias: isChecked === "1" ? previousDias : [],
      });
    }
    if (newItem) {
      setNewItem({
        ...newItem,
        administrador: isChecked,
        dias: isChecked === "1" ? newItem.dias : [],
      });
    }
  };

  const handleSaveItem = async () => {
    try {
      const payload = editItem || newItem;
      if (!payload.item || !payload.descripcion || !payload.comprador) {
        addNotification({
          message: "Completa los campos obligatorios",
          type: "warning",
        });
        return;
      }
      if (payload.administrador === "1" && payload.dias.length === 0) {
        addNotification({
          message: "Selecciona al menos un día",
          type: "warning",
        });
        return;
      }

      const diasString = payload.dias.map(removeAccents).join(",");
      const data = { ...payload, dias_pedido: diasString };

      setCargando(true);
      if (editItem) {
        await apiService.updateItemFruver(data);
        addNotification({
          message: "Item editado correctamente",
          type: "success",
        });
      } else {
        await apiService.createItemFruver(data);
        addNotification({
          message: "Item creado correctamente",
          type: "success",
        });
      }

      handleCancel();
      fetchItems(pagina, search);
    } catch (error) {
      addNotification({
        message: "Error guardando item: " + error.message,
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const handleRefresh = () => {
    setPagina(1);
    setSearch("");
    fetchItems(1, "");
  };

  const resetFilters = useCallback(() => {
    setSearch("");
    setPagina(1);
    fetchItems(1, "");
  }, [fetchItems]);

  if (cargando && !editItem && !newItem)
    return <LoadingScreen message="Cargando Items..." />;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Gestión de Items Fruver</h1>
          <p className={styles.subtitle}>
            Administra y organiza los items del inventario fruver
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filters}>
          <div className={styles.searchContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por item, descripción o comprador..."
              value={search}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>

          <button
            className={styles.refreshButton}
            onClick={handleRefresh}
            title="Actualizar datos"
            disabled={cargando}
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
        </div>

        <button className={styles.newButton} onClick={handleNewItem}>
          <FontAwesomeIcon icon={faPlus} />
          Nuevo Item
        </button>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{items.length}</span>
          <span className={styles.statLabel}>Items totales</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {items.filter((item) => item.administrador === "1").length}
          </span>
          <span className={styles.statLabel}>Con administrador</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalPaginas}</span>
          <span className={styles.statLabel}>Páginas</span>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {items.length > 0 ? (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Descripción</th>
                    <th>Administrador</th>
                    <th>Días de Pedido</th>
                    <th>Comprador</th>
                    <th>Observaciones</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.item} className={styles.tableRow}>
                      <td className={styles.itemCode}>{item.item}</td>
                      <td className={styles.itemDescription}>
                        {item.descripcion}
                      </td>
                      <td>
                        <span
                          className={`${styles.adminBadge} ${
                            item.administrador === "1"
                              ? styles.adminActive
                              : styles.adminInactive
                          }`}
                        >
                          {item.administrador === "1" ? (
                            <FontAwesomeIcon icon={faCheckCircle} />
                          ) : (
                            <FontAwesomeIcon icon={faTimes} />
                          )}
                          {item.administrador === "1" ? "Sí" : "No"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.daysContainer}>
                          {item.dias_pedido ? (
                            item.dias_pedido.split(",").map((dia, index) => (
                              <span key={index} className={styles.dayTag}>
                                {dia.trim()}
                              </span>
                            ))
                          ) : (
                            <span className={styles.noDays}>-</span>
                          )}
                        </div>
                      </td>
                      <td className={styles.comprador}>{item.comprador}</td>
                      <td className={styles.observaciones}>
                        {item.observaciones || "-"}
                      </td>
                      <td>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEditItem(item)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPaginas > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  onClick={() => setPagina((p) => p - 1)}
                  disabled={pagina === 1}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                  Anterior
                </button>

                <div className={styles.paginationInfo}>
                  Página <strong>{pagina}</strong> de{" "}
                  <strong>{totalPaginas}</strong>
                </div>

                <button
                  className={styles.paginationButton}
                  onClick={() => setPagina((p) => p + 1)}
                  disabled={pagina === totalPaginas}
                >
                  Siguiente
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faBox} className={styles.emptyIcon} />
            <h3>No hay items disponibles</h3>
            <p>
              No se encontraron items con los criterios de búsqueda actuales
            </p>
            <button className={styles.newButton} onClick={handleNewItem}>
              <FontAwesomeIcon icon={faPlus} />
              Crear primer item
            </button>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {(editItem || newItem) && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>
                <FontAwesomeIcon icon={editItem ? faEdit : faPlus} />
                {editItem ? "Editar Item" : "Nuevo Item"}
              </h2>
              <button className={styles.closeButton} onClick={handleCancel}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <input
                    type="text"
                    value={editItem?.item || newItem?.item || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d{0,6}$/.test(val)) {
                        editItem
                          ? setEditItem({ ...editItem, item: val })
                          : setNewItem({ ...newItem, item: val });
                      }
                    }}
                    disabled={!!editItem}
                    className={styles.formInput}
                    placeholder="Ingresa el código del item"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faBox} />
                    Código Item *
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <input
                    type="text"
                    value={editItem?.descripcion || newItem?.descripcion || ""}
                    onChange={(e) =>
                      editItem
                        ? setEditItem({
                            ...editItem,
                            descripcion: e.target.value.toUpperCase(),
                          })
                        : setNewItem({
                            ...newItem,
                            descripcion: e.target.value.toUpperCase(),
                          })
                    }
                    className={styles.formInput}
                    placeholder="Descripción del item"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faFileAlt} />
                    Descripción *
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <input
                    type="text"
                    value={editItem?.comprador || newItem?.comprador || ""}
                    onChange={(e) =>
                      editItem
                        ? setEditItem({
                            ...editItem,
                            comprador: e.target.value,
                          })
                        : setNewItem({ ...newItem, comprador: e.target.value })
                    }
                    className={styles.formInput}
                    placeholder="Nombre del comprador"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faUser} />
                    Comprador *
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={
                        editItem?.administrador === "1" ||
                        newItem?.administrador === "1"
                      }
                      onChange={toggleAdminCheckbox}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxCustom}></span>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Item con Administrador
                  </label>
                </div>
              </div>

              <div className={styles.daysSection}>
                <label className={styles.sectionLabel}>
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  Días de Pedido
                </label>
                <div className={styles.daysGrid}>
                  {DIAS.map((dia) => (
                    <label key={dia} className={styles.dayCheckbox}>
                      <input
                        type="checkbox"
                        disabled={
                          editItem?.administrador !== "1" &&
                          newItem?.administrador !== "1"
                        }
                        checked={(
                          editItem?.dias ||
                          newItem?.dias ||
                          []
                        ).includes(dia)}
                        onChange={() => toggleDay(dia, editItem || newItem)}
                        className={styles.dayInput}
                      />
                      <span className={styles.dayCustomCheckbox}></span>
                      <span className={styles.dayName}>
                        {dia.charAt(0).toUpperCase() + dia.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={`${styles.formGroup} ${styles.floating}`}>
                <textarea
                  rows={3}
                  value={
                    editItem?.observaciones || newItem?.observaciones || ""
                  }
                  onChange={(e) =>
                    editItem
                      ? setEditItem({
                          ...editItem,
                          observaciones: e.target.value,
                        })
                      : setNewItem({
                          ...newItem,
                          observaciones: e.target.value,
                        })
                  }
                  className={styles.formTextarea}
                  placeholder="Observaciones adicionales..."
                />
                <label className={styles.formLabel}>Observaciones</label>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={handleCancel}>
                <FontAwesomeIcon icon={faTimes} />
                Cancelar
              </button>
              <button className={styles.saveButton} onClick={handleSaveItem}>
                <FontAwesomeIcon icon={faSave} />
                {editItem ? "Actualizar Item" : "Crear Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminItems;
