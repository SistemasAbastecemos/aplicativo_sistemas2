import React, { useEffect, useState } from "react";
import { apiService } from "../../../services/api";
import { useNotification } from "../../../contexts/NotificationContext";
import { useAuth } from "../../../contexts/AuthContext";
import styles from "./FormularioPedidos.module.css";
import LoadingScreen from "../../UI/LoadingScreen";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCow,
  faPiggyBank,
  faHeart,
  faSave,
  faShoppingCart,
  faUser,
  faStore,
  faCalendarCheck,
  faCheckCircle,
  faPlus,
  faMinus,
  faDollarSign,
  faWeightHanging,
  faCube,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";

const FormularioPedidos = ({ onLogout }) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [items, setItems] = useState([]);
  const [pedidoHoy, setPedidoHoy] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("RES");
  const [cantidades, setCantidades] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Verificar si ya hay pedido hoy
  useEffect(() => {
    const verificarPedidoHoy = async () => {
      try {
        const response = await apiService.verificarPedidoHoyCarnes(
          user?.sede_codigo
        );

        setPedidoHoy(response.existe);

        if (!response.existe) {
          cargarItems();
        }
      } catch (error) {
        addNotification({
          message: "Error al verificar pedidos del día.",
          type: "error",
        });
      }
    };

    verificarPedidoHoy();
  }, [user?.sede_codigo]);

  // Cargar items desde la base de datos
  const cargarItems = async () => {
    setLoading(true);
    try {
      const response = await apiService.getItemsCarnes();

      if (response && Array.isArray(response)) {
        setItems(response);
      } else {
        setItems([]);
        addNotification({
          message: "No se pudieron cargar los items de carnes",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error cargando items:", error);
      setItems([]);
      addNotification({
        message: "Error al cargar los items de carnes",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de cantidad
  const handleCantidadChange = (idItem, cantidad, unidadMedida) => {
    if (cantidad === "") {
      setCantidades((prev) => ({
        ...prev,
        [idItem]: cantidad,
      }));
      return;
    }

    const numero = parseFloat(cantidad);
    if (isNaN(numero) || numero < 0) {
      return;
    }

    if (unidadMedida === "UND") {
      const entero = Math.floor(numero);
      setCantidades((prev) => ({
        ...prev,
        [idItem]: entero.toString(),
      }));
    } else {
      const redondeado = Math.round(numero * 100) / 100;
      setCantidades((prev) => ({
        ...prev,
        [idItem]: redondeado.toString(),
      }));
    }
  };

  // Ajustar cantidad con botones +/-
  const ajustarCantidad = (idItem, incremento, unidadMedida) => {
    const actual = parseFloat(cantidades[idItem] || 0);
    let nueva;

    if (unidadMedida === "UND") {
      nueva = Math.max(0, actual + Math.floor(incremento));
    } else {
      nueva = Math.max(0, actual + incremento);
      nueva = Math.round(nueva * 100) / 100;
    }

    setCantidades((prev) => ({
      ...prev,
      [idItem]: nueva.toString(),
    }));
  };

  // Calcular totales
  const calcularTotales = () => {
    let totalResKG = 0;
    let totalResUND = 0;
    let totalCerdoKG = 0;
    let totalCerdoUND = 0;
    let totalViscerasKG = 0;
    let totalViscerasUND = 0;

    if (!items || !Array.isArray(items)) {
      return {
        totalResKG: "0.00",
        totalResUND: "0",
        totalCerdoKG: "0.00",
        totalCerdoUND: "0",
        totalViscerasKG: "0.00",
        totalViscerasUND: "0",
        totalGeneralKG: "0.00",
        totalGeneralUND: "0",
      };
    }

    items.forEach((item) => {
      const cantidad = parseFloat(cantidades[item.id] || 0);
      if (cantidad > 0) {
        if (item.categoria === "RES") {
          if (item.unidad_medida === "KG") totalResKG += cantidad;
          else if (item.unidad_medida === "UND") totalResUND += cantidad;
        } else if (item.categoria === "CERDO") {
          if (item.unidad_medida === "KG") totalCerdoKG += cantidad;
          else if (item.unidad_medida === "UND") totalCerdoUND += cantidad;
        } else if (item.categoria === "VISCERAS DE RES") {
          if (item.unidad_medida === "KG") totalViscerasKG += cantidad;
          else if (item.unidad_medida === "UND") totalViscerasUND += cantidad;
        }
      }
    });

    const totalGeneralKG = totalResKG + totalCerdoKG + totalViscerasKG;
    const totalGeneralUND = totalResUND + totalCerdoUND + totalViscerasUND;

    return {
      totalResKG: totalResKG.toFixed(2),
      totalResUND: totalResUND.toFixed(0),
      totalCerdoKG: totalCerdoKG.toFixed(2),
      totalCerdoUND: totalCerdoUND.toFixed(0),
      totalViscerasKG: totalViscerasKG.toFixed(2),
      totalViscerasUND: totalViscerasUND.toFixed(0),
      totalGeneralKG: totalGeneralKG.toFixed(2),
      totalGeneralUND: totalGeneralUND.toFixed(0),
    };
  };

  const {
    totalResKG,
    totalResUND,
    totalCerdoKG,
    totalCerdoUND,
    totalViscerasKG,
    totalViscerasUND,
    totalGeneralKG,
    totalGeneralUND,
  } = calcularTotales();

  // Verificar si hay al menos un item con cantidad > 0
  const hayItemsParaGuardar = () => {
    if (!items || !Array.isArray(items)) return false;
    return items.some((item) => {
      const cantidad = parseFloat(cantidades[item.id] || 0);
      return cantidad > 0;
    });
  };

  // Guardar pedido
  const guardarPedido = async () => {
    setSubmitting(true);
    try {
      const detalles = items
        .filter((item) => cantidades[item.id] > 0)
        .map((item) => ({
          id_item: item.id,
          cantidad: parseFloat(cantidades[item.id]),
        }));

      if (detalles.length === 0) {
        addNotification({
          message: "Debe ingresar al menos un item con cantidad mayor a 0.",
          type: "danger",
        });
        setSubmitting(false);
        return;
      }

      const pedidoData = {
        id_sede: user?.sede_codigo,
        nombre_usuario: user?.nombres_completos,
        total_res: totalResKG,
        total_cerdo: totalCerdoKG,
        total_visceras: totalViscerasKG,
        total_general: totalGeneralKG,
        detalles: detalles,
      };

      const response = await apiService.savePedidoCarnes(pedidoData);

      if (response && response.success) {
        addNotification({
          message: "Pedido guardado exitosamente y correo enviado.",
          type: "success",
        });
        setPedidoHoy(true);
      } else {
        addNotification({
          message: response.error || "Error al guardar el pedido.",
          type: "error",
        });
      }
    } catch (error) {
      if (error.response && error.response.success) {
        addNotification({
          message: error.response.message || "Error al guardar el pedido.",
          type: "error",
        });
        setPedidoHoy(true);
      } else {
        addNotification({
          message: "Error de conexión al guardar el pedido.",
          type: "error",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Si ya hay pedido hoy
  if (pedidoHoy) {
    return (
      <div className={styles.container}>
        <div className={styles.successState}>
          <div className={styles.successIcon}>
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <h2>¡Pedido Realizado!</h2>
          <p>Ya has realizado el pedido para el día de hoy.</p>
          <div className={styles.successDetails}>
            <FontAwesomeIcon icon={faCalendarCheck} />
            <span>Fecha: {new Date().toLocaleDateString("es-ES")}</span>
          </div>
        </div>
      </div>
    );
  }

  // Filtrar items por categoría activa
  const itemsCategoria =
    items && Array.isArray(items)
      ? items.filter((item) => item.categoria === categoriaActiva)
      : [];

  if (loading) {
    return <LoadingScreen message="Cargando información del catálogo..." />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerMain}>
            <h1 className={styles.title}>Sistema de Pedidos de Carnes</h1>
          </div>
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.userDetail}>
                <FontAwesomeIcon icon={faUser} />
                <span>{user?.nombres_completos || "Usuario"}</span>
              </div>
              <div className={styles.userDetail}>
                <FontAwesomeIcon icon={faStore} />
                <span>Sede: {user?.sede_codigo || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statsScroll}>
          <div className={`${styles.statCard} ${styles.statRes}`}>
            <div className={styles.statIcon}>
              <FontAwesomeIcon icon={faCow} />
            </div>
            <div className={styles.statContent}>
              <h3>{totalResKG} kg</h3>
              <p>Total Res</p>
              {parseInt(totalResUND) > 0 && (
                <span className={styles.statSubtitle}>
                  {totalResUND} unidades
                </span>
              )}
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statCerdo}`}>
            <div className={styles.statIcon}>
              <FontAwesomeIcon icon={faPiggyBank} />
            </div>
            <div className={styles.statContent}>
              <h3>{totalCerdoKG} kg</h3>
              <p>Total Cerdo</p>
              {parseInt(totalCerdoUND) > 0 && (
                <span className={styles.statSubtitle}>
                  {totalCerdoUND} unidades
                </span>
              )}
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statVisceras}`}>
            <div className={styles.statIcon}>
              <FontAwesomeIcon icon={faHeart} />
            </div>
            <div className={styles.statContent}>
              <h3>{totalViscerasKG} kg</h3>
              <p>Total Vísceras</p>
              {parseInt(totalViscerasUND) > 0 && (
                <span className={styles.statSubtitle}>
                  {totalViscerasUND} unidades
                </span>
              )}
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statGeneral}`}>
            <div className={styles.statIcon}>
              <FontAwesomeIcon icon={faChartBar} />
            </div>
            <div className={styles.statContent}>
              <h3>{totalGeneralKG} kg</h3>
              <p>Total General</p>
              {parseInt(totalGeneralUND) > 0 && (
                <span className={styles.statSubtitle}>
                  {totalGeneralUND} unidades
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categorías Navigation */}
      <div className={styles.categoriasSection}>
        <div className={styles.sectionHeader}>
          <h2>Selecciona la Categoría</h2>
        </div>
        <div className={styles.categoriasContainer}>
          <div className={styles.categoriasNav}>
            <button
              className={`${styles.categoriaBtn} ${
                categoriaActiva === "RES" ? styles.active : ""
              }`}
              onClick={() => setCategoriaActiva("RES")}
            >
              <div className={styles.categoriaIcon}>
                <FontAwesomeIcon icon={faCow} />
              </div>
              <span>Res</span>
            </button>

            <button
              className={`${styles.categoriaBtn} ${
                categoriaActiva === "CERDO" ? styles.active : ""
              }`}
              onClick={() => setCategoriaActiva("CERDO")}
            >
              <div className={styles.categoriaIcon}>
                <FontAwesomeIcon icon={faPiggyBank} />
              </div>
              <span>Cerdo</span>
            </button>

            <button
              className={`${styles.categoriaBtn} ${
                categoriaActiva === "VISCERAS DE RES" ? styles.active : ""
              }`}
              onClick={() => setCategoriaActiva("VISCERAS DE RES")}
            >
              <div className={styles.categoriaIcon}>
                <FontAwesomeIcon icon={faHeart} />
              </div>
              <span>Vísceras</span>
            </button>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className={styles.itemsSection}>
        <div className={styles.sectionHeader}>
          <h3>
            Productos de{" "}
            {categoriaActiva === "VISCERAS DE RES"
              ? "Vísceras"
              : categoriaActiva}
            <span className={styles.itemsCount}>
              {itemsCategoria.length} productos disponibles
            </span>
          </h3>
        </div>

        {itemsCategoria.length === 0 ? (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faShoppingCart} />
            <h4>No hay productos disponibles</h4>
            <p>No se encontraron items para esta categoría</p>
          </div>
        ) : (
          <div className={styles.itemsGrid}>
            {itemsCategoria.map((item) => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <div className={styles.itemBadge}>
                    <span>ITEM {item.id_item}</span>
                  </div>
                  <div className={styles.unidadMedida}>
                    <FontAwesomeIcon
                      icon={
                        item.unidad_medida === "KG" ? faWeightHanging : faCube
                      }
                    />
                    {item.unidad_medida}
                  </div>
                </div>

                <div className={styles.itemContent}>
                  <h4 className={styles.itemName}>{item.descripcion}</h4>
                  <p className={styles.itemCategory}>{item.categoria}</p>
                </div>

                <div className={styles.quantitySection}>
                  <div className={styles.quantityControls}>
                    <button
                      className={styles.quantityBtn}
                      onClick={() =>
                        ajustarCantidad(
                          item.id,
                          item.unidad_medida === "UND" ? -1 : -10,
                          item.unidad_medida
                        )
                      }
                      disabled={
                        !cantidades[item.id] ||
                        parseFloat(cantidades[item.id]) <= 0
                      }
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>

                    <div className={styles.quantityInputContainer}>
                      <input
                        type="number"
                        className={styles.quantityInput}
                        value={cantidades[item.id] || ""}
                        onChange={(e) =>
                          handleCantidadChange(
                            item.id,
                            e.target.value,
                            item.unidad_medida
                          )
                        }
                        min="0"
                        step={item.unidad_medida === "UND" ? "1" : "10"}
                        placeholder="0"
                      />
                      <span className={styles.quantityUnit}>
                        {item.unidad_medida}
                      </span>
                    </div>

                    <button
                      className={styles.quantityBtn}
                      onClick={() =>
                        ajustarCantidad(
                          item.id,
                          item.unidad_medida === "UND" ? 1 : 10,
                          item.unidad_medida
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>

                  {cantidades[item.id] &&
                    parseFloat(cantidades[item.id]) > 0 && (
                      <div className={styles.quantityBadge}>
                        {cantidades[item.id]} {item.unidad_medida}
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      {hayItemsParaGuardar() && (
        <div className={styles.actionBar}>
          <div className={styles.actionSummary}>
            <div className={styles.summaryText}>
              <strong>Pedido listo para enviar</strong>
              <span>
                {totalGeneralKG} kg total •{" "}
                {items.filter((item) => cantidades[item.id] > 0).length}{" "}
                productos
              </span>
            </div>
            <button
              className={styles.submitBtn}
              onClick={guardarPedido}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  <span>Confirmar Pedido</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {submitting && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <div className={styles.spinnerLarge}></div>
            <h3>Procesando pedido</h3>
            <p>Estamos guardando tu pedido y enviando la confirmación...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormularioPedidos;
