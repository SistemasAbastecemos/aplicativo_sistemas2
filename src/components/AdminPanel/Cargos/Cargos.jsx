import React, { useEffect, useState, useCallback, useMemo } from "react";
import styles from "./Cargos.module.css";
import { apiService } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";
import {
  faSearch,
  faSyncAlt,
  faUserPlus,
  faEdit,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faCheckCircle,
  faTimesCircle,
  faBriefcase,
  faLayerGroup,
  faChartSimple,
  faFileLines,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Cargos = () => {
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotification();

  // Estados principales
  const [cargos, setCargos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalCargos, setTotalCargos] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Estados del modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargoActual, setCargoActual] = useState(null);

  // Datos del formulario
  const [formData, setFormData] = useState({
    id_area: "",
    nombre: "",
    descripcion: "",
    nivel: 1,
    activo: 1,
  });

  const esAdministrador = currentUser && currentUser.id_rol === 1;

  // Memoized computed values
  const camposIncompletos = useMemo(
    () =>
      !formData.nombre.trim() ||
      !formData.descripcion.trim() ||
      !formData.id_area,
    [formData.nombre, formData.descripcion, formData.id_area]
  );

  const cargosFiltrados = useMemo(() => {
    if (!search) return cargos;

    const texto = search.toLowerCase();
    return cargos.filter(
      (c) =>
        Object.values(c).some(
          (value) => value && value.toString().toLowerCase().includes(texto)
        ) ||
        (areas.find((a) => a.id === c.id_area)?.nombre || "")
          .toLowerCase()
          .includes(texto)
    );
  }, [cargos, search, areas]);

  // Efectos
  useEffect(() => {
    if (esAdministrador) {
      cargarAreas();
      cargarCargos(pagina, search);
    }
  }, [esAdministrador]);

  useEffect(() => {
    if (esAdministrador) {
      cargarCargos(pagina, search);
    }
  }, [pagina, esAdministrador]);

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Funciones principales
  const cargarAreas = async () => {
    try {
      const data = await apiService.getAreas(false);
      setAreas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando áreas:", err);
      addNotification({ message: "Error cargando áreas", type: "error" });
    }
  };

  const cargarCargos = async (page = 1, searchText = "") => {
    setCargando(true);
    try {
      const data = await apiService.getCargos(false, page, searchText);

      // Adaptar según la estructura de respuesta de tu API
      if (data.data && data.data.cargos) {
        setCargos(data.data.cargos || []);
        setTotalPaginas(data.data.paginacion?.total_paginas || 1);
        setTotalCargos(data.data.paginacion?.total_cargos || 0);
      } else if (Array.isArray(data)) {
        setCargos(data);
        setTotalPaginas(1);
        setTotalCargos(data.length);
      } else if (data.cargos) {
        setCargos(data.cargos || []);
        setTotalPaginas(data.paginacion?.total_paginas || 1);
        setTotalCargos(data.paginacion?.total_cargos || 0);
      } else {
        setCargos([]);
        setTotalPaginas(1);
        setTotalCargos(0);
      }
    } catch (error) {
      console.error("Error cargando cargos:", error);
      addNotification({ message: "Error cargando cargos", type: "error" });
    } finally {
      setCargando(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const newTimeout = setTimeout(() => {
      setPagina(1);
      cargarCargos(1, value);
    }, 500);

    setSearchTimeout(newTimeout);
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setCargoActual(null);
    setFormData({
      id_area: "",
      nombre: "",
      descripcion: "",
      nivel: 1,
      activo: 1,
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (cargo) => {
    setModoEdicion(true);
    setCargoActual(cargo);
    setFormData({
      id_area: cargo.id_area ?? "",
      nombre: cargo.nombre ?? "",
      descripcion: cargo.descripcion ?? "",
      nivel: cargo.nivel ?? 1,
      activo: Number(cargo.activo ?? 1),
      id: cargo.id,
    });
    setMostrarModal(true);
  };

  const guardarCargo = async () => {
    try {
      if (!formData.nombre || formData.nombre.trim() === "") {
        addNotification({ message: "El nombre es obligatorio", type: "error" });
        return;
      }

      if (camposIncompletos) {
        addNotification({
          message: "Por favor complete todos los campos obligatorios",
          type: "error",
        });
        return;
      }

      if (modoEdicion) {
        await apiService.updateCargo(formData.id, formData);
        addNotification({
          message: "Cargo actualizado correctamente",
          type: "success",
        });
      } else {
        await apiService.createCargo(formData);
        addNotification({
          message: "Cargo creado correctamente",
          type: "success",
        });
      }
      setMostrarModal(false);
      cargarCargos(pagina, search);
    } catch (error) {
      console.error("Error guardando cargo:", error);
      addNotification({
        message: "Error guardando cargo: " + (error.message || ""),
        type: "error",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "activo" || name === "nivel" || name === "id_area"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const resetFilters = useCallback(() => {
    setSearch("");
    setPagina(1);
    cargarCargos(1, "");
  }, []);

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

  if (cargando && pagina === 1) {
    return <LoadingScreen message="Cargando cargos..." />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Gestión de Cargos</h1>
          <p className={styles.subtitle}>
            Administra y gestiona los cargos organizacionales
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filters}>
          <div className={styles.searchGroup}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar cargos, área o nivel..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <button
            className={styles.refreshButton}
            onClick={() => cargarCargos(pagina, search)}
            title="Actualizar datos"
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
        </div>

        <button className={styles.createButton} onClick={abrirModalNuevo}>
          <FontAwesomeIcon icon={faUserPlus} />
          Nuevo Cargo
        </button>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalCargos}</span>
          <span className={styles.statLabel}>Total cargos</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {cargos.filter((c) => c.activo).length}
          </span>
          <span className={styles.statLabel}>Activos</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {cargos.filter((c) => !c.activo).length}
          </span>
          <span className={styles.statLabel}>Inactivos</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalPaginas}</span>
          <span className={styles.statLabel}>Páginas</span>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {cargosFiltrados.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💼</div>
            <h3>
              {search
                ? "No se encontraron cargos"
                : "No hay cargos registrados"}
            </h3>
            <p>
              {search
                ? "No se encontraron cargos que coincidan con tu búsqueda."
                : "Puedes crear uno nuevo usando el botón + Nuevo Cargo."}
            </p>
            {!search && (
              <button className={styles.resetButton} onClick={abrirModalNuevo}>
                <FontAwesomeIcon icon={faUserPlus} />
                Crear el primero
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.cargosGrid}>
              {cargosFiltrados.map((cargo) => (
                <CargoCard
                  key={cargo.id}
                  cargo={cargo}
                  areas={areas}
                  onEdit={abrirModalEditar}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPaginas > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  onClick={() => setPagina((p) => Math.max(p - 1, 1))}
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
                  onClick={() =>
                    setPagina((p) => Math.min(p + 1, totalPaginas))
                  }
                  disabled={pagina === totalPaginas}
                >
                  Siguiente
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {mostrarModal && (
        <CargoModal
          modoEdicion={modoEdicion}
          formData={formData}
          areas={areas}
          camposIncompletos={camposIncompletos}
          onChange={handleChange}
          onSave={guardarCargo}
          onClose={() => setMostrarModal(false)}
        />
      )}
    </div>
  );
};

// Componente de Tarjeta de Cargo
const CargoCard = React.memo(({ cargo, areas, onEdit }) => {
  const handleEdit = useCallback(() => {
    onEdit(cargo);
  }, [cargo, onEdit]);

  const area = areas.find((a) => a.id === cargo.id_area);

  return (
    <div
      className={`${styles.cargoCard} ${
        cargo.activo ? styles.activo : styles.inactivo
      }`}
    >
      <div className={styles.cardHeader}>
        <div className={styles.avatar}>
          <FontAwesomeIcon icon={faBriefcase} />
        </div>
        <div className={styles.cargoMain}>
          <h4 className={styles.cargoName}>{cargo.nombre}</h4>
          <p className={styles.cargoArea}>
            <FontAwesomeIcon icon={faLayerGroup} />
            {area?.nombre || "Sin área asignada"}
          </p>
        </div>
        <button
          className={styles.editButton}
          onClick={handleEdit}
          title="Editar cargo"
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cargoInfo}>
          <div className={styles.infoRow}>
            <FontAwesomeIcon icon={faFileLines} className={styles.infoIcon} />
            <span className={styles.infoText}>
              {cargo.descripcion || "Sin descripción"}
            </span>
          </div>
          <div className={styles.infoRow}>
            <FontAwesomeIcon icon={faChartSimple} className={styles.infoIcon} />
            <span className={styles.infoText}>Nivel {cargo.nivel || "—"}</span>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <span
            className={`${styles.statusBadge} ${
              cargo.activo ? styles.active : styles.inactive
            }`}
          >
            {cargo.activo ? (
              <>
                <FontAwesomeIcon icon={faCheckCircle} />
                Activo
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTimesCircle} />
                Inactivo
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
});

// Componente Modal de Cargo
const CargoModal = React.memo(
  ({
    modoEdicion,
    formData,
    areas,
    camposIncompletos,
    onChange,
    onSave,
    onClose,
  }) => {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h2>{modoEdicion ? "Editar Cargo" : "Nuevo Cargo"}</h2>
            <button className={styles.modalClose} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className={styles.modalBody}>
            <div className={styles.formColumns}>
              {/* Columna Izquierda */}
              <div className={styles.formColumn}>
                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={onChange}
                    className={`${styles.formInput} ${
                      !formData.nombre ? styles.inputError : ""
                    }`}
                    placeholder="Ej: Auxiliar"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faBriefcase} />
                    Nombre del Cargo *
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={onChange}
                    className={`${styles.formTextarea} ${
                      !formData.descripcion ? styles.inputError : ""
                    }`}
                    placeholder="Descripción del cargo..."
                    rows="3"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faFileLines} />
                    Descripción *
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <select
                    name="activo"
                    value={formData.activo}
                    onChange={onChange}
                    className={styles.formSelect}
                  >
                    <option value={1}>Activo</option>
                    <option value={0}>Inactivo</option>
                  </select>
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Estado
                  </label>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className={styles.formColumn}>
                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <select
                    name="id_area"
                    value={formData.id_area ?? ""}
                    onChange={onChange}
                    className={`${styles.formSelect} ${
                      !formData.id_area ? styles.inputError : ""
                    }`}
                  >
                    <option value="">Seleccione un área...</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nombre}
                      </option>
                    ))}
                  </select>
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faLayerGroup} />
                    Área *
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <select
                    name="nivel"
                    value={formData.nivel ?? ""}
                    onChange={onChange}
                    className={styles.formSelect}
                  >
                    <option value="">Seleccione nivel...</option>
                    <option value={1}>Nivel 1 - Operativo</option>
                    <option value={2}>Nivel 2 - Táctico</option>
                    <option value={3}>Nivel 3 - Estratégico</option>
                  </select>
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faChartSimple} />
                    Nivel Jerárquico
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button className={styles.cancelButton} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
              Cancelar
            </button>
            <button
              className={`${styles.saveButton} ${
                camposIncompletos ? styles.disabled : ""
              }`}
              onClick={onSave}
              disabled={camposIncompletos}
            >
              <FontAwesomeIcon icon={faCheck} />
              {modoEdicion ? "Actualizar" : "Crear"} Cargo
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default Cargos;
