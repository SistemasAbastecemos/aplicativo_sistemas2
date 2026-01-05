import React, { useEffect, useState, useCallback, useMemo } from "react";
import { apiService } from "../../../services/api";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";
import styles from "./Pedidos.module.css";
import {
  faChevronRight,
  faSearch,
  faCalendarAlt,
  faCheckCircle,
  faTimesCircle,
  faSyncAlt,
  faInfoCircle,
  faClipboardList,
  faUser,
  faChevronLeft,
  faEllipsisH,
  faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ITEMS_PER_PAGE = 15;

const Pedidos = () => {
  const { addNotification } = useNotification();
  const [pendingNotification, setPendingNotification] = useState(null);
  const [items, setItems] = useState([]);
  const [pedidos, setPedidos] = useState(new Set());
  const [cargando, setCargando] = useState(false);
  const [search, setSearch] = useState("");
  const [fecha, setFecha] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [expandedDays, setExpandedDays] = useState(null);

  const fetchPedidos = useCallback(
    async (fechaSeleccionada = fecha) => {
      setCargando(true);
      try {
        const response = await apiService.getPedidosFruver(fechaSeleccionada);
        if (response.success) {
          setItems(response.data.items || []);
          setPaginaActual(1);

          const pedidosGuardados = localStorage.getItem(
            `pedidos_${fechaSeleccionada}`
          );
          if (pedidosGuardados) {
            setPedidos(new Set(JSON.parse(pedidosGuardados)));
          } else {
            setPedidos(new Set());
          }
        } else {
          console.error("Error cargando pedidos:", response.error);
          addNotification({
            message: "Error cargando pedidos",
            type: "error",
          });
        }
      } catch (error) {
        console.error("Error cargando pedidos:", error);
        addNotification({
          message: "Error cargando pedidos: " + (error.message || error),
          type: "error",
        });
      } finally {
        setCargando(false);
      }
    },
    [fecha]
  );

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleDateChange = (e) => {
    const nuevaFecha = e.target.value;
    setFecha(nuevaFecha);
    setPaginaActual(1);
    setCargando(true);
    apiService
      .getPedidosFruver(nuevaFecha)
      .then((response) => {
        if (response.success) {
          setItems(response.data.items || []);
          const pedidosGuardados = localStorage.getItem(
            `pedidos_${nuevaFecha}`
          );
          if (pedidosGuardados) {
            setPedidos(new Set(JSON.parse(pedidosGuardados)));
          } else {
            setPedidos(new Set());
          }
        } else {
          setPendingNotification({
            message: "Error cargando pedidos",
            type: "error",
          });
        }
      })
      .catch((error) => {
        setPendingNotification({
          message: "Error cargando pedidos: " + (error.message || error),
          type: "error",
        });
      })
      .finally(() => {
        setCargando(false);
      });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPaginaActual(1);

    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(
      setTimeout(() => {
        // La búsqueda se hace en el cliente con useMemo
      }, 300)
    );
  };

  const marcarPedido = (itemId) => {
    setPedidos((prev) => {
      const newPedidos = new Set(prev);
      const wasInPedidos = newPedidos.has(itemId);

      if (wasInPedidos) {
        newPedidos.delete(itemId);
        setPendingNotification({
          message: "Item removido del pedido",
          type: "info",
        });
      } else {
        newPedidos.add(itemId);
        setPendingNotification({
          message: "Item agregado al pedido",
          type: "success",
        });
      }

      localStorage.setItem(`pedidos_${fecha}`, JSON.stringify([...newPedidos]));
      return newPedidos;
    });
  };

  useEffect(() => {
    if (pendingNotification) {
      addNotification(pendingNotification);
      setPendingNotification(null);
    }
  }, [pendingNotification, addNotification]);

  const handleRefresh = () => {
    setPaginaActual(1);
    setCargando(true);
    apiService
      .getPedidosFruver(fecha)
      .then((response) => {
        if (response.success) {
          setItems(response.data.items || []);
          const pedidosGuardados = localStorage.getItem(`pedidos_${fecha}`);
          if (pedidosGuardados) {
            setPedidos(new Set(JSON.parse(pedidosGuardados)));
          } else {
            setPedidos(new Set());
          }
        } else {
          setPendingNotification({
            message: "Error cargando pedidos",
            type: "error",
          });
        }
      })
      .catch((error) => {
        setPendingNotification({
          message: "Error cargando pedidos: " + (error.message || error),
          type: "error",
        });
      })
      .finally(() => {
        setCargando(false);
      });
  };

  const toggleDaysTooltip = (itemId) => {
    setExpandedDays(expandedDays === itemId ? null : itemId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(`.${styles.daysCell}`)) {
        setExpandedDays(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (!search) return items;

    const searchLower = search.toLowerCase();
    return items.filter(
      (item) =>
        item.item?.toLowerCase().includes(searchLower) ||
        item.descripcion?.toLowerCase().includes(searchLower) ||
        item.comprador?.toLowerCase().includes(searchLower)
    );
  }, [items, search]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (paginaActual - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const totalPedidos = pedidos.size;
  const totalItems = items.length;

  const handlePageChange = (newPage) => {
    setPaginaActual(newPage);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    let startPage = Math.max(
      1,
      paginaActual - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    buttons.push(
      <button
        key="prev"
        className={styles.paginationButton}
        onClick={() => handlePageChange(paginaActual - 1)}
        disabled={paginaActual === 1}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
    );

    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          className={styles.paginationButton}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className={styles.paginationEllipsis}>
            <FontAwesomeIcon icon={faEllipsisH} />
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`${styles.paginationButton} ${
            i === paginaActual ? styles.paginationButtonActive : ""
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className={styles.paginationEllipsis}>
            <FontAwesomeIcon icon={faEllipsisH} />
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          className={styles.paginationButton}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        className={styles.paginationButton}
        onClick={() => handlePageChange(paginaActual + 1)}
        disabled={paginaActual === totalPages}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    );

    return buttons;
  };

  if (cargando) {
    return <LoadingScreen message="Cargando pedidos..." />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Pedidos Fruver</h1>
          <p className={styles.subtitle}>
            Gestiona y realiza seguimiento de los pedidos diarios
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filters}>
          {/* Fecha con floating label */}
          <div className={`${styles.formGroup} ${styles.floating}`}>
            <div className={styles.searchGroup}>
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className={styles.searchIcon}
              />
              <input
                type="date"
                value={fecha}
                onChange={handleDateChange}
                className={styles.formInput}
              />
              <label className={styles.formLabel}>Fecha</label>
            </div>
          </div>

          {/* Búsqueda con floating label */}
          <div className={`${styles.formGroup} ${styles.floating}`}>
            <div className={styles.searchGroup}>
              <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                className={styles.formInput}
                placeholder=" "
              />
              <label className={styles.formLabel}>Buscar items</label>
            </div>
          </div>

          <button
            className={styles.refreshButton}
            onClick={handleRefresh}
            title="Actualizar datos"
            disabled={cargando}
          >
            <FontAwesomeIcon
              icon={faSyncAlt}
              className={cargando ? styles.refreshIconLoading : ""}
            />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{filteredItems.length}</span>
          <span className={styles.statLabel}>Items filtrados</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalPedidos}</span>
          <span className={styles.statLabel}>Pedidos</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{totalPages}</span>
          <span className={styles.statLabel}>Páginas</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>
            {filteredItems.length > 0
              ? Math.round((totalPedidos / filteredItems.length) * 100)
              : 0}
            %
          </span>
          <span className={styles.statLabel}>Completado</span>
        </div>
      </div>

      {/* Policies Info - Solo mostrar en desktop */}
      <div className={styles.policiesCard}>
        <div className={styles.policiesHeader}>
          <FontAwesomeIcon
            icon={faInfoCircle}
            className={styles.policiesIcon}
          />
          <h3>Políticas de Pedidos</h3>
        </div>
        <div className={styles.policiesContent}>
          <ul className={styles.policiesList}>
            <li>Un solo pedido diario</li>
            <li>Mantener stock adecuado</li>
            <li>Listado actualizable</li>
            <li>Sábado incluye domingo y lunes</li>
          </ul>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {currentItems.length > 0 ? (
          <>
            <div className={styles.tableContainer}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.colIndex}>#</th>
                      <th className={styles.colItem}>Item</th>
                      <th className={styles.colDesc}>Descripción</th>
                      <th className={styles.colDias}>Días</th>
                      <th className={styles.colComprador}>Comprador</th>
                      <th className={styles.colEstado}>Estado</th>
                      <th className={styles.colAccion}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item, index) => (
                      <TableRow
                        key={item.item}
                        item={item}
                        index={startIndex + index}
                        isPedido={pedidos.has(item.item)}
                        onTogglePedido={marcarPedido}
                        isExpanded={expandedDays === item.item}
                        onToggleDays={toggleDaysTooltip}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
                  disabled={paginaActual === 1}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                  Anterior
                </button>

                <div className={styles.paginationInfo}>
                  Página <strong>{paginaActual}</strong> de {totalPages}
                </div>

                <button
                  className={styles.paginationButton}
                  onClick={() =>
                    setPaginaActual((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={paginaActual === totalPages}
                >
                  Siguiente
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <FontAwesomeIcon
              icon={faClipboardList}
              className={styles.emptyIcon}
            />
            <h3>No hay items disponibles</h3>
            <p>No se encontraron items para la fecha seleccionada</p>
            <button className={styles.refreshButton} onClick={handleRefresh}>
              <FontAwesomeIcon icon={faSyncAlt} />
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de Fila de Tabla optimizado (sin cambios)
const TableRow = React.memo(
  ({ item, index, isPedido, onTogglePedido, isExpanded, onToggleDays }) => {
    const handleToggle = () => {
      onTogglePedido(item.item);
    };

    const handleDaysClick = (e) => {
      e.stopPropagation();
      onToggleDays(item.item);
    };

    const formatDias = (diasString) => {
      if (!diasString) return [];
      return diasString.split(",").map((dia) => dia.trim());
    };

    const dias = formatDias(item.dias_pedido);
    const hasMultipleDias = dias.length > 0;

    return (
      <tr
        className={`${styles.tableRow} ${isPedido ? styles.rowSelected : ""}`}
      >
        <td className={styles.indexCell}>{index + 1}</td>
        <td className={styles.itemCode}>{item.item}</td>
        <td className={styles.itemDescription} title={item.descripcion}>
          {item.descripcion}
        </td>
        <td className={styles.diasCell}>
          <div className={styles.daysContainer} onClick={handleDaysClick}>
            {hasMultipleDias ? (
              <>
                <span
                  className={`${styles.daysText} ${
                    isExpanded ? styles.daysTextExpanded : ""
                  }`}
                  title={
                    isExpanded ? "Click para cerrar" : "Click para ver días"
                  }
                >
                  <FontAwesomeIcon
                    icon={faCalendarDay}
                    className={styles.daysIcon}
                  />
                  {dias.length} días
                </span>
                {isExpanded && (
                  <div className={styles.daysTooltip}>
                    <div className={styles.daysTooltipContent}>
                      <div className={styles.daysTooltipHeader}>
                        <strong>Días de Pedido:</strong>
                      </div>
                      <div className={styles.daysList}>
                        {dias.map((dia, idx) => (
                          <span key={idx} className={styles.dayItem}>
                            {dia}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <span className={styles.noDays}>-</span>
            )}
          </div>
        </td>
        <td className={styles.comprador}>
          <div className={styles.compradorContent}>
            <FontAwesomeIcon icon={faUser} className={styles.compradorIcon} />
            <span title={item.comprador}>{item.comprador}</span>
          </div>
        </td>
        <td className={styles.statusCell}>
          <span
            className={`${styles.statusBadge} ${
              isPedido ? styles.statusPedido : styles.statusPendiente
            }`}
          >
            <FontAwesomeIcon icon={isPedido ? faCheckCircle : faTimesCircle} />
            {isPedido ? "✓" : "✗"}
          </span>
        </td>
        <td className={styles.actionCell}>
          <button
            className={`${styles.pedidoButton} ${
              isPedido ? styles.pedidoSelected : ""
            }`}
            onClick={handleToggle}
            title={isPedido ? "Quitar del pedido" : "Agregar al pedido"}
          >
            <FontAwesomeIcon icon={isPedido ? faTimesCircle : faCheckCircle} />
            {isPedido ? "Quitar" : "Pedir"}
          </button>
        </td>
      </tr>
    );
  }
);

export default Pedidos;
