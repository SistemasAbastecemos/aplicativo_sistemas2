import React, { useState, useEffect, useRef } from "react";
import TemplateManager from "./components/TemplateManager";
import { apiService } from "../../services/api";
import styles from "./PrintCanvas.module.css";
import { useNotification } from "../../contexts/NotificationContext";

export default function PrintCanvas() {
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState("PRINT");
  const [socketConnected, setSocketConnected] = useState(false);
  const [printerName, setPrinterName] = useState("");
  const [availablePrinters, setAvailablePrinters] = useState([]);
  const [printerType, setPrinterType] = useState("MULTIFUNCIONAL");
  const [isPrinting, setIsPrinting] = useState(false);

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

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
    {
      Code: "7701234567893",
      Description: "FRIJOL CARGAMANTO SELECCIONADO 500G",
      Price: "6.800",
    },
    {
      Code: "7701234567894",
      Description: "DETERGENTE EN POLVO LIMPIAMAX 2KG",
      Price: "15.900",
    },
    {
      Code: "7701234567895",
      Description: "LECHE ENTERA PASTEURIZADA 1L",
      Price: "300.600",
    },
  ]);

  useEffect(() => {
    connectToAgent();
    loadDatabaseTemplates();

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeTab === "PRINT") {
      loadDatabaseTemplates();
    }
  }, [activeTab]);

  const loadDatabaseTemplates = async () => {
    try {
      const res = await apiService.obtenerPlantillas();
      if (res && res.success && Array.isArray(res.resultado)) {
        setTemplates(res.resultado);
        if (res.resultado.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(res.resultado[0].id);
        }
      } else {
        console.error("Estructura de respuesta inesperada del servidor:", res);
      }
    } catch (err) {
      console.error("No se pudieron cargar las plantillas del servidor", err);
    }
  };

  const connectToAgent = () => {
    const SECURE_TOKEN = import.meta.env.VITE_TOKEN_AGENT_PRINTER || "";
    const baseWsUrl = import.meta.env.VITE_WEBSOCKET_AGENT_PRINTER || "";

    if (!SECURE_TOKEN) {
      console.error(
        "Error de configuracion: VITE_TOKEN_AGENT_PRINTER no definido.",
      );
      return;
    }

    // Sanitizar: eliminar cualquier query string residual de la URL base
    const wsUrl = baseWsUrl.split("?")[0].replace(/\/$/, "");

    // Conexion limpia sin token en URL ni en subprotocolo.
    // El token se transmite cifrado dentro del canal WebSocket como primer mensaje.
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      // Enviar el token como primer mensaje para autenticacion
      ws.send(SECURE_TOKEN);
    };

    ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);

        // Manejar respuesta de autenticacion del agente
        if (response.type === "auth") {
          if (response.status === "success") {
            setSocketConnected(true);
          } else {
            console.error(
              "Autenticacion rechazada por el agente:",
              response.message,
            );
            ws.close();
          }
          return;
        }

        if (response.type === "printers" && Array.isArray(response.data)) {
          setAvailablePrinters(response.data);

          if (printerName) {
            const current = response.data.find((p) => p.name === printerName);
            if (current) setPrinterType(current.type);
          } else if (response.data.length > 0) {
            setPrinterName(response.data[0].name);
            setPrinterType(response.data[0].type);
          }
          return;
        }

        if (response.status === "success") {
          addNotification({
            type: "success",
            message: "Trabajo enviado con exito a la cola de impresion local.",
          });
        } else {
          addNotification({
            type: "error",
            message: "Error de procesamiento en el agente: " + response.message,
          });
        }
        setIsPrinting(false);
      } catch (err) {
        console.error(
          "Error parseando el mensaje entrante del canal de red:",
          err,
        );
        setIsPrinting(false);
      }
    };

    ws.onclose = () => {
      setSocketConnected(false);
      setAvailablePrinters([]);
      setIsPrinting(false);
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => connectToAgent(), 4000);
    };
  };

  const handleSendToPrinter = () => {
    if (!socketConnected) {
      addNotification({
        type: "error",
        message:
          "Agente desconectado. Por favor verifique que el servicio local este corriendo.",
      });
      return;
    }
    if (!printerName) {
      addNotification({
        type: "error",
        message:
          "Por favor seleccione un dispositivo de impresion de la lista.",
      });
      return;
    }

    setIsPrinting(true);
    const activeTemplate = templates.find((t) => t.id === selectedTemplateId);

    const payload = {
      PrinterName: printerName,
      PrinterType: printerType,
      Items: itemsToPrint,
      Template: activeTemplate || null,
    };

    try {
      socketRef.current.send(JSON.stringify(payload));
    } catch (err) {
      addNotification({
        type: "error",
        message: "Fallo el envio de datos: " + err.message,
      });
      setIsPrinting(false);
    }
  };

  const currentActiveTemplate = templates.find(
    (t) => t.id === selectedTemplateId,
  );

  return (
    <div className={styles.container}>
      <div className={styles.statusBar}>
        <div className={styles.brandSection}>
          <h2>Kanvas de Diseño y Distribucion de Precios</h2>
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tabButton} ${activeTab === "PRINT" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("PRINT")}
            >
              Panel de Impresion
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "TEMPLATES" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("TEMPLATES")}
            >
              Gestion de Plantillas
            </button>
          </div>
        </div>
        <div className={styles.networkStatus}>
          Estado Agente:{" "}
          <span
            className={
              socketConnected
                ? styles.statusConnected
                : styles.statusDisconnected
            }
          >
            {socketConnected ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {activeTab === "PRINT" ? (
        <div className={styles.workspace}>
          <div className={styles.controls}>
            <h3 className={styles.sidebarTitle}>Hardware y Conectividad</h3>

            <div className={`${styles.inputGroup} ${styles.floatingGroup}`}>
              <label htmlFor="printerSelect">
                Dispositivo de Salida Detectado
              </label>
              <select
                id="printerSelect"
                value={printerName}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  setPrinterName(selectedName);
                  const targetPrinter = availablePrinters.find(
                    (p) => p.name === selectedName,
                  );
                  if (targetPrinter && targetPrinter.type) {
                    setPrinterType(targetPrinter.type);
                  } else {
                    setPrinterType("MULTIFUNCIONAL");
                  }
                }}
                className={styles.selectInput}
                disabled={availablePrinters.length === 0}
              >
                {availablePrinters.length === 0 ? (
                  <option value="">
                    Esperando lista de impresoras de Windows...
                  </option>
                ) : (
                  availablePrinters.map((printer, idx) => (
                    <option key={idx} value={printer.name}>
                      {printer.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className={`${styles.inputGroup} ${styles.floatingGroup}`}>
              <label htmlFor="typeSelect">
                Tipo de Impresora / Formato Calculado
              </label>
              <select
                id="typeSelect"
                value={printerType}
                onChange={(e) => setPrinterType(e.target.value)}
                className={styles.selectInput}
              >
                <option value="MULTIFUNCIONAL">
                  Abka / Permanent Multifuncional (Hoja Carta)
                </option>
                <option value="TSC">
                  TSC Industrial (Nativo TSPL - Rollo)
                </option>
                <option value="MONARCH">Monarch (Nativo MPCL - Rollo)</option>
              </select>
            </div>

            <div className={`${styles.inputGroup} ${styles.floatingGroup}`}>
              <label htmlFor="templateSelect">
                Plantilla de Etiqueta Destino
              </label>
              <select
                id="templateSelect"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className={styles.selectInput}
                disabled={templates.length === 0}
              >
                {templates.length === 0 ? (
                  <option value="">
                    No hay plantillas en la Base de Datos
                  </option>
                ) : (
                  templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.width}x{t.height}px)
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              className={styles.btnPrint}
              onClick={handleSendToPrinter}
              disabled={isPrinting || itemsToPrint.length === 0 || !printerName}
            >
              {isPrinting
                ? "Transmitiendo..."
                : `Imprimir Lote (${itemsToPrint.length} Items)`}
            </button>
          </div>

          <div className={styles.previewPanel}>
            {currentActiveTemplate ? (
              <div className={styles.rollCanvas}>
                <div className={styles.rollBadge}>
                  Vista Previa Dinamica de Flujo: {currentActiveTemplate.name}
                </div>
                {itemsToPrint.map((item, index) => (
                  <div
                    key={index}
                    className={styles.industrialLabel}
                    style={{
                      width: `${currentActiveTemplate.width}px`,
                      height: `${currentActiveTemplate.height}px`,
                      padding: `${currentActiveTemplate.padding}px`,
                    }}
                  >
                    {currentActiveTemplate.fields &&
                    Array.isArray(currentActiveTemplate.fields) ? (
                      currentActiveTemplate.fields.map((field) => {
                        // Evaluamos primero el tipo de módulo
                        let textValue = `[${field.type}]`;

                        if (field.type === "StaticText") {
                          textValue = field.content || "";
                        } else if (field.type === "Description") {
                          textValue = item.Description;
                        } else if (field.type === "Price") {
                          textValue = `$ ${item.Price}`;
                        } else if (field.type === "Code") {
                          textValue = item.Code;
                        } else if (field.type === "PUM") {
                          textValue = "P.U.M: $ 42.00 x Gr";
                        }

                        return (
                          <div
                            key={field.id}
                            style={{
                              position: "absolute",
                              left: `${field.x}px`,
                              top: `${field.y}px`,
                              width: `${field.width}px`,
                              height: `${field.height}px`,
                              boxSizing: "border-box",
                              padding: "4px",
                              overflow: "hidden",
                              wordBreak: "break-word",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              fontFamily:
                                field.fontFamily || "Arial, sans-serif",
                              fontSize: `${field.fontSize || 13}px`,
                              color: field.color || "#212529",
                              fontWeight: field.fontWeight || "normal",
                              fontStyle: field.fontStyle || "normal",
                              textAlign: field.textAlign || "left",
                            }}
                          >
                            {textValue}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ fontSize: "11px", color: "#6c757d" }}>
                        Sin campos configurados
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyTemplateWarning}>
                Por favor, parametrice y seleccione una plantilla en la pestaña
                de gestion para habilitar el motor de renderizado.
              </div>
            )}
          </div>
        </div>
      ) : (
        <TemplateManager />
      )}
    </div>
  );
}
