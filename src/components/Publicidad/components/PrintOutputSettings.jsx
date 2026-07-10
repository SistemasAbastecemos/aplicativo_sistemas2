import React from "react";
import styles from "../PrintCanvas.module.css";

export default function PrintOutputSettings({ model, templates }) {
  const printerOk = !!model.printerName;
  const protocolOk = !!model.printerType;
  const templateOk = !!model.selectedTemplateId;
  const canPrint =
    printerOk &&
    protocolOk &&
    templateOk &&
    !model.isPrinting &&
    model.socketConnected;

  const missingItems = [
    !printerOk && "impresora",
    !protocolOk && "protocolo de lenguaje",
    !templateOk && "plantilla activa",
  ].filter(Boolean);

  return (
    <div className={styles.bentoSectionApple}>
      <h4 className={styles.sectionTitleApple}>Configuración de Salida</h4>

      <div className={styles.inputGroupApple}>
        <label>Hardware Impresora</label>
        <select
          value={model.printerName}
          onChange={(e) => model.setPrinterName(e.target.value)}
          className={`${styles.selectPro} ${!printerOk ? styles.selectError : ""}`}
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
          className={`${styles.selectPro} ${!protocolOk ? styles.selectError : ""}`}
        >
          <option value="MULTIFUNCIONAL">Multifuncional / PDF estándar</option>
          <option value="TSC">TSC / Comando TSPL</option>
          <option value="MONARCH">Monarch / Comando MPCL</option>
        </select>
      </div>

      <div className={styles.inputGroupApple}>
        <label>Plantilla de Diseño Activa</label>
        <select
          value={model.selectedTemplateId}
          onChange={(e) => model.setSelectedTemplateId(e.target.value)}
          className={`${styles.selectPro} ${!templateOk ? styles.selectError : ""}`}
        >
          <option value="">Seleccione plantilla...</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Indicador de campos pendientes */}
      {missingItems.length > 0 && (
        <p className={styles.printValidationHint}>
          Falta seleccionar: {missingItems.join(", ")}.
        </p>
      )}

      {/* Indicador de agente desconectado */}
      {!model.socketConnected && (
        <p className={styles.printValidationHint}>
          El agente de impresión no está conectado.
        </p>
      )}

      {/* Botón de impresión */}
      <button
        className={`${styles.printActionBtn} ${!canPrint ? styles.printActionBtnDisabled : ""}`}
        onClick={canPrint ? model.ejecutarImpresion : undefined}
        disabled={!canPrint}
        title={
          !model.socketConnected
            ? "Agente desconectado"
            : missingItems.length > 0
              ? `Falta: ${missingItems.join(", ")}`
              : model.isPrinting
                ? "Imprimiendo..."
                : "Enviar lote a la impresora"
        }
      >
        {model.isPrinting ? "Imprimiendo..." : "Imprimir Etiquetas"}
      </button>
    </div>
  );
}
