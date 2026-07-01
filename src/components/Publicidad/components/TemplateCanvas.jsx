import React, { useState, useRef, useEffect } from "react";
import styles from "./TemplateCanvas.module.css";

export default function TemplateCanvas({ template, onSave, onCancel }) {
  const [templateData, setTemplateData] = useState({
    ...template,
    fields: Array.isArray(template.fields) ? template.fields : [],
  });
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);

  // Posicion del lienzo en el espacio de trabajo
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const canvasAreaRef = useRef(null);
  const draggingFieldRef = useRef(null);
  const resizingFieldRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeStartDimsRef = useRef({ width: 0, height: 0, x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0, offsetAtStart: { x: 0, y: 0 } });

  const availableFieldTypes = [
    { type: "Description", label: "Descripcion" },
    { type: "Price", label: "Precio" },
    { type: "Code", label: "Codigo de Barras" },
    { type: "PUM", label: "PUM (Precio Unidad)" },
    { type: "StaticText", label: "Texto Estatico" },
  ];

  const fontFamilies = [
    { value: "Arial, sans-serif", label: "Arial" },
    { value: "'Courier New', monospace", label: "Courier New" },
    { value: "'Times New Roman', serif", label: "Times New Roman" },
    { value: "system-ui, sans-serif", label: "System UI" },
  ];

  // ── Tamaño fisico de la etiqueta ──
  // A 203 dpi, 1 mm = 8 px del lienzo (= 8 dots de impresora). El px del editor
  // es 1:1 con el dot, asi que estos presets fijan el tamaño real del rollo.
  const DOTS_PER_MM = 8;
  const pxToMm = (px) => (Number(px || 0) / DOTS_PER_MM).toFixed(1);

  // Presets en su orientacion natural (ancho_mm x alto_mm). La orientacion
  // (horizontal/vertical) se aplica con el selector dedicado.
  const rollPresets = [
    { label: "Monarch 55 × 123 mm", wmm: 55, hmm: 123 },
    { label: "Etiqueta 50 × 30 mm", wmm: 50, hmm: 30 },
    { label: "Etiqueta 40 × 25 mm", wmm: 40, hmm: 25 },
    { label: "Etiqueta 60 × 40 mm", wmm: 60, hmm: 40 },
    { label: "Etiqueta 100 × 50 mm", wmm: 100, hmm: 50 },
  ];

  // Orientacion actual derivada de las dimensiones (no requiere estado extra).
  const orientation = templateData.height >= templateData.width ? "V" : "H";

  const applyOrientation = (target) => {
    setTemplateData((prev) => {
      const cur = prev.height >= prev.width ? "V" : "H";
      if (cur === target) return prev;
      // Intercambia ancho y alto, reubica los campos al nuevo sistema de
      // coordenadas y los rota 90° para que el texto siga leyendose bien.
      return {
        ...prev,
        width: prev.height,
        height: prev.width,
        fields: prev.fields.map((f) => ({
          ...f,
          x: f.y,
          y: f.x,
          width: f.height,
          height: f.width,
          rotation: (Number(f.rotation || 0) + 90) % 360,
        })),
      };
    });
    setTimeout(() => fitToView(), 30);
  };

  const applyRollPreset = (idx) => {
    if (idx === "") return;
    const p = rollPresets[Number(idx)];
    if (!p) return;
    // Respeta la orientacion elegida: en vertical el lado largo es el alto.
    const longMm = Math.max(p.wmm, p.hmm);
    const shortMm = Math.min(p.wmm, p.hmm);
    const w = (orientation === "V" ? shortMm : longMm) * DOTS_PER_MM;
    const h = (orientation === "V" ? longMm : shortMm) * DOTS_PER_MM;
    setTemplateData((prev) => ({ ...prev, width: w, height: h }));
    setTimeout(() => fitToView(), 30);
  };

  // Funcion matematica para centrar el lienzo exactamente en el area visible
  const centerCanvas = () => {
    const area = canvasAreaRef.current;
    if (!area) return;

    const areaW = area.clientWidth;
    const areaH = area.clientHeight;

    // Calcula la posicion inicial para que el centro del lienzo coincida con el centro del contenedor
    const initialX = (areaW - templateData.width * zoom) / 2;
    const initialY = (areaH - templateData.height * zoom) / 2;

    setPanOffset({ x: initialX, y: initialY });
  };

  // Centrar la plantilla automaticamente en la primera carga
  useEffect(() => {
    // Un pequeno delay para asegurar que el contenedor ha renderizado sus dimensiones reales
    const timer = setTimeout(() => {
      centerCanvas();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedFieldId) return;

      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "SELECT" ||
        document.activeElement.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        handleRemoveField(selectedFieldId);
        return;
      }

      const isArrowKey = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ].includes(e.key);
      if (!isArrowKey) return;

      e.preventDefault();

      const padding = Number(templateData.padding || 0);
      let moveX = 0;
      let moveY = 0;

      if (e.key === "ArrowUp") moveY = -1;
      if (e.key === "ArrowDown") moveY = 1;
      if (e.key === "ArrowLeft") moveX = -1;
      if (e.key === "ArrowRight") moveX = 1;

      setTemplateData((prev) => ({
        ...prev,
        fields: prev.fields.map((f) => {
          if (f.id !== selectedFieldId) return f;

          let newX = f.x + moveX;
          let newY = f.y + moveY;

          const maxX = prev.width - f.width - padding;
          const maxY = prev.height - f.height - padding;

          if (newX < padding) newX = padding;
          if (newY < padding) newY = padding;
          if (newX > maxX) newX = maxX;
          if (newY > maxY) newY = maxY;

          return { ...f, x: newX, y: newY };
        }),
      }));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFieldId, templateData]);

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      const padding = Number(templateData.padding || 0);

      if (draggingFieldRef.current && !resizingFieldRef.current) {
        const fieldId = draggingFieldRef.current.id;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        let currentX = Math.round(
          (e.clientX - rect.left) / zoom - dragOffsetRef.current.x,
        );
        let currentY = Math.round(
          (e.clientY - rect.top) / zoom - dragOffsetRef.current.y,
        );

        const minX = padding;
        const minY = padding;
        const maxX =
          templateData.width - draggingFieldRef.current.width - padding;
        const maxY =
          templateData.height - draggingFieldRef.current.height - padding;

        if (currentX < minX) currentX = minX;
        if (currentY < minY) currentY = minY;
        if (currentX > maxX) currentX = maxX;
        if (currentY > maxY) currentY = maxY;

        setTemplateData((prev) => ({
          ...prev,
          fields: prev.fields.map((f) =>
            f.id === fieldId ? { ...f, x: currentX, y: currentY } : f,
          ),
        }));
      }

      if (resizingFieldRef.current) {
        const fieldId = resizingFieldRef.current.id;
        const startDims = resizeStartDimsRef.current;

        const deltaX = Math.round((e.clientX - dragOffsetRef.current.x) / zoom);
        const deltaY = Math.round((e.clientY - dragOffsetRef.current.y) / zoom);

        let newWidth = startDims.width + deltaX;
        let newHeight = startDims.height + deltaY;

        if (newWidth < 40) newWidth = 40;
        if (newHeight < 20) newHeight = 20;

        const maxWidth = templateData.width - startDims.x - padding;
        const maxHeight = templateData.height - startDims.y - padding;

        if (newWidth > maxWidth) newWidth = maxWidth;
        if (newHeight > maxHeight) newHeight = maxHeight;

        setTemplateData((prev) => ({
          ...prev,
          fields: prev.fields.map((f) =>
            f.id === fieldId ? { ...f, width: newWidth, height: newHeight } : f,
          ),
        }));
      }
    };

    const handleGlobalMouseUp = () => {
      draggingFieldRef.current = null;
      resizingFieldRef.current = null;
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [zoom, templateData.width, templateData.height, templateData.padding]);

  const fitToView = () => {
    const area = canvasAreaRef.current;
    if (!area) return;
    const pad = 80;
    const scaleX = (area.clientWidth - pad) / templateData.width;
    const scaleY = (area.clientHeight - pad) / templateData.height;
    const targetZoom = Math.min(scaleX, scaleY, 2.0);

    setZoom(targetZoom);

    const initialX = (area.clientWidth - templateData.width * targetZoom) / 2;
    const initialY = (area.clientHeight - templateData.height * targetZoom) / 2;
    setPanOffset({ x: initialX, y: initialY });
  };

  useEffect(() => {
    const area = canvasAreaRef.current;
    if (!area) return;
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((prev) => Math.min(2.0, Math.max(0.15, prev + delta)));
    };
    area.addEventListener("wheel", onWheel, { passive: false });
    return () => area.removeEventListener("wheel", onWheel);
  }, []);

  const handlePanStart = (e) => {
    // Permitir paneo unicamente si se hace click sostenido en el fondo del area (no en el lienzo ni modulos)
    if (e.target !== canvasAreaRef.current) return;

    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetAtStart: { ...panOffset },
    };
  };

  useEffect(() => {
    if (!isPanning) return;
    const onMove = (e) => {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;

      // Movimiento libre bidireccional fluido sin restricciones de ejes
      setPanOffset({
        x: panStartRef.current.offsetAtStart.x + dx,
        y: panStartRef.current.offsetAtStart.y + dy,
      });
    };
    const onUp = () => setIsPanning(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isPanning]);

  const handleAddField = (e, type) => {
    e.stopPropagation();
    const padding = Number(templateData.padding || 0);
    const newField = {
      id: `f_${Date.now()}`,
      type: type,
      x: padding,
      y: padding,
      width: 150,
      height: 45,
      fontFamily: "Arial, sans-serif",
      fontSize: 14,
      color: "#212529",
      fontWeight: "normal",
      fontStyle: "normal",
      textAlign: "left",
      content: type === "StaticText" ? "Texto Estatico" : "",
    };
    setTemplateData({
      ...templateData,
      fields: [...templateData.fields, newField],
    });
    setSelectedFieldId(newField.id);
  };

  const handleRemoveField = (id) => {
    setTemplateData({
      ...templateData,
      fields: templateData.fields.filter((f) => f.id !== id),
    });
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const handleDuplicateField = (field) => {
    const padding = Number(templateData.padding || 0);
    const duplicated = {
      ...field,
      id: `f_${Date.now()}`,
      x: Math.min(field.x + 15, templateData.width - field.width - padding),
      y: Math.min(field.y + 15, templateData.height - field.height - padding),
    };
    setTemplateData({
      ...templateData,
      fields: [...templateData.fields, duplicated],
    });
    setSelectedFieldId(duplicated.id);
  };

  const updateSelectedFieldProps = (key, value) => {
    setTemplateData({
      ...templateData,
      fields: templateData.fields.map((f) => {
        if (f.id !== selectedFieldId) return f;

        let updated = { ...f, [key]: value };
        const padding = Number(templateData.padding || 0);

        if (key === "width") {
          const val = Number(value);
          updated.width = Math.max(
            40,
            Math.min(val, templateData.width - f.x - padding),
          );
        }
        if (key === "height") {
          const val = Number(value);
          updated.height = Math.max(
            20,
            Math.min(val, templateData.height - f.y - padding),
          );
        }
        if (key === "x") {
          const val = Number(value);
          updated.x = Math.max(
            padding,
            Math.min(val, templateData.width - f.width - padding),
          );
        }
        if (key === "y") {
          const val = Number(value);
          updated.y = Math.max(
            padding,
            Math.min(val, templateData.height - f.height - padding),
          );
        }

        return updated;
      }),
    });
  };

  const alignField = (mode) => {
    const field = templateData.fields.find((f) => f.id === selectedFieldId);
    if (!field) return;
    const padding = Number(templateData.padding || 0);

    let newX = field.x;
    let newY = field.y;

    if (mode === "center-h") {
      newX = Math.round((templateData.width - field.width) / 2);
    }
    if (mode === "center-v") {
      newY = Math.round((templateData.height - field.height) / 2);
    }

    newX = Math.max(
      padding,
      Math.min(newX, templateData.width - field.width - padding),
    );
    newY = Math.max(
      padding,
      Math.min(newY, templateData.height - field.height - padding),
    );

    updateSelectedFieldProps("x", newX);
    updateSelectedFieldProps("y", newY);
  };

  const handleFieldMouseDown = (e, field) => {
    if (e.target.classList.contains(styles.resizeHandle)) return;

    e.stopPropagation();
    setSelectedFieldId(field.id);
    draggingFieldRef.current = field;

    const rect = canvasRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: (e.clientX - rect.left) / zoom - field.x,
      y: (e.clientY - rect.top) / zoom - field.y,
    };
  };

  const handleResizeMouseDown = (e, field) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedFieldId(field.id);
    resizingFieldRef.current = field;

    dragOffsetRef.current = {
      x: e.clientX,
      y: e.clientY,
    };

    resizeStartDimsRef.current = {
      width: field.width,
      height: field.height,
      x: field.x,
      y: field.y,
    };
  };

  const handleCanvasClick = (e) => {
    if (
      e.target === canvasRef.current ||
      e.target.classList.contains(styles.marginGuide)
    ) {
      setSelectedFieldId(null);
    }
  };

  const selectedField = templateData.fields.find(
    (f) => f.id === selectedFieldId,
  );

  // Texto de muestra (string plano) para estimar el largo al autoajustar la fuente.
  const getFieldSampleString = (field) => {
    if (field.type === "StaticText") return field.content || "TEXTO";
    if (field.type === "Description") return "DETERGENTE LIQUIDO MAQUINA FLUJO";
    if (field.type === "Price") return "$ 999.999";
    if (field.type === "Code") return "7701234567890";
    if (field.type === "PUM") return "P.U.M: $ 42.00 x Gr";
    return `[${field.type}]`;
  };

  // Calcula un tamaño de fuente que llene el eje largo del modulo (una sola linea).
  // longPx = largo disponible (donde corre el texto); shortPx = grosor de la linea.
  const computeFillFont = (field, longPx, shortPx) => {
    const len = Math.max(1, getFieldSampleString(field).length);
    const byLength = longPx / (len * 0.58); // ~0.58*fontSize de ancho por caracter
    const byThickness = shortPx / 1.25; // alto de linea ~1.25*fontSize
    return Math.max(8, Math.floor(Math.min(byLength, byThickness)));
  };

  // Estilo del contenedor de texto segun la rotacion del modulo.
  // Para 90°/270° se intercambian ancho y alto de la caja interna ANTES de rotar,
  // de modo que el texto se distribuya a lo largo del eje largo del modulo y luego
  // gire (asi se lee de corrido en vertical, no apilado letra por letra).
  // Si field.fillModule esta activo, la fuente se escala para llenar ese eje largo.
  const getRotatedContentStyle = (field) => {
    const rot = ((Number(field.rotation || 0) % 360) + 360) % 360;
    const align = field.textAlign || "left";
    const justify =
      align === "center"
        ? "center"
        : align === "right"
          ? "flex-end"
          : "flex-start";

    // El modo "llenar" escala la fuente para ocupar el eje largo. Aplica a todos
    // los tipos. Si una descripcion esta en 2 lineas y ademas tiene "llenar",
    // el relleno tiene prioridad (una sola linea escalada).
    const fill = !!field.fillModule;

    if (rot === 0 || rot === 180) {
      const longPx = (field.width || 0) - 10;
      const shortPx = (field.height || 0) - 10;
      const base = {
        width: "100%",
        flex: 1,
        ...(rot === 180
          ? { transform: "rotate(180deg)", transformOrigin: "center" }
          : {}),
      };
      if (fill) {
        return {
          ...base,
          display: "flex",
          alignItems: "center",
          justifyContent: justify,
          whiteSpace: "nowrap",
          fontSize: `${computeFillFont(field, longPx, shortPx)}px`,
        };
      }
      return base;
    }

    // 90 o 270: caja interna con dimensiones intercambiadas, centrada y rotada.
    const innerW = Math.max(0, (field.height || 0) - 10); // eje largo (texto)
    const innerH = Math.max(0, (field.width || 0) - 10); // grosor de la linea
    return {
      position: "absolute",
      top: "50%",
      left: "50%",
      width: `${innerW}px`,
      height: `${innerH}px`,
      transform: `translate(-50%, -50%) rotate(${rot}deg)`,
      transformOrigin: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: justify,
      textAlign: align,
      overflow: "hidden",
      ...(fill
        ? {
            whiteSpace: "nowrap",
            justifyContent: "center",
            fontSize: `${computeFillFont(field, innerW, innerH)}px`,
          }
        : {}),
    };
  };

  const getFieldPreviewText = (field) => {
    if (field.type === "StaticText") {
      return field.content || "";
    }
    if (field.type === "Description") {
      const sample = "DETERGENTE LIQUIDO MAQUINA FLUJO";
      // Con "Llenar alto" se muestra en una sola linea escalada (el relleno manda).
      if (field.lines === 2 && !field.fillModule) {
        const mid = Math.floor(sample.length / 2);
        let cut = sample.indexOf(" ", mid);
        if (cut < 0) cut = sample.lastIndexOf(" ", mid);
        if (cut < 0) cut = mid;
        return (
          <>
            {sample.slice(0, cut).trim()}
            <br />
            {sample.slice(cut + 1).trim()}
          </>
        );
      }
      return sample;
    }
    return `[${field.type}]`;
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.sidePanel}>
        <div className={styles.sectionHeader}>
          <h3>Parametros Base</h3>
        </div>

        <div className={`${styles.inputGroup} ${styles.floatingGroup}`}>
          <label>Nombre del Layout</label>
          <input
            type="text"
            value={templateData.name || ""}
            onChange={(e) =>
              setTemplateData({ ...templateData, name: e.target.value })
            }
          />
        </div>

        <div className={`${styles.inputGroup} ${styles.floatingGroup}`}>
          <label>Tamaño de rollo (preset)</label>
          <select
            className={styles.selectPro}
            value=""
            onChange={(e) => applyRollPreset(e.target.value)}
          >
            <option value="">Elegir medida fisica…</option>
            {rollPresets.map((p, i) => (
              <option key={i} value={i}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label>Orientacion</label>
          <div className={styles.btnRowLayout}>
            <button
              className={`${styles.btnToggleAction} ${orientation === "H" ? styles.toggleActive : ""}`}
              onClick={() => applyOrientation("H")}
            >
              Horizontal
            </button>
            <button
              className={`${styles.btnToggleAction} ${orientation === "V" ? styles.toggleActive : ""}`}
              onClick={() => applyOrientation("V")}
            >
              Vertical
            </button>
          </div>
        </div>

        <div className={styles.compactGrid}>
          <div className={`${styles.inputGroup} ${styles.floatingGroup}`}>
            <label>Ancho (px)</label>
            <input
              type="number"
              value={templateData.width || 0}
              onChange={(e) =>
                setTemplateData({
                  ...templateData,
                  width: Number(e.target.value),
                })
              }
            />
            <span className={styles.mmHint}>
              {pxToMm(templateData.width)} mm
            </span>
          </div>
          <div className={`${styles.inputGroup} ${styles.floatingGroup}`}>
            <label>Alto (px)</label>
            <input
              type="number"
              value={templateData.height || 0}
              onChange={(e) =>
                setTemplateData({
                  ...templateData,
                  height: Number(e.target.value),
                })
              }
            />
            <span className={styles.mmHint}>
              {pxToMm(templateData.height)} mm
            </span>
          </div>
        </div>

        <div className={`${styles.inputGroup} ${styles.floatingGroup}`}>
          <label>Margen de Impresion (Padding px)</label>
          <input
            type="number"
            value={templateData.padding || 0}
            onChange={(e) =>
              setTemplateData({
                ...templateData,
                padding: Number(e.target.value),
              })
            }
          />
        </div>

        <div className={styles.sectionHeader} style={{ marginTop: "16px" }}>
          <h3>Anadir Modulos</h3>
        </div>
        <div className={styles.toolboxButtons}>
          {availableFieldTypes.map((item) => (
            <button
              key={item.type}
              className={styles.btnTool}
              onClick={(e) => handleAddField(e, item.type)}
            >
              + {item.label}
            </button>
          ))}
        </div>

        {selectedField ? (
          <div className={styles.inspectorSection}>
            <div className={styles.sectionHeader}>
              <h3>Propiedades Modulo</h3>
            </div>
            <div className={styles.badgeType}>Tipo: [{selectedField.type}]</div>

            {selectedField.type === "StaticText" && (
              <div className={`${styles.inputGroup} ${styles.floatingGroup}`}>
                <label>Contenido del Texto</label>
                <input
                  type="text"
                  value={selectedField.content || ""}
                  onChange={(e) =>
                    updateSelectedFieldProps("content", e.target.value)
                  }
                  placeholder="Escribe el texto fijo aquí..."
                />
              </div>
            )}

            {selectedField.type === "Description" && (
              <div className={styles.inputGroup}>
                <label>Renglones de la descripcion</label>
                <div className={styles.btnRowLayout}>
                  <button
                    className={`${styles.btnToggleAction} ${(selectedField.lines || 1) === 1 ? styles.toggleActive : ""}`}
                    onClick={() => updateSelectedFieldProps("lines", 1)}
                  >
                    1 linea
                  </button>
                  <button
                    className={`${styles.btnToggleAction} ${selectedField.lines === 2 ? styles.toggleActive : ""}`}
                    onClick={() => updateSelectedFieldProps("lines", 2)}
                  >
                    2 lineas
                  </button>
                </div>
                <span className={styles.mmHint}>
                  En 2 lineas, la descripcion larga se parte automaticamente al
                  imprimir (evita que se salga de la etiqueta).
                </span>
              </div>
            )}

            <div className={styles.compactGrid}>
              <div className={`${styles.inputGroup} ${styles.floatingGroup}`}>
                <label>Posicion X</label>
                <input
                  type="number"
                  value={selectedField.x}
                  onChange={(e) =>
                    updateSelectedFieldProps("x", e.target.value)
                  }
                />
              </div>
              <div className={`${styles.inputGroup} ${styles.floatingGroup}`}>
                <label>Posicion Y</label>
                <input
                  type="number"
                  value={selectedField.y}
                  onChange={(e) =>
                    updateSelectedFieldProps("y", e.target.value)
                  }
                />
              </div>
            </div>

            <div className={styles.compactGrid}>
              <div className={`${styles.inputGroup} ${styles.floatingGroup}`}>
                <label>Ancho Modulo</label>
                <input
                  type="number"
                  value={selectedField.width}
                  onChange={(e) =>
                    updateSelectedFieldProps("width", e.target.value)
                  }
                />
                <span className={styles.mmHint}>
                  {pxToMm(selectedField.width)} mm
                </span>
              </div>
              <div className={`${styles.inputGroup} ${styles.floatingGroup}`}>
                <label>Alto Modulo</label>
                <input
                  type="number"
                  value={selectedField.height}
                  onChange={(e) =>
                    updateSelectedFieldProps("height", e.target.value)
                  }
                />
                <span className={styles.mmHint}>
                  {pxToMm(selectedField.height)} mm
                </span>
              </div>
            </div>

            <div className={`${styles.inputGroup} ${styles.floatingGroup}`}>
              <label>Familia Tipografica</label>
              <select
                value={selectedField.fontFamily || "Arial, sans-serif"}
                onChange={(e) =>
                  updateSelectedFieldProps("fontFamily", e.target.value)
                }
                className={styles.selectPro}
              >
                {fontFamilies.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.compactGrid}>
              <div className={`${styles.inputGroup} ${styles.floatingGroup}`}>
                <label>Tamano (px)</label>
                <input
                  type="number"
                  value={selectedField.fontSize || 12}
                  onChange={(e) =>
                    updateSelectedFieldProps("fontSize", Number(e.target.value))
                  }
                />
              </div>
              <div className={`${styles.inputGroup} ${styles.floatingGroup}`}>
                <label>Color Texto</label>
                <input
                  type="color"
                  className={styles.colorPicker}
                  value={selectedField.color || "#212529"}
                  onChange={(e) =>
                    updateSelectedFieldProps("color", e.target.value)
                  }
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Alineacion Horizontal</label>
              <div className={styles.btnRowLayout}>
                {["left", "center", "right"].map((align) => (
                  <button
                    key={align}
                    className={`${styles.btnToggleAction} ${selectedField.textAlign === align ? styles.toggleActive : ""}`}
                    onClick={() => updateSelectedFieldProps("textAlign", align)}
                  >
                    {align.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className={`${styles.inputGroup} ${styles.floatingGroup}`}>
              <label>Rotacion del modulo</label>
              <select
                className={styles.selectPro}
                value={selectedField.rotation || 0}
                onChange={(e) =>
                  updateSelectedFieldProps("rotation", Number(e.target.value))
                }
              >
                <option value={0}>0° (horizontal)</option>
                <option value={90}>90° (vertical, hacia arriba)</option>
                <option value={180}>180° (invertido)</option>
                <option value={270}>270° (vertical, hacia abajo)</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Ajustar texto al modulo</label>
              <div className={styles.btnRowLayout}>
                <button
                  className={`${styles.btnToggleAction} ${!selectedField.fillModule ? styles.toggleActive : ""}`}
                  onClick={() => updateSelectedFieldProps("fillModule", false)}
                >
                  Tamaño fijo
                </button>
                <button
                  className={`${styles.btnToggleAction} ${selectedField.fillModule ? styles.toggleActive : ""}`}
                  onClick={() => updateSelectedFieldProps("fillModule", true)}
                >
                  Llenar alto
                </button>
              </div>
              <span className={styles.mmHint}>
                "Llenar alto" escala la fuente para que el texto ocupe todo el
                largo del modulo (sirve para precios y descripciones). Con esta
                opcion la descripcion sale en una sola linea escalada.
              </span>
            </div>

            <div className={styles.inputGroup}>
              <label>Estilos Rapidos</label>
              <div className={styles.btnRowLayout}>
                <button
                  className={`${styles.btnToggleAction} ${selectedField.fontWeight === "bold" ? styles.toggleActive : ""}`}
                  onClick={() =>
                    updateSelectedFieldProps(
                      "fontWeight",
                      selectedField.fontWeight === "bold" ? "normal" : "bold",
                    )
                  }
                >
                  N
                </button>
                <button
                  className={`${styles.btnToggleAction} ${selectedField.fontStyle === "italic" ? styles.toggleActive : ""}`}
                  onClick={() =>
                    updateSelectedFieldProps(
                      "fontStyle",
                      selectedField.fontStyle === "italic"
                        ? "normal"
                        : "italic",
                    )
                  }
                >
                  K
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Alineacion Asistida</label>
              <div className={styles.btnRowLayout}>
                <button
                  className={styles.btnActionPro}
                  onClick={() => alignField("center-h")}
                >
                  Centrar H
                </button>
                <button
                  className={styles.btnActionPro}
                  onClick={() => alignField("center-v")}
                >
                  Centrar V
                </button>
              </div>
            </div>

            <div className={styles.actionsPanelField}>
              <button
                className={styles.btnDuplicate}
                onClick={() => handleDuplicateField(selectedField)}
              >
                Duplicar
              </button>
              <button
                className={styles.btnDeleteField}
                onClick={() => handleRemoveField(selectedField.id)}
              >
                Eliminar Modulo
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.helperSelectMessage}>
            Selecciona un modulo del canvas para editar sus fuentes, tamaño o
            moverlo con las flechas del teclado.
          </div>
        )}

        <div className={styles.controlActions}>
          <button
            className={styles.btnSave}
            onClick={() => onSave(templateData)}
          >
            Guardar Cambios
          </button>
          <button className={styles.btnCancel} onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>

      <div className={styles.canvasWorkspace}>
        <div className={styles.topToolbar}>
          <div className={styles.zoomControls}>
            <span className={styles.zoomText}>
              Zoom: {Math.round(zoom * 100)}%
            </span>
            <button
              className={styles.btnZoom}
              onClick={() => setZoom(Math.max(0.15, zoom - 0.15))}
            >
              −
            </button>
            <button
              className={styles.btnZoom}
              onClick={() => {
                setZoom(1);
                centerCanvas();
              }}
            >
              100%
            </button>
            <button
              className={styles.btnZoom}
              onClick={() => setZoom(Math.min(2.0, zoom + 0.15))}
            >
              +
            </button>
            <button className={styles.btnZoom} onClick={fitToView}>
              Ajustar
            </button>
          </div>
          <div className={styles.legendHelp}>
            <span className={styles.dotRed}></span> Margen Protegido
            <span style={{ marginLeft: 12, color: "#94a3b8", fontSize: 11 }}>
              Ctrl+Rueda = Zoom · Click sostenido en fondo = Mover libremente
              360°
            </span>
          </div>
        </div>

        <div
          ref={canvasAreaRef}
          className={`${styles.canvasArea} ${isPanning ? styles.canvasPanning : ""}`}
          onMouseDown={handlePanStart}
        >
          {/* El scaler maneja la posicion (X, Y) y la escala del zoom de forma desacoplada y fluida */}
          <div
            className={styles.canvasScaler}
            style={{
              transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`,
            }}
          >
            <div
              ref={canvasRef}
              className={styles.canvas}
              style={{
                width: `${templateData.width}px`,
                height: `${templateData.height}px`,
                transform: `scale(${zoom})`,
                transformOrigin: "0 0",
              }}
              onClick={handleCanvasClick}
            >
              <div
                className={styles.marginGuide}
                style={{
                  top: `${templateData.padding}px`,
                  left: `${templateData.padding}px`,
                  width: `${templateData.width - templateData.padding * 2}px`,
                  height: `${templateData.height - templateData.padding * 2}px`,
                }}
              />

              {templateData.fields.map((field) => (
                <div
                  key={field.id}
                  className={`${styles.canvasField} ${selectedFieldId === field.id ? styles.fieldSelected : ""}`}
                  onMouseDown={(e) => handleFieldMouseDown(e, field)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    left: `${field.x}px`,
                    top: `${field.y}px`,
                    width: `${field.width}px`,
                    height: `${field.height}px`,
                    fontFamily: field.fontFamily || "Arial, sans-serif",
                    fontSize: `${field.fontSize || 12}px`,
                    color: field.color || "#212529",
                    fontWeight: field.fontWeight || "normal",
                    fontStyle: field.fontStyle || "normal",
                    textAlign: field.textAlign || "left",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                    padding: "5px",
                  }}
                >
                  <div
                    className={styles.fieldLabelContainer}
                    style={getRotatedContentStyle(field)}
                  >
                    {getFieldPreviewText(field)}
                  </div>

                  <div className={styles.fieldCoordinates}>
                    {field.x},{field.y} | {field.width}x{field.height}px
                    {field.rotation ? ` | ${field.rotation}°` : ""}
                  </div>

                  <div
                    className={styles.resizeHandle}
                    onMouseDown={(e) => handleResizeMouseDown(e, field)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
