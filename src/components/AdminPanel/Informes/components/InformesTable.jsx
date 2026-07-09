import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGripVertical,
  faCheckCircle,
  faTimesCircle,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Informes.module.css";

const InformesTable = ({
  informes,
  searchTerm,
  draggingIndex,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onEditar,
}) => {
  const isDraggable = searchTerm === "";

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: "40px" }}></th>
            <th>Título</th>
            <th>Área Dueña</th>
            <th>Orden</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {informes.map((inf, index) => (
            <tr
              key={inf.id}
              draggable={isDraggable}
              onDragStart={() => isDraggable && onDragStart(index)}
              onDragEnter={(e) => {
                e.preventDefault();
                if (isDraggable) {
                  onDragEnter(index);
                }
              }}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`
                ${isDraggable ? styles.draggableRow : ""} 
                ${draggingIndex === index ? styles.draggingRow : ""}
              `}
            >
              <td className={styles.dragHandle}>
                {isDraggable && <FontAwesomeIcon icon={faGripVertical} />}
              </td>
              <td data-label="Título">
                <div className={styles.infoBlock}>
                  <span
                    className={styles.colorIndicator}
                    style={{ backgroundColor: inf.color || "#3b82f6" }}
                  ></span>
                  <div>
                    <strong>{inf.titulo}</strong>
                    <span className={styles.subtext}>{inf.descripcion}</span>
                  </div>
                </div>
              </td>
              <td data-label="Área Dueña">{inf.area_nombre}</td>
              <td data-label="Orden">{index + 1}</td>
              <td data-label="Estado">
                {Number(inf.activo) === 1 ? (
                  <span className={styles.badgeActive}>
                    <FontAwesomeIcon icon={faCheckCircle} /> Activo
                  </span>
                ) : (
                  <span className={styles.badgeInactive}>
                    <FontAwesomeIcon icon={faTimesCircle} /> Inactivo
                  </span>
                )}
              </td>
              <td data-label="Acciones">
                <button
                  onClick={() => onEditar(inf)}
                  className={styles.btnAction}
                >
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InformesTable;
