import React, { useEffect, useState } from "react";
import { apiService } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { useNotification } from "../../../contexts/NotificationContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import LoadingScreen from "../../UI/LoadingScreen";
import logo from "../../../assets/images/logo.png";
import reverso from "../../../assets/images/reverso.png";
import anverso from "../../../assets/images/anverso.png";
import styles from "./codificacionProductosAB.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faDownload,
  faExchangeAlt,
  faLineChart,
  faInfoCircle,
  faPencilAlt,
  faHistory,
  faArrowRight,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";

function CodificacionProductosAB({ login }) {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [solicitudes, setSolicitudes] = useState([]);
  const [estado, setEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [view, setView] = useState("listar");
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [traceabilityModalOpen, setTraceabilityModalOpen] = useState(false);
  const [traceabilityData, setTraceabilityData] = useState([]);
  const loginsCompradores = [
    "ANDREA",
    "CLAUDIA",
    "JAVID",
    "JAZMIN",
    "JEFFERSON",
    "LORENA",
    "POLLO",
  ];

  const fetchData = async (
    search = "",
    estado = "Todos",
    page = 1,
    showNotifications = true
  ) => {
    try {
      const response = await axios.get(
        "https://aplicativo.supermercadobelalcazar.com/funciones/codificacionProductos.php",
        {
          params: { search, estado, page, login },
        }
      );

      if (response.data && response.data.solicitudes) {
        setSolicitudes(response.data.solicitudes);
        setHasMoreUsers(response.data.hasMore);

        if (showNotifications) {
          addNotification(
            response.data.solicitudes.length > 0 ? "success" : "warning",
            response.data.solicitudes.length > 0
              ? "Se han cargado las solicitudes exitosamente"
              : "No hay solicitudes por mostrar"
          );
        }
      }
    } catch (error) {
      if (showNotifications) {
        addNotification("danger", "Error al cargar las solicitudes.");
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const timer = setTimeout(() => {
      fetchData(busqueda, estado, page, true);
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [busqueda, estado, page]);

  const handlePageChange = (newPage) => {
    if (newPage > 0) {
      setPage(newPage);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleVerMas = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setView("detalle");
  };

  const handleCancel = () => {
    setView("listar");
    fetchData(busqueda, estado, page, true);
  };

  const handleAprobar = async () => {
    if (
      login === "Codificador" &&
      solicitudSeleccionada.estado === "Aprobado"
    ) {
      // Validar precio de venta para cada producto
      const productosInvalidos = solicitudSeleccionada.productos.some(
        (producto) => {
          // Solo validar si el producto está Aprobado
          if (producto.aprobado === "0") return false;
          const precioVentaEditable =
            producto.precio_venta_editable ?? producto.precio_venta;
          const precioVenta = parseFloat(precioVentaEditable);
          const costoSinIVA = parseFloat(producto.costo_sin_iva);
          return (
            isNaN(precioVenta) || precioVenta <= 0 || precioVenta < costoSinIVA
          );
        }
      );

      if (productosInvalidos) {
        addNotification(
          "danger",
          "Precio de venta inválido en uno o más productos (Debe ser > 0 y ≥ costo sin IVA)."
        );
        return;
      }
    }

    // Validación de portafolios para Comprador (Generado) y Luz Marina (En revision)
    if (
      (loginsCompradores.includes(login.toUpperCase()) &&
        solicitudSeleccionada.estado === "Generado") ||
      (login === "Luz Marina" && solicitudSeleccionada.estado === "En revision")
    ) {
      const portafoliosInvalidos = solicitudSeleccionada.productos.some(
        (producto) => {
          const portafolios = (producto.portafoliosEditable ?? []).filter(
            (p) => p !== ""
          ); // Filtramos elementos vacíos
          return portafolios.length === 0;
        }
      );

      if (portafoliosInvalidos) {
        addNotification(
          "danger",
          "Cada producto debe tener al menos un portafolio seleccionado."
        );
        return;
      }

      const fecha = solicitudSeleccionada.fecha_requerimiento;
      if (!fecha?.trim() || fecha === "0000-00-00") {
        addNotification(
          "danger",
          "Debe ingresar una fecha de requerimiento válida."
        );
        return;
      }
    }

    try {
      setIsLoading(true);
      let accion = "";

      // Determinar la acción según el rol y estado
      if (
        loginsCompradores.includes(login.toUpperCase()) &&
        solicitudSeleccionada.estado === "Generado"
      ) {
        accion = "enviar-por-aprobar";
      } else if (
        login === "Luz Marina" &&
        solicitudSeleccionada.estado === "En revision"
      ) {
        accion = "aprobar-revision";
      } else if (
        login === "Codificador" &&
        solicitudSeleccionada.estado === "Aprobado"
      ) {
        accion = "terminar-codificacion";
      }

      // Preparar datos para enviar
      const dataToSend = {
        id: solicitudSeleccionada.id,
        fecha_requerimiento:
          solicitudSeleccionada.fecha_requerimiento === "0000-00-00"
            ? null
            : solicitudSeleccionada.fecha_requerimiento,
        recomendaciones: solicitudSeleccionada.recomendaciones,
        productos: solicitudSeleccionada.productos.map((producto) => ({
          id: producto.id,
          precio_venta: producto.precio_venta_editable ?? producto.precio_venta,
          pie_factura1: producto.pie_factura1_editable ?? producto.pie_factura1,
          pie_factura2: producto.pie_factura2_editable ?? producto.pie_factura2,
          portafolios: producto.portafoliosEditable ?? [],
          aprobado: producto.aprobado_editable ?? producto.aprobado,
          item_asignado: producto.item_asignado_editable,
        })),
        codificador: solicitudSeleccionada.codificador,
        accion,
      };

      if (
        login === "Codificador" &&
        solicitudSeleccionada.estado === "Aprobado"
      ) {
        dataToSend.item_asignado = solicitudSeleccionada.item_asignado;
        dataToSend.codificador = solicitudSeleccionada.codificador;
      }

      const response = await axios.put(
        "https://aplicativo.supermercadobelalcazar.com/funciones/codificacionProductos.php",
        dataToSend
      );

      if (response.data.success) {
        addNotification("success", "Acción realizada correctamente.");
        setView("listar");
        fetchData(busqueda, estado, page, false);
      } else {
        throw new Error(
          response.data.error || "Error al procesar la solicitud"
        );
      }
    } catch (error) {
      addNotification(
        "danger",
        error.message || "Error al realizar la acción."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRechazar = async () => {
    try {
      setIsLoading(true);
      let accion = "";

      // Determinar la acción según el rol y estado
      if (
        loginsCompradores.includes(login.toUpperCase()) &&
        solicitudSeleccionada.estado === "Generado"
      ) {
        accion = "rechazar";
      } else if (
        login === "Luz Marina" &&
        solicitudSeleccionada.estado === "En revision"
      ) {
        accion = "rechazar-revision";
      } else if (
        login === "Codificador" &&
        solicitudSeleccionada.estado === "Aprobado"
      ) {
        accion = "rechazar-codificacion";
      }

      const response = await axios.put(
        "https://aplicativo.supermercadobelalcazar.com/funciones/codificacionProductos.php",
        {
          id: solicitudSeleccionada.id,
          accion,
        }
      );

      if (response.data.success) {
        addNotification("success", "Solicitud rechazada correctamente.");
        setView("listar");
        fetchData(busqueda, estado, page, false);
      } else {
        throw new Error(
          response.data.error || "Error al procesar la solicitud"
        );
      }
    } catch (error) {
      addNotification(
        "danger",
        error.message || "Error al rechazar la solicitud."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split(" ")[0];
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const isFormInvalido = () => {
    if (loading) return true;

    if (
      login === "Luz Marina" &&
      solicitudSeleccionada.estado === "En revision"
    ) {
      const validaciones = solicitudSeleccionada.productos.some((producto) => {
        // 1. Validar portafolios para todos los productos
        const portafolios = (
          producto.portafoliosEditable ??
          (producto.portafolios?.split(",") || [])
        ).filter((p) => p !== "");

        // 2. Validar aprobación para TODOS los productos
        const aprobado = producto.aprobado_editable ?? producto.aprobado;

        return (
          portafolios.length === 0 || // Portafolios vacíos
          aprobado === null ||
          aprobado === undefined ||
          aprobado === "" // Estado no seleccionado
        );
      });

      // 3. Validar fecha de requerimiento
      const fechaInvalida =
        !solicitudSeleccionada.fecha_requerimiento?.trim() ||
        solicitudSeleccionada.fecha_requerimiento === "0000-00-00";

      return validaciones || fechaInvalida;
    }

    if (
      loginsCompradores.includes(login.toUpperCase()) &&
      solicitudSeleccionada.estado === "Generado"
    ) {
      const camposInvalidos = solicitudSeleccionada.productos.some(
        (producto) => {
          const portafolios = (
            producto.portafoliosEditable ??
            (producto.portafolios?.split(",") || [])
          ).filter((p) => p !== "");

          return portafolios.length === 0;
        }
      );

      const fechaInvalida =
        !solicitudSeleccionada.fecha_requerimiento?.trim() ||
        solicitudSeleccionada.fecha_requerimiento === "0000-00-00";

      return camposInvalidos || fechaInvalida;
    }

    if (
      login === "Codificador" &&
      solicitudSeleccionada.estado === "Aprobado"
    ) {
      const itemsValidos = solicitudSeleccionada.productos.every((producto) => {
        // Solo validar items si el producto está Aprobado
        if (producto.aprobado === "0") return true;
        return /^\d{6}$/.test(producto.item_asignado_editable);
      });

      const preciosValidos = solicitudSeleccionada.productos.every(
        (producto) => {
          // Solo validar precios si el producto está Aprobado
          if (producto.aprobado === "0") return true;
          const precio = parseFloat(
            producto.precio_venta_editable ?? producto.precio_venta
          );
          const costo = parseFloat(producto.costo_sin_iva);
          return precio > 0 && precio >= costo;
        }
      );

      const nombreInvalido = !solicitudSeleccionada.codificador?.trim();

      return !itemsValidos || !preciosValidos || nombreInvalido;
    }

    return false;
  };

  const generatePDF = async () => {
    const input = document.getElementById("pdf-content");
    const buttons = document.querySelectorAll(".no-print");

    // Oculta elementos que no deben aparecer en el PDF
    buttons.forEach((btn) => (btn.style.display = "none"));

    // Configuración de márgenes (en mm)
    const margin = {
      top: 15,
      right: 15,
      bottom: 15,
      left: 15,
      header: 10,
      footer: 10,
    };

    // Tamaño carta (letter) en mm (215.9 × 279.4 mm)
    const pageWidth = 215.9;
    const pageHeight = 279.4;

    // Crear el PDF aquí para que esté disponible en todo el ámbito
    const pdf = new jsPDF("p", "mm", "letter");

    try {
      // Configuración mejorada de html2canvas
      const canvas = await html2canvas(input, {
        scale: 2, // Aumenta la resolución
        logging: false,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        backgroundColor: "#ffffff",
        ignoreElements: (element) => {
          // Ignora elementos específicos que no deben aparecer
          return element.classList.contains("no-print");
        },
      });

      // Ancho disponible después de márgenes
      const contentWidth = pageWidth - margin.left - margin.right;

      // Calcula altura manteniendo relación de aspecto
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Altura disponible por página (considerando márgenes)
      const availablePageHeight =
        pageHeight - margin.top - margin.bottom - margin.header - margin.footer;

      // Verifica si necesita múltiples páginas
      if (imgHeight <= availablePageHeight) {
        // Contenido cabe en una sola página
        pdf.addImage(
          canvas,
          "PNG",
          margin.left,
          margin.top + margin.header,
          imgWidth,
          imgHeight
        );
      } else {
        // Contenido requiere múltiples páginas
        let position = 0;
        let remainingHeight = imgHeight;

        while (remainingHeight > 0) {
          const sectionHeight = Math.min(remainingHeight, availablePageHeight);

          // Crea un canvas temporal para cada sección
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = canvas.width;
          tempCanvas.height = sectionHeight * (canvas.width / imgWidth);

          const ctx = tempCanvas.getContext("2d");
          ctx.drawImage(
            canvas,
            0,
            position * (canvas.height / imgHeight),
            canvas.width,
            sectionHeight * (canvas.height / imgHeight),
            0,
            0,
            tempCanvas.width,
            tempCanvas.height
          );

          // Añade la sección al PDF
          if (position > 0) {
            pdf.addPage("letter");
          }

          pdf.addImage(
            tempCanvas,
            "PNG",
            margin.left,
            margin.top + margin.header,
            imgWidth,
            sectionHeight
          );

          position += sectionHeight;
          remainingHeight -= availablePageHeight;
        }
      }

      // Añade encabezado y pie de página a todas las páginas
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);

        // Encabezado
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(
          `Solicitud ${solicitudSeleccionada?.codigo_barras || ""}`,
          margin.left,
          margin.top
        );

        // Pie de página
        pdf.text(
          `Página ${i} de ${pageCount}`,
          pageWidth - margin.right - 30,
          pageHeight - margin.footer + 5
        );
      }

      // Guarda el PDF
      pdf.save(
        `Codificacion_Barras_${
          solicitudSeleccionada?.codigo_barras || "detalle"
        }.pdf`
      );
      addNotification("success", "PDF generado correctamente.");
    } catch (error) {
      addNotification("danger", "Error al generar el PDF.");
    } finally {
      // Restaura los elementos ocultos
      buttons.forEach((btn) => (btn.style.display = ""));
    }
  };

  const handleImageClick = (imageUrl, title, type) => {
    setSelectedImage({
      url: imageUrl,
      title: title,
      type: type,
    });
    setModalOpen(true);
  };

  const ImageModal = () => (
    <div
      className={`${styles.modalOverlay} ${modalOpen ? styles.show : ""}`}
      onClick={() => setModalOpen(false)}
    >
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            <FontAwesomeIcon
              icon={
                selectedImage.type === "reverso" ? faExchangeAlt : faLineChart
              }
              className={styles.modalIcon}
            />
            {selectedImage.title}
          </h3>
          <button
            className={styles.closeButton}
            onClick={() => setModalOpen(false)}
            aria-label="Cerrar modal"
          >
            &times;
          </button>
        </div>
        <div className={styles.imageWrapper}>
          <img
            src={selectedImage.url}
            alt="Imagen ampliada"
            className={styles.modalImage}
          />
        </div>
        <div className={styles.modalFooter}>
          <button
            className={styles.downloadButton}
            onClick={() => {
              window.open(selectedImage.url, "_blank");
            }}
          >
            <FontAwesomeIcon icon={faDownload} /> Descargar
          </button>
        </div>
      </div>
    </div>
  );

  const handleDownload = (url) => {
    if (isDownloading) return; // Evita múltiples clics

    setIsDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = url.split("/").pop() || "archivo_adjunto";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      addNotification("danger", "Error al descargar el archivo.");
    } finally {
      setIsDownloading(false);
    }
  };

  const formatPercentage = (value, maxPercentage = 100) => {
    if (!value && value !== 0) return "";

    // Si ya es un string con %, devolverlo tal cual
    if (typeof value === "string" && value.endsWith("%")) {
      return value;
    }

    const stringValue = value.toString();
    const cleanValue = stringValue.replace(/[^0-9.]/g, "");

    if (!cleanValue) return "";

    const number = parseFloat(cleanValue);

    if (isNaN(number)) return "";

    const clampedValue = Math.min(maxPercentage, Math.max(0, number));
    const hasDecimals = clampedValue % 1 !== 0;

    return hasDecimals
      ? `${clampedValue.toFixed(2).replace(".", ",")}%`
      : `${clampedValue}%`;
  };

  const parseInputCurrency = (value) => {
    // Eliminar símbolos de moneda, comas (como separadores de miles) y espacios
    let parsedValue = value.replace(/[^0-9,]/g, "");

    // Reemplazar comas decimales por puntos
    parsedValue = parsedValue.replace(",", ".");

    // Eliminar puntos que sean separadores de miles
    parsedValue = parsedValue.replace(/\.(?=\d{3,}$)/g, "");

    // Convertir a número flotante
    const number = parseFloat(parsedValue);

    return isNaN(number) ? 0 : number;
  };

  const handleProcesar = (solicitud) => {
    // Crear una copia de la solicitud y reiniciar observaciones
    const solicitudProcesar = {
      ...solicitud,
      productos: solicitud.productos.map((p) => ({
        ...p,
        portafoliosEditable: (p.portafolios?.split(",") || []).filter(
          (p) => p !== ""
        ),
        item_asignado_editable: p.item_asignado || "",
      })),
      fecha_requerimiento:
        solicitud.fecha_requerimiento === "0000-00-00"
          ? ""
          : solicitud.fecha_requerimiento,
      observacionesOriginales: solicitud.observaciones,
      observaciones: "",
    };
    setSolicitudSeleccionada(solicitudProcesar);
    setView("procesar");
  };

  // Función para formatear porcentaje (solo visualización)
  const formatPercentageDisplay = (value) => {
    if (value === null || value === undefined || value === "") return "";
    const number = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(number)) return "";
    const clampedValue = Math.min(100, Math.max(0, number));
    return (
      clampedValue.toLocaleString("es-CO", { maximumFractionDigits: 2 }) + "%"
    );
  };

  // Función para formatear moneda (solo visualización)
  const formatCurrencyDisplay = (value) => {
    if (value === null || value === undefined || value === "") return "";
    const number = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(number)) return "";
    return "$" + number.toLocaleString("es-CO", { maximumFractionDigits: 2 });
  };

  const handleOpenTraceability = async (solicitudId) => {
    try {
      setTraceabilityModalOpen(true); // Abrir el modal inmediatamente
      const response = await axios.get(
        "https://aplicativo.supermercadobelalcazar.com/funciones/codificacionProductos.php",
        {
          params: {
            action: "get_trazabilidad",
            id: solicitudId,
          },
        }
      );

      if (response.data.success) {
        setTraceabilityData(response.data.trazabilidad);
      } else {
        addNotification(
          "warning",
          "No se encontró trazabilidad para esta solicitud."
        );
      }
    } catch (error) {
      addNotification("danger", "Error al obtener la trazabilidad.");
      setTraceabilityModalOpen(false);
    }
  };

  const TraceabilityModal = ({
    traceabilityData,
    traceabilityModalOpen,
    setTraceabilityModalOpen,
  }) => {
    const formatDateTime = (dateString) => {
      if (!dateString) return "Fecha no disponible";
      const options = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString("es-CO", options);
    };

    return (
      <div
        className={`${styles.modalOverlay} ${
          traceabilityModalOpen ? styles.show : ""
        }`}
        onClick={() => setTraceabilityModalOpen(false)}
      >
        <div
          className={styles.modalContainer}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>
              <FontAwesomeIcon icon={faHistory} className={styles.modalIcon} />
              Historial de Estados
            </h3>
            <button
              className={styles.closeButton}
              onClick={() => setTraceabilityModalOpen(false)}
            >
              &times;
            </button>
          </div>

          <div className={styles.traceabilityContent}>
            <div className={styles.timeline}>
              {traceabilityData.map((item, index) => (
                <div key={index} className={styles.timelineItem}>
                  <div className={styles.timelineDot}></div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>
                      <span className={styles.timelineDate}>
                        {item.fecha_formateada}
                      </span>
                      <div className={styles.stateTransition}>
                        <span className={styles.stateBadge}>
                          {item.estado_anterior || "N/A"}
                        </span>
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className={styles.arrowIcon}
                        />
                        <span
                          className={`${styles.stateBadge} ${
                            styles[item.estado_nuevo.toLowerCase()]
                          }`}
                        >
                          {item.estado_nuevo}
                        </span>
                      </div>
                    </div>

                    <div className={styles.timelineBody}>
                      {(item.comentarios || item.observaciones) && (
                        <div className={styles.commentsSection}>
                          <h5>Detalles del cambio:</h5>
                          {item.comentarios && <p>{item.comentarios}</p>}
                          {item.observaciones && (
                            <p className={styles.observaciones}>
                              <strong>Observaciones:</strong>{" "}
                              {item.observaciones}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("es-CO", options);
  };

  if (loading) {
    return <LoadingScreen />;
  } else {
    return (
      <div className="container">
        {view === "listar" && (
          <>
            <h2 className="text-center mb-4">
              Listado de codificación de productos
            </h2>
            <div className="alert alert-info mt-4">
              <h4>Información importante</h4>
              <ul className="mb-0">
                <li>
                  1. En esta pantalla podrá visualizar y gestionar las
                  solicitudes de codificación de productos.
                </li>
                <li>
                  2. En la tabla inferior podrá ver un resumen de las
                  solicitudes, haga clic en la lupa para ver los detalles
                  completos.
                </li>
                <li>
                  3. Las solicitudes pueden ser corregidas un máximo de 3 veces
                  si se requiere.
                </li>
              </ul>
            </div>

            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
              <form
                className="d-flex flex-grow-1 me-md-3"
                onSubmit={handleSearch}
              >
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por ID, NIT, código de barras o descripción..."
                    value={busqueda}
                    onChange={(e) => {
                      setBusqueda(e.target.value);
                      setPage(1);
                    }}
                  />
                  <button className="btn btn-primary" type="submit">
                    <FontAwesomeIcon icon={faSearch} className="me-2" />
                    Buscar
                  </button>
                </div>
              </form>

              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center">
                  <label
                    htmlFor="estado-select"
                    className="form-label mb-0 me-2"
                  >
                    Estado:
                  </label>
                  <select
                    id="estado-select"
                    className="form-select"
                    value={estado}
                    onChange={(e) => {
                      setEstado(e.target.value);
                      setPage(1);
                    }}
                    style={{ minWidth: "120px" }}
                  >
                    <option value="Todos">Todos</option>
                    {login !== "Luz Marina" && login !== "Codificador" && (
                      <option value="Generado">Generado</option>
                    )}
                    {login !== "Codificador" && (
                      <option value="En revision">En revisión</option>
                    )}
                    <option value="Aprobado">Aprobado</option>
                    {login !== "Luz Marina" && login !== "Codificador" && (
                      <option value="Rechazado">Rechazado</option>
                    )}
                    {login !== "Luz Marina" && (
                      <option value="Codificado">Codificado</option>
                    )}
                    {login !== "Luz Marina" && login !== "Codificador" && (
                      <option value="Corregir">Corregir</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">ID</th>
                    <th scope="col">Fecha Creación</th>
                    <th scope="col">Nit</th>
                    <th scope="col">Productos</th>
                    <th scope="col">Códigos de Barras</th>
                    <th scope="col">Descripciones</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Fecha de Requerimiento</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.length > 0 ? (
                    solicitudes.map((solicitud, index) => (
                      <tr
                        key={solicitud.id}
                        className={
                          solicitud.estado === "En revision"
                            ? "table-warning"
                            : solicitud.estado === "Aprobado"
                            ? "table-primary"
                            : solicitud.estado === "Codificado"
                            ? "table-success"
                            : solicitud.estado === "Rechazado" ||
                              solicitud.estado === "Corregir"
                            ? "table-danger"
                            : ""
                        }
                      >
                        <td>{(page - 1) * 10 + index + 1}</td>
                        <td>{solicitud.id}</td>
                        <td>{formatDate(solicitud.fecha_solicitud)}</td>
                        <td>{solicitud.nit}</td>
                        <td className="text-center">
                          <span className="badge bg-primary rounded-pill">
                            {solicitud.total_productos || 0}
                          </span>
                        </td>
                        <td className="font-monospace">
                          {solicitud.productos
                            ?.map((p) => p.codigo_barras)
                            .join(", ") || "N/A"}
                        </td>
                        <td>
                          <div
                            className="text-truncate"
                            style={{ maxWidth: "200px" }}
                            title={solicitud.productos
                              ?.map((p) => p.descripcion)
                              .join(", ")}
                          >
                            {solicitud.productos
                              ?.map((p) => p.descripcion)
                              .join(", ") || "N/A"}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill ${
                              solicitud.estado === "En revision"
                                ? "bg-warning text-dark"
                                : solicitud.estado === "Aprobado"
                                ? "bg-primary"
                                : solicitud.estado === "Codificado"
                                ? "bg-success"
                                : solicitud.estado === "Rechazado"
                                ? "bg-danger"
                                : solicitud.estado === "Corregir"
                                ? "bg-danger"
                                : "bg-secondary"
                            }`}
                          >
                            {solicitud.estado}
                          </span>
                        </td>
                        <td>{solicitud.fecha_requerimiento}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleVerMas(solicitud)}
                            title="Ver detalles"
                          >
                            <FontAwesomeIcon icon={faSearch} />
                            <span className="visually-hidden">
                              Ver detalles
                            </span>
                          </button>
                          <button
                            className="btn btn-sm btn-info ms-2"
                            onClick={() => handleOpenTraceability(solicitud.id)}
                            title="Ver trazabilidad"
                          >
                            <FontAwesomeIcon icon={faHistory} />
                          </button>
                          {((loginsCompradores.includes(login.toUpperCase()) &&
                            solicitud.estado === "Generado") ||
                            (login === "Luz Marina" &&
                              solicitud.estado === "En revision") ||
                            (login === "Codificador" &&
                              solicitud.estado === "Aprobado")) && (
                            <button
                              className="btn btn-sm btn-warning ms-2"
                              onClick={() => handleProcesar(solicitud)}
                              title="Procesar solicitud"
                            >
                              <FontAwesomeIcon icon={faPencilAlt} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center py-4">
                        <div className="text-muted">
                          No se encontraron solicitudes con los filtros actuales
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {hasMoreUsers && solicitudes.length > 0 && (
                <nav className="d-flex justify-content-center">
                  <ul className="pagination">
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      >
                        Anterior
                      </button>
                    </li>

                    {Array.from(
                      { length: Math.ceil(total / 10) },
                      (_, i) => i + 1
                    ).map((pageNumber) => (
                      <li
                        key={pageNumber}
                        className={`page-item ${
                          page === pageNumber ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    ))}

                    <li
                      className={`page-item ${!hasMoreUsers ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={!hasMoreUsers}
                      >
                        Siguiente
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </>
        )}

        {view === "detalle" && solicitudSeleccionada && (
          <div className={styles.container}>
            {/* Botón flotante para generar PDF */}
            <button
              onClick={generatePDF}
              className={styles.floatingPdfButton}
              title="Generar PDF"
            >
              <FontAwesomeIcon icon={faFilePdf} size="1.5x" />
            </button>
            <div id="pdf-content">
              {/* FORMULARIO DE SOLO LECTURA */}
              <div className={styles.formContainer}>
                <h2 className={styles.title}>
                  Detalle de la Solicitud de Codificación de Producto/s
                </h2>
                <form className={styles.form} style={{ cursor: "not-allowed" }}>
                  {/* ENCABEZADO */}
                  <div className={styles.section}>
                    <div className={styles.header}>
                      <img
                        src={logo}
                        alt="Logo Empresa"
                        className={styles.logo}
                      />
                      <div className={styles.companyInfo}>
                        <h1>Abastecemos de Occidente S.A.S</h1>
                        <p>NIT: 900123456-7</p>
                        <p>Dirección: Cra. 5 # 5-48, Yumbo, Valle del Cauca</p>
                      </div>
                      <div className={styles.verticalLine}></div>
                      <div className={styles.providerInfo}>
                        <p>
                          <strong>Fecha de la Solicitud:</strong>{" "}
                          {formatDate(solicitudSeleccionada.fecha_solicitud)}
                        </p>
                        <p>
                          <strong>NIT Proveedor:</strong>{" "}
                          {solicitudSeleccionada.nit}
                        </p>
                        <p>
                          <strong>Correo Proveedor:</strong>{" "}
                          {solicitudSeleccionada.email_notificacion}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      solicitudSeleccionada.estado === "Aprobado"
                        ? `${styles.statusBar} ${styles.success}`
                        : solicitudSeleccionada.estado === "Rechazado"
                        ? `${styles.statusBar} ${styles.error}`
                        : solicitudSeleccionada.estado === "Corregir"
                        ? `${styles.statusBar} ${styles.warning}`
                        : `${styles.statusBar} ${styles.revision}`
                    }
                  >
                    Estado de la solicitud:{" "}
                    {solicitudSeleccionada.estado || "Error al cargar"}
                  </div>
                  {solicitudSeleccionada.observaciones && (
                    <div className={`${styles.statusBar} ${styles.warning}`}>
                      Observaciones de correción:{" "}
                      {solicitudSeleccionada.observaciones || "Error al cargar"}
                    </div>
                  )}

                  <div className={styles.infoBoxEnhanced}>
                    <div className={styles.infoHeader}>
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className={styles.infoIcon}
                      />
                      <p style={{ marginBottom: "0", marginTop: "0" }}>
                        Comprador*:
                        <select
                          style={{
                            marginLeft: "10px",
                            borderRadius: "10px",
                            padding: "5px",
                          }}
                          name="comprador"
                          value={solicitudSeleccionada.comprador || ""}
                          disabled="true"
                          readOnly
                          className={styles.readOnlyInput}
                        >
                          <option value="">Seleccione...</option>
                          <option value="ANDREA">ANDREA</option>
                          <option value="CLAUDIA">CLAUDIA</option>
                          <option value="JAVID">JAVID</option>
                          <option value="JAZMIN">JAZMIN</option>
                          <option value="JEFFERSON">JEFFERSON</option>
                          <option value="LORENA">LORENA</option>
                          <option value="POLLO">POLLO</option>
                        </select>
                      </p>
                    </div>
                  </div>

                  {/* Iteración por cada producto */}
                  {solicitudSeleccionada.productos.map((producto, index) => (
                    <div key={index} className={styles.section}>
                      <h3>Producto {index + 1}</h3>
                      <div className={styles.tableResponsive}>
                        <table className={styles.productTable}>
                          <thead>
                            <tr>
                              <th colSpan="7">Información Básica</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Fila 1: Información Básica */}
                            <tr>
                              <td colSpan="1">
                                <label>Código de barras*</label>
                                <input
                                  value={producto.codigo_barras}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>Referencia Interna</label>
                                <input
                                  value={producto.referencia_proveedor}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="2">
                                <label>Descripción del producto*</label>
                                <input
                                  value={producto.descripcion}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>Marca*</label>
                                <input
                                  value={producto.marca}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>Gramaje*</label>
                                <input
                                  value={producto.gramaje}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>Embalaje*</label>
                                <input
                                  value={producto.embalaje}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                            </tr>

                            {/* Fila 2: Información Financiera */}
                            <tr>
                              <td colSpan="1">
                                <label>Costo sin IVA*</label>
                                <input
                                  value={formatCurrency(producto.costo_sin_iva)}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>IVA</label>
                                <input
                                  value={
                                    producto.iva ? `${producto.iva}%` : "N/A"
                                  }
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>ICUI</label>
                                <input
                                  value={formatCurrency(producto.icui)}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>IBUA</label>
                                <input
                                  value={formatCurrency(producto.ibua)}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>IPO</label>
                                <input
                                  value={formatCurrency(producto.ipo)}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>Pie Factura 1</label>
                                <input
                                  value={
                                    producto.pie_factura1
                                      ? `${producto.pie_factura1}%`
                                      : "N/A"
                                  }
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>Pie Factura 2</label>
                                <input
                                  value={
                                    producto.pie_factura2
                                      ? `${producto.pie_factura2}%`
                                      : "N/A"
                                  }
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                            </tr>

                            {/* Fila 3: Tipo de Codificación */}
                            <tr>
                              <td colSpan="7">
                                <label>Tipo de codificación*</label>
                                <div className={styles.itemTypeContainer}>
                                  <div className={styles.itemType}>
                                    <label>
                                      <input
                                        type="checkbox"
                                        checked={producto.item_modifica === "1"}
                                        disabled={true}
                                        readOnly
                                        className={styles.readOnlyInput}
                                      />{" "}
                                      Modifica
                                    </label>
                                    <label>
                                      <input
                                        type="checkbox"
                                        checked={producto.item_nuevo === "1"}
                                        disabled={true}
                                        readOnly
                                        className={styles.readOnlyInput}
                                      />{" "}
                                      Nuevo
                                    </label>
                                  </div>
                                  <div className={styles.infoBoxEnhanced}>
                                    <div className={styles.infoHeader}>
                                      <ul className={styles.infoList}>
                                        <li>
                                          <strong>Modifica:</strong> Actualiza
                                          información de un producto existente
                                        </li>
                                        <li>
                                          <strong>Nuevo:</strong> Producto que
                                          no existe actualmente en nuestros
                                          sistemas
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  {producto.item_modifica === "1" && (
                                    <div className={styles.inputGroup}>
                                      <label>Item Reemplaza*</label>
                                      <input
                                        value={
                                          producto.item_reemplaza ||
                                          "No asignado"
                                        }
                                        disabled={true}
                                        readOnly
                                        className={styles.readOnlyInput}
                                      />
                                    </div>
                                  )}
                                  <div className={styles.aprobacionContainer}>
                                    <label>Estado del Producto*</label>
                                    <select
                                      value={producto.aprobado || ""}
                                      disabled={true}
                                      readOnly
                                      className={styles.readOnlyInput}
                                    >
                                      <option value="">Sin definir</option>
                                      <option value="1">Aprobado</option>
                                      <option value="0">Rechazado</option>
                                    </select>
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Fila 4: Portafolios */}
                            <tr>
                              <td colSpan="7" className={styles.highlightRow}>
                                <label>Portafolios*</label>
                                <div className={styles.portafoliosContainer}>
                                  {[
                                    "B1",
                                    "B2",
                                    "B4",
                                    "B5",
                                    "B6",
                                    "B7",
                                    "B8",
                                    "B9",
                                    "B10",
                                    "B11",
                                    "B12",
                                  ].map((portafolio) => (
                                    <div
                                      key={portafolio}
                                      className={styles.checkboxItem}
                                    >
                                      <input
                                        type="checkbox"
                                        id={`portafolio-${portafolio}`}
                                        checked={
                                          producto.portafolios?.includes(
                                            portafolio
                                          ) || false
                                        }
                                        disabled={true}
                                        readOnly
                                        className={styles.readOnly}
                                      />
                                      <label
                                        htmlFor={`portafolio-${portafolio}`}
                                      >
                                        {portafolio}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>

                            {/* Fila 5: Precio de venta e item asignado */}
                            <tr>
                              <td colSpan="7" className={styles.highlightRow}>
                                <div className={styles.processingRow}>
                                  <div className={styles.inputGroup}>
                                    <label>Precio de Venta</label>
                                    <input
                                      value={
                                        formatCurrency(producto.precio_venta) ||
                                        "No asignado"
                                      }
                                      disabled={true}
                                      readOnly
                                      className={styles.readOnlyInput}
                                    />
                                  </div>

                                  <div className={styles.inputGroup}>
                                    <label>Item asignado</label>
                                    <input
                                      value={
                                        producto.item_asignado || "No asignado"
                                      }
                                      disabled={true}
                                      readOnly
                                      className={styles.readOnlyInput}
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Fila 6: Fotos del Producto */}
                            <tr>
                              <td colSpan="7">
                                <label>Fotos del Producto*</label>
                                <div className={styles.imageUploadRow}>
                                  <div className={styles.imageContainerRow}>
                                    <label>Reverso</label>
                                    <img
                                      src={producto.foto_reverso || reverso}
                                      alt="Reverso"
                                      className={styles.productImage}
                                      onClick={() =>
                                        handleImageClick(
                                          producto.foto_reverso,
                                          "Reverso",
                                          "reverso"
                                        )
                                      }
                                    />
                                  </div>
                                  <div className={styles.imageContainerRow}>
                                    <label>Anverso</label>
                                    <img
                                      src={producto.foto_anverso || anverso}
                                      alt="Anverso"
                                      className={styles.productImage}
                                      onClick={() =>
                                        handleImageClick(
                                          producto.foto_anverso,
                                          "Anverso",
                                          "anverso"
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Fila 5: Archivos Adjuntos */}
                            {producto.archivo_adjunto && (
                              <td colSpan="7">
                                <label>Archivo adjunto</label>
                                <div className={styles.downloadFile}>
                                  <button
                                    className={styles.downloadButton}
                                    onClick={() =>
                                      handleDownload(producto.archivo_adjunto)
                                    }
                                  >
                                    <FontAwesomeIcon icon={faDownload} />{" "}
                                    Descargar Adjuntos
                                  </button>
                                </div>
                              </td>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}

                  <div className={styles.section}>
                    <h3>Otros Datos</h3>
                    <div className={styles.highlightRow}>
                      <div className={styles.processingRow}>
                        {/* Contenedor padre con grid */}
                        <div className={styles.processingRow}>
                          {/* Grupo Fecha Requerimiento */}
                          <div className={styles.inputGroup}>
                            <label>Fecha Requerimiento</label>
                            <input
                              type="date"
                              value={
                                solicitudSeleccionada.fecha_requerimiento ===
                                "0000-00-00"
                                  ? ""
                                  : solicitudSeleccionada.fecha_requerimiento
                              }
                              disabled={true}
                              onChange={(e) =>
                                setSolicitudSeleccionada((prev) => ({
                                  ...prev,
                                  fecha_requerimiento: e.target.value,
                                }))
                              }
                              className={styles.uniformInput}
                            />
                          </div>

                          {/* Grupo Recomendaciones */}
                          <div className={styles.inputGroup}>
                            <label>Recomendaciones</label>
                            <textarea
                              value={
                                solicitudSeleccionada.recomendaciones || ""
                              }
                              disabled={true}
                              onChange={(e) =>
                                setSolicitudSeleccionada((prev) => ({
                                  ...prev,
                                  recomendaciones: e.target.value,
                                }))
                              }
                              className={styles.uniformInput}
                              rows="3"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Botón para volver */}
            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => handleCancel()}
              >
                Volver
              </button>
            </div>
          </div>
        )}

        {view === "procesar" && solicitudSeleccionada && (
          <div className={styles.container}>
            <div id="pdf-content">
              <div className={styles.formContainer}>
                <h2 className={styles.title}>Procesamiento de Solicitud</h2>
                <form className={styles.form}>
                  {/* ENCABEZADO */}
                  <div className={styles.section}>
                    <div className={styles.header}>
                      <img
                        src={logo}
                        alt="Logo Empresa"
                        className={styles.logo}
                      />
                      <div className={styles.companyInfo}>
                        <h1>Abastecemos de Occidente S.A.S</h1>
                        <p>NIT: 900123456-7</p>
                        <p>Dirección: Cra. 5 # 5-48, Yumbo, Valle del Cauca</p>
                      </div>
                      <div className={styles.verticalLine}></div>
                      <div className={styles.providerInfo}>
                        <p>
                          <strong>Fecha de la Solicitud:</strong>{" "}
                          {formatDate(solicitudSeleccionada.fecha_solicitud)}
                        </p>
                        <p>
                          <strong>NIT Proveedor:</strong>{" "}
                          {solicitudSeleccionada.nit}
                        </p>
                        <p>
                          <strong>Correo Proveedor:</strong>{" "}
                          {solicitudSeleccionada.email_notificacion}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      solicitudSeleccionada.estado === "Aprobado"
                        ? `${styles.statusBar} ${styles.success}`
                        : solicitudSeleccionada.estado === "Rechazado"
                        ? `${styles.statusBar} ${styles.error}`
                        : solicitudSeleccionada.estado === "Corregir"
                        ? `${styles.statusBar} ${styles.warning}`
                        : `${styles.statusBar} ${styles.revision}`
                    }
                  >
                    Estado de la solicitud:{" "}
                    {solicitudSeleccionada.estado || "Error al cargar"}
                  </div>
                  {solicitudSeleccionada.observacionesOriginales && (
                    <div className={`${styles.statusBar} ${styles.warning}`}>
                      Observaciones de correción:{" "}
                      {solicitudSeleccionada.observacionesOriginales ||
                        "Error al cargar"}
                    </div>
                  )}
                  <div className={styles.infoBoxEnhanced}>
                    <div className={styles.infoHeader}>
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className={styles.infoIcon}
                      />
                      <h4 style={{ fontSize: "smaller" }}>
                        Los campos con el * son obligatorios
                      </h4>
                    </div>
                  </div>

                  <br />

                  <div className={styles.infoBoxEnhanced}>
                    <div className={styles.infoHeader}>
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        className={styles.infoIcon}
                      />
                      <p style={{ marginBottom: "0", marginTop: "0" }}>
                        Comprador*:
                        <select
                          style={{
                            marginLeft: "10px",
                            borderRadius: "10px",
                            padding: "5px",
                          }}
                          name="comprador"
                          value={solicitudSeleccionada.comprador || ""}
                          disabled="true"
                          readOnly
                          className={styles.readOnlyInput}
                        >
                          <option value="">Seleccione...</option>
                          <option value="ANDREA">ANDREA</option>
                          <option value="CLAUDIA">CLAUDIA</option>
                          <option value="JAVID">JAVID</option>
                          <option value="JAZMIN">JAZMIN</option>
                          <option value="JEFFERSON">JEFFERSON</option>
                          <option value="LORENA">LORENA</option>
                          <option value="POLLO">POLLO</option>
                        </select>
                      </p>
                    </div>
                  </div>

                  {/* Iteración por cada producto */}
                  {solicitudSeleccionada.productos.map((producto, index) => (
                    <div key={index} className={styles.section}>
                      <h3>Producto {index + 1}</h3>
                      <div className={styles.tableResponsive}>
                        <table className={styles.productTable}>
                          <thead>
                            <tr>
                              <th colSpan="7">Información Básica</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Fila 1: Información Básica */}
                            <tr>
                              <td colSpan="1">
                                <label>Código de barras*</label>
                                <input
                                  value={producto.codigo_barras}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>Referencia Interna</label>
                                <input
                                  value={producto.referencia_proveedor}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="2">
                                <label>Descripción del producto*</label>
                                <input
                                  value={producto.descripcion}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>Marca*</label>
                                <input
                                  value={producto.marca}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>Gramaje*</label>
                                <input
                                  value={producto.gramaje}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>Embalaje*</label>
                                <input
                                  value={producto.embalaje}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                            </tr>

                            {/* Fila 2: Información Financiera */}
                            <tr>
                              <td colSpan="1">
                                <label>Costo sin IVA*</label>
                                <input
                                  value={formatCurrency(producto.costo_sin_iva)}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>IVA</label>
                                <input
                                  value={
                                    producto.iva ? `${producto.iva}%` : "N/A"
                                  }
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>ICUI</label>
                                <input
                                  value={formatCurrency(producto.icui)}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>IBUA</label>
                                <input
                                  value={formatCurrency(producto.ibua)}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>IPO</label>
                                <input
                                  value={formatCurrency(producto.ipo)}
                                  disabled={true}
                                  readOnly
                                  className={styles.readOnlyInput}
                                />
                              </td>
                              <td colSpan="1">
                                <label>Pie Factura 1</label>
                                <input
                                  value={
                                    focusedField ===
                                    `${producto.id}-pie_factura1`
                                      ? producto.pie_factura1_editable ??
                                        producto.pie_factura1
                                      : formatPercentageDisplay(
                                          producto.pie_factura1_editable ??
                                            producto.pie_factura1
                                        )
                                  }
                                  onChange={(e) => {
                                    const rawValue = e.target.value.replace(
                                      /[^0-9.,]/g,
                                      ""
                                    );
                                    const normalizedValue = rawValue.replace(
                                      /,/g,
                                      "."
                                    );
                                    const numberValue =
                                      parseFloat(normalizedValue);
                                    const clampedValue = Math.min(
                                      100,
                                      Math.max(0, numberValue)
                                    );
                                    setSolicitudSeleccionada((prev) => ({
                                      ...prev,
                                      productos: prev.productos.map((p) =>
                                        p.id === producto.id
                                          ? {
                                              ...p,
                                              pie_factura1_editable: isNaN(
                                                clampedValue
                                              )
                                                ? ""
                                                : clampedValue,
                                            }
                                          : p
                                      ),
                                    }));
                                  }}
                                  disabled={
                                    !loginsCompradores.includes(
                                      login.toUpperCase()
                                    )
                                  }
                                  className={
                                    loginsCompradores.includes(
                                      login.toUpperCase()
                                    )
                                      ? styles.highlightRow
                                      : ""
                                  }
                                  onFocus={() =>
                                    setFocusedField(
                                      `${producto.id}-pie_factura1`
                                    )
                                  }
                                  onBlur={() => setFocusedField(null)}
                                />
                              </td>
                              <td colSpan="1">
                                <label>Pie Factura 2</label>
                                <input
                                  value={
                                    focusedField ===
                                    `${producto.id}-pie_factura2`
                                      ? producto.pie_factura2_editable ??
                                        producto.pie_factura2
                                      : formatPercentageDisplay(
                                          producto.pie_factura2_editable ??
                                            producto.pie_factura2
                                        )
                                  }
                                  onChange={(e) => {
                                    const rawValue = e.target.value.replace(
                                      /[^0-9.,]/g,
                                      ""
                                    );
                                    const normalizedValue = rawValue.replace(
                                      /,/g,
                                      "."
                                    );
                                    const numberValue =
                                      parseFloat(normalizedValue);
                                    const clampedValue = Math.min(
                                      100,
                                      Math.max(0, numberValue)
                                    );
                                    setSolicitudSeleccionada((prev) => ({
                                      ...prev,
                                      productos: prev.productos.map((p) =>
                                        p.id === producto.id
                                          ? {
                                              ...p,
                                              pie_factura2_editable: isNaN(
                                                clampedValue
                                              )
                                                ? ""
                                                : clampedValue,
                                            }
                                          : p
                                      ),
                                    }));
                                  }}
                                  disabled={
                                    !loginsCompradores.includes(
                                      login.toUpperCase()
                                    )
                                  }
                                  className={
                                    loginsCompradores.includes(
                                      login.toUpperCase()
                                    )
                                      ? styles.highlightRow
                                      : ""
                                  }
                                  onFocus={() =>
                                    setFocusedField(
                                      `${producto.id}-pie_factura1`
                                    )
                                  }
                                  onBlur={() => setFocusedField(null)}
                                />
                              </td>
                            </tr>

                            {/* Fila 3: Tipo de Codificación */}
                            <tr>
                              <td colSpan="7">
                                <label>Tipo de codificación*</label>
                                <div className={styles.itemTypeContainer}>
                                  <div className={styles.itemType}>
                                    <label>
                                      <input
                                        type="checkbox"
                                        checked={producto.item_modifica === "1"}
                                        disabled={true}
                                        readOnly
                                        className={styles.readOnlyInput}
                                      />{" "}
                                      Modifica
                                    </label>
                                    <label>
                                      <input
                                        type="checkbox"
                                        checked={producto.item_nuevo === "1"}
                                        disabled={true}
                                        readOnly
                                        className={styles.readOnlyInput}
                                      />{" "}
                                      Nuevo
                                    </label>
                                  </div>
                                  <div className={styles.infoBoxEnhanced}>
                                    <div className={styles.infoHeader}>
                                      <ul className={styles.infoList}>
                                        <li>
                                          <strong>Modifica:</strong> Actualiza
                                          información de un producto existente
                                        </li>
                                        <li>
                                          <strong>Nuevo:</strong> Producto que
                                          no existe actualmente en nuestros
                                          sistemas
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  {producto.item_modifica === "1" && (
                                    <div className={styles.inputGroup}>
                                      <label>Item Reemplaza*</label>
                                      <input
                                        value={
                                          producto.item_reemplaza ||
                                          "No asignado"
                                        }
                                        disabled={true}
                                        readOnly
                                        className={styles.readOnlyInput}
                                      />
                                    </div>
                                  )}
                                  {/* Aprobar o rechazar items */}
                                  {login === "Luz Marina" &&
                                    solicitudSeleccionada.estado ===
                                      "En revision" && (
                                      <div
                                        className={styles.aprobacionContainer}
                                      >
                                        <label>Estado del Producto*</label>
                                        <select
                                          value={
                                            producto.aprobado_editable ??
                                            producto.aprobado ??
                                            ""
                                          }
                                          onChange={(e) => {
                                            const aprobado = parseInt(
                                              e.target.value
                                            );
                                            setSolicitudSeleccionada(
                                              (prev) => ({
                                                ...prev,
                                                productos: prev.productos.map(
                                                  (p) =>
                                                    p.id === producto.id
                                                      ? {
                                                          ...p,
                                                          aprobado_editable:
                                                            aprobado,
                                                        }
                                                      : p
                                                ),
                                              })
                                            );
                                          }}
                                          className={styles.selectAprobacion}
                                        >
                                          <option value="">
                                            Seleccione...
                                          </option>
                                          <option value="1">Aprobado</option>
                                          <option value="0">Rechazado</option>
                                        </select>
                                      </div>
                                    )}
                                  {login === "Codificador" &&
                                    solicitudSeleccionada.estado ===
                                      "Aprobado" && (
                                      <div
                                        className={styles.aprobacionContainer}
                                      >
                                        <label>Estado del Producto*</label>
                                        <select
                                          value={producto.aprobado || ""}
                                          disabled={true}
                                          readOnly
                                          className={styles.readOnlyInput}
                                        >
                                          <option value="">Sin definir</option>
                                          <option value="1">Aprobado</option>
                                          <option value="0">Rechazado</option>
                                        </select>
                                      </div>
                                    )}
                                </div>
                              </td>
                            </tr>

                            {/* Fila 4: Portafolios*/}
                            <tr>
                              <td colSpan="7" className={styles.highlightRow}>
                                <label>Portafolios*</label>
                                <div className={styles.portafoliosContainer}>
                                  {[
                                    "B1",
                                    "B2",
                                    "B4",
                                    "B5",
                                    "B6",
                                    "B7",
                                    "B8",
                                    "B9",
                                    "B10",
                                    "B11",
                                    "B12",
                                  ].map((portafolio) => {
                                    const portafoliosArray =
                                      producto.portafoliosEditable ||
                                      (typeof producto.portafolios === "string"
                                        ? producto.portafolios.split(",")
                                        : []);

                                    return (
                                      <div
                                        key={portafolio}
                                        className={styles.checkboxItem}
                                      >
                                        <input
                                          type="checkbox"
                                          id={`portafolio-${producto.id}-${portafolio}`}
                                          checked={portafoliosArray.includes(
                                            portafolio
                                          )}
                                          disabled={login === "Codificador"}
                                          onChange={(e) => {
                                            const newPortafolios = e.target
                                              .checked
                                              ? [
                                                  ...portafoliosArray,
                                                  portafolio,
                                                ]
                                              : portafoliosArray.filter(
                                                  (p) => p !== portafolio
                                                );

                                            setSolicitudSeleccionada(
                                              (prev) => ({
                                                ...prev,
                                                productos: prev.productos.map(
                                                  (p) =>
                                                    p.id === producto.id
                                                      ? {
                                                          ...p,
                                                          portafoliosEditable:
                                                            newPortafolios,
                                                        }
                                                      : p
                                                ),
                                              })
                                            );
                                          }}
                                        />
                                        <label
                                          htmlFor={`portafolio-${producto.id}-${portafolio}`}
                                        >
                                          {portafolio}
                                        </label>
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>

                            {/* Fila 5: Precio de venta e item asignado */}
                            <tr>
                              <td colSpan="7" className={styles.highlightRow}>
                                <div className={styles.inputGroup}>
                                  <label>Precio de Venta</label>
                                  <input
                                    value={
                                      focusedField ===
                                      `${producto.id}-precio_venta`
                                        ? producto.precio_venta_editable ??
                                          producto.precio_venta
                                        : formatCurrencyDisplay(
                                            producto.precio_venta_editable ??
                                              producto.precio_venta
                                          )
                                    }
                                    onChange={(e) => {
                                      const rawValue = e.target.value.replace(
                                        /[^0-9.,]/g,
                                        ""
                                      );
                                      const normalizedValue = rawValue.replace(
                                        /,/g,
                                        "."
                                      );
                                      const numberValue =
                                        parseFloat(normalizedValue);
                                      setSolicitudSeleccionada((prev) => ({
                                        ...prev,
                                        productos: prev.productos.map((p) =>
                                          p.id === producto.id
                                            ? {
                                                ...p,
                                                precio_venta_editable: isNaN(
                                                  numberValue
                                                )
                                                  ? ""
                                                  : numberValue,
                                              }
                                            : p
                                        ),
                                      }));
                                    }}
                                    onFocus={() =>
                                      setFocusedField(
                                        `${producto.id}-precio_venta`
                                      )
                                    }
                                    onBlur={() => setFocusedField(null)}
                                    disabled={
                                      login === "Codificador" &&
                                      producto.aprobado === "0"
                                    }
                                    className={
                                      producto.aprobado === "1"
                                        ? styles.requiredField
                                        : ""
                                    }
                                  />
                                </div>
                                <div className={styles.inputGroup}>
                                  <label>Item asignado</label>
                                  <input
                                    value={
                                      producto.item_asignado_editable || ""
                                    }
                                    onChange={(e) => {
                                      const valor = e.target.value.replace(
                                        /\D/g,
                                        ""
                                      );
                                      const item = valor.slice(0, 6);
                                      setSolicitudSeleccionada((prev) => ({
                                        ...prev,
                                        productos: prev.productos.map((p) =>
                                          p.id === producto.id
                                            ? {
                                                ...p,
                                                item_asignado_editable: item,
                                              }
                                            : p
                                        ),
                                      }));
                                    }}
                                    disabled={
                                      login !== "Codificador" ||
                                      (login === "Codificador" &&
                                        producto.aprobado === "0")
                                    }
                                    maxLength={6}
                                    className={`${
                                      producto.aprobado === "1"
                                        ? styles.requiredField
                                        : ""
                                    } ${
                                      login === "Codificador"
                                        ? styles.highlightRow
                                        : ""
                                    }`}
                                  />
                                </div>
                              </td>
                            </tr>

                            {/* Fila 6: Fotos del Producto */}
                            <tr>
                              <td colSpan="7">
                                <label>Fotos del Producto*</label>
                                <div className={styles.imageUploadRow}>
                                  <div className={styles.imageContainerRow}>
                                    <label>Reverso</label>
                                    <img
                                      src={producto.foto_reverso || reverso}
                                      alt="Reverso"
                                      className={styles.productImage}
                                      onClick={() =>
                                        handleImageClick(
                                          producto.foto_reverso,
                                          "Reverso",
                                          "reverso"
                                        )
                                      }
                                    />
                                  </div>
                                  <div className={styles.imageContainerRow}>
                                    <label>Anverso</label>
                                    <img
                                      src={producto.foto_anverso || anverso}
                                      alt="Anverso"
                                      className={styles.productImage}
                                      onClick={() =>
                                        handleImageClick(
                                          producto.foto_anverso,
                                          "Anverso",
                                          "anverso"
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Fila 5: Archivos Adjuntos */}
                            {producto.archivo_adjunto && (
                              <td colSpan="7">
                                <label>Archivo adjunto</label>
                                <div className={styles.downloadFile}>
                                  <button
                                    className={styles.downloadButton}
                                    onClick={() =>
                                      handleDownload(producto.archivo_adjunto)
                                    }
                                  >
                                    <FontAwesomeIcon icon={faDownload} />{" "}
                                    Descargar Adjuntos
                                  </button>
                                </div>
                              </td>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}

                  <div className={styles.section}>
                    <h3>Otros Datos</h3>
                    <div className={styles.highlightRow}>
                      <div className={styles.processingRow}>
                        <div className={styles.inputGroup}>
                          <label>Fecha de Requerimiento*</label>
                          <input
                            type="date"
                            value={
                              solicitudSeleccionada.fecha_requerimiento || ""
                            }
                            disabled={login === "Codificador"}
                            onChange={(e) =>
                              setSolicitudSeleccionada((prev) => ({
                                ...prev,
                                fecha_requerimiento: e.target.value,
                              }))
                            }
                            className={styles.uniformInput}
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Recomendaciones</label>
                          <textarea
                            value={solicitudSeleccionada.recomendaciones || ""}
                            disabled={login === "Codificador"}
                            onChange={(e) =>
                              setSolicitudSeleccionada((prev) => ({
                                ...prev,
                                recomendaciones: e.target.value,
                              }))
                            }
                            className={styles.uniformInput}
                          />
                        </div>
                        {login === "Codificador" && (
                          <div className={styles.inputGroup}>
                            <label>Nombre del Codificador*</label>
                            <input
                              value={solicitudSeleccionada.codificador || ""}
                              onChange={(e) =>
                                setSolicitudSeleccionada((prev) => ({
                                  ...prev,
                                  codificador: e.target.value,
                                }))
                              }
                              className={`${styles.requiredField} ${styles.uniformInput}`}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sección Archivos Adjuntos */}
                  {solicitudSeleccionada.archivo_adjunto && (
                    <div className={styles.section}>
                      <h3>Archivos Adjuntos</h3>
                      <div className={styles.infoBoxEnhanced}>
                        <div className={styles.infoHeader}>
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className={styles.infoIcon}
                          />
                          <h4 style={{ fontSize: "large" }}>
                            Requisitos anexos indispensables, si su producto es
                            para consumo humano
                          </h4>
                        </div>
                        <br />
                        Los siguientes requisitos deben estar comprimidos en un
                        solo archivo <strong>.zip</strong>
                        <ul className={styles.infoList}>
                          <br />
                          <li>
                            <strong>
                              A: Concepto sanitario del fabricante.
                            </strong>
                          </li>
                          <li>
                            <strong>
                              B: Ficha/s tecnica/s de el/los producto/s.
                            </strong>
                          </li>
                          <li>
                            <strong>
                              C: Registro, permiso o notificación sanitario de
                              el/los producto/s según aplique.
                            </strong>
                          </li>
                        </ul>
                      </div>
                      <div className={styles.downloadFile}>
                        <button
                          type="button"
                          className={styles.downloadButton}
                          onClick={() =>
                            handleDownload(
                              solicitudSeleccionada.archivo_adjunto
                            )
                          }
                        >
                          <FontAwesomeIcon icon={faDownload} /> Descargar
                          Archivo Adjunto
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sección Devolver para Correcion */}
                  {loginsCompradores.includes(login.toUpperCase()) && (
                    <div className={styles.section}>
                      <h3>Devolver Solicitud al Proveedor</h3>
                      <div className={styles.devolverContainer}>
                        <button
                          type="button"
                          className={styles.btnDanger}
                          disabled={!solicitudSeleccionada?.observaciones}
                          onClick={async () => {
                            try {
                              setIsLoading(true);
                              // Validar máximo 3 correcciones
                              const responseValidation = await axios.get(
                                "https://aplicativo.supermercadobelalcazar.com/funciones/codificacionProductos.php",
                                {
                                  params: {
                                    action: "validar-correcciones",
                                    id: solicitudSeleccionada.id,
                                  },
                                }
                              );

                              if (responseValidation.data.cantidad >= 3) {
                                addNotification(
                                  "danger",
                                  "Límite de 3 correcciones alcanzado."
                                );
                                setIsLoading(false);
                                return;
                              }

                              // Enviar corrección
                              const response = await axios.put(
                                "https://aplicativo.supermercadobelalcazar.com/funciones/codificacionProductos.php",
                                {
                                  id: solicitudSeleccionada.id,
                                  accion: "devolver-correccion",
                                  observaciones:
                                    solicitudSeleccionada.observaciones,
                                }
                              );

                              if (response.data.success) {
                                setView("listar");
                                fetchData();
                                addNotification(
                                  "success",
                                  "Solicitud devuelta para corrección."
                                );
                                setIsLoading(false);
                              }
                            } catch (error) {
                              addNotification(
                                "danger",
                                error.response?.data?.error ||
                                  "Error al procesar."
                              );
                              setIsLoading(false);
                            }
                          }}
                        >
                          Devolver para corrección
                        </button>
                        <textarea
                          value={solicitudSeleccionada?.observaciones || ""}
                          onChange={(e) =>
                            setSolicitudSeleccionada((prev) => ({
                              ...prev,
                              observaciones: e.target.value,
                            }))
                          }
                          placeholder="Observaciones*"
                          className={`${styles.requiredField} ${styles.observacionesInput}`}
                          rows="4"
                        />
                      </div>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className={styles.buttonGroup}>
                    <button
                      type="button"
                      className={styles.btnDanger}
                      onClick={handleRechazar}
                      disabled={loading}
                    >
                      {loading ? "Procesando..." : "Rechazar"}
                    </button>
                    <button
                      type="button"
                      className={styles.btnSuccess}
                      onClick={handleAprobar}
                      disabled={isFormInvalido()}
                    >
                      {loading
                        ? "Procesando..."
                        : loginsCompradores.includes(login.toUpperCase()) &&
                          solicitudSeleccionada.estado === "Generado"
                        ? "Enviar por Aprobar"
                        : login === "Luz Marina" &&
                          solicitudSeleccionada.estado === "En revision"
                        ? "Enviar por Codificar"
                        : login === "Codificador" &&
                          solicitudSeleccionada.estado === "Aprobado"
                        ? "Terminar Codificación"
                        : "Enviar"}
                    </button>
                    <button
                      type="button"
                      className={styles.btnCancel}
                      onClick={() => setView("listar")}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        <ImageModal />
        <TraceabilityModal
          traceabilityData={traceabilityData}
          traceabilityModalOpen={traceabilityModalOpen}
          setTraceabilityModalOpen={setTraceabilityModalOpen}
        />
      </div>
    );
  }
}

export default CodificacionProductosAB;
