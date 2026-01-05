import React, { useState, useEffect, useRef } from "react";
import styles from "../B1/LectorPrecios.module.css";
import logo from "../../../assets/images/logo.png";
import producto_imagen from "../../../assets/images/producto.png";
import producto_error from "../../../assets/images/producto-error.png";
import descuentos from "../../../assets/images/descuentos.png";
import successSound from "../../../assets/sounds/success.mp3";
import errorSound from "../../../assets/sounds/error.mp3";
import { apiService } from "../../../services/api";

const LectorPrecios = () => {
  const [fechaHora, setFechaHora] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [producto, setProducto] = useState(null);
  const [contador, setContador] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [contraseña, setContraseña] = useState("");
  const [contraseñaCorrecta] = useState("Publicidad$2025*+");
  const [errorContraseña, setErrorContraseña] = useState(false);
  const [escannerActivo, setEscannerActivo] = useState(false);
  const [mostrarAnimacion, setMostrarAnimacion] = useState(false);
  const bufferRef = useRef("");
  const cardRef = useRef(null);

  // Sonidos
  const successAudio = new Audio(successSound);
  const errorAudio = new Audio(errorSound);

  useEffect(() => {
    const activarFullscreenYOrientacion = async () => {
      try {
        const docEl = document.documentElement;

        // Intentar fullscreen
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }

        // Intentar forzar orientación horizontal
        if (screen.orientation && screen.orientation.lock) {
          try {
            await screen.orientation.lock("landscape");
          } catch (err) {}
        }
      } catch (error) {}
    };

    activarFullscreenYOrientacion();
  }, []);

  const handlePasswordChange = (e) => {
    setContraseña(e.target.value);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (contraseña === contraseñaCorrecta) {
      setMostrarFormulario(false);
      setErrorContraseña(false);
      setEscannerActivo(true);
      bufferRef.current = "";
      // Animación de entrada
      setMostrarAnimacion(true);

      // Activar fullscreen y orientación
      try {
        const docEl = document.documentElement;

        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }

        if (screen.orientation && screen.orientation.lock) {
          try {
            await screen.orientation.lock("landscape");
          } catch (err) {}
        }
      } catch (err) {}
    } else {
      setErrorContraseña(true);
      setContraseña("");
      errorAudio.play();
    }
  };

  useEffect(() => {
    const manejarKeydown = (e) => {
      if (e.key === "Enter") {
        setCodigoBarras(bufferRef.current);
        procesarCodigo(bufferRef.current);
        bufferRef.current = "";
      } else {
        bufferRef.current += e.key;
      }
    };

    if (escannerActivo) {
      window.addEventListener("keydown", manejarKeydown);
    }

    return () => window.removeEventListener("keydown", manejarKeydown);
  }, [escannerActivo]);

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
      };
      setFechaHora(ahora.toLocaleDateString("es-ES", opciones));
    };

    // Actualizar inmediatamente
    actualizarFechaHora();

    // Actualizar cada segundo
    const intervalo = setInterval(actualizarFechaHora, 1000);

    return () => clearInterval(intervalo);
  }, []);

  const formatearPrecio = (precio) => {
    return precio.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatearPrecio2 = (precio) => {
    return precio
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, "$&,")
      .replace(".", ",");
  };

  const convertirUnidad = (descripcion) => {
    return descripcion
      .replace(/\bml\b/g, "Mililitro")
      .replace(/\bgr\b/g, "Gramo")
      .replace(/\blitro\b/g, "Litro")
      .replace(/\bcc\b/g, "Centímetro cúbico")
      .replace(/\bLITRO\b/g, "Litro")
      .replace(/\kg\b/g, "Kilogramo")
      .replace(/\KG\b/g, "Kilogramo");
  };

  const procesarCodigo = async (codigo) => {
    if (!codigo) return;
    setCargando(true);

    try {
      const response = await apiService.getProductoBarras(codigo, "008");
      const data = response;

      if (!data.success) {
        setProducto({
          error: data.message || "Producto no encontrado o datos incompletos.",
          imagen: producto_error,
        });
        setContador(3);
        errorAudio.play();
      } else {
        const productoData = data.data;

        const unidad = productoData.descripcion.match(
          /(gr|ml|cc|litro|LITRO|kg)/i
        );
        let unidadConvertida = "Unidad";

        if (unidad) {
          switch (unidad[0].toLowerCase()) {
            case "ml":
              unidadConvertida = "Mililitro";
              break;
            case "gr":
              unidadConvertida = "Gramo";
              break;
            case "cc":
              unidadConvertida = "Centímetro cúbico";
              break;
            case "litro":
              unidadConvertida = "Litro";
              break;
            case "kg":
              unidadConvertida = "Kilogramo";
              break;
          }
        }

        const {
          codigo_barras,
          item,
          descripcion,
          precio,
          valor_col5,
          cantidad_por_empaque,
          venta_por,
        } = productoData;

        const division =
          valor_col5 && valor_col5 !== 0 ? precio / valor_col5 : 0;

        setProducto({
          codigo: codigo_barras,
          item: item,
          descripcion: convertirUnidad(descripcion),
          precio: `$${formatearPrecio(precio)}`,
          precioUnitario: `${unidadConvertida} a: $${formatearPrecio2(
            division
          )}`,
          cantidadPorEmpaque: cantidad_por_empaque,
          ventaPor: `Venta por: ${venta_por}`,
          imagen: descuentos,
        });
        setContador(8);
        successAudio.play();

        // Animación de entrada
        if (cardRef.current) {
          cardRef.current.classList.add(styles.cardEntrance);
          setTimeout(() => {
            if (cardRef.current) {
              cardRef.current.classList.remove(styles.cardEntrance);
            }
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error al conectar con el API:", error.message);
      setProducto({
        error:
          "Hubo un problema al conectar con el servidor. Revise su conexión.",
        imagen: producto_error,
      });
      setContador(3);
      errorAudio.play();
    } finally {
      setCargando(false);
      setCodigoBarras("");
    }
  };

  useEffect(() => {
    if (contador > 0) {
      const intervalo = setInterval(
        () => setContador((prev) => prev - 1),
        1000
      );
      return () => clearInterval(intervalo);
    }
    if (contador === 0) {
      setProducto(null);
    }
  }, [contador]);

  return (
    <div className={styles.lectorPreciosContainer}>
      {mostrarFormulario ? (
        <div
          className={`${styles.formularioContraseñaLector} ${
            mostrarAnimacion ? styles.animateForm : ""
          }`}
        >
          <div className={styles.formHeader}>
            <img src={logo} alt="Logo Belalcazar" className={styles.formLogo} />
            <h1 className={styles.title}>Acceso al Lector de Precios</h1>
          </div>
          <form onSubmit={handlePasswordSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Ingrese la contraseña:</label>
              <input
                type="password"
                id="password"
                value={contraseña}
                onChange={handlePasswordChange}
                placeholder="Contraseña"
                className={`${styles.inputContraseñaLector} ${
                  errorContraseña ? styles.error : ""
                }`}
                onFocus={() => setEscannerActivo(false)}
                onBlur={() => setEscannerActivo(true)}
                autoFocus
              />
            </div>
            {errorContraseña && (
              <p className={styles.errorText}>Contraseña incorrecta</p>
            )}
            <button type="submit" className={styles.lectoPreciosButton}>
              <span>Ingresar</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12H19M19 12L13 6M19 12L13 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      ) : (
        <>
          {cargando ? (
            <div className={styles.cargandoOverlayLector}>
              <div className={styles.spinnerLector}></div>
              <p>Buscando producto...</p>
              <div className={styles.scanningAnimation}>
                <div className={styles.scanLine}></div>
              </div>
            </div>
          ) : producto ? (
            <div
              ref={cardRef}
              className={`${styles.lectorPreciosCard} ${styles.resultado}`}
            >
              <div className={styles.lectorPreciosLeftBlock}>
                <img
                  src={logo}
                  alt="Logo"
                  className={styles.lectorPreciosLogo}
                />
                {producto.error ? (
                  // Mostrar fecha y hora cuando hay error en el producto
                  <div className={styles.fechaHoraContainer}>
                    <div className={styles.fechaHoraContent}>
                      <p className={styles.fechaHoraTexto}>{fechaHora}</p>
                    </div>
                  </div>
                ) : (
                  // Mostrar información del precio cuando el producto es válido
                  <div className={styles.leftContentWrapper}>
                    <h2 className={styles.precioLabel}>PRECIO</h2>
                    <h1 className={styles.precioGrande}>{producto.precio}</h1>
                    <div className={styles.precioUnitarioContainer}>
                      <span className={styles.precioUnitario}>
                        {producto.precioUnitario}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.lectorPreciosRightBlock}>
                {producto.error ? (
                  <div className={styles.errorContainer}>
                    <img
                      src={producto.imagen}
                      alt="Error"
                      className={styles.productoImagen}
                    />
                    <h3 className={styles.errorMensaje}>{producto.error}</h3>
                  </div>
                ) : (
                  <div className={styles.productoDetalle}>
                    <div className={styles.productoImagenContainer}>
                      <img
                        src={producto.imagen}
                        alt="Producto"
                        className={styles.productoImagen}
                      />
                    </div>
                    <div className={styles.productoInfo}>
                      <div className={styles.productoHeader}>
                        <div className={styles.productoCodigoContainer}>
                          <span className={styles.productoCodigoLabel}>
                            Código:
                          </span>
                          <span className={styles.productoCodigo}>
                            {producto.codigo}
                          </span>
                        </div>
                        <div className={styles.productoItemContainer}>
                          <span className={styles.productoItemLabel}>
                            Item:
                          </span>
                          <span className={styles.productoItem}>
                            {producto.item}
                          </span>
                        </div>
                      </div>
                      <h2 className={styles.productoNombre}>
                        {producto.descripcion}
                      </h2>
                      <div className={styles.productoDetails}>
                        <div className={styles.productoDetail}>
                          <span className={styles.detailLabel}>
                            Cantidad por Empaque:
                          </span>
                          <span className={styles.detailValue}>
                            {producto.cantidadPorEmpaque}
                          </span>
                        </div>
                        <div className={styles.productoDetail}>
                          <span className={styles.detailLabel}>Venta por:</span>
                          <span className={styles.detailValue}>
                            {producto.ventaPor.replace("Venta por: ", "")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className={styles.contadorGrafico}>
                  <div className={styles.contadorCircular}>
                    <div className={styles.contadorNumero}>{contador}</div>
                    <svg width="60" height="60" viewBox="0 0 60 60">
                      <circle
                        cx="30"
                        cy="30"
                        r="25"
                        stroke="#36b04b"
                        strokeWidth="5"
                        fill="none"
                        strokeDasharray="157"
                        strokeDashoffset={(contador / 8) * 157}
                        className={styles.contadorCircle}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`${styles.lectorPreciosCard} ${styles.inicial}`}>
              <div className={styles.lectorPreciosLeftBlock}>
                <img
                  src={logo}
                  alt="Logo"
                  className={styles.lectorPreciosLogo}
                />
                <div className={styles.fechaHoraContainer}>
                  <div className={styles.fechaHoraContent}>
                    <p className={styles.fechaHoraTexto}>{fechaHora}</p>
                  </div>
                </div>
              </div>
              <div className={styles.lectorPreciosRightBlock}>
                <div className={styles.scanPrompt}>
                  <h3 className={styles.lectorPreciosFormTitle}>
                    CONSULTE EL PRECIO AQUÍ
                  </h3>
                  <div className={styles.scanAnimation}>
                    <div className={styles.barcodeIcon}>
                      <div className={styles.barcodeLine}></div>
                      <div className={styles.barcodeLine}></div>
                      <div className={styles.barcodeLine}></div>
                      <div className={styles.barcodeLine}></div>
                      <div className={styles.barcodeLine}></div>
                      <div className={styles.barcodeLine}></div>
                      <div className={styles.barcodeLine}></div>
                      <div className={styles.barcodeLine}></div>
                    </div>
                    <div className={styles.scanLine}></div>
                  </div>
                  <p className={styles.instrucciones}>
                    Use el escáner para leer el código de barras
                  </p>
                </div>
              </div>
            </div>
          )}
          <div
            className={`${styles.lectorPreciosFlecha} ${
              producto ? styles.ocultar : ""
            }`}
          >
            <div className={styles.arrowDown}>
              <div className={styles.arrowTop}></div>
              <div className={styles.arrowMiddle}></div>
              <div className={styles.arrowBottom}></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LectorPrecios;
