import { useState, useEffect } from "react";
import { apiService } from "../../../../../services/api";
import { normalizarCodigoSede } from "../utils/helpers";

/**
 * Carga el catálogo de sedes al montar y preselecciona todas por defecto.
 * Los códigos se normalizan a formato de 3 dígitos con padding de ceros.
 *
 * Los campos de sede varían según el endpoint: `co_siesa`, `codigo` o
 * `id_co` — el helper `normalizarCodigoSede` los resuelve.
 */
export function useSedesMaestro() {
  const [maestroSedes, setMaestroSedes] = useState([]);
  const [sedesSeleccionadas, setSedesSeleccionadas] = useState([]);
  const [loadingSedes, setLoadingSedes] = useState(false);

  useEffect(() => {
    const cargarSedes = async () => {
      setLoadingSedes(true);
      try {
        const sedesData = await apiService.getSedes(true);
        const listaSedes = sedesData || [];
        setMaestroSedes(listaSedes);
        const todosLosCodigos = listaSedes.map(normalizarCodigoSede);
        setSedesSeleccionadas(todosLosCodigos);
      } catch (error) {
        console.error("Error recuperando el maestro de sedes:", error);
      } finally {
        setLoadingSedes(false);
      }
    };
    cargarSedes();
  }, []);

  const toggleSede = (codigoSede) => {
    const codigoLimpio = String(codigoSede).trim().padStart(3, "0");
    setSedesSeleccionadas((prev) =>
      prev.includes(codigoLimpio)
        ? prev.filter((cd) => cd !== codigoLimpio)
        : [...prev, codigoLimpio],
    );
  };

  const toggleTodasSedes = () => {
    if (sedesSeleccionadas.length === maestroSedes.length) {
      setSedesSeleccionadas([]);
    } else {
      setSedesSeleccionadas(maestroSedes.map(normalizarCodigoSede));
    }
  };

  return {
    maestroSedes,
    sedesSeleccionadas,
    loadingSedes,
    toggleSede,
    toggleTodasSedes,
  };
}
