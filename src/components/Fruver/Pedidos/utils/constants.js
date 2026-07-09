/**
 * Cantidad de registros por página en la tabla de items.
 */
export const ITEMS_PER_PAGE = 15;

/**
 * Cantidad máxima de botones numerados visibles en la paginación. Los
 * excedentes se colapsan como "..." (ellipsis).
 */
export const MAX_PAGINATION_BUTTONS = 5;

/**
 * Lista de políticas mostradas en la card informativa (solo desktop).
 * Centralizada para modificar el copy en un solo lugar.
 */
export const POLITICAS_PEDIDOS = [
  "Un solo pedido diario",
  "Mantener stock adecuado",
  "Listado actualizable",
  "Sábado incluye domingo y lunes",
];

/**
 * Prefijo del key en localStorage donde se persisten los items marcados
 * por día. Formato: `${STORAGE_PREFIX}${fecha}` (ej: pedidos_2024-06-15).
 */
export const STORAGE_PREFIX = "pedidos_";
