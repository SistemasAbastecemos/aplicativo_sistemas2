import { useCallback } from "react";
import { parseAnioValido } from "../utils/helpers";

/**
 * Encapsula la lógica de agregar/remover restricciones anuales y
 * bimestrales sobre el objeto `config`. Los inputs son controlados por el
 * componente que los usa; este hook solo recibe los valores ya "listos".
 *
 * Validaciones:
 *  - Año debe estar en el rango permitido (ver parseAnioValido)
 *  - No se permiten duplicados
 *  - Restricciones anuales se ordenan de menor a mayor
 *  - Restricciones bimestrales se ordenan por año, luego por bimestre
 */
export function useRestricciones({ config, setConfig, addNotification }) {
  const addRestriccionAnual = useCallback(
    (keyState, rawAnio) => {
      const anio = parseAnioValido(rawAnio);
      if (!anio) {
        addNotification({ message: "Año inválido", type: "warning" });
        return false;
      }
      if (config[keyState].includes(anio)) {
        addNotification({
          message: "El año ya está restringido",
          type: "warning",
        });
        return false;
      }
      setConfig((prev) => ({
        ...prev,
        [keyState]: [...prev[keyState], anio].sort((a, b) => a - b),
      }));
      return true;
    },
    [config, setConfig, addNotification],
  );

  const removeRestriccionAnual = useCallback(
    (keyState, anioToRemove) => {
      setConfig((prev) => ({
        ...prev,
        [keyState]: prev[keyState].filter((a) => a !== anioToRemove),
      }));
    },
    [setConfig],
  );

  const addRestriccionIva = useCallback(
    (rawAnio, rawBimestre) => {
      const anio = parseAnioValido(rawAnio);
      const bimestre = parseInt(rawBimestre);
      if (!anio) {
        addNotification({ message: "Año inválido", type: "warning" });
        return false;
      }
      const existe = config.restricciones_reteiva.some(
        (r) => r.anio === anio && r.bimestre === bimestre,
      );
      if (existe) {
        addNotification({
          message: "Este periodo ya está restringido",
          type: "warning",
        });
        return false;
      }
      setConfig((prev) => ({
        ...prev,
        restricciones_reteiva: [
          ...prev.restricciones_reteiva,
          { anio, bimestre },
        ].sort((a, b) =>
          a.anio !== b.anio ? a.anio - b.anio : a.bimestre - b.bimestre,
        ),
      }));
      return true;
    },
    [config, setConfig, addNotification],
  );

  const removeRestriccionIva = useCallback(
    (anio, bimestre) => {
      setConfig((prev) => ({
        ...prev,
        restricciones_reteiva: prev.restricciones_reteiva.filter(
          (r) => !(r.anio === anio && r.bimestre === bimestre),
        ),
      }));
    },
    [setConfig],
  );

  return {
    addRestriccionAnual,
    removeRestriccionAnual,
    addRestriccionIva,
    removeRestriccionIva,
  };
}
