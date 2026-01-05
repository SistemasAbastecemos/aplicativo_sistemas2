import React, { useEffect, useState, useCallback, useMemo } from "react";
import styles from "./Usuarios.module.css";
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
  faUser,
  faBriefcase,
  faBuilding,
  faLayerGroup,
  faShield,
  faEnvelope,
  faKey,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Usuarios = () => {
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotification();

  // Estados principales
  const [usuarios, setUsuarios] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Datos de referencia
  const [roles, setRoles] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [cargosFiltrados, setCargosFiltrados] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [areas, setAreas] = useState([]);

  // Estados del modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [errorContrasena, setErrorContrasena] = useState("");

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombres_completos: "",
    login: "",
    contrasena: "",
    correo: "",
    id_rol: "",
    id_area: "",
    id_cargo: "",
    id_sede: "",
    activo: 1,
  });

  const esAdministrador = currentUser && currentUser.id_rol === 1;

  // Memoized computed values
  const camposIncompletos = useMemo(
    () =>
      !formData.nombres_completos.trim() ||
      !formData.login.trim() ||
      (!modoEdicion && !formData.contrasena.trim()) ||
      !formData.id_rol ||
      !formData.id_area ||
      !formData.id_cargo ||
      !formData.id_sede ||
      (!!errorContrasena && (formData.contrasena || confirmarContrasena)),
    [formData, modoEdicion, errorContrasena, confirmarContrasena]
  );

  // Efectos
  useEffect(() => {
    if (esAdministrador) {
      cargarDatosAdicionales();
      cargarUsuarios(pagina, search);
    }
  }, [esAdministrador]);

  useEffect(() => {
    if (esAdministrador) {
      cargarUsuarios(pagina, search);
    }
  }, [pagina, esAdministrador]);

  useEffect(() => {
    if (formData.contrasena || confirmarContrasena) {
      setErrorContrasena(
        formData.contrasena !== confirmarContrasena
          ? "Las contraseñas no coinciden"
          : ""
      );
    } else {
      setErrorContrasena("");
    }
  }, [formData.contrasena, confirmarContrasena]);

  useEffect(() => {
    if (!formData.id_area) {
      setCargosFiltrados([]);
      return;
    }

    const filtrados = cargos.filter((c) => c.id_area == formData.id_area);
    setCargosFiltrados(filtrados);

    if (!filtrados.some((c) => c.id == formData.id_cargo)) {
      setFormData((prev) => ({ ...prev, id_cargo: "" }));
    }
  }, [formData.id_area, cargos]);

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Funciones principales
  const cargarDatosAdicionales = async () => {
    try {
      const [rolesData, cargosData, areasData, sedesData] = await Promise.all([
        apiService.getRoles(),
        apiService.getCargos(),
        apiService.getAreas(),
        apiService.getSedes(),
      ]);
      setRoles(rolesData);
      setCargos(cargosData);
      setAreas(areasData);
      setSedes(sedesData);
    } catch (error) {
      console.error("Error cargando datos adicionales:", error);
      addNotification({
        message: "Error cargando datos adicionales",
        type: "error",
      });
    }
  };

  const cargarUsuarios = async (page = 1, searchText = "") => {
    setCargando(true);
    try {
      const data = await apiService.getUsuarios(page, 15, searchText);
      setUsuarios(data.usuarios || []);
      setTotalPaginas(data.paginacion?.total_paginas || 1);
      setTotalUsuarios(data.paginacion?.total_usuarios || 0);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      addNotification({ message: "Error cargando usuarios", type: "error" });
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
      cargarUsuarios(1, value);
    }, 500);

    setSearchTimeout(newTimeout);
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setUsuarioActual(null);
    setConfirmarContrasena("");
    setErrorContrasena("");
    setFormData({
      nombres_completos: "",
      login: "",
      contrasena: "",
      correo: "",
      id_rol: "",
      id_area: "",
      id_cargo: "",
      id_sede: "",
      activo: 1,
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (usuario) => {
    setModoEdicion(true);
    setUsuarioActual(usuario);
    setConfirmarContrasena("");
    setErrorContrasena("");
    setFormData({
      nombres_completos: usuario.nombres_completos || "",
      login: usuario.login || "",
      contrasena: "",
      correo: usuario.correo || "",
      id_rol: usuario.id_rol || "",
      id_area: usuario.id_area || "",
      id_cargo: usuario.id_cargo || "",
      id_sede: usuario.id_sede || "",
      activo: usuario.activo ? 1 : 0,
    });
    setMostrarModal(true);
  };

  const guardarUsuario = async () => {
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
        id_rol: parseInt(formData.id_rol),
        id_area: parseInt(formData.id_area),
        id_cargo: parseInt(formData.id_cargo),
        id_sede: parseInt(formData.id_sede),
        activo: parseInt(formData.activo),
      };

      if (modoEdicion && !datosParaEnviar.contrasena) {
        delete datosParaEnviar.contrasena;
      }

      if (modoEdicion) {
        await apiService.updateUsuario(usuarioActual.id, datosParaEnviar);
        addNotification({
          message: "Usuario actualizado correctamente",
          type: "success",
        });
      } else {
        await apiService.createUsuario(datosParaEnviar);
        addNotification({
          message: "Usuario creado correctamente",
          type: "success",
        });
      }
      setMostrarModal(false);
      cargarUsuarios(pagina, search);
    } catch (error) {
      console.error("Error guardando usuario:", error);
      addNotification({
        message: "Error al guardar el usuario: " + error.message,
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
    cargarUsuarios(1, "");
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
    return <LoadingScreen message="Cargando usuarios..." />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Gestión de Usuarios</h1>
          <p className={styles.subtitle}>
            Administra y gestiona los usuarios del sistema
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
              placeholder="Buscar por nombre, login o correo..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <button
            className={styles.refreshButton}
            onClick={() => cargarUsuarios(pagina, search)}
            title="Actualizar datos"
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
        </div>

        <button className={styles.createButton} onClick={abrirModalNuevo}>
          <FontAwesomeIcon icon={faUserPlus} />
          Nuevo Usuario
        </button>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalUsuarios}</span>
          <span className={styles.statLabel}>Total usuarios</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {usuarios.filter((u) => u.activo).length}
          </span>
          <span className={styles.statLabel}>Activos</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {usuarios.filter((u) => !u.activo).length}
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
        {usuarios.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👤</div>
            <h3>
              {search
                ? "No se encontraron usuarios"
                : "No hay usuarios registrados"}
            </h3>
            <p>
              {search
                ? "No se encontraron usuarios que coincidan con tu búsqueda."
                : "Puedes crear uno nuevo usando el botón + Nuevo Usuario."}
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
            <div className={styles.usuariosGrid}>
              {usuarios.map((usuario) => (
                <UsuarioCard
                  key={usuario.id}
                  usuario={usuario}
                  onEdit={abrirModalEditar}
                  roles={roles}
                  cargos={cargos}
                  areas={areas}
                  sedes={sedes}
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
        <UsuarioModal
          modoEdicion={modoEdicion}
          formData={formData}
          confirmarContrasena={confirmarContrasena}
          errorContrasena={errorContrasena}
          roles={roles}
          areas={areas}
          cargosFiltrados={cargosFiltrados}
          sedes={sedes}
          camposIncompletos={camposIncompletos}
          onChange={handleChange}
          onConfirmarContrasenaChange={setConfirmarContrasena}
          onSave={guardarUsuario}
          onClose={() => setMostrarModal(false)}
        />
      )}
    </div>
  );
};

// Componente de Tarjeta de Usuario - MUCHO MÁS PEQUEÑO
const UsuarioCard = React.memo(
  ({ usuario, onEdit, roles, cargos, areas, sedes }) => {
    const handleEdit = useCallback(() => {
      onEdit(usuario);
    }, [usuario, onEdit]);

    const rol = roles.find((r) => r.id === usuario.id_rol);
    const cargo = cargos.find((c) => c.id === usuario.id_cargo);
    const area = areas.find((a) => a.id === usuario.id_area);
    const sede = sedes.find((s) => s.id === usuario.id_sede);

    return (
      <div
        className={`${styles.usuarioCard} ${
          usuario.activo ? styles.activo : styles.inactivo
        }`}
      >
        <div className={styles.cardHeader}>
          <div className={styles.avatar}>
            {usuario.nombres_completos?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className={styles.userMain}>
            <h4 className={styles.userName}>{usuario.nombres_completos}</h4>
            <p className={styles.userLogin}>@{usuario.login}</p>
          </div>
          <button
            className={styles.editButton}
            onClick={handleEdit}
            title="Editar usuario"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.userInfo}>
            <div className={styles.infoRow}>
              <FontAwesomeIcon icon={faEnvelope} className={styles.infoIcon} />
              <span className={styles.infoText}>
                {usuario.correo || "Sin correo"}
              </span>
            </div>
            <div className={styles.infoRow}>
              <FontAwesomeIcon icon={faShield} className={styles.infoIcon} />
              <span className={styles.infoText}>
                {rol?.descripcion || "Sin rol"}
              </span>
            </div>
            <div className={styles.infoRow}>
              <FontAwesomeIcon icon={faBuilding} className={styles.infoIcon} />
              <span className={styles.infoText}>
                {sede?.nombre || "Sin sede"}
              </span>
            </div>
          </div>

          <div className={styles.cardFooter}>
            <span
              className={`${styles.statusBadge} ${
                usuario.activo ? styles.active : styles.inactive
              }`}
            >
              {usuario.activo ? (
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
  }
);

// Componente Modal de Usuario (sin cambios)
const UsuarioModal = React.memo(
  ({
    modoEdicion,
    formData,
    confirmarContrasena,
    errorContrasena,
    roles,
    areas,
    cargosFiltrados,
    sedes,
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
            <h2>{modoEdicion ? "Editar Usuario" : "Nuevo Usuario"}</h2>
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
                    name="nombres_completos"
                    value={formData.nombres_completos}
                    onChange={onChange}
                    className={`${styles.formInput} ${
                      !formData.nombres_completos ? styles.inputError : ""
                    }`}
                    placeholder="Ingrese los nombres completos"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faUser} />
                    Nombres Completos *
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <input
                    type="text"
                    name="login"
                    value={formData.login}
                    onChange={onChange}
                    disabled={modoEdicion}
                    className={`${styles.formInput} ${
                      !formData.login ? styles.inputError : ""
                    }`}
                    placeholder="Nombre de usuario para login"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faUser} />
                    Login *
                  </label>
                </div>

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
                      <FontAwesomeIcon icon={faKey} />
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
                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={onChange}
                    className={styles.formInput}
                    placeholder="usuario@empresa.com"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faEnvelope} />
                    Correo Electrónico
                  </label>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className={styles.formColumn}>
                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <select
                    name="id_rol"
                    value={formData.id_rol}
                    onChange={onChange}
                    className={`${styles.formSelect} ${
                      !formData.id_rol ? styles.inputError : ""
                    }`}
                  >
                    <option value="">Seleccione un rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.descripcion}
                      </option>
                    ))}
                  </select>
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faShield} />
                    Rol *
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <select
                    name="id_area"
                    value={formData.id_area}
                    onChange={onChange}
                    className={`${styles.formSelect} ${
                      !formData.id_area ? styles.inputError : ""
                    }`}
                  >
                    <option value="">Seleccione un área</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.descripcion}
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
                    name="id_cargo"
                    value={formData.id_cargo}
                    onChange={onChange}
                    className={`${styles.formSelect} ${
                      !formData.id_cargo ? styles.inputError : ""
                    }`}
                    disabled={!formData.id_area}
                  >
                    <option value="">
                      {formData.id_area
                        ? "Seleccione un cargo"
                        : "Seleccione un área primero"}
                    </option>
                    {cargosFiltrados.map((cargo) => (
                      <option key={cargo.id} value={cargo.id}>
                        {cargo.descripcion}
                      </option>
                    ))}
                  </select>
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faBriefcase} />
                    Cargo *
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <select
                    name="id_sede"
                    value={formData.id_sede}
                    onChange={onChange}
                    className={`${styles.formSelect} ${
                      !formData.id_sede ? styles.inputError : ""
                    }`}
                  >
                    <option value="">Seleccione una sede</option>
                    {sedes.map((sede) => (
                      <option key={sede.id} value={sede.id}>
                        {sede.nombre}
                      </option>
                    ))}
                  </select>
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faBuilding} />
                    Sede *
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
              {modoEdicion ? "Actualizar" : "Crear"} Usuario
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default Usuarios;
