import { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "../../../services/api";

// Items de prueba — se usan solo cuando el usuario no ha cargado un Excel.
// En producción estos son reemplazados por los artículos del lote importado.
const ITEMS_DE_PRUEBA = [
  {
    Code: "7701234567891",
    Description: "ARROZ BLANCO PREMIUM 1KG",
    Price: "4.200",
    PUM: "KILOGRAMOS A: $4.20",
  },
  {
    Code: "7701234567892",
    Description: "ACEITE GUSTOSITO REFINADO 1000ML",
    Price: "12.500",
    PUM: "MILILITROS A: $12.50",
  },
];

export const usePrintCanvas = (addNotification) => {
  const AGENT_TOKEN = import.meta.env.VITE_TOKEN_AGENT_PRINTER;
  const [activeTab, setActiveTab] = useState("PRINT");
  const [socketConnected, setSocketConnected] = useState(false);
  const [printerName, setPrinterName] = useState("");
  const [availablePrinters, setAvailablePrinters] = useState([]);
  const [printerType, setPrinterType] = useState("MULTIFUNCIONAL");
  const [isPrinting, setIsPrinting] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  // itemsToPrint: arranca con los de prueba.
  // Cuando el usuario importe un Excel, se reemplaza con setItemsToPrint.
  const [itemsToPrint, setItemsToPrint] = useState(ITEMS_DE_PRUEBA);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const printerMapRef = useRef({});

  // ─── Plantillas ─────────────────────────────────────────────────────────────
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

  // ─── WebSocket con el agente de impresión ───────────────────────────────────
  const conectarAgenteImpresion = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket("ws://localhost:8181/print-agent");
    socketRef.current = socket;

    socket.onopen = () => {
      setSocketConnected(true);

      if (!AGENT_TOKEN) {
        console.error("VITE_TOKEN_AGENT_PRINTER no está configurado.");
        socket.close();
        return;
      }

      socket.send(AGENT_TOKEN);

      addNotification?.({
        type: "success",
        message: "Conectado al Agente de Impresión local.",
      });
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "printers" && Array.isArray(payload.data)) {
          // Mapa name → type para sincronizar printerType al cambiar selección
          printerMapRef.current = Object.fromEntries(
            payload.data.map((p) => [p.name, p.type]),
          );
          setAvailablePrinters(payload.data.map((p) => p.name));
          if (payload.data.length > 0 && !printerName) {
            setPrinterName(payload.data[0].name);
            setPrinterType(payload.data[0].type);
          }
        }
      } catch (err) {
        console.error("Payload ilegible del agente:", err);
      }
    };

    socket.onclose = () => {
      setSocketConnected(false);
      reconnectTimeoutRef.current = setTimeout(conectarAgenteImpresion, 5000);
    };

    socket.onerror = () => socket.close();
  }, [printerName, addNotification]);

  // Sincroniza printerType cuando el usuario cambia la impresora en el <select>
  const handlePrinterChange = useCallback((name) => {
    setPrinterName(name);
    setPrinterType(printerMapRef.current[name] ?? "MULTIFUNCIONAL");
  }, []);

  useEffect(() => {
    cargarPlantillas();
    conectarAgenteImpresion();
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
  }, [cargarPlantillas, conectarAgenteImpresion]);

  // ─── Construcción del payload de plantilla ──────────────────────────────────
  // Toma la plantilla que el usuario seleccionó (guardada en BD via apiService).
  // Los fields vienen en minúscula desde el editor (x, y, type, rotation...) y
  // se normalizan a PascalCase porque el agente C# deserializa PrintRequest con
  // PropertyNameCaseInsensitive = true, pero ser explícito evita ambigüedad.
  const buildTemplatePayload = useCallback(() => {
    const selected = templates.find(
      (t) => String(t.id) === String(selectedTemplateId),
    );

    if (!selected) {
      throw new Error(
        "La plantilla seleccionada no se encontró en el catálogo.",
      );
    }

    if (!Array.isArray(selected.fields) || selected.fields.length === 0) {
      throw new Error(
        `La plantilla "${selected.name}" no tiene campos configurados.`,
      );
    }

    return {
      Id: String(selected.id),
      Name: selected.name,
      Width: Number(selected.width),
      Height: Number(selected.height),
      Padding: Number(selected.padding || 0),
      Fields: selected.fields.map((f) => ({
        Id: String(f.id),
        Type: f.type,
        X: Number(f.x),
        Y: Number(f.y),
        Width: Number(f.width),
        Height: Number(f.height),
        FontSize: Number(f.fontSize || f.fontsize || 14),
        TextAlign: (f.textAlign || f.textalign || "left").toUpperCase(),
        Rotation: Number(f.rotation || 0),
        Lines: f.lines != null ? Number(f.lines) : undefined,
        Content: f.content || undefined,
      })),
    };
  }, [templates, selectedTemplateId]);

  // ─── Envío a la impresora ───────────────────────────────────────────────────
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
      const template = buildTemplatePayload(); // lanza si la plantilla no es válida

      const payload = {
        PrinterName: printerName.trim(),
        PrinterType: printerType.trim(),
        Items: itemsToPrint.map((item) => ({
          Code: String(item.Code || "").trim(),
          Description: String(item.Description || "").trim(),
          Price: String(item.Price || "").trim(),
          PUM: String(item.PUM || "").trim(),
        })),
        Template: template,
      };

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(payload));
        addNotification?.({
          type: "success",
          message: `Lote de ${itemsToPrint.length} etiqueta(s) enviado a ${printerName}.`,
        });
      } else {
        throw new Error("Agente WebSocket desconectado.");
      }
    } catch (err) {
      addNotification?.({
        type: "error",
        message: err.message || "Error al despachar el lote.",
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
    buildTemplatePayload,
  ]);

  return {
    activeTab,
    setActiveTab,
    socketConnected,
    printerName,
    setPrinterName: handlePrinterChange,
    availablePrinters,
    printerType,
    setPrinterType,
    isPrinting,
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    itemsToPrint,
    setItemsToPrint, // para cuando el usuario importe un Excel
    ejecutarImpresion,
    refrescarPlantillas: cargarPlantillas,
  };
};
