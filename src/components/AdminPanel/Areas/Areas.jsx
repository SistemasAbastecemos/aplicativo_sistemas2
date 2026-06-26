import React, { useEffect, useState, useCallback, useMemo } from "react";
import styles from "./Areas.module.css";
import { apiService } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { usePermisos } from "../../../hooks/usePermission";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";
import {
  faSearch,
  faSyncAlt,
  faPlus,
  faEdit,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faCheckCircle,
  faTimesCircle,
  faLayerGroup,
  faFileLines,
  faCheck,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Areas = () => {
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const { puedeVer, puedeCrear, loading: permisosLoading } = usePermisos();

  // Expulsion en vivo si se revoca el permiso de ver durante la sesion.
  useEffect(() => {
    if (!permisosLoading && !puedeVer) {
      addNotification({
        message: "Se revocaron tus permisos para este modulo.",
        type: "error",
      });
      navigate("/inicio", { replace: true });
    }
  }, [permisosLoading, puedeVer, navigate, addNotification]);

  // Estados principales
  const [areas, setAreas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalAreas, setTotalAreas] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Estados del modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [areaActual, setAreaActual] = useState(null);

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    activo: 1,
  });

  // Acceso regido por permisos del menu (no por rol fijo).
  const esAdministrador = puedeVer;

  // Memoized computed values
  const camposIncompletos = useMemo(
    () => !formData.nombre.trim() || !formData.descripcion.trim(),
    [formData.nombre, formData.descripcion],
  );

  const areasFiltradas = useMemo(() => {
    if (!search) return areas;

    const texto = search.toLowerCase();
    return areas.filter((a) =>
      Object.values(a).some(
        (value) => value && value.toString().toLowerCase().includes(texto),
      ),
    );
  }, [areas, search]);

  // Efectos
  useEffect(() => {
    if (esAdministrador) {
      cargarAreas(pagina, search);
    }
  }, [esAdministrador]);

  useEffect(() => {
    if (esAdministrador) {
      cargarAreas(pagina, search);
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
  const cargarAreas = async (page = 1, searchText = "") => {
    setCargando(true);
    try {
      const data = await apiService.getAreas(false, page, searchText);

      // Adaptar según la estructura de respuesta de tu API
      if (data.data && data.data.areas) {
        setAreas(data.data.areas || []);
        setTotalPaginas(data.data.paginacion?.total_paginas || 1);
        setTotalAreas(data.data.paginacion?.total_areas || 0);
      } else if (Array.isArray(data)) {
        setAreas(data);
        setTotalPaginas(1);
        setTotalAreas(data.length);
      } else if (data.areas) {
        setAreas(data.areas || []);
        setTotalPaginas(data.paginacion?.total_paginas || 1);
        setTotalAreas(data.paginacion?.total_areas || 0);
      } else {
        setAreas([]);
        setTotalPaginas(1);
        setTotalAreas(0);
      }
    } catch (error) {
      console.error("Error cargando áreas:", error);
      addNotification({ message: "Error cargando áreas", type: "error" });
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
      cargarAreas(1, value);
    }, 500);

    setSearchTimeout(newTimeout);
  };

  const abrirModalNueva = () => {
    setModoEdicion(false);
    setAreaActual(null);
    setFormData({
      nombre: "",
      descripcion: "",
      activo: 1,
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (area) => {
    setModoEdicion(true);
    setAreaActual(area);
    setFormData({
      nombre: area.nombre ?? "",
      descripcion: area.descripcion ?? "",
      activo: Number(area.activo ?? 1),
      id: area.id,
    });
    setMostrarModal(true);
  };

  const guardarArea = async () => {
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
        await apiService.updateArea(formData.id, formData);
        addNotification({
          message: "Área actualizada correctamente",
          type: "success",
        });
      } else {
        await apiService.createArea(formData);
        addNotification({
          message: "Área creada correctamente",
          type: "success",
        });
      }
      setMostrarModal(false);
      cargarAreas(pagina, search);
    } catch (error) {
      console.error("Error guardando área:", error);
      addNotification({
        message: "Error guardando área: " + (error.message || ""),
        type: "error",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "activo" ? Number(value) : value,
    }));
  };

  const resetFilters = useCallback(() => {
    setSearch("");
    setPagina(1);
    cargarAreas(1, "");
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

  if (cargando && pagina === 1 && areas.length === 0) {
    return <LoadingScreen message="Cargando áreas..." />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Gestión de Áreas</h1>
          <p className={styles.subtitle}>
            Administra y gestiona las áreas organizacionales
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filters}>
          <div className={styles.searchGroup}>
            <FontAwesomeIcon
              icon={cargando ? faSyncAlt : faSearch}
              className={`${styles.searchIcon} ${cargando ? styles.spin : ""}`}
            />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar áreas por nombre o descripción..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <button
            className={styles.refreshButton}
            onClick={() => cargarAreas(pagina, search)}
            title="Actualizar datos"
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
        </div>

        {puedeCrear && (
          <button className={styles.createButton} onClick={abrirModalNueva}>
            <FontAwesomeIcon icon={faPlus} />
            Nueva Área
          </button>
        )}
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalAreas}</span>
          <span className={styles.statLabel}>Total áreas</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {areas.filter((a) => a.activo).length}
          </span>
          <span className={styles.statLabel}>Activas</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {areas.filter((a) => !a.activo).length}
          </span>
          <span className={styles.statLabel}>Inactivas</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalPaginas}</span>
          <span className={styles.statLabel}>Páginas</span>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {areasFiltradas.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏢</div>
            <h3>
              {search ? "No se encontraron áreas" : "No hay áreas registradas"}
            </h3>
            <p>
              {search
                ? "No se encontraron áreas que coincidan con tu búsqueda."
                : "Puedes crear una nueva usando el botón + Nueva Área."}
            </p>
            {!search && (
              <button className={styles.resetButton} onClick={abrirModalNueva}>
                <FontAwesomeIcon icon={faPlus} />
                Crear la primera
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.areasGrid}>
              {areasFiltradas.map((area) => (
                <AreaCard key={area.id} area={area} onEdit={abrirModalEditar} />
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
        <AreaModal
          modoEdicion={modoEdicion}
          formData={formData}
          camposIncompletos={camposIncompletos}
          onChange={handleChange}
          onSave={guardarArea}
          onClose={() => setMostrarModal(false)}
        />
      )}
    </div>
  );
};

// Componente de Tarjeta de Área
const AreaCard = React.memo(({ area, onEdit }) => {
  const handleEdit = useCallback(() => {
    onEdit(area);
  }, [area, onEdit]);

  return (
    <div
      className={`${styles.areaCard} ${area.activo ? styles.activo : styles.inactivo}`}
    >
      {/* Indicador de estado minimalista */}
      <span
        className={styles.statusDot}
        title={area.activo ? "Activo" : "Inactivo"}
      />

      <div className={styles.cardMain}>
        <div className={styles.avatar}>
          <FontAwesomeIcon icon={faLayerGroup} />
        </div>

        <div className={styles.details}>
          <h4 className={styles.areaName}>{area.descripcion}</h4>
          <span className={styles.statusText}>
            Área {area.activo ? "operativa en sistema" : "fuera de servicio"}
          </span>
        </div>
      </div>

      <div className={styles.cardActions}>
        <button className={styles.editActionBtn} onClick={handleEdit}>
          <FontAwesomeIcon icon={faEdit} />
          <span>Configurar área</span>
        </button>
      </div>
    </div>
  );
});

// Componente Modal de Área
const AreaModal = React.memo(
  ({ modoEdicion, formData, camposIncompletos, onChange, onSave, onClose }) => {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h2>{modoEdicion ? "Editar Área" : "Nueva Área"}</h2>
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
                    placeholder="Ej: Recursos Humanos, Tecnología"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faBuilding} />
                    Nombre del Área *
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
                    placeholder="Descripción detallada del área..."
                    rows="4"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faFileLines} />
                    Descripción *
                  </label>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className={styles.formColumn}>
                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <select
                    name="activo"
                    value={formData.activo}
                    onChange={onChange}
                    className={styles.formSelect}
                  >
                    <option value={1}>Activa</option>
                    <option value={0}>Inactiva</option>
                  </select>
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Estado
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
              {modoEdicion ? "Actualizar" : "Crear"} Área
            </button>
          </div>
        </div>
      </div>
    );
  },
);

export default Areas;
