import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { apiService } from "../../../services/api";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";
import styles from "./ProgramacionSeparata.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import logo from "../../../assets/images/logo.png";
import {
  faCalendarAlt,
  faSyncAlt,
  faSave,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faEdit,
  faTrash,
  faFileExcel,
  faFolderOpen,
  faExclamationTriangle,
  faFileDownload,
  faCircle,
  faPencilAlt,
  faCheckCircle,
  faTimesCircle,
  faArrowLeft,
  faDollarSign,
  faPercent,
  faBox,
  faStickyNote,
  faSearch,
  faHistory,
  faSearchPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const obtenerFechaLocal = (fechaString) => {
  if (!fechaString) return new Date();
  const fecha = new Date(fechaString + "T12:00:00");
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
};

const formatearFecha = (fecha) => {
  if (!fecha) return "";

  const fechaObj = new Date(fecha + "T12:00:00");
  const dia = fechaObj.getDate().toString().padStart(2, "0");
  const mes = (fechaObj.getMonth() + 1).toString().padStart(2, "0");
  const año = fechaObj.getFullYear();

  return `${dia}/${mes}/${año}`;
};

const ITEMS_PER_PAGE = 12;

const ProgramacionSeparata = ({}) => {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(false);
  const { user } = useAuth();
  const login = user?.login;
  const [separatas, setSeparatas] = useState([]);
  const [currentSeparata, setCurrentSeparata] = useState(null);
  const [separataItems, setSeparataItems] = useState([]);

  // Filtros y búsqueda
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Formulario de item
  const [ultimoCodigoBuscado, setUltimoCodigoBuscado] = useState("");
  const [codigoItem, setCodigoItem] = useState("");
  const [itemData, setItemData] = useState(null);
  const [descuento, setDescuento] = useState("");
  const [precioConDescuento, setPrecioConDescuento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [guardarDescuento, setGuardarDescuento] = useState(true);

  // Estados de UI
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [listasPreciosSeleccionadas, setListasPreciosSeleccionadas] = useState([
    "01",
    "30",
    "50",
    "06",
    "08",
    "13",
    "011",
  ]);
  const [editingSeparataId, setEditingSeparataId] = useState(null);
  const [tituloEditar, setTituloEditar] = useState("");
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [mostrarBotonReporte, setMostrarBotonReporte] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const pollingIntervalRef = useRef(null);

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    if (!searchInput) return separataItems;

    const searchLower = searchInput.toLowerCase();
    return separataItems.filter((item) =>
      Object.values(item).some(
        (value) =>
          value && value.toString().toLowerCase().includes(searchLower),
      ),
    );
  }, [separataItems, searchInput]);

  // Pagination calculations
  const paginationData = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

    return {
      currentItems,
      totalPages,
      hasItems: filteredItems.length > 0,
    };
  }, [filteredItems, currentPage, ITEMS_PER_PAGE]);

  // Cargar separatas
  const fetchSeparatas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getSeparatas();
      setSeparatas(response.data);
    } catch (error) {
      addNotification({
        message: "Error cargando separatas: " + (error.message || error),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Cargar items de separata
  const fetchSeparataItems = useCallback(
    async (separataId) => {
      setLoading(true);
      try {
        const response = await apiService.getSeparataItems(separataId);
        setSeparataItems(response.data);
      } catch (error) {
        addNotification({
          message: "Error cargando items: " + (error.message || error),
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [addNotification],
  );

  // Buscar datos del item
  const fetchItemData = useCallback(async () => {
    if (!codigoItem || loadingItem) return;

    // Evitar búsqueda duplicada del mismo código
    if (ultimoCodigoBuscado === codigoItem) {
      return;
    }

    setLoadingItem(true);
    setUltimoCodigoBuscado(codigoItem);

    try {
      const response = await apiService.getItemData(codigoItem);

      const responseData = response.data;

      // Verificar si la respuesta tiene los campos mínimos requeridos
      if (
        responseData &&
        responseData.descripcion &&
        responseData.precio_regular !== undefined
      ) {
        setItemData(responseData);
      } else {
        setItemData(null);
        addNotification({
          message: "El item no tiene información completa disponible",
          type: "warning",
        });
      }
    } catch (error) {
      console.error("Error en fetchItemData:", error);
      setItemData(null);

      // Manejar diferentes tipos de error
      if (error.response) {
        // El servidor respondió con un código de error
        if (error.response.status === 404) {
          addNotification({
            message: "Item no encontrado en el sistema",
            type: "warning",
          });
        } else if (error.response.status === 400) {
          addNotification({
            message: "Código de item inválido",
            type: "warning",
          });
        } else {
          addNotification({
            message: `Error del servidor: ${error.response.status}`,
            type: "error",
          });
        }
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        addNotification({
          message: "Error de conexión al buscar item",
          type: "error",
        });
      } else {
        // Algo pasó al configurar la petición
        addNotification({
          message: "Error buscando item: " + error.message,
          type: "error",
        });
      }
    } finally {
      setLoadingItem(false);
    }
  }, [codigoItem, addNotification, loadingItem, ultimoCodigoBuscado]);

  // Verificar separata existente
  const checkExistingSeparata = useCallback(async () => {
    if (!fechaInicio || !fechaFinal || currentSeparata) return;

    try {
      const response = await apiService.checkSeparata(fechaInicio, fechaFinal);
      if (response.data.exists && response.data.id) {
        // Buscar la separata completa en la lista actual o cargarla
        let separataCompleta = separatas.find((s) => s.id === response.data.id);

        if (!separataCompleta) {
          // Si no está en la lista actual, cargar los datos completos
          const separatasActualizadas = await fetchSeparatas();
          separataCompleta = separatasActualizadas.find(
            (s) => s.id === response.data.id,
          );
        }

        if (separataCompleta) {
          addNotification({
            message: "Separata existente encontrada, cargando...",
            type: "info",
          });
          await handleSelectSeparata(separataCompleta);
        }
      }
    } catch (error) {
      console.error("Error verificando separata:", error);
    }
  }, [
    fechaInicio,
    fechaFinal,
    currentSeparata,
    separatas,
    addNotification,
    fetchSeparatas,
  ]);

  // Efectos
  useEffect(() => {
    fetchSeparatas();
  }, [fetchSeparatas]);

  // Efecto para verificar separata existente cuando cambian las fechas
  useEffect(() => {
    if (fechaInicio && fechaFinal) {
      const timer = setTimeout(() => {
        checkExistingSeparata();
      }, 800); // Aumentado el debounce

      return () => clearTimeout(timer);
    }
  }, [fechaInicio, fechaFinal, checkExistingSeparata]);

  // Handlers
  const handleDateChange = (field, value) => {
    if (field === "inicio") setFechaInicio(value);
    if (field === "final") setFechaFinal(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectSeparata = async (separata) => {
    setCurrentSeparata(separata);
    setFechaInicio(separata.fecha_inicio);
    setFechaFinal(separata.fecha_final);
    setFechaLimite(separata.fecha_limite_edicion || "");
    await fetchSeparataItems(separata.id);
  };

  const handleBackToSeparatas = () => {
    setCurrentSeparata(null);
    setSeparataItems([]);
    setCurrentPage(1);
    setFechaInicio("");
    setFechaFinal("");
    setFechaLimite("");
    resetForm();
  };

  const resetForm = () => {
    setCodigoItem("");
    setItemData(null);
    setDescuento("");
    setPrecioConDescuento("");
    setObservaciones("");
    setGuardarDescuento(true);
  };

  // Handler para código de item
  const handleCodigoItemChange = (e) => {
    const valor = e.target.value;

    // Permitir solo números
    const valorNumerico = valor.replace(/\D/g, "");

    // Limitar a 6 dígitos
    const valorLimitado = valorNumerico.slice(0, 6);

    setCodigoItem(valorLimitado);

    // Si el usuario borra el código o cambia, limpiar los datos y último código buscado
    if (valorLimitado.length === 0 || valorLimitado !== ultimoCodigoBuscado) {
      setItemData(null);
      setUltimoCodigoBuscado("");
    }

    // Auto-rellenar con ceros inmediatamente cuando se complete
    if (valorLimitado.length === 6) {
      const codigoNormalizado = valorLimitado.padStart(6, "0");
      setCodigoItem(codigoNormalizado);
    }
  };

  // Handler para el enter
  const handleCodigoItemKeyPress = (e) => {
    if (e.key === "Enter") {
      const codigoNormalizado = codigoItem.padStart(6, "0");
      if (codigoNormalizado.length === 6) {
        setCodigoItem(codigoNormalizado);
        fetchItemData();
      }
    }
  };

  const checkLastUpdate = useCallback(async () => {
    try {
      const response = await apiService.getLastUpdate();
      const serverTimestamp = response.data.timestamp;

      if (!lastUpdate) {
        setLastUpdate(serverTimestamp);
        return;
      }

      if (serverTimestamp > lastUpdate) {
        setLastUpdate(serverTimestamp);

        // Recargar datos si hay cambios
        if (currentSeparata) {
          await fetchSeparataItems(currentSeparata.id);
          // También recargar la lista de separatas para títulos actualizados
          await fetchSeparatas();
        } else {
          await fetchSeparatas();
        }

        addNotification({
          message: "Datos actualizados",
          type: "info",
        });
      }
    } catch (error) {
      console.error("Error verificando actualizaciones:", error);
    }
  }, [
    lastUpdate,
    currentSeparata,
    fetchSeparataItems,
    fetchSeparatas,
    addNotification,
  ]);

  // Efecto para iniciar/detener polling
  useEffect(() => {
    // Iniciar polling cada 5 segundos
    pollingIntervalRef.current = setInterval(() => {
      checkLastUpdate();
    }, 5000);

    // Limpiar al desmontar
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [checkLastUpdate]);

  useEffect(() => {
    if (currentSeparata?.fecha_final) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const fechaFinalObj = new Date(currentSeparata.fecha_final);
      fechaFinalObj.setHours(0, 0, 0, 0);

      setMostrarBotonReporte(hoy > fechaFinalObj);
    } else {
      setMostrarBotonReporte(false);
    }
  }, [currentSeparata]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.querySelector(`.${styles.sidebar}`);
      const toggleButton = document.querySelector(`.${styles.sidebarToggle}`);

      if (
        sidebarVisible &&
        sidebar &&
        !sidebar.contains(event.target) &&
        toggleButton &&
        !toggleButton.contains(event.target)
      ) {
        setSidebarVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarVisible]);

  // Handler para cuando se pierde el foco del input
  const handleCodigoItemBlur = (e) => {
    if (codigoItem && codigoItem.length > 0) {
      const codigoNormalizado = codigoItem.padStart(6, "0");
      setCodigoItem(codigoNormalizado);
      if (
        codigoNormalizado.length === 6 &&
        codigoNormalizado !== ultimoCodigoBuscado
      ) {
        fetchItemData();
      }
    } else {
      setItemData(null);
      setUltimoCodigoBuscado("");
    }
  };

  const handleSaveItem = async () => {
    // Validación de campos requeridos antes de enviar
    if (!itemData) {
      addNotification({
        message: "Busque un ítem válido primero",
        type: "warning",
      });
      return;
    }

    // Validar campos obligatorios
    if (!codigoItem || !fechaInicio || !fechaFinal || !fechaLimite) {
      addNotification({
        message:
          "Faltan datos obligatorios: código del item, fecha inicio y fecha final",
        type: "warning",
      });
      return;
    }

    // Validar que el código tenga 6 dígitos
    if (codigoItem.length !== 6) {
      addNotification({
        message: "El código del item debe tener 6 dígitos",
        type: "warning",
      });
      return;
    }

    try {
      const payload = {
        item: codigoItem,
        descripcion: itemData.descripcion,
        linea2: itemData.linea2,
        precio_regular: itemData.precio_regular,
        precio_ahora: precioConDescuento,
        descuento: guardarDescuento ? descuento : 0,
        usuario: login,
        fecha_inicio: fechaInicio,
        fecha_final: fechaFinal,
        existencias: itemData.existencias,
        medida: itemData.medida,
        unidad_medida: itemData.unidad_medida,
        observaciones: observaciones,
        fecha_limite_edicion: fechaLimite,
      };

      console.log("Enviando payload:", payload); // Para debugging

      const response = await apiService.saveSeparataItem(payload);

      if (response.success) {
        addNotification({
          message: response.message || "Ítem guardado correctamente",
          type: "success",
        });
        resetForm();

        if (currentSeparata) {
          await fetchSeparataItems(currentSeparata.id);
        } else if (response.data.separata_id) {
          const nuevaSeparata = {
            id: response.data.separata_id,
            fecha_inicio: fechaInicio,
            fecha_final: fechaFinal,
          };
          await handleSelectSeparata(nuevaSeparata);
          await fetchSeparatas();
        }
      } else {
        const errorMessage = response.message || "Error al guardar el item";
        addNotification({
          message: errorMessage,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error en handleSaveItem:", error);

      // Mostrar el mensaje específico del servidor
      addNotification({
        message: error.message || "Error guardando item",
        type: "error",
      });
    }
  };

  const handleUpdateItem = async (itemData) => {
    try {
      const payload = {
        id: editingItem.id,
        descuento: itemData.descuento,
        precio_antes: itemData.precio_regular,
        precio_ahora: itemData.precio_ahora,
        usuario: login,
      };

      const response = await apiService.updateSeparataItem(payload);

      if (response.success) {
        addNotification({
          message: response.message || "Ítem actualizado correctamente",
          type: "success",
        });
        setEditingItem(null);
        if (currentSeparata) {
          await fetchSeparataItems(currentSeparata.id);
        }
      } else {
        const errorMessage = response.message || "Error al actualizar el item";
        addNotification({
          message: errorMessage,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error en handleUpdateItem:", error);

      if (error.response) {
        const serverMessage =
          error.response.data?.message || "Error del servidor";
        addNotification({
          message: serverMessage,
          type: "error",
        });
      } else if (error.request) {
        addNotification({
          message: "Error de conexión al actualizar el item",
          type: "error",
        });
      } else {
        addNotification({
          message: "Error actualizando item: " + error.message,
          type: "error",
        });
      }
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("¿Está seguro de eliminar este ítem?")) return;

    try {
      const response = await apiService.deleteSeparataItem(itemId, login);

      if (response.success) {
        addNotification({
          message: response.message || "Ítem eliminado correctamente",
          type: "success",
        });
        if (currentSeparata) {
          await fetchSeparataItems(currentSeparata.id);
        }
      } else {
        const errorMessage = response.message || "Error al eliminar el item";
        addNotification({
          message: errorMessage,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error en handleDeleteItem:", error);

      if (error.response) {
        const serverMessage = error.response.message || "Error del servidor";
        addNotification({
          message: serverMessage,
          type: "error",
        });
      } else if (error.request) {
        addNotification({
          message: "Error de conexión al eliminar el item",
          type: "error",
        });
      } else {
        addNotification({
          message: "Error eliminando item: " + error.message,
          type: "error",
        });
      }
    }
  };

  const handleUpdateFechaLimite = async () => {
    if (
      !currentSeparata ||
      !["LORENA", "JEFFERSON", "LUISAF"].includes(login.toUpperCase())
    )
      return;

    try {
      const response = await apiService.updateFechaLimite(
        currentSeparata.id,
        fechaLimite,
      );

      if (response.success) {
        addNotification({
          message: response.message || "Fecha límite actualizada correctamente",
          type: "success",
        });
        setCurrentSeparata({
          ...currentSeparata,
          fecha_limite_edicion: fechaLimite,
        });
      } else {
        const errorMessage =
          response.message || "Error al actualizar la fecha límite";
        addNotification({
          message: errorMessage,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error en handleUpdateFechaLimite:", error);

      if (error.response) {
        const serverMessage = error.response.message || "Error del servidor";
        addNotification({
          message: serverMessage,
          type: "error",
        });
      } else if (error.request) {
        addNotification({
          message: "Error de conexión al actualizar la fecha límite",
          type: "error",
        });
      } else {
        addNotification({
          message: "Error actualizando fecha límite: " + error.message,
          type: "error",
        });
      }
    }
  };

  const handleUpdateTitulo = async (separataId, nuevoTitulo) => {
    if (!["LORENA", "LUISAF", "JEFFERSON"].includes(login.toUpperCase()))
      return;

    setEditandoTitulo(true);
    try {
      const response = await apiService.updateSeparataTitle(
        separataId,
        nuevoTitulo,
        login,
      );

      if (response.success) {
        addNotification({
          message: response.message || "Título actualizado correctamente",
          type: "success",
        });
        await fetchSeparatas();
        if (currentSeparata && currentSeparata.id === separataId) {
          setCurrentSeparata({ ...currentSeparata, titulo: nuevoTitulo });
        }
        setEditingSeparataId(null);
        setTituloEditar("");
      } else {
        const errorMessage =
          response.message || "Error al actualizar el título";
        addNotification({
          message: errorMessage,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error en handleUpdateTitulo:", error);

      if (error.response) {
        const serverMessage =
          error.response.data?.message || "Error del servidor";
        addNotification({
          message: serverMessage,
          type: "error",
        });
      } else if (error.request) {
        addNotification({
          message: "Error de conexión al actualizar el título",
          type: "error",
        });
      } else {
        addNotification({
          message: "Error actualizando título: " + error.message,
          type: "error",
        });
      }
    } finally {
      setEditandoTitulo(false);
    }
  };

  // Cálculos y utilidades
  const calcularPrecioConDescuento = useCallback(() => {
    if (!itemData) return 0;
    if (precioConDescuento) return precioConDescuento;
    if (descuento) {
      const precioRegular = parseFloat(itemData.precio_regular);
      const valorDescuento = parseFloat(descuento) / 100;
      return Math.floor((precioRegular * (1 - valorDescuento)) / 50) * 50;
    }
    return 0;
  }, [itemData, descuento, precioConDescuento]);

  const esSeparataVigente = (fechaFinal) => {
    if (!fechaFinal) return false;
    const hoy = obtenerFechaLocal(new Date().toISOString().split("T")[0]);
    const fin = obtenerFechaLocal(fechaFinal);
    return hoy <= fin;
  };

  const formatearNumero = (valor) => {
    if (valor === null || valor === undefined) return "0";
    const numero = parseFloat(valor);
    return isNaN(numero) ? "0" : numero.toLocaleString("es-CO");
  };

  const handleDescuentoChange = (e) => {
    const valor = e.target.value;
    setDescuento(valor);

    if (itemData && valor) {
      const regular = parseFloat(itemData.precio_regular);
      const valorDescuento = parseFloat(valor) / 100;
      const conDescuento = regular * (1 - valorDescuento);
      setPrecioConDescuento(Math.floor(conDescuento / 50) * 50);
    } else {
      setPrecioConDescuento("");
    }
  };

  const handlePrecioConDescuentoChange = (e) => {
    const valor = e.target.value;
    setPrecioConDescuento(valor);

    if (itemData && valor) {
      const regular = parseFloat(itemData.precio_regular);
      const valorConDescuento = parseFloat(valor);
      const valorDescuento = 100 * (1 - valorConDescuento / regular);
      setDescuento(valorDescuento.toFixed(2));
    }
  };

  const validarFechas = () => {
    let mensajeError = "";

    if (
      fechaInicio &&
      fechaFinal &&
      new Date(fechaFinal) < new Date(fechaInicio)
    ) {
      mensajeError = "La fecha final no puede ser anterior a la fecha inicial";
    }

    if (
      fechaLimite &&
      fechaInicio &&
      new Date(fechaLimite) > new Date(fechaInicio)
    ) {
      mensajeError = mensajeError
        ? `${mensajeError} | La fecha límite no puede ser posterior a la fecha de inicio`
        : "La fecha límite no puede ser posterior a la fecha de inicio";
    }

    return mensajeError;
  };

  const exportarAExcel = async () => {
    if (!currentSeparata || separataItems.length === 0) {
      addNotification({
        message: "No hay datos para exportar",
        type: "warning",
      });
      return;
    }

    try {
      const libroTrabajo = new ExcelJS.Workbook();
      const hojaTrabajo = libroTrabajo.addWorksheet("Separata");

      const localesUnicos = new Set();
      separataItems.forEach((item) => {
        if (item.existencias && typeof item.existencias === "object") {
          Object.keys(item.existencias).forEach((local) => {
            if (!["00402", "00702", "01002"].includes(local)) {
              localesUnicos.add(local);
            }
          });
        }
      });

      const localesArray = Array.from(localesUnicos).sort();
      const totalColumnas = 10 + localesArray.length + 4;

      try {
        const response = await fetch(logo);
        const arrayBuffer = await response.arrayBuffer();

        const logoId = libroTrabajo.addImage({
          buffer: arrayBuffer,
          extension: "png",
        });

        hojaTrabajo.addImage(logoId, {
          tl: { col: 0.6, row: 0.6 },
          br: { col: 1.99, row: 3.6 },
        });
      } catch (error) {
        console.error("Error procesando imagen local", error);
      }

      for (let r = 1; r <= 4; r++) {
        for (let c = 1; c <= totalColumnas; c++) {
          hojaTrabajo.getCell(r, c).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF2F9F6" },
          };
          if (r === 4) {
            hojaTrabajo.getCell(r, c).border = {
              bottom: { style: "thick", color: { argb: "FF009B6D" } },
            };
          }
        }
      }

      for (let i = 1; i <= 4; i++) {
        hojaTrabajo.mergeCells(i, 3, i, totalColumnas);
      }
      hojaTrabajo.mergeCells(1, 1, 4, 2);

      hojaTrabajo.getRow(1).height = 25;
      hojaTrabajo.getRow(2).height = 20;
      hojaTrabajo.getRow(3).height = 20;
      hojaTrabajo.getRow(4).height = 20;
      hojaTrabajo.getRow(5).height = 15;

      const tituloEmpresa = hojaTrabajo.getCell(1, 3);
      tituloEmpresa.value =
        "SUPERMERCADO BELALCAZAR - ABASTECEMOS DE OCCIDENTE S.A.S";
      tituloEmpresa.font = {
        name: "Arial",
        size: 16,
        bold: true,
        color: { argb: "FF009B6D" },
      };
      tituloEmpresa.alignment = { vertical: "middle", horizontal: "left" };

      const subtituloReporte = hojaTrabajo.getCell(2, 3);
      subtituloReporte.value = "REPORTE DETALLADO DE SEPARATA PROMOCIONAL";
      subtituloReporte.font = {
        name: "Arial",
        size: 12,
        bold: true,
        color: { argb: "FF404040" },
      };
      subtituloReporte.alignment = { vertical: "middle", horizontal: "left" };

      const datosSeparata = hojaTrabajo.getCell(3, 3);
      const nombreSeparata =
        currentSeparata.titulo || `Separata ID: ${currentSeparata.id}`;
      datosSeparata.value = `Documento: ${nombreSeparata}`;
      datosSeparata.font = {
        name: "Arial",
        size: 11,
        bold: true,
        color: { argb: "FF202020" },
      };
      datosSeparata.alignment = { vertical: "middle", horizontal: "left" };

      const fechasSeparata = hojaTrabajo.getCell(4, 3);
      const fechaReporte = new Date().toLocaleDateString("es-CO");
      fechasSeparata.value = `Vigencia: ${currentSeparata.fecha_inicio} al ${currentSeparata.fecha_final}  |  Generado: ${fechaReporte}`;
      fechasSeparata.font = {
        name: "Arial",
        size: 10,
        italic: true,
        color: { argb: "FF606060" },
      };
      fechasSeparata.alignment = { vertical: "middle", horizontal: "left" };

      const estiloEncabezado = {
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF009B6D" },
        },
        font: {
          bold: true,
          color: { argb: "FFFFFFFF" },
          size: 11,
        },
        border: {
          top: { style: "thin", color: { argb: "FFBFBFBF" } },
          left: { style: "thin", color: { argb: "FFBFBFBF" } },
          bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
          right: { style: "thin", color: { argb: "FFBFBFBF" } },
        },
        alignment: { vertical: "middle", horizontal: "center" },
      };

      const estiloCelda = {
        border: {
          top: { style: "thin", color: { argb: "FFE7E6E6" } },
          left: { style: "thin", color: { argb: "FFE7E6E6" } },
          bottom: { style: "thin", color: { argb: "FFE7E6E6" } },
          right: { style: "thin", color: { argb: "FFE7E6E6" } },
        },
        alignment: { vertical: "middle" },
      };

      const encabezadosBase = [
        "#",
        "Comprador",
        "Linea 2",
        "Item",
        "Descripcion",
        "Unidad",
        "Gramaje",
        "Precio Antes",
        "Precio Ahora",
        "PUM",
      ];

      const encabezadosLocales = localesArray.map((local) => `Local ${local}`);

      const encabezadosFinales = [
        "Total Exist.",
        "Dcto",
        "Observaciones",
        "Ingreso",
      ];

      const encabezados = [
        ...encabezadosBase,
        ...encabezadosLocales,
        ...encabezadosFinales,
      ];

      const filaEncabezadosTabla = hojaTrabajo.getRow(6);
      filaEncabezadosTabla.values = encabezados;
      filaEncabezadosTabla.height = 30;

      filaEncabezadosTabla.eachCell((celda) => {
        celda.fill = estiloEncabezado.fill;
        celda.font = estiloEncabezado.font;
        celda.border = estiloEncabezado.border;
        celda.alignment = estiloEncabezado.alignment;
      });

      separataItems.forEach((item, indice) => {
        const medida = parseFloat(item.medida) || 1;
        const pum =
          medida > 0
            ? parseFloat((parseFloat(item.precio_ahora) / medida).toFixed(2))
            : 0;

        const filaValores = [
          indice + 1,
          item.usuario,
          item.linea2 || "",
          item.item,
          item.descripcion,
          item.unidad_medida,
          parseFloat(item.medida) || 0,
          parseFloat(item.precio_antes) || 0,
          parseFloat(item.precio_ahora) || 0,
          pum,
        ];

        let existenciasTotales = 0;

        localesArray.forEach((local) => {
          const cantidad =
            item.existencias && item.existencias[local]
              ? parseFloat(item.existencias[local]) || 0
              : 0;

          const cantidadMitad = Math.round(cantidad / 2);

          existenciasTotales += cantidadMitad;
          filaValores.push(cantidadMitad);
        });

        filaValores.push(existenciasTotales);
        filaValores.push(parseFloat(item.descuento) / 100);
        filaValores.push(item.observaciones);
        filaValores.push(item.created_at);

        const fila = hojaTrabajo.addRow(filaValores);

        fila.eachCell((celda) => {
          celda.border = estiloCelda.border;
          celda.alignment = estiloCelda.alignment;
        });

        fila.getCell(7).numFmt = "#,##0";
        fila.getCell(8).numFmt = '"$"#,##0';
        fila.getCell(9).numFmt = '"$"#,##0';
        fila.getCell(10).numFmt = '"$"#,##0.00';

        let colIndex = 11;
        localesArray.forEach(() => {
          fila.getCell(colIndex).numFmt = "#,##0";
          colIndex++;
        });

        fila.getCell(colIndex).numFmt = "#,##0";
        colIndex++;
        fila.getCell(colIndex).numFmt = "0%";
      });

      hojaTrabajo.columns.forEach((columna, i) => {
        let longitudMaxima = 12;
        if (i === 4) longitudMaxima = 45;
        if (i === 1) longitudMaxima = 15;

        columna.eachCell({ includeEmpty: false }, (celda, numeroFila) => {
          if (numeroFila > 5) {
            const valor = celda.value ? celda.value.toString() : "";
            const longitud = valor.length;
            if (longitud > longitudMaxima && i !== 4 && i !== 1) {
              longitudMaxima = longitud;
            }
          }
        });
        columna.width = longitudMaxima + 2;
      });

      const buffer = await libroTrabajo.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `Separata_${currentSeparata.id}_Belalcazar.xlsx`);

      addNotification({
        message: "Reporte corporativo generado correctamente",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      addNotification({
        message: "Error al generar el archivo corporativo",
        type: "error",
      });
    }
  };

  const agregarUnDia = (fechaString) => {
    const fecha = new Date(fechaString);
    fecha.setDate(fecha.getDate() + 1);
    return fecha.toISOString().split("T")[0];
  };

  const exportarATxt = (tipoPrecio) => {
    if (!currentSeparata || separataItems.length === 0) {
      addNotification({
        message: "No hay datos para exportar",
        type: "warning",
      });
      return;
    }

    const formatearCampo = (valor, tipo, longitud) => {
      if (tipo === "Num") {
        return valor.toString().padStart(longitud, "0");
      } else {
        return valor.padEnd(longitud, " ");
      }
    };

    const usarFecha =
      tipoPrecio === "regular"
        ? agregarUnDia(currentSeparata.fecha_final)
        : currentSeparata.fecha_inicio;

    let contenidoArchivo = "";

    separataItems.forEach((item) => {
      const precio =
        tipoPrecio === "regular"
          ? parseFloat(item.precio_antes)
          : parseFloat(item.precio_ahora);

      const precioFormateado = Math.round(precio * 10000);

      listasPreciosSeleccionadas.forEach((listaPrecios) => {
        const linea =
          formatearCampo("I", "Alf", 1) +
          formatearCampo("", "Alf", 15) +
          formatearCampo(item.item, "Num", 6) +
          formatearCampo("", "Alf", 3) +
          formatearCampo(precioFormateado, "Num", 13) +
          formatearCampo(item.unidad_medida, "Alf", 3) +
          formatearCampo("", "Alf", 40) +
          formatearCampo(0, "Num", 18) +
          formatearCampo(0, "Num", 18) +
          formatearCampo(0, "Num", 16) +
          formatearCampo(listaPrecios, "Alf", 3) +
          formatearCampo(formatearFecha(usarFecha), "Num", 8);

        contenidoArchivo += linea + "\r\n";
      });
    });

    const blob = new Blob([contenidoArchivo], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "UN00316B.TXT";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification({
      message: `Archivo UN00316B.TXT generado con ${listasPreciosSeleccionadas.length} listas de precios`,
      type: "success",
    });
  };

  const ordenarExistencias = (existencias) => {
    if (!existencias || typeof existencias !== "object") return {};

    return Object.entries(existencias)
      .sort(([localA], [localB]) => localA.localeCompare(localB))
      .reduce((ordenado, [local, valor]) => {
        ordenado[local] = valor;
        return ordenado;
      }, {});
  };

  const descargarReporteVentas = async () => {
    if (!currentSeparata) return;

    try {
      const blob = await apiService.downloadReporteVentas(currentSeparata.id);

      const fechaInicioFormateada = currentSeparata.fecha_inicio.replace(
        /-/g,
        "",
      );
      const fechaFinalFormateada = currentSeparata.fecha_final.replace(
        /-/g,
        "",
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `reporte_ventas_${fechaInicioFormateada}_${fechaFinalFormateada}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      addNotification({
        message: "Reporte de ventas descargado correctamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error descargando reporte:", error);
      addNotification({
        message: error.message || "Error al descargar el reporte de ventas",
        type: "error",
      });
    }
  };

  const errorFecha = validarFechas();

  if (loading) {
    return <LoadingScreen message="Cargando separatas..." />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Programación Separata</h1>
          <p className={styles.subtitle}>
            Gestión y programación de separatas promocionales
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={styles.mainLayout}>
        {/* Sidebar */}
        <div
          className={`${styles.sidebar} ${sidebarVisible ? styles.open : ""}`}
        >
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>
              {currentSeparata ? "Agregar Item" : "Nueva Separata"}
            </h3>

            <button
              className={styles.closeSidebar}
              onClick={() => setSidebarVisible(false)}
              title="Cerrar formulario"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className={styles.sidebarContent}>
            {/* Fecha Límite con floating label */}
            <div className={`${styles.formGroup} ${styles.floating}`}>
              <div className={styles.searchGroup}>
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className={styles.searchIcon}
                />
                <input
                  type="date"
                  className={styles.formInput}
                  value={fechaLimite}
                  onChange={(e) => setFechaLimite(e.target.value)}
                  disabled={
                    currentSeparata &&
                    !["LORENA", "JEFFERSON", "LUISAF"].includes(
                      login.toUpperCase(),
                    )
                  }
                />
                <label className={styles.formLabel}>Fecha Límite Edición</label>
                {currentSeparata &&
                  ["LORENA", "JEFFERSON", "LUISAF"].includes(
                    login.toUpperCase(),
                  ) && (
                    <button
                      className={styles.saveDateButton}
                      onClick={handleUpdateFechaLimite}
                    >
                      <FontAwesomeIcon icon={faSave} />
                      Guardar
                    </button>
                  )}
              </div>
            </div>

            {errorFecha && <div className={styles.error}>{errorFecha}</div>}

            {/* Código Item con floating label */}
            <div className={`${styles.formGroup} ${styles.floating}`}>
              <input
                type="text"
                className={styles.formInput}
                value={codigoItem}
                onChange={handleCodigoItemChange}
                onBlur={handleCodigoItemBlur}
                onKeyPress={handleCodigoItemKeyPress}
                maxLength={6}
                placeholder=" "
              />
              <label className={styles.formLabel}>
                Código Item (6 dígitos)
              </label>
              {loadingItem && (
                <div className={styles.loadingItem}>Buscando item...</div>
              )}
            </div>

            {itemData ? (
              <div className={styles.itemPreview}>
                <div className={styles.previewHeader}>
                  <FontAwesomeIcon icon={faBox} />
                  <h4>Información del Item</h4>
                </div>
                <div className={styles.previewItem}>
                  <span className={styles.previewLabel}>Descripción:</span>
                  <strong>{itemData.descripcion}</strong>
                </div>
                <div className={styles.previewItem}>
                  <span className={styles.previewLabel}>Precio Regular:</span>
                  <strong className={styles.precioRegular}>
                    ${formatearNumero(itemData.precio_regular)}
                  </strong>
                </div>
                <div className={styles.previewItem}>
                  <span className={styles.previewLabel}>Medida:</span>
                  <span>{formatearNumero(itemData.medida)}</span>
                </div>
                <div className={styles.previewItem}>
                  <span className={styles.previewLabel}>Unidad de Medida:</span>
                  <span>{itemData.unidad_medida}</span>
                </div>
                {itemData.existencias &&
                  Object.keys(itemData.existencias).length > 0 && (
                    <div className={styles.previewItem}>
                      <span className={styles.previewLabel}>Existencias:</span>
                      <div className={styles.existenciasList}>
                        {Object.entries(
                          ordenarExistencias(itemData.existencias),
                        ).map(([local, existencia]) => (
                          <span key={local} className={styles.existenciaItem}>
                            {local}: {formatearNumero(existencia)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : loadingItem ? (
              <div className={styles.itemPreview}>
                <div className={styles.previewHeader}>
                  <FontAwesomeIcon icon={faBox} />
                  <h4>Buscando información del item...</h4>
                </div>
              </div>
            ) : codigoItem &&
              codigoItem.length === 6 &&
              ultimoCodigoBuscado === codigoItem &&
              !loadingItem ? (
              <div className={styles.itemNotFound}>
                <div className={styles.notFoundHeader}>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <h4>Item no encontrado</h4>
                </div>
                <p>
                  No se encontró información para el código{" "}
                  <strong>{codigoItem}</strong>
                </p>
                <p className={styles.notFoundHint}>
                  Verifique que el código sea correcto y esté activo en el
                  sistema.
                </p>
              </div>
            ) : null}

            {/* Descuento con floating label */}
            <div className={`${styles.formGroup} ${styles.floating}`}>
              <div className={styles.inputWithCheckbox}>
                <input
                  type="number"
                  className={styles.formInput}
                  value={descuento}
                  onChange={handleDescuentoChange}
                  min="0"
                  max="100"
                  placeholder=" "
                />
                <label className={styles.formLabel}>
                  <FontAwesomeIcon icon={faPercent} />
                  Descuento (%)
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={guardarDescuento}
                    onChange={(e) => setGuardarDescuento(e.target.checked)}
                  />
                  Guardar %
                </label>
              </div>
            </div>

            {/* Precio Final con floating label */}
            <div className={`${styles.formGroup} ${styles.floating}`}>
              <input
                type="number"
                className={styles.formInput}
                value={precioConDescuento}
                onChange={handlePrecioConDescuentoChange}
                placeholder=" "
              />
              <label className={styles.formLabel}>
                <FontAwesomeIcon icon={faDollarSign} />
                Precio Final
              </label>
            </div>

            {/* Observaciones con floating label */}
            <div className={`${styles.formGroup} ${styles.floating}`}>
              <input
                type="text"
                className={styles.formInput}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder=" "
              />
              <label className={styles.formLabel}>
                <FontAwesomeIcon icon={faStickyNote} />
                Observaciones
              </label>
            </div>

            <button
              className={styles.saveButton}
              onClick={handleSaveItem}
              disabled={!itemData || errorFecha}
            >
              <FontAwesomeIcon icon={faSave} />
              {currentSeparata ? "Agregar a Separata" : "Crear Separata"}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Controls */}
          <div className={styles.controls}>
            <div className={styles.filters}>
              <button
                className={styles.sidebarToggle}
                onClick={() => setSidebarVisible(!sidebarVisible)}
                title="Mostrar/ocultar formulario"
              >
                <FontAwesomeIcon icon={sidebarVisible ? faTimes : faBox} />
                {sidebarVisible ? "Ocultar" : "Agregar Item"}
              </button>

              {/* Contenedor para fechas juntas */}
              <div className={styles.dateRangeContainer}>
                {/* Fecha Inicio con floating label */}
                <div
                  className={`${styles.formGroup} ${styles.floating} ${styles.dateGroup}`}
                >
                  <div className={styles.searchGroup}>
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className={styles.searchIcon}
                    />
                    <input
                      type="date"
                      className={styles.formInput}
                      value={fechaInicio}
                      onChange={(e) =>
                        handleDateChange("inicio", e.target.value)
                      }
                      placeholder=" "
                    />
                  </div>
                  <label className={styles.formLabel}>Fecha Inicio</label>
                </div>

                {/* Separador visual */}
                <div className={styles.dateSeparator}>
                  <span>a</span>
                </div>

                {/* Fecha Final con floating label */}
                <div
                  className={`${styles.formGroup} ${styles.floating} ${styles.dateGroup}`}
                >
                  <div className={styles.searchGroup}>
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className={styles.searchIcon}
                    />
                    <input
                      type="date"
                      className={styles.formInput}
                      value={fechaFinal}
                      onChange={(e) =>
                        handleDateChange("final", e.target.value)
                      }
                      placeholder=" "
                    />
                  </div>
                  <label className={styles.formLabel}>Fecha Final</label>
                </div>
              </div>

              <button
                className={styles.refreshButton}
                onClick={
                  currentSeparata
                    ? () => fetchSeparataItems(currentSeparata.id)
                    : fetchSeparatas
                }
                title="Actualizar datos"
              >
                <FontAwesomeIcon icon={faSyncAlt} />
              </button>

              <div className={styles.headerActions}>
                <button
                  className={styles.actionButton}
                  onClick={() => setShowHistoryModal(true)}
                  title="Consultar historial en separatas"
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    color: "#334155",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "600",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faHistory}
                    style={{ color: "#009b6d" }}
                  />{" "}
                  Historial Item
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{separatas.length}</span>
              <span className={styles.statLabel}>Separatas totales</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{separataItems.length}</span>
              <span className={styles.statLabel}>Items actuales</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>
                {currentSeparata
                  ? paginationData.totalPages
                  : Math.ceil(separatas.length / ITEMS_PER_PAGE)}
              </span>
              <span className={styles.statLabel}>Páginas</span>
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {currentSeparata ? (
              <SeparataDetailView
                separata={currentSeparata}
                items={paginationData.currentItems}
                paginationData={paginationData}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onBack={handleBackToSeparatas}
                onEditItem={setEditingItem}
                onDeleteItem={handleDeleteItem}
                login={login}
                onExport={() => setShowExportModal(true)}
                onExportExcel={exportarAExcel}
                onUpdateTitulo={handleUpdateTitulo}
                editingSeparataId={editingSeparataId}
                setEditingSeparataId={setEditingSeparataId}
                tituloEditar={tituloEditar}
                setTituloEditar={setTituloEditar}
                editandoTitulo={editandoTitulo}
                onDownloadReport={descargarReporteVentas}
                mostrarBotonReporte={mostrarBotonReporte}
              />
            ) : (
              <SeparatasListView
                separatas={separatas}
                onSelectSeparata={handleSelectSeparata}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                login={login}
                onUpdateTitulo={handleUpdateTitulo}
                editingSeparataId={editingSeparataId}
                setEditingSeparataId={setEditingSeparataId}
                tituloEditar={tituloEditar}
                setTituloEditar={setTituloEditar}
                editandoTitulo={editandoTitulo}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleUpdateItem}
          login={login}
        />
      )}

      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          listasPrecios={listasPreciosSeleccionadas}
          onListasChange={setListasPreciosSeleccionadas}
          separataActual={currentSeparata}
          itemsSeparata={separataItems}
          onExportTxt={exportarATxt}
          onExportExcel={exportarAExcel}
        />
      )}

      {showHistoryModal && (
        <ItemHistoryModal onClose={() => setShowHistoryModal(false)} />
      )}
    </div>
  );
};

const ItemHistoryModal = ({ onClose }) => {
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrandoSugerencias, setMostrandoSugerencias] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [inputFocused, setInputFocused] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    const handler = setTimeout(async () => {
      // NO buscar sugerencias si ya seleccionó un item
      if (itemSeleccionado) return;

      if (terminoBusqueda.length >= 3) {
        setLoadingSearch(true);

        try {
          const response =
            await apiService.searchItemHistorySuggestions(terminoBusqueda);

          if (response.success) {
            setSugerencias(response.data);
            setMostrandoSugerencias(true);
          }
        } catch (error) {
          console.error("Error buscando sugerencias:", error);
        } finally {
          setLoadingSearch(false);
        }
      } else {
        setSugerencias([]);
        setMostrandoSugerencias(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [terminoBusqueda, itemSeleccionado]);

  const seleccionarItem = async (item) => {
    setItemSeleccionado(true);

    setTerminoBusqueda(`${item.item} - ${item.descripcion}`);

    // Cerrar completamente sugerencias
    setSugerencias([]);
    setMostrandoSugerencias(false);

    setLoadingHistory(true);

    try {
      const response = await apiService.getItemHistoryExact(item.item);

      setHistorial(response.data || []);

      if (response.data.length === 0) {
        addNotification({
          message: "No existen registros en separatas para este item",
          type: "info",
        });
      }
    } catch (error) {
      setHistorial([]);
      addNotification({ message: error.message, type: "error" });
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.historyModalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>
            <FontAwesomeIcon icon={faHistory} /> Historial de Programaciones
          </h3>
          <button className={styles.modalClose} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={`${styles.modalBody} ${styles.historyModalBody}`}>
          <div className={`${styles.searchGroupContainer} ${styles.floating}`}>
            <div className={styles.searchGroupContainer}>
              {/* El input y el label flotante quedan fijos en este contenedor superior */}
              <div className={styles.inputFloatingWrapper}>
                <input
                  type="text"
                  className={styles.formInput}
                  value={terminoBusqueda}
                  onChange={(e) => {
                    setTerminoBusqueda(e.target.value);
                    setItemSeleccionado(false);
                  }}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => {
                    setTimeout(() => {
                      setInputFocused(false);
                    }, 150);
                  }}
                  placeholder="Ej. 000009 o Gelatina" /* Volvemos a poner tu placeholder original */
                  autoComplete="off"
                />
                <label className={styles.formLabel}>
                  Buscar por Código o Descripción
                </label>
              </div>

              {/* El botón ahora queda abajo del contenedor del input */}
              <button
                type="button"
                className={styles.saveButton}
                disabled={loadingHistory || !itemSeleccionado}
                onClick={() => seleccionarItem(terminoBusqueda)}
              >
                <FontAwesomeIcon
                  icon={loadingSearch ? faSyncAlt : faSearchPlus}
                  spin={loadingSearch}
                />
                <span>{loadingSearch ? "Buscando..." : "Buscar"}</span>
              </button>
            </div>

            {inputFocused && mostrandoSugerencias && sugerencias.length > 0 && (
              <ul className={styles.suggestionsList}>
                {sugerencias.map((sug, i) => (
                  <li
                    key={i}
                    className={styles.suggestionItem}
                    onClick={() => seleccionarItem(sug)}
                  >
                    <strong>{sug.item}</strong>
                    <span>{sug.descripcion}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {loadingHistory ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              Extrayendo informacion historica...
            </div>
          ) : (
            historial.length > 0 && (
              <div className={styles.historyTableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Separata</th>
                      <th>Vigencia</th>
                      <th>Precio Antes</th>
                      <th>Dcto</th>
                      <th>Precio Ahora</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((reg, i) => (
                      <tr key={i}>
                        <td>
                          <strong>
                            {reg.titulo || `Separata #${reg.separata_id}`}
                          </strong>
                        </td>
                        <td>{`${reg.fecha_inicio} a ${reg.fecha_final}`}</td>
                        <td>
                          $
                          {parseFloat(reg.precio_antes).toLocaleString("es-CO")}
                        </td>
                        <td>{parseFloat(reg.descuento)}%</td>
                        <td style={{ color: "#009b6d", fontWeight: "bold" }}>
                          $
                          {parseFloat(reg.precio_ahora).toLocaleString("es-CO")}
                        </td>
                        <td>{reg.usuario}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para lista de separatas en tabla (sin cambios)
const SeparatasListView = ({
  separatas,
  onSelectSeparata,
  currentPage,
  onPageChange,
  login,
  onUpdateTitulo,
  editingSeparataId,
  setEditingSeparataId,
  tituloEditar,
  setTituloEditar,
  editandoTitulo,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 12;

  const esSeparataVigente = (fechaFinal) => {
    if (!fechaFinal) return false;
    const hoy = obtenerFechaLocal(new Date().toISOString().split("T")[0]);
    const fin = obtenerFechaLocal(fechaFinal);
    return hoy <= fin;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const fechaObj = new Date(fecha + "T12:00:00");
    const dia = fechaObj.getDate().toString().padStart(2, "0");
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, "0");
    const año = fechaObj.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  const filteredSeparatas = useMemo(() => {
    if (!searchTerm) return separatas;
    const lowerSearch = searchTerm.toLowerCase();

    return separatas.filter((sep) => {
      const titulo = (sep.titulo || "").toLowerCase();
      const id = sep.id?.toString() || "";
      const fechaInicio = sep.fecha_inicio || "";
      const fechaFinal = sep.fecha_final || "";
      const limite = sep.fecha_limite_edicion || "";
      const estado = esSeparataVigente(sep.fecha_final)
        ? "vigente"
        : "finalizada";

      return (
        titulo.includes(lowerSearch) ||
        id.includes(lowerSearch) ||
        fechaInicio.includes(lowerSearch) ||
        fechaFinal.includes(lowerSearch) ||
        limite.includes(lowerSearch) ||
        estado.includes(lowerSearch)
      );
    });
  }, [separatas, searchTerm]);

  useEffect(() => {
    onPageChange(1);
  }, [searchTerm, onPageChange]);

  const totalPages = Math.ceil(filteredSeparatas.length / itemsPerPage);
  const currentItems = filteredSeparatas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeaderGroup}>
        <div className={styles.tableHeaderLeft}>
          <h3>Lista de Separatas</h3>
          <span className={styles.tableCount}>
            {filteredSeparatas.length} resultados
          </span>
        </div>

        <div className={styles.searchListContainer}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchListIcon} />
          <input
            type="text"
            placeholder="Buscar por titulo, fecha o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchListInput}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>Titulo</th>
              <th>Fecha Inicio</th>
              <th>Fecha Final</th>
              <th>Limite Edicion</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((separata, index) => (
              <tr key={separata.id} className={styles.tableRow}>
                <td className={styles.rowNumber}>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className={styles.titleCell}>
                  {editingSeparataId === separata.id ? (
                    <div className={styles.editarTituloContainer}>
                      <input
                        type="text"
                        className={styles.inputTitulo}
                        value={tituloEditar}
                        onChange={(e) => setTituloEditar(e.target.value)}
                        placeholder="Ingrese titulo"
                      />
                      <div className={styles.botonesTitulo}>
                        <button
                          className={styles.botonGuardarTitulo}
                          onClick={() =>
                            onUpdateTitulo(separata.id, tituloEditar)
                          }
                          disabled={editandoTitulo}
                        >
                          <FontAwesomeIcon icon={faCheckCircle} />
                        </button>
                        <button
                          className={styles.botonCancelarTitulo}
                          onClick={() => {
                            setEditingSeparataId(null);
                            setTituloEditar("");
                          }}
                        >
                          <FontAwesomeIcon icon={faTimesCircle} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.tituloContainer}>
                      <span className={styles.tituloText}>
                        {separata.titulo || `Separata #${separata.id}`}
                      </span>
                      {["LORENA", "LUISAF", "JEFFERSON"].includes(
                        login?.toUpperCase(),
                      ) && (
                        <button
                          className={styles.botonEditarTitulo}
                          onClick={() => {
                            setEditingSeparataId(separata.id);
                            setTituloEditar(separata.titulo || "");
                          }}
                          title="Editar titulo"
                        >
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td>{formatearFecha(separata.fecha_inicio)}</td>
                <td>{formatearFecha(separata.fecha_final)}</td>
                <td>
                  {separata.fecha_limite_edicion
                    ? formatearFecha(separata.fecha_limite_edicion)
                    : "No definida"}
                </td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      esSeparataVigente(separata.fecha_final)
                        ? styles.statusActive
                        : styles.statusInactive
                    }`}
                  >
                    <FontAwesomeIcon icon={faCircle} />
                    {esSeparataVigente(separata.fecha_final)
                      ? "Vigente"
                      : "Finalizada"}
                  </span>
                </td>
                <td>
                  <button
                    className={styles.tableButton}
                    onClick={() => onSelectSeparata(separata)}
                  >
                    <FontAwesomeIcon icon={faFolderOpen} />
                    Abrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSeparatas.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>No se encontraron registros</h3>
            <p>Ajuste el termino de busqueda o cree una nueva separata</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
            Anterior
          </button>

          <div className={styles.paginationInfo}>
            Pagina <strong>{currentPage}</strong> de {totalPages}
          </div>

          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </div>
  );
};

// Componente para vista detallada de separata en tabla (sin cambios)
const SeparataDetailView = ({
  separata,
  items,
  paginationData,
  currentPage,
  onPageChange,
  onBack,
  onEditItem,
  onDeleteItem,
  login,
  onExport,
  onUpdateTitulo,
  editingSeparataId,
  setEditingSeparataId,
  tituloEditar,
  setTituloEditar,
  editandoTitulo,
  onDownloadReport,
  mostrarBotonReporte,
}) => {
  const puedeEditar = [
    "LORENA",
    "LUISAF",
    "JEFFERSON",
    "JAZMIN",
    "JAVID",
    "OSCARG",
    "Liseth",
    "DUVER",
    "ANDREA",
    "NINI",
  ].includes(login?.toUpperCase());
  const haPasadoFechaLimite =
    separata?.fecha_limite_edicion &&
    new Date() > new Date(separata.fecha_limite_edicion);

  const handleGuardarTitulo = () => {
    onUpdateTitulo(separata.id, tituloEditar);
  };

  const handleCancelarEdicion = () => {
    setEditingSeparataId(null);
    setTituloEditar("");
  };

  const formatearNumero = (valor) => {
    if (valor === null || valor === undefined) return "0";
    const numero = parseFloat(valor);
    return isNaN(numero) ? "0" : numero.toLocaleString("es-CO");
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES");
  };

  return (
    <div className={styles.detailView}>
      <div className={styles.detailHeader}>
        <div className={styles.headerMain}>
          <button className={styles.backButton} onClick={onBack}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Volver
          </button>
          <div className={styles.headerTitle}>
            {editingSeparataId === separata.id ? (
              <div className={styles.editarTituloContainer}>
                <input
                  type="text"
                  className={styles.inputTituloGrande}
                  value={tituloEditar}
                  onChange={(e) => setTituloEditar(e.target.value)}
                  placeholder="Ingrese título de la separata"
                />
                <div className={styles.botonesTitulo}>
                  <button
                    className={styles.botonGuardarTitulo}
                    onClick={handleGuardarTitulo}
                    disabled={editandoTitulo}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </button>
                  <button
                    className={styles.botonCancelarTitulo}
                    onClick={handleCancelarEdicion}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.tituloContainer}>
                <h2>{separata.titulo || "Separata Sin Título"}</h2>
                {puedeEditar && (
                  <button
                    className={styles.botonEditarTitulo}
                    onClick={() => {
                      setEditingSeparataId(separata.id);
                      setTituloEditar(separata.titulo || "");
                    }}
                    title="Editar título"
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </button>
                )}
              </div>
            )}
            <span className={styles.dateRange}>
              {formatearFecha(separata.fecha_inicio)} a{" "}
              {formatearFecha(separata.fecha_final)}
            </span>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.exportButton} onClick={onExport}>
            <FontAwesomeIcon icon={faFileExcel} />
            Exportar
          </button>

          {mostrarBotonReporte && (
            <button
              className={styles.reportButton}
              onClick={onDownloadReport}
              title="Descargar reporte de ventas"
            >
              <FontAwesomeIcon icon={faFileDownload} />
              Reporte Ventas
            </button>
          )}
        </div>
      </div>

      {!puedeEditar && haPasadoFechaLimite && (
        <div className={styles.warningBanner}>
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>
            La fecha límite de edición ha pasado (
            {formatearFecha(separata.fecha_limite_edicion)}). Solo usuarios
            autorizados pueden modificar items.
          </span>
        </div>
      )}

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h3>Items de la Separata</h3>
          <span className={styles.tableCount}>{items.length} items</span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Código</th>
                <th>Descripción</th>
                <th>Precio Antes</th>
                <th>Descuento</th>
                <th>Precio Final</th>
                <th>Unidad</th>
                <th>Usuario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className={styles.tableRow}>
                  <td className={styles.rowNumber}>
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className={styles.codeCell}>{item.item}</td>
                  <td className={styles.descriptionCell}>
                    <div>
                      <strong>{item.descripcion}</strong>
                      {item.linea2 && (
                        <div className={styles.linea2}>{item.linea2}</div>
                      )}
                    </div>
                  </td>
                  <td className={styles.priceCell}>
                    ${formatearNumero(item.precio_antes)}
                  </td>
                  <td className={styles.discountCell}>
                    <span className={styles.discountValue}>
                      {item.descuento}%
                    </span>
                  </td>
                  <td className={styles.finalPriceCell}>
                    <strong>${formatearNumero(item.precio_ahora)}</strong>
                  </td>
                  <td>{item.unidad_medida}</td>
                  <td className={styles.userCell}>{item.usuario}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.tableActionButton}
                        onClick={() => onEditItem(item)}
                        disabled={!puedeEditar && haPasadoFechaLimite}
                        title={
                          !puedeEditar && haPasadoFechaLimite
                            ? "No tiene permisos para editar"
                            : "Editar item"
                        }
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className={`${styles.tableActionButton} ${styles.danger}`}
                        onClick={() => onDeleteItem(item.id)}
                        disabled={!puedeEditar && haPasadoFechaLimite}
                        title={
                          !puedeEditar && haPasadoFechaLimite
                            ? "No tiene permisos para eliminar"
                            : "Eliminar item"
                        }
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {items.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🛒</div>
              <h3>No hay items en esta separata</h3>
              <p>Agrega items usando el formulario lateral</p>
            </div>
          )}
        </div>
      </div>

      {paginationData.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
            Anterior
          </button>

          <div className={styles.paginationInfo}>
            Página <strong>{currentPage}</strong> de {paginationData.totalPages}
          </div>

          <button
            className={styles.paginationButton}
            onClick={() =>
              onPageChange(Math.min(currentPage + 1, paginationData.totalPages))
            }
            disabled={currentPage === paginationData.totalPages}
          >
            Siguiente
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </div>
  );
};

// Componente para tarjeta de separata (sin cambios)
const SeparataCard = React.memo(
  ({
    separata,
    index,
    onSelect,
    login,
    onUpdateTitulo,
    editingSeparataId,
    setEditingSeparataId,
    tituloEditar,
    setTituloEditar,
    editandoTitulo,
    esVigente,
  }) => {
    const puedeEditar = ["LORENA", "LUISAF", "JEFFERSON"].includes(
      login.toUpperCase(),
    );

    const handleGuardarTitulo = () => {
      onUpdateTitulo(separata.id, tituloEditar);
    };

    const handleCancelarEdicion = () => {
      setEditingSeparataId(null);
      setTituloEditar("");
    };

    return (
      <div
        className={`${styles.separataCard} ${
          esVigente ? styles.vigente : styles.noVigente
        }`}
      >
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            {editingSeparataId === separata.id ? (
              <div className={styles.editarTituloContainer}>
                <input
                  type="text"
                  className={styles.inputTitulo}
                  value={tituloEditar}
                  onChange={(e) => setTituloEditar(e.target.value)}
                  placeholder="Ingrese título"
                />
                <div className={styles.botonesTitulo}>
                  <button
                    className={styles.botonGuardarTitulo}
                    onClick={handleGuardarTitulo}
                    disabled={editandoTitulo}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </button>
                  <button
                    className={styles.botonCancelarTitulo}
                    onClick={handleCancelarEdicion}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.tituloContainer}>
                <h3>{separata.titulo || `Separata #${separata.id}`}</h3>
                {puedeEditar && (
                  <button
                    className={styles.botonEditarTitulo}
                    onClick={() => {
                      setEditingSeparataId(separata.id);
                      setTituloEditar(separata.titulo || "");
                    }}
                    title="Editar título"
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </button>
                )}
              </div>
            )}
            <span
              className={`${styles.statusIndicator} ${
                esVigente ? styles.active : styles.inactive
              }`}
            >
              <FontAwesomeIcon icon={faCircle} />
              {esVigente ? "Vigente" : "Finalizada"}
            </span>
          </div>
          <button
            className={styles.openButton}
            onClick={() => onSelect(separata)}
          >
            <FontAwesomeIcon icon={faFolderOpen} />
            Abrir
          </button>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.dateInfo}>
            <div className={styles.dateItem}>
              <span className={styles.dateLabel}>Inicio:</span>
              <span className={styles.dateValue}>{separata.fecha_inicio}</span>
            </div>
            <div className={styles.dateItem}>
              <span className={styles.dateLabel}>Final:</span>
              <span className={styles.dateValue}>{separata.fecha_final}</span>
            </div>
            <div className={styles.dateItem}>
              <span className={styles.dateLabel}>Límite Edición:</span>
              <span className={styles.dateValue}>
                {separata.fecha_limite_edicion || "No definida"}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <span className={styles.createdInfo}>
            Creada: {new Date(separata.created_at).toLocaleDateString()}
          </span>
          <span className={styles.separataNumber}>#{index}</span>
        </div>
      </div>
    );
  },
);

// Componente para tarjeta de item (sin cambios)
const ItemCard = React.memo(
  ({ item, index, onEdit, onDelete, puedeEditar, haPasadoFechaLimite }) => {
    const formatearNumero = (valor) => {
      if (valor === null || valor === undefined) return "0";
      const numero = parseFloat(valor);
      return isNaN(numero) ? "0" : numero.toLocaleString("es-CO");
    };

    const calcularDescuentoReal = () => {
      const precioAntes = parseFloat(item.precio_antes);
      const precioAhora = parseFloat(item.precio_ahora);
      if (precioAntes > 0 && precioAhora > 0) {
        return ((1 - precioAhora / precioAntes) * 100).toFixed(1);
      }
      return "0";
    };

    return (
      <div className={styles.itemCard}>
        <div className={styles.itemHeader}>
          <span className={styles.itemNumber}>#{index}</span>
          <span className={styles.itemUser}>{item.usuario}</span>
          <span className={styles.itemDate}>{item.created_at}</span>
        </div>

        <div className={styles.itemContent}>
          <div className={styles.itemMain}>
            <h4 className={styles.itemCode}>{item.item}</h4>
            <p className={styles.itemDescription}>{item.descripcion}</p>
            {item.linea2 && <p className={styles.itemLinea2}>{item.linea2}</p>}
          </div>

          <div className={styles.itemDetails}>
            <div className={styles.detailRow}>
              <span>Precio Antes:</span>
              <strong className={styles.precioAntes}>
                ${formatearNumero(item.precio_antes)}
              </strong>
            </div>
            <div className={styles.detailRow}>
              <span>Descuento:</span>
              <span className={styles.discount}>{item.descuento}%</span>
              <small className={styles.descuentoReal}>
                ({calcularDescuentoReal()}% real)
              </small>
            </div>
            <div className={styles.detailRow}>
              <span>Precio Final:</span>
              <strong className={styles.finalPrice}>
                ${formatearNumero(item.precio_ahora)}
              </strong>
            </div>
            <div className={styles.detailRow}>
              <span>Unidad:</span>
              <span>{item.unidad_medida}</span>
            </div>
          </div>

          {item.observaciones && (
            <div className={styles.itemObservations}>
              <span>Observaciones:</span>
              <p>{item.observaciones}</p>
            </div>
          )}
        </div>

        <div className={styles.itemActions}>
          <button
            className={styles.actionButton}
            onClick={() => onEdit(item)}
            disabled={!puedeEditar && haPasadoFechaLimite}
            title={
              !puedeEditar && haPasadoFechaLimite
                ? "No tiene permisos para editar"
                : "Editar item"
            }
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            className={`${styles.actionButton} ${styles.danger}`}
            onClick={() => onDelete(item.id)}
            disabled={!puedeEditar && haPasadoFechaLimite}
            title={
              !puedeEditar && haPasadoFechaLimite
                ? "No tiene permisos para eliminar"
                : "Eliminar item"
            }
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    );
  },
);

// Modal de Edición de Item (sin cambios)
const EditItemModal = ({ item, onClose, onSave, login }) => {
  const [descuentoEditar, setDescuentoEditar] = useState(item.descuento);
  const [precioRegularEditar, setPrecioRegularEditar] = useState(
    item.precio_antes,
  );
  const [precioConDescuentoEditar, setPrecioConDescuentoEditar] = useState(
    item.precio_ahora,
  );
  const [guardarDescuentoEditar, setGuardarDescuentoEditar] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleDescuentoChange = (e) => {
    const valor = e.target.value;
    setDescuentoEditar(valor);

    if (precioRegularEditar && valor) {
      const regular = parseFloat(precioRegularEditar);
      const valorDescuento = parseFloat(valor) / 100;
      const conDescuento = regular * (1 - valorDescuento);
      setPrecioConDescuentoEditar(Math.floor(conDescuento / 50) * 50);
    }
  };

  const handlePrecioConDescuentoChange = (e) => {
    const valor = e.target.value;
    setPrecioConDescuentoEditar(valor);

    if (precioRegularEditar && valor) {
      const regular = parseFloat(precioRegularEditar);
      const valorConDescuento = parseFloat(valor);
      const valorDescuento = 100 * (1 - valorConDescuento / regular);
      setDescuentoEditar(valorDescuento.toFixed(2));
    }
  };

  const handlePrecioRegularChange = (e) => {
    const valor = e.target.value;
    setPrecioRegularEditar(valor);

    if (descuentoEditar) {
      const regular = parseFloat(valor);
      const valorDescuento = parseFloat(descuentoEditar) / 100;
      const conDescuento = regular * (1 - valorDescuento);
      setPrecioConDescuentoEditar(Math.floor(conDescuento / 50) * 50);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave({
        descuento: guardarDescuentoEditar ? descuentoEditar : 0,
        precio_regular: precioRegularEditar,
        precio_ahora: precioConDescuentoEditar,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Editar Item</h3>
          <button className={styles.modalClose} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.itemInfo}>
            <strong>Ítem:</strong> {item.item} - {item.descripcion}
          </p>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Precio Regular</label>
            <input
              type="number"
              className={styles.formInput}
              value={precioRegularEditar}
              onChange={handlePrecioRegularChange}
              min="0"
              step="50"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Descuento (%)</label>
            <div className={styles.inputWithCheckbox}>
              <input
                type="number"
                className={styles.formInput}
                value={descuentoEditar}
                onChange={handleDescuentoChange}
                min="0"
                max="100"
                step="0.01"
              />
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={guardarDescuentoEditar}
                  onChange={(e) => setGuardarDescuentoEditar(e.target.checked)}
                />
                Guardar %
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Precio Final</label>
            <input
              type="number"
              className={styles.formInput}
              value={precioConDescuentoEditar}
              onChange={handlePrecioConDescuentoChange}
              min="0"
              step="any"
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de Exportación (sin cambios)
const ExportModal = ({
  onClose,
  listasPrecios,
  onListasChange,
  separataActual,
  itemsSeparata,
  onExportTxt,
  onExportExcel,
}) => {
  const [tipoExportacion, setTipoExportacion] = useState("final");
  const { addNotification } = useNotification();

  const handleListaPreciosChange = (listaPrecios) => {
    if (listasPrecios.includes(listaPrecios)) {
      onListasChange(listasPrecios.filter((pl) => pl !== listaPrecios));
    } else {
      onListasChange([...listasPrecios, listaPrecios]);
    }
  };

  const listasPreciosDisponibles = [
    { id: "01", nombre: "B1" },
    { id: "30", nombre: "B2" },
    { id: "50", nombre: "B5" },
    { id: "06", nombre: "B6" },
    { id: "08", nombre: "B8" },
    { id: "13", nombre: "B9" },
    { id: "011", nombre: "B11" },
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Exportar Separata</h3>
          <button className={styles.modalClose} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.exportSection}>
            <h4>Tipo de Exportación</h4>
            <div className={styles.exportOptions}>
              <label className={styles.exportOption}>
                <input
                  type="radio"
                  value="final"
                  checked={tipoExportacion === "final"}
                  onChange={(e) => setTipoExportacion(e.target.value)}
                />
                <div className={styles.exportOptionContent}>
                  <strong>Precio Final</strong>
                  <span>Usa precio con descuento y fecha inicial</span>
                </div>
              </label>
              <label className={styles.exportOption}>
                <input
                  type="radio"
                  value="regular"
                  checked={tipoExportacion === "regular"}
                  onChange={(e) => setTipoExportacion(e.target.value)}
                />
                <div className={styles.exportOptionContent}>
                  <strong>Precio Regular</strong>
                  <span>Usa precio regular con fecha final +1 día</span>
                </div>
              </label>
            </div>
          </div>

          <div className={styles.exportSection}>
            <h4>Listas de Precios</h4>
            <div className={styles.listasGrid}>
              {listasPreciosDisponibles.map((lista) => (
                <label key={lista.id} className={styles.listaOption}>
                  <input
                    type="checkbox"
                    checked={listasPrecios.includes(lista.id)}
                    onChange={() => handleListaPreciosChange(lista.id)}
                  />
                  <span>
                    {lista.id} ({lista.nombre})
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.exportInfo}>
            <p>
              <strong>Items a exportar:</strong> {itemsSeparata.length}
            </p>
            <p>
              <strong>Listas seleccionadas:</strong> {listasPrecios.length}
            </p>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={styles.exportTxtButton}
            onClick={() => {
              onExportTxt(tipoExportacion);
              onClose();
            }}
          >
            <FontAwesomeIcon icon={faFileDownload} />
            Exportar TXT
          </button>
          <button
            className={styles.exportExcelButton}
            onClick={() => {
              onExportExcel();
              onClose();
            }}
          >
            <FontAwesomeIcon icon={faFileExcel} />
            Exportar Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramacionSeparata;
