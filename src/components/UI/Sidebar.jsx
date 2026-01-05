import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNotification } from "../../contexts/NotificationContext";
import { useEmpresa } from "../../contexts/EmpresaContext";
import { menuService } from "../../services/menuService";
import { useAuth } from "../../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faHome,
  faUser,
  faUsers,
  faUserCog,
  faChartBar,
  faList,
  faClipboardList,
  faDollarSign,
  faFile,
  faFilePdf,
  faThLarge,
  faWrench,
  faBoxOpen,
  faBuilding,
  faIdCard,
  faBook,
  faProjectDiagram,
  faCube,
  faFileUpload,
  faChartColumn,
  faExclamationTriangle,
  faAngleDown,
  faAngleRight,
  faShop,
  faAppleWhole,
  faFish,
  faPercent,
  faRulerCombined,
  faUserCheck,
} from "@fortawesome/free-solid-svg-icons";
import Tooltip from "./Tooltip";
import SubmenuTooltip from "./SubmenuTooltip";
import styles from "./Sidebar.module.css";

const Sidebar = ({ collapsed }) => {
  const { addNotification } = useNotification();
  const [menus, setMenus] = useState([]);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const { user } = useAuth();
  const location = useLocation();
  const { empresa } = useEmpresa();

  const iconMap = {
    home: faHome,
    user: faUser,
    user2: faUserCog,
    users: faUsers,
    "bar-chart": faChartBar,
    formatos: faClipboardList,
    costos: faDollarSign,
    list: faList,
    documents: faFile,
    pdf: faFilePdf,
    codificacion: faThLarge,
    admin: faWrench,
    inv: faBoxOpen,
    sedes: faBuilding,
    cargos: faIdCard,
    areas: faBook,
    menu: faProjectDiagram,
    box: faCube,
    file: faFileUpload,
    informes: faChartColumn,
    report: faExclamationTriangle,
    pedidos: faShop,
    fruver: faAppleWhole,
    carnes: faFish,
    porcentaje: faPercent,
    cvm: faRulerCombined,
    proveedor: faUserCheck,
  };

  // Cargar menú desde backend
  useEffect(() => {
    const loadMenu = async () => {
      try {
        if (!empresa || !user?.id) return;
        const { menu } = await menuService.getMenuPorUsuario(user.id);
        setMenus(menu || []);
      } catch (err) {
        addNotification({
          message: "Error cargando menú:",
          err,
          type: "error",
        });
      }
    };
    loadMenu();
  }, [empresa, user?.id]);

  // Función para obtener todas las rutas hijas de un menú
  const getAllChildRoutes = (menu) => {
    const routes = [];
    if (menu.children) {
      menu.children.forEach((child) => {
        routes.push(child.ruta);
        if (child.children) {
          routes.push(...getAllChildRoutes(child));
        }
      });
    }
    return routes;
  };

  // Verificar si un menú debe estar expandido basado en la ruta actual
  const shouldBeExpanded = (menu) => {
    if (!menu.children) return false;
    const childRoutes = getAllChildRoutes(menu);
    return childRoutes.some((route) => location.pathname.startsWith(route));
  };

  // Efecto para expandir automáticamente menús basados en la ruta actual
  useEffect(() => {
    if (!menus.length) return;

    const newExpandedState = { ...expanded };

    menus.forEach((menu, index) => {
      const menuKey = menu.id ?? `menu-${index}`;

      // Si el menú tiene hijos y la ruta actual coincide con alguno de sus hijos
      if (menu.children && menu.children.length > 0) {
        const shouldExpand = shouldBeExpanded(menu);

        // Si debería estar expandido pero no lo está, expandirlo
        if (shouldExpand && !newExpandedState[menuKey]) {
          newExpandedState[menuKey] = true;
        }
      }
    });

    // Solo actualizar si hay cambios
    if (JSON.stringify(newExpandedState) !== JSON.stringify(expanded)) {
      setExpanded(newExpandedState);
    }
  }, [location.pathname, menus]);

  // Efecto para expandir el padre del item activo cuando se carga el menú
  useEffect(() => {
    if (!menus.length) return;

    const activeParent = menus.find((m) =>
      m.children?.some((child) => location.pathname.startsWith(child.ruta))
    );

    if (activeParent) {
      const activeParentKey =
        activeParent.id ?? `menu-${menus.indexOf(activeParent)}`;

      setExpanded((prev) => {
        if (prev[activeParentKey]) {
          return prev; // Ya está expandido
        }
        return {
          ...prev,
          [activeParentKey]: true,
        };
      });
    }
  }, [menus, location.pathname]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Función para manejar hover en menús con hijos
  const handleMenuHover = (menu, index) => {
    if (collapsed && !isMobile && menu.children && menu.children.length > 0) {
      // Limpiar timeout anterior
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      setHoveredMenu({ menu, index });
    }
  };

  const handleMenuLeave = () => {
    // Agregar un delay para permitir la transición al tooltip
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 3000);
  };

  const handleTooltipHover = () => {
    // Limpiar timeout cuando el mouse entra al tooltip
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleTooltipLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 100);
  };

  // Función para envolver elementos con tooltip cuando sea necesario
  const withTooltip = (element, text, key) => {
    if (collapsed && !isMobile) {
      return (
        <div key={key}>
          <Tooltip text={text} position="right">
            {element}
          </Tooltip>
        </div>
      );
    }
    return <div key={key}>{element}</div>;
  };

  const renderMenu = (menu, index) => {
    const menuKey = menu.id ?? `menu-${index}`;
    const Icon = iconMap[menu.icono];
    const hasChildren =
      Array.isArray(menu.children) && menu.children.length > 0;
    const isActive = location.pathname === menu.ruta;
    const isActiveParent = shouldBeExpanded(menu);

    if (hasChildren) {
      const menuHeader = (
        <div
          className={`${styles.navLink} ${
            expanded[menuKey] ? styles.expanded : ""
          } ${isActiveParent ? styles.activeParent : ""} ${
            collapsed ? styles.collapsed : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (!collapsed) {
              toggleExpand(menuKey);
            }
          }}
          onMouseEnter={() => handleMenuHover(menu, index)}
          onMouseLeave={handleMenuLeave}
        >
          {Icon && <FontAwesomeIcon icon={Icon} className={styles.navIcon} />}
          {!collapsed && (
            <>
              <span className={styles.navText}>{menu.nombre}</span>
              <FontAwesomeIcon
                icon={expanded[menuKey] ? faAngleDown : faAngleRight}
                className={styles.arrowIcon}
              />
            </>
          )}
        </div>
      );

      return (
        <div key={menuKey} className={styles.menuSection}>
          {withTooltip(menuHeader, menu.nombre, `header-${menuKey}`)}

          {/* Submenu normal cuando NO está colapsado */}
          {!collapsed && (
            <div
              className={`${styles.submenu} ${
                expanded[menuKey] ? styles.submenuOpen : ""
              }`}
            >
              {menu.children.map((child, idx) => {
                const ChildIcon = iconMap[child.icono];
                const childKey = `child-${menuKey}-${idx}`;
                const isChildActive = location.pathname === child.ruta;

                const subMenuItem = (
                  <Link
                    key={childKey}
                    to={child.ruta}
                    className={`${styles.subLink} ${
                      isChildActive ? styles.active : ""
                    }`}
                    onClick={() => {
                      if (isMobile) setOpen(false);
                    }}
                  >
                    {ChildIcon && (
                      <FontAwesomeIcon
                        icon={ChildIcon}
                        className={styles.subIcon}
                      />
                    )}
                    <span className={styles.subText}>{child.nombre}</span>
                    {isChildActive && (
                      <div className={styles.activeIndicator} />
                    )}
                  </Link>
                );

                return withTooltip(subMenuItem, child.nombre, childKey);
              })}
            </div>
          )}

          {/* Submenu tooltip cuando está colapsado */}
          {collapsed && !isMobile && hoveredMenu?.index === index && (
            <SubmenuTooltip
              menu={menu}
              onClose={handleTooltipLeave}
              onNavigate={() => {
                if (isMobile) setOpen(false);
              }}
              onHover={handleTooltipHover}
            />
          )}
        </div>
      );
    }

    const menuItem = (
      <Link
        to={menu.ruta}
        className={`${styles.navLink} ${isActive ? styles.active : ""} ${
          collapsed ? styles.collapsed : ""
        }`}
        onClick={() => {
          if (isMobile) setOpen(false);
        }}
      >
        {Icon && <FontAwesomeIcon icon={Icon} className={styles.navIcon} />}
        {!collapsed && (
          <>
            <span className={styles.navText}>{menu.nombre}</span>
            {isActive && <div className={styles.activeIndicator} />}
          </>
        )}
      </Link>
    );

    return withTooltip(menuItem, menu.nombre, menuKey);
  };

  return (
    <div className={styles.sidebarWrapper}>
      <button
        className={`${styles.mobileToggle} ${open ? styles.toggleOpen : ""}`}
        onClick={() => setOpen(!open)}
        type="button"
      >
        <FontAwesomeIcon icon={open ? faTimes : faBars} />
      </button>

      <aside
        className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""} ${
          collapsed ? styles.sidebarCollapsed : ""
        }`}
      >
        {!collapsed && (
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>Menú Principal</h3>
          </div>
        )}

        <nav className={styles.nav}>
          {menus.length > 0 ? (
            <div className={styles.menuList}>{menus.map(renderMenu)}</div>
          ) : (
            !collapsed && (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <span>Cargando menú...</span>
              </div>
            )
          )}
        </nav>
      </aside>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)} />
      )}
    </div>
  );
};

export default Sidebar;
