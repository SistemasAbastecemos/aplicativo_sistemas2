import React, { useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faBars,
  faLink,
  faIcons,
  faFolder,
  faGripLines,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Menus.module.css";

/**
 * Tarjeta de un menú. Es memoizada porque se renderiza en lista y participa
 * en el arrastre. Deduce si el nodo está "activo" cuando su ruta —o la de
 * algún descendiente— coincide con la ruta actual del navegador.
 */
const MenuCard = React.memo(
  ({
    menu,
    index,
    onEdit,
    menus,
    currentPath,
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

    // Activación en cascada: el nodo se resalta si él o alguno de sus
    // descendientes corresponde a la ruta del viewport actual.
    const isNodeActive = useMemo(() => {
      if (currentPath === menu.ruta) return true;

      const tieneDescendienteActivo = (node) => {
        const hijosDirectos = menus.filter(
          (m) => m.id_parent === node.id || m.id_menu_parent === node.id,
        );
        return hijosDirectos.some(
          (hijo) => hijo.ruta === currentPath || tieneDescendienteActivo(hijo),
        );
      };

      return tieneDescendienteActivo(menu);
    }, [menu, currentPath, menus]);

    const cardClass = [
      styles.menuCard,
      menu.activo ? styles.activo : styles.inactivo,
      isNodeActive ? styles.nodeActive : "",
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
        {isDragOver && <div className={styles.dropIndicator} />}

        <span className={styles.statusDot} />

        <div className={styles.cardTop}>
          <div className={styles.avatar}>
            <FontAwesomeIcon icon={menu.icono ? faIcons : faBars} />
          </div>

          <div className={styles.menuDetails}>
            <div className={styles.titleRow}>
              <h4 className={styles.menuName}>{menu.nombre}</h4>
              <span className={styles.orderLabel}>Posición #{menu.orden}</span>
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
            <div className={styles.dragHandle} title="Arrastrar para reordenar">
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

MenuCard.displayName = "MenuCard";

export default MenuCard;
