import React, { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faUserCog,
  faUsers,
  faChartBar,
  faClipboardList,
  faDollarSign,
  faList,
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
  faShop,
  faAppleWhole,
  faFish,
  faPercent,
  faRulerCombined,
  faUserCheck,
  faFileInvoiceDollar,
  faMoneyBillTransfer,
  faComputer,
  faStore,
  faCircle,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./SubmenuTooltip.module.css";

// Definido a nivel de módulo para no reconstruirlo en cada render
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
  contabilidad: faFileInvoiceDollar,
  recaudo: faMoneyBillTransfer,
  sistemas: faComputer,
  compras: faStore,
};

const SubmenuTooltip = ({ menu, anchorRect, onClose, onNavigate, onHover }) => {
  const tooltipRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        // Evita cerrar si el clic ocurre dentro de la barra lateral
        const isSidebarClick =
          event.target.closest("aside") !== null ||
          event.target.closest("nav") !== null;
        if (!isSidebarClick) {
          onClose();
        }
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [onClose]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (onHover) {
      onHover();
    }
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      onClose();
    }, 250);
  };

  const handleItemClick = () => {
    onNavigate();
    onClose();
  };

  const getIcon = (iconName) => {
    return iconMap[iconName] || faCircle;
  };

  const renderTooltipItems = (items) => {
    return items.map((child, index) => {
      const hasChildren =
        Array.isArray(child.children) && child.children.length > 0;
      const isActive = location.pathname === child.ruta;
      const key = `tooltip-item-${child.id_menu || index}`;

      if (hasChildren) {
        return (
          <div key={key} className={styles.flyoutContainer}>
            <div className={`${styles.submenuItem} ${styles.flyoutTrigger}`}>
              <span className={styles.submenuIcon}>
                <FontAwesomeIcon
                  icon={getIcon(child.icono)}
                  className={styles.submenuItemIcon}
                />
              </span>
              <span className={styles.submenuText}>{child.nombre}</span>
              <FontAwesomeIcon
                icon={faAngleRight}
                className={styles.flyoutArrow}
              />
            </div>

            <div className={styles.flyoutMenu}>
              {renderTooltipItems(child.children)}
            </div>
          </div>
        );
      }

      return (
        <Link
          key={key}
          to={child.ruta}
          className={`${styles.submenuItem} ${isActive ? styles.active : ""}`}
          onClick={handleItemClick}
        >
          <span className={styles.submenuIcon}>
            <FontAwesomeIcon
              icon={getIcon(child.icono)}
              className={styles.submenuItemIcon}
            />
          </span>
          <span className={styles.submenuText}>{child.nombre}</span>
          {isActive && <div className={styles.activeIndicator} />}
        </Link>
      );
    });
  };

  // Sin rect de anclaje no podemos posicionar: no renderizamos nada
  if (!anchorRect) return null;

  // Posicion fija calculada a partir del icono disparador (viewport-relative)
  const style = {
    top: `${anchorRect.top}px`,
    left: `${anchorRect.right + 8}px`,
  };

  return createPortal(
    <div
      ref={tooltipRef}
      className={styles.submenuTooltip}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.submenuContent}>
        <div className={styles.submenuHeader}>
          <h4>{menu.nombre}</h4>
        </div>
        <div className={styles.submenuItems}>
          {renderTooltipItems(menu.children)}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SubmenuTooltip;
