/**
 * Empresas del holding — el value es el prefijo usado en el nombre físico
 * del archivo (AB_, TS_) y el label es la razón social completa.
 */
export const EMPRESAS = [
  { value: "AB", label: "Abastecemos de Occidente S.A.S" },
  { value: "TS", label: "Tobar Sanchez Valencia y Vallejo S.A" },
];

/**
 * Tipos de archivo plano soportados. Cada value se combina con la empresa
 * para determinar el nombre físico del archivo destino en el backend.
 * Solo algunas combinaciones son válidas — el backend rechaza el resto.
 */
export const TIPOS_ARCHIVO = [
  { value: "", label: "Seleccione un tipo", disabled: true },
  { value: "CE", label: "Comprobantes de Egreso" },
  { value: "N", label: "Notas N" },
  { value: "NP", label: "Notas NP" },
  { value: "NI", label: "Notas NI" },
  { value: "CR", label: "Notas CR" },
  { value: "NG", label: "Notas NG" },
  { value: "Retefuente", label: "Retención en la Fuente" },
  { value: "ReteicaYumbo", label: "Rete ICA Yumbo" },
  { value: "ReteicaPalmira", label: "Rete ICA Palmira" },
  { value: "Reteiva", label: "Rete IVA" },
];

/**
 * Definición declarativa de los bloques de restricciones anuales. Cada uno
 * tiene su clave en el objeto `config` y su título mostrado en el header.
 * Agregar un nuevo bloque anual es agregar una entrada aquí.
 */
export const BLOQUES_ANUALES = [
  {
    key: "restricciones_retefuente",
    titulo: "Bloquear Retefuente",
  },
  {
    key: "restricciones_ica_yumbo",
    titulo: "Bloquear ReteICA Yumbo",
  },
  {
    key: "restricciones_ica_palmira",
    titulo: "Bloquear ReteICA Palmira",
  },
];

/**
 * Bimestres válidos para restricciones de ReteIVA.
 */
export const BIMESTRES_IVA = [1, 2, 3, 4, 5, 6];

/**
 * Rango de años válidos para restricciones. Fuera de este rango, el input
 * se rechaza con notificación.
 */
export const ANIO_MIN = 2000;
export const ANIO_MAX = 2100;

/**
 * Estado inicial de la configuración cuando el backend no devuelve nada
 * o falla el fetch.
 */
export const CONFIG_INICIAL = {
  carga_habilitada: false,
  restricciones_retefuente: [],
  restricciones_ica_yumbo: [],
  restricciones_ica_palmira: [],
  restricciones_reteiva: [],
};
