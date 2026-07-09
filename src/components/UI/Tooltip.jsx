import React, { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.css";

const Tooltip = ({ text, children, position = "right" }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef(null);

  const show = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    // Posicion segun la orientacion solicitada (por defecto "right")
    if (position === "right") {
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
      });
    } else if (position === "left") {
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.left - 12,
      });
    } else {
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
      });
    }

    setVisible(true);
  }, [position]);

  const hide = useCallback(() => setVisible(false), []);

  return (
    <div
      ref={wrapperRef}
      className={styles.tooltipContainer}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}

      {visible &&
        createPortal(
          <div
            className={`${styles.tooltip} ${styles[position]}`}
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
            role="tooltip"
          >
            {text}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Tooltip;
