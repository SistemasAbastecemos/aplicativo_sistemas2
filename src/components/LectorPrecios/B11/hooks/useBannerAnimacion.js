import { useState, useEffect } from "react";
import {
  MENSAJES_BANNER,
  INTERVALO_ROTACION_BANNER,
  CANTIDAD_PARTICULAS,
} from "../utils/constants";

/**
 * Banner inferior con mensajes rotatorios y partículas flotantes.
 * Cicla los mensajes de MENSAJES_BANNER (const) cada
 * INTERVALO_ROTACION_BANNER ms, y en cada transición genera un nuevo
 * conjunto de partículas con posición/tamaño/duración aleatorios.
 *
 * Solo se activa cuando `pausado` es false (no hay producto, error ni
 * carga en curso) — no gasta ciclos si la pantalla muestra un resultado.
 */
export function useBannerAnimacion({ pausado }) {
  const [indiceMensaje, setIndiceMensaje] = useState(0);
  const [particulas, setParticulas] = useState([]);

  useEffect(() => {
    if (pausado) return;

    const generarParticulas = () =>
      Array.from({ length: CANTIDAD_PARTICULAS }).map((_, i) => ({
        id: Date.now() + i,
        left: `${Math.random() * 90 + 5}%`,
        size: `${Math.random() * 6 + 4}px`,
        delay: `${Math.random() * 2}s`,
        duration: `${Math.random() * 3 + 3}s`,
      }));

    const rotar = () => {
      setIndiceMensaje(Math.floor(Math.random() * MENSAJES_BANNER.length));
      setParticulas(generarParticulas());
    };

    rotar();
    const intervalo = setInterval(rotar, INTERVALO_ROTACION_BANNER);
    return () => clearInterval(intervalo);
  }, [pausado]);

  return {
    mensajeActivo: MENSAJES_BANNER[indiceMensaje],
    particulas,
  };
}
