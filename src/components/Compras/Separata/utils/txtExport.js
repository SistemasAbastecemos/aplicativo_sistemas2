import { formatearFecha, agregarUnDia } from "./formatters";

/**
 * Genera y descarga el archivo TXT plano con formato fijo (posicional) para el
 * sistema de listas de precios. Preserva la lógica original: multiplica el
 * precio por 10000 y redondea, usa fecha inicial para "final" y fecha_final+1
 * día para "regular".
 *
 * @param {Object} params
 * @param {string} params.tipoPrecio - "final" | "regular"
 * @param {Object} params.currentSeparata
 * @param {Array}  params.separataItems
 * @param {Array}  params.listasPreciosSeleccionadas
 * @param {Function} params.addNotification
 */
export function exportarATxt({
  tipoPrecio,
  currentSeparata,
  separataItems,
  listasPreciosSeleccionadas,
  addNotification,
}) {
  if (!currentSeparata || separataItems.length === 0) {
    addNotification({
      message: "No hay datos para exportar",
      type: "warning",
    });
    return;
  }

  const formatearCampo = (valor, tipo, longitud) => {
    if (tipo === "Num") {
      return valor.toString().padStart(longitud, "0");
    } else {
      return valor.padEnd(longitud, " ");
    }
  };

  const usarFecha =
    tipoPrecio === "regular"
      ? agregarUnDia(currentSeparata.fecha_final)
      : currentSeparata.fecha_inicio;

  let contenidoArchivo = "";

  separataItems.forEach((item) => {
    const precio =
      tipoPrecio === "regular"
        ? parseFloat(item.precio_antes)
        : parseFloat(item.precio_ahora);

    const precioFormateado = Math.round(precio * 10000);

    listasPreciosSeleccionadas.forEach((listaPrecios) => {
      const linea =
        formatearCampo("I", "Alf", 1) +
        formatearCampo("", "Alf", 15) +
        formatearCampo(item.item, "Num", 6) +
        formatearCampo("", "Alf", 3) +
        formatearCampo(precioFormateado, "Num", 13) +
        formatearCampo(item.unidad_medida, "Alf", 3) +
        formatearCampo("", "Alf", 40) +
        formatearCampo(0, "Num", 18) +
        formatearCampo(0, "Num", 18) +
        formatearCampo(0, "Num", 16) +
        formatearCampo(listaPrecios, "Alf", 3) +
        formatearCampo(formatearFecha(usarFecha), "Num", 8);

      contenidoArchivo += linea + "\r\n";
    });
  });

  const blob = new Blob([contenidoArchivo], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "UN00316B.TXT";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  addNotification({
    message: `Archivo UN00316B.TXT generado con ${listasPreciosSeleccionadas.length} listas de precios`,
    type: "success",
  });
}
