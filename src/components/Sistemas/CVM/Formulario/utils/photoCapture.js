import imageCompression from "browser-image-compression";
import { OPCIONES_COMPRESION } from "./constants";

/**
 * Comprime una imagen usando browser-image-compression. Si falla la
 * compresión, devuelve el archivo original como fallback.
 */
export const compressImage = async (file) => {
  try {
    return await imageCompression(file, OPCIONES_COMPRESION);
  } catch (error) {
    console.error("Error comprimiendo imagen:", error);
    return file;
  }
};

/**
 * Dispara la cámara nativa del dispositivo (o file picker en desktop) para
 * capturar una foto. Retorna una promesa que resuelve con el archivo
 * comprimido y su URL local, o null si el usuario canceló.
 *
 * Nota: se usa `capture="camera"` que en móvil abre la cámara directa. En
 * desktop es ignorado y se abre el selector de archivos.
 */
export const capturarFoto = () =>
  new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "camera";
    input.onchange = async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const compressedFile = await compressImage(file);
      const url = URL.createObjectURL(compressedFile);
      resolve({ file: compressedFile, url });
    };
    input.click();
  });
