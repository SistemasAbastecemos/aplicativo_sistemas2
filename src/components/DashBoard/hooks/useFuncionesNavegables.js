import { useMemo, useState, useEffect } from "react";
import { extraerFuncionesNavegables } from "../utils/menuUtils";

export const useFuncionesNavegables = (menu) => {
  const [searchTerm, setSearchTerm] = useState("");

  const funcionesDisponibles = useMemo(
    () => extraerFuncionesNavegables(menu),
    [menu],
  );

  const funcionesFiltradas = useMemo(() => {
    if (!searchTerm) return funcionesDisponibles;
    const q = searchTerm.toLowerCase();
    return funcionesDisponibles.filter(
      (item) =>
        item.nombre.toLowerCase().includes(q) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(q)),
    );
  }, [searchTerm, funcionesDisponibles]);

  const [stats, setStats] = useState({
    funcionesDisponibles: 0,
    permisosTotales: 0,
    ultimoAcceso: new Date().toLocaleDateString(),
  });

  useEffect(() => {
    if (funcionesDisponibles.length > 0) {
      setStats((prev) => ({
        ...prev,
        funcionesDisponibles: funcionesDisponibles.length,
        permisosTotales: funcionesDisponibles.reduce(
          (total, item) =>
            total + Object.values(item.permisos || {}).filter(Boolean).length,
          0,
        ),
      }));
    }
  }, [funcionesDisponibles]);

  return {
    searchTerm,
    setSearchTerm,
    funcionesAMostrar: funcionesFiltradas,
    stats,
  };
};
