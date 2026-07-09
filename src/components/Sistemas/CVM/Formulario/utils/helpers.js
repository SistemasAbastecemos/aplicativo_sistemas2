import imagenGramera from "../../../../../assets/images/gramera.png";
import imagenScannerBalanza from "../../../../../assets/images/scannerbalanza.png";

/**
 * Devuelve la imagen ilustrativa del tipo de equipo detectado, o null si
 * el tipo no está mapeado.
 */
export const obtenerImagenEquipo = (equipoInfo) => {
  if (!equipoInfo) return null;
  switch (equipoInfo.tipo) {
    case "GRAMERA":
      return imagenGramera;
    case "SCANER BALANZA":
      return imagenScannerBalanza;
    default:
      return null;
  }
};

/**
 * Genera la fecha actual en formato YYYYMMDD (formato esperado por el API).
 */
export const obtenerFechaActual = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${anio}${mes}${dia}`;
};

/**
 * Colores para el estado de una verificación (Bueno = verde corporativo,
 * Malo = rojo Apple).
 */
export const getEstadoColor = (estado) =>
  estado === "Bueno" ? "#03996b" : "#d63030";
