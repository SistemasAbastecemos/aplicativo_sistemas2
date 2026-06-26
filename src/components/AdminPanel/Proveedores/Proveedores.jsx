import React, { useEffect, useState, useCallback, useMemo } from "react";
import styles from "./Proveedores.module.css";
import { apiService } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { usePermisos } from "../../../hooks/usePermission";
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
  faIdCard,
  faEnvelope,
  faKey,
  faCheck,
  faXmark,
  faBuilding,
  faShield,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Proveedores = () => {
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
  const [proveedores, setProveedores] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalProveedores, setTotalProveedores] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Estados del modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [proveedorActual, setProveedorActual] = useState(null);
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [errorContrasena, setErrorContrasena] = useState("");

  // Datos del formulario
  const [formData, setFormData] = useState({
    nit: "",
    contrasena: "",
    correo: "",
    activo: 1,
  });

  // Acceso regido por permisos del menu (no por rol fijo).
  const esAdministrador = puedeVer;

  // Memoized computed values
  const camposIncompletos = useMemo(
    () =>
      !formData.nit.trim() ||
      !formData.correo.trim() ||
      (!modoEdicion && !formData.contrasena.trim()) ||
      (!!errorContrasena && (formData.contrasena || confirmarContrasena)),
    [formData, modoEdicion, errorContrasena, confirmarContrasena],
  );

  const proveedoresFiltrados = useMemo(() => {
    if (!search) return proveedores;

    const texto = search.toLowerCase();
    return proveedores.filter((p) =>
      Object.values(p).some(
        (value) => value && value.toString().toLowerCase().includes(texto),
      ),
    );
  }, [proveedores, search]);

  // Efectos
  useEffect(() => {
    if (esAdministrador) {
      cargarProveedores(pagina, search);
    }
  }, [esAdministrador]);

  useEffect(() => {
    if (esAdministrador) {
      cargarProveedores(pagina, search);
    }
  }, [pagina, esAdministrador]);

  useEffect(() => {
    if (formData.contrasena || confirmarContrasena) {
      setErrorContrasena(
        formData.contrasena !== confirmarContrasena
          ? "Las contraseñas no coinciden"
          : "",
      );
    } else {
      setErrorContrasena("");
    }
  }, [formData.contrasena, confirmarContrasena]);

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Funciones principales
  const cargarProveedores = async (page = 1, searchText = "") => {
    setCargando(true);
    try {
      const data = await apiService.getProveedores(page, 15, searchText);

      // Adaptar según la estructura de respuesta de tu API
      if (data.data && data.data.proveedores) {
        setProveedores(data.data.proveedores || []);
        setTotalPaginas(data.data.paginacion?.total_paginas || 1);
        setTotalProveedores(data.data.paginacion?.total_proveedores || 0);
      } else if (Array.isArray(data)) {
        setProveedores(data);
        setTotalPaginas(1);
        setTotalProveedores(data.length);
      } else if (data.proveedores) {
        setProveedores(data.proveedores || []);
        setTotalPaginas(data.paginacion?.total_paginas || 1);
        setTotalProveedores(data.paginacion?.total_proveedores || 0);
      } else {
        setProveedores([]);
        setTotalPaginas(1);
        setTotalProveedores(0);
      }
    } catch (error) {
      console.error("Error cargando proveedores:", error);
      addNotification({
        message: "Error cargando proveedores: " + (error.message || error),
        type: "error",
      });
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
      cargarProveedores(1, value);
    }, 500);

    setSearchTimeout(newTimeout);
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setProveedorActual(null);
    setConfirmarContrasena("");
    setErrorContrasena("");
    setFormData({
      nit: "",
      contrasena: "",
      correo: "",
      activo: 1,
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (proveedor) => {
    setModoEdicion(true);
    setProveedorActual(proveedor);
    setConfirmarContrasena("");
    setErrorContrasena("");
    setFormData({
      nit: proveedor.nit || "",
      contrasena: "",
      correo: proveedor.correo || "",
      activo: proveedor.activo ? 1 : 0,
    });
    setMostrarModal(true);
  };

  const guardarProveedor = async () => {
    try {
      if (errorContrasena) {
        addNotification({
          message: "Las contraseñas no coinciden",
          type: "error",
        });
        return;
      }

      if (camposIncompletos) {
        addNotification({
          message: "Por favor complete todos los campos obligatorios",
          type: "error",
        });
        return;
      }

      const datosParaEnviar = {
        ...formData,
        activo: parseInt(formData.activo),
      };

      if (modoEdicion && !datosParaEnviar.contrasena) {
        delete datosParaEnviar.contrasena;
      }

      if (modoEdicion) {
        await apiService.updateProveedor(proveedorActual.id, datosParaEnviar);
        addNotification({
          message: "Proveedor actualizado correctamente",
          type: "success",
        });
      } else {
        await apiService.createProveedor(datosParaEnviar);
        addNotification({
          message: "Proveedor creado correctamente",
          type: "success",
        });
      }
      setMostrarModal(false);
      cargarProveedores(pagina, search);
    } catch (error) {
      console.error("Error guardando proveedor:", error);
      addNotification({
        message: "Error al guardar el proveedor: " + error.message,
        type: "error",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = useCallback(() => {
    setSearch("");
    setPagina(1);
    cargarProveedores(1, "");
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

  if (cargando && pagina === 1 && proveedores.length === 0) {
    return <LoadingScreen message="Cargando proveedores..." />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Gestión de Proveedores</h1>
          <p className={styles.subtitle}>
            Administra y gestiona los proveedores del sistema
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
              placeholder="Buscar por NIT o correo..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <button
            className={styles.refreshButton}
            onClick={() => cargarProveedores(pagina, search)}
            title="Actualizar datos"
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
        </div>

        {puedeCrear && (
          <button className={styles.createButton} onClick={abrirModalNuevo}>
            <FontAwesomeIcon icon={faUserPlus} />
            Nuevo Proveedor
          </button>
        )}
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalProveedores}</span>
          <span className={styles.statLabel}>Total proveedores</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {proveedores.filter((p) => p.activo).length}
          </span>
          <span className={styles.statLabel}>Activos</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {proveedores.filter((p) => !p.activo).length}
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
        {proveedoresFiltrados.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏢</div>
            <h3>
              {search
                ? "No se encontraron proveedores"
                : "No hay proveedores registrados"}
            </h3>
            <p>
              {search
                ? "No se encontraron proveedores que coincidan con tu búsqueda."
                : "Puedes crear uno nuevo usando el botón + Nuevo Proveedor."}
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
            <div className={styles.proveedoresGrid}>
              {proveedoresFiltrados.map((proveedor) => (
                <ProveedorCard
                  key={proveedor.id}
                  proveedor={proveedor}
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
        <ProveedorModal
          modoEdicion={modoEdicion}
          formData={formData}
          confirmarContrasena={confirmarContrasena}
          errorContrasena={errorContrasena}
          camposIncompletos={camposIncompletos}
          onChange={handleChange}
          onConfirmarContrasenaChange={setConfirmarContrasena}
          onSave={guardarProveedor}
          onClose={() => setMostrarModal(false)}
        />
      )}
    </div>
  );
};

// Componente de Tarjeta de Proveedor
const ProveedorCard = React.memo(({ proveedor, onEdit }) => {
  const handleEdit = useCallback(() => {
    onEdit(proveedor);
  }, [proveedor, onEdit]);

  return (
    <div
      className={`${styles.proveedorCard} ${proveedor.activo ? styles.activo : styles.inactivo}`}
    >
      {/* Indicador de estado minimalista */}
      <span
        className={styles.statusDot}
        title={proveedor.activo ? "Activo" : "Inactivo"}
      />

      <div className={styles.cardMain}>
        <div className={styles.avatar}>
          {proveedor.razon_social?.charAt(0)?.toUpperCase() || "P"}
        </div>

        <div className={styles.details}>
          <div className={styles.nameRow}>
            <h4 className={styles.companyName}>{proveedor.razon_social}</h4>
            <span className={styles.nitText}>NIT: {proveedor.nit}</span>
          </div>
          <p className={styles.contactEmail}>
            {proveedor.correo || "Sin correo de contacto"}
          </p>
        </div>
      </div>

      <div className={styles.cardMeta}>
        <div className={styles.metaBadge} title="Contacto">
          <FontAwesomeIcon icon={faIdCard} className={styles.metaIcon} />
          <span>{proveedor.contacto || "Sin contacto asignado"}</span>
        </div>
        {proveedor.telefono && (
          <div className={styles.metaBadge} title="Teléfono">
            <FontAwesomeIcon icon={faBuilding} className={styles.metaIcon} />
            <span>{proveedor.telefono}</span>
          </div>
        )}
      </div>

      <div className={styles.cardActions}>
        <button className={styles.editActionBtn} onClick={handleEdit}>
          <FontAwesomeIcon icon={faEdit} />
          <span>Editar proveedor</span>
        </button>
      </div>
    </div>
  );
});

// Componente Modal de Proveedor
const ProveedorModal = React.memo(
  ({
    modoEdicion,
    formData,
    confirmarContrasena,
    errorContrasena,
    camposIncompletos,
    onChange,
    onConfirmarContrasenaChange,
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
            <h2>{modoEdicion ? "Editar Proveedor" : "Nuevo Proveedor"}</h2>
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
                    name="nit"
                    value={formData.nit}
                    onChange={onChange}
                    disabled={modoEdicion}
                    className={`${styles.formInput} ${
                      !formData.nit ? styles.inputError : ""
                    }`}
                    placeholder="Número de identificación tributaria"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faIdCard} />
                    NIT *
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={onChange}
                    className={`${styles.formInput} ${
                      !formData.correo ? styles.inputError : ""
                    }`}
                    placeholder="proveedor@empresa.com"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faEnvelope} />
                    Correo Electrónico *
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
                  <input
                    type="password"
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={onChange}
                    className={`${styles.formInput} ${
                      errorContrasena ? styles.inputError : ""
                    }`}
                    placeholder={
                      modoEdicion
                        ? "Dejar vacío para no cambiar"
                        : "Ingrese la contraseña"
                    }
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faKey} />
                    Contraseña {!modoEdicion && "*"}
                  </label>
                </div>

                {(!modoEdicion || formData.contrasena) && (
                  <div className={`${styles.formGroup} ${styles.floating}`}>
                    <input
                      type="password"
                      value={confirmarContrasena}
                      onChange={(e) =>
                        onConfirmarContrasenaChange(e.target.value)
                      }
                      className={`${styles.formInput} ${
                        errorContrasena || !confirmarContrasena
                          ? styles.inputError
                          : ""
                      }`}
                      placeholder="Repita la contraseña"
                    />
                    <label className={styles.formLabel}>
                      <FontAwesomeIcon icon={faShield} />
                      Confirmar Contraseña *
                    </label>
                    {errorContrasena && (
                      <div className={styles.errorText}>
                        <FontAwesomeIcon icon={faXmark} />
                        {errorContrasena}
                      </div>
                    )}
                    {!errorContrasena &&
                      confirmarContrasena &&
                      formData.contrasena === confirmarContrasena && (
                        <div className={styles.successText}>
                          <FontAwesomeIcon icon={faCheck} />
                          Las contraseñas coinciden
                        </div>
                      )}
                  </div>
                )}
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
              {modoEdicion ? "Actualizar" : "Crear"} Proveedor
            </button>
          </div>
        </div>
      </div>
    );
  },
);

export default Proveedores;
