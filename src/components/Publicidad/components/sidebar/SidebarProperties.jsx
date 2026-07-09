import React from "react";
import styles from "../TemplateCanvas.module.css";

/**
 * Panel de propiedades del módulo seleccionado. Si no hay módulo
 * seleccionado, muestra un mensaje-ayuda.
 *
 * FIXES respecto al legacy:
 *  - Rotación: el option con valor 240° estaba incorrecto (los rollos
 *    solo rotan en múltiplos de 90). Ahora es 270°.
 *  - Botón "No" del ajuste automático: la interpolación de className
 *    estaba rota — el fragmento `!selectedField.fillModule ? ... : ""`
 *    quedaba fuera del `${...}` del template string. Corregido para que
 *    marque como activo cuando fillModule es false.
 */
export default function SidebarProperties({
  selectedField,
  fontFamilies,
  pxToMm,
  updateSelectedFieldProps,
  handleDuplicateField,
  handleRemoveField,
}) {
  if (!selectedField) {
    return (
      <section className={styles.bentoSection}>
        <div className={styles.sectionHeader}>
          <h3>Propiedades</h3>
        </div>
        <div className={styles.helperSelectMessage}>
          Selecciona un módulo en el canvas para editar sus propiedades.
        </div>
      </section>
    );
  }

  const align = selectedField.textAlign || "left";
  const lines = selectedField.lines || 1;
  const isFill = !!selectedField.fillModule;
  const isBold = selectedField.fontWeight === "bold";
  const isItalic = selectedField.fontStyle === "italic";

  return (
    <section className={styles.bentoSection}>
      <div className={styles.sectionHeader}>
        <h3>Propiedades del Modulo</h3>
      </div>

      <div className={styles.inputGroup}>
        <label>Tipo</label>
        <input
          type="text"
          value={selectedField.type}
          disabled
          className={styles.selectPro}
        />
      </div>

      {selectedField.type === "StaticText" && (
        <div className={styles.inputGroup}>
          <label>Texto Estatico</label>
          <input
            type="text"
            value={selectedField.content || ""}
            onChange={(e) => updateSelectedFieldProps("content", e.target.value)}
          />
        </div>
      )}

      {selectedField.type === "Description" && (
        <div className={styles.inputGroup}>
          <label>Lineas</label>
          <div className={styles.btnRowLayout}>
            <button
              type="button"
              className={`${styles.btnToggleAction} ${lines === 1 ? styles.toggleActive : ""}`}
              onClick={() => updateSelectedFieldProps("lines", 1)}
            >
              1 linea
            </button>
            <button
              type="button"
              className={`${styles.btnToggleAction} ${lines === 2 ? styles.toggleActive : ""}`}
              onClick={() => updateSelectedFieldProps("lines", 2)}
            >
              2 lineas
            </button>
          </div>
        </div>
      )}

      <div className={styles.compactGrid}>
        <div className={styles.inputGroup}>
          <label>Pos X</label>
          <input
            type="number"
            value={selectedField.x}
            onChange={(e) => updateSelectedFieldProps("x", e.target.value)}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Pos Y</label>
          <input
            type="number"
            value={selectedField.y}
            onChange={(e) => updateSelectedFieldProps("y", e.target.value)}
          />
        </div>
      </div>

      <div className={styles.compactGrid}>
        <div className={styles.inputGroup}>
          <label>Ancho</label>
          <input
            type="number"
            value={selectedField.width}
            onChange={(e) => updateSelectedFieldProps("width", e.target.value)}
          />
          <span className={styles.mmHint}>{pxToMm(selectedField.width)} mm</span>
        </div>
        <div className={styles.inputGroup}>
          <label>Alto</label>
          <input
            type="number"
            value={selectedField.height}
            onChange={(e) => updateSelectedFieldProps("height", e.target.value)}
          />
          <span className={styles.mmHint}>{pxToMm(selectedField.height)} mm</span>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>Fuente</label>
        <select
          value={selectedField.fontFamily || "Arial, sans-serif"}
          onChange={(e) => updateSelectedFieldProps("fontFamily", e.target.value)}
          className={styles.selectPro}
        >
          {fontFamilies.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.compactGrid}>
        <div className={styles.inputGroup}>
          <label>Tamaño (px)</label>
          <input
            type="number"
            value={selectedField.fontSize || 12}
            onChange={(e) =>
              updateSelectedFieldProps("fontSize", Number(e.target.value))
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Rotacion</label>
          <select
            value={selectedField.rotation || 0}
            onChange={(e) =>
              updateSelectedFieldProps("rotation", Number(e.target.value))
            }
            className={styles.selectPro}
          >
            <option value={0}>0°</option>
            <option value={90}>90°</option>
            <option value={180}>180°</option>
            <option value={270}>270°</option>
          </select>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>Alineacion</label>
        <div className={styles.btnRowLayout}>
          {[
            { v: "left", l: "Izq" },
            { v: "center", l: "Cent" },
            { v: "right", l: "Der" },
          ].map((a) => (
            <button
              key={a.v}
              type="button"
              className={`${styles.btnToggleAction} ${align === a.v ? styles.toggleActive : ""}`}
              onClick={() => updateSelectedFieldProps("textAlign", a.v)}
            >
              {a.l}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.compactGrid}>
        <div className={styles.inputGroup}>
          <label>Ajuste Auto</label>
          <div className={styles.btnRowLayout}>
            <button
              type="button"
              className={`${styles.btnToggleAction} ${isFill ? styles.toggleActive : ""}`}
              onClick={() => updateSelectedFieldProps("fillModule", true)}
            >
              Si
            </button>
            <button
              type="button"
              className={`${styles.btnToggleAction} ${!isFill ? styles.toggleActive : ""}`}
              onClick={() => updateSelectedFieldProps("fillModule", false)}
            >
              No
            </button>
          </div>
        </div>
        <div className={styles.inputGroup}>
          <label>Estilo</label>
          <div className={styles.btnRowLayout}>
            <button
              type="button"
              className={`${styles.btnToggleAction} ${isBold ? styles.toggleActive : ""}`}
              onClick={() =>
                updateSelectedFieldProps(
                  "fontWeight",
                  isBold ? "normal" : "bold",
                )
              }
            >
              B
            </button>
            <button
              type="button"
              className={`${styles.btnToggleAction} ${isItalic ? styles.toggleActive : ""}`}
              onClick={() =>
                updateSelectedFieldProps(
                  "fontStyle",
                  isItalic ? "normal" : "italic",
                )
              }
            >
              I
            </button>
          </div>
        </div>
      </div>

      <div className={styles.actionsPanelField}>
        <button
          type="button"
          className={styles.btnDuplicate}
          onClick={() => handleDuplicateField(selectedField)}
        >
          Duplicar
        </button>
        <button
          type="button"
          className={styles.btnDeleteField}
          onClick={() => handleRemoveField(selectedField.id)}
        >
          Eliminar
        </button>
      </div>
    </section>
  );
}
