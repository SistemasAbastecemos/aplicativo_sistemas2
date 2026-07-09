import React from "react";
import styles from "./TemplateCanvas.module.css";
import SidebarBaseParams from "./sidebar/SidebarBaseParams";
import SidebarPalette from "./sidebar/SidebarPalette";
import SidebarProperties from "./sidebar/SidebarProperties";

/**
 * Sidebar del editor de plantillas. Orquesta tres sub-paneles y las
 * acciones de guardar/cancelar. La sección scrollable ocupa el alto
 * disponible; las acciones quedan pegadas al fondo del sidebar (no se
 * pierden al hacer scroll).
 */
export default function CanvasSidebar({
  templateData,
  setTemplateData,
  selectedField,
  rollPresets,
  availableFieldTypes,
  fontFamilies,
  orientation,
  applyOrientation,
  applyRollPreset,
  pxToMm,
  updateSelectedFieldProps,
  handleDuplicateField,
  handleRemoveField,
  handleAddField,
  onSave,
  onCancel,
}) {
  return (
    <aside className={styles.sidePanel}>
      <div className={styles.scrollableSection}>
        <SidebarBaseParams
          templateData={templateData}
          setTemplateData={setTemplateData}
          rollPresets={rollPresets}
          orientation={orientation}
          applyOrientation={applyOrientation}
          applyRollPreset={applyRollPreset}
          pxToMm={pxToMm}
        />

        <SidebarPalette
          availableFieldTypes={availableFieldTypes}
          handleAddField={handleAddField}
        />

        <SidebarProperties
          selectedField={selectedField}
          fontFamilies={fontFamilies}
          pxToMm={pxToMm}
          updateSelectedFieldProps={updateSelectedFieldProps}
          handleDuplicateField={handleDuplicateField}
          handleRemoveField={handleRemoveField}
        />
      </div>

      <div className={styles.controlActions}>
        <button
          type="button"
          className={styles.btnSave}
          onClick={() => onSave(templateData)}
        >
          Guardar Cambios
        </button>
        <button type="button" className={styles.btnCancel} onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </aside>
  );
}
