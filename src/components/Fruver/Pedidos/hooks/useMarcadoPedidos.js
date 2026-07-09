import { useCallback } from "react";
import { guardarPedidos } from "../utils/helpers";

/**
 * Encapsula el toggle de items marcados como pedido. Actualiza el Set
 * en memoria, persiste el cambio en localStorage y notifica al usuario.
 *
 * Se separa del hook de datos para mantener responsabilidades claras:
 *  - `usePedidosData` → fetching y estado de datos remotos
 *  - `useMarcadoPedidos` → interacción del usuario sobre esos datos
 */
export function useMarcadoPedidos({
  fecha,
  pedidos,
  setPedidos,
  addNotification,
}) {
  const toggle = useCallback(
    (itemId) => {
      const yaEstaba = pedidos.has(itemId);
      const nuevos = new Set(pedidos);

      if (yaEstaba) {
        nuevos.delete(itemId);
      } else {
        nuevos.add(itemId);
      }

      setPedidos(nuevos);
      guardarPedidos(fecha, nuevos);

      addNotification({
        message: yaEstaba
          ? "Item removido del pedido"
          : "Item agregado al pedido",
        type: yaEstaba ? "info" : "success",
      });
    },
    [fecha, pedidos, setPedidos, addNotification],
  );

  return { toggle };
}
