import { useState, useEffect } from "react";
import { formatearFechaHora } from "../utils/formatters";

/**
 * Reloj en vivo: devuelve la fecha/hora formateada y la actualiza cada
 * segundo. Se ejecuta continuamente mientras el componente esté montado.
 */
export function useReloj() {
  const [fechaHora, setFechaHora] = useState(formatearFechaHora);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setFechaHora(formatearFechaHora());
    }, 1000);
    return () => clearInterval(intervalo);
  }, []);

  return fechaHora;
}
