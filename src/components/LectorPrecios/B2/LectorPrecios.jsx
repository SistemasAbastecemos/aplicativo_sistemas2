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

const LectorPrecios = () => {
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
  const SEDE_NOMBRE = "Supermercado Belalcazar Centro Abastos";
  const SEDE_ID = "002";
  const TIEMPO_ESPERA_PANTALLA = 8;
  const MAX_BUFFER_LENGTH = 128;

  const bufferRef = useRef("");
  const timeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);

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
      } catch (error) {
        // Fallback silencioso si las politicas del navegador bloquean el fullscreen directo
      }
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

  useEffect(() => {
    if (mostrarFormulario) return;

    const manejarTeclado = (e) => {
      if (cargando) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (e.key === "Enter") {
        const codigoFinal = bufferRef.current.trim();
        bufferRef.current = "";
        if (codigoFinal) {
          procesarCodigo(codigoFinal);
        }
      } else {
        if (e.key !== "Shift" && e.key !== "Control" && e.key !== "Alt") {
          // Validacion para evitar desbordamiento de memoria por lecturas basura de hardware
          if (bufferRef.current.length < MAX_BUFFER_LENGTH) {
            bufferRef.current += e.key;
          }
        }

        timeoutRef.current = setTimeout(() => {
          bufferRef.current = "";
        }, 1500);
      }
    };

    window.addEventListener("keydown", manejarTeclado);
    return () => {
      window.removeEventListener("keydown", manejarTeclado);
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

export default LectorPrecios;
