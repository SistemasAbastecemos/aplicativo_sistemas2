import React from "react";
import styles from "../TemplateCanvas.module.css";

/**
 * Panel de parámetros físicos de la etiqueta: nombre, preset del rollo,
 * orientación, dimensiones y padding interno. La rotación del canvas
 * y el clamping de módulos se manejan en el orquestador.
 */
export default function SidebarBaseParams({
  templateData,
  setTemplateData,
  rollPresets,
  orientation,
  applyOrientation,
  applyRollPreset,
  pxToMm,
}) {
  const updateField = (key, value) => {
    setTemplateData({ ...templateData, [key]: value });
  };

  return (
    <section className={styles.bentoSection}>
      <div className={styles.sectionHeader}>
        <h3>Parametros Base</h3>
      </div>

      <div className={styles.inputGroup}>
        <label>Nombre del Layout</label>
        <input
          type="text"
          value={templateData.name || ""}
          onChange={(e) => updateField("name", e.target.value)}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>Tamaño de rollo</label>
        <select
          className={styles.selectPro}
          value=""
          onChange={(e) => applyRollPreset(e.target.value)}
        >
          <option value="">Elegir medida...</option>
          {rollPresets.map((p, i) => (
            <option key={i} value={i}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.inputGroup}>
        <label>Orientacion</label>
        <div className={styles.btnRowLayout}>
          <button
            type="button"
            className={`${styles.btnToggleAction} ${orientation === "H" ? styles.toggleActive : ""}`}
            onClick={() => applyOrientation("H")}
          >
            Horizontal
          </button>
          <button
            type="button"
            className={`${styles.btnToggleAction} ${orientation === "V" ? styles.toggleActive : ""}`}
            onClick={() => applyOrientation("V")}
          >
            Vertical
          </button>
        </div>
      </div>

      <div className={styles.compactGrid}>
        <div className={styles.inputGroup}>
          <label>Ancho (px)</label>
          <input
            type="number"
            value={templateData.width || 0}
            onChange={(e) => updateField("width", Number(e.target.value))}
          />
          <span className={styles.mmHint}>{pxToMm(templateData.width)} mm</span>
        </div>
        <div className={styles.inputGroup}>
          <label>Alto (px)</label>
          <input
            type="number"
            value={templateData.height || 0}
            onChange={(e) => updateField("height", Number(e.target.value))}
          />
          <span className={styles.mmHint}>{pxToMm(templateData.height)} mm</span>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>Margen Interno (Padding)</label>
        <input
          type="number"
          value={templateData.padding || 0}
          onChange={(e) => updateField("padding", Number(e.target.value))}
        />
      </div>
    </section>
  );
}
