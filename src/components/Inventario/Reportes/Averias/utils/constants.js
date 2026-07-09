/**
 * Cantidad de registros por página en la tabla de resultados.
 */
export const ITEMS_POR_PAGINA = 50;

/**
 * Columnas de la tabla de resultados. Declaración única usada tanto para
 * renderizar los `<th>` como para saber cuáles son ordenables. Añadir
 * una columna es una entrada aquí.
 *
 * - `key`: campo en el objeto row del backend
 * - `label`: encabezado mostrado
 * - `sortable`: si permite ordenar
 * - `align`: "left" | "right" | "center"
 * - `bold`, `numero`, `moneda`, `truncate`, `badge`: modificadores visuales
 */
export const COLUMNAS_TABLA = [
  { key: "proveedor", label: "Proveedor", sortable: true, align: "left", truncate: true },
  { key: "linea", label: "Línea", sortable: true, align: "left" },
  { key: "sede", label: "Sede", sortable: true, align: "left" },
  { key: "local", label: "Local", sortable: true, align: "left" },
  { key: "item", label: "Ítem", sortable: true, align: "left", bold: true },
  { key: "nombre_item", label: "Nombre de Ítem", sortable: true, align: "left", truncate: true },
  { key: "existencia_final", label: "Existencia", sortable: true, align: "right", numero: true },
  { key: "costo_total", label: "Costo Total", sortable: true, align: "right", moneda: true },
  { key: "recoge_averias", label: "Recoge Averías", sortable: false, align: "center", badge: true },
];

/**
 * Columnas por las que se puede filtrar con dropdown multi-select.
 * Cada una tiene:
 *  - key: propiedad del objeto row
 *  - label: etiqueta mostrada en el trigger
 *  - stateKey: nombre en el objeto de estado (plural, ej. "proveedores")
 *  - searchKey: nombre en el objeto de búsqueda interna (singular, ej. "proveedor")
 */
export const FILTROS_DROPDOWN = [
  { key: "proveedor", label: "Proveedor", stateKey: "proveedores", searchKey: "proveedor" },
  { key: "linea", label: "Línea", stateKey: "lineas", searchKey: "linea" },
  { key: "item", label: "Ítem", stateKey: "items", searchKey: "item" },
];
