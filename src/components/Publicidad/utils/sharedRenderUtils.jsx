import React from "react";

/**
 * Devuelve el texto de muestra para cada tipo de módulo (usado en editor
 * y en preview). Si viene `itemData` (impresión real) usa esos valores;
 * si no, retorna placeholders.
 */
export const getFieldSampleString = (field, itemData = null) => {
  if (field.type === "StaticText" || field.type === "Text")
    return field.content || "TEXTO";
  if (field.type === "Description")
    return itemData?.Description || "DETERGENTE LIQUIDO MAQUINA FLUJO";
  if (field.type === "Price")
    return itemData?.Price ? `$ ${itemData.Price}` : "$ 999.999";
  if (field.type === "Code") return itemData?.Code || "7701234567890";
  if (field.type === "PUM") return "P.U.M: $ 42.00 x Gr";
  return `[${field.type}]`;
};

/**
 * Calcula el tamaño de fuente óptimo para llenar el área disponible en
 * un módulo con `fillModule` activo. `longPx` es la extensión en la
 * dirección del flujo del texto y `shortPx` es la perpendicular.
 *
 * Cuando el módulo está rotado 90°/270°, quien llama debe pasar las
 * dimensiones YA intercambiadas (no las originales).
 */
export const computeFillFont = (field, longPx, shortPx, itemData = null) => {
  const len = Math.max(1, getFieldSampleString(field, itemData).length);
  const byLength = longPx / (len * 0.58);
  const byThickness = shortPx / 1.25;
  return Math.floor(Math.min(byLength, byThickness));
};

/**
 * Estilo del "escenario" del módulo: un contenedor position:relative
 * dentro del módulo del canvas que sirve como marco de referencia para
 * el rotor absoluto. Se exporta como constante para reutilizar en el
 * editor y en el preview de impresión (evita duplicar CSS).
 */
export const stageStyle = {
  flex: 1,
  width: "100%",
  position: "relative",
  overflow: "hidden",
};

/**
 * Estilo del "rotor" interno que recibe la rotación. Está posicionado
 * absolutamente y centrado con `translate(-50%, -50%)` + `rotate(...)`.
 *
 * Corrección respecto al legacy: cuando el módulo se rota 90° o 270°,
 * las dimensiones efectivas se intercambian — el rotor debe tener
 * `width = alto interno` y `height = ancho interno` para que después de
 * rotar el resultado visual llene el módulo correctamente. Antes solo
 * se cambiaba `width` y `height` quedaba en `100%`, lo que hacía que
 * el texto se saliera del área o quedara mal alineado.
 *
 * Para `fillModule`, el cálculo de fuente ahora usa las dimensiones ya
 * intercambiadas cuando corresponde.
 */
export const getRotatedContentStyle = (field, itemData = null) => {
  const r = Number(field.rotation || 0);
  const innerW = Math.max(1, field.width - 10);
  const innerH = Math.max(1, field.height - 10);
  const fill = field.fillModule;
  const align = field.textAlign || "left";
  const rotated = r === 90 || r === 270;

  // En rotación 90°/270°, el layout del rotor intercambia sus ejes
  const layoutW = rotated ? innerH : innerW;
  const layoutH = rotated ? innerW : innerH;

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%)${r ? ` rotate(${r}deg)` : ""}`,
    transformOrigin: "center center",
    width: `${layoutW}px`,
    height: `${layoutH}px`,
    display: "flex",
    alignItems: "center",
    justifyContent:
      align === "center"
        ? "center"
        : align === "right"
          ? "flex-end"
          : "flex-start",
    textAlign: align,
    overflow: "hidden",
    boxSizing: "border-box",
    lineHeight: 1.15,
  };

  if (fill) {
    style.whiteSpace = "nowrap";
    style.fontSize = `${computeFillFont(field, layoutW, layoutH, itemData)}px`;
  }

  return style;
};

/**
 * Estilo base del módulo en el canvas (posicionamiento absoluto,
 * padding interno, layout flex para acomodar el escenario + coordenadas
 * + handle de resize). El escenario y su rotor son hijos separados.
 */
export const getFieldStyle = (field) => ({
  left: `${field.x}px`,
  top: `${field.y}px`,
  width: `${field.width}px`,
  height: `${field.height}px`,
  fontFamily: field.fontFamily || "Arial, sans-serif",
  fontSize: `${field.fontSize || 12}px`,
  color: field.color || "#1d1d1f",
  fontWeight: field.fontWeight || "normal",
  fontStyle: field.fontStyle || "normal",
  textAlign: field.textAlign || "left",
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  padding: "5px",
  position: "absolute",
});

/**
 * Renderiza el contenido de preview de un módulo. Para Description con
 * 2 líneas y sin fillModule, parte el texto por espacios cerca del
 * medio y lo envuelve en un `<div>` (necesario porque el rotor es un
 * flex container donde `<br />` suelto no crea salto de línea).
 */
export const getFieldPreviewText = (field, itemData = null) => {
  if (field.type === "StaticText" || field.type === "Text")
    return field.content || "";
  const text = getFieldSampleString(field, itemData);

  if (field.type === "Description" && field.lines === 2 && !field.fillModule) {
    const mid = Math.floor(text.length / 2);
    let cut = text.indexOf(" ", mid);
    if (cut < 0) cut = text.lastIndexOf(" ", mid);
    if (cut < 0) cut = mid;
    return (
      <div style={{ width: "100%", textAlign: "inherit" }}>
        <div>{text.slice(0, cut).trim()}</div>
        <div>{text.slice(cut).trim()}</div>
      </div>
    );
  }
  return text;
};
