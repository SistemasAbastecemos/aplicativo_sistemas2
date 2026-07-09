import { useState, useEffect, useCallback, useMemo } from "react";
import { apiService } from "../../../../services/api";

export const useFormularioPedidos = (user, addNotification) => {
  const [items, setItems] = useState([]);
  const [pedidoHoy, setPedidoHoy] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("RES");
  const [cantidades, setCantidades] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sincroniza el estado del dia y el catalogo transaccional plano
  useEffect(() => {
    const inicializarModuloCarnes = async () => {
      if (!user?.sede_codigo) return;
      setLoading(true);
      try {
        const response = await apiService.verificarPedidoHoyCarnes(
          user.sede_codigo,
        );
        setPedidoHoy(!!response.existe);

        if (!response.existe) {
          const resItems = await apiService.getItemsCarnes();
          if (resItems && Array.isArray(resItems)) {
            setItems(resItems);
          } else {
            addNotification({
              message: "No se pudieron cargar los items de carnes.",
              type: "error",
            });
          }
        }
      } catch (error) {
        console.error("Error cargando el modulo de carnes:", error);
        addNotification({
          message: "Error al verificar pedidos del dia.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    inicializarModuloCarnes();
  }, [user?.sede_codigo, addNotification]);

  // Manejo de entrada manual en inputs de cantidad
  const handleCantidadChange = useCallback((idItem, cantidad, unidadMedida) => {
    if (cantidad === "") {
      setCantidades((prev) => ({ ...prev, [idItem]: "" }));
      return;
    }

    const numero = parseFloat(cantidad);
    if (isNaN(numero) || numero < 0) return;

    if (unidadMedida === "UND") {
      const entero = Math.floor(numero);
      setCantidades((prev) => ({ ...prev, [idItem]: entero.toString() }));
    } else {
      const redondeado = Math.round(numero * 100) / 100;
      setCantidades((prev) => ({ ...prev, [idItem]: redondeado.toString() }));
    }
  }, []);

  // Control de incremento por botones con escala por unidad de medida
  const ajustarCantidad = useCallback((idItem, incremento, unidadMedida) => {
    setCantidades((prev) => {
      const actual = parseFloat(prev[idItem] || 0);
      let nueva;

      if (unidadMedida === "UND") {
        nueva = Math.max(0, actual + Math.floor(incremento));
      } else {
        nueva = Math.max(0, actual + incremento);
        nueva = Math.round(nueva * 100) / 100;
      }

      return { ...prev, [idItem]: nueva.toString() };
    });
  }, []);

  // Filtrado reactivo por categorias reales de tu base de datos
  const itemsFiltrados = useMemo(() => {
    return items.filter((item) => item.categoria === categoriaActiva);
  }, [items, categoriaActiva]);

  // Motor analitico de totales con paridad exacta a tu logica original
  const totales = useMemo(() => {
    let totalResKG = 0;
    let totalResUND = 0;
    let totalCerdoKG = 0;
    let totalCerdoUND = 0;
    let totalViscerasKG = 0;
    let totalViscerasUND = 0;
    let totalCanalesKG = 0;
    let totalCanalesUND = 0;
    let cuentaProductos = 0;

    items.forEach((item) => {
      const cantidad = parseFloat(cantidades[item.id] || 0);
      if (cantidad > 0) {
        cuentaProductos++;
        if (item.categoria === "RES") {
          if (item.unidad_medida === "KG") totalResKG += cantidad;
          else if (item.unidad_medida === "UND") totalResUND += cantidad;
        } else if (item.categoria === "CERDO") {
          if (item.unidad_medida === "KG") totalCerdoKG += cantidad;
          else if (item.unidad_medida === "UND") totalCerdoUND += cantidad;
        } else if (item.categoria === "VISCERAS DE RES") {
          if (item.unidad_medida === "KG") totalViscerasKG += cantidad;
          else if (item.unidad_medida === "UND") totalViscerasUND += cantidad;
        } else if (item.categoria === "CANALES") {
          if (item.unidad_medida === "KG") totalCanalesKG += cantidad;
          else if (item.unidad_medida === "UND") totalCanalesUND += cantidad;
        }
      }
    });

    const totalGeneralKG =
      totalResKG + totalCerdoKG + totalViscerasKG + totalCanalesKG;
    const totalGeneralUND =
      totalResUND + totalCerdoUND + totalViscerasUND + totalCanalesUND;

    return {
      totalResKG: totalResKG.toFixed(2),
      totalResUND: totalResUND.toFixed(0),
      totalCerdoKG: totalCerdoKG.toFixed(2),
      totalCerdoUND: totalCerdoUND.toFixed(0),
      totalViscerasKG: totalViscerasKG.toFixed(2),
      totalViscerasUND: totalViscerasUND.toFixed(0),
      totalCanalesKG: totalCanalesKG.toFixed(2),
      totalCanalesUND: totalCanalesUND.toFixed(0),
      totalGeneralKG: totalGeneralKG.toFixed(2),
      totalGeneralUND: totalGeneralUND.toFixed(0),
      cantidadProductos: cuentaProductos,
      hayItemsParaGuardar: cuentaProductos > 0,
    };
  }, [items, cantidades]);

  // Transmision de payload estructurado hacia savePedidoCarnes
  const ejecutarGuardarPedido = useCallback(async () => {
    setSubmitting(true);
    try {
      const detalles = items
        .filter((item) => parseFloat(cantidades[item.id] || 0) > 0)
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
        total_res: totales.totalResKG,
        total_cerdo: totales.totalCerdoKG,
        total_visceras: totales.totalViscerasKG,
        total_general: totales.totalGeneralKG,
        total_canales: totales.totalCanalesKG,
        total_res_und: totales.totalResUND,
        total_cerdo_und: totales.totalCerdoUND,
        total_visceras_und: totales.totalViscerasUND,
        total_general_und: totales.totalGeneralUND,
        total_canales_und: totales.totalCanalesUND,
        detalles: detalles,
      };

      const response = await apiService.savePedidoCarnes(pedidoData);

      if (response && response.success) {
        addNotification({
          message:
            response.message ||
            "Pedido guardado exitosamente y correo enviado.",
          type: "success",
        });
        setPedidoHoy(true);
      } else {
        addNotification({
          message: response?.error || "Error al guardar el pedido.",
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
  }, [items, cantidades, totales, user, addNotification]);

  return {
    items: itemsFiltrados,
    pedidoHoy,
    categoriaActiva,
    setCategoriaActiva,
    cantidades,
    loading,
    submitting,
    handleCantidadChange,
    ajustarCantidad,
    totales,
    ejecutarGuardarPedido,
  };
};
