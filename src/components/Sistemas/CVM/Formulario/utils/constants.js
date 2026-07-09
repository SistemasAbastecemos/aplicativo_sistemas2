import imagenConforme from "../../../../../assets/images/conforme.png";
import imagenRegularizacion from "../../../../../assets/images/regularizacion.png";
import imagenPrecinto from "../../../../../assets/images/precinto.png";

/**
 * Configuración declarativa de las tres verificaciones que se hacen al
 * equipo. Cada una define su tipo (usado para el API), imagen ilustrativa,
 * título y descripción. Añadir una cuarta verificación es agregar una
 * entrada aquí — el resto del código itera sobre esta lista.
 */
export const VERIFICACIONES = [
  {
    tipo: "conforme",
    imagen: imagenConforme,
    titulo: "Estado de Conforme",
    descripcion: "Etiqueta amarilla en zona frontal del equipo",
  },
  {
    tipo: "regularizacion",
    imagen: imagenRegularizacion,
    titulo: "Estado de Regularización",
    descripcion: "Etiqueta blanca en zona frontal del equipo",
  },
  {
    tipo: "precinto",
    imagen: imagenPrecinto,
    titulo: "Estado de Precinto",
    descripcion: "Etiqueta roja en zona inferior del equipo",
  },
];

/**
 * Estados posibles para cada verificación. Se mantiene como constante para
 * que el orden y las opciones estén en un solo lugar.
 */
export const ESTADOS_VERIFICACION = [
  { value: "Bueno", label: "Bueno" },
  { value: "Malo", label: "Malo" },
];

/**
 * Opciones de compresión de imagen. Preserva los valores del legacy: máximo
 * 1MB y 1024px en el lado más largo.
 */
export const OPCIONES_COMPRESION = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1024,
  useWebWorker: true,
};

/**
 * Observación por defecto para el reporte "todas las cajas sin novedad".
 */
export const OBSERVACION_TODAS_SIN_NOVEDAD =
  "La sede ha revisado todas las balanzas de todas las cajas y no hubo novedad, este reporte queda como registro de aquello";
