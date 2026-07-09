import { useState, useCallback } from "react";
import { apiService } from "../../../../services/api";

/**
 * Gestiona el estado de los filtros del reporte (empresa, sede, tercero,
 * fechas) y la búsqueda de proveedores con autocomplete.
 *
 * Reglas preservadas del legacy:
 *  - `proveedor_desc` es el texto visible del input (usado para display
 *    del filtro seleccionado)
 *  - `proveedor_id` es el código real del tercero (usado en la consulta)
 *  - Búsqueda solo si el término tiene ≥3 caracteres (trim aplicado)
 *  - Al escribir manualmente, se resetea `proveedor_id` porque el usuario
 *    puede estar escribiendo un nuevo criterio
 */
export function useFiltros({ addNotification }) {
  const [filtros, setFiltros] = useState({
    empresa: "AB",
    sede: "",
    proveedor_id: "",
    proveedor_desc: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  const [proveedoresOptions, setProveedoresOptions] = useState([]);
  const [buscandoProveedor, setBuscandoProveedor] = useState(false);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleProveedorSearch = useCallback(
    async (e) => {
      // Bloqueo de espacios al inicio (defensa contra pastes accidentales)
      const termino = e.target.value.replace(/^\s+/, "");
      setFiltros((prev) => ({
        ...prev,
        proveedor_desc: termino,
        proveedor_id: "",
      }));

      // Trim antes de decidir si buscar (evita disparar con solo espacios)
      const terminoTrimmed = termino.trim();
      if (terminoTrimmed.length < 3) {
        setProveedoresOptions([]);
        return;
      }

      setBuscandoProveedor(true);
      try {
        const response = await apiService.searchProveedores(terminoTrimmed);
        if (response.success) {
          setProveedoresOptions(response.data);
        }
      } catch (error) {
        addNotification({
          message: "Fallo en la búsqueda de proveedores",
          type: "error",
        });
      } finally {
        setBuscandoProveedor(false);
      }
    },
    [addNotification],
  );

  const selectProveedor = useCallback((prov) => {
    setFiltros((prev) => ({
      ...prev,
      proveedor_id: prov.codigo,
      proveedor_desc: `${prov.codigo} - ${prov.descripcion}`,
    }));
    setProveedoresOptions([]);
  }, []);

  const cerrarOpciones = useCallback(() => {
    setProveedoresOptions([]);
  }, []);

  return {
    filtros,
    proveedoresOptions,
    buscandoProveedor,
    handleFilterChange,
    handleProveedorSearch,
    selectProveedor,
    cerrarOpciones,
  };
}
