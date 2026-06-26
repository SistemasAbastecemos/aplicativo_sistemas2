import React, { useState, useEffect, useMemo, useRef } from "react";
import { apiService } from "../../../services/api";
import { useNotification } from "../../../contexts/NotificationContext";
import styles from "./Informes.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTimes,
  faSave,
  faSearch,
  faSyncAlt,
  faDatabase,
  faUserShield,
  faCheckCircle,
  faTimesCircle,
  faGripVertical,
} from "@fortawesome/free-solid-svg-icons";

const AdminInformes = () => {
  const [informes, setInformes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ordenModificado, setOrdenModificado] = useState(false);
  const { addNotification } = useNotification();

  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("datos");
  const [cargoFilterArea, setCargoFilterArea] = useState("");

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [draggingIndex, setDraggingIndex] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    titulo: "",
    descripcion: "",
    id_area: "",
    url: "",
    color: "#3b82f6",
    orden: 0,
    activo: 1,
    permisos: { areas: [], cargos: [] },
  });

  useEffect(() => {
    cargarDatosPrincipales();
  }, []);

  const cargarDatosPrincipales = async () => {
    setIsLoading(true);
    try {
      const [resInformes, resAreas, resCargos] = await Promise.all([
        apiService.getInformes(),
        apiService.getAreas(),
        apiService.getCargos(),
      ]);
      setInformes(resInformes.data || []);
      setAreas(resAreas.data || resAreas || []);
      setCargos(resCargos.data || resCargos || []);
      setOrdenModificado(false);
    } catch (error) {
      addNotification({ message: "Error sincronizando datos", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInformes = useMemo(() => {
    return informes.filter(
      (inf) =>
        inf.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inf.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [informes, searchTerm]);

  const filteredCargos = useMemo(() => {
    if (!cargoFilterArea) return cargos;
    return cargos.filter((c) => c.id_area == cargoFilterArea);
  }, [cargos, cargoFilterArea]);

  const dragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move";

    // El setTimeout es crucial. Permite al navegador generar la "imagen fantasma"
    // del arrastre con el diseño original antes de aplicar la opacidad a la fila base.
    setTimeout(() => {
      setDraggingIndex(index);
    }, 0);
  };

  const dragEnter = (e, index) => {
    e.preventDefault();

    // Si el elemento arrastrado pasa sobre un indice diferente, intercambiamos la posicion en el estado
    if (dragItem.current !== null && dragItem.current !== index) {
      const copyListItems = [...informes];
      const dragItemContent = copyListItems[dragItem.current];

      copyListItems.splice(dragItem.current, 1);
      copyListItems.splice(index, 0, dragItemContent);

      dragItem.current = index;
      setDraggingIndex(index); // Mantenemos el estilo de "arrastre" en la nueva posicion
      setInformes(copyListItems);
    }
  };

  const dragEnd = (e) => {
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingIndex(null);

    // Recalculamos el campo 'orden' para la base de datos basado en el nuevo indice del array
    const updatedList = informes.map((item, idx) => ({
      ...item,
      orden: idx + 1,
    }));

    setInformes(updatedList);
    setOrdenModificado(true);
  };

  const guardarOrdenamientoMasivo = async () => {
    setIsLoading(true);
    try {
      const payload = informes.map((inf) => ({ id: inf.id, orden: inf.orden }));
      await apiService.updateInformeBulkOrder(payload);
      addNotification({
        message: "Orden de ejecucion sincronizado",
        type: "success",
      });
      setOrdenModificado(false);
      cargarDatosPrincipales();
    } catch (error) {
      addNotification({ message: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const abrirModal = (informe = null) => {
    setActiveTab("datos");
    setCargoFilterArea("");
    if (informe) {
      setFormData({
        id: informe.id,
        titulo: informe.titulo,
        descripcion: informe.descripcion,
        id_area: informe.id_area,
        url: informe.url,
        color: informe.color,
        orden: informe.orden,
        activo: informe.activo,
        permisos: {
          areas: informe.permisos?.areas || [],
          cargos: informe.permisos?.cargos || [],
        },
      });
    } else {
      setFormData({
        id: null,
        titulo: "",
        descripcion: "",
        id_area: "",
        url: "",
        color: "#3b82f6",
        orden:
          informes.length > 0
            ? Math.max(...informes.map((i) => i.orden)) + 1
            : 1,
        activo: 1,
        permisos: { areas: [], cargos: [] },
      });
    }
    setModalOpen(true);
  };

  const handleGuardar = async () => {
    if (!formData.titulo || !formData.url || !formData.id_area) {
      addNotification({
        message: "Complete los campos obligatorios",
        type: "warning",
      });
      return;
    }
    try {
      if (formData.id) {
        await apiService.updateInforme(formData.id, formData);
        addNotification({
          message: "Configuracion actualizada",
          type: "success",
        });
      } else {
        await apiService.createInforme(formData);
        addNotification({ message: "Informe registrado", type: "success" });
      }
      setModalOpen(false);
      cargarDatosPrincipales();
    } catch (error) {
      addNotification({ message: error.message, type: "error" });
    }
  };

  const togglePermiso = (tipo, idElemento) => {
    setFormData((prev) => {
      const currentList = prev.permisos[tipo];
      const isSelected = currentList.includes(idElemento);
      return {
        ...prev,
        permisos: {
          ...prev.permisos,
          [tipo]: isSelected
            ? currentList.filter((id) => id !== idElemento)
            : [...currentList, idElemento],
        },
      };
    });
  };

  const handleToggleAll = (tipo, listaElementos) => {
    if (!listaElementos || listaElementos.length === 0) return;

    setFormData((prev) => {
      const actuales = prev.permisos[tipo];
      const idsElementos = listaElementos.map((e) => Number(e.id));

      const todosSeleccionados = idsElementos.every((id) =>
        actuales.includes(id),
      );

      let nuevosPermisos;
      if (todosSeleccionados) {
        nuevosPermisos = actuales.filter((id) => !idsElementos.includes(id));
      } else {
        nuevosPermisos = [...new Set([...actuales, ...idsElementos])];
      }

      return {
        ...prev,
        permisos: {
          ...prev.permisos,
          [tipo]: nuevosPermisos,
        },
      };
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitleBlock}>
          <h2>Gestion de Informes Bi</h2>
          <p className={styles.subtitle}>
            Administracion jerarquica y asignacion de atributos de acceso
          </p>
        </div>
        <div className={styles.headerActions}>
          {ordenModificado && (
            <button
              onClick={guardarOrdenamientoMasivo}
              className={styles.btnWarning}
            >
              <FontAwesomeIcon icon={faSave} /> Guardar Orden
            </button>
          )}
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por titulo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={cargarDatosPrincipales}
            className={styles.btnSecondary}
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
          <button onClick={() => abrirModal()} className={styles.btnPrimary}>
            <FontAwesomeIcon icon={faPlus} /> Nuevo
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "40px" }}></th>
              <th>Titulo</th>
              <th>Area Dueña</th>
              <th>Orden</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredInformes.map((inf, index) => {
              const isDraggable = searchTerm === "";

              return (
                <tr
                  key={inf.id}
                  draggable={isDraggable}
                  onDragStart={(e) => isDraggable && dragStart(e, index)}
                  onDragEnter={(e) => isDraggable && dragEnter(e, index)}
                  onDragEnd={(e) => isDraggable && dragEnd(e)}
                  onDragOver={(e) => e.preventDefault()}
                  className={`
                  ${isDraggable ? styles.draggableRow : ""} 
                  ${draggingIndex === index ? styles.draggingRow : ""}
                `}
                >
                  <td className={styles.dragHandle}>
                    {isDraggable && <FontAwesomeIcon icon={faGripVertical} />}
                  </td>
                  <td data-label="Titulo">
                    <div className={styles.infoBlock}>
                      <span
                        className={styles.colorIndicator}
                        style={{ backgroundColor: inf.color }}
                      ></span>
                      <div>
                        <strong>{inf.titulo}</strong>
                        <span className={styles.subtext}>
                          {inf.descripcion}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td data-label="Area Dueña">{inf.area_nombre}</td>
                  <td data-label="Orden">{inf.orden}</td>
                  <td data-label="Estado">
                    {inf.activo ? (
                      <span className={styles.badgeActive}>
                        <FontAwesomeIcon icon={faCheckCircle} /> Activo
                      </span>
                    ) : (
                      <span className={styles.badgeInactive}>
                        <FontAwesomeIcon icon={faTimesCircle} /> Inactivo
                      </span>
                    )}
                  </td>
                  <td data-label="Acciones">
                    <button
                      onClick={() => abrirModal(inf)}
                      className={styles.btnAction}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Renderizado del Modal se mantiene exactamente igual al codigo anterior */}
      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            {/* ... Contenido del modal ... */}
            <div className={styles.modalHeader}>
              <h3>
                {formData.id
                  ? "Modificar Configuracion"
                  : "Registro de Informe"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className={styles.btnClose}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.modalTabs}>
              <button
                className={
                  activeTab === "datos" ? styles.tabActive : styles.tab
                }
                onClick={() => setActiveTab("datos")}
              >
                <FontAwesomeIcon icon={faDatabase} /> Metadatos
              </button>
              <button
                className={
                  activeTab === "permisos" ? styles.tabActive : styles.tab
                }
                onClick={() => setActiveTab("permisos")}
              >
                <FontAwesomeIcon icon={faUserShield} /> Politicas de Acceso
              </button>
            </div>

            <div className={styles.modalBody}>
              {activeTab === "datos" && (
                <div className={styles.formGrid}>
                  <div className={`${styles.formGroup} ${styles.floating}`}>
                    <input
                      type="text"
                      value={formData.titulo}
                      placeholder=" "
                      onChange={(e) =>
                        setFormData({ ...formData, titulo: e.target.value })
                      }
                    />
                    <label>Título *</label>
                  </div>

                  <div className={`${styles.formGroup} ${styles.floating}`}>
                    <select
                      value={formData.id_area}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          id_area: Number(e.target.value),
                        })
                      }
                    >
                      <option value="">Seleccione...</option>
                      {areas.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nombre}
                        </option>
                      ))}
                    </select>
                    <label>Área Responsable *</label>
                  </div>

                  <div className={`${styles.formGroupFull} ${styles.floating}`}>
                    <input
                      type="text"
                      value={formData.url}
                      placeholder=" "
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                    />
                    <label>URL de Inserción Power BI *</label>
                  </div>

                  <div className={`${styles.formGroupFull} ${styles.floating}`}>
                    <input
                      type="text"
                      value={formData.descripcion}
                      placeholder=" "
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          descripcion: e.target.value,
                        })
                      }
                    />
                    <label>Descripción de la métrica</label>
                  </div>

                  <div className={`${styles.formGroup} ${styles.floating}`}>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className={styles.colorPicker}
                    />
                    <label>Color Corporativo</label>
                  </div>

                  <div className={`${styles.formGroup} ${styles.floating}`}>
                    <input
                      type="number"
                      value={formData.orden}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          orden: Number(e.target.value),
                        })
                      }
                    />
                    <label>Índice de Orden</label>
                  </div>

                  <div className={`${styles.formGroup} ${styles.floating}`}>
                    <select
                      value={formData.activo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          activo: Number(e.target.value),
                        })
                      }
                    >
                      <option value={1}>Operativo</option>
                      <option value={0}>Suspendido</option>
                    </select>
                    <label>Estado del Módulo</label>
                  </div>
                </div>
              )}

              {activeTab === "permisos" && (
                <div className={styles.permisosLayout}>
                  <div className={styles.permisosSection}>
                    <div className={styles.headerLine}>
                      <h4>Areas con Acceso Total</h4>
                      <button
                        className={styles.btnToggleAll}
                        onClick={() => handleToggleAll("areas", areas)}
                      >
                        {areas.length > 0 &&
                        areas.every((a) =>
                          formData.permisos.areas.includes(Number(a.id)),
                        )
                          ? "Desmarcar todas"
                          : "Marcar todas"}
                      </button>
                    </div>
                    <p className={styles.helperText}>
                      Los usuarios pertenecientes a estas areas podran
                      visualizar el informe sin importar su cargo.
                    </p>
                    <div className={styles.checkboxGrid}>
                      {areas.map((a) => (
                        <label
                          key={`area-${a.id}`}
                          className={styles.checkboxItem}
                        >
                          <input
                            type="checkbox"
                            checked={formData.permisos.areas.includes(
                              Number(a.id),
                            )}
                            onChange={() =>
                              togglePermiso("areas", Number(a.id))
                            }
                          />{" "}
                          {a.nombre}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className={styles.permisosSection}>
                    <div className={styles.headerLine}>
                      <h4>Cargos Especificos</h4>
                      <button
                        className={styles.btnToggleAll}
                        onClick={() =>
                          handleToggleAll("cargos", filteredCargos)
                        }
                      >
                        {filteredCargos.length > 0 &&
                        filteredCargos.every((c) =>
                          formData.permisos.cargos.includes(Number(c.id)),
                        )
                          ? "Desmarcar filtrados"
                          : "Marcar filtrados"}
                      </button>
                    </div>
                    <div className={styles.filterInline}>
                      <select
                        value={cargoFilterArea}
                        onChange={(e) => setCargoFilterArea(e.target.value)}
                      >
                        <option value="">Filtrar cargos por area...</option>
                        {areas.map((a) => (
                          <option key={`filt-${a.id}`} value={a.id}>
                            {a.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.checkboxGrid}>
                      {filteredCargos.map((c) => (
                        <label
                          key={`cargo-${c.id}`}
                          className={styles.checkboxItem}
                        >
                          <input
                            type="checkbox"
                            checked={formData.permisos.cargos.includes(
                              Number(c.id),
                            )}
                            onChange={() =>
                              togglePermiso("cargos", Number(c.id))
                            }
                          />{" "}
                          {c.descripcion}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => setModalOpen(false)}
                className={styles.btnSecondary}
              >
                Descartar
              </button>
              <button onClick={handleGuardar} className={styles.btnPrimary}>
                <FontAwesomeIcon icon={faSave} /> Confirmar Transaccion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInformes;
