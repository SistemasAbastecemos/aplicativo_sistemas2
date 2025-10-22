import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiService } from "../../services/api";
import { useNotification } from "../../contexts/NotificationContext";
import { useEmpresa } from "../../contexts/EmpresaContext";
import {
  Menu,
  X,
  Home,
  Users,
  BarChart,
  List,
  ClipboardList,
  BadgeDollarSign,
  FileText,
  FileStack,
  Grid2x2Plus,
} from "lucide-react";
import styles from "./Sidebar.module.css";

export default function Sidebar({}) {
  const { addNotification } = useNotification();
  const [menus, setMenus] = useState([]);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const location = useLocation();
  const { empresa } = useEmpresa();

  const iconMap = {
    home: Home,
    users: Users,
    "bar-chart": BarChart,
    formatos: ClipboardList,
    costos: BadgeDollarSign,
    list: List,
    documents: FileText,
    pdf: FileStack,
    codificacion: Grid2x2Plus,
  };

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        if (!empresa) return;
        const res = await apiService.getUserMenu(empresa);
        setMenus(res || []);
      } catch (err) {
        addNotification({
          message: "Error cargando menú:",
          err,
          type: "error",
        });
      }
    };
    loadMenu();
  }, [empresa]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderMenu = (menu) => {
    const Icon = iconMap[menu.icono] || null;
    const hasChildren = menu.children && menu.children.length > 0;

    if (hasChildren) {
      return (
        <div key={menu.id}>
          <div
            className={`${styles.navLink} ${
              location.pathname.startsWith(menu.ruta) ? styles.active : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(menu.id);
            }}
            style={{ cursor: "pointer" }}
          >
            {Icon && <Icon size={18} className={styles.icon} />}
            <span>{menu.nombre}</span>
            <span className={styles.arrow}>
              {expanded[menu.id] ? "▲" : "▼"}
            </span>
          </div>

          {expanded[menu.id] && (
            <div className={styles.submenu}>
              {menu.children.map((child) => {
                const ChildIcon = iconMap[child.icono] || null;
                return (
                  <Link
                    key={child.id}
                    to={child.ruta}
                    className={`${styles.subLink} ${
                      location.pathname === child.ruta ? styles.active : ""
                    }`}
                    onClick={() => {
                      if (isMobile) setOpen(false);
                    }}
                  >
                    {ChildIcon && (
                      <ChildIcon size={16} className={styles.icon} />
                    )}
                    {child.nombre}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <Link
          key={menu.id}
          to={menu.ruta}
          className={`${styles.navLink} ${
            location.pathname === menu.ruta ? styles.active : ""
          }`}
          onClick={() => {
            if (isMobile) setOpen(false);
          }}
        >
          {Icon && <Icon size={18} className={styles.icon} />}
          <span>{menu.nombre}</span>
        </Link>
      );
    }
  };

  return (
    <div className={styles.sidebarWrapper}>
      <button
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className={`${styles.mobileButton} ${open ? styles.hidden : ""}`}
        onClick={() => setOpen(!open)}
        type="button"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>
          Menú
          {isMobile && (
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          )}
        </div>
        <nav className={styles.nav}>{menus.map((m) => renderMenu(m))}</nav>
      </aside>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
