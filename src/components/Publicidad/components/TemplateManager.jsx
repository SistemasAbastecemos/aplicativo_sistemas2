import React, { useState, useEffect } from "react";
import TemplateCanvas from "./TemplateCanvas";
import { apiService } from "../../../services/api";
import styles from "./TemplateManager.module.css";
import { useNotification } from "../../../contexts/NotificationContext";

export default function TemplateManager() {
  const { addNotification } = useNotification();
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await apiService.obtenerPlantillas();
      if (res && res.success && Array.isArray(res.resultado)) {
        setTemplates(res.resultado);
      }
    } catch (err) {
      console.error("Error cargando plantillas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentTemplate({
      id: `tpl_${Date.now()}`,
      name: "Nueva Plantilla",
      width: 300,
      height: 150,
      padding: 5,
      fields: [],
    });
    setIsEditing(true);
  };

  const handleEdit = (template) => {
    setCurrentTemplate(JSON.parse(JSON.stringify(template)));
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Esta seguro de que desea eliminar de forma permanente esta plantilla de etiquetas?",
      )
    ) {
      try {
        const res = await apiService.eliminarPlantilla(id);
        if (res && res.success) {
          addNotification({
            type: "success",
            message: "Plantilla eliminada correctamente.",
          });
          fetchTemplates();
        } else {
          addNotification({
            type: "error",
            message:
              "No se pudo eliminar la plantilla: " +
              (res.message || "Error desconocido"),
          });
        }
      } catch (err) {
        console.error("Error al eliminar plantilla:", err);
        addNotification({
          type: "error",
          message: "Fallo la conexion con el servidor.",
        });
      }
    }
  };

  const handleSaveTemplate = async (savedTemplate) => {
    try {
      const res = await apiService.guardarPlantilla(savedTemplate);
      if (res && res.success) {
        addNotification({
          type: "success",
          message: "Plantilla guardada con exito en la base de datos.",
        });
        setIsEditing(false);
        setCurrentTemplate(null);
        fetchTemplates();
      } else {
        addNotification({
          type: "error",
          message:
            "Error al guardar la plantilla: " +
            (res.message || "Error del servidor"),
        });
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      addNotification({
        type: "error",
        message: "No se pudo transmitir la plantilla al servidor.",
      });
    }
  };

  if (isEditing) {
    return (
      <TemplateCanvas
        template={currentTemplate}
        onSave={handleSaveTemplate}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>Gestor de Plantillas de Marcacion</h2>
          <p className={styles.subtitle}>
            Administracion y control de estructuras de codigos de barras
            corporativos
          </p>
        </div>
        <button className={styles.btnCreate} onClick={handleCreateNew}>
          Crear Nueva Plantilla
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.tableLoading}>
            <div className={styles.spinner}></div>
            <span>Sincronizando base de datos corporativa...</span>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre de la Plantilla</th>
                <th>Ancho (px)</th>
                <th>Alto (px)</th>
                <th>Campos Asignados</th>
                <th style={{ textAlign: "center" }}>Acciones de Control</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((tpl) => (
                <tr key={tpl.id}>
                  <td className={styles.templateName}>{tpl.name}</td>
                  <td className={styles.dimText}>{tpl.width} px</td>
                  <td className={styles.dimText}>{tpl.height} px</td>
                  <td>
                    <span className={styles.badgeFields}>
                      {tpl.fields && Array.isArray(tpl.fields)
                        ? tpl.fields.length
                        : 0}{" "}
                      Activos
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.btnEdit}
                        onClick={() => handleEdit(tpl)}
                      >
                        Editar Config
                      </button>
                      <button
                        className={styles.btnDelete}
                        onClick={() => handleDelete(tpl.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td colSpan="5" className={styles.emptyRow}>
                    <div className={styles.emptyStateContainer}>
                      <p>
                        No se han parametrizado plantillas de impresion en este
                        modulo corporativo.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
