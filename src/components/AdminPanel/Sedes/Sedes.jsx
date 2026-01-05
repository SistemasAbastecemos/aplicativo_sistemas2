import React, { useEffect, useState, useCallback, useMemo } from "react";
import styles from "./Sedes.module.css";
import { apiService } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";
import {
  faSearch,
  faSyncAlt,
  faBuilding,
  faEdit,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faCheckCircle,
  faTimesCircle,
  faMapMarkerAlt,
  faCity,
  faMapPin,
  faLocationDot,
  faHashtag,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Sedes = () => {
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotification();

  // Estados principales
  const [sedes, setSedes] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalSedes, setTotalSedes] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Estados del modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [sedeActual, setSedeActual] = useState(null);

  // Datos del formulario
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    direccion: "",
    barrio: "",
    ciudad: "",
    departamento: "",
    activo: 1,
  });

  const esAdministrador = currentUser && currentUser.id_rol === 1;

  // Memoized computed values
  const camposIncompletos = useMemo(
    () => !formData.codigo.trim() || !formData.nombre.trim(),
    [formData.codigo, formData.nombre]
  );

  const sedesFiltradas = useMemo(() => {
    if (!search) return sedes;

    const texto = search.toLowerCase();
    return sedes.filter((s) =>
      Object.values(s).some(
        (value) => value && value.toString().toLowerCase().includes(texto)
      )
    );
  }, [sedes, search]);

  // Efectos
  useEffect(() => {
    if (esAdministrador) {
      cargarSedes(pagina, search);
    }
  }, [esAdministrador]);

  useEffect(() => {
    if (esAdministrador) {
      cargarSedes(pagina, search);
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
  const cargarSedes = async (page = 1, searchText = "") => {
    setCargando(true);
    try {
      const data = await apiService.getSedes(false, page, searchText);

      // Adaptar según la estructura de respuesta de tu API
      if (data.data && data.data.sedes) {
        // Si la respuesta tiene estructura { data: { sedes: [], paginacion: {} } }
        setSedes(data.data.sedes || []);
        setTotalPaginas(data.data.paginacion?.total_paginas || 1);
        setTotalSedes(data.data.paginacion?.total_sedes || 0);
      } else if (Array.isArray(data)) {
        // Si la respuesta es un array directo
        setSedes(data);
        setTotalPaginas(1);
        setTotalSedes(data.length);
      } else if (data.sedes) {
        // Si la respuesta es { sedes: [], paginacion: {} }
        setSedes(data.sedes || []);
        setTotalPaginas(data.paginacion?.total_paginas || 1);
        setTotalSedes(data.paginacion?.total_sedes || 0);
      } else {
        setSedes([]);
        setTotalPaginas(1);
        setTotalSedes(0);
      }
    } catch (error) {
      console.error("Error cargando sedes:", error);
      if (error.message.includes("permisos") || error.message.includes("403")) {
        addNotification({
          message: "No tienes permisos para ver las sedes",
          type: "error",
        });
      } else {
        addNotification({
          message: "Error cargando sedes",
          type: "error",
        });
      }
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
      cargarSedes(1, value);
    }, 500);

    setSearchTimeout(newTimeout);
  };

  const abrirModalNueva = () => {
    setModoEdicion(false);
    setSedeActual(null);
    setFormData({
      codigo: "",
      nombre: "",
      direccion: "",
      barrio: "",
      ciudad: "",
      departamento: "",
      activo: 1,
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (sede) => {
    setModoEdicion(true);
    setSedeActual(sede);
    setFormData({
      codigo: sede.codigo || "",
      nombre: sede.nombre || "",
      direccion: sede.direccion || "",
      barrio: sede.barrio || "",
      ciudad: sede.ciudad || "",
      departamento: sede.departamento || "",
      activo: sede.activo ? 1 : 0,
    });
    setMostrarModal(true);
  };

  const guardarSede = async () => {
    try {
      if (camposIncompletos) {
        addNotification({
          message: "Por favor complete todos los campos obligatorios",
          type: "error",
        });
        return;
      }

      if (modoEdicion) {
        await apiService.updateSede(sedeActual.id, formData);
        addNotification({
          message: "Sede actualizada correctamente",
          type: "success",
        });
      } else {
        await apiService.createSede(formData);
        addNotification({
          message: "Sede creada correctamente",
          type: "success",
        });
      }
      setMostrarModal(false);
      cargarSedes(pagina, search);
    } catch (error) {
      console.error("Error guardando sede:", error);
      addNotification({
        message: "Error al guardar la sede: " + error.message,
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
    cargarSedes(1, "");
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
    return <LoadingScreen message="Cargando sedes..." />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Gestión de Sedes</h1>
          <p className={styles.subtitle}>
            Administra y gestiona las sedes de la organización
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
              placeholder="Buscar sedes por código, nombre o ubicación..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <button
            className={styles.refreshButton}
            onClick={() => cargarSedes(pagina, search)}
            title="Actualizar datos"
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
        </div>

        <button className={styles.createButton} onClick={abrirModalNueva}>
          <FontAwesomeIcon icon={faBuilding} />
          Nueva Sede
        </button>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalSedes}</span>
          <span className={styles.statLabel}>Total sedes</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {sedes.filter((s) => s.activo).length}
          </span>
          <span className={styles.statLabel}>Activas</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {sedes.filter((s) => !s.activo).length}
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
        {sedesFiltradas.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏢</div>
            <h3>
              {search ? "No se encontraron sedes" : "No hay sedes registradas"}
            </h3>
            <p>
              {search
                ? "No se encontraron sedes que coincidan con tu búsqueda."
                : "Puedes crear una nueva usando el botón + Nueva Sede."}
            </p>
            {!search && (
              <button className={styles.resetButton} onClick={abrirModalNueva}>
                <FontAwesomeIcon icon={faBuilding} />
                Crear la primera
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.sedesGrid}>
              {sedesFiltradas.map((sede) => (
                <SedeCard key={sede.id} sede={sede} onEdit={abrirModalEditar} />
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
        <SedeModal
          modoEdicion={modoEdicion}
          formData={formData}
          camposIncompletos={camposIncompletos}
          onChange={handleChange}
          onSave={guardarSede}
          onClose={() => setMostrarModal(false)}
        />
      )}
    </div>
  );
};

// Componente de Tarjeta de Sede
const SedeCard = React.memo(({ sede, onEdit }) => {
  const handleEdit = useCallback(() => {
    onEdit(sede);
  }, [sede, onEdit]);

  const ubicacion =
    [sede.barrio, sede.ciudad, sede.departamento].filter(Boolean).join(", ") ||
    "Ubicación no especificada";

  return (
    <div
      className={`${styles.sedeCard} ${
        sede.activo ? styles.activa : styles.inactiva
      }`}
    >
      <div className={styles.cardHeader}>
        <div className={styles.avatar}>
          <FontAwesomeIcon icon={faBuilding} />
        </div>
        <div className={styles.sedeMain}>
          <h4 className={styles.sedeName}>{sede.nombre}</h4>
          <p className={styles.sedeCode}>
            <FontAwesomeIcon icon={faHashtag} />
            {sede.codigo}
          </p>
        </div>
        <button
          className={styles.editButton}
          onClick={handleEdit}
          title="Editar sede"
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.sedeInfo}>
          <div className={styles.infoRow}>
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className={styles.infoIcon}
            />
            <span className={styles.infoText}>
              {sede.direccion || "Sin dirección"}
            </span>
          </div>
          <div className={styles.infoRow}>
            <FontAwesomeIcon icon={faLocationDot} className={styles.infoIcon} />
            <span className={styles.infoText}>{ubicacion}</span>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <span
            className={`${styles.statusBadge} ${
              sede.activo ? styles.active : styles.inactive
            }`}
          >
            {sede.activo ? (
              <>
                <FontAwesomeIcon icon={faCheckCircle} />
                Activa
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTimesCircle} />
                Inactiva
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
});

// Componente Modal de Sede
const SedeModal = React.memo(
  ({ modoEdicion, formData, camposIncompletos, onChange, onSave, onClose }) => {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h2>{modoEdicion ? "Editar Sede" : "Nueva Sede"}</h2>
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
                    name="codigo"
                    value={formData.codigo}
                    onChange={onChange}
                    maxLength={3}
                    disabled={modoEdicion}
                    className={`${styles.formInput} ${
                      !formData.codigo ? styles.inputError : ""
                    }`}
                    placeholder="Ej: B01"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faHashtag} />
                    Código *
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={onChange}
                    className={`${styles.formInput} ${
                      !formData.nombre ? styles.inputError : ""
                    }`}
                    placeholder="Nombre de la sede"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faBuilding} />
                    Nombre *
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={onChange}
                    className={styles.formInput}
                    placeholder="Dirección completa"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    Dirección
                  </label>
                </div>

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

              {/* Columna Derecha */}
              <div className={styles.formColumn}>
                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <input
                    type="text"
                    name="barrio"
                    value={formData.barrio}
                    onChange={onChange}
                    className={styles.formInput}
                    placeholder="Barrio o sector"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faMapPin} />
                    Barrio
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={onChange}
                    className={styles.formInput}
                    placeholder="Ciudad"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faCity} />
                    Ciudad
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <input
                    type="text"
                    name="departamento"
                    value={formData.departamento}
                    onChange={onChange}
                    className={styles.formInput}
                    placeholder="Departamento o estado"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faLocationDot} />
                    Departamento
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
              {modoEdicion ? "Actualizar" : "Crear"} Sede
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default Sedes;
