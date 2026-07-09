export const formatTimeString = (date) =>
  date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

export const formatDateString = (date) =>
  date.toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const obtenerSaludo = (fecha = new Date()) => {
  const hora = fecha.getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 18) return "Buenas tardes";
  return "Buenas noches";
};

export const obtenerNombreEmpresa = (empresa) =>
  empresa === "abastecemos"
    ? "Abastecemos de Occidente S.A.S"
    : "Tobar Sánchez Vallejo S.A";
