import React, { useEffect, useState, useCallback, useMemo } from "react";
import styles from "./Menus.module.css";
import { apiService } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
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
  faBars,
  faLink,
  faIcons,
  faListOl,
  faFolder,
  faCheck,
  faEye,
  faUserShield,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Menus = () => {
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotification();

  // Estados principales
  const [menus, setMenus] = useState([]);
  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalMenus, setTotalMenus] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Estados del modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [menuActual, setMenuActual] = useState(null);
  const [pestañaActiva, setPestañaActiva] = useState("datos");

  // Filtros de permisos
  const [cargosFiltrados, setCargosFiltrados] = useState([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState("");

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    ruta: "",
    icono: "",
    orden: "",
    id_parent: "",
    activo: 1,
  });

  const [permisos, setPermisos] = useState({
    roles: {},
    cargos: {},
  });

  const esAdministrador = currentUser && currentUser.id_rol === 1;

  // Memoized computed values
  const camposIncompletos = useMemo(
    () => !formData.nombre.trim() || !formData.ruta.trim(),
    [formData.nombre, formData.ruta]
  );

  const menusFiltrados = useMemo(() => {
    if (!search) return menus;

    const texto = search.toLowerCase();
    return menus.filter((m) =>
      Object.values(m).some(
        (value) => value && value.toString().toLowerCase().includes(texto)
      )
    );
  }, [menus, search]);

  // Efectos
  useEffect(() => {
    if (esAdministrador) {
      cargarDatos();
    }
  }, [esAdministrador]);

  useEffect(() => {
    if (areaSeleccionada) {
      const filtrados = cargos.filter(
        (cargo) => cargo.id_area == areaSeleccionada
      );
      setCargosFiltrados(filtrados);
    } else {
      setCargosFiltrados(cargos);
    }
  }, [areaSeleccionada, cargos]);

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Funciones principales
  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [menusRes, rolesRes, areasRes, cargosRes] = await Promise.all([
        apiService.getMenus(),
        apiService.getRoles(),
        apiService.getAreas(),
        apiService.getCargos(),
      ]);

      // Adaptar según la estructura de respuesta de tu API
      setMenus(menusRes.data ?? menusRes);
      setRoles(rolesRes.data ?? rolesRes);
      setAreas(areasRes.data ?? areasRes);
      setCargos(cargosRes.data ?? cargosRes);
      setCargosFiltrados(cargosRes.data ?? cargosRes);

      setTotalPaginas(1);
      setTotalMenus(menusRes.data?.length ?? menusRes.length ?? 0);
    } catch (error) {
      console.error("Error cargando datos:", error);
      addNotification({ message: "Error cargando datos", type: "error" });
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
      // Implementar búsqueda en API si está disponible
      cargarDatos();
    }, 500);

    setSearchTimeout(newTimeout);
  };

  const abrirModalNuevo = async () => {
    if (!roles.length || !areas.length || !cargos.length) {
      await cargarDatos();
    }

    setModoEdicion(false);
    setMenuActual(null);
    setFormData({
      nombre: "",
      ruta: "",
      icono: "",
      orden: "",
      id_parent: "",
      activo: 1,
    });
    setPermisos({ roles: {}, cargos: {} });
    setAreaSeleccionada("");
    setPestañaActiva("datos");
    setMostrarModal(true);
  };

  const abrirModalEditar = async (menu) => {
    if (!roles.length || !areas.length || !cargos.length) {
      await cargarDatos();
    }

    setModoEdicion(true);
    setMenuActual(menu);
    setFormData({
      nombre: menu.nombre ?? "",
      ruta: menu.ruta ?? "",
      icono: menu.icono ?? "",
      orden: menu.orden ?? "",
      id_parent: menu.id_parent ?? menu.id_menu_parent ?? "",
      activo: Number(menu.activo ?? 1),
      id: menu.id,
    });
    setPermisos(menu.permisos || { roles: {}, cargos: {} });
    setAreaSeleccionada("");
    setPestañaActiva("datos");
    setMostrarModal(true);
  };

  const guardarMenu = async () => {
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

      let payload = {
        ...formData,
        permisos,
        id_parent: formData.id_parent || null,
      };

      if (modoEdicion) {
        await apiService.updateMenu(menuActual.id, payload);
        addNotification({
          message: "Menú actualizado correctamente",
          type: "success",
        });
      } else {
        await apiService.createMenu(payload);
        addNotification({
          message: "Menú creado correctamente",
          type: "success",
        });
      }
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      console.error("Error guardando menú:", error);
      addNotification({
        message: "Error guardando menú: " + (error.message || ""),
        type: "error",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleAreaChange = (e) => {
    setAreaSeleccionada(e.target.value);
  };

  const togglePermiso = (tipo, id, campo) => {
    setPermisos((prev) => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        [id]: {
          ...prev[tipo][id],
          [campo]: !prev[tipo][id]?.[campo],
        },
      },
    }));
  };

  const resetFilters = useCallback(() => {
    setSearch("");
    setPagina(1);
    cargarDatos();
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
    return <LoadingScreen message="Cargando menús..." />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Gestión de Menús</h1>
          <p className={styles.subtitle}>
            Administra y gestiona los menús del sistema
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
              placeholder="Buscar menús por nombre, ruta o icono..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <button
            className={styles.refreshButton}
            onClick={cargarDatos}
            title="Actualizar datos"
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
        </div>

        <button className={styles.createButton} onClick={abrirModalNuevo}>
          <FontAwesomeIcon icon={faPlus} />
          Nuevo Menú
        </button>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalMenus}</span>
          <span className={styles.statLabel}>Total menús</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {menus.filter((m) => m.activo).length}
          </span>
          <span className={styles.statLabel}>Activos</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {menus.filter((m) => !m.activo).length}
          </span>
          <span className={styles.statLabel}>Inactivos</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {menus.filter((m) => !m.id_parent).length}
          </span>
          <span className={styles.statLabel}>Menús principales</span>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {menusFiltrados.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>
              {search ? "No se encontraron menús" : "No hay menús registrados"}
            </h3>
            <p>
              {search
                ? "No se encontraron menús que coincidan con tu búsqueda."
                : "Puedes crear uno nuevo usando el botón + Nuevo Menú."}
            </p>
            {!search && (
              <button className={styles.resetButton} onClick={abrirModalNuevo}>
                <FontAwesomeIcon icon={faPlus} />
                Crear el primero
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.menusGrid}>
              {menusFiltrados.map((menu) => (
                <MenuCard
                  key={menu.id}
                  menu={menu}
                  onEdit={abrirModalEditar}
                  menus={menus}
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
        <MenuModal
          modoEdicion={modoEdicion}
          formData={formData}
          permisos={permisos}
          pestañaActiva={pestañaActiva}
          areaSeleccionada={areaSeleccionada}
          roles={roles}
          areas={areas}
          cargosFiltrados={cargosFiltrados}
          menus={menus}
          camposIncompletos={camposIncompletos}
          onChange={handleChange}
          onAreaChange={handleAreaChange}
          onTogglePermiso={togglePermiso}
          onPestañaChange={setPestañaActiva}
          onSave={guardarMenu}
          onClose={() => setMostrarModal(false)}
        />
      )}
    </div>
  );
};

// Componente de Tarjeta de Menú
const MenuCard = React.memo(({ menu, onEdit, menus }) => {
  const handleEdit = useCallback(() => {
    onEdit(menu);
  }, [menu, onEdit]);

  const menuPadre = menus.find((m) => m.id === menu.id_parent);

  return (
    <div
      className={`${styles.menuCard} ${
        menu.activo ? styles.activo : styles.inactivo
      }`}
    >
      <div className={styles.cardHeader}>
        <div className={styles.avatar}>
          <FontAwesomeIcon icon={faBars} />
        </div>
        <div className={styles.menuMain}>
          <h4 className={styles.menuName}>{menu.nombre}</h4>
          <p className={styles.menuPath}>
            <FontAwesomeIcon icon={faLink} />
            {menu.ruta || "Sin ruta"}
          </p>
        </div>
        <button
          className={styles.editButton}
          onClick={handleEdit}
          title="Editar menú"
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.menuInfo}>
          <div className={styles.infoRow}>
            <FontAwesomeIcon icon={faIcons} className={styles.infoIcon} />
            <span className={styles.infoText}>{menu.icono || "Sin icono"}</span>
          </div>
          <div className={styles.infoRow}>
            <FontAwesomeIcon icon={faListOl} className={styles.infoIcon} />
            <span className={styles.infoText}>Orden: {menu.orden || "—"}</span>
          </div>
          {menuPadre && (
            <div className={styles.infoRow}>
              <FontAwesomeIcon icon={faFolder} className={styles.infoIcon} />
              <span className={styles.infoText}>Padre: {menuPadre.nombre}</span>
            </div>
          )}
        </div>

        <div className={styles.cardFooter}>
          <span
            className={`${styles.statusBadge} ${
              menu.activo ? styles.active : styles.inactive
            }`}
          >
            {menu.activo ? (
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

// Componente Modal de Menú
const MenuModal = React.memo(
  ({
    modoEdicion,
    formData,
    permisos,
    pestañaActiva,
    areaSeleccionada,
    roles,
    areas,
    cargosFiltrados,
    menus,
    camposIncompletos,
    onChange,
    onAreaChange,
    onTogglePermiso,
    onPestañaChange,
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
            <h2>{modoEdicion ? "Editar Menú" : "Nuevo Menú"}</h2>
            <button className={styles.modalClose} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Pestañas */}
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tab} ${
                pestañaActiva === "datos" ? styles.activeTab : ""
              }`}
              onClick={() => onPestañaChange("datos")}
            >
              <FontAwesomeIcon icon={faBars} />
              Datos del Menú
            </button>
            <button
              className={`${styles.tab} ${
                pestañaActiva === "permisos" ? styles.activeTab : ""
              }`}
              onClick={() => onPestañaChange("permisos")}
            >
              <FontAwesomeIcon icon={faUserShield} />
              Permisos
            </button>
          </div>

          <div className={styles.modalBody}>
            {pestañaActiva === "datos" && (
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
                      placeholder="Ej: Dashboard, Usuarios"
                    />
                    <label className={styles.formLabel}>
                      <FontAwesomeIcon icon={faBars} />
                      Nombre del Menú *
                    </label>
                  </div>

                  <div className={`${styles.formGroup} ${styles.floating}`}>
                    <input
                      type="text"
                      name="ruta"
                      value={formData.ruta}
                      onChange={onChange}
                      className={`${styles.formInput} ${
                        !formData.ruta ? styles.inputError : ""
                      }`}
                      placeholder="Ej: /dashboard, /usuarios"
                    />
                    <label className={styles.formLabel}>
                      <FontAwesomeIcon icon={faLink} />
                      Ruta *
                    </label>
                  </div>

                  <div className={`${styles.formGroup} ${styles.floating}`}>
                    <input
                      type="text"
                      name="icono"
                      value={formData.icono}
                      onChange={onChange}
                      className={styles.formInput}
                      placeholder="Ej: faHome, faUsers"
                    />
                    <label className={styles.formLabel}>
                      <FontAwesomeIcon icon={faIcons} />
                      Icono
                    </label>
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className={styles.formColumn}>
                  <div className={`${styles.formGroup} ${styles.floating}`}>
                    <input
                      type="number"
                      name="orden"
                      value={formData.orden}
                      onChange={onChange}
                      className={styles.formInput}
                      placeholder="Número de orden"
                    />
                    <label className={styles.formLabel}>
                      <FontAwesomeIcon icon={faListOl} />
                      Orden
                    </label>
                  </div>

                  <div className={`${styles.formGroup} ${styles.floating}`}>
                    <select
                      name="id_parent"
                      value={formData.id_parent}
                      onChange={onChange}
                      className={styles.formSelect}
                    >
                      <option value="">(Menú principal)</option>
                      {menus.map((menu) => (
                        <option key={menu.id} value={menu.id}>
                          {menu.nombre}
                        </option>
                      ))}
                    </select>
                    <label className={styles.formLabel}>
                      <FontAwesomeIcon icon={faFolder} />
                      Menú Padre
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
            )}

            {pestañaActiva === "permisos" && (
              <div className={styles.permisosContainer}>
                <div className={styles.filtroArea}>
                  <h4>
                    <FontAwesomeIcon icon={faFilter} />
                    Filtrar cargos por área:
                  </h4>
                  <select
                    value={areaSeleccionada}
                    onChange={onAreaChange}
                    className={styles.areaSelector}
                  >
                    <option value="">Todas las áreas</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.permisosSection}>
                  <h4>
                    <FontAwesomeIcon icon={faUserShield} />
                    Permisos por Rol
                  </h4>
                  <PermisosTabla
                    tipo="roles"
                    items={roles}
                    permisos={permisos}
                    togglePermiso={onTogglePermiso}
                  />
                </div>

                <div className={styles.permisosSection}>
                  <h4>
                    <FontAwesomeIcon icon={faUserShield} />
                    Permisos por Cargo{" "}
                    {areaSeleccionada && "(Filtrado por área)"}
                  </h4>
                  <PermisosTabla
                    tipo="cargos"
                    items={cargosFiltrados}
                    permisos={permisos}
                    togglePermiso={onTogglePermiso}
                    mostrarArea={true}
                    areas={areas}
                  />
                </div>
              </div>
            )}
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
              {modoEdicion ? "Actualizar" : "Crear"} Menú
            </button>
          </div>
        </div>
      </div>
    );
  }
);

// Componente de Tabla de Permisos
const PermisosTabla = React.memo(
  ({
    tipo,
    items,
    permisos,
    togglePermiso,
    mostrarArea = false,
    areas = [],
  }) => {
    const getAreaNombre = (idArea) => {
      const area = areas.find((a) => a.id == idArea);
      return area ? area.nombre : "";
    };

    if (!items || items.length === 0) {
      return (
        <div className={styles.emptyPermisos}>
          No hay {tipo === "roles" ? "roles" : "cargos"} disponibles
        </div>
      );
    }

    return (
      <div className={styles.permisosTableContainer}>
        <table className={styles.permisosTable}>
          <thead>
            <tr>
              <th>{tipo === "roles" ? "Rol" : "Cargo"}</th>
              {mostrarArea && <th>Área</th>}
              <th title="Ver">
                <FontAwesomeIcon icon={faEye} />
              </th>
              <th title="Crear">C</th>
              <th title="Editar">E</th>
              <th title="Eliminar">D</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className={styles.permisoNombre}>
                  {item.descripcion || item.nombre}
                </td>
                {mostrarArea && (
                  <td className={styles.permisoArea}>
                    {getAreaNombre(item.id_area)}
                  </td>
                )}
                {["ver", "crear", "editar", "eliminar"].map((perm) => (
                  <td key={perm} className={styles.permisoCheckbox}>
                    <input
                      type="checkbox"
                      checked={!!permisos?.[tipo]?.[item.id]?.[perm]}
                      onChange={() => togglePermiso(tipo, item.id, perm)}
                      className={styles.permisoInput}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

export default Menus;
