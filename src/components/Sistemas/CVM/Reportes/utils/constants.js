/**
 * Catálogo de sedes disponibles para el filtro. El value es el código interno
 * (usado en el backend) y el label es la etiqueta corta corporativa (B1, B2...).
 */
export const SEDES_OPTIONS = [
  { value: "Todas", label: "Todas las sedes" },
  { value: "001", label: "B1" },
  { value: "002", label: "B2" },
  { value: "004", label: "B4" },
  { value: "005", label: "B5" },
  { value: "006", label: "B6" },
  { value: "007", label: "B7" },
  { value: "008", label: "B8" },
  { value: "010", label: "B10" },
  { value: "013", label: "B9" },
];

/**
 * Estados de registro que se pueden filtrar. El color se usa para el badge en
 * la tarjeta y en el select.
 */
export const ESTADOS_OPTIONS = [
  { value: "No cumple", label: "No Cumple", color: "#ef4444" },
  { value: "Cumple", label: "Cumple", color: "#10b981" },
  { value: "Resueltos", label: "Resueltos", color: "#3b82f6" },
];
