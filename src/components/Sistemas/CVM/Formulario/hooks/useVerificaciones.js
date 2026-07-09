import { useState, useCallback, useEffect } from "react";
import { capturarFoto } from "../utils/photoCapture";
import { VERIFICACIONES } from "../utils/constants";

/**
 * Encapsula el estado de las tres verificaciones (conforme, regularización,
 * precinto). Cada verificación tiene: un archivo (comprimido), una URL local
 * para previsualización, y un estado ("Bueno" / "Malo").
 *
 * Se accede por tipo usando `verificaciones[tipo]` — más limpio que tener 9
 * useState separados como en el original.
 */
export function useVerificaciones() {
  // Inicializa un objeto con las 3 verificaciones en estado por defecto
  const inicial = VERIFICACIONES.reduce((acc, v) => {
    acc[v.tipo] = { file: null, url: null, estado: "Bueno" };
    return acc;
  }, {});

  const [verificaciones, setVerificaciones] = useState(inicial);

  const tomarFoto = useCallback(async (tipo) => {
    const resultado = await capturarFoto();
    if (!resultado) return;

    setVerificaciones((prev) => {
      // Si ya había una URL previa, revocarla para liberar memoria
      const urlAnterior = prev[tipo]?.url;
      if (urlAnterior) URL.revokeObjectURL(urlAnterior);

      return {
        ...prev,
        [tipo]: {
          ...prev[tipo],
          file: resultado.file,
          url: resultado.url,
        },
      };
    });
  }, []);

  const cambiarEstado = useCallback((tipo, nuevoEstado) => {
    setVerificaciones((prev) => ({
      ...prev,
      [tipo]: { ...prev[tipo], estado: nuevoEstado },
    }));
  }, []);

  const resetVerificaciones = useCallback(() => {
    // Revocar todas las URLs antes de resetear
    setVerificaciones((prev) => {
      Object.values(prev).forEach((v) => {
        if (v.url) URL.revokeObjectURL(v.url);
      });
      return inicial;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup al desmontar: liberar todas las URLs pendientes
  useEffect(() => {
    return () => {
      Object.values(verificaciones).forEach((v) => {
        if (v.url) URL.revokeObjectURL(v.url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todasCompletas = VERIFICACIONES.every(
    (v) => verificaciones[v.tipo]?.file && verificaciones[v.tipo]?.estado,
  );

  return {
    verificaciones,
    tomarFoto,
    cambiarEstado,
    resetVerificaciones,
    todasCompletas,
  };
}
