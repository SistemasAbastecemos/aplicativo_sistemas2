import React, { useEffect, useState, useRef } from "react";
import { useNotification } from "../../../contexts/NotificationContext";
import { useAuth } from "../../../contexts/AuthContext";
import { apiService } from "../../../services/api";
import LoadingScreen from "../../UI/LoadingScreen";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import imageCompression from "browser-image-compression";
import ModalImagen from "./ModalImagen";
import ModalTrazabilidad from "./ModalTrazabilidad";
import logo from "../../../assets/images/logo.png";
import reverso from "../../../assets/images/reverso.png";
import anverso from "../../../assets/images/anverso.png";
import styles from "./CodificacionProductos.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolderOpen,
  faSearch,
  faDownload,
  faExchangeAlt,
  faLineChart,
  faInfoCircle,
  faPencilAlt,
  faTrashAlt,
  faHistory,
  faArrowRight,
  faFilePdf,
  faChevronLeft,
  faPlus,
  faCheckCircle,
  faTimesCircle,
  faExclamationCircle,
  faClock,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

function CodificacionProductos({}) {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [cargando, setCargando] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [estado, setEstado] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [view, setView] = useState("listar");
  const [imagePreview, setImagePreview] = useState({
    reverso: "",
    anverso: "",
  });
  const [imageUrl, setImageUrl] = useState({ reverso: "", anverso: "" });
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [editingSolicitud, setEditingSolicitud] = useState(null);
  const [traceabilityData, setTraceabilityData] = useState([]);

  // Referencia para el contenido del PDF
  const pdfContentRef = useRef();

  // Estados para modales
  const [ModalImagenOpen, setModalImagenOpen] = useState(false);
  const [ModalTrazabilidadOpen, setModalTrazabilidadOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const fetchData = async (
    search = "",
    estado = "Todos",
    page = 1,
    showNotifications = true
  ) => {
    try {
      setCargando(true);

      const response = await apiService.getSolicitudesCodificacionProductos(
        search,
        estado,
        page,
        user.nit
      );

      if (response.success && response.solicitudes) {
        setSolicitudes(response.solicitudes);
        setHasMoreUsers(response.hasMore);

        if (showNotifications && response.solicitudes.length <= 0) {
          addNotification({
            message: "No hay solicitudes por mostrar",
            type: "warning",
          });
        }
      }
    } catch (error) {
      if (showNotifications) {
        addNotification({
          message: "Error al cargar las solicitudes.",
          type: "error",
        });
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const timer = setTimeout(() => {
      fetchData(busqueda, estado, page, user.nit, true);
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [busqueda, estado, page, user.nit]);

  const handlePageChange = (newPage) => {
    if (newPage > 0) {
      setPage(newPage);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleViewChange = (newView) => {
    resetForm();
    setView(newView);
  };

  const handleVerMas = async (solicitud) => {
    try {
      setCargando(true);

      // Obtener los datos completos de la solicitud
      const response = await apiService.getSolicitudCodificacionProductos(
        solicitud.id,
        user.nit
      );

      if (response.success && response.solicitud) {
        setSolicitudSeleccionada(response.solicitud);
        setView("detalle");
      } else {
        addNotification({
          message: "Error al cargar los detalles de la solicitud",
          type: "error",
        });
      }
    } catch (error) {
      addNotification({
        message:
          "Error al cargar los detalles de la solicitud: " + error.message,
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const resetForm = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData({
      fecha: fecha,
      nit: user.nit,
      email: user.email,
      comprador: "",
      productos: [
        {
          codigoBarras: "",
          referenciaInterna: "",
          descripcion: "",
          marca: "",
          gramaje: "",
          embalaje: "",
          iva: "",
          icui: "",
          ibua: "",
          ipo: "",
          costoSinIVA: "",
          pieFactura1: "",
          pieFactura2: "",
          itemReemplaza: "",
          item: { modifica: false, nuevo: false },
          fotos: { reverso: null, anverso: null },
          imagePreview: { reverso: "", anverso: "" },
          archivoAdjunto: null,
          nombreArchivo: "",
          archivoValido: true,
        },
      ],
    });
    setImagePreview({ reverso: "", anverso: "" });
    setImageUrl({ reverso: "", anverso: "" });
  };

  // Nueva solicitud

  const [fecha, setFecha] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    return today;
  });

  const [formData, setFormData] = useState({
    fecha: fecha,
    nit: user.nit,
    email: user.email,
    comprador: "",
    productos: [
      {
        codigoBarras: "",
        referenciaInterna: "",
        descripcion: "",
        marca: "",
        gramaje: "",
        embalaje: "",
        iva: "",
        icui: "",
        ibua: "",
        ipo: "",
        costoSinIVA: "",
        pieFactura1: "",
        pieFactura2: "",
        itemReemplaza: "",
        item: { modifica: false, nuevo: false },
        fotos: { reverso: null, anverso: null },
        imagePreview: { reverso: "", anverso: "" },
        archivoAdjunto: null,
        nombreArchivo: "",
        archivoValido: true,
      },
    ],
  });

  // Agregar un nuevo producto
  const agregarProducto = () => {
    setFormData((prev) => ({
      ...prev,
      productos: [
        ...prev.productos,
        {
          codigoBarras: "",
          referenciaInterna: "",
          descripcion: "",
          marca: "",
          gramaje: "",
          embalaje: "",
          iva: "",
          icui: "",
          ibua: "",
          ipo: "",
          costoSinIVA: "",
          pieFactura1: "",
          pieFactura2: "",
          item: { modifica: false, nuevo: false },
          fotos: { reverso: null, anverso: null },
          imagePreview: { reverso: "", anverso: "" },
          archivoAdjunto: null,
          nombreArchivo: "",
          archivoValido: true,
        },
      ],
    }));
  };

  // Eliminar un producto
  const eliminarProducto = (index) => {
    if (formData.productos.length <= 1) return;

    setFormData((prev) => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index),
    }));
  };

  // Manejar cambios en los campos de producto
  const handleProductoChange = (index, e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const nuevosProductos = [...prev.productos];

      if (name === "itemReemplaza") {
        nuevosProductos[index][name] = value.replace(/\D/g, "").slice(0, 6);
      } else {
        if (type === "checkbox" && (name === "modifica" || name === "nuevo")) {
          // Manejar correctamente los checkboxes
          nuevosProductos[index].item = {
            modifica: name === "modifica" ? checked : false,
            nuevo: name === "nuevo" ? checked : false,
          };
        } else {
          const fieldsToUpperCase = [
            "descripcion",
            "marca",
            "gramaje",
            "embalaje",
          ];
          const processedValue = fieldsToUpperCase.includes(name)
            ? value.toUpperCase()
            : value;

          nuevosProductos[index][name] = processedValue;
        }
      }

      return {
        ...prev,
        productos: nuevosProductos,
      };
    });
  };

  // Manejar campos numéricos de productos
  const handleProductoNumericInput = (index, e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const nuevosProductos = [...prev.productos];

      // Solo procesar si el valor realmente cambió
      if (value !== nuevosProductos[index][name]) {
        if (
          name === "icui" ||
          name === "ibua" ||
          name === "ipo" ||
          name === "costoSinIVA"
        ) {
          const cleanValue = value.replace(/[^0-9,.]/g, "").replace(/,/g, "."); // Convertir comas a puntos
          nuevosProductos[index][name] = cleanValue;
        } else if (
          name === "iva" ||
          name === "pieFactura1" ||
          name === "pieFactura2"
        ) {
          // Para porcentajes, validar que no supere 100 mientras se escribe
          const cleanValue = value.replace(/[^0-9.,]/g, "").replace(/,/g, "."); // Convertir comas a puntos

          // Asegurar máximo un punto decimal
          const parts = cleanValue.split(".");
          if (parts.length > 2) return prev; // Invalidar múltiples puntos

          nuevosProductos[index][name] = parts.slice(0, 2).join(".");

          if (cleanValue) {
            const numericValue = parseFloat(cleanValue);
            if (!isNaN(numericValue)) {
              nuevosProductos[index][name] = Math.min(
                100,
                numericValue
              ).toString();
            } else {
              nuevosProductos[index][name] = "";
            }
          } else {
            nuevosProductos[index][name] = "";
          }
        } else {
          nuevosProductos[index][name] = value.replace(/[^0-9.]/g, "");
        }
      }

      return { ...prev, productos: nuevosProductos };
    });
  };

  const handleProductoImageChange = async (index, event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Opciones de compresión
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      // 1. Comprimir imagen -> devuelve un Blob
      const compressedBlob = await imageCompression(file, options);

      // 2. Convertir el Blob de vuelta a File, con el mismo nombre y tipo
      const compressedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type,
        lastModified: Date.now(),
      });

      // 3. Generar URL para preview
      const previewUrl = URL.createObjectURL(compressedFile);

      // 4. Actualizar estado: guardo el File comprimido y la URL de previsualización
      setFormData((prev) => {
        const nuevosProductos = [...prev.productos];
        nuevosProductos[index] = {
          ...nuevosProductos[index],
          fotos: {
            ...nuevosProductos[index].fotos,
            [type]: compressedFile,
          },
          imagePreview: {
            ...nuevosProductos[index].imagePreview,
            [type]: previewUrl,
          },
        };
        return { ...prev, productos: nuevosProductos };
      });
    } catch (error) {
      addNotification({
        message: "Error al procesar la imagen.",
        type: "error",
      });
    }
  };

  const handleProductoFileChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validaciones (tipo y tamaño)
    const archivoValido =
      file.name.match(/\.(rar|zip)$/i) && file.size <= 5 * 1024 * 1024;

    setFormData((prev) => {
      const nuevosProductos = [...prev.productos];
      nuevosProductos[index] = {
        ...nuevosProductos[index],
        archivoAdjunto: file,
        nombreArchivo: file.name,
        archivoValido,
      };
      return { ...prev, productos: nuevosProductos };
    });
  };

  // Manejar blur en campos de productos
  const handleProductoBlur = (index, e) => {
    const { name, value } = e.target;

    // Si el campo está vacío, no hacer nada
    if (!value && value !== 0) return;

    setFormData((prev) => {
      const nuevosProductos = [...prev.productos];

      // Verificar si el valor ya está formateado
      const isAlreadyFormatted =
        typeof value === "string" &&
        (value.includes("$") || value.includes("%"));

      // Si ya está formateado, no volver a formatear
      if (isAlreadyFormatted) {
        return prev;
      }

      switch (name) {
        case "iva":
        case "pieFactura1":
        case "pieFactura2":
          let percentageValue = parseFloat(value.replace(",", ".")) || 0;
          if (!isNaN(percentageValue)) {
            percentageValue = Math.min(100, Math.max(0, percentageValue));
            nuevosProductos[index][name] = `${percentageValue
              .toFixed(2)
              .replace(".", ",")}%`;
          } else {
            nuevosProductos[index][name] = "";
          }
          break;
        case "icui":
        case "ibua":
        case "ipo":
        case "costoSinIVA":
          const numericValue = parseFloat(value.replace(",", ".")) || 0;
          if (!isNaN(numericValue)) {
            nuevosProductos[index][name] = new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(numericValue);
          } else {
            nuevosProductos[index][name] = "";
          }
          break;
        default:
          break;
      }
      return { ...prev, productos: nuevosProductos };
    });
  };

  const handleProductoFocus = (index, e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const nuevosProductos = [...prev.productos];

      // Solo limpiar el formato si el valor está formateado
      if (typeof value === "string") {
        switch (name) {
          case "iva":
          case "pieFactura1":
          case "pieFactura2":
            if (value.includes("%")) {
              nuevosProductos[index][name] = cleanPercentageFormat(value);
            }
            break;
          case "icui":
          case "ibua":
          case "ipo":
          case "costoSinIVA":
            if (value.includes("$")) {
              nuevosProductos[index][name] = cleanCurrencyFormat(value);
            }
            break;
          default:
            break;
        }
      }

      return { ...prev, productos: nuevosProductos };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "modifica" || name === "nuevo") {
        // Solo permite un checkbox seleccionado a la vez
        setFormData((prev) => ({
          ...prev,
          item: {
            modifica: name === "modifica",
            nuevo: name === "nuevo",
          },
        }));
      }
    } else {
      // Resto del manejo de otros inputs
      const fieldsToUpperCase = ["descripcion", "marca", "gramaje", "embalaje"];
      const processedValue = fieldsToUpperCase.includes(name)
        ? value.toUpperCase()
        : value;

      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }
  };

  const handleNewSolicitud = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    let archivosSubidos = [];

    if (!isFormValid()) {
      addNotification({
        message:
          "Por favor complete todos los campos requeridos correctamente para todos los productos.",
        type: "warning",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Subir imágenes para cada producto
      const productosConImagenesYAdjuntos = await Promise.all(
        formData.productos.map(async (producto) => {
          const uploadedFiles = {
            reverso: null,
            anverso: null,
          };

          // Subir imágenes
          for (const type of ["reverso", "anverso"]) {
            if (producto.fotos[type]) {
              const formDataImage = new FormData();
              formDataImage.append("file", producto.fotos[type]);

              const response = await apiService.uploadImage(formDataImage);

              if (!response.success || !response.url) {
                throw new Error(`Error al subir la imagen ${type}`);
              }

              uploadedFiles[type] = response.url;
              archivosSubidos.push({ url: response.url });
            }
          }

          // Subir archivo adjunto del producto si existe
          let archivoAdjuntoUrl = null;
          if (producto.archivoAdjunto) {
            const formDataFile = new FormData();
            formDataFile.append("file", producto.archivoAdjunto);

            const responseFile = await apiService.uploadFile(formDataFile);

            if (!responseFile.success || !responseFile.url) {
              throw new Error("Error al subir el archivo adjunto del producto");
            }
            archivoAdjuntoUrl = responseFile.url;
            archivosSubidos.push({ url: responseFile.url });
          }

          return {
            ...producto,
            foto_reverso: uploadedFiles.reverso,
            foto_anverso: uploadedFiles.anverso,
            costoSinIVA: formatCurrencyToNumber(producto.costoSinIVA),
            icui: formatCurrencyToNumber(producto.icui),
            ibua: formatCurrencyToNumber(producto.ibua),
            ipo: formatCurrencyToNumber(producto.ipo),
            item_reemplaza: producto.itemReemplaza,
            item: {
              modifica: producto.item.modifica ? "1" : "0",
              nuevo: producto.item.nuevo ? "1" : "0",
            },
            archivoAdjunto: archivoAdjuntoUrl,
          };
        })
      );

      // Preparar los datos para enviar
      const dataToSend = {
        ...formData,
        productos: productosConImagenesYAdjuntos,
      };

      // Enviar los datos
      const response = await apiService.createSolicitudCodificacionProductos(
        dataToSend
      );

      if (response.success) {
        addNotification({
          message: "Solicitud enviada correctamente.",
          type: "success",
        });

        resetForm();
        setView("listar");
        await fetchData(busqueda, estado, page, user.nit, false);
      } else {
        const errorMsg =
          response.error ||
          "La solicitud se completó pero hubo un problema con la respuesta del servidor";
        addNotification({
          message: errorMsg,
          type: "warning",
        });
      }
    } catch (error) {
      let errorMessage = "Error al enviar la solicitud";

      if (archivosSubidos.length > 0) {
        try {
          await apiService.deleteUploads(archivosSubidos);
        } catch (cleanupError) {
          console.error("Error limpiando archivos temporales:", cleanupError);
        }
      }

      if (error.response) {
        errorMessage =
          error.response.error ||
          `Error del servidor: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No se recibió respuesta del servidor";
      } else {
        errorMessage = error.message || "Error al configurar la solicitud";
      }

      addNotification({
        message: errorMessage,
        type: "warning",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCorregir = async (solicitud) => {
    try {
      setCargando(true);

      // Obtener los datos completos de la solicitud (igual que en handleVerMas)
      const response = await apiService.getSolicitudCodificacionProductos(
        solicitud.id,
        user.nit
      );

      if (response.success && response.solicitud) {
        setSolicitudSeleccionada(response.solicitud);
        cargarDatosParaCorreccion(response.solicitud);
        setView("correccion");
      } else {
        addNotification({
          message:
            "Error al cargar los detalles de la solicitud para corrección",
          type: "error",
        });
      }
    } catch (error) {
      addNotification({
        message:
          "Error al cargar los detalles de la solicitud: " + error.message,
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const cargarDatosParaCorreccion = (solicitud) => {
    const productosFormateados = solicitud.productos.map((producto) => {
      // Convertir correctamente los valores de checkboxes
      const itemModifica =
        producto.item_modifica === "1" ||
        producto.item_modifica === 1 ||
        producto.item_modifica === true;
      const itemNuevo =
        producto.item_nuevo === "1" ||
        producto.item_nuevo === 1 ||
        producto.item_nuevo === true;

      // Formatear valores financieros
      const formatFinancialValue = (value, type = "currency") => {
        if (!value && value !== 0) return "";

        if (type === "percentage") {
          // Si ya tiene formato de porcentaje, mantenerlo
          if (typeof value === "string" && value.includes("%")) return value;
          // Si es número, formatearlo
          const numValue = parseFloat(value);
          return isNaN(numValue) ? "" : `${numValue}%`;
        }

        if (type === "currency") {
          // Si ya tiene formato de moneda, mantenerlo
          if (
            typeof value === "string" &&
            (value.includes("$") || value.includes(","))
          )
            return value;
          // Si es número, formatearlo
          const numValue = parseFloat(value);
          return isNaN(numValue)
            ? ""
            : new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 2,
              }).format(numValue);
        }

        return value;
      };

      const productoFormateado = {
        codigoBarras: producto.codigo_barras || "",
        referenciaInterna: producto.referencia_proveedor || "",
        descripcion: producto.descripcion || "",
        marca: producto.marca || "",
        gramaje: producto.gramaje || "",
        embalaje: producto.embalaje || "",
        // Valores financieros formateados
        iva: formatFinancialValue(producto.iva, "percentage"),
        icui: formatFinancialValue(producto.icui, "currency"),
        ibua: formatFinancialValue(producto.ibua, "currency"),
        ipo: formatFinancialValue(producto.ipo, "currency"),
        costoSinIVA: formatFinancialValue(producto.costo_sin_iva, "currency"),
        pieFactura1: formatFinancialValue(producto.pie_factura1, "percentage"),
        pieFactura2: formatFinancialValue(producto.pie_factura2, "percentage"),
        precioVenta: producto.precio_venta || "",
        itemAsignado: producto.item_asignado || "",
        itemReemplaza: producto.item_reemplaza || "",
        // Archivo adjunto como string (URL)
        archivoAdjunto: producto.archivo_adjunto || null,
        // Checkboxes con valores booleanos correctos
        item: {
          modifica: itemModifica,
          nuevo: itemNuevo,
        },
        fotos: {
          reverso: null,
          anverso: null,
        },
        // ImagePreview con las URLs reales
        imagePreview: {
          reverso: producto.foto_reverso || "",
          anverso: producto.foto_anverso || "",
        },
        originalUrls: {
          reverso: producto.foto_reverso || "",
          anverso: producto.foto_anverso || "",
          archivo: producto.archivo_adjunto || "",
        },
        nombreArchivo: producto.archivo_adjunto
          ? producto.archivo_adjunto.split("/").pop()
          : "",
        archivoValido: true,
      };
      return productoFormateado;
    });

    const formDataActualizado = {
      fecha: solicitud.fecha_solicitud,
      nit: solicitud.nit,
      email: solicitud.email_notificacion,
      comprador: solicitud.comprador,
      productos: productosFormateados,
      id: solicitud.id,
    };
    setFormData(formDataActualizado);
  };

  const handleEnviarCorreccion = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isFormValid()) {
      addNotification({
        message: "Por favor complete todos los campos requeridos correctamente",
        type: "warning",
      });
      setIsLoading(false);
      return;
    }

    let archivosSubidos = [];
    let archivosParaEliminar = []; // Archivos antiguos a eliminar

    try {
      const productosActualizados = await Promise.all(
        formData.productos.map(async (producto) => {
          // Recolectar archivos antiguos que serán reemplazados
          const archivosAntiguos = [];

          let nuevaUrlReverso = producto.originalUrls?.reverso;
          let nuevaUrlAnverso = producto.originalUrls?.anverso;
          let nuevoArchivoUrl = producto.originalUrls?.archivo;

          // Subir reverso si es nuevo
          if (producto.fotos.reverso instanceof File) {
            // Si hay una imagen antigua, agregarla a la lista de eliminación
            if (producto.originalUrls?.reverso) {
              archivosAntiguos.push({ url: producto.originalUrls.reverso });
            }

            const formDataImage = new FormData();
            formDataImage.append("file", producto.fotos.reverso);
            const response = await apiService.uploadImage(formDataImage);
            if (response.success && response.url) {
              nuevaUrlReverso = response.url;
              archivosSubidos.push({ url: response.url });
            }
          }

          // Subir anverso si es nuevo
          if (producto.fotos.anverso instanceof File) {
            // Si hay una imagen antigua, agregarla a la lista de eliminación
            if (producto.originalUrls?.anverso) {
              archivosAntiguos.push({ url: producto.originalUrls.anverso });
            }

            const formDataImage = new FormData();
            formDataImage.append("file", producto.fotos.anverso);
            const response = await apiService.uploadImage(formDataImage);
            if (response.success && response.url) {
              nuevaUrlAnverso = response.url;
              archivosSubidos.push({ url: response.url });
            }
          }

          // Subir archivo adjunto si es nuevo
          if (producto.archivoAdjunto instanceof File) {
            // Si hay un archivo adjunto antiguo, agregarlo a la lista de eliminación
            if (producto.originalUrls?.archivo) {
              archivosAntiguos.push({ url: producto.originalUrls.archivo });
            }

            const formDataFile = new FormData();
            formDataFile.append("file", producto.archivoAdjunto);
            const response = await apiService.uploadFile(formDataFile);
            if (response.success && response.url) {
              nuevoArchivoUrl = response.url;
              archivosSubidos.push({ url: response.url });
            }
          }

          // Agregar archivos antiguos a la lista general de eliminación
          if (archivosAntiguos.length > 0) {
            archivosParaEliminar.push(...archivosAntiguos);
          }

          return {
            ...producto,
            foto_reverso: nuevaUrlReverso,
            foto_anverso: nuevaUrlAnverso,
            costoSinIVA: formatCurrencyToNumber(producto.costoSinIVA),
            icui: formatCurrencyToNumber(producto.icui),
            ibua: formatCurrencyToNumber(producto.ibua),
            ipo: formatCurrencyToNumber(producto.ipo),
            item_reemplaza: producto.itemReemplaza,
            item: {
              modifica: producto.item.modifica ? "1" : "0",
              nuevo: producto.item.nuevo ? "1" : "0",
            },
            archivo_adjunto: nuevoArchivoUrl,
          };
        })
      );

      // Preparar datos finales
      const dataToSend = {
        ...formData,
        productos: productosActualizados,
      };

      // Enviar actualización usando el nuevo endpoint
      const response = await apiService.updateSolicitudCodificacionProductos(
        dataToSend
      );

      if (response.success) {
        // Eliminar archivos antiguos del servidor
        if (archivosParaEliminar.length > 0) {
          try {
            await apiService.deleteUploads(archivosParaEliminar);
            console.log("Archivos antiguos eliminados:", archivosParaEliminar);
          } catch (error) {
            console.error("Error eliminando archivos antiguos:", error);
            // No interrumpir el flujo si falla la eliminación de archivos antiguos
          }
        }

        addNotification({
          message: "Corrección enviada exitosamente.",
          type: "success",
        });
        setView("listar");
        await fetchData(busqueda, estado, page, user.nit, false);
      } else {
        // Si falla la actualización, eliminar archivos subidos
        if (archivosSubidos.length > 0) {
          try {
            await apiService.deleteUploads(archivosSubidos);
          } catch (cleanupError) {
            console.error("Error limpiando archivos temporales:", cleanupError);
          }
        }
        addNotification({
          message: response.error || "Error al enviar la corrección",
          type: "warning",
        });
      }
    } catch (error) {
      // Si hay error, eliminar archivos subidos
      if (archivosSubidos.length > 0) {
        try {
          await apiService.deleteUploads(archivosSubidos);
        } catch (cleanupError) {
          console.error("Error limpiando archivos temporales:", cleanupError);
        }
      }
      addNotification({
        message: "Error al enviar corrección: " + error.message,
        type: "warning",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1, // Tamaño máximo de la imagen en MB
      maxWidthOrHeight: 1024, // Máxima resolución
      useWebWorker: true, // Usa un Web Worker para no bloquear la UI
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      addNotification({
        message: "Error al comprimir las imagenes.",
        type: "warning",
      });
    }
  };

  const handleImageChange = async (event, type) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const compressedFile = await compressImage(file); // Comprimir la imagen
        const url = URL.createObjectURL(compressedFile); // Crear URL de la imagen comprimida

        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview((prev) => ({ ...prev, [type]: reader.result }));
        };
        reader.readAsDataURL(compressedFile);

        setImageUrl((prev) => ({ ...prev, [type]: url }));
        setFormData((prev) => ({
          ...prev,
          fotos: {
            ...prev.fotos,
            [type]: compressedFile,
          },
        }));
      } catch (error) {
        addNotification({
          message: "Error al manejar las imagenes.",
          type: "error",
        });
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    // Si no hay archivo seleccionado
    if (!file) {
      setFormData((prev) => ({
        ...prev,
        archivoAdjunto: null,
        nombreArchivo: "",
        archivoValido: true, // Sin archivo es válido
      }));
      return;
    }

    // Validar tipo de archivo
    if (!file.name.match(/\.(rar|zip)$/i)) {
      addNotification({
        message: "Solo se permiten archivos .rar o .zip.",
        type: "warning",
      });
      setFormData((prev) => ({
        ...prev,
        archivoAdjunto: null,
        nombreArchivo: "",
        archivoValido: false,
      }));
      return;
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const archivoValido = file.size <= maxSize;

    setFormData((prev) => ({
      ...prev,
      archivoAdjunto: file,
      nombreArchivo: file.name,
      archivoValido,
    }));

    if (!archivoValido) {
      addNotification({
        message: "El archivo no debe exceder 5MB.",
        type: "warning",
      });
    }
  };

  const handleRemoveFile = async (index) => {
    const producto = formData.productos[index];

    // Si hay un archivo en el servidor, eliminarlo
    if (producto.originalUrls?.archivo) {
      try {
        await apiService.deleteUploads([
          { url: producto.originalUrls.archivo },
        ]);
        console.log(
          "Archivo adjunto eliminado del servidor:",
          producto.originalUrls.archivo
        );
      } catch (error) {
        console.error("Error eliminando archivo del servidor:", error);
        // Continuar con la eliminación local aunque falle en el servidor
      }
    }

    setFormData((prev) => {
      const nuevosProductos = [...prev.productos];
      nuevosProductos[index] = {
        ...nuevosProductos[index],
        archivoAdjunto: null,
        nombreArchivo: "",
        archivoValido: true,
        originalUrls: {
          ...nuevosProductos[index].originalUrls,
          archivo: null, // Limpiar también la URL original
        },
      };
      return { ...prev, productos: nuevosProductos };
    });
  };

  const handleNumericInput = (e) => {
    const { name, value } = e.target;

    // Permitir solo números y punto decimal para campos numéricos
    const numericValue = value.replace(/[^0-9.]/g, "");

    switch (name) {
      case "codigoBarras":
        if (!/^\d*$/.test(value)) return;
        setFormData((prev) => ({ ...prev, [name]: value }));
        break;

      case "iva":
      case "icui":
      case "ibua":
      case "ipo":
      case "pieFactura1": // Añadir pieFactura a los campos de porcentaje
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
        break;
      case "pieFactura2":
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
        break;
      case "costoSinIVA":
      default:
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case "iva":
      case "icui":
      case "ibua":
      case "ipo":
      case "pieFactura1":
        // Formatear porcentajes
        setFormData((prev) => ({
          ...prev,
          [name]: formatPercentage(value),
        }));
        break;
      case "pieFactura2":
        setFormData((prev) => ({
          [name]: formatPercentage(value),
        }));
        break;
      case "costoSinIVA":
      default:
        break;
    }
  };

  // Función para formatear IVA en porcentaje
  const formatPercentage = (value, maxPercentage = 100) => {
    if (!value && value !== 0) return "";

    // Si ya está formateado, devolverlo tal cual
    if (typeof value === "string" && value.includes("%")) {
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

  // Función para formatear moneda en COP
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "";

    // Si ya está formateado, devolverlo tal cual
    if (typeof value === "string" && value.includes("$")) {
      return value;
    }

    const numericValue = parseFloat(value);
    return isNaN(numericValue)
      ? ""
      : new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 2,
        }).format(numericValue);
  };

  const formatCurrencyToNumber = (value) => {
    if (!value) return 0;
    // Manejar diferentes formatos: "$1.000,00" o "1,000.00"
    const cleanValue = value
      .toString()
      .replace(/[^\d,.-]/g, "") // Eliminar símbolos no numéricos
      .replace(/\.(?=\d{3})/g, "") // Eliminar separadores de miles si existen
      .replace(",", "."); // Convertir coma decimal a punto

    return parseFloat(cleanValue) || 0;
  };

  // Función para limpiar formato de moneda
  const cleanCurrencyFormat = (value) => {
    if (!value) return "";

    // Si ya es un número limpio, devolverlo
    if (
      typeof value === "string" &&
      !value.includes("$") &&
      !value.includes(",")
    ) {
      return value;
    }

    // Limpiar formato de moneda
    const cleanValue = value
      .toString()
      .replace(/[^\d,.-]/g, "") // Eliminar símbolos no numéricos excepto , . -
      .replace(/\.(?=\d{3})/g, "") // Eliminar separadores de miles
      .replace(",", "."); // Convertir coma decimal a punto

    return cleanValue;
  };

  // Función para limpiar formato de porcentaje
  const cleanPercentageFormat = (value) => {
    if (!value) return "";

    // Si ya es un número limpio, devolverlo
    if (typeof value === "string" && !value.includes("%")) {
      return value;
    }

    // Limpiar formato de porcentaje
    const cleanValue = value
      .toString()
      .replace(/[^\d,.-]/g, "") // Eliminar símbolos no numéricos excepto , . -
      .replace(",", "."); // Convertir coma decimal a punto

    return cleanValue;
  };

  const isFormValid = () => {
    // Validar campos generales
    if (!formData.comprador) return false;

    // Validar cada producto
    return formData.productos.every((producto, index) => {
      const camposRequeridos = [
        producto.codigoBarras,
        producto.descripcion,
        producto.marca,
        producto.gramaje,
        producto.embalaje,
        producto.costoSinIVA,
      ];

      // Validar campos requeridos
      if (camposRequeridos.some((campo) => !campo || campo.trim() === "")) {
        return false;
      }

      // Validar que el costo sin IVA sea mayor que 0
      const costoSinIVA = formatCurrencyToNumber(producto.costoSinIVA);
      if (costoSinIVA <= 0) {
        return false;
      }

      // Validar que tenga fotos
      const reversoValido =
        producto.fotos.reverso instanceof File ||
        Boolean(producto.originalUrls?.reverso);
      const anversoValido =
        producto.fotos.anverso instanceof File ||
        Boolean(producto.originalUrls?.anverso);
      if (!reversoValido || !anversoValido) {
        return false;
      }

      // Validar selección de tipo de ítem
      const { modifica, nuevo } = producto.item;
      const itemSeleccionado = [modifica, nuevo].filter(Boolean).length;
      if (itemSeleccionado !== 1) return false;

      // Validar item reemplaza solo si es modifica
      if (modifica) {
        // Validar existencia
        if (!producto.itemReemplaza) {
          return false;
        }

        // Validar longitud de 6 dígitos
        if (!/^\d{6}$/.test(producto.itemReemplaza)) {
          return false;
        }
      }

      return true;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split(" ")[0];
  };

  const handleCancel = () => {
    resetForm();
    setView("listar");
    fetchData(busqueda, estado, page, user.nit, true);
  };

  const generatePDF = async () => {
    try {
      setIsDownloading(true);
      addNotification({
        message: "Generando PDF, por favor espere...",
        type: "info",
      });

      // Crear nuevo PDF en tamaño carta con orientación vertical
      const pdf = new jsPDF("p", "mm", "letter");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Colores corporativos
      const colors = {
        primary: [41, 128, 185],
        secondary: [52, 73, 94],
        success: [46, 204, 113],
        warning: [241, 196, 15],
        danger: [231, 76, 60],
        light: [248, 249, 250],
        dark: [33, 37, 41],
        gray: [108, 117, 125],
        lightGray: [233, 236, 239],
      };

      // Función para agregar nueva página
      const addNewPage = () => {
        pdf.addPage();
        yPosition = margin;
        addHeader();
      };

      // Función para verificar espacio en página
      const checkSpace = (neededHeight) => {
        if (yPosition + neededHeight > pageHeight - margin - 10) {
          addNewPage();
          return true;
        }
        return false;
      };

      // Función para cargar imagen
      const loadImage = async (url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";

          // Usar proxy para evitar problemas de CORS
          const proxyUrl = `https://aplicativo2.supermercadobelalcazar.com/api/utils/proxy_image.php?url=${encodeURIComponent(
            url
          )}`;

          img.onload = () => {
            resolve(img);
          };

          img.onerror = (error) => {
            console.warn(`Error cargando imagen ${url}:`, error);
            // Intentar cargar la imagen original si el proxy falla
            const img2 = new Image();
            img2.crossOrigin = "Anonymous";
            img2.onload = () => resolve(img2);
            img2.onerror = () => {
              console.error(`No se pudo cargar la imagen: ${url}`);
              resolve(null);
            };
            img2.src = url;
          };

          img.src = proxyUrl;
        });
      };

      // Encabezado
      const addHeader = () => {
        // Fondo del encabezado con gradiente
        pdf.setFillColor(...colors.primary);
        pdf.rect(0, 0, pageWidth, 45, "F");

        // Logo
        try {
          pdf.addImage(logo, "PNG", margin, 10, 40, 20);
        } catch (error) {
          console.warn("No se pudo cargar el logo:", error);
        }

        // Título principal
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.text("SOLICITUD DE CODIFICACIÓN", pageWidth / 2, 20, {
          align: "center",
        });

        // Subtítulo
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text("Sistema de Gestión de Productos", pageWidth / 2, 27, {
          align: "center",
        });

        // Número de solicitud
        pdf.text(`N°: ${solicitudSeleccionada.id}`, pageWidth - margin, 15, {
          align: "right",
        });

        // Línea decorativa
        pdf.setDrawColor(255, 255, 255);
        pdf.setLineWidth(0.8);
        pdf.line(margin, 35, pageWidth - margin, 35);

        yPosition = 50;
      };

      // Función para agregar sección mejorada
      const addSection = (title, subtitle = "") => {
        checkSpace(15);

        // Fondo de la sección
        pdf.setFillColor(...colors.secondary);
        pdf.roundedRect(
          margin,
          yPosition,
          pageWidth - 2 * margin,
          10,
          2, // Bordes menos redondeados
          2,
          "F"
        );

        // Título de la sección
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, margin + 8, yPosition + 6); // Ajustada posición vertical

        if (subtitle) {
          pdf.setFontSize(7); // Reducido de 8 a 7
          pdf.setFont("helvetica", "normal");
          pdf.text(subtitle, pageWidth - margin - 8, yPosition + 6, {
            align: "right",
          });
        }

        yPosition += 12;
      };

      // Función para agregar campo en formato tabla
      const addField = (label, value, width = "auto", important = false) => {
        checkSpace(8);

        const labelWidth = 45;
        const valueWidth =
          width === "auto" ? pageWidth - 2 * margin - labelWidth - 10 : width;

        // Etiqueta
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(...colors.gray);
        pdf.text(label + ":", margin + 5, yPosition + 5);

        // Valor
        pdf.setFont("helvetica", important ? "bold" : "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.dark);

        const lines = pdf.splitTextToSize(value.toString(), valueWidth);
        pdf.text(lines, margin + labelWidth, yPosition + 5);

        yPosition += Math.max(lines.length * 5, 8);
      };

      // Función para agregar información del producto en formato moderno
      const addProductInfo = (producto, index) => {
        checkSpace(20);

        // Encabezado del producto más compacto
        pdf.setFillColor(...colors.lightGray);
        pdf.roundedRect(
          margin,
          yPosition,
          pageWidth - 2 * margin,
          16,
          2,
          2,
          "F"
        );

        // Número del producto más pequeño y mejor centrado
        pdf.setFillColor(...colors.primary);
        pdf.circle(margin + 12, yPosition + 8, 5, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text((index + 1).toString(), margin + 12, yPosition + 9.5, {
          align: "center",
        });

        // Título del producto más compacto
        pdf.setTextColor(...colors.dark);
        pdf.setFontSize(10);
        pdf.text(`PRODUCTO ${index + 1}`, margin + 25, yPosition + 9.5);

        yPosition += 20;

        // Información básica con menos espacio entre líneas
        const columnWidth = (pageWidth - 2 * margin - 10) / 2;
        let currentY = yPosition;

        // Reducir espaciado entre líneas
        const lineSpacing = 6;

        const leftData = [
          {
            label: "Código de Barras",
            value: producto.codigo_barras || "N/A",
            important: true,
          },
          {
            label: "Referencia Interna",
            value: producto.referencia_proveedor || "N/A",
          },
          {
            label: "Descripción",
            value: producto.descripcion || "N/A",
            important: true,
          },
        ];

        const rightData = [
          { label: "Marca", value: producto.marca || "N/A", important: true },
          {
            label: "Gramaje",
            value: producto.gramaje || "N/A",
            important: true,
          },
          {
            label: "Embalaje",
            value: producto.embalaje || "N/A",
            important: true,
          },
        ];

        // Dibujar columnas
        leftData.forEach((item, i) => {
          const y = currentY + i * lineSpacing;

          // Etiqueta
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7);
          pdf.setTextColor(...colors.gray);
          pdf.text(item.label + ":", margin + 5, y + 4);

          // Valor
          pdf.setFont("helvetica", item.important ? "bold" : "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(...colors.dark);

          const valueLines = pdf.splitTextToSize(
            item.value.toString(),
            columnWidth - 15
          );
          pdf.text(valueLines, margin + 35, y + 4);
        });

        rightData.forEach((item, i) => {
          const y = currentY + i * lineSpacing;
          const x = margin + columnWidth + 5;

          // Etiqueta
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7);
          pdf.setTextColor(...colors.gray);
          pdf.text(item.label + ":", x + 5, y + 4);

          // Valor
          pdf.setFont("helvetica", item.important ? "bold" : "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(...colors.dark);

          const valueLines = pdf.splitTextToSize(
            item.value.toString(),
            columnWidth - 15
          );
          pdf.text(valueLines, x + 35, y + 4);
        });

        yPosition = currentY + 20;
      };

      // Función para agregar información financiera
      const addFinancialInfo = (producto) => {
        addSection("INFORMACIÓN FINANCIERA", "Valores en COP");

        const financialData = [
          {
            label: "Costo sin IVA",
            value: formatCurrency(producto.costo_sin_iva),
            important: true,
          },
          { label: "IVA", value: producto.iva ? `${producto.iva}%` : "0%" },
          { label: "ICUI", value: formatCurrency(producto.icui) },
          { label: "IBUA", value: formatCurrency(producto.ibua) },
          { label: "IPO", value: formatCurrency(producto.ipo) },
          {
            label: "Pie Factura 1",
            value: producto.pie_factura1 ? `${producto.pie_factura1}%` : "0%",
          },
          {
            label: "Pie Factura 2",
            value: producto.pie_factura2 ? `${producto.pie_factura2}%` : "0%",
          },
        ];

        // Crear tabla de 3 columnas
        const colWidth = (pageWidth - 2 * margin) / 3;
        let col = 0;
        let rowY = yPosition;

        financialData.forEach((item, index) => {
          if (col === 0) {
            checkSpace(12);
            rowY = yPosition;
          }

          const xPos = margin + col * colWidth;

          // Fondo alternado para mejor legibilidad
          if (index % 2 === 0) {
            pdf.setFillColor(...colors.light);
            pdf.rect(xPos, rowY, colWidth, 10, "F");
          }

          // Etiqueta
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8);
          pdf.setTextColor(...colors.gray);
          pdf.text(item.label, xPos + 5, rowY + 4);

          // Valor
          pdf.setFont("helvetica", item.important ? "bold" : "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(...colors.dark);
          pdf.text(item.value.toString(), xPos + 5, rowY + 8);

          col++;
          if (col === 3) {
            col = 0;
            yPosition += 12;
          }
        });

        if (col !== 0) yPosition += 12;
        yPosition += 5;
      };

      // Función para agregar tipo de codificación
      const addCodingType = (producto) => {
        addSection("TIPO DE CODIFICACIÓN");

        const isModifica = producto.item_modifica === 1;
        const itemType = isModifica ? "MODIFICA" : "NUEVO";
        const typeColor = isModifica ? colors.warning : colors.success;

        // Badge del tipo más compacto
        pdf.setFillColor(...typeColor);
        pdf.roundedRect(margin, yPosition, 20, 12, 3, 3, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text(itemType, margin + 10, yPosition + 7, { align: "center" });

        // Información adicional si es modifica
        if (isModifica && producto.item_reemplaza) {
          pdf.setTextColor(...colors.dark);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.text("Ítem Reemplaza: ", margin + 30, yPosition + 4);

          pdf.setFont("helvetica", "bold");
          pdf.text(producto.item_reemplaza, margin + 55, yPosition + 4);
        }

        yPosition += 15;
      };

      // Función para agregar imágenes del producto
      const addProductImages = async (producto) => {
        addSection("IMÁGENES DEL PRODUCTO");

        const imageWidth = (pageWidth - 3 * margin) / 2;
        const imageHeight = 45;

        checkSpace(imageHeight + 20);

        const addImageWithFallback = async (imageUrl, xPosition, label) => {
          try {
            if (imageUrl) {
              const img = await loadImage(imageUrl);
              if (img) {
                // Calcular dimensiones manteniendo proporción con límites estrictos
                const ratio = img.width / img.height;
                let displayWidth = imageWidth - 6; // Margen interno reducido
                let displayHeight = imageHeight - 6;

                // Asegurar que la imagen no se salga del contenedor
                if (ratio > 1) {
                  // Imagen horizontal
                  displayHeight = displayWidth / ratio;
                  if (displayHeight > imageHeight - 6) {
                    displayHeight = imageHeight - 6;
                    displayWidth = displayHeight * ratio;
                  }
                } else {
                  // Imagen vertical
                  displayWidth = displayHeight * ratio;
                  if (displayWidth > imageWidth - 6) {
                    displayWidth = imageWidth - 6;
                    displayHeight = displayWidth / ratio;
                  }
                }

                const xOffset = xPosition + (imageWidth - displayWidth) / 2;
                const yOffset = yPosition + (imageHeight - displayHeight) / 2;

                // Marco de la imagen más delgado
                pdf.setFillColor(...colors.light);
                pdf.setDrawColor(...colors.lightGray);
                pdf.setLineWidth(0.3);
                pdf.roundedRect(
                  xPosition,
                  yPosition,
                  imageWidth,
                  imageHeight,
                  2,
                  2,
                  "FD" // Relleno y borde
                );

                // Añadir imagen con dimensiones controladas
                pdf.addImage(
                  img,
                  "JPEG",
                  xOffset,
                  yOffset,
                  Math.min(displayWidth, imageWidth - 6), // Límite máximo
                  Math.min(displayHeight, imageHeight - 6),
                  null,
                  "FAST"
                );

                return true;
              }
            }
          } catch (error) {
            console.warn(`Error al cargar imagen ${label}:`, error);
          }

          // Fallback: mostrar placeholder
          pdf.setFillColor(...colors.light);
          pdf.setDrawColor(...colors.lightGray);
          pdf.setLineWidth(0.3);
          pdf.roundedRect(
            xPosition,
            yPosition,
            imageWidth,
            imageHeight,
            2,
            2,
            "FD"
          );

          pdf.setTextColor(...colors.gray);
          pdf.setFontSize(7);
          pdf.setFont("helvetica", "italic");
          pdf.text(
            "Imagen no disponible",
            xPosition + imageWidth / 2,
            yPosition + imageHeight / 2,
            { align: "center" }
          );

          return false;
        };

        // Imagen reverso
        await addImageWithFallback(producto.foto_reverso, margin, "Reverso");

        // Etiqueta reverso más compacta
        pdf.setTextColor(...colors.dark);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          "REVERSO",
          margin + imageWidth / 2,
          yPosition + imageHeight + 6,
          { align: "center" }
        );

        // Imagen anverso
        await addImageWithFallback(
          producto.foto_anverso,
          margin * 2 + imageWidth,
          "Anverso"
        );

        // Etiqueta anverso más compacta
        pdf.text(
          "ANVERSO",
          margin * 2 + imageWidth + imageWidth / 2,
          yPosition + imageHeight + 6,
          { align: "center" }
        );

        yPosition += imageHeight + 15;
      };

      // Función para agregar información de procesamiento
      const addProcessingInfo = (producto) => {
        if (
          solicitudSeleccionada.estado !== "Generado" &&
          solicitudSeleccionada.estado !== "En revision"
        ) {
          const processingInfo = [];

          if (producto.precio_venta > 0) {
            processingInfo.push({
              label: "Precio de Venta",
              value: formatCurrency(producto.precio_venta),
              important: true,
            });
          }

          if (producto.item_asignado) {
            processingInfo.push({
              label: "Ítem Asignado",
              value: producto.item_asignado,
              important: true,
            });
          }

          if (producto.aprobado !== null) {
            processingInfo.push({
              label: "Estado del Producto",
              value: producto.aprobado === 1 ? "APROBADO" : "RECHAZADO",
              color: producto.aprobado === 1 ? colors.success : colors.danger,
              important: true,
            });
          }

          if (processingInfo.length > 0) {
            addSection("INFORMACIÓN DE PROCESAMIENTO");

            processingInfo.forEach((info) => {
              checkSpace(10);

              pdf.setFont("helvetica", "bold");
              pdf.setFontSize(9);
              pdf.setTextColor(...colors.gray);
              pdf.text(info.label + ":", margin + 5, yPosition + 6);

              pdf.setFont("helvetica", "bold");
              pdf.setFontSize(10);

              if (info.color) {
                pdf.setTextColor(...info.color);
              } else {
                pdf.setTextColor(...colors.dark);
              }

              pdf.text(info.value.toString(), margin + 45, yPosition + 6);

              yPosition += 10;
            });

            yPosition += 5;
          }
        }
      };

      // Función para agregar portafolios
      const addPortfolios = (producto) => {
        if (producto.portafolios && producto.portafolios.length > 0) {
          addSection("PORTAFOLIOS ASIGNADOS");

          const portfolioList = [
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
          ];
          const boxSize = 6;
          const spacing = 4;
          let xPos = margin;

          checkSpace(15);

          portfolioList.forEach((portfolio) => {
            const isSelected =
              Array.isArray(producto.portafolios) &&
              producto.portafolios.includes(portfolio);

            // Caja del portafolio más pequeña
            if (isSelected) {
              pdf.setFillColor(...colors.success);
              pdf.setDrawColor(...colors.success);
            } else {
              pdf.setFillColor(255, 255, 255);
              pdf.setDrawColor(...colors.gray);
            }

            pdf.roundedRect(
              xPos,
              yPosition,
              boxSize,
              boxSize,
              1,
              1,
              isSelected ? "FD" : "D"
            );

            // Checkmark (chulo)
            if (isSelected) {
              pdf.setTextColor(255, 255, 255);
              pdf.setFontSize(5);
              pdf.setFont("helvetica", "bold");
              pdf.text("X", xPos + boxSize / 2, yPosition + boxSize / 2 + 0.5, {
                align: "center",
              });
            }

            // Texto del portafolio más pequeño
            pdf.setTextColor(...colors.dark);
            pdf.setFontSize(7);
            pdf.text(portfolio, xPos + boxSize / 2, yPosition + boxSize + 5, {
              align: "center",
            });

            xPos += boxSize + spacing + 8;

            // Salto de línea si no cabe
            if (xPos > pageWidth - margin - 15) {
              xPos = margin;
              yPosition += 12;
              checkSpace(12);
            }
          });

          yPosition += 15;
        }
      };

      // Función para agregar archivos adjuntos
      const addAttachments = (producto) => {
        if (producto.archivo_adjunto) {
          addSection("ARCHIVOS ADJUNTOS");

          checkSpace(15);

          // Icono de archivo
          pdf.setFillColor(...colors.primary);
          pdf.roundedRect(margin, yPosition, 15, 12, 3, 3, "F");
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(7);
          pdf.setFont("helvetica", "bold");
          pdf.text("ZIP", margin + 7.5, yPosition + 7, { align: "center" });

          // Información del archivo
          pdf.setTextColor(...colors.dark);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.text("Archivo disponible:", margin + 25, yPosition + 4);

          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...colors.primary);
          const fileName =
            producto.archivo_adjunto.split("/").pop() || "archivo_adjunto.zip";
          pdf.text(fileName, margin + 25, yPosition + 10);

          yPosition += 18;
        }
      };

      // INICIO DE LA GENERACIÓN DEL PDF

      // Agregar encabezado en la primera página
      addHeader();

      // Información de la empresa
      addSection("INFORMACIÓN DE LA EMPRESA");
      addField("Empresa", "Abastecemos de Occidente S.A.S", "auto", true);
      addField("NIT", "900123456-7");
      addField("Dirección", "Cra. 5 # 5-48, Yumbo, Valle del Cauca");

      // Información del proveedor
      addSection("INFORMACIÓN DEL PROVEEDOR");
      addField(
        "Fecha Solicitud",
        formatDate(solicitudSeleccionada.fecha_solicitud)
      );
      addField("NIT Proveedor", solicitudSeleccionada.nit);
      addField("Email", solicitudSeleccionada.email_notificacion);
      addField("Comprador", solicitudSeleccionada.comprador || "No asignado");

      // Estado de la solicitud
      addSection("ESTADO DE LA SOLICITUD");

      const statusColors = {
        Aprobado: colors.success,
        Rechazado: colors.danger,
        Corregir: colors.warning,
        Generado: colors.primary,
        "En revisión": [155, 89, 182],
        Codificado: [142, 68, 173],
      };

      const statusColor =
        statusColors[solicitudSeleccionada.estado] || colors.gray;

      // Badge de estado
      pdf.setFillColor(...statusColor);
      pdf.roundedRect(margin, yPosition, 35, 10, 4, 4, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        solicitudSeleccionada.estado.toUpperCase(),
        margin + 17,
        yPosition + 6, // Mejor centrado vertical
        { align: "center" }
      );

      yPosition += 15;

      // Observaciones
      if (solicitudSeleccionada.observaciones?.trim()) {
        addSection("OBSERVACIONES");

        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 80);

        const obsLines = pdf.splitTextToSize(
          solicitudSeleccionada.observaciones,
          pageWidth - 2 * margin - 10
        );

        // Fondo para observaciones
        pdf.setFillColor(...colors.light);
        pdf.roundedRect(
          margin,
          yPosition,
          pageWidth - 2 * margin,
          obsLines.length * 5 + 10,
          3,
          3,
          "F"
        );

        pdf.text(obsLines, margin + 5, yPosition + 7);
        yPosition += obsLines.length * 5 + 15;
      }

      // Productos
      for (
        let index = 0;
        index < solicitudSeleccionada.productos.length;
        index++
      ) {
        const producto = solicitudSeleccionada.productos[index];

        // Separador entre productos (excepto el primero)
        if (index > 0) {
          checkSpace(20);
          pdf.setDrawColor(...colors.lightGray);
          pdf.setLineWidth(0.5);
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 10;
        }

        addProductInfo(producto, index);
        addFinancialInfo(producto);
        addCodingType(producto);
        addProcessingInfo(producto);
        addPortfolios(producto);
        await addProductImages(producto);
        addAttachments(producto);
      }

      // Pie de página en todas las páginas
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        // Línea superior del pie
        pdf.setDrawColor(...colors.lightGray);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        // Información del pie
        pdf.setFontSize(8);
        pdf.setTextColor(...colors.gray);
        pdf.text(
          `Página ${i} de ${totalPages} | Generado el ${new Date().toLocaleDateString(
            "es-CO",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }
          )} | Abastecemos de Occidente S.A.S`,
          pageWidth / 2,
          pageHeight - 8,
          { align: "center" }
        );
      }

      // Guardar PDF
      const fileName = `Solicitud_Codificacion_${
        solicitudSeleccionada.id
      }_${new Date().getTime()}.pdf`;
      pdf.save(fileName);

      addNotification({
        message: "PDF generado correctamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error al generar PDF:", error);
      addNotification({
        message: "Error al generar el PDF: " + error.message,
        type: "error",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleImageClick = (imageUrl, title, type) => {
    setSelectedImage({
      url: imageUrl,
      title: title,
      type: type,
    });
    setModalImagenOpen(true);
  };

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
      addNotification({
        message: "Error al descargar el archivo.",
        type: "error",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenTraceability = async (solicitudId) => {
    try {
      const data = await apiService.getTrazabilidadCodificacionProducto(
        solicitudId
      );
      setTraceabilityData(data);
      setModalTrazabilidadOpen(true);
    } catch (error) {
      addNotification({
        message: error.message || "Error al obtener la trazabilidad.",
        type: "error",
      });
    }
  };

  const getEstadoColor = (estado) => {
    const estadoLower = estado?.toLowerCase().trim();
    switch (estadoLower) {
      case "generado":
        return "#007bff";
      case "en revisión":
        return "#ff9800";
      case "aprobado":
        return "#4caf50";
      case "rechazado":
        return "#f44336";
      case "codificado":
        return "#9c27b0";
      case "corregir":
        return "#e91e63";
      default:
        return "#6c757d";
    }
  };

  if (cargando) {
    return <LoadingScreen message="Cargando informacion..." />;
  }

  return (
    <div className={styles.container}>
      {/* Video Tutorial Modal */}
      {videoModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              onClick={() => setVideoModalOpen(false)}
            >
              ×
            </button>
            <iframe
              width="760"
              height="470"
              src="https://www.youtube.com/embed/PbnT1v-NP2A"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {view === "listar" && (
        <>
          <div className={styles.headerSection}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>
                <span className={styles.titleIcon}>📦</span>
                Codificación de Productos
              </h1>
              <p className={styles.subtitle}>
                Gestión y seguimiento de solicitudes de codificación
              </p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoHeader}>
                <div className={styles.infoIconWrapper}>
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className={styles.infoIcon}
                  />
                </div>
                <h3>Información Importante</h3>
              </div>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <div className={styles.infoBullet}>📋</div>
                  <span>
                    Visualice y cree nuevas solicitudes de codificación
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoBullet}>👀</div>
                  <span>Revise el historial de solicitudes realizadas</span>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.infoBullet}>✏️</div>
                  <span>Correcciones limitadas a 3 veces por solicitud</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.controlsSection}>
            <form className={styles.searchForm} onSubmit={handleSearch}>
              <div className={styles.searchGroup}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Buscar por código, descripción o marca..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPage(1);
                  }}
                />
                <button className={styles.searchButton} type="submit">
                  <FontAwesomeIcon icon={faSearch} />
                  <span>Buscar</span>
                </button>
              </div>
            </form>

            <div className={styles.filtersGroup}>
              <div className={styles.filterItem}>
                <label htmlFor="estado-select" className={styles.filterLabel}>
                  Estado:
                </label>
                <select
                  id="estado-select"
                  className={styles.filterSelect}
                  value={estado}
                  onChange={(e) => {
                    setEstado(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="Todos">Todos</option>
                  <option value="Generado">Generado</option>
                  <option value="En revisión">En revisión</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Rechazado">Rechazado</option>
                  <option value="Codificado">Codificado</option>
                  <option value="Corregir">Corregir</option>
                </select>
              </div>

              <button
                className={styles.primaryButton}
                onClick={() => handleViewChange("new")}
              >
                <FontAwesomeIcon icon={faFolderOpen} />
                <span>Nueva Solicitud</span>
              </button>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>ID</th>
                    <th>Fecha Creación</th>
                    <th>Comprador</th>
                    <th>Productos</th>
                    <th>Código/s de Barra/s</th>
                    <th>Descripción/es</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.length > 0 ? (
                    solicitudes.map((solicitud, index) => (
                      <tr key={solicitud.id} className={styles.tableRow}>
                        <td>{(page - 1) * 10 + index + 1}</td>
                        <td>{solicitud.id}</td>
                        <td>
                          {new Date(
                            solicitud.fecha_solicitud
                          ).toLocaleDateString("es-CO")}
                        </td>
                        <td>{solicitud.comprador}</td>
                        <td className={styles.centerCell}>
                          <span className={styles.badge}>
                            {solicitud.productos?.length || 0}
                          </span>
                        </td>
                        <td className={styles.codeCell}>
                          {solicitud.productos
                            ?.map((p) => p.codigo_barras)
                            .join(", ") || "N/A"}
                        </td>
                        <td>
                          <div
                            className={styles.descriptionCell}
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
                            className={styles.statusBadge}
                            style={{
                              backgroundColor: getEstadoColor(solicitud.estado),
                              color: "white",
                              fontWeight: "600",
                              padding: "6px 12px",
                              borderRadius: "12px",
                              display: "inline-block",
                              textTransform: "capitalize",
                              transition: "all 0.3s ease",
                            }}
                          >
                            {solicitud.estado}
                          </span>
                        </td>

                        <td>
                          <div className={styles.actionsGroup}>
                            <button
                              className={styles.actionButton}
                              onClick={() => handleVerMas(solicitud)}
                              title="Ver detalles"
                            >
                              <FontAwesomeIcon icon={faSearch} />
                            </button>
                            <button
                              className={styles.actionButton}
                              onClick={() =>
                                handleOpenTraceability(solicitud.id)
                              }
                              title="Ver trazabilidad"
                            >
                              <FontAwesomeIcon icon={faHistory} />
                            </button>
                            {solicitud.estado === "Corregir" && (
                              <button
                                className={styles.actionButton}
                                onClick={() => handleCorregir(solicitud)}
                                title="Corregir solicitud"
                              >
                                <FontAwesomeIcon icon={faPencilAlt} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className={styles.emptyState}>
                        <div className={styles.emptyMessage}>
                          No se encontraron solicitudes con los filtros actuales
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {hasMoreUsers && solicitudes.length > 0 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                  <span>Anterior</span>
                </button>

                <div className={styles.pageNumbers}>
                  {Array.from({ length: 5 }, (_, i) => i + 1).map(
                    (pageNumber) => (
                      <button
                        key={pageNumber}
                        className={`${styles.pageButton} ${
                          page === pageNumber ? styles.active : ""
                        }`}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    )
                  )}
                </div>

                <button
                  className={styles.paginationButton}
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!hasMoreUsers}
                >
                  <span>Siguiente</span>
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {view === "new" && (
        <div className={styles.modernForm}>
          <div className={styles.formHeader}>
            <div className={styles.headerContent}>
              <button className={styles.backButton} onClick={handleCancel}>
                <FontAwesomeIcon icon={faChevronLeft} />
                <span>Volver al Listado</span>
              </button>
              <div className={styles.titleSection}>
                <h1 className={styles.title}>
                  <span className={styles.titleIcon}>✨</span>
                  Nueva Solicitud de Codificación
                </h1>
                <p className={styles.subtitle}>
                  Complete la información requerida para cada producto
                </p>
              </div>
            </div>
          </div>

          <div className={styles.formContainer}>
            <form className={styles.form} onSubmit={handleNewSolicitud}>
              {/* Encabezado Moderno */}
              <div className={styles.companyCard}>
                <div className={styles.companyHeader}>
                  <div className={styles.logoSection}>
                    <img
                      src={logo}
                      alt="Logo Empresa"
                      className={styles.logo}
                    />
                    <div className={styles.companyBadge}>
                      <span>SOLICITUD</span>
                    </div>
                  </div>
                  <div className={styles.companyInfo}>
                    <h2>Abastecemos de Occidente S.A.S</h2>
                    <div className={styles.companyDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>NIT:</span>
                        <span className={styles.detailValue}>900123456-7</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Dirección:</span>
                        <span className={styles.detailValue}>
                          Cra. 5 # 5-48, Yumbo, Valle del Cauca
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.providerSection}>
                  <div className={styles.providerCard}>
                    <h4>Información del Proveedor</h4>
                    <div className={styles.providerDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Fecha:</span>
                        <span className={styles.detailValue}>
                          {formatDate(formData.fecha)}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>NIT:</span>
                        <span className={styles.detailValue}>
                          {formData.nit}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Email:</span>
                        <span className={styles.detailValue}>
                          {formData.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección de Comprador */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionIcon}>📋</div>
                  <div>
                    <h3 className={styles.sectionTitle}>
                      Información de Comprador
                    </h3>
                    <p className={styles.sectionSubtitle}>
                      Seleccione el comprador asignado
                    </p>
                  </div>
                </div>
                <div className={styles.compradorField}>
                  <label className={styles.fieldLabel}>
                    Comprador Asignado{" "}
                    <span className={styles.required}>*</span>
                  </label>
                  <select
                    name="comprador"
                    value={formData.comprador}
                    onChange={handleChange}
                    className={styles.modernSelect}
                    required
                  >
                    <option value="">Seleccione un comprador...</option>
                    <option value="ANDREA">ANDREA</option>
                    <option value="CLAUDIA">CLAUDIA</option>
                    <option value="JAVID">JAVID</option>
                    <option value="JAZMIN">JAZMIN</option>
                    <option value="JEFFERSON">JEFFERSON</option>
                    <option value="LORENA">LORENA</option>
                    <option value="POLLO">POLLO</option>
                  </select>
                </div>
              </div>

              {/* Productos - Diseño Mejorado */}
              {formData.productos.map((producto, index) => (
                <div key={index} className={styles.productCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.productHeader}>
                      <div className={styles.productNumber}>
                        <span>Producto {index + 1}</span>
                      </div>
                      <h3 className={styles.productTitle}>
                        Información del Producto
                      </h3>
                    </div>
                    {formData.productos.length > 1 && (
                      <button
                        type="button"
                        className={styles.deleteProductBtn}
                        onClick={() => eliminarProducto(index)}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                        <span>Eliminar</span>
                      </button>
                    )}
                  </div>

                  <div className={styles.productContent}>
                    {/* Sección de Información Básica */}
                    <div className={styles.fieldGroup}>
                      <h4 className={styles.fieldGroupTitle}>
                        Información Básica
                      </h4>
                      <div className={styles.fieldsRow}>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Código de Barras{" "}
                            <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            name="codigoBarras"
                            value={producto.codigoBarras}
                            onChange={(e) =>
                              handleProductoNumericInput(index, e)
                            }
                            className={styles.modernInput}
                            placeholder="Ingrese el código de barras"
                            required
                          />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Referencia Interna
                          </label>
                          <input
                            type="text"
                            name="referenciaInterna"
                            value={producto.referenciaInterna}
                            onChange={(e) => handleProductoChange(index, e)}
                            className={styles.modernInput}
                            placeholder="Referencia del proveedor"
                          />
                        </div>
                      </div>

                      <div className={styles.fieldsRow}>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Descripción{" "}
                            <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            name="descripcion"
                            value={producto.descripcion}
                            onChange={(e) => handleProductoChange(index, e)}
                            className={styles.modernInput}
                            placeholder="Descripción del producto"
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.fieldsRow}>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Marca <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            name="marca"
                            value={producto.marca}
                            onChange={(e) => handleProductoChange(index, e)}
                            className={styles.modernInput}
                            placeholder="Marca del producto"
                            required
                          />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Gramaje <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            name="gramaje"
                            value={producto.gramaje}
                            onChange={(e) => handleProductoChange(index, e)}
                            className={styles.modernInput}
                            placeholder="Ej: 500 ML"
                            required
                          />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Embalaje <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            name="embalaje"
                            value={producto.embalaje}
                            onChange={(e) => handleProductoChange(index, e)}
                            className={styles.modernInput}
                            placeholder="Ej: C x 24 UNDS"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sección de Información Financiera */}
                    <div className={styles.fieldGroup}>
                      <h4 className={styles.fieldGroupTitle}>
                        Información Financiera
                      </h4>
                      <div className={styles.fieldsRow}>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Costo sin IVA{" "}
                            <span className={styles.required}>*</span>
                          </label>
                          <div className={styles.currencyInputWrapper}>
                            <span className={styles.currencySymbol}>$</span>
                            <input
                              type="text"
                              name="costoSinIVA"
                              value={producto.costoSinIVA}
                              onChange={(e) =>
                                handleProductoNumericInput(index, e)
                              }
                              onBlur={(e) => handleProductoBlur(index, e)}
                              onFocus={(e) => handleProductoFocus(index, e)}
                              className={styles.modernInput}
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>IVA</label>
                          <div className={styles.percentageInputWrapper}>
                            <input
                              type="text"
                              name="iva"
                              value={producto.iva}
                              onChange={(e) =>
                                handleProductoNumericInput(index, e)
                              }
                              onBlur={(e) => handleProductoBlur(index, e)}
                              onFocus={(e) => handleProductoFocus(index, e)}
                              className={styles.modernInput}
                              placeholder="0%"
                            />
                            <span className={styles.percentageSymbol}>%</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.fieldsRow}>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>ICUI</label>
                          <div className={styles.currencyInputWrapper}>
                            <span className={styles.currencySymbol}>$</span>
                            <input
                              type="text"
                              name="icui"
                              value={producto.icui}
                              onChange={(e) =>
                                handleProductoNumericInput(index, e)
                              }
                              onBlur={(e) => handleProductoBlur(index, e)}
                              onFocus={(e) => handleProductoFocus(index, e)}
                              className={styles.modernInput}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>IBUA</label>
                          <div className={styles.currencyInputWrapper}>
                            <span className={styles.currencySymbol}>$</span>
                            <input
                              type="text"
                              name="ibua"
                              value={producto.ibua}
                              onChange={(e) =>
                                handleProductoNumericInput(index, e)
                              }
                              onBlur={(e) => handleProductoBlur(index, e)}
                              onFocus={(e) => handleProductoFocus(index, e)}
                              className={styles.modernInput}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>IPO</label>
                          <div className={styles.currencyInputWrapper}>
                            <span className={styles.currencySymbol}>$</span>
                            <input
                              type="text"
                              name="ipo"
                              value={producto.ipo}
                              onChange={(e) =>
                                handleProductoNumericInput(index, e)
                              }
                              onBlur={(e) => handleProductoBlur(index, e)}
                              onFocus={(e) => handleProductoFocus(index, e)}
                              className={styles.modernInput}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      <div className={styles.fieldsRow}>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Pie Factura 1
                          </label>
                          <div className={styles.percentageInputWrapper}>
                            <input
                              type="text"
                              name="pieFactura1"
                              value={producto.pieFactura1}
                              onChange={(e) =>
                                handleProductoNumericInput(index, e)
                              }
                              onBlur={(e) => handleProductoBlur(index, e)}
                              onFocus={(e) => handleProductoFocus(index, e)}
                              className={styles.modernInput}
                              placeholder="0%"
                            />
                            <span className={styles.percentageSymbol}>%</span>
                          </div>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Pie Factura 2
                          </label>
                          <div className={styles.percentageInputWrapper}>
                            <input
                              type="text"
                              name="pieFactura2"
                              value={producto.pieFactura2}
                              onChange={(e) =>
                                handleProductoNumericInput(index, e)
                              }
                              onBlur={(e) => handleProductoBlur(index, e)}
                              onFocus={(e) => handleProductoFocus(index, e)}
                              className={styles.modernInput}
                              placeholder="0%"
                            />
                            <span className={styles.percentageSymbol}>%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sección de Tipo de Codificación */}
                    <div className={styles.fieldGroup}>
                      <h4 className={styles.fieldGroupTitle}>
                        Tipo de Codificación
                      </h4>
                      <p className={styles.fieldDescription}>
                        <strong>Modifica:</strong> Actualiza información de un
                        producto existente. <br />
                        <strong>Nuevo:</strong> Producto que no existe
                        actualmente en nuestro sistema.
                      </p>

                      <div className={styles.itemTypeContainer}>
                        <div className={styles.checkboxGroup}>
                          <label className={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              name="modifica"
                              checked={producto.item.modifica}
                              onChange={(e) => handleProductoChange(index, e)}
                            />
                            <span className={styles.checkboxText}>
                              Modifica
                            </span>
                          </label>
                          <label className={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              name="nuevo"
                              checked={producto.item.nuevo}
                              onChange={(e) => handleProductoChange(index, e)}
                            />
                            <span className={styles.checkboxText}>Nuevo</span>
                          </label>
                        </div>

                        {producto.item.modifica && (
                          <div className={styles.itemReemplazaField}>
                            <label className={styles.fieldLabel}>
                              Item Reemplaza{" "}
                              <span className={styles.required}>*</span>
                            </label>
                            <input
                              type="text"
                              name="itemReemplaza"
                              value={producto.itemReemplaza}
                              onChange={(e) => handleProductoChange(index, e)}
                              className={styles.modernInput}
                              placeholder="Ingrese el ítem a reemplazar"
                              maxLength={6}
                              required
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sección de Imágenes */}
                    <div className={styles.fieldGroup}>
                      <h4 className={styles.fieldGroupTitle}>
                        Imágenes del Producto{" "}
                        <span className={styles.required}>*</span>
                      </h4>
                      <div className={styles.imagesSection}>
                        <div className={styles.imageRow}>
                          <div className={styles.imageUpload}>
                            <label className={styles.imageLabel}>Reverso</label>
                            <img
                              src={producto.imagePreview.reverso || reverso}
                              alt="Reverso"
                              className={styles.productImage}
                              onClick={() => {
                                if (producto.imagePreview.reverso) {
                                  handleImageClick(
                                    producto.imagePreview.reverso,
                                    "Reverso",
                                    "reverso"
                                  );
                                }
                              }}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleProductoImageChange(index, e, "reverso")
                              }
                              className={styles.fileInput}
                            />
                            {producto.fotos.reverso instanceof File && (
                              <p className={styles.fileInfo}>
                                Imagen seleccionada:{" "}
                              </p>
                            )}
                          </div>

                          <div className={styles.imageUpload}>
                            <label className={styles.imageLabel}>Anverso</label>
                            <img
                              src={producto.imagePreview.anverso || anverso}
                              alt="Anverso"
                              className={styles.productImage}
                              onClick={() => {
                                if (producto.imagePreview.anverso) {
                                  handleImageClick(
                                    producto.imagePreview.anverso,
                                    "Anverso",
                                    "anverso"
                                  );
                                }
                              }}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleProductoImageChange(index, e, "anverso")
                              }
                              className={styles.fileInput}
                            />
                            {producto.fotos.anverso instanceof File && (
                              <p className={styles.fileInfo}>
                                Imagen seleccionada:{" "}
                                {producto.fotos.anverso.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sección de Archivos Adjuntos */}
                    <div className={styles.fieldGroup}>
                      <h4 className={styles.fieldGroupTitle}>
                        Archivos Adjuntos
                      </h4>
                      <div className={styles.filesSection}>
                        <div className={styles.fileInfoBox}>
                          <div className={styles.infoHeader}>
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              className={styles.infoIcon}
                            />
                            <h4>Requisitos para productos de consumo humano</h4>
                          </div>
                          <p>
                            Los siguientes requisitos deben estar comprimidos en
                            un solo archivo <strong>.zip</strong>:
                          </p>
                          <ul className={styles.requirementsList}>
                            <li>Concepto sanitario del fabricante</li>
                            <li>Ficha/s técnica/s del producto</li>
                            <li>Registro, permiso o notificación sanitaria</li>
                            <li>
                              INVIMA (para productos de la categoría de licores)
                            </li>
                          </ul>
                          <p className={styles.videoLink}>
                            ¿No sabes cómo comprimir archivos?{" "}
                            <span
                              onClick={() => setVideoModalOpen(true)}
                              className={styles.videoLinkText}
                            >
                              Ver video tutorial
                            </span>
                          </p>
                        </div>

                        <div className={styles.fileUploadBox}>
                          <label className={styles.fileInputLabel}>
                            <input
                              type="file"
                              accept=".zip,.rar"
                              onChange={(e) =>
                                handleProductoFileChange(index, e)
                              }
                              className={styles.fileInput}
                            />
                            <span className={styles.fileInputText}>
                              {producto.archivoAdjunto instanceof File
                                ? producto.nombreArchivo
                                : "Seleccionar archivo .zip o .rar"}
                            </span>
                          </label>

                          {producto.archivoAdjunto instanceof File && (
                            <p
                              className={
                                producto.archivoValido
                                  ? styles.fileInfo
                                  : styles.fileError
                              }
                            >
                              {producto.nombreArchivo} (
                              {Math.round(producto.archivoAdjunto.size / 1024)}{" "}
                              KB)
                              {!producto.archivoValido &&
                                " - Archivo demasiado grande"}
                            </p>
                          )}

                          <p className={styles.fileHint}>
                            Tamaño máximo: 5MB. Formatos: .rar, .zip
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Acciones del Formulario */}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.addProductBtn}
                  onClick={agregarProducto}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Agregar Otro Producto</span>
                </button>

                <div className={styles.submitActions}>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={!isFormValid() || loading}
                  >
                    {loading ? (
                      <>
                        <div className={styles.spinner}></div>
                        Enviando Solicitud...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faFolderOpen} />
                        Enviar Solicitud de Codificación
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={handleCancel}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {view === "detalle" && solicitudSeleccionada && (
        <div className={styles.modernForm}>
          {/* Botón flotante para generar PDF */}
          <div className={styles.pdfButtonContainer}>
            <button
              onClick={generatePDF}
              className={`${styles.pdfButton} ${
                isDownloading ? styles.loading : ""
              }`}
              title="Generar PDF"
              disabled={isDownloading}
            >
              <FontAwesomeIcon icon={faFilePdf} />
              <span>{isDownloading ? "Generando PDF..." : "Generar PDF"}</span>
            </button>
          </div>

          <div className={styles.formHeader}>
            <div className={styles.headerContent}>
              <button className={styles.backButton} onClick={handleCancel}>
                <FontAwesomeIcon icon={faChevronLeft} />
                <span>Volver al Listado</span>
              </button>
              <div className={styles.titleSection}>
                <h1 className={styles.title}>
                  <span className={styles.titleIcon}>👁️</span>
                  Detalle de Solicitud de Codificación
                </h1>
                <p className={styles.subtitle}>
                  Información completa de la solicitud #
                  {solicitudSeleccionada.id}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.formContainer}>
            <div className={styles.normalContent}>
              {/* Encabezado Moderno */}
              <div className={styles.companyCard}>
                <div className={styles.companyHeader}>
                  <div className={styles.logoSection}>
                    <img
                      src={logo}
                      alt="Logo Empresa"
                      className={styles.logo}
                    />
                    <div className={styles.companyBadge}>
                      <span>SOLICITUD #{solicitudSeleccionada.id}</span>
                    </div>
                  </div>
                  <div className={styles.companyInfo}>
                    <h2>Abastecemos de Occidente S.A.S</h2>
                    <div className={styles.companyDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>NIT:</span>
                        <span className={styles.detailValue}>900123456-7</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Dirección:</span>
                        <span className={styles.detailValue}>
                          Cra. 5 # 5-48, Yumbo, Valle del Cauca
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.providerSection}>
                  <div className={styles.providerCard}>
                    <h4>Información del Proveedor</h4>
                    <div className={styles.providerDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>
                          Fecha Solicitud:
                        </span>
                        <span className={styles.detailValue}>
                          {formatDate(solicitudSeleccionada.fecha_solicitud)}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>NIT:</span>
                        <span className={styles.detailValue}>
                          {solicitudSeleccionada.nit}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Email:</span>
                        <span className={styles.detailValue}>
                          {solicitudSeleccionada.email_notificacion}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado y Observaciones */}
              <div className={styles.statusSection}>
                <div
                  className={`${styles.statusCard} ${
                    solicitudSeleccionada.estado === "Aprobado"
                      ? styles.statusSuccess
                      : solicitudSeleccionada.estado === "Rechazado"
                      ? styles.statusError
                      : solicitudSeleccionada.estado === "Corregir"
                      ? styles.statusWarning
                      : styles.statusReview
                  }`}
                >
                  <div className={styles.statusHeader}>
                    <FontAwesomeIcon
                      icon={
                        solicitudSeleccionada.estado === "Aprobado"
                          ? faCheckCircle
                          : solicitudSeleccionada.estado === "Rechazado"
                          ? faTimesCircle
                          : solicitudSeleccionada.estado === "Corregir"
                          ? faExclamationCircle
                          : faClock
                      }
                      className={styles.statusIcon}
                    />
                    <h3>Estado: {solicitudSeleccionada.estado}</h3>
                  </div>
                </div>

                {solicitudSeleccionada.observaciones?.trim() && (
                  <div className={styles.observationsCard}>
                    <div className={styles.observationsHeader}>
                      <FontAwesomeIcon icon={faInfoCircle} />
                      <h4>Observaciones</h4>
                    </div>
                    <p>{solicitudSeleccionada.observaciones}</p>
                  </div>
                )}
              </div>

              {/* Información del Comprador */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionIcon}>📋</div>
                  <div>
                    <h3 className={styles.sectionTitle}>Comprador Asignado</h3>
                    <p className={styles.sectionSubtitle}>
                      Responsable de la revisión de la solicitud
                    </p>
                  </div>
                </div>
                <div className={styles.readonlyField}>
                  <label className={styles.fieldLabel}>Comprador</label>
                  <div className={styles.readonlyValue}>
                    {solicitudSeleccionada.comprador || "No asignado"}
                  </div>
                </div>
              </div>

              {/* Productos - VISTA NORMAL CON IMÁGENES REALES */}
              {solicitudSeleccionada.productos.map((producto, index) => (
                <div key={index} className={styles.productCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.productHeader}>
                      <div className={styles.productNumber}>
                        <span>Producto {index + 1}</span>
                      </div>
                      <h3 className={styles.productTitle}>
                        Información del Producto
                      </h3>
                    </div>
                  </div>

                  <div className={styles.productContent}>
                    {/* Información Básica */}
                    <div className={styles.fieldGroup}>
                      <h4 className={styles.fieldGroupTitle}>
                        Información Básica
                      </h4>
                      <div className={styles.fieldsRow}>
                        <div className={styles.readonlyField}>
                          <label className={styles.fieldLabel}>
                            Código de Barras
                          </label>
                          <div className={styles.readonlyValue}>
                            {producto.codigo_barras}
                          </div>
                        </div>
                        <div className={styles.readonlyField}>
                          <label className={styles.fieldLabel}>
                            Referencia Interna
                          </label>
                          <div className={styles.readonlyValue}>
                            {producto.referencia_proveedor || "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className={styles.fieldsRow}>
                        <div className={styles.readonlyField}>
                          <label className={styles.fieldLabel}>
                            Descripción
                          </label>
                          <div className={styles.readonlyValue}>
                            {producto.descripcion}
                          </div>
                        </div>
                      </div>

                      <div className={styles.fieldsRow}>
                        <div className={styles.readonlyField}>
                          <label className={styles.fieldLabel}>Marca</label>
                          <div className={styles.readonlyValue}>
                            {producto.marca}
                          </div>
                        </div>
                        <div className={styles.readonlyField}>
                          <label className={styles.fieldLabel}>Gramaje</label>
                          <div className={styles.readonlyValue}>
                            {producto.gramaje}
                          </div>
                        </div>
                        <div className={styles.readonlyField}>
                          <label className={styles.fieldLabel}>Embalaje</label>
                          <div className={styles.readonlyValue}>
                            {producto.embalaje}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información Financiera */}
                    <div className={styles.fieldGroup}>
                      <h4 className={styles.fieldGroupTitle}>
                        Información Financiera
                      </h4>
                      <div className={styles.fieldsRow}>
                        <div className={styles.readonlyField}>
                          <label className={styles.fieldLabel}>
                            Costo sin IVA
                          </label>
                          <div className={styles.readonlyValue}>
                            {formatCurrency(producto.costo_sin_iva)}
                          </div>
                        </div>
                        <div className={styles.readonlyField}>
                          <label className={styles.fieldLabel}>IVA</label>
                          <div className={styles.readonlyValue}>
                            {producto.iva ? `${producto.iva}%` : "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className={styles.fieldsRow}>
                        <div className={styles.readonlyField}>
                          <label className={styles.fieldLabel}>ICUI</label>
                          <div className={styles.readonlyValue}>
                            {formatCurrency(producto.icui)}
                          </div>
                        </div>
                        <div className={styles.readonlyField}>
                          <label className={styles.fieldLabel}>IBUA</label>
                          <div className={styles.readonlyValue}>
                            {formatCurrency(producto.ibua)}
                          </div>
                        </div>
                        <div className={styles.readonlyField}>
                          <label className={styles.fieldLabel}>IPO</label>
                          <div className={styles.readonlyValue}>
                            {formatCurrency(producto.ipo)}
                          </div>
                        </div>
                      </div>

                      <div className={styles.fieldsRow}>
                        <div className={styles.readonlyField}>
                          <label className={styles.fieldLabel}>
                            Pie Factura 1
                          </label>
                          <div className={styles.readonlyValue}>
                            {producto.pie_factura1
                              ? `${producto.pie_factura1}%`
                              : "N/A"}
                          </div>
                        </div>
                        <div className={styles.readonlyField}>
                          <label className={styles.fieldLabel}>
                            Pie Factura 2
                          </label>
                          <div className={styles.readonlyValue}>
                            {producto.pie_factura2
                              ? `${producto.pie_factura2}%`
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tipo de Codificación */}
                    <div className={styles.fieldGroup}>
                      <h4 className={styles.fieldGroupTitle}>
                        Tipo de Codificación
                      </h4>
                      <p className={styles.fieldDescription}>
                        <strong>Modifica:</strong> Actualiza información de un
                        producto existente. <br />
                        <strong>Nuevo:</strong> Producto que no existe
                        actualmente en nuestro sistema.
                      </p>
                      <div className={styles.itemTypeContainer}>
                        <div className={styles.checkboxGroup}>
                          <div className={styles.readonlyCheckbox}>
                            <div
                              className={`${styles.checkboxDisplay} ${
                                producto.item_modifica === 1
                                  ? styles.checked
                                  : styles.unchecked
                              }`}
                            >
                              {producto.item_modifica === 1 && (
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className={styles.checkboxIcon}
                                />
                              )}
                            </div>
                            <span className={styles.checkboxText}>
                              Modifica
                            </span>
                          </div>
                          <div className={styles.readonlyCheckbox}>
                            <div
                              className={`${styles.checkboxDisplay} ${
                                producto.item_nuevo === 1
                                  ? styles.checked
                                  : styles.unchecked
                              }`}
                            >
                              {producto.item_nuevo === 1 && (
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className={styles.checkboxIcon}
                                />
                              )}
                            </div>
                            <span className={styles.checkboxText}>Nuevo</span>
                          </div>
                        </div>

                        {producto.item_modifica === 1 && (
                          <div className={styles.readonlyField}>
                            <label className={styles.fieldLabel}>
                              Item Reemplaza
                            </label>
                            <div className={styles.readonlyValue}>
                              {producto.item_reemplaza || "No asignado"}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información de Procesamiento */}
                    {solicitudSeleccionada.estado !== "Generado" &&
                      solicitudSeleccionada.estado !== "En revision" &&
                      (producto.item_asignado ||
                        producto.aprobado !== null ||
                        producto.precio_venta > 0) && (
                        <div className={styles.fieldGroup}>
                          <h4 className={styles.fieldGroupTitle}>
                            Información de Procesamiento
                          </h4>
                          <div className={styles.fieldsRow}>
                            {producto.precio_venta > 0 && (
                              <div className={styles.readonlyField}>
                                <label className={styles.fieldLabel}>
                                  Precio de Venta
                                </label>
                                <div className={styles.readonlyValue}>
                                  {formatCurrency(producto.precio_venta)}
                                </div>
                              </div>
                            )}

                            {producto.item_asignado && (
                              <div className={styles.readonlyField}>
                                <label className={styles.fieldLabel}>
                                  Item Asignado
                                </label>
                                <div className={styles.readonlyValue}>
                                  {producto.item_asignado}
                                </div>
                              </div>
                            )}

                            {producto.aprobado !== null && (
                              <div className={styles.readonlyField}>
                                <label className={styles.fieldLabel}>
                                  Estado del Producto
                                </label>
                                <div
                                  className={`${styles.statusBadge} ${
                                    producto.aprobado === 1
                                      ? styles.statusSuccess
                                      : styles.statusError
                                  }`}
                                >
                                  {producto.aprobado === 1
                                    ? "Aprobado"
                                    : "Rechazado"}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Portafolios */}
                    {producto.portafolios &&
                      producto.portafolios.length > 0 && (
                        <div className={styles.fieldGroup}>
                          <h4 className={styles.fieldGroupTitle}>
                            Portafolios
                          </h4>
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
                                className={styles.portafolioItem}
                              >
                                <div
                                  className={`${styles.portafolioCheckbox} ${
                                    Array.isArray(producto.portafolios) &&
                                    producto.portafolios.includes(portafolio)
                                      ? styles.checked
                                      : styles.unchecked
                                  }`}
                                >
                                  {Array.isArray(producto.portafolios) &&
                                    producto.portafolios.includes(
                                      portafolio
                                    ) && (
                                      <FontAwesomeIcon
                                        icon={faCheck}
                                        className={styles.portafolioIcon}
                                      />
                                    )}
                                </div>
                                <span className={styles.portafolioText}>
                                  {portafolio}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Imágenes del Producto */}
                    <div className={styles.fieldGroup}>
                      <h4 className={styles.fieldGroupTitle}>
                        Imágenes del Producto
                      </h4>
                      <div className={styles.imagesSection}>
                        <div className={styles.imageRow}>
                          <div className={styles.imagePreview}>
                            <label className={styles.imageLabel}>Reverso</label>
                            <img
                              src={producto.foto_reverso || reverso}
                              alt="Reverso"
                              className={styles.productImage}
                              onClick={() =>
                                producto.foto_reverso &&
                                handleImageClick(
                                  producto.foto_reverso,
                                  "Reverso",
                                  "reverso"
                                )
                              }
                            />
                            {!producto.foto_reverso && (
                              <div className={styles.noImage}>Sin imagen</div>
                            )}
                          </div>

                          <div className={styles.imagePreview}>
                            <label className={styles.imageLabel}>Anverso</label>
                            <img
                              src={producto.foto_anverso || anverso}
                              alt="Anverso"
                              className={styles.productImage}
                              onClick={() =>
                                producto.foto_anverso &&
                                handleImageClick(
                                  producto.foto_anverso,
                                  "Anverso",
                                  "anverso"
                                )
                              }
                            />
                            {!producto.foto_anverso && (
                              <div className={styles.noImage}>Sin imagen</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Archivos Adjuntos */}
                    {producto.archivo_adjunto && (
                      <div className={styles.fieldGroup}>
                        <h4 className={styles.fieldGroupTitle}>
                          Archivos Adjuntos
                        </h4>
                        <div className={styles.fileSection}>
                          <button
                            className={styles.downloadFileButton}
                            onClick={() =>
                              handleDownload(producto.archivo_adjunto)
                            }
                          >
                            <FontAwesomeIcon icon={faDownload} />
                            <span>Descargar Archivos Adjuntos</span>
                          </button>
                          <p className={styles.fileInfo}>
                            Archivo: {producto.archivo_adjunto.split("/").pop()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Botón para volver */}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.backToListBtn}
                  onClick={handleCancel}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                  <span>Volver al Listado</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "correccion" && (
        <div className={styles.modernForm}>
          {/* Botón flotante para generar PDF */}
          <div className={styles.pdfButtonContainer}>
            <button
              onClick={generatePDF}
              className={`${styles.pdfButton} ${
                isDownloading ? styles.loading : ""
              }`}
              title="Generar PDF"
              disabled={isDownloading}
            >
              <FontAwesomeIcon icon={faFilePdf} />
              <span>{isDownloading ? "Generando PDF..." : "Generar PDF"}</span>
            </button>
          </div>

          <div className={styles.formHeader}>
            <div className={styles.headerContent}>
              <button className={styles.backButton} onClick={handleCancel}>
                <FontAwesomeIcon icon={faChevronLeft} />
                <span>Volver al Listado</span>
              </button>
              <div className={styles.titleSection}>
                <h1 className={styles.title}>
                  <span className={styles.titleIcon}>✏️</span>
                  Corregir Solicitud de Codificación
                </h1>
                <p className={styles.subtitle}>
                  Modifique los campos necesarios de la solicitud #{formData.id}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.formContainer}>
            <form onSubmit={handleEnviarCorreccion}>
              {/* Encabezado Moderno */}
              <div className={styles.companyCard}>
                <div className={styles.companyHeader}>
                  <div className={styles.logoSection}>
                    <img
                      src={logo}
                      alt="Logo Empresa"
                      className={styles.logo}
                    />
                    <div className={styles.companyBadge}>
                      <span>SOLICITUD #{formData.id}</span>
                    </div>
                  </div>
                  <div className={styles.companyInfo}>
                    <h2>Abastecemos de Occidente S.A.S</h2>
                    <div className={styles.companyDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>NIT:</span>
                        <span className={styles.detailValue}>900123456-7</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Dirección:</span>
                        <span className={styles.detailValue}>
                          Cra. 5 # 5-48, Yumbo, Valle del Cauca
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.providerSection}>
                  <div className={styles.providerCard}>
                    <h4>Información del Proveedor</h4>
                    <div className={styles.providerDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>
                          Fecha Solicitud:
                        </span>
                        <span className={styles.detailValue}>
                          {formatDate(formData.fecha)}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>NIT:</span>
                        <span className={styles.detailValue}>
                          {formData.nit}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Email:</span>
                        <span className={styles.detailValue}>
                          {formData.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado y Observaciones */}
              {solicitudSeleccionada && (
                <div className={styles.statusSection}>
                  <div
                    className={`${styles.statusCard} ${
                      solicitudSeleccionada.estado === "Aprobado"
                        ? styles.statusSuccess
                        : solicitudSeleccionada.estado === "Rechazado"
                        ? styles.statusError
                        : solicitudSeleccionada.estado === "Corregir"
                        ? styles.statusWarning
                        : styles.statusReview
                    }`}
                  >
                    <div className={styles.statusHeader}>
                      <FontAwesomeIcon
                        icon={
                          solicitudSeleccionada.estado === "Aprobado"
                            ? faCheckCircle
                            : solicitudSeleccionada.estado === "Rechazado"
                            ? faTimesCircle
                            : solicitudSeleccionada.estado === "Corregir"
                            ? faExclamationCircle
                            : faClock
                        }
                        className={styles.statusIcon}
                      />
                      <h3>Estado: {solicitudSeleccionada.estado}</h3>
                    </div>
                  </div>

                  {solicitudSeleccionada.observaciones?.trim() && (
                    <div className={styles.observationsCard}>
                      <div className={styles.observationsHeader}>
                        <FontAwesomeIcon icon={faInfoCircle} />
                        <h4>Observaciones</h4>
                      </div>
                      <p>{solicitudSeleccionada.observaciones}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Información del Comprador - EDITABLE */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionIcon}>📋</div>
                  <div>
                    <h3 className={styles.sectionTitle}>Comprador Asignado</h3>
                    <p className={styles.sectionSubtitle}>
                      Seleccione el comprador asignado
                    </p>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    Comprador Asignado{" "}
                    <span className={styles.required}>*</span>
                  </label>
                  <select
                    name="comprador"
                    value={formData.comprador}
                    onChange={handleChange}
                    className={styles.modernSelect}
                    required
                  >
                    <option value="">Seleccione un comprador...</option>
                    <option value="ANDREA">ANDREA</option>
                    <option value="CLAUDIA">CLAUDIA</option>
                    <option value="JAVID">JAVID</option>
                    <option value="JAZMIN">JAZMIN</option>
                    <option value="JEFFERSON">JEFFERSON</option>
                    <option value="LORENA">LORENA</option>
                    <option value="POLLO">POLLO</option>
                  </select>
                </div>
              </div>

              {/* Productos - EDITABLE */}
              {formData.productos.map((producto, index) => (
                <div key={index} className={styles.productCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.productHeader}>
                      <div className={styles.productNumber}>
                        <span>Producto {index + 1}</span>
                      </div>
                      <h3 className={styles.productTitle}>
                        Información del Producto
                      </h3>
                    </div>
                    {formData.productos.length > 1 && (
                      <button
                        type="button"
                        className={styles.deleteProductBtn}
                        onClick={() => eliminarProducto(index)}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                        <span>Eliminar</span>
                      </button>
                    )}
                  </div>

                  <div className={styles.productContent}>
                    {/* Información Básica - EDITABLE */}
                    <div className={styles.fieldGroup}>
                      <h4 className={styles.fieldGroupTitle}>
                        Información Básica
                      </h4>
                      <div className={styles.fieldsRow}>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Código de Barras{" "}
                            <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            name="codigoBarras"
                            value={producto.codigoBarras}
                            onChange={(e) =>
                              handleProductoNumericInput(index, e)
                            }
                            className={styles.modernInput}
                            placeholder="Ingrese el código de barras"
                            required
                          />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Referencia Interna
                          </label>
                          <input
                            type="text"
                            name="referenciaInterna"
                            value={producto.referenciaInterna}
                            onChange={(e) => handleProductoChange(index, e)}
                            className={styles.modernInput}
                            placeholder="Referencia del proveedor"
                          />
                        </div>
                      </div>

                      <div className={styles.fieldsRow}>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Descripción{" "}
                            <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            name="descripcion"
                            value={producto.descripcion}
                            onChange={(e) => handleProductoChange(index, e)}
                            className={styles.modernInput}
                            placeholder="Descripción del producto"
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.fieldsRow}>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Marca <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            name="marca"
                            value={producto.marca}
                            onChange={(e) => handleProductoChange(index, e)}
                            className={styles.modernInput}
                            placeholder="Marca del producto"
                            required
                          />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Gramaje <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            name="gramaje"
                            value={producto.gramaje}
                            onChange={(e) => handleProductoChange(index, e)}
                            className={styles.modernInput}
                            placeholder="Ej: 500 ML"
                            required
                          />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Embalaje <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            name="embalaje"
                            value={producto.embalaje}
                            onChange={(e) => handleProductoChange(index, e)}
                            className={styles.modernInput}
                            placeholder="Ej: C x 24 UNDS"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Información Financiera - EDITABLE */}
                    <div className={styles.fieldGroup}>
                      <h4 className={styles.fieldGroupTitle}>
                        Información Financiera
                      </h4>
                      <div className={styles.fieldsRow}>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Costo sin IVA{" "}
                            <span className={styles.required}>*</span>
                          </label>
                          <div className={styles.currencyInputWrapper}>
                            <span className={styles.currencySymbol}>$</span>
                            <input
                              type="text"
                              name="costoSinIVA"
                              value={producto.costoSinIVA}
                              onChange={(e) =>
                                handleProductoNumericInput(index, e)
                              }
                              onBlur={(e) => handleProductoBlur(index, e)}
                              onFocus={(e) => handleProductoFocus(index, e)}
                              className={styles.modernInput}
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>IVA</label>
                          <div className={styles.percentageInputWrapper}>
                            <input
                              type="text"
                              name="iva"
                              value={producto.iva}
                              onChange={(e) =>
                                handleProductoNumericInput(index, e)
                              }
                              onBlur={(e) => handleProductoBlur(index, e)}
                              onFocus={(e) => handleProductoFocus(index, e)}
                              className={styles.modernInput}
                              placeholder="0%"
                            />
                            <span className={styles.percentageSymbol}>%</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.fieldsRow}>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>ICUI</label>
                          <div className={styles.currencyInputWrapper}>
                            <span className={styles.currencySymbol}>$</span>
                            <input
                              type="text"
                              name="icui"
                              value={producto.icui}
                              onChange={(e) =>
                                handleProductoNumericInput(index, e)
                              }
                              onBlur={(e) => handleProductoBlur(index, e)}
                              onFocus={(e) => handleProductoFocus(index, e)}
                              className={styles.modernInput}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>IBUA</label>
                          <div className={styles.currencyInputWrapper}>
                            <span className={styles.currencySymbol}>$</span>
                            <input
                              type="text"
                              name="ibua"
                              value={producto.ibua}
                              onChange={(e) =>
                                handleProductoNumericInput(index, e)
                              }
                              onBlur={(e) => handleProductoBlur(index, e)}
                              onFocus={(e) => handleProductoFocus(index, e)}
                              className={styles.modernInput}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>IPO</label>
                          <div className={styles.currencyInputWrapper}>
                            <span className={styles.currencySymbol}>$</span>
                            <input
                              type="text"
                              name="ipo"
                              value={producto.ipo}
                              onChange={(e) =>
                                handleProductoNumericInput(index, e)
                              }
                              onBlur={(e) => handleProductoBlur(index, e)}
                              onFocus={(e) => handleProductoFocus(index, e)}
                              className={styles.modernInput}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>

                      <div className={styles.fieldsRow}>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Pie Factura 1
                          </label>
                          <div className={styles.percentageInputWrapper}>
                            <input
                              type="text"
                              name="pieFactura1"
                              value={producto.pieFactura1}
                              onChange={(e) =>
                                handleProductoNumericInput(index, e)
                              }
                              onBlur={(e) => handleProductoBlur(index, e)}
                              onFocus={(e) => handleProductoFocus(index, e)}
                              className={styles.modernInput}
                              placeholder="0%"
                            />
                            <span className={styles.percentageSymbol}>%</span>
                          </div>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>
                            Pie Factura 2
                          </label>
                          <div className={styles.percentageInputWrapper}>
                            <input
                              type="text"
                              name="pieFactura2"
                              value={producto.pieFactura2}
                              onChange={(e) =>
                                handleProductoNumericInput(index, e)
                              }
                              onBlur={(e) => handleProductoBlur(index, e)}
                              onFocus={(e) => handleProductoFocus(index, e)}
                              className={styles.modernInput}
                              placeholder="0%"
                            />
                            <span className={styles.percentageSymbol}>%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tipo de Codificación - EDITABLE */}
                    <div className={styles.fieldGroup}>
                      <h4 className={styles.fieldGroupTitle}>
                        Tipo de Codificación
                      </h4>
                      <div className={styles.itemTypeContainer}>
                        <div className={styles.checkboxGroup}>
                          <label className={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              name="modifica"
                              checked={producto.item.modifica || false}
                              onChange={(e) => handleProductoChange(index, e)}
                            />
                            <span className={styles.checkboxText}>
                              Modifica
                            </span>
                          </label>
                          <label className={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              name="nuevo"
                              checked={producto.item.nuevo || false}
                              onChange={(e) => handleProductoChange(index, e)}
                            />
                            <span className={styles.checkboxText}>Nuevo</span>
                          </label>
                        </div>

                        {producto.item.modifica && (
                          <div className={styles.field}>
                            <label className={styles.fieldLabel}>
                              Item Reemplaza{" "}
                              <span className={styles.required}>*</span>
                            </label>
                            <input
                              type="text"
                              name="itemReemplaza"
                              value={producto.itemReemplaza}
                              onChange={(e) => handleProductoChange(index, e)}
                              className={styles.modernInput}
                              placeholder="Ingrese el ítem a reemplazar"
                              maxLength={6}
                              required
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Imágenes del Producto - EDITABLE */}
                    <div className={styles.fieldGroup}>
                      <h4 className={styles.fieldGroupTitle}>
                        Imágenes del Producto{" "}
                        <span className={styles.required}>*</span>
                      </h4>
                      <div className={styles.imagesSection}>
                        <div className={styles.imageRow}>
                          <div className={styles.imageUpload}>
                            <label className={styles.imageLabel}>Reverso</label>
                            <img
                              src={
                                producto.imagePreview.reverso ||
                                producto.originalUrls?.reverso ||
                                reverso
                              }
                              alt="Reverso"
                              className={styles.productImage}
                              onClick={() => {
                                const imageUrl =
                                  producto.imagePreview.reverso ||
                                  producto.originalUrls?.reverso;
                                if (imageUrl && imageUrl !== reverso) {
                                  handleImageClick(
                                    imageUrl,
                                    "Reverso",
                                    "reverso"
                                  );
                                }
                              }}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleProductoImageChange(index, e, "reverso")
                              }
                              className={styles.fileInput}
                            />

                            {/* Mensaje de imagen actual */}
                            {producto.originalUrls?.reverso ? (
                              <p className={styles.fileInfo}>
                                Imagen actual cargada
                              </p>
                            ) : (
                              <p className={styles.fileWarning}>
                                * Imagen requerida
                              </p>
                            )}
                            {producto.fotos.reverso instanceof File && (
                              <p className={styles.fileInfo}>
                                Nueva imagen seleccionada
                              </p>
                            )}
                          </div>

                          <div className={styles.imageUpload}>
                            <label className={styles.imageLabel}>Anverso</label>
                            <img
                              src={
                                producto.imagePreview.anverso ||
                                producto.originalUrls?.anverso ||
                                anverso
                              }
                              alt="Anverso"
                              className={styles.productImage}
                              onClick={() => {
                                const imageUrl =
                                  producto.imagePreview.anverso ||
                                  producto.originalUrls?.anverso;
                                if (imageUrl && imageUrl !== anverso) {
                                  handleImageClick(
                                    imageUrl,
                                    "Anverso",
                                    "anverso"
                                  );
                                }
                              }}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleProductoImageChange(index, e, "anverso")
                              }
                              className={styles.fileInput}
                            />

                            {/* Mensaje de imagen actual */}
                            {producto.originalUrls?.anverso ? (
                              <p className={styles.fileInfo}>
                                Imagen actual cargada
                              </p>
                            ) : (
                              <p className={styles.fileWarning}>
                                * Imagen requerida
                              </p>
                            )}
                            {producto.fotos.anverso instanceof File && (
                              <p className={styles.fileInfo}>
                                Nueva imagen seleccionada
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Archivos Adjuntos - EDITABLE */}
                    <div className={styles.fieldGroup}>
                      <h4 className={styles.fieldGroupTitle}>
                        Archivos Adjuntos
                      </h4>
                      <div className={styles.filesSection}>
                        <div className={styles.fileInfoBox}>
                          <div className={styles.infoHeader}>
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              className={styles.infoIcon}
                            />
                            <h4>Requisitos para productos de consumo humano</h4>
                          </div>
                          <p>
                            Los siguientes requisitos deben estar comprimidos en
                            un solo archivo <strong>.zip</strong>:
                          </p>
                          <ul className={styles.requirementsList}>
                            <li>Concepto sanitario del fabricante</li>
                            <li>Ficha/s técnica/s del producto</li>
                            <li>Registro, permiso o notificación sanitaria</li>
                            <li>
                              INVIMA (para productos de la categoría de licores)
                            </li>
                          </ul>
                          <p className={styles.videoLink}>
                            ¿No sabes cómo comprimir archivos?{" "}
                            <span
                              onClick={() => setVideoModalOpen(true)}
                              className={styles.videoLinkText}
                            >
                              Ver video tutorial
                            </span>
                          </p>
                        </div>

                        <div className={styles.fileUploadBox}>
                          {/* Mostrar archivo actual correctamente */}
                          {(producto.originalUrls?.archivo ||
                            producto.archivoAdjunto) &&
                            !(producto.archivoAdjunto instanceof File) && (
                              <div className={styles.currentFile}>
                                <p>
                                  <strong>Archivo actual:</strong>{" "}
                                  {producto.nombreArchivo ||
                                    producto.originalUrls?.archivo
                                      ?.split("/")
                                      .pop() ||
                                    "archivo_adjunto.zip"}
                                </p>
                                <div className={styles.fileActions}>
                                  <button
                                    type="button"
                                    className={styles.downloadButton}
                                    onClick={() =>
                                      handleDownload(
                                        producto.originalUrls?.archivo ||
                                          producto.archivoAdjunto
                                      )
                                    }
                                  >
                                    <FontAwesomeIcon icon={faDownload} />{" "}
                                    Descargar
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.removeButton}
                                    onClick={() => handleRemoveFile(index)}
                                  >
                                    <FontAwesomeIcon icon={faTrashAlt} />{" "}
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            )}

                          <label className={styles.fileInputLabel}>
                            <input
                              type="file"
                              accept=".zip,.rar"
                              onChange={(e) =>
                                handleProductoFileChange(index, e)
                              }
                              className={styles.fileInput}
                            />
                            <span className={styles.fileInputText}>
                              {producto.archivoAdjunto instanceof File
                                ? producto.nombreArchivo
                                : "Seleccionar nuevo archivo .zip o .rar"}
                            </span>
                          </label>

                          {producto.archivoAdjunto instanceof File && (
                            <p
                              className={
                                producto.archivoValido
                                  ? styles.fileInfo
                                  : styles.fileError
                              }
                            >
                              {producto.nombreArchivo} (
                              {Math.round(producto.archivoAdjunto.size / 1024)}{" "}
                              KB)
                              {!producto.archivoValido &&
                                " - Archivo demasiado grande"}
                            </p>
                          )}

                          <p className={styles.fileHint}>
                            Tamaño máximo: 5MB. Formatos: .rar, .zip
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Botón para agregar más productos */}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.addProductBtn}
                  onClick={agregarProducto}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Agregar Otro Producto</span>
                </button>

                {/* Botones de enviar y cancelar */}
                <div className={styles.submitActions}>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={!isFormValid() || loading}
                  >
                    {loading ? (
                      <>
                        <div className={styles.spinner}></div>
                        Enviando Corrección...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Enviar Corrección
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={handleCancel}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {ModalImagenOpen && (
        <ModalImagen
          isOpen={ModalImagenOpen}
          onClose={() => setModalImagenOpen(false)}
          selectedImage={selectedImage}
        />
      )}

      {ModalTrazabilidadOpen && (
        <ModalTrazabilidad
          isOpen={ModalTrazabilidadOpen}
          onClose={() => setModalTrazabilidadOpen(false)}
          traceabilityData={traceabilityData}
        />
      )}
    </div>
  );
}

export default CodificacionProductos;
