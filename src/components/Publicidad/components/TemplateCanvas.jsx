import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./TemplateCanvas.module.css";
import CanvasSidebar from "./CanvasSidebar";
import CanvasWorkspace from "./CanvasWorkspace";

const DOTS_PER_MM = 8;

const ROLL_PRESETS = [
  { label: "Monarch 55 × 123 mm", wmm: 55, hmm: 123 },
  { label: "Etiqueta 50 × 30 mm", wmm: 50, hmm: 30 },
  { label: "Etiqueta 40 × 25 mm", wmm: 40, hmm: 25 },
  { label: "Etiqueta 60 × 40 mm", wmm: 60, hmm: 40 },
  { label: "Etiqueta 100 × 50 mm", wmm: 100, hmm: 50 },
];

const AVAILABLE_FIELD_TYPES = [
  { type: "Description", label: "Descripcion" },
  { type: "Price", label: "Precio" },
  { type: "Code", label: "Codigo de Barras" },
  { type: "PUM", label: "PUM (Precio Unidad)" },
  { type: "StaticText", label: "Texto Estatico" },
];

const FONT_FAMILIES = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "'Courier New', monospace", label: "Courier New" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "system-ui, sans-serif", label: "System UI" },
];

/**
 * Clamp de un módulo dentro de los límites del canvas. Se usa cuando
 * cambia la orientación, el preset del rollo o cuando el usuario
 * redimensiona algo. Ajusta x, y, width y height sin dejar overlap
 * con el padding.
 */
const clampFieldToBounds = (field, canvasW, canvasH, padding) => {
  const maxW = Math.max(20, canvasW - padding * 2);
  const maxH = Math.max(10, canvasH - padding * 2);
  const w = Math.min(field.width, maxW);
  const h = Math.min(field.height, maxH);
  const maxX = canvasW - w - padding;
  const maxY = canvasH - h - padding;
  return {
    ...field,
    width: w,
    height: h,
    x: Math.max(padding, Math.min(field.x, maxX)),
    y: Math.max(padding, Math.min(field.y, maxY)),
  };
};

export default function TemplateCanvas({ template, onSave, onCancel }) {
  const [templateData, setTemplateData] = useState({
    ...template,
    fields: Array.isArray(template.fields) ? template.fields : [],
  });
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const canvasAreaRef = useRef(null);
  const draggingFieldRef = useRef(null);
  const resizingFieldRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeStartDimsRef = useRef({ width: 0, height: 0, x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0, offsetAtStart: { x: 0, y: 0 } });

  const pxToMm = (px) => (Number(px || 0) / DOTS_PER_MM).toFixed(1);

  const orientation = templateData.height >= templateData.width ? "V" : "H";

  const fitToView = useCallback(() => {
    const area = canvasAreaRef.current;
    if (!area) return;
    const pad = 40;
    const scaleX = (area.clientWidth - pad) / templateData.width;
    const scaleY = (area.clientHeight - pad) / templateData.height;
    const targetZoom = Math.min(scaleX, scaleY, 2.0);
    setZoom(targetZoom);
    const initialX = (area.clientWidth - templateData.width * targetZoom) / 2;
    const initialY = (area.clientHeight - templateData.height * targetZoom) / 2;
    setPanOffset({ x: initialX, y: initialY });
  }, [templateData.width, templateData.height]);

  /**
   * Cambio de orientación (Horizontal ↔ Vertical). El swap ancho↔alto
   * afecta también a los módulos: sus x/y se transponen, sus dimensiones
   * se intercambian y su rotación gira +90°. FIX vs legacy: se aplica
   * clamp de cada módulo a los nuevos límites — antes podían quedar
   * fuera del área si el nuevo canvas era más chico en algún eje.
   */
  const applyOrientation = (target) => {
    setTemplateData((prev) => {
      const cur = prev.height >= prev.width ? "V" : "H";
      if (cur === target) return prev;
      const newW = prev.height;
      const newH = prev.width;
      const pad = Number(prev.padding || 0);
      return {
        ...prev,
        width: newW,
        height: newH,
        fields: prev.fields.map((f) => {
          const transposed = {
            ...f,
            x: f.y,
            y: f.x,
            width: f.height,
            height: f.width,
            rotation: (Number(f.rotation || 0) + 90) % 360,
          };
          return clampFieldToBounds(transposed, newW, newH, pad);
        }),
      };
    });
    setTimeout(() => fitToView(), 30);
  };

  /**
   * Cambio del preset del rollo. FIX vs legacy: cuando el nuevo tamaño
   * es más chico, se aplica clamp a cada módulo para que no queden
   * fuera del área. Antes se cambiaban solo width/height y los módulos
   * podían quedar invisibles.
   */
  const applyRollPreset = (idx) => {
    if (idx === "") return;
    const p = ROLL_PRESETS[Number(idx)];
    if (!p) return;
    const longMm = Math.max(p.wmm, p.hmm);
    const shortMm = Math.min(p.wmm, p.hmm);
    setTemplateData((prev) => {
      const w = (orientation === "V" ? shortMm : longMm) * DOTS_PER_MM;
      const h = (orientation === "V" ? longMm : shortMm) * DOTS_PER_MM;
      const pad = Number(prev.padding || 0);
      return {
        ...prev,
        width: w,
        height: h,
        fields: prev.fields.map((f) => clampFieldToBounds(f, w, h, pad)),
      };
    });
    setTimeout(() => fitToView(), 30);
  };

  // Ctrl + rueda del mouse hace zoom in/out
  useEffect(() => {
    const area = canvasAreaRef.current;
    if (!area) return;
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomFactor = 0.08;
        setZoom((prev) => {
          const next = e.deltaY < 0 ? prev + zoomFactor : prev - zoomFactor;
          return Math.max(0.25, Math.min(4.0, next));
        });
      }
    };
    area.addEventListener("wheel", handleWheel, { passive: false });
    return () => area.removeEventListener("wheel", handleWheel);
  }, []);

  // Centrar el canvas al montar
  useEffect(() => {
    setTimeout(() => {
      const area = canvasAreaRef.current;
      if (!area) return;
      const initialX = (area.clientWidth - templateData.width * zoom) / 2;
      const initialY = (area.clientHeight - templateData.height * zoom) / 2;
      setPanOffset({ x: initialX, y: initialY });
    }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Movimiento por teclado con flechas (respetando padding y bordes)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedFieldId) return;
      if (
        ["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)
      )
        return;

      if (e.key === "Delete" || e.key === "Backspace") {
        handleRemoveField(selectedFieldId);
        return;
      }

      const isArrow = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ].includes(e.key);
      if (!isArrow) return;
      e.preventDefault();

      const padding = Number(templateData.padding || 0);
      const moveX = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
      const moveY = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0;

      setTemplateData((prev) => ({
        ...prev,
        fields: prev.fields.map((f) => {
          if (f.id !== selectedFieldId) return f;
          const maxX = prev.width - f.width - padding;
          const maxY = prev.height - f.height - padding;
          return {
            ...f,
            x: Math.max(padding, Math.min(f.x + moveX, maxX)),
            y: Math.max(padding, Math.min(f.y + moveY, maxY)),
          };
        }),
      }));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFieldId, templateData.padding]);

  // Drag y resize globales
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

        const maxX =
          templateData.width - draggingFieldRef.current.width - padding;
        const maxY =
          templateData.height - draggingFieldRef.current.height - padding;

        currentX = Math.max(padding, Math.min(currentX, maxX));
        currentY = Math.max(padding, Math.min(currentY, maxY));

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

        let newWidth = Math.max(20, startDims.width + deltaX);
        let newHeight = Math.max(10, startDims.height + deltaY);

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

  const handlePanStart = (e) => {
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
      type,
      x: padding,
      y: padding,
      width: 140,
      height: 35,
      fontFamily: "Arial, sans-serif",
      fontSize: 14,
      color: "#1d1d1f",
      fontWeight: "normal",
      fontStyle: "normal",
      textAlign: "left",
      rotation: 0,
      content: type === "StaticText" ? "Texto Estatico" : "",
    };
    setTemplateData((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    setSelectedFieldId(newField.id);
  };

  const handleRemoveField = (id) => {
    setTemplateData((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== id),
    }));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const handleDuplicateField = (field) => {
    const padding = Number(templateData.padding || 0);
    const duplicated = {
      ...field,
      id: `f_${Date.now()}`,
      x: Math.min(field.x + 10, templateData.width - field.width - padding),
      y: Math.min(field.y + 10, templateData.height - field.height - padding),
    };
    setTemplateData((prev) => ({
      ...prev,
      fields: [...prev.fields, duplicated],
    }));
    setSelectedFieldId(duplicated.id);
  };

  const updateSelectedFieldProps = (key, value) => {
    setTemplateData((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => {
        if (f.id !== selectedFieldId) return f;
        const updated = { ...f, [key]: value };
        const padding = Number(prev.padding || 0);

        if (key === "width") {
          updated.width = Math.max(
            20,
            Math.min(Number(value), prev.width - f.x - padding),
          );
        }
        if (key === "height") {
          updated.height = Math.max(
            10,
            Math.min(Number(value), prev.height - f.y - padding),
          );
        }
        if (key === "x") {
          updated.x = Math.max(
            padding,
            Math.min(Number(value), prev.width - f.width - padding),
          );
        }
        if (key === "y") {
          updated.y = Math.max(
            padding,
            Math.min(Number(value), prev.height - f.height - padding),
          );
        }
        return updated;
      }),
    }));
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
    dragOffsetRef.current = { x: e.clientX, y: e.clientY };
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

  return (
    <div className={styles.editorContainer}>
      <CanvasSidebar
        templateData={templateData}
        setTemplateData={setTemplateData}
        selectedField={selectedField}
        rollPresets={ROLL_PRESETS}
        availableFieldTypes={AVAILABLE_FIELD_TYPES}
        fontFamilies={FONT_FAMILIES}
        orientation={orientation}
        applyOrientation={applyOrientation}
        applyRollPreset={applyRollPreset}
        pxToMm={pxToMm}
        updateSelectedFieldProps={updateSelectedFieldProps}
        handleDuplicateField={handleDuplicateField}
        handleRemoveField={handleRemoveField}
        handleAddField={handleAddField}
        onSave={onSave}
        onCancel={onCancel}
      />
      <CanvasWorkspace
        templateData={templateData}
        selectedFieldId={selectedFieldId}
        zoom={zoom}
        setZoom={setZoom}
        panOffset={panOffset}
        canvasAreaRef={canvasAreaRef}
        canvasRef={canvasRef}
        handlePanStart={handlePanStart}
        handleCanvasClick={handleCanvasClick}
        handleFieldMouseDown={handleFieldMouseDown}
        handleResizeMouseDown={handleResizeMouseDown}
      />
    </div>
  );
}
