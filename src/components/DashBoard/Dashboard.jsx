import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useEmpresa } from "../../contexts/EmpresaContext";
import { useDynamicMenu } from "../../hooks/useDynamicMenu";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../contexts/NotificationContext";
import LoadingScreen from "../UI/LoadingScreen";
import styles from "./Dashboard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCog,
  faUsers,
  faBell,
  faEdit,
  faChartLine,
  faShieldAlt,
  faRocket,
  faPhoneAlt,
  faEnvelope,
  faGlobe,
  faMapMarkerAlt,
  faAngleRight,
  faCheckCircle,
  faExclamationTriangle,
  faClock,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const Dashboard = () => {
  const { user: currentUser } = useAuth();
  const { empresa } = useEmpresa();
  const { menu, userInfo, loading: menuLoading, error } = useDynamicMenu();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // VERIFICAR SI ES LA PRIMERA VEZ QUE INGRESA EN ESTA SESIÓN
    // sessionStorage se limpia automáticamente al cerrar la pestaña/navegador
    const hasRedirectedThisSession = sessionStorage.getItem(
      "hasRedirectedThisSession"
    );

    if (!hasRedirectedThisSession && currentUser) {
      // Mostrar notificación de bienvenida solo la primera vez
      addNotification({
        message: "Ha iniciado sesión correctamente.",
        type: "success",
      });

      // Solo redirigir si es la primera vez en esta sesión
      if (currentUser.area_nombre === "Cajas" && isMobile) {
        sessionStorage.setItem("hasRedirectedThisSession", "true");
        navigate("/CVM");
        return;
      }

      if (currentUser.area_nombre === "Carnes") {
        sessionStorage.setItem("hasRedirectedThisSession", "true");
        navigate("/formulario_pedidos_carnes");
        return;
      }

      // Marcar que ya se verificó la redirección para esta sesión
      sessionStorage.setItem("hasRedirectedThisSession", "true");
    }

    const handleResize = () => {
      if (window.innerWidth < 856 && !isSmallScreen) {
        setIsSmallScreen(true);
      } else if (window.innerWidth >= 856 && isSmallScreen) {
        setIsSmallScreen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isSmallScreen, currentUser, navigate, addNotification]);

  const [stats, setStats] = useState({
    usuariosActivos: 0,
    funcionesDisponibles: 0,
    permisosTotales: 0,
    ultimoAcceso: new Date().toLocaleDateString(),
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFunciones, setFilteredFunciones] = useState([]);

  const empresaNombre = useMemo(() => {
    return empresa === "abastecemos"
      ? "Abastecemos de Occidente S.A.S"
      : "Tobar Sanchez Vallejo S.A";
  }, [empresa]);

  const usuarioCompleto = useMemo(
    () => ({
      ...currentUser,
      ...userInfo,
    }),
    [currentUser, userInfo]
  );

  const saludo = useMemo(() => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 18) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  const funcionesDisponibles = useMemo(() => {
    if (!Array.isArray(menu)) return [];

    return menu.flatMap((item) => {
      const items = [];
      if (item.ruta && item.ruta !== "#") {
        items.push({ ...item, tipo: "principal" });
      }
      if (item.children && item.children.length > 0) {
        items.push(
          ...item.children.map((child) => ({
            ...child,
            tipo: "submenu",
            parent: item.nombre,
          }))
        );
      }
      return items;
    });
  }, [menu]);

  // Filtrar funciones basado en búsqueda
  useEffect(() => {
    if (searchTerm) {
      const filtered = funcionesDisponibles.filter(
        (item) =>
          item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.descripcion &&
            item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredFunciones(filtered);
    } else {
      setFilteredFunciones(funcionesDisponibles);
    }
  }, [searchTerm, funcionesDisponibles]);

  // Simular estadísticas
  useEffect(() => {
    if (funcionesDisponibles.length > 0) {
      setStats((prev) => ({
        ...prev,
        funcionesDisponibles: funcionesDisponibles.length,
        permisosTotales: funcionesDisponibles.reduce((total, item) => {
          return (
            total + Object.values(item.permisos || {}).filter(Boolean).length
          );
        }, 0),
      }));
    }
  }, [funcionesDisponibles]);

  const handleEditarPerfil = () => {
    navigate("/perfil");
  };

  const handleNavigateTo = (ruta) => {
    if (ruta && ruta !== "#") {
      navigate(ruta);
    }
  };

  const getPermisoColor = (tipo) => {
    const colors = {
      ver: "#3b82f6",
      crear: "#10b981",
      editar: "#f59e0b",
      eliminar: "#ef4444",
    };
    return colors[tipo] || "#6b7280";
  };

  const getPermisoIcon = (tipo) => {
    const icons = {
      ver: faCheckCircle,
      crear: faRocket,
      editar: faEdit,
      eliminar: faExclamationTriangle,
    };
    return icons[tipo] || faCheckCircle;
  };

  const funcionesAMostrar = searchTerm
    ? filteredFunciones
    : funcionesDisponibles;

  if (!currentUser) {
    return <LoadingScreen message="Cargando información del usuario..." />;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className={styles.errorIcon}
          />
          <h2>Error cargando el dashboard</h2>
          <p>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Panel principal del sistema {empresaNombre}
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {/* Welcome Card */}
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeContent}>
            <div className={styles.welcomeText}>
              <h2>
                {saludo},{" "}
                <span className={styles.userHighlight}>
                  {usuarioCompleto.nombres_completos || "Usuario"}
                </span>
                👋
              </h2>
              <p>Bienvenido al sistema de gestión empresarial</p>
              <div className={styles.userBadges}>
                <span className={styles.userBadge}>
                  <FontAwesomeIcon icon={faUser} />
                  {usuarioCompleto.rol_descripcion ||
                    usuarioCompleto.cargo ||
                    "Usuario"}
                </span>
                <span className={styles.userBadge}>
                  <FontAwesomeIcon icon={faClock} />
                  Último acceso: {stats.ultimoAcceso}
                </span>
              </div>
            </div>
            <div className={styles.welcomeActions}>
              <button
                className={styles.profileButton}
                onClick={handleEditarPerfil}
              >
                <FontAwesomeIcon icon={faEdit} />
                Editar Perfil
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FontAwesomeIcon icon={faCog} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats.funcionesDisponibles}</h3>
              <p>Funciones Disponibles</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FontAwesomeIcon icon={faShieldAlt} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats.permisosTotales}</h3>
              <p>Permisos Totales</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <div className={styles.statContent}>
              <h3>100%</h3>
              <p>Sistema Operativo</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={styles.mainGrid}>
          {/* Funciones Disponibles */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleSection}>
                <FontAwesomeIcon icon={faCog} className={styles.cardIcon} />
                <h3>Funciones Disponibles</h3>
                <span className={styles.funcionesCount}>
                  {funcionesAMostrar.length}{" "}
                  {searchTerm ? "resultados" : "funciones"}
                </span>
              </div>
              <div className={styles.searchSection}>
                <div className={styles.searchInputContainer}>
                  <FontAwesomeIcon
                    icon={faSearch}
                    className={styles.searchIcon}
                  />
                  <input
                    type="text"
                    placeholder="Buscar funciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                  {searchTerm && (
                    <button
                      className={styles.clearSearch}
                      onClick={() => setSearchTerm("")}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.cardContent}>
              {menuLoading ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <span>Cargando funciones...</span>
                </div>
              ) : funcionesAMostrar.length === 0 ? (
                <div className={styles.emptyState}>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <span>
                    {searchTerm
                      ? `No se encontraron funciones para "${searchTerm}"`
                      : "No hay funciones disponibles"}
                  </span>
                  {searchTerm && (
                    <button
                      className={styles.clearFilterButton}
                      onClick={() => setSearchTerm("")}
                    >
                      Limpiar búsqueda
                    </button>
                  )}
                </div>
              ) : (
                <div className={styles.funcionesContainer}>
                  <div className={styles.funcionesGrid}>
                    {funcionesAMostrar.map((item) => (
                      <div
                        key={item.id_menu}
                        className={styles.funcionCard}
                        onClick={() => handleNavigateTo(item.ruta)}
                      >
                        <div className={styles.funcionHeader}>
                          <div className={styles.funcionIcon}>
                            <FontAwesomeIcon icon={faAngleRight} />
                          </div>
                          <div className={styles.funcionTitle}>
                            <h4>{item.nombre}</h4>
                            {item.tipo === "submenu" && (
                              <span className={styles.parentLabel}>
                                {item.parent}
                              </span>
                            )}
                          </div>
                          <div className={styles.permisosBadges}>
                            {Object.entries(item.permisos || {}).map(
                              ([perm, activo]) =>
                                activo && (
                                  <div
                                    key={perm}
                                    className={styles.permisoBadge}
                                    style={{
                                      "--permiso-color": getPermisoColor(perm),
                                    }}
                                    title={
                                      perm.charAt(0).toUpperCase() +
                                      perm.slice(1)
                                    }
                                  >
                                    <FontAwesomeIcon
                                      icon={getPermisoIcon(perm)}
                                      className={styles.permisoIcon}
                                    />
                                  </div>
                                )
                            )}
                          </div>
                        </div>
                        {item.descripcion && (
                          <p className={styles.funcionDescription}>
                            {item.descripcion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información de Contacto */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <FontAwesomeIcon icon={faUsers} className={styles.cardIcon} />
              <h3>Soporte y Contacto</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.contactGrid}>
                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <FontAwesomeIcon icon={faPhoneAlt} />
                  </div>
                  <div className={styles.contactInfo}>
                    <span className={styles.contactLabel}>Teléfono</span>
                    <span className={styles.contactValue}>
                      669 5778 | Ext 132 - 109
                    </span>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <div className={styles.contactInfo}>
                    <span className={styles.contactLabel}>Email</span>
                    <a
                      href="mailto:sistemas@supermercadobelalcazar.com.co"
                      className={styles.contactLink}
                    >
                      sistemas@supermercadobelalcazar.com.co
                    </a>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <FontAwesomeIcon icon={faGlobe} />
                  </div>
                  <div className={styles.contactInfo}>
                    <span className={styles.contactLabel}>Sitio Web</span>
                    <a
                      href="https://supermercadobelalcazar.com.co"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.contactLink}
                    >
                      supermercadobelalcazar.com.co
                    </a>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </div>
                  <div className={styles.contactInfo}>
                    <span className={styles.contactLabel}>Dirección</span>
                    <span className={styles.contactValue}>
                      Cra. 5 # 5-48, Yumbo, Valle del Cauca
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className={styles.systemCard}>
          <div className={styles.systemContent}>
            <div className={styles.systemIcon}>
              <FontAwesomeIcon icon={faBell} />
            </div>
            <div className={styles.systemInfo}>
              <h4>¿Necesitas ayuda?</h4>
              <p>
                Si tienes alguna pregunta o necesitas asistencia con el sistema,
                no dudes en contactar a nuestro equipo de soporte técnico.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
