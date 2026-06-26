import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import styles from "./Menus.module.css";
import { apiService } from "../../../services/api";
import { useNavigate } from "react-router-dom";
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
  faBars,
  faLink,
  faIcons,
  faListOl,
  faFolder,
  faCheck,
  faEye,
  faUserShield,
  faFilter,
  faGripLines,
  faComputer,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Menus = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  // Permisos del usuario sobre ESTE modulo (/configuracion/menus), resueltos
  // por la ruta actual. Reemplazan al antiguo control "rol === 1".
  const {
    puedeVer,
    puedeCrear,
    puedeEditar,
    loading: permisosLoading,
  } = usePermisos();

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

  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [menuActual, setMenuActual] = useState(null);
  const [pestañaActiva, setPestañaActiva] = useState("datos");

  const [cargosFiltrados, setCargosFiltrados] = useState([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState("");

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

  // ── Drag & Drop state ──────────────────────────────────────────────
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  // Snapshot de orden antes de que empiece el drag (para restaurar en cancel)
  const originalOrderRef = useRef(null);
  // Lista con reordenamiento en vivo durante el drag
  const [liveMenus, setLiveMenus] = useState([]);

  const camposIncompletos = useMemo(
    () => !formData.nombre.trim() || !formData.ruta.trim(),
    [formData.nombre, formData.ruta],
  );

  // Cuando no hay drag activo usa `menus` ordenados; durante el drag usa `liveMenus`
  const menusFiltrados = useMemo(() => {
    const base = draggingId
      ? [...liveMenus]
      : [...menus].sort(
          (a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0),
        );

    if (!search) return base;
    const texto = search.toLowerCase();
    return base.filter((m) =>
      Object.values(m).some(
        (value) => value && value.toString().toLowerCase().includes(texto),
      ),
    );
  }, [menus, liveMenus, draggingId, search]);

  useEffect(() => {
    if (puedeVer) cargarDatos();
  }, [puedeVer]);

  // Expulsion en vivo: si se revoca el permiso de ver mientras el usuario
  // esta dentro, se le saca del modulo (el arbol se refresca periodicamente).
  useEffect(() => {
    if (!permisosLoading && !puedeVer) {
      addNotification({
        message: "Se revocaron tus permisos para este modulo.",
        type: "error",
      });
      navigate("/inicio", { replace: true });
    }
  }, [permisosLoading, puedeVer, navigate, addNotification]);

  useEffect(() => {
    if (areaSeleccionada) {
      setCargosFiltrados(cargos.filter((c) => c.id_area == areaSeleccionada));
    } else {
      setCargosFiltrados(cargos);
    }
  }, [areaSeleccionada, cargos]);

  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [menusRes, rolesRes, areasRes, cargosRes] = await Promise.all([
        apiService.getMenus(),
        apiService.getRoles(),
        apiService.getAreas(),
        apiService.getCargos(),
      ]);

      const menusObtenidos = menusRes.data ?? menusRes;
      menusObtenidos.sort(
        (a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0),
      );

      setMenus(menusObtenidos);
      setRoles(rolesRes.data ?? rolesRes);
      setAreas(areasRes.data ?? areasRes);
      setCargos(cargosRes.data ?? cargosRes);
      setCargosFiltrados(cargosRes.data ?? cargosRes);
      setTotalPaginas(1);
      setTotalMenus(menusObtenidos.length ?? 0);
    } catch {
      addNotification({
        message: "Error en la comunicacion con el servidor",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  // Drag handlers
  const handleDragStart = useCallback(
    (e, id) => {
      e.dataTransfer.effectAllowed = "move";
      // Snapshot + inicializar lista en vivo
      const sorted = [...menus].sort(
        (a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0),
      );
      originalOrderRef.current = sorted;
      setLiveMenus(sorted);
      setDraggingId(id);
      setDragOverId(id); // inicialmente apunta a sí mismo
    },
    [menus],
  );

  const handleDragEnter = useCallback(
    (e, id) => {
      e.preventDefault();
      if (!draggingId || id === draggingId) return;

      setDragOverId(id);

      // Reordenar la lista en vivo para mostrar el intercambio
      setLiveMenus((prev) => {
        const next = [...prev];
        const fromIdx = next.findIndex((m) => m.id === draggingId);
        const toIdx = next.findIndex((m) => m.id === id);
        if (fromIdx === -1 || toIdx === -1) return prev;
        const [removed] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, removed);
        return next;
      });
    },
    [draggingId],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDragEnd = useCallback(
    async (e) => {
      if (!draggingId) return;

      const finalList = liveMenus.length
        ? liveMenus
        : (originalOrderRef.current ?? []);

      const listaActualizada = finalList.map((item, index) => ({
        ...item,
        orden: index + 1,
      }));

      const payloadMasivo = listaActualizada
        .filter((item) => {
          const original = menus.find((m) => m.id === item.id);
          return original && original.orden !== item.orden;
        })
        .map((item) => ({ id: item.id, orden: item.orden }));

      // Actualización optimista
      setMenus(listaActualizada);

      // Limpiar estado drag
      setDraggingId(null);
      setDragOverId(null);
      setLiveMenus([]);
      originalOrderRef.current = null;

      if (payloadMasivo.length > 0) {
        setCargando(true);
        try {
          await apiService.updateMenuBulkOrder(payloadMasivo);
          addNotification({
            message: "Estructura de navegacion actualizada",
            type: "success",
          });
        } catch {
          addNotification({
            message:
              "Error de sincronizacion. Se restaurara la estructura anterior.",
            type: "error",
          });
          cargarDatos();
        } finally {
          setCargando(false);
        }
      }
    },
    [draggingId, liveMenus, menus],
  );

  const handleDragLeaveGrid = useCallback((e) => {
    // Solo cancela si realmente sale del grid (no entre hijos)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverId(null);
    }
  }, []);

  // ── Resto de handlers sin cambios ─────────────────────────────────
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => setPagina(1), 500));
  };

  const abrirModalNuevo = async () => {
    if (!roles.length || !areas.length || !cargos.length) await cargarDatos();
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
    if (!roles.length || !areas.length || !cargos.length) await cargarDatos();
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
        addNotification({
          message: "El nombre es un parametro obligatorio",
          type: "error",
        });
        return;
      }
      if (camposIncompletos) {
        addNotification({
          message: "Por favor complete todos los campos requeridos",
          type: "error",
        });
        return;
      }
      if ((modoEdicion && !puedeEditar) || (!modoEdicion && !puedeCrear)) {
        addNotification({
          message: "No tienes permiso para realizar esta accion.",
          type: "error",
        });
        return;
      }
      const payload = {
        ...formData,
        permisos,
        id_parent: formData.id_parent || null,
      };
      if (modoEdicion) {
        await apiService.updateMenu(menuActual.id, payload);
        addNotification({
          message: "Menu actualizado exitosamente",
          type: "success",
        });
      } else {
        await apiService.createMenu(payload);
        addNotification({
          message: "Menu registrado exitosamente",
          type: "success",
        });
      }
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      addNotification({
        message: "Fallo en operacion: " + (error.message || ""),
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

  const handleAreaChange = (e) => setAreaSeleccionada(e.target.value);

  const togglePermiso = (tipo, id, campo) => {
    setPermisos((prev) => {
      const actual = prev[tipo]?.[id] || {};
      const nuevoValor = !actual[campo];
      let entrada = { ...actual, [campo]: nuevoValor };

      // Coherencia con get_menu_user.php (exige ver=1 para mostrar el menú):
      // - Si se desactiva "ver", se limpian las acciones dependientes.
      // - Si se activa una acción dependiente, se fuerza "ver".
      if (campo === "ver" && !nuevoValor) {
        entrada = { ver: false, crear: false, editar: false, eliminar: false };
      } else if (campo !== "ver" && nuevoValor) {
        entrada.ver = true;
      }

      return {
        ...prev,
        [tipo]: {
          ...prev[tipo],
          [id]: entrada,
        },
      };
    });
  };

  if (permisosLoading) {
    return <LoadingScreen message="Verificando permisos..." />;
  }

  if (!puedeVer) {
    return (
      <div className={styles.container}>
        <div className={styles.errorPermisos}>
          <h2>Restriccion de Seguridad</h2>
          <p>
            Credenciales insuficientes para acceder al modulo de configuracion.
          </p>
        </div>
      </div>
    );
  }

  if (cargando && pagina === 1) {
    return <LoadingScreen message="Procesando datos del servidor..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Gestion Estructural de Menus</h1>
          <p className={styles.subtitle}>
            Administracion jerarquica y asignacion de atributos de acceso
          </p>
        </div>
      </div>

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
              placeholder="Filtro global..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <button
            className={styles.refreshButton}
            onClick={cargarDatos}
            title="Sincronizar base de datos"
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
        </div>
        {puedeCrear && (
          <button className={styles.createButton} onClick={abrirModalNuevo}>
            <FontAwesomeIcon icon={faPlus} /> Nuevo Menu
          </button>
        )}
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalMenus}</span>
          <span className={styles.statLabel}>Registros totales</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {menus.filter((m) => m.activo).length}
          </span>
          <span className={styles.statLabel}>Modulos activos</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {menus.filter((m) => !m.activo).length}
          </span>
          <span className={styles.statLabel}>Modulos inactivos</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {menus.filter((m) => !m.id_parent).length}
          </span>
          <span className={styles.statLabel}>Nodos principales</span>
        </div>
      </div>

      <div className={styles.content}>
        {menusFiltrados.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>
              {search ? "Sin coincidencias de filtro" : "Repositorio vacio"}
            </h3>
            <p>
              {search
                ? "Modifique los parametros de la busqueda actual."
                : "Utilice la herramienta de creacion para añadir el primer nodo."}
            </p>
          </div>
        ) : (
          <>
            {/* Hint de drag cuando hay más de un elemento y no se está buscando */}
            {search.length === 0 &&
              puedeEditar &&
              menusFiltrados.length > 1 &&
              !draggingId && (
                <p className={styles.dragHint}>
                  <FontAwesomeIcon icon={faGripLines} /> Arrastra las tarjetas
                  para reordenar los menús
                </p>
              )}

            <div
              className={`${styles.menusGrid} ${draggingId ? styles.gridDragging : ""}`}
              onDragLeave={handleDragLeaveGrid}
            >
              {menusFiltrados.map((menu, index) => (
                <MenuCard
                  key={menu.id}
                  menu={menu}
                  index={index}
                  onEdit={abrirModalEditar}
                  menus={menus}
                  isDraggable={search.length === 0 && puedeEditar}
                  isDragging={draggingId === menu.id}
                  isDragOver={dragOverId === menu.id && draggingId !== menu.id}
                  isDragActive={!!draggingId}
                  onDragStart={handleDragStart}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  onClick={() => setPagina((p) => Math.max(p - 1, 1))}
                  disabled={pagina === 1}
                >
                  <FontAwesomeIcon icon={faChevronLeft} /> Anterior
                </button>
                <div className={styles.paginationInfo}>
                  Pagina <strong>{pagina}</strong> de{" "}
                  <strong>{totalPaginas}</strong>
                </div>
                <button
                  className={styles.paginationButton}
                  onClick={() =>
                    setPagina((p) => Math.min(p + 1, totalPaginas))
                  }
                  disabled={pagina === totalPaginas}
                >
                  Siguiente <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

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
          puedeGuardar={modoEdicion ? puedeEditar : puedeCrear}
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
const MenuCard = React.memo(
  ({
    menu,
    index,
    onEdit,
    menus,
    isDraggable,
    isDragging,
    isDragOver,
    isDragActive,
    onDragStart,
    onDragEnter,
    onDragOver,
    onDragEnd,
  }) => {
    const handleEdit = useCallback(() => onEdit(menu), [menu, onEdit]);
    const menuPadre = menus.find((m) => m.id === menu.id_parent);

    const cardClass = [
      styles.menuCard,
      menu.activo ? styles.activo : styles.inactivo,
      isDragging ? styles.cardDragging : "",
      isDragOver ? styles.cardDragOver : "",
      isDragActive && !isDragging && !isDragOver ? styles.cardDimmed : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        className={cardClass}
        style={{ "--card-index": index }}
        draggable={isDraggable}
        onDragStart={(e) => isDraggable && onDragStart(e, menu.id)}
        onDragEnter={(e) => isDraggable && onDragEnter(e, menu.id)}
        onDragOver={isDraggable ? onDragOver : undefined}
        onDragEnd={isDraggable ? onDragEnd : undefined}
      >
        {/* Indicador de destino visual */}
        {isDragOver && <div className={styles.dropIndicator} />}

        {/* Punto de estado minimalista */}
        <span
          className={styles.statusDot}
          title={menu.activo ? "En línea" : "Fuera de servicio"}
        />

        <div className={styles.cardTop}>
          <div className={styles.avatar}>
            <FontAwesomeIcon icon={menu.icono ? faIcons : faBars} />
          </div>

          <div className={styles.menuDetails}>
            <div className={styles.titleRow}>
              <h4 className={styles.menuName}>{menu.nombre}</h4>
              <span className={styles.orderLabel}>#{menu.orden}</span>
            </div>
            <p className={styles.menuPath}>{menu.ruta || "Ruta no definida"}</p>
          </div>
        </div>

        <div className={styles.cardMeta}>
          <div className={styles.metaBadge}>
            <FontAwesomeIcon icon={faFolder} className={styles.metaIcon} />
            <span>{menuPadre ? menuPadre.nombre : "Menú Raíz"}</span>
          </div>
          <div className={styles.metaBadge}>
            <FontAwesomeIcon icon={faLink} className={styles.metaIcon} />
            <span>{menu.icono || "faBars"}</span>
          </div>
        </div>

        <div className={styles.cardActions}>
          {isDraggable && (
            <div className={styles.dragHandle} title="Reordenar">
              <FontAwesomeIcon icon={faGripLines} />
            </div>
          )}
          <button className={styles.editActionBtn} onClick={handleEdit}>
            <FontAwesomeIcon icon={faEdit} />
            <span>Propiedades</span>
          </button>
        </div>
      </div>
    );
  },
);

// MenuModa
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
    puedeGuardar,
    onChange,
    onAreaChange,
    onTogglePermiso,
    onPestañaChange,
    onSave,
    onClose,
  }) => {
    const [tipoPermisoTab, setTipoPermisoTab] = useState("roles");

    // Lógica para alternar masivamente los Roles visibles basados en tu objeto de permisos
    const toggleTodosRoles = () => {
      const todosMarcados = roles.every((r) => !!permisos?.roles?.[r.id]?.ver);
      roles.forEach((r) => {
        if (todosMarcados) {
          // Si todos estan marcados, los desmarcamos quitando todos los flags
          if (permisos?.roles?.[r.id]?.ver)
            onTogglePermiso("roles", r.id, "ver");
          if (permisos?.roles?.[r.id]?.crear)
            onTogglePermiso("roles", r.id, "crear");
          if (permisos?.roles?.[r.id]?.editar)
            onTogglePermiso("roles", r.id, "editar");
          if (permisos?.roles?.[r.id]?.eliminar)
            onTogglePermiso("roles", r.id, "eliminar");
        } else {
          // Si falta alguno, marcamos la visualizacion basica 'ver'
          if (!permisos?.roles?.[r.id]?.ver)
            onTogglePermiso("roles", r.id, "ver");
        }
      });
    };

    // Lógica para alternar masivamente los Cargos filtrados actuales
    const toggleTodosCargos = () => {
      const todosMarcados = cargosFiltrados.every(
        (c) => !!permisos?.cargos?.[c.id]?.ver,
      );
      cargosFiltrados.forEach((c) => {
        if (todosMarcados) {
          if (permisos?.cargos?.[c.id]?.ver)
            onTogglePermiso("cargos", c.id, "ver");
          if (permisos?.cargos?.[c.id]?.crear)
            onTogglePermiso("cargos", c.id, "crear");
          if (permisos?.cargos?.[c.id]?.editar)
            onTogglePermiso("cargos", c.id, "editar");
          if (permisos?.cargos?.[c.id]?.eliminar)
            onTogglePermiso("cargos", c.id, "eliminar");
        } else {
          if (!permisos?.cargos?.[c.id]?.ver)
            onTogglePermiso("cargos", c.id, "ver");
        }
      });
    };

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

          <div className={styles.tabContainer}>
            <button
              className={`${styles.tab} ${pestañaActiva === "datos" ? styles.activeTab : ""}`}
              onClick={() => onPestañaChange("datos")}
            >
              <FontAwesomeIcon icon={faBars} /> Datos del Menú
            </button>
            <button
              className={`${styles.tab} ${pestañaActiva === "permisos" ? styles.activeTab : ""}`}
              onClick={() => onPestañaChange("permisos")}
            >
              <FontAwesomeIcon icon={faUserShield} /> Permisos
            </button>
          </div>

          <div className={styles.modalBody}>
            {pestañaActiva === "datos" && (
              <div className={styles.formColumns}>
                <div className={styles.formColumn}>
                  <div className={`${styles.formGroup} ${styles.floating}`}>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={onChange}
                      className={`${styles.formInput} ${!formData.nombre ? styles.inputError : ""}`}
                      placeholder="Ej: Dashboard, Usuarios"
                    />
                    <label className={styles.formLabel}>
                      <FontAwesomeIcon icon={faBars} /> Nombre del Menú *
                    </label>
                  </div>
                  <div className={`${styles.formGroup} ${styles.floating}`}>
                    <input
                      type="text"
                      name="ruta"
                      value={formData.ruta}
                      onChange={onChange}
                      className={`${styles.formInput} ${!formData.ruta ? styles.inputError : ""}`}
                      placeholder="Ej: /dashboard, /usuarios"
                    />
                    <label className={styles.formLabel}>
                      <FontAwesomeIcon icon={faLink} /> Ruta *
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
                      <FontAwesomeIcon icon={faIcons} /> Icono
                    </label>
                  </div>
                </div>
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
                      <FontAwesomeIcon icon={faListOl} /> Orden
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
                      {menus.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>
                    <label className={styles.formLabel}>
                      <FontAwesomeIcon icon={faFolder} /> Menú Padre
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
                      <FontAwesomeIcon icon={faCheckCircle} /> Estado
                    </label>
                  </div>
                </div>
              </div>
            )}

            {pestañaActiva === "permisos" && (
              <div className={styles.politicasAccesoContainer}>
                <div className={styles.tipoPermisoNavbar}>
                  <button
                    type="button"
                    className={`${styles.subTabBtn} ${tipoPermisoTab === "roles" ? styles.subTabActive : ""}`}
                    onClick={() => setTipoPermisoTab("roles")}
                  >
                    Roles del Sistema
                  </button>
                  <button
                    type="button"
                    className={`${styles.subTabBtn} ${tipoPermisoTab === "cargos" ? styles.subTabActive : ""}`}
                    onClick={() => setTipoPermisoTab("cargos")}
                  >
                    Estructura por Cargos
                  </button>
                </div>

                {tipoPermisoTab === "roles" ? (
                  <div className={styles.seccionPermisosDinamica}>
                    <div className={styles.headerLine}>
                      <h4>Roles con Autorizacion</h4>
                      <button
                        type="button"
                        className={styles.btnToggleAll}
                        onClick={toggleTodosRoles}
                      >
                        {roles.every((r) => !!permisos?.roles?.[r.id]?.ver)
                          ? "Desmarcar Todos"
                          : "Seleccionar Todos"}
                      </button>
                    </div>
                    <PermisosTabla
                      tipo="roles"
                      items={roles}
                      permisos={permisos}
                      togglePermiso={onTogglePermiso}
                    />
                  </div>
                ) : (
                  <div className={styles.seccionPermisosDinamica}>
                    <div className={styles.filtroAreaRow}>
                      <label>
                        <FontAwesomeIcon icon={faFilter} /> Filtrar Estructura
                        por Area:
                      </label>
                      <select value={areaSeleccionada} onChange={onAreaChange}>
                        <option value="">[ Mostrar Todas las Areas ]</option>
                        {areas.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.descripcion || a.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.headerLine}>
                      <h4>Cargos Corporativos</h4>
                      <button
                        type="button"
                        className={styles.btnToggleAll}
                        onClick={toggleTodosCargos}
                      >
                        {cargosFiltrados.every(
                          (c) => !!permisos?.cargos?.[c.id]?.ver,
                        )
                          ? "Desmarcar Filtrados"
                          : "Seleccionar Filtrados"}
                      </button>
                    </div>

                    <PermisosTabla
                      tipo="cargos"
                      items={cargosFiltrados}
                      permisos={permisos}
                      togglePermiso={onTogglePermiso}
                      mostrarArea
                      areas={areas}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.modalActions}>
            <button className={styles.cancelButton} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} /> Cancelar
            </button>
            <button
              className={`${styles.saveButton} ${camposIncompletos || !puedeGuardar ? styles.disabled : ""}`}
              onClick={onSave}
              disabled={camposIncompletos || !puedeGuardar}
            >
              <FontAwesomeIcon icon={faCheck} />{" "}
              {modoEdicion ? "Actualizar" : "Crear"} Menú
            </button>
          </div>
        </div>
      </div>
    );
  },
);

// PermisosTabla
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
              <th title="Acceder / ver el menú">
                <FontAwesomeIcon icon={faEye} /> Ver
              </th>
              <th title="Crear registros">Crear</th>
              <th title="Editar registros">Editar</th>
              <th title="Eliminar registros">Eliminar</th>
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
                {["ver", "crear", "editar", "eliminar"].map((perm) => {
                  const puedeVer = !!permisos?.[tipo]?.[item.id]?.ver;
                  const dependiente = perm !== "ver" && !puedeVer;
                  return (
                    <td key={perm} className={styles.permisoCheckbox}>
                      <input
                        type="checkbox"
                        checked={!!permisos?.[tipo]?.[item.id]?.[perm]}
                        onChange={() => togglePermiso(tipo, item.id, perm)}
                        disabled={dependiente}
                        title={
                          dependiente
                            ? 'Requiere activar "Ver" primero'
                            : undefined
                        }
                        className={styles.permisoInput}
                        style={dependiente ? { opacity: 0.35 } : undefined}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);

export default Menus;
