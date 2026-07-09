import React from "react";
import styles from "../PrintCanvas.module.css";
import EmptyState from "../../UI/EmptyState";
import { faMicrochip } from "@fortawesome/free-solid-svg-icons";
import {
  getFieldStyle,
  getRotatedContentStyle,
  getFieldPreviewText,
  stageStyle,
} from "../utils/sharedRenderUtils.jsx";

/**
 * Monitor de previsualización de rollos de alta fidelidad.
 * Se refresca de manera reactiva e inmediata ante mutaciones del layout base.
 */
export default function RollPreviewMonitor({ activeTemplate, itemsToPrint }) {
  if (!activeTemplate) {
    return (
      <EmptyState
        icon={faMicrochip}
        title="Sin Matriz Activa"
        description="Mapee una plantilla activa en el panel izquierdo para proyectar la cinta de previsualización leal."
      />
    );
  }

  // Generamos un hash de control atómico basado en las propiedades críticas de los vectores modificados
  const templateVisualFingerprint = `${activeTemplate.id}_${activeTemplate.width}x${activeTemplate.height}_${activeTemplate.fields?.length || 0}`;

  return (
    <div className={styles.rollMonitorContainer}>
      <h3 className={styles.monitorTitle}>Monitor de Renderizado de Rollos</h3>

      {/* Inyectamos la huella digital como key de la cinta. Si la plantilla muta, 
        React reconstruye el nodo con los nuevos píxeles exactos de forma inmediata.
      */}
      <div className={styles.ribbonStream} key={templateVisualFingerprint}>
        {itemsToPrint.map((item, idx) => (
          <div
            key={`${item.Code}-${idx}`}
            className={styles.etiquetaPureWrapper}
            style={{
              width: `${activeTemplate.width}px`,
              height: `${activeTemplate.height}px`,
              minWidth: `${activeTemplate.width}px`,
              minHeight: `${activeTemplate.height}px`,
            }}
          >
            {/* Guía interna de márgenes de impresión */}
            <div
              className={styles.marginGuidePrint}
              style={{
                top: `${activeTemplate.padding}px`,
                left: `${activeTemplate.padding}px`,
                right: `${activeTemplate.padding}px`,
                bottom: `${activeTemplate.padding}px`,
              }}
            />

            {activeTemplate.fields?.map((field) => (
              <div
                key={field.id}
                style={getFieldStyle(field)}
                className={styles.fieldRenderUnit}
              >
                <div style={stageStyle}>
                  <div style={getRotatedContentStyle(field, item)}>
                    {field.type === "Code" ? (
                      <div className={styles.barcodeWrapperIdentic}>
                        <div className={styles.barLinesMock} />
                        <span className={styles.barcodeText}>{item.Code}</span>
                      </div>
                    ) : (
                      getFieldPreviewText(field, item)
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
