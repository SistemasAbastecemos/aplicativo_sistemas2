import React from "react";
import styles from "./TemplateCanvas.module.css";
import {
  getFieldStyle,
  getRotatedContentStyle,
  getFieldPreviewText,
  stageStyle,
} from "../utils/sharedRenderUtils.jsx";

/**
 * Área de trabajo con el canvas visible, pan + zoom, y renderizado de
 * cada módulo.
 *
 * FIX vs legacy: el contenido rotado ahora está en un rotor anidado
 * dentro de un "stage" (position: relative). El rotor es
 * position:absolute centrado con `translate(-50%, -50%) rotate(...)`.
 * Esto hace que la rotación 90°/270° funcione visualmente correcta
 * (antes el height quedaba en "100%" y el contenido rotado se salía
 * del módulo).
 */
export default function CanvasWorkspace({
  templateData,
  selectedFieldId,
  zoom,
  setZoom,
  panOffset,
  canvasAreaRef,
  canvasRef,
  handlePanStart,
  handleCanvasClick,
  handleFieldMouseDown,
  handleResizeMouseDown,
}) {
  return (
    <main
      className={styles.workspaceViewport}
      ref={canvasAreaRef}
      onMouseDown={handlePanStart}
    >
      {/* Dock flotante de zoom en la esquina inferior derecha */}
      <div className={styles.zoomDockControls}>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.25, z - 0.15))}
        >
          −
        </button>
        <span className={styles.zoomIndicatorText}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(4.0, z + 0.15))}
        >
          +
        </button>
        <button
          type="button"
          className={styles.btnResetZoom}
          onClick={() => setZoom(1)}
        >
          1:1
        </button>
      </div>

      <div
        className={styles.canvasWrapper}
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          width: `${templateData.width}px`,
          height: `${templateData.height}px`,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
        }}
      >
        <div
          className={styles.marginGuide}
          style={{
            top: `${templateData.padding}px`,
            left: `${templateData.padding}px`,
            right: `${templateData.padding}px`,
            bottom: `${templateData.padding}px`,
          }}
        />

        {templateData.fields?.map((field) => (
          <div
            key={field.id}
            onMouseDown={(e) => handleFieldMouseDown(e, field)}
            className={`${styles.canvasField} ${field.id === selectedFieldId ? styles.fieldSelected : ""}`}
            style={getFieldStyle(field)}
          >
            {/* Escenario del módulo: contenedor position:relative */}
            <div style={stageStyle}>
              {/* Rotor: position:absolute + translate + rotate */}
              <div style={getRotatedContentStyle(field)}>
                {getFieldPreviewText(field)}
              </div>
            </div>

            <div className={styles.fieldCoordinates}>
              {field.x},{field.y} | {field.width}x{field.height}px
              {field.rotation ? ` | ${field.rotation}°` : ""}
            </div>

            <div
              className={styles.resizeHandle}
              onMouseDown={(e) => handleResizeMouseDown(e, field)}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
