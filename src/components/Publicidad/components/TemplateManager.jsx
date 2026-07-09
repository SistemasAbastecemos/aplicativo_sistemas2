import React, { useState, useEffect, useCallback } from "react";
import styles from "./TemplateManager.module.css";
import { apiService } from "../../../services/api";
import { useNotification } from "../../../contexts/NotificationContext";
import { usePermisos } from "../../../hooks/usePermission";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";

import TemplateTable from "./TemplateTable";
import TemplateCanvas from "./TemplateCanvas";

export default function TemplateManager() {
  const { addNotification } = useNotification();
  const { puedeCrear, puedeEditar, puedeEliminar } = usePermisos();

  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.obtenerPlantillas();
      if (res?.success && Array.isArray(res.resultado)) {
        setTemplates(res.resultado);
      }
    } catch (err) {
      console.error("Error cargando plantillas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCreateNew = () => {
    if (!puedeCrear) return;
    setCurrentTemplate({
      id: `new_${Date.now()}`,
      name: "Nueva Plantilla Rollo",
      width: 440,
      height: 240,
      padding: 10,
      fields: [],
    });
    setIsEditing(true);
  };

  // ==========================================================================
  // Sincronización con el método correcto unificado de api.js
  // ==========================================================================
  const handleSaveCanvas = async (updatedData) => {
    try {
      // Invocamos directamente el método real de tu API corporativa
      const res = await apiService.guardarPlantilla(updatedData);

      if (res?.success) {
        addNotification({
          type: "success",
          message:
            "Estructura vectorial guardada correctamente en el servidor.",
        });
        setIsEditing(false);
        setCurrentTemplate(null);
        fetchTemplates();
      } else {
        throw new Error("Respuesta de servidor inválida o fallida");
      }
    } catch (err) {
      console.error("Fallo interno en guardado:", err);
      addNotification({
        type: "error",
        message: "Inconsistencia al guardar la plantilla en el repositorio.",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!puedeEliminar) return;
    if (
      !window.confirm("¿Está seguro de eliminar esta plantilla de impresión?")
    )
      return;

    try {
      const res = await apiService.eliminarPlantilla(id);
      if (res?.success) {
        addNotification({
          type: "success",
          message: "Plantilla removida del sistema corporativo.",
        });
        fetchTemplates();
      }
    } catch (err) {
      addNotification({
        type: "error",
        message: "Fallo al procesar la remoción de la plantilla.",
      });
    }
  };

  if (isEditing) {
    return (
      <TemplateCanvas
        template={currentTemplate}
        onSave={handleSaveCanvas}
        onCancel={() => {
          setIsEditing(false);
          setCurrentTemplate(null);
        }}
      />
    );
  }

  return (
    <div className={styles.managerContainerApple}>
      <header className={styles.managerHeaderApple}>
        <div className={styles.titleSection}>
          <h2>Gestión de Plantillas</h2>
          <p className={styles.subtitle}>
            Estructure los vectores, áreas métricas y campos dinámicos de las
            etiquetas.
          </p>
        </div>
        {puedeCrear && (
          <button
            type="button"
            className={styles.appleBtnPrimary}
            onClick={handleCreateNew}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Nueva Plantilla</span>
          </button>
        )}
      </header>

      <div className={styles.tableCardApple}>
        {loading ? (
          <div className={styles.spinnerWrapper}>
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              size="2x"
              className={styles.appleSpinner}
            />
          </div>
        ) : (
          <TemplateTable
            templates={templates}
            onEdit={(tpl) => {
              setCurrentTemplate(tpl);
              setIsEditing(true);
            }}
            onDelete={handleDelete}
            puedeEditar={puedeEditar}
            puedeEliminar={puedeEliminar}
          />
        )}
      </div>
    </div>
  );
}
