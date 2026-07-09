import { useState, useMemo } from "react";

export const useInformesFilter = (informes, user) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");

  const idAreaUser = Number(user?.id_area);
  const idCargoUser = Number(user?.id_cargo);
  const esAdministrador = user?.id_rol === 1;

  const searchTrimmed = useMemo(() => searchTerm.trim(), [searchTerm]);
  const hayBusqueda = searchTrimmed.length > 0;

  const areasUnicas = useMemo(() => {
    return [...new Set(informes.map((inf) => inf.area_nombre))];
  }, [informes]);

  const verificarAcceso = (informe) => {
    if (esAdministrador) return true;
    const permisoPorArea = informe.permisos?.areas?.includes(idAreaUser);
    const permisoPorCargo = informe.permisos?.cargos?.includes(idCargoUser);
    return permisoPorArea || permisoPorCargo;
  };

  const informesDisponibles = useMemo(() => {
    const texto = searchTrimmed.toLowerCase();

    return informes.filter((inf) => {
      if (Number(inf.activo) === 0 && !esAdministrador) return false;
      if (!verificarAcceso(inf) && !esAdministrador) return false;

      const matchesSearch = !texto || inf.titulo?.toLowerCase().includes(texto);
      const matchesArea =
        selectedArea === "all" || inf.area_nombre === selectedArea;

      return matchesSearch && matchesArea;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    informes,
    searchTrimmed,
    selectedArea,
    esAdministrador,
    idAreaUser,
    idCargoUser,
  ]);

  const handleSearchChange = (e) => {
    // Bloquea espacios al inicio en tiempo real
    setSearchTerm(e.target.value.replace(/^\s+/, ""));
  };

  return {
    searchTerm,
    searchTrimmed,
    hayBusqueda,
    selectedArea,
    setSelectedArea,
    handleSearchChange,
    areasUnicas,
    informesDisponibles,
    esAdministrador,
  };
};
