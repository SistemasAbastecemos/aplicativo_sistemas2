import { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "../../../../services/api";
import { fechaHoy, leerPedidosGuardados } from "../utils/helpers";

/**
 * Encapsula el fetch de pedidos por fecha. Al cargar (o al cambiar de
 * fecha) trae los items del backend y sincroniza el Set de pedidos
 * marcados desde el localStorage correspondiente a esa fecha.
 *
 * Expone `setPedidos` para que el hook de selección pueda actualizarlo.
 */
export function usePedidosData({ addNotification }) {
  const [items, setItems] = useState([]);
  const [pedidos, setPedidos] = useState(new Set());
  const [cargando, setCargando] = useState(false);
  const [fecha, setFecha] = useState(fechaHoy);

  // Ref para llamar addNotification sin que dispare re-fetches
  const notifRef = useRef(addNotification);
  useEffect(() => {
    notifRef.current = addNotification;
  }, [addNotification]);

  const fetchPedidos = useCallback(async (fechaSeleccionada) => {
    setCargando(true);
    try {
      const response = await apiService.getPedidosFruver(fechaSeleccionada);
      if (response.success) {
        setItems(response.data.items || []);
        setPedidos(leerPedidosGuardados(fechaSeleccionada));
      } else {
        notifRef.current({
          message: "Error cargando pedidos",
          type: "error",
        });
      }
    } catch (error) {
      notifRef.current({
        message: "Error cargando pedidos: " + (error.message || error),
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  }, []);

  // Carga inicial + refetch al cambiar de fecha
  useEffect(() => {
    fetchPedidos(fecha);
  }, [fecha, fetchPedidos]);

  const cambiarFecha = useCallback((nuevaFecha) => {
    setFecha(nuevaFecha);
  }, []);

  const refrescar = useCallback(() => {
    fetchPedidos(fecha);
  }, [fetchPedidos, fecha]);

  return {
    items,
    pedidos,
    setPedidos,
    cargando,
    fecha,
    cambiarFecha,
    refrescar,
  };
}
