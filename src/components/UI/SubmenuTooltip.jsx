import React, { useRef, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./SubmenuTooltip.module.css";

const SubmenuTooltip = ({ menu, onClose, onNavigate }) => {
  const tooltipRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const location = useLocation();

  const iconMap = {
    home: "faHome",
    user: "faUser",
    user2: "faUserCog",
    users: "faUsers",
    "bar-chart": "faChartBar",
    formatos: "faClipboardList",
    costos: "faDollarSign",
    list: "faList",
    documents: "faFile",
    pdf: "faFilePdf",
    codificacion: "faThLarge",
    admin: "faWrench",
    inv: "faBoxOpen",
    sedes: "faBuilding",
    cargos: "faIdCard",
    areas: "faBook",
    menu: "faProjectDiagram",
    box: "faCube",
    file: "faFileUpload",
    informes: "faChartColumn",
    report: "faExclamationTriangle",
    pedidos: "faShop",
  };

  // Manejar el cierre del tooltip
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        // Verificar si el click fue en un elemento del sidebar
        const isSidebarClick = event.target.closest(".sidebar") !== null;
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
    };
  }, [onClose]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = (e) => {
    // Pequeño delay para permitir movimientos rápidos entre elementos
    setTimeout(() => {
      if (!isHovering) {
        onClose();
      }
    }, 50);
  };

  const handleItemClick = () => {
    onNavigate();
    onClose();
  };

  const getIcon = (iconName) => {
    // Mapeo correcto de iconos
    const iconMapping = {
      home: "faHome",
      user: "faUser",
      user2: "faUserCog",
      users: "faUsers",
      "bar-chart": "faChartBar",
      formatos: "faClipboardList",
      costos: "faDollarSign",
      list: "faList",
      documents: "faFile",
      pdf: "faFilePdf",
      codificacion: "faThLarge",
      admin: "faWrench",
      inv: "faBoxOpen",
      sedes: "faBuilding",
      cargos: "faIdCard",
      areas: "faBook",
      menu: "faProjectDiagram",
      box: "faCube",
      file: "faFileUpload",
      informes: "faChartColumn",
      report: "faExclamationTriangle",
      pedidos: "faShop",
    };
    return iconMapping[iconName] || "faCircle";
  };

  return (
    <div
      ref={tooltipRef}
      className={styles.submenuTooltip}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.submenuContent}>
        <div className={styles.submenuHeader}>
          <h4>{menu.nombre}</h4>
        </div>
        <div className={styles.submenuItems}>
          {menu.children.map((child, index) => {
            const isActive = location.pathname === child.ruta;
            return (
              <Link
                key={`submenu-${menu.id}-${index}`}
                to={child.ruta}
                className={`${styles.submenuItem} ${
                  isActive ? styles.active : ""
                }`}
                onClick={handleItemClick}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
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
          })}
        </div>
      </div>
    </div>
  );
};

export default SubmenuTooltip;
