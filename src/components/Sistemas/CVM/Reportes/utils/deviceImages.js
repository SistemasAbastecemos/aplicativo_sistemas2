import imagenGramera from "../../../../../assets/images/gramera.png";
import imagenScannerBalanza from "../../../../../assets/images/scannerbalanza.png";
import imagenAdvertencia from "../../../../../assets/images/advertencia.png";

/**
 * Devuelve la imagen correspondiente al tipo de balanza registrado. Si el
 * tipo no está mapeado, devuelve la imagen de advertencia genérica.
 */
export const getTipoBalanzaImagen = (tipoBalanza) => {
  switch (tipoBalanza) {
    case "GRAMERA":
      return imagenGramera;
    case "SCANNER BALANZA":
      return imagenScannerBalanza;
    default:
      return imagenAdvertencia;
  }
};
