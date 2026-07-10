import React from "react";

/**
 * Input completamente oculto (opacity 0, pointer-events none, 1×1 px)
 * que captura los caracteres inyectados por el escáner. Se mantiene
 * fuera del flujo visual pero recibe foco mientras el terminal está
 * activo.
 *
 * inputMode="none" es crítico en Android: previene que salga el
 * teclado virtual al enfocar, sin bloquear la inyección del lector.
 */
const HiddenScannerInput = React.forwardRef(
  ({ onKeyDown, onChange }, ref) => (
    <input
      ref={ref}
      type="text"
      inputMode="none"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      onChange={onChange}
      onKeyDown={onKeyDown}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: "none",
        zIndex: -1,
      }}
    />
  ),
);

HiddenScannerInput.displayName = "HiddenScannerInput";

export default HiddenScannerInput;
