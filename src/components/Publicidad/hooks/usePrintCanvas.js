import { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "../../../services/api";

export const usePrintCanvas = (addNotification) => {
  const [activeTab, setActiveTab] = useState("PRINT");
  const [socketConnected, setSocketConnected] = useState(false);
  const [printerName, setPrinterName] = useState("");
  const [availablePrinters, setAvailablePrinters] = useState([]);
  const [printerType, setPrinterType] = useState("MULTIFUNCIONAL");
  const [isPrinting, setIsPrinting] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const [itemsToPrint] = useState([
    {
      Code: "7701234567891",
      Description: "ARROZ BLANCO PREMIUM 1KG",
      Price: "4.200",
    },
    {
      Code: "7701234567892",
      Description: "ACEITE GUSTOSITO REFINADO 1000ML",
      Price: "12.500",
    },
  ]);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const cargarPlantillas = useCallback(async () => {
    try {
      const res = await apiService.obtenerPlantillas();
      if (res && res.success && Array.isArray(res.resultado)) {
        setTemplates(res.resultado);
      }
    } catch (err) {
      console.error("Error al cargar plantillas corporativas:", err);
    }
  }, []);

  const conectarAgenteImpresion = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    // Conexión segura con el agente de impresión en el puerto local estandarizado
    const socket = new WebSocket("ws://localhost:8181/print-agent");
    socketRef.current = socket;

    socket.onopen = () => {
      setSocketConnected(true);
      addNotification?.({
        type: "success",
        message: "Conectado al Agente de Impresión local.",
      });
      socket.send(JSON.stringify({ action: "LIST_PRINTERS" }));
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (
          payload.event === "PRINTERS_LISTED" &&
          Array.isArray(payload.data)
        ) {
          setAvailablePrinters(payload.data);
          if (payload.data.length > 0 && !printerName) {
            setPrinterName(payload.data[0]);
          }
        }
      } catch (err) {
        console.error("Payload ilegible del agente:", err);
      }
    };

    socket.onclose = () => {
      setSocketConnected(false);
      reconnectTimeoutRef.current = setTimeout(() => {
        conectarAgenteImpresion();
      }, 5000);
    };

    socket.onerror = () => {
      socket.close();
    };
  }, [printerName, addNotification]);

  useEffect(() => {
    cargarPlantillas();
    conectarAgenteImpresion();

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
  }, [cargarPlantillas, conectarAgenteImpresion]);

  const ejecutarImpresion = useCallback(async () => {
    if (!selectedTemplateId || !printerName) {
      addNotification?.({
        type: "warning",
        message: "Especifique impresora y plantilla válida.",
      });
      return;
    }

    setIsPrinting(true);
    try {
      // Aplicación estricta de trims en la carga útil antes de compilar comandos crudos hacia hardware industrial
      const payloadSanitizado = {
        impresora: printerName.trim(),
        tipo: printerType.trim(),
        plantillaId: selectedTemplateId.trim(),
        articulos: itemsToPrint.map((item) => ({
          Code: String(item.Code || "").trim(),
          Description: String(item.Description || "").trim(),
          Price: String(item.Price || "").trim(),
        })),
      };

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({ action: "PRINT_BATCH", data: payloadSanitizado }),
        );
        addNotification?.({
          type: "success",
          message: "Lote enviado al hardware de impresión.",
        });
      } else {
        throw new Error("Agente WebSocket desconectado.");
      }
    } catch (err) {
      addNotification?.({
        type: "error",
        message: "Error al despachar el lote de etiquetas.",
      });
    } finally {
      setIsPrinting(false);
    }
  }, [
    selectedTemplateId,
    printerName,
    printerType,
    itemsToPrint,
    addNotification,
  ]);

  return {
    activeTab,
    setActiveTab,
    socketConnected,
    printerName,
    setPrinterName,
    availablePrinters,
    printerType,
    setPrinterType,
    isPrinting,
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    itemsToPrint,
    ejecutarImpresion,
    refrescarPlantillas: cargarPlantillas,
  };
};
