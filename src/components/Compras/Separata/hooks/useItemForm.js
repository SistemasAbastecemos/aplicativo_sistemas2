import { useState, useCallback } from "react";
import { apiService } from "../../../../services/api";

/**
 * Encapsula el formulario lateral de item: código con padding a 6 dígitos,
 * búsqueda del item en el sistema, cálculos precio/descuento y guardado.
 *
 * Reglas de negocio preservadas del módulo legacy:
 * - Solo dígitos (0-9), máximo 6 caracteres.
 * - Auto-padding con ceros a la izquierda al completar o hacer blur.
 * - Redondeo del precio con descuento a múltiplos de 50 hacia abajo.
 * - `guardarDescuento` controla si el % se persiste (si false, se guarda 0).
 */
export function useItemForm({
  currentSeparata,
  fechaInicio,
  fechaFinal,
  fechaLimite,
  login,
  addNotification,
  onSaved,
}) {
  const [codigoItem, setCodigoItem] = useState("");
  const [ultimoCodigoBuscado, setUltimoCodigoBuscado] = useState("");
  const [itemData, setItemData] = useState(null);
  const [loadingItem, setLoadingItem] = useState(false);

  const [descuento, setDescuento] = useState("");
  const [precioConDescuento, setPrecioConDescuento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [guardarDescuento, setGuardarDescuento] = useState(true);

  const resetForm = useCallback(() => {
    setCodigoItem("");
    setItemData(null);
    setDescuento("");
    setPrecioConDescuento("");
    setObservaciones("");
    setGuardarDescuento(true);
    setUltimoCodigoBuscado("");
  }, []);

  const fetchItemData = useCallback(
    async (codigo) => {
      const codigoBuscar = codigo || codigoItem;
      if (!codigoBuscar || loadingItem) return;
      if (ultimoCodigoBuscado === codigoBuscar) return;

      setLoadingItem(true);
      setUltimoCodigoBuscado(codigoBuscar);

      try {
        const response = await apiService.getItemData(codigoBuscar);
        const responseData = response.data;

        if (
          responseData &&
          responseData.descripcion &&
          responseData.precio_regular !== undefined
        ) {
          setItemData(responseData);
        } else {
          setItemData(null);
          addNotification({
            message: "El item no tiene información completa disponible",
            type: "warning",
          });
        }
      } catch (error) {
        console.error("Error en fetchItemData:", error);
        setItemData(null);

        if (error.response) {
          if (error.response.status === 404) {
            addNotification({
              message: "Item no encontrado en el sistema",
              type: "warning",
            });
          } else if (error.response.status === 400) {
            addNotification({
              message: "Código de item inválido",
              type: "warning",
            });
          } else {
            addNotification({
              message: `Error del servidor: ${error.response.status}`,
              type: "error",
            });
          }
        } else if (error.request) {
          addNotification({
            message: "Error de conexión al buscar item",
            type: "error",
          });
        } else {
          addNotification({
            message: "Error buscando item: " + error.message,
            type: "error",
          });
        }
      } finally {
        setLoadingItem(false);
      }
    },
    [codigoItem, addNotification, loadingItem, ultimoCodigoBuscado],
  );

  const handleCodigoItemChange = useCallback(
    (e) => {
      const valor = e.target.value;
      const valorNumerico = valor.replace(/\D/g, "");
      const valorLimitado = valorNumerico.slice(0, 6);

      setCodigoItem(valorLimitado);

      if (valorLimitado.length === 0 || valorLimitado !== ultimoCodigoBuscado) {
        setItemData(null);
        setUltimoCodigoBuscado("");
      }

      // Auto-padding a 6 dígitos cuando se completa
      if (valorLimitado.length === 6) {
        const codigoNormalizado = valorLimitado.padStart(6, "0");
        setCodigoItem(codigoNormalizado);
      }
    },
    [ultimoCodigoBuscado],
  );

  const handleCodigoItemKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        const codigoNormalizado = codigoItem.padStart(6, "0");
        if (codigoNormalizado.length === 6) {
          setCodigoItem(codigoNormalizado);
          fetchItemData(codigoNormalizado);
        }
      }
    },
    [codigoItem, fetchItemData],
  );

  const handleCodigoItemBlur = useCallback(() => {
    if (codigoItem && codigoItem.length > 0) {
      const codigoNormalizado = codigoItem.padStart(6, "0");
      setCodigoItem(codigoNormalizado);
      if (
        codigoNormalizado.length === 6 &&
        codigoNormalizado !== ultimoCodigoBuscado
      ) {
        fetchItemData(codigoNormalizado);
      }
    } else {
      setItemData(null);
      setUltimoCodigoBuscado("");
    }
  }, [codigoItem, ultimoCodigoBuscado, fetchItemData]);

  const handleDescuentoChange = useCallback(
    (e) => {
      const valor = e.target.value;
      setDescuento(valor);

      if (itemData && valor) {
        const regular = parseFloat(itemData.precio_regular);
        const valorDescuento = parseFloat(valor) / 100;
        const conDescuento = regular * (1 - valorDescuento);
        setPrecioConDescuento(Math.floor(conDescuento / 50) * 50);
      } else {
        setPrecioConDescuento("");
      }
    },
    [itemData],
  );

  const handlePrecioConDescuentoChange = useCallback(
    (e) => {
      const valor = e.target.value;
      setPrecioConDescuento(valor);

      if (itemData && valor) {
        const regular = parseFloat(itemData.precio_regular);
        const valorConDescuento = parseFloat(valor);
        const valorDescuento = 100 * (1 - valorConDescuento / regular);
        setDescuento(valorDescuento.toFixed(2));
      }
    },
    [itemData],
  );

  const handleObservacionesChange = useCallback((e) => {
    // Bloquea espacios iniciales en tiempo real; el trim final se aplica al
    // guardar (preserva intención del usuario mientras escribe frases largas).
    setObservaciones(e.target.value.replace(/^\s+/, ""));
  }, []);

  const handleSaveItem = useCallback(async () => {
    if (!itemData) {
      addNotification({
        message: "Busque un ítem válido primero",
        type: "warning",
      });
      return;
    }

    if (!codigoItem || !fechaInicio || !fechaFinal || !fechaLimite) {
      addNotification({
        message:
          "Faltan datos obligatorios: código del item, fecha inicio y fecha final",
        type: "warning",
      });
      return;
    }

    if (codigoItem.length !== 6) {
      addNotification({
        message: "El código del item debe tener 6 dígitos",
        type: "warning",
      });
      return;
    }

    try {
      const payload = {
        item: codigoItem,
        descripcion: itemData.descripcion,
        linea2: itemData.linea2,
        precio_regular: itemData.precio_regular,
        precio_ahora: precioConDescuento,
        descuento: guardarDescuento ? descuento : 0,
        usuario: login,
        fecha_inicio: fechaInicio,
        fecha_final: fechaFinal,
        existencias: itemData.existencias,
        medida: itemData.medida,
        unidad_medida: itemData.unidad_medida,
        observaciones: observaciones.trim(),
        fecha_limite_edicion: fechaLimite,
      };

      const response = await apiService.saveSeparataItem(payload);

      if (response.success) {
        addNotification({
          message: response.message || "Ítem guardado correctamente",
          type: "success",
        });
        resetForm();

        if (onSaved) await onSaved(response);
      } else {
        addNotification({
          message: response.message || "Error al guardar el item",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error en handleSaveItem:", error);
      addNotification({
        message: error.message || "Error guardando item",
        type: "error",
      });
    }
  }, [
    itemData,
    codigoItem,
    fechaInicio,
    fechaFinal,
    fechaLimite,
    precioConDescuento,
    guardarDescuento,
    descuento,
    login,
    observaciones,
    addNotification,
    resetForm,
    onSaved,
  ]);

  return {
    codigoItem,
    setCodigoItem,
    ultimoCodigoBuscado,
    itemData,
    setItemData,
    loadingItem,
    descuento,
    setDescuento,
    precioConDescuento,
    setPrecioConDescuento,
    observaciones,
    setObservaciones,
    guardarDescuento,
    setGuardarDescuento,
    resetForm,
    fetchItemData,
    handleCodigoItemChange,
    handleCodigoItemKeyPress,
    handleCodigoItemBlur,
    handleDescuentoChange,
    handlePrecioConDescuentoChange,
    handleObservacionesChange,
    handleSaveItem,
  };
}
