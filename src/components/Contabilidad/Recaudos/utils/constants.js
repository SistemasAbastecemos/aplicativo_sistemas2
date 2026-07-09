/**
 * Cantidad de registros por página en la preview de resultados.
 */
export const ITEMS_POR_PAGINA = 50;

/**
 * Tipos de filtro temporal disponibles. Son mutuamente excluyentes:
 *  - fecha: rango de fechas con inicio y fin
 *  - lapso: un mes/año específico
 */
export const TIPOS_FILTRO = [
  { value: "fecha", label: "Rango de Fechas" },
  { value: "lapso", label: "Por Lapso" },
];

/**
 * Tipos de transacción disponibles. "Todos" es el default.
 */
export const TIPOS_TRANSACCION = [
  { value: "Todos", label: "Todas las Transacciones" },
  { value: "Efectivo", label: "Efectivo" },
  { value: "Tarjetas", label: "Tarjetas" },
];

/**
 * Definición declarativa de las columnas de la tabla. Cada columna tiene:
 *  - key: campo en el objeto row del backend
 *  - label: encabezado mostrado
 *  - sortable: si permite ordenar clickeando
 *  - align: "left" | "right" (numérico/moneda)
 *  - bold: si el valor va en negrita
 *  - moneda: si se debe formatear como COP
 *
 * Esto elimina el copy-paste masivo del legacy que repetía la misma
 * estructura de `<th>` 9 veces con solicitarOrden/getIconoOrden manuales.
 */
export const COLUMNAS_TABLA = [
  { key: "id_co", label: "Sede", sortable: true, align: "left" },
  { key: "id_tipdoc", label: "Tipo Doc", sortable: true, align: "left" },
  { key: "documento_fc", label: "Nº Documento", sortable: true, align: "left", bold: true },
  { key: "fecha_fc", label: "Fecha", sortable: true, align: "left" },
  { key: "lapso_doc", label: "Lapso", sortable: true, align: "left" },
  { key: "ind_modo", label: "Modo", sortable: true, align: "left" },
  { key: "medio_desc", label: "Medio Recaudo", sortable: true, align: "left" },
  { key: "medio_refer", label: "Referencia", sortable: true, align: "left" },
  { key: "vlr_recaudo", label: "Valor", sortable: true, align: "right", moneda: true },
];
