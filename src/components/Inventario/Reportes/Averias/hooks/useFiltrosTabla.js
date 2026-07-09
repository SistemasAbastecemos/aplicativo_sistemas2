import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { FILTROS_DROPDOWN } from "../utils/constants";
import { extraerCatalogoUnico } from "../utils/helpers";

/**
 * Gestiona los tres dropdowns multi-select de la tabla (Proveedor, Línea,
 * Ítem). Cada uno tiene:
 *  - Su propio estado abierto/cerrado (mutuamente excluyentes)
 *  - Su propia lista de selecciones
 *  - Su propio término de búsqueda interno
 *
 * Al llegar un nuevo dataset (`datos` cambia), todas las selecciones se
 * resetean a "todo marcado" (comportamiento preservado del legacy).
 *
 * Click fuera cierra cualquier dropdown abierto.
 */
export function useFiltrosTabla({ datos, containerRef }) {
  const [dropdownAbierto, setDropdownAbierto] = useState({
    proveedor: false,
    linea: false,
    item: false,
  });
  const [filtros, setFiltros] = useState({
    proveedores: [],
    lineas: [],
    items: [],
  });
  const [busquedaFiltro, setBusquedaFiltro] = useState({
    proveedor: "",
    linea: "",
    item: "",
  });

  // Catálogos únicos derivados del dataset actual
  const catalogosFiltros = useMemo(() => {
    if (!datos || datos.length === 0) {
      return { proveedores: [], lineas: [], items: [] };
    }
    return {
      proveedores: extraerCatalogoUnico(datos, "proveedor"),
      lineas: extraerCatalogoUnico(datos, "linea"),
      items: extraerCatalogoUnico(datos, "item"),
    };
  }, [datos]);

  // Reset al llegar un nuevo dataset (referencia distinta)
  const refDatos = useRef(null);
  if (datos !== refDatos.current) {
    refDatos.current = datos;
    setFiltros({
      proveedores: [...catalogosFiltros.proveedores],
      lineas: [...catalogosFiltros.lineas],
      items: [...catalogosFiltros.items],
    });
    setBusquedaFiltro({ proveedor: "", linea: "", item: "" });
    setDropdownAbierto({ proveedor: false, linea: false, item: false });
  }

  // Click fuera cierra todo
  useEffect(() => {
    const handleClicExterno = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownAbierto({ proveedor: false, linea: false, item: false });
      }
    };
    document.addEventListener("mousedown", handleClicExterno);
    return () => document.removeEventListener("mousedown", handleClicExterno);
  }, [containerRef]);

  const esTodosSeleccionado = useCallback(
    (categoria) =>
      catalogosFiltros[categoria].length > 0 &&
      filtros[categoria].length === catalogosFiltros[categoria].length,
    [catalogosFiltros, filtros],
  );

  const toggleOpcion = useCallback(
    (categoria, valor) => {
      setFiltros((prev) => {
        const actuales = prev[categoria];
        let nuevos;
        if (valor === "TODOS") {
          const todasOpciones = catalogosFiltros[categoria];
          const estanTodasMarcadas =
            todasOpciones.length > 0 &&
            actuales.length === todasOpciones.length;
          nuevos = estanTodasMarcadas ? [] : [...todasOpciones];
        } else {
          nuevos = actuales.includes(valor)
            ? actuales.filter((v) => v !== valor)
            : [...actuales, valor];
        }
        return { ...prev, [categoria]: nuevos };
      });
    },
    [catalogosFiltros],
  );

  const toggleDropdown = useCallback((menu) => {
    setDropdownAbierto((prev) => ({
      proveedor: menu === "proveedor" ? !prev.proveedor : false,
      linea: menu === "linea" ? !prev.linea : false,
      item: menu === "item" ? !prev.item : false,
    }));
  }, []);

  const handleBusquedaChange = useCallback((e) => {
    // Bloqueo de espacios al inicio en tiempo real
    const { name, value } = e.target;
    setBusquedaFiltro((prev) => ({
      ...prev,
      [name]: value.replace(/^\s+/, ""),
    }));
  }, []);

  // Opciones visibles en cada dropdown filtradas por su buscador (trim)
  const opcionesFiltradas = useMemo(() => {
    const filtrar = (lista, busqueda) => {
      const busquedaLower = busqueda.trim().toLowerCase();
      if (!busquedaLower) return lista;
      return lista.filter((v) =>
        String(v).toLowerCase().includes(busquedaLower),
      );
    };
    return {
      proveedores: filtrar(
        catalogosFiltros.proveedores,
        busquedaFiltro.proveedor,
      ),
      lineas: filtrar(catalogosFiltros.lineas, busquedaFiltro.linea),
      items: filtrar(catalogosFiltros.items, busquedaFiltro.item),
    };
  }, [catalogosFiltros, busquedaFiltro]);

  const obtenerLabelDropdown = useCallback(
    (categoria) => {
      const stateKey = FILTROS_DROPDOWN.find((f) => f.searchKey === categoria)
        ?.stateKey;
      if (!stateKey) return "";
      return esTodosSeleccionado(stateKey)
        ? "Todos"
        : `${filtros[stateKey].length} sel.`;
    },
    [filtros, esTodosSeleccionado],
  );

  return {
    filtros,
    dropdownAbierto,
    busquedaFiltro,
    catalogosFiltros,
    opcionesFiltradas,
    esTodosSeleccionado,
    toggleOpcion,
    toggleDropdown,
    handleBusquedaChange,
    obtenerLabelDropdown,
  };
}
