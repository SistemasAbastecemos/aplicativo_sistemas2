import React from "react";
import styles from "./Pedidos.module.css";
import LoadingScreen from "../../UI/LoadingScreen";
import { useNotification } from "../../../contexts/NotificationContext";

// Hooks
import { usePedidosData } from "./hooks/usePedidosData";
import { usePedidosFilter } from "./hooks/usePedidosFilter";
import { useMarcadoPedidos } from "./hooks/useMarcadoPedidos";
import { useDaysTooltip } from "./hooks/useDaysTooltip";

// Components
import PedidosHeader from "./components/PedidosHeader";
import PedidosToolbar from "./components/PedidosToolbar";
import PedidosStats from "./components/PedidosStats";
import PoliciesCard from "./components/PoliciesCard";
import ResultadosContainer from "./components/ResultadosContainer";

/**
 * Orquestador del módulo Pedidos Fruver. Coordina cuatro hooks con
 * responsabilidades bien separadas:
 *  - `usePedidosData`: fetch por fecha + refresh + estado de datos
 *  - `usePedidosFilter`: búsqueda cliente + paginación
 *  - `useMarcadoPedidos`: toggle de items con persistencia en localStorage
 *  - `useDaysTooltip`: expandir/cerrar tooltip de días
 *
 * El componente en sí solo compone y conecta — sin lógica propia.
 */
const Pedidos = () => {
  const { addNotification } = useNotification();

  const data = usePedidosData({ addNotification });

  const filter = usePedidosFilter({ items: data.items });

  const marcado = useMarcadoPedidos({
    fecha: data.fecha,
    pedidos: data.pedidos,
    setPedidos: data.setPedidos,
    addNotification,
  });

  const tooltip = useDaysTooltip();

  if (data.cargando) {
    return (
      <LoadingScreen
        isVisible={true}
        title="Cargando pedidos"
        subtitle="Sincronizando con Fruver..."
        variant="fullscreen"
      />
    );
  }

  return (
    <div className={styles.container}>
      <PedidosHeader />

      <PedidosToolbar
        fecha={data.fecha}
        onFechaChange={data.cambiarFecha}
        search={filter.search}
        onSearchChange={filter.handleSearchChange}
        onRefresh={data.refrescar}
        cargando={data.cargando}
      />

      <PedidosStats
        totalFiltrados={filter.filteredItems.length}
        totalPedidos={data.pedidos.size}
        totalPaginas={filter.totalPages}
      />

      <PoliciesCard />

      <ResultadosContainer
        currentItems={filter.currentItems}
        startIndex={filter.startIndex}
        pedidos={data.pedidos}
        expandedId={tooltip.expandedId}
        hayBusqueda={filter.search.trim().length > 0}
        searchTrimmed={filter.search.trim()}
        paginaActual={filter.paginaActual}
        totalPages={filter.totalPages}
        onPageChange={filter.setPaginaActual}
        onTogglePedido={marcado.toggle}
        onToggleDays={tooltip.toggle}
      />
    </div>
  );
};

export default Pedidos;
