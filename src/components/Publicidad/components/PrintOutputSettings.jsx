import React from "react";
import styles from "../PrintCanvas.module.css";

export default function PrintOutputSettings({ model, templates }) {
  return (
    <div className={styles.bentoSectionApple}>
      <h4 className={styles.sectionTitleApple}>Configuración de Salida</h4>
      <div className={styles.inputGroupApple}>
        <label>Hardware Impresora</label>
        <select
          value={model.printerName}
          onChange={(e) => model.setPrinterName(e.target.value)}
          className={styles.selectPro}
        >
          <option value="">Seleccione destino...</option>
          {model.availablePrinters.map((p, idx) => (
            <option key={idx} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.inputGroupApple}>
        <label>Protocolo de Lenguaje</label>
        <select
          value={model.printerType}
          onChange={(e) => model.setPrinterType(e.target.value)}
          className={styles.selectPro}
        >
          <option value="MULTIFUNCIONAL">Multifuncional / PDF estándar</option>
          <option value="TSPL">TSC / Comando TSPL</option>
          <option value="MPCL">Monarch / Comando MPCL</option>
        </select>
      </div>

      <div className={styles.inputGroupApple}>
        <label>Plantilla de Diseño Activa</label>
        <select
          value={model.selectedTemplateId}
          onChange={(e) => model.setSelectedTemplateId(e.target.value)}
          className={styles.selectPro}
        >
          <option value="">Seleccione plantilla...</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
