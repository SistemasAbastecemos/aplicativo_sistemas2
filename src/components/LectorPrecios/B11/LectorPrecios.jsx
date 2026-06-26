import React, { useState, useEffect, useRef } from "react";
import styles from "../B1/LectorPrecios.module.css";
import logo from "../../../assets/images/logo.png";
import descuentos from "../../../assets/images/descuentos.png";
import successSound from "../../../assets/sounds/success.mp3";
import errorSound from "../../../assets/sounds/error.mp3";
import { apiService } from "../../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarcode,
  faStore,
  faExclamationTriangle,
  faArrowRight,
  faTags,
  faBoxes,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

const LectorPreciosGuabinas = () => {
  const [fechaHora, setFechaHora] = useState("");
  const [producto, setProducto] = useState(null);
  const [errorProducto, setErrorProducto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [contrasena, setContrasena] = useState("");
  const [escannerActivo, setEscannerActivo] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [animacionActiva, setAnimacionActiva] = useState(0);
  const [particulas, setParticulas] = useState([]);
  const [errorContrasena, setErrorContrasena] = useState(false);

  const contrasenaCorrecta = import.meta.env.VITE_LECTOR_PASSWORD || "";
  const SEDE_NOMBRE = "Supermercado Belalcazar Guabinas";
  const SEDE_ID = "011";
  const TIEMPO_ESPERA_PANTALLA = 8;
  // Largo minimo del codigo para procesarlo cuando el lector NO envia Enter.
  // Ajustalo si los codigos internos son mas cortos (o en 13 para exigir EAN-13).
  const LARGO_MINIMO_CODIGO = 4;
  // Pausa (ms) tras el ultimo caracter para considerar que el escaneo termino.
  const PAUSA_FIN_ESCANEO = 120;

  const timeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  // Input oculto que captura el escaneo (funciona con escaner USB y con lector integrado Android)
  const inputCapturaRef = useRef(null);

  const audioSuccess = useRef(new Audio(successSound));
  const audioError = useRef(new Audio(errorSound));

  const formatearDinero = (valor) => {
    if (typeof valor !== "number" || isNaN(valor)) {
      return "0";
    }
    return new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  };

  useEffect(() => {
    const activarKioscoModo = async () => {
      try {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        }

        if (screen.orientation && screen.orientation.lock) {
          try {
            await screen.orientation.lock("landscape");
          } catch (_) {}
        }
      } catch (error) {}
    };

    activarKioscoModo();
  }, []);

  useEffect(() => {
    const actualizarFechaHora = () => {
      const ahora = new Date();
      const opciones = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setFechaHora(ahora.toLocaleDateString("es-CO", opciones).toUpperCase());
    };

    actualizarFechaHora();
    const intervalo = setInterval(actualizarFechaHora, 1000);
    return () => clearInterval(intervalo);
  }, []);

  // ===== CAPTURA DEL ESCANER =====
  // En lugar de escuchar "keydown" en window (que falla en Android porque el
  // lector integrado inyecta el texto via IME y e.key llega como "Unidentified"),
  // mantenemos enfocado un input oculto. Tanto el escaner USB como el lector
  // Android escriben en el campo enfocado, asi que este metodo es universal.
  useEffect(() => {
    if (mostrarFormulario) return;

    const enfocar = () => {
      if (inputCapturaRef.current && !cargando) {
        inputCapturaRef.current.focus();
      }
    };

    enfocar();
    // Re-enfoca periodicamente y ante cualquier toque/click por si pierde el foco
    const intervalo = setInterval(enfocar, 500);
    window.addEventListener("click", enfocar);
    window.addEventListener("touchstart", enfocar);

    return () => {
      clearInterval(intervalo);
      window.removeEventListener("click", enfocar);
      window.removeEventListener("touchstart", enfocar);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [mostrarFormulario, cargando]);

  useEffect(() => {
    if (mostrarFormulario || producto || errorProducto || cargando) return;

    const cambiarMensajeYParticulas = () => {
      const indiceAleatorio = Math.floor(Math.random() * 3);
      setAnimacionActiva(indiceAleatorio);

      const nuevasParticulas = Array.from({ length: 6 }).map((_, i) => ({
        id: Date.now() + i,
        left: `${Math.random() * 90 + 5}%`,
        size: `${Math.random() * 6 + 4}px`,
        delay: `${Math.random() * 2}s`,
        duration: `${Math.random() * 3 + 3}s`,
      }));
      setParticulas(nuevasParticulas);
    };

    cambiarMensajeYParticulas();
    const intervaloAnimacion = setInterval(cambiarMensajeYParticulas, 7000);

    return () => clearInterval(intervaloAnimacion);
  }, [mostrarFormulario, producto, errorProducto, cargando]);

  const iniciarContadorRegresivo = () => {
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);
    setTiempoRestante(TIEMPO_ESPERA_PANTALLA);

    countdownIntervalRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          setProducto(null);
          setErrorProducto(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const procesarCodigo = async (codigo) => {
    if (!codigo || typeof codigo !== "string") return;

    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);
    setCargando(true);
    setErrorProducto(false);
    setEscannerActivo(true);

    try {
      const response = await apiService.getProductoBarras(codigo, SEDE_ID);

      if (response && response.success && response.data) {
        setProducto(response.data);
        try {
          audioSuccess.current.play();
        } catch (_) {}
        iniciarContadorRegresivo();
      } else {
        manejarFalloLectura();
      }
    } catch (error) {
      manejarFalloLectura();
    } finally {
      setCargando(false);
      setTimeout(() => setEscannerActivo(false), 2000);
    }
  };

  // Limpia el input oculto y procesa el codigo escaneado
  const procesarDesdeInput = (valor) => {
    const codigo = (valor || "").trim();
    if (inputCapturaRef.current) inputCapturaRef.current.value = "";
    if (codigo) procesarCodigo(codigo);
  };

  // Caso autoenter: el lector envia Enter al final del codigo
  const handleScannerKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      procesarDesdeInput(e.target.value);
    }
  };

  // Fallback: si el lector NO envia Enter (comun en Android), procesa
  // cuando deja de llegar texto durante una breve pausa.
  const handleScannerChange = (e) => {
    const valor = e.target.value;
    if (cargando) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (valor.trim().length >= LARGO_MINIMO_CODIGO) {
        procesarDesdeInput(valor);
      }
    }, PAUSA_FIN_ESCANEO);
  };

  const manejarFalloLectura = () => {
    setProducto(null);
    setErrorProducto(true);
    try {
      audioError.current.play();
    } catch (_) {}
    iniciarContadorRegresivo();
  };

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const manejarLogin = async (e) => {
    e.preventDefault();

    if (!contrasenaCorrecta) {
      setErrorContrasena(true);
      return;
    }

    if (contrasena === contrasenaCorrecta) {
      setMostrarFormulario(false);
      setErrorContrasena(false);
      setEscannerActivo(true);

      try {
        const docEl = document.documentElement;

        if (!document.fullscreenElement) {
          await docEl.requestFullscreen();
        }

        if (screen.orientation?.lock) {
          try {
            await screen.orientation.lock("landscape");
          } catch (_) {}
        }
      } catch (_) {}
    } else {
      setErrorContrasena(true);
      setContrasena("");

      try {
        audioError.current.play();
      } catch (_) {}
    }
  };

  return (
    <div className={styles.lectorPreciosContainer}>
      {/* Input oculto que captura el escaneo. Se mantiene enfocado mientras
          el lector esta activo. inputMode="none" evita el teclado en pantalla
          del Android sin bloquear la inyeccion del lector. */}
      <input
        ref={inputCapturaRef}
        type="text"
        inputMode="none"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        onChange={handleScannerChange}
        onKeyDown={handleScannerKeyDown}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      <div className={styles.topSedeBar}>
        <FontAwesomeIcon icon={faStore} className={styles.topSedeIcon} />
        <span>{SEDE_NOMBRE}</span>
      </div>

      {mostrarFormulario ? (
        <div className={styles.lectorPreciosFormWrapper}>
          <div className={styles.lectorPreciosFormCard}>
            <div className={styles.logoWrapper}>
              <img
                src={logo}
                alt="Logo"
                className={styles.lectorPreciosFormLogo}
              />
            </div>
            <h2 className={styles.lectorPreciosFormTitle}>
              Terminal de Consulta
            </h2>
            <form onSubmit={manejarLogin} className={styles.lectorPreciosForm}>
              <input
                type="password"
                placeholder="Ingrese clave de acceso"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                className={`${styles.lectorPreciosInput} ${errorContrasena ? styles.inputError : ""}`}
                onFocus={() => setEscannerActivo(false)}
                onBlur={() => setEscannerActivo(true)}
                autoFocus
              />
              {errorContrasena && (
                <p className={styles.errorTextMsg}>Credencial incorrecta</p>
              )}
              <button type="submit" className={styles.lectorPreciosButton}>
                Iniciar Operacion <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className={styles.lectorPreciosLayoutInner}>
          <div className={styles.lectorPreciosTimeRow}>
            <div className={styles.lectorPreciosHeaderTime}>
              <div className={styles.timeText}>{fechaHora}</div>
            </div>
          </div>

          {cargando && (
            <div className={styles.fullscreenLoading}>
              <div className={styles.spinner}></div>
              <p>Consultando base de datos...</p>
            </div>
          )}

          <div className={styles.lectorPreciosCenterZone}>
            {!producto && !errorProducto && !cargando && (
              <>
                <div className={styles.lectorPreciosCard}>
                  <div className={styles.lectorPreciosLeftBlock}>
                    <img
                      src={logo}
                      alt="Logo Belalcazar"
                      className={styles.lectorPreciosLogo}
                    />
                    <div className={styles.welcomeMessage}>
                      <h2>¡BIENVENIDO!</h2>
                      <p>
                        Consulte aqui el precio de sus productos de forma rapida
                        y segura
                      </p>
                    </div>
                  </div>
                  <div className={styles.lectorPreciosRightBlock}>
                    <div className={styles.scanPromptWrapper}>
                      <h3 className={styles.lectorPreciosScanTitle}>
                        PASE EL CODIGO POR EL ESCANER AQUI
                      </h3>
                      <div
                        className={`${styles.scanAnimation} ${escannerActivo ? styles.activo : ""}`}
                      >
                        <div className={styles.barcodeIcon}>
                          <div className={styles.barcodeLine}></div>
                          <div className={styles.barcodeLine}></div>
                          <div className={styles.barcodeLine}></div>
                          <div
                            className={styles.barcodeLine}
                            style={{ width: "6px" }}
                          ></div>
                          <div className={styles.barcodeLine}></div>
                          <div
                            className={styles.barcodeLine}
                            style={{ width: "4px" }}
                          ></div>
                          <div className={styles.barcodeLine}></div>
                        </div>
                        <div className={styles.scanLine}></div>
                      </div>
                      <p className={styles.instrucciones}>
                        <FontAwesomeIcon icon={faBarcode} /> Alinee el codigo de
                        barras frente al rayo laser rojo
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`${styles.bannerInferiorAnimado} ${styles.ambientGlowEffect}`}
                >
                  {particulas.map((p) => (
                    <span
                      key={p.id}
                      className={styles.particulaFlotante}
                      style={{
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                      }}
                    />
                  ))}

                  {animacionActiva === 0 && (
                    <div
                      className={`${styles.itemAnimado} ${styles.slideEfecto}`}
                    >
                      <span className={styles.badgeAnimado}>💡 TIPS</span>
                      <p>
                        ¿Sabias que? En Supermercado Belalcazar estamos
                        trabajando en el futuro con nuestro mas grande proyecto
                        Siembra, una evolucion de nuestro sistema.
                      </p>
                    </div>
                  )}
                  {animacionActiva === 1 && (
                    <div
                      className={`${styles.itemAnimado} ${styles.pulseEfecto}`}
                    >
                      <span
                        className={`${styles.badgeAnimado} ${styles.badgeVerde}`}
                      >
                        ✓ ACTIVO
                      </span>
                      <p>
                        Ahorra en tus compras en la linea pescados y mariscos
                        con los descuentos de todos los martes y jueves.
                      </p>
                    </div>
                  )}
                  {animacionActiva === 2 && (
                    <div
                      className={`${styles.itemAnimado} ${styles.shimmerEfecto}`}
                    >
                      <span
                        className={`${styles.badgeAnimado} ${styles.badgeAmarillo}`}
                      >
                        ⭐ EXCLUSIVO
                      </span>
                      <p>
                        ¡Recuerda que todos los martes son Martes de Plaza,
                        aprovecha todos nuestros descuentos!
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {producto && !cargando && (
              <div
                className={`${styles.lectorPreciosCard} ${styles.resultadoLayout}`}
              >
                <div className={styles.layoutBloquePrecioIzquierdo}>
                  <img
                    src={logo}
                    alt="Logo Belalcazar"
                    className={styles.resultadoLogoIzquierdo}
                  />

                  <div className={styles.premiumPriceContainer}>
                    <span className={styles.premiumPriceLabel}>
                      PRECIO DE VENTA
                    </span>
                    <div className={styles.priceValueWrapper}>
                      <span className={styles.currencyMiniSymbol}>$</span>
                      <span className={styles.priceMainNumbers}>
                        {formatearDinero(producto.precio)}
                      </span>
                      <span className={styles.currencyRegionIso}>COP</span>
                    </div>
                    {producto.precio_unitario && (
                      <div className={styles.pumBadge}>
                        <FontAwesomeIcon icon={faBoxes} /> PUM: $
                        {producto.precio_unitario} por{" "}
                        {producto.venta_por || "Und"}
                      </div>
                    )}
                  </div>

                  <div className={styles.contadorEsperaBadge}>
                    <FontAwesomeIcon
                      icon={faClock}
                      className={styles.iconClockPulse}
                    />{" "}
                    Regreso en: <strong>{tiempoRestante}s</strong>
                  </div>
                </div>

                <div className={styles.layoutDetalleProductoDerecho}>
                  <div className={styles.subBloquePautaHorizontal}>
                    <img
                      src={descuentos}
                      alt="Pauta Publicitaria"
                      className={styles.bannerPautaHorizontal}
                    />
                  </div>

                  <div className={styles.subBloqueInfoProductoHorizontal}>
                    <h1 className={styles.productoNombre}>
                      {producto.descripcion}
                    </h1>

                    {producto.linea2 && (
                      <div className={styles.lineaCategoria}>
                        <FontAwesomeIcon icon={faTags} />{" "}
                        {producto.linea2.toUpperCase()}
                      </div>
                    )}

                    <div className={styles.metaDataContainer}>
                      <div className={styles.metaBadge}>
                        <span className={styles.metaLabel}>Codigo:</span>
                        <span className={styles.metaValue}>
                          {producto.codigo_barras}
                        </span>
                      </div>
                      <div className={styles.metaBadge}>
                        <span className={styles.metaLabel}>Item:</span>
                        <span className={styles.metaValue}>
                          {producto.item}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {errorProducto && !cargando && (
              <div
                className={`${styles.lectorPreciosCard} ${styles.errorCardLayout}`}
              >
                <div className={styles.errorIconSection}>
                  <div className={styles.alertIconCircle}>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                  </div>
                  <div className={styles.contadorEsperaBadgeError}>
                    <FontAwesomeIcon icon={faClock} /> Regreso en:{" "}
                    {tiempoRestante}s
                  </div>
                </div>
                <div className={styles.errorTextSection}>
                  <h2>PRODUCTO NO ENCONTRADO</h2>
                  <p className={styles.errorBrief}>
                    No logramos encontrar el producto en nuestra base de datos.
                  </p>
                  <div className={styles.errorAdviceBox}>
                    <h4>¿Que puede hacer?</h4>
                    <ul>
                      <li>
                        Intente pasar el producto nuevamente por el escaner.
                      </li>
                      <li>
                        Verifique que el codigo de barras no este arrugado o
                        sucio.
                      </li>
                      <li>
                        Solicite asistencia con uno de nuestros asesores en los
                        pasillos.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div
              className={`${styles.lectorPreciosFlecha} ${producto || errorProducto ? styles.ocultar : ""}`}
            >
              <div className={styles.arrowDown}>
                <div className={styles.arrowTop}></div>
                <div className={styles.arrowMiddle}></div>
                <div className={styles.arrowBottom}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LectorPreciosGuabinas;
