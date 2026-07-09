import React from "react";
import styles from "../TemplateCanvas.module.css";

/**
 * Paleta de módulos que se pueden agregar al canvas. Cada click en un
 * botón dispara `handleAddField` que crea el módulo en la posición
 * inicial (esquina superior izquierda respetando el padding).
 */
export default function SidebarPalette({
  availableFieldTypes,
  handleAddField,
}) {
  return (
    <section className={styles.bentoSection}>
      <div className={styles.sectionHeader}>
        <h3>Agregar Modulo</h3>
      </div>
      <div className={styles.paletteGrid}>
        {availableFieldTypes.map((t) => (
          <button
            key={t.type}
            type="button"
            className={styles.btnPaletteItem}
            onClick={(e) => handleAddField(e, t.type)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </section>
  );
}
