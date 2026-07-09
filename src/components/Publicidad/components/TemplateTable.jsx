import React from "react";
import styles from "./TemplateManager.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";

export default function TemplateTable({
  templates,
  onEdit,
  onDelete,
  puedeEditar,
  puedeEliminar,
}) {
  if (templates.length === 0) {
    return (
      <div className={styles.appleEmptyState}>
        <FontAwesomeIcon icon={faFolderOpen} className={styles.emptyIcon} />
        <p>
          No se registran configuraciones métricas de plantillas en el servidor
          corporativo.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.responsiveTableWrapper}>
      <table className={styles.appleCorporateTable}>
        <thead>
          <tr>
            <th>Nombre Estructural</th>
            <th>Dimensiones (Ancho × Alto)</th>
            <th>Margen Interno (Padding)</th>
            <th>Vectores Activos</th>
            <th style={{ textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((tpl) => (
            <tr key={tpl.id}>
              <td className={styles.boldTextApple}>{tpl.name}</td>
              <td>
                {tpl.width}px × {tpl.height}px
              </td>
              <td>{tpl.padding}px</td>
              <td>
                <span className={styles.appleBadgeCount}>
                  {Array.isArray(tpl.fields) ? tpl.fields.length : 0} Campos
                </span>
              </td>
              <td>
                <div className={styles.appleActionButtonsGroup}>
                  <button
                    type="button"
                    className={styles.btnActionEdit}
                    onClick={() => onEdit(tpl)}
                    disabled={!puedeEditar}
                    style={{ opacity: puedeEditar ? 1 : 0.4 }}
                    title={
                      puedeEditar
                        ? "Modificar matriz"
                        : "Acceso de solo lectura"
                    }
                  >
                    <FontAwesomeIcon icon={faEdit} /> Editar
                  </button>
                  <button
                    type="button"
                    className={styles.btnActionDelete}
                    onClick={() => onDelete(tpl.id)}
                    disabled={!puedeEliminar}
                    style={{ display: puedeEliminar ? "block" : "none" }}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Remover
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
