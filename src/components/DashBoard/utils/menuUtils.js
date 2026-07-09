export const extraerFuncionesNavegables = (items, parentName = "") => {
  if (!Array.isArray(items)) return [];
  let listaFunciones = [];
  items.forEach((item) => {
    if (item.ruta && item.ruta !== "#" && item.ruta.trim() !== "") {
      listaFunciones.push({
        ...item,
        tipo: parentName ? "submenu" : "principal",
        parent: parentName || null,
      });
    }
    if (Array.isArray(item.children) && item.children.length > 0) {
      listaFunciones = listaFunciones.concat(
        extraerFuncionesNavegables(item.children, item.nombre),
      );
    }
  });
  return listaFunciones;
};
