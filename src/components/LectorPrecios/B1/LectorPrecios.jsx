import React, { useState, useRef } from "react";
import styles from "./LectorPrecios.module.css";
import successSound from "../../../assets/sounds/success.mp3";
import errorSound from "../../../assets/sounds/error.mp3";

// Hooks
import { useKioskMode } from "./hooks/useKioskMode";
import { useReloj } from "./hooks/useReloj";
import { useScannerCapture } from "./hooks/useScannerCapture";
import { useProductoLookup } from "./hooks/useProductoLookup";
import { useBannerAnimacion } from "./hooks/useBannerAnimacion";

// Components
import HiddenScannerInput from "./components/HiddenScannerInput";
import TopSedeBar from "./components/TopSedeBar";
import LoginKiosco from "./components/LoginKiosco";
import ClockBar from "./components/ClockBar";
import LoadingOverlay from "./components/LoadingOverlay";
import WelcomeCard from "./components/WelcomeCard";
import BannerRotatorio from "./components/BannerRotatorio";
import ProductoCard from "./components/ProductoCard";
import ErrorCard from "./components/ErrorCard";
import FlechaDown from "./components/FlechaDown";

/**
 * Terminal de consulta de precios para kiosco (sede Guabinas). El
 * orquestador solo compone hooks y componentes; toda la lógica está
 * encapsulada en los hooks:
 *
 *  - `useKioskMode`: activa fullscreen + orientación landscape.
 *  - `useReloj`: fecha/hora en vivo.
 *  - `useProductoLookup`: fetch al backend + countdown de regreso.
 *  - `useScannerCapture`: input oculto + focus + detección de fin de escaneo.
 *  - `useBannerAnimacion`: mensajes rotatorios + partículas.
 *
 * Flujo:
 *  1. Al montar: activar modo kiosco (best-effort, sin bloquear si falla).
 *  2. Mostrar login con contraseña (viene de VITE_LECTOR_PASSWORD).
 *  3. Al validar login: ocultar formulario, mostrar terminal activo.
 *  4. Escanear código → consulta backend → mostrar resultado o error.
 *  5. Tras TIEMPO_ESPERA_PANTALLA segundos, regresar a bienvenida.
 */
const LectorPreciosGuabinas = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const contrasenaCorrecta = import.meta.env.VITE_LECTOR_PASSWORD || "";

  const { activar: activarKiosco } = useKioskMode();
  const fechaHora = useReloj();

  // Refs de audio (creados una sola vez con lazy init)
  const audioSuccess = useRef(null);
  const audioError = useRef(null);
  if (audioSuccess.current === null)
    audioSuccess.current = new Audio(successSound);
  if (audioError.current === null) audioError.current = new Audio(errorSound);

  const {
    producto,
    errorProducto,
    cargando,
    escannerActivo,
    tiempoRestante,
    procesarCodigo,
    desactivarEscaner,
    activarEscaner,
  } = useProductoLookup({ audioSuccess, audioError });

  const { inputRef, handleKeyDown, handleChange } = useScannerCapture({
    activo: !mostrarFormulario,
    cargando,
    onCodigo: procesarCodigo,
  });

  const { mensajeActivo, particulas } = useBannerAnimacion({
    pausado: mostrarFormulario || !!producto || errorProducto || cargando,
  });

  // ==================== Handlers ====================

  const handleLoginExitoso = async () => {
    setMostrarFormulario(false);
    activarEscaner();
    await activarKiosco();
  };

  const handleLoginFallido = () => {
    try {
      audioError.current.play();
    } catch (_) {}
  };

  // ==================== Render ====================

  // Activación inicial del modo kiosco al montar (best-effort). Se hace
  // fuera de useEffect para evitar duplicar la lógica del login.
  React.useEffect(() => {
    activarKiosco();
  }, [activarKiosco]);

  return (
    <div className={styles.lectorPreciosContainer}>
      <HiddenScannerInput
        ref={inputRef}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
      />

      <TopSedeBar />

      {mostrarFormulario ? (
        <LoginKiosco
          contrasenaCorrecta={contrasenaCorrecta}
          onLoginExitoso={handleLoginExitoso}
          onIntentoFallido={handleLoginFallido}
        />
      ) : (
        <div className={styles.lectorPreciosLayoutInner}>
          <ClockBar fechaHora={fechaHora} />

          {cargando && <LoadingOverlay />}

          <div className={styles.lectorPreciosCenterZone}>
            {!producto && !errorProducto && !cargando && (
              <>
                <WelcomeCard escannerActivo={escannerActivo} />
                <BannerRotatorio
                  mensajeActivo={mensajeActivo}
                  particulas={particulas}
                />
              </>
            )}

            {producto && !cargando && (
              <ProductoCard
                producto={producto}
                tiempoRestante={tiempoRestante}
              />
            )}

            {errorProducto && !cargando && (
              <ErrorCard tiempoRestante={tiempoRestante} />
            )}

            <FlechaDown oculta={!!producto || errorProducto} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LectorPreciosGuabinas;
