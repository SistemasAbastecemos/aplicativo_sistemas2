import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNotification } from "../../../contexts/NotificationContext";
import { useAuth } from "../../../contexts/AuthContext";
import { apiService } from "../../../services/api";
import LoadingScreen from "../../UI/LoadingScreen";
import ModalDetallesSolicitud from "./ModalDetallesSolicitud";
import ModalTrazabilidad from "./ModalTrazabilidad";
import styles from "./ActualizacionCostos.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../../../assets/images/logo.png";
import {
  faSearch,
  faPlus,
  faEye,
  faHistory,
  faFilter,
  faTimes,
  faCheckSquare,
  faSquare,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faEdit,
  faSave,
  faArrowLeft,
  faBarcode,
  faArrowRight,
  faBuilding,
  faCalendarAlt,
  faPercent,
  faIdCard,
  faPhone,
  faMapMarkerAlt,
  faFileAlt,
  faList,
  faBoxes,
  faLayerGroup,
  faStore,
  faUser,
  faDollarSign,
  faTag,
} from "@fortawesome/free-solid-svg-icons";

// Custom hook para debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Componente memoizado para items
const ItemRow = memo(
  ({
    item,
    isSelected,
    order,
    animation,
    onToggle,
    obtenerDescripcionCasa,
    renderizarCodigosBarrasMejorado,
  }) => {
    const claveItem = `${item.id_item}_${item.unimed_com}`;
    const descripcionCasa = obtenerDescripcionCasa(item.id_cricla1);

    return (
      <div
        className={`${styles.itemLista} ${
          isSelected ? styles.itemSeleccionado : ""
        } ${animation === "animando" ? styles.animando : ""}`}
        onClick={() => onToggle(claveItem)}
      >
        <div className={styles.checkboxItem}>
          <FontAwesomeIcon
            icon={isSelected ? faCheckSquare : faSquare}
            className={styles.iconoCheckboxItem}
          />
        </div>

        <div className={styles.contenidoItem}>
          <div className={styles.encabezadoItem}>
            <span className={styles.codigoItem}>{item.id_item}</span>
            <span className={styles.unidadItem}>{item.unimed_com}</span>
            {order && <span className={styles.ordenItem}>#{order}</span>}
          </div>

          <h4 className={styles.descripcionItem}>{item.descripcion}</h4>

          <div className={styles.metadatosItem}>
            <span className={styles.metadato}>
              <FontAwesomeIcon icon={faLayerGroup} />
              {item.d_linea1}
            </span>
            {item.id_cricla1 && (
              <span className={styles.metadato}>
                <FontAwesomeIcon icon={faStore} />
                {descripcionCasa}
              </span>
            )}
          </div>

          {renderizarCodigosBarrasMejorado(item)}
        </div>
      </div>
    );
  }
);

// Componente memoizado para selects optimizados
const OptimizedSelect = memo(
  ({ value, onChange, options, placeholder, className }) => (
    <select value={value} onChange={onChange} className={className}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.nombre}
        </option>
      ))}
    </select>
  )
);

const ActualizacionCostos = ({ login, nit }) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [cargando, setCargando] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [solicitudesPorPagina] = useState(8);
  const [trazabilidad, setTrazabilidad] = useState([]);
  const [itemsProveedor, setItemsProveedor] = useState([]);
  const [itemsSeleccionados, setItemsSeleccionados] = useState([]);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroLinea, setFiltroLinea] = useState("");
  const [filtroCasa, setFiltroCasa] = useState("");
  const [lineas, setLineas] = useState([]);
  const [casas, setCasas] = useState([]);
  const [compradores, setCompradores] = useState([]);
  const [compradorSeleccionado, setCompradorSeleccionado] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalNueva, setMostrarModalNueva] = useState(false);
  const [mostrarModalPaso2, setMostrarModalPaso2] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [proveedorInfo, setProveedorInfo] = useState(null);
  const [datosPaso2, setDatosPaso2] = useState([]);
  const [animacionItems, setAnimacionItems] = useState({});
  const [valoresEditados, setValoresEditados] = useState({});
  const [editandoInput, setEditandoInput] = useState(null);
  const [tipoActualizacion, setTipoActualizacion] = useState("pesos");
  const [porcentajeVariacion, setPorcentajeVariacion] = useState("");
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [mostrarModalTrazabilidad, setMostrarModalTrazabilidad] =
    useState(false);

  // Usar debounce para búsquedas
  const debouncedFiltroBusqueda = useDebounce(filtroBusqueda, 300);

  // Prevenir scroll del fondo cuando el modal está abierto
  useEffect(() => {
    if (
      mostrarModalNueva ||
      mostrarModalPaso2 ||
      mostrarModalDetalles ||
      mostrarModalTrazabilidad
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [
    mostrarModalNueva,
    mostrarModalPaso2,
    mostrarModalDetalles,
    mostrarModalTrazabilidad,
  ]);

  // Memoizar funciones de utilidad
  const formatearMoneda = useCallback((valor) => {
    if (valor === "" || valor === null || valor === undefined || isNaN(valor))
      return "0.00";
    const numero =
      typeof valor === "string"
        ? parseFloat(valor.replace(/[^\d.-]/g, "").replace(",", "."))
        : parseFloat(valor);
    if (isNaN(numero)) return "0.00";
    return numero.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, []);

  const formatearPorcentaje = useCallback((valor) => {
    if (valor === "" || valor === null || valor === undefined || isNaN(valor))
      return "0.0";
    const numero =
      typeof valor === "string"
        ? parseFloat(valor.replace(/[^\d.-]/g, "").replace(",", "."))
        : parseFloat(valor);
    if (isNaN(numero)) return "0.0";
    return numero.toFixed(1);
  }, []);

  const formatearGramaje = useCallback((valor) => {
    if (valor === "" || valor === null || valor === undefined || isNaN(valor))
      return "0";
    const numero =
      typeof valor === "string"
        ? parseFloat(valor.replace(/[^\d.-]/g, ""))
        : parseFloat(valor);
    if (isNaN(numero)) return "0";
    return Math.round(numero).toString();
  }, []);

  // Calcular porcentaje de IVA basado en id_impues
  const obtenerPorcentajeIVA = useCallback((idImpues) => {
    switch (idImpues) {
      case "1":
      case "9":
      case "c":
        return 19;
      case "5":
        return 5;
      case "7":
        return 15;
      case "8":
        return 7;
      default:
        return 0;
    }
  }, []);

  // Calcular IVA en pesos
  const calcularIVA = useCallback(
    (idImpues, costoSinIVA) => {
      const costo = parseFloat(costoSinIVA) || 0;
      const porcentajeIVA = obtenerPorcentajeIVA(idImpues);
      return (costo * porcentajeIVA) / 100;
    },
    [obtenerPorcentajeIVA]
  );

  const calcularPorcentajeVariacion = useCallback((costoActual, costoNuevo) => {
    const costoActualNum = parseFloat(costoActual) || 0;
    const costoNuevoNum = parseFloat(costoNuevo) || 0;

    if (costoActualNum === 0) {
      return costoNuevoNum > 0 ? 100 : 0;
    }

    return ((costoNuevoNum - costoActualNum) / costoActualNum) * 100;
  }, []);

  // Cargar datos
  useEffect(() => {
    cargarSolicitudes();
  }, [nit]);

  const cargarCompradores = useCallback(async () => {
    try {
      const compradoresData = [
        { id: 1, nombre: "JONATHAN" },
        { id: 29, nombre: "JAVID" },
        { id: 30, nombre: "JAZMIN" },
        { id: 31, nombre: "JEFFERSON" },
        { id: 32, nombre: "LORENA" },
        { id: 27, nombre: "ANDREA" },
        { id: 50, nombre: "CARLOS LINCE" },
      ];
      setCompradores(compradoresData);
    } catch (error) {
      addNotification({
        message: "Error al cargar los compradores" + error,
        type: "error",
      });
    }
  }, []);

  const cargarSolicitudes = useCallback(async () => {
    setCargando(true);
    try {
      const response = await apiService.getSolicitudesActualizacionCostos(
        user.nit
      );
      setSolicitudes(response);
    } catch (error) {
      addNotification({
        message: "Error al cargar solicitudes",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  }, [user.nit, addNotification]);

  const cargarItemsProveedor = useCallback(async () => {
    setCargando(true);
    try {
      const response = await apiService.getItemsProveedor(user.nit);

      if (
        response &&
        Array.isArray(response.items) &&
        Array.isArray(response.lineas) &&
        Array.isArray(response.casas)
      ) {
        const itemsOrdenados = [...response.items].sort((a, b) =>
          a.id_item.localeCompare(b.id_item)
        );

        setItemsProveedor(itemsOrdenados);
        setLineas(response.lineas);
        setCasas(response.casas);
      } else {
        addNotification({
          message: "response inválida del servidor",
          type: "warning",
        });
      }
    } catch (error) {
      addNotification({
        message: "Error al cargar los items",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  }, [user.nit, addNotification]);

  const cargarDetalleSolicitud = useCallback(
    async (idSolicitud) => {
      setCargando(true);
      try {
        const response =
          await apiService.getDetalleSolicitudesActualizacionCostos(
            idSolicitud
          );

        setSolicitudSeleccionada(response.data);
        setMostrarModalDetalles(true);
      } catch (error) {
        addNotification({
          message: "Error al cargar el detalle de la solicitud",
          type: "error",
        });
      } finally {
        setCargando(false);
      }
    },
    [addNotification]
  );

  const cargarTrazabilidad = useCallback(
    async (idSolicitud) => {
      setCargando(true);
      try {
        const response =
          await apiService.getTrazabilidadSolicitudesActualizacionCostos(
            idSolicitud
          );

        setTrazabilidad(response.data);
        setMostrarModalTrazabilidad(true);
      } catch (error) {
        addNotification({
          message: "Error al cargar la trazabilidad de la solicitud",
          type: "error",
        });
      } finally {
        setCargando(false);
      }
    },
    [addNotification]
  );

  // Memoizar cálculos costosos
  const obtenerDescripcionCasa = useCallback(
    (idCasa) => {
      const casa = casas.find((c) => c.id === idCasa);
      return casa ? casa.descripcion : idCasa;
    },
    [casas]
  );

  const obtenerClaveItem = useCallback(
    (item) => `${item.id_item}_${item.unimed_com}`,
    []
  );

  const estaItemSeleccionado = useCallback(
    (item) => itemsSeleccionados.includes(obtenerClaveItem(item)),
    [itemsSeleccionados, obtenerClaveItem]
  );

  // Memoizar datos filtrados y calculados
  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter((solicitud) => {
      const coincideBusqueda =
        solicitud.id.toString().includes(filtroBusqueda) ||
        solicitud.estado.includes(filtroBusqueda);
      const coincideEstado =
        filtroEstado === "todos" || solicitud.estado === filtroEstado;
      return coincideBusqueda && coincideEstado;
    });
  }, [solicitudes, filtroBusqueda, filtroEstado]);

  const indiceUltimaSolicitud = paginaActual * solicitudesPorPagina;
  const indicePrimeraSolicitud = indiceUltimaSolicitud - solicitudesPorPagina;
  const solicitudesPaginaActual = useMemo(
    () =>
      solicitudesFiltradas.slice(indicePrimeraSolicitud, indiceUltimaSolicitud),
    [solicitudesFiltradas, indicePrimeraSolicitud, indiceUltimaSolicitud]
  );

  const totalPaginas = useMemo(
    () => Math.ceil(solicitudesFiltradas.length / solicitudesPorPagina),
    [solicitudesFiltradas.length, solicitudesPorPagina]
  );

  useEffect(() => {
    setPaginaActual(1);
  }, [filtroBusqueda, filtroEstado]);

  // Memoizar funciones de paginación
  const cambiarPagina = useCallback((numeroPagina) => {
    setPaginaActual(numeroPagina);
  }, []);

  const paginaAnterior = useCallback(() => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  }, [paginaActual]);

  const paginaSiguiente = useCallback(() => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  }, [paginaActual, totalPaginas]);

  const obtenerNumerosPagina = useCallback(() => {
    const numeros = [];
    const paginasAMostrar = 5;

    let inicio = Math.max(1, paginaActual - Math.floor(paginasAMostrar / 2));
    let fin = Math.min(totalPaginas, inicio + paginasAMostrar - 1);

    inicio = Math.max(1, fin - paginasAMostrar + 1);

    for (let i = inicio; i <= fin; i++) {
      numeros.push(i);
    }

    return numeros;
  }, [paginaActual, totalPaginas]);

  // Optimizar filtrado de items
  const itemsFiltrados = useMemo(() => {
    const busqueda = debouncedFiltroBusqueda.toLowerCase();

    return itemsProveedor.filter((item) => {
      // Búsqueda más eficiente
      if (
        busqueda &&
        !item.descripcion.toLowerCase().includes(busqueda) &&
        !item.id_item.toLowerCase().includes(busqueda) &&
        !(
          item.codigos_barras &&
          item.codigos_barras.some((codigo) =>
            codigo.id_codbar.toLowerCase().includes(busqueda)
          )
        )
      ) {
        return false;
      }

      if (filtroLinea && item.d_linea1 !== filtroLinea) return false;
      if (filtroCasa && item.id_cricla1 !== filtroCasa) return false;

      return true;
    });
  }, [itemsProveedor, debouncedFiltroBusqueda, filtroLinea, filtroCasa]);

  const itemsOrdenados = useMemo(() => {
    if (!itemsFiltrados.length) return [];

    const seleccionadosOrdenados = itemsSeleccionados
      .map((clave) =>
        itemsFiltrados.find((item) => obtenerClaveItem(item) === clave)
      )
      .filter((item) => item !== undefined);

    const noSeleccionados = itemsFiltrados.filter(
      (item) => !itemsSeleccionados.includes(obtenerClaveItem(item))
    );

    return [...seleccionadosOrdenados, ...noSeleccionados];
  }, [itemsFiltrados, itemsSeleccionados, obtenerClaveItem]);

  // Memoizar funciones de selección
  const alternarSeleccionTodos = useCallback(() => {
    if (itemsSeleccionados.length === itemsFiltrados.length) {
      setItemsSeleccionados([]);
    } else {
      const nuevasClaves = itemsFiltrados.map((item) => obtenerClaveItem(item));
      setItemsSeleccionados(nuevasClaves);
    }
  }, [itemsFiltrados, itemsSeleccionados.length, obtenerClaveItem]);

  const alternarSeleccionItem = useCallback((claveItem) => {
    setItemsSeleccionados((prev) => {
      const nuevoArray = prev.includes(claveItem)
        ? prev.filter((clave) => clave !== claveItem)
        : [...prev, claveItem];

      setAnimacionItems((prev) => ({ ...prev, [claveItem]: "animando" }));

      setTimeout(() => {
        setAnimacionItems((prev) => ({ ...prev, [claveItem]: "completado" }));
      }, 300);

      return nuevoArray;
    });
  }, []);

  const obtenerOrdenItem = useCallback(
    (claveItem) => itemsSeleccionados.indexOf(claveItem) + 1,
    [itemsSeleccionados]
  );

  // Memoizar manejadores de eventos
  const abrirModalNueva = useCallback(() => {
    setItemsSeleccionados([]);
    setFiltroBusqueda("");
    setFiltroLinea("");
    setFiltroCasa("");
    setFechaInicio("");
    setAnimacionItems({});
    setValoresEditados({});
    setEditandoInput(null);
    setTipoActualizacion("pesos");
    setPorcentajeVariacion(0);
    cargarItemsProveedor();
    setMostrarModalNueva(true);
    setCompradorSeleccionado("");
    cargarCompradores();
  }, [cargarItemsProveedor, cargarCompradores]);

  const irAPaso2 = useCallback(() => {
    if (itemsSeleccionados.length === 0) {
      addNotification({
        message: "Debe seleccionar al menos un item",
        type: "warning",
      });
      return;
    }

    if (!fechaInicio) {
      addNotification({
        message: "Debe seleccionar una fecha de inicio",
        type: "warning",
      });
      return;
    }

    if (!compradorSeleccionado) {
      addNotification({
        message: "Debe seleccionar un comprador",
        type: "warning",
      });
      return;
    }

    const porcentajeNum = parseFloat(porcentajeVariacion) || 0;
    if (
      tipoActualizacion === "porcentaje" &&
      (porcentajeNum < -100 || porcentajeNum > 100)
    ) {
      addNotification({
        message: "El porcentaje de variacion debe estar en -100% y 100%",
        type: "warning",
      });
      return;
    }

    const itemsPaso2 = itemsSeleccionados.map((clave) => {
      const [id_item, unimed_com] = clave.split("_");
      const itemOriginal = itemsProveedor.find(
        (item) => item.id_item === id_item && item.unimed_com === unimed_com
      );

      const gramaje =
        itemOriginal.gramaje === 9999 || itemOriginal.gramaje === "9999"
          ? 0
          : itemOriginal.gramaje || 0;
      const porcentajeIVA = obtenerPorcentajeIVA(itemOriginal.id_impues);

      let costoSinIVANuevo = itemOriginal.costo_sin_iva_actual || 0;
      if (tipoActualizacion === "porcentaje") {
        const porcentajeNum = parseFloat(porcentajeVariacion) || 0;
        costoSinIVANuevo = costoSinIVANuevo * (1 + porcentajeNum / 100);
      }

      const porcentajeVariacionCalculado = calcularPorcentajeVariacion(
        itemOriginal.costo_sin_iva_actual,
        costoSinIVANuevo
      );

      return {
        ...itemOriginal,
        costo_sin_iva_nuevo: costoSinIVANuevo,
        icui: itemOriginal.icui || 0,
        ibua: itemOriginal.ibua || 0,
        ipo: itemOriginal.ipo || 0,
        pie_factura1: itemOriginal.pie_factura1 || 0,
        pie_factura2: itemOriginal.pie_factura2 || 0,
        gramaje: gramaje,
        porcentaje_iva: porcentajeIVA,
        iva: calcularIVA(
          itemOriginal.id_impues,
          itemOriginal.costo_sin_iva_actual
        ),
        porcentaje_variacion: porcentajeVariacionCalculado,
        codigo_barras_seleccionado:
          itemOriginal.codigos_barras && itemOriginal.codigos_barras.length > 0
            ? itemOriginal.codigos_barras[0].id_codbar
            : "",
        codigo_barras_manual: "",
      };
    });

    setDatosPaso2(itemsPaso2);
    setMostrarModalNueva(false);
    setMostrarModalPaso2(true);
  }, [
    itemsSeleccionados,
    fechaInicio,
    compradorSeleccionado,
    porcentajeVariacion,
    tipoActualizacion,
    itemsProveedor,
    addNotification,
    obtenerPorcentajeIVA,
    calcularPorcentajeVariacion,
    calcularIVA,
  ]);

  const actualizarDatoPaso2 = useCallback(
    (indice, campo, valor) => {
      const nuevosDatos = [...datosPaso2];

      if (campo === "gramaje") {
        const valorNumerico = Math.round(parseFloat(valor) || 0);
        nuevosDatos[indice][campo] = valorNumerico === 9999 ? 0 : valorNumerico;
      } else if (campo.includes("pie_factura")) {
        nuevosDatos[indice][campo] = parseFloat(valor) || 0;
      } else if (campo === "porcentaje_iva") {
        nuevosDatos[indice][campo] = parseFloat(valor) || 0;
        const costoActual =
          parseFloat(nuevosDatos[indice].costo_sin_iva_actual) || 0;
        nuevosDatos[indice].iva =
          (costoActual * nuevosDatos[indice][campo]) / 100;
      } else {
        nuevosDatos[indice][campo] = parseFloat(valor) || 0;
      }

      if (campo === "costo_sin_iva_actual") {
        const porcentajeIVA = nuevosDatos[indice].porcentaje_iva || 0;
        nuevosDatos[indice].iva = (parseFloat(valor) * porcentajeIVA) / 100;

        const costoNuevo =
          parseFloat(nuevosDatos[indice].costo_sin_iva_nuevo) || 0;
        nuevosDatos[indice].porcentaje_variacion = calcularPorcentajeVariacion(
          valor,
          costoNuevo
        );
      }

      if (campo === "costo_sin_iva_nuevo") {
        const costoActual =
          parseFloat(nuevosDatos[indice].costo_sin_iva_actual) || 0;
        const costoNuevo = parseFloat(valor) || 0;

        nuevosDatos[indice].porcentaje_variacion = calcularPorcentajeVariacion(
          costoActual,
          costoNuevo
        );

        if (nuevosDatos[indice].id_impues === "c") {
          nuevosDatos[indice].icui = costoNuevo * 0.2;
        }
      }

      setDatosPaso2(nuevosDatos);
    },
    [datosPaso2, calcularPorcentajeVariacion]
  );

  // Memoizar manejadores de inputs
  const manejarCambioPorcentajeVariacion = useCallback((e) => {
    const valor = e.target.value;

    if (valor === "" || valor === "-") {
      setPorcentajeVariacion(valor);
      return;
    }

    const regex = /^-?\d*\.?\d{0,1}$/;
    if (regex.test(valor)) {
      setPorcentajeVariacion(valor);
    }
  }, []);

  const manejarBlurPorcentajeVariacion = useCallback(() => {
    if (porcentajeVariacion === "" || porcentajeVariacion === "-") {
      setPorcentajeVariacion("0");
    } else {
      const numero = parseFloat(porcentajeVariacion);
      if (!isNaN(numero)) {
        setPorcentajeVariacion(numero.toFixed(1));
      } else {
        setPorcentajeVariacion("0");
      }
    }
  }, [porcentajeVariacion]);

  const manejarFocusInput = useCallback(
    (indice, campo, valorActual, tipo = "moneda") => {
      const clave = `${indice}-${campo}`;
      setEditandoInput(clave);

      let valorNumerico;
      if (tipo === "moneda") {
        valorNumerico =
          typeof valorActual === "number"
            ? valorActual
            : parseFloat(
                (valorActual || "0")
                  .toString()
                  .replace(/[^\d.-]/g, "")
                  .replace(",", ".")
              );
      } else if (tipo === "gramaje") {
        valorNumerico =
          typeof valorActual === "number"
            ? Math.round(valorActual)
            : Math.round(
                parseFloat(
                  (valorActual || "0").toString().replace(/[^\d]/g, "")
                )
              );
      } else if (tipo === "porcentaje") {
        valorNumerico =
          typeof valorActual === "number"
            ? valorActual
            : parseFloat(
                (valorActual || "0")
                  .toString()
                  .replace(/[^\d.-]/g, "")
                  .replace(",", ".")
              );
      } else {
        valorNumerico = valorActual || "";
      }

      if (isNaN(valorNumerico)) {
        valorNumerico =
          tipo === "gramaje" ? 0 : tipo === "porcentaje" ? 0.0 : 0.0;
      }

      let valorSinFormato;
      if (tipo === "moneda") {
        valorSinFormato = parseFloat(valorNumerico).toFixed(2);
      } else if (tipo === "gramaje") {
        valorSinFormato = Math.round(valorNumerico).toString();
      } else if (tipo === "porcentaje") {
        valorSinFormato = parseFloat(valorNumerico).toFixed(1);
      } else {
        valorSinFormato = valorNumerico.toString();
      }

      setValoresEditados((prev) => ({ ...prev, [clave]: valorSinFormato }));
    },
    []
  );

  const manejarCambioInput = useCallback(
    (e, indice, campo, tipo = "moneda") => {
      const valor = e.target.value;
      const clave = `${indice}-${campo}`;

      if (tipo === "moneda") {
        const regex = /^-?\d*\.?\d{0,2}$/;
        if (valor === "" || regex.test(valor)) {
          setValoresEditados((prev) => ({ ...prev, [clave]: valor }));
        }
      } else if (tipo === "gramaje") {
        const regex = /^\d*$/;
        if (valor === "" || regex.test(valor)) {
          setValoresEditados((prev) => ({ ...prev, [clave]: valor }));
        }
      } else if (tipo === "porcentaje") {
        const regex = /^-?\d*\.?\d{0,1}$/;
        if (valor === "" || regex.test(valor)) {
          setValoresEditados((prev) => ({ ...prev, [clave]: valor }));
        }
      } else {
        setValoresEditados((prev) => ({ ...prev, [clave]: valor }));
      }
    },
    []
  );

  const manejarBlurInput = useCallback(
    (e, indice, campo, tipo = "moneda") => {
      const clave = `${indice}-${campo}`;
      let valor = valoresEditados[clave] || "";

      if (valor === "") {
        setValoresEditados((prev) => {
          const nuevos = { ...prev };
          delete nuevos[clave];
          return nuevos;
        });
      } else {
        let valorNumerico;

        if (tipo === "gramaje") {
          valorNumerico = Math.round(parseFloat(valor) || 0);
          if (valorNumerico === 9999) valorNumerico = 0;
        } else if (tipo === "moneda" || tipo === "porcentaje") {
          valorNumerico = parseFloat(valor) || 0;
        } else {
          valorNumerico = valor;
        }

        if (campo === "codigo_barras_manual") {
          const nuevosDatos = [...datosPaso2];
          nuevosDatos[indice].codigo_barras_seleccionado = valorNumerico;
          nuevosDatos[indice].codigo_barras_manual = valorNumerico;
          setDatosPaso2(nuevosDatos);
        } else {
          actualizarDatoPaso2(indice, campo, valorNumerico);
        }
      }

      setEditandoInput(null);
      setValoresEditados((prev) => {
        const nuevos = { ...prev };
        delete nuevos[clave];
        return nuevos;
      });
    },
    [valoresEditados, datosPaso2, actualizarDatoPaso2]
  );

  // Memoizar funciones de utilidad de UI
  const obtenerValorDisplay = useCallback(
    (valor, tipo = "moneda") => {
      if (valor === "" || valor === null || valor === undefined) {
        if (tipo === "moneda") return "$0.00";
        if (tipo === "porcentaje") return "0.0%";
        if (tipo === "gramaje") return "0";
        return "";
      }

      const valorNumerico =
        typeof valor === "number" ? valor : parseFloat(valor);

      if (isNaN(valorNumerico)) {
        if (tipo === "moneda") return "$0.00";
        if (tipo === "porcentaje") return "0.0%";
        if (tipo === "gramaje") return "0";
        return "";
      }

      if (tipo === "moneda") {
        return `$${formatearMoneda(valorNumerico)}`;
      } else if (tipo === "porcentaje") {
        return `${formatearPorcentaje(valorNumerico)}%`;
      } else if (tipo === "gramaje") {
        return formatearGramaje(valorNumerico);
      }

      return valor.toString();
    },
    [formatearMoneda, formatearPorcentaje, formatearGramaje]
  );

  const obtenerClaseVariacion = useCallback((porcentaje) => {
    if (porcentaje === 0 || porcentaje === null || porcentaje === undefined) {
      return styles.variacionNeutra;
    } else if (porcentaje > 0) {
      return styles.variacionPositiva;
    } else {
      return styles.variacionNegativa;
    }
  }, []);

  const crearSolicitudDesdePaso2 = useCallback(async () => {
    setCargando(true);
    try {
      const errores = [];

      datosPaso2.forEach((item, index) => {
        const erroresItem = [];

        if (!item.costo_sin_iva_actual || item.costo_sin_iva_actual === 0) {
          erroresItem.push("Costo sin IVA actual vacío o 0");
        }

        if (!item.costo_sin_iva_nuevo || item.costo_sin_iva_nuevo === 0) {
          erroresItem.push("Costo sin IVA nuevo vacío o 0");
        }

        if (
          !item.codigo_barras_seleccionado ||
          item.codigo_barras_seleccionado === "0"
        ) {
          erroresItem.push("Código de barras inválido");
        }

        if (erroresItem.length > 0) {
          errores.push(
            `Ítem ${index + 1} (${item.id_item}): ${erroresItem.join(", ")}`
          );
        }
      });

      if (errores.length > 0) {
        addNotification({
          message: "Errores en los siguientes ítems:\n" + errores.join("\n"),
          type: "error",
        });
        setCargando(false);
        return;
      }

      const itemsParaEnviar = datosPaso2.map((item) => ({
        id_item: item.id_item,
        descripcion: item.descripcion,
        unimed_com: item.unimed_com,
        costo_sin_iva_actual: item.costo_sin_iva_actual,
        costo_sin_iva_nuevo: item.costo_sin_iva_nuevo,
        gramaje: item.gramaje,
        iva: item.porcentaje_iva,
        icui: item.icui,
        ibua: item.ibua,
        ipo: item.ipo,
        pie_factura1: item.pie_factura1,
        pie_factura2: item.pie_factura2,
        codigo_barras: item.codigo_barras_seleccionado,
      }));

      const response = await apiService.createSolicitudActualizacionCostos({
        nit: user.nit,
        fecha_inicio: fechaInicio,
        id_comprador: compradorSeleccionado,
        items: itemsParaEnviar,
      });

      if (response.success) {
        addNotification({
          message: "Solcitiud creada exitosamente",
          type: "success",
        });
        setMostrarModalPaso2(false);
        cargarSolicitudes();
      } else {
        addNotification({
          message: "Error al crear la solicitud: " + response.error,
          type: "error",
        });
      }
    } catch (error) {
      addNotification({
        message: "Error al crear solicitud",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  }, [
    datosPaso2,
    nit,
    fechaInicio,
    compradorSeleccionado,
    addNotification,
    cargarSolicitudes,
  ]);

  // Memoizar componentes de UI
  const renderizarBadgeEstadoMejorado = useCallback((estado) => {
    const configuraciones = {
      pendiente: { clase: styles.badgePendiente, icono: faClock },
      en_revision: { clase: styles.badgeRevision, icono: faEdit },
      aprobada: { clase: styles.badgeAprobada, icono: faCheckCircle },
      rechazada: { clase: styles.badgeRechazada, icono: faTimesCircle },
      aplicada: { clase: styles.badgeAplicada, icono: faSave },
    };

    const config = configuraciones[estado] || configuraciones.pendiente;

    return (
      <span className={`${styles.badgeEstado} ${config.clase}`}>
        <FontAwesomeIcon icon={config.icono} />
        {estado.replace("_", " ")}
      </span>
    );
  }, []);

  const renderizarCodigosBarrasMejorado = useCallback((item) => {
    if (!item.codigos_barras || item.codigos_barras.length === 0) {
      return (
        <div className={styles.codigosBarras}>
          <span className={styles.sinCodigoBarras}>
            <FontAwesomeIcon icon={faBarcode} />
            Sin códigos de barras
          </span>
        </div>
      );
    }

    return (
      <div className={styles.codigosBarras}>
        {item.codigos_barras.slice(0, 2).map((codigo, index) => (
          <div key={index} className={styles.codigoBarraItem}>
            <FontAwesomeIcon icon={faBarcode} />
            <span className={styles.codigoBarra}>{codigo.id_codbar}</span>
            {codigo.codbar_prov && (
              <span className={styles.codigoProveedor}>(Prov)</span>
            )}
          </div>
        ))}
        {item.codigos_barras.length > 2 && (
          <span className={styles.masCodigos}>
            +{item.codigos_barras.length - 2} más
          </span>
        )}
      </div>
    );
  }, []);

  // Optimizar manejadores de eventos de formulario
  const manejarCambioComprador = useCallback((e) => {
    setCompradorSeleccionado(e.target.value);
  }, []);

  const manejarCambioFecha = useCallback((e) => {
    setFechaInicio(e.target.value);
  }, []);

  const manejarCambioTipoActualizacion = useCallback((e) => {
    setTipoActualizacion(e.target.value);
  }, []);

  const manejarCambioFiltroBusqueda = useCallback((e) => {
    setFiltroBusqueda(e.target.value);
  }, []);

  const manejarCambioFiltroEstado = useCallback((e) => {
    setFiltroEstado(e.target.value);
  }, []);

  const manejarCambioFiltroLinea = useCallback((e) => {
    setFiltroLinea(e.target.value);
  }, []);

  const manejarCambioFiltroCasa = useCallback((e) => {
    setFiltroCasa(e.target.value);
  }, []);

  if (cargando && !mostrarModalNueva && !mostrarModalPaso2) {
    return <LoadingScreen />;
  }

  return (
    <div className={styles.contenedor}>
      {/* ENCABEZADO PRINCIPAL */}
      <div className={styles.encabezadoPrincipal}>
        <div className={styles.estadisticas}>
          <div className={styles.tarjetaEstadistica}>
            <div className={styles.iconoEstadistica}>
              <FontAwesomeIcon icon={faFileAlt} />
            </div>
            <div className={styles.contenidoEstadistica}>
              <span className={styles.valorEstadistica}>
                {solicitudes.length}
              </span>
              <span className={styles.etiquetaEstadistica}>
                Total Solicitudes
              </span>
            </div>
          </div>

          <div className={styles.tarjetaEstadistica}>
            <div className={styles.iconoEstadistica}>
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className={styles.contenidoEstadistica}>
              <span className={styles.valorEstadistica}>
                {solicitudes.filter((s) => s.estado === "pendiente").length}
              </span>
              <span className={styles.etiquetaEstadistica}>Pendientes</span>
            </div>
          </div>

          <div className={styles.tarjetaEstadistica}>
            <div className={styles.iconoEstadistica}>
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className={styles.contenidoEstadistica}>
              <span className={styles.valorEstadistica}>
                {solicitudes.filter((s) => s.estado === "aprobada").length}
              </span>
              <span className={styles.etiquetaEstadistica}>Aprobadas</span>
            </div>
          </div>

          <div className={styles.tarjetaEstadistica}>
            <div className={styles.iconoEstadistica}>
              <FontAwesomeIcon icon={faEdit} />
            </div>
            <div className={styles.contenidoEstadistica}>
              <span className={styles.valorEstadistica}>
                {solicitudes.filter((s) => s.estado === "en_revision").length}
              </span>
              <span className={styles.etiquetaEstadistica}>En Revisión</span>
            </div>
          </div>

          <button className={styles.botonNuevo} onClick={abrirModalNueva}>
            <FontAwesomeIcon icon={faPlus} />
            <span>Nueva Solicitud</span>
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className={styles.filtros}>
        <div className={styles.encabezadoFiltros}>
          <FontAwesomeIcon
            icon={faFilter}
            className={styles.iconoEncabezadoFiltros}
          />
          <h3>Filtros de Búsqueda</h3>
        </div>
        <div className={styles.contenidoFiltros}>
          <div className={styles.grupoFiltro}>
            <div className={styles.inputGrupo}>
              <FontAwesomeIcon icon={faSearch} className={styles.iconoFiltro} />
              <input
                type="text"
                placeholder="Buscar por ID de solicitud, estado..."
                value={filtroBusqueda}
                onChange={manejarCambioFiltroBusqueda}
                className={styles.inputBusqueda}
              />
            </div>
          </div>

          <div className={styles.grupoFiltro}>
            <label className={styles.etiquetaFiltro}>Filtrar por Estado</label>
            <select
              value={filtroEstado}
              onChange={manejarCambioFiltroEstado}
              className={styles.selectFiltro}
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_revision">En revisión</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
              <option value="aplicada">Aplicada</option>
            </select>
          </div>
        </div>
      </div>

      {/* LISTA DE SOLICITUDES */}
      {solicitudesFiltradas.length === 0 ? (
        <div className={styles.sinResultados}>
          <FontAwesomeIcon
            icon={faFileAlt}
            className={styles.iconoSinResultados}
          />
          <h3>No se encontraron solicitudes</h3>
          <p>No hay solicitudes que coincidan con los criterios de búsqueda</p>
          <button
            className={styles.botonCrearPrimera}
            onClick={abrirModalNueva}
          >
            <FontAwesomeIcon icon={faPlus} />
            Crear primera solicitud
          </button>
        </div>
      ) : (
        <div className={styles.contenedorSolicitudes}>
          <div className={styles.encabezadoLista}>
            <h3>Historial de Solicitudes</h3>
            <span className={styles.contadorResultados}>
              Mostrando {solicitudesPaginaActual.length} de{" "}
              {solicitudesFiltradas.length} solicitudes (Página {paginaActual}{" "}
              de {totalPaginas})
            </span>
          </div>

          <div className={styles.listaSolicitudes}>
            {solicitudesPaginaActual.map((solicitud) => (
              <div key={solicitud.id} className={styles.tarjetaSolicitud}>
                <div className={styles.encabezadoTarjeta}>
                  <div className={styles.infoPrincipal}>
                    <div className={styles.numeroSolicitud}>
                      <FontAwesomeIcon icon={faFileAlt} />
                      <span>Solicitud #{solicitud.id}</span>
                    </div>
                    {renderizarBadgeEstadoMejorado(solicitud.estado)}
                  </div>
                  <div className={styles.fechaCreacion}>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>
                      {new Date(solicitud.fecha_creacion).toLocaleDateString(
                        "es-CO",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>

                <div className={styles.cuerpoTarjeta}>
                  <div className={styles.detallesSolicitud}>
                    <div className={styles.detalleItem}>
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className={styles.iconoDetalle}
                      />
                      <div>
                        <label>Fecha Inicio</label>
                        <span>{solicitud.fecha_inicio || "No definida"}</span>
                      </div>
                    </div>

                    <div className={styles.detalleItem}>
                      <FontAwesomeIcon
                        icon={faBoxes}
                        className={styles.iconoDetalle}
                      />
                      <div>
                        <label>Items</label>
                        <span>{solicitud.cantidad_items || 0} productos</span>
                      </div>
                    </div>

                    <div className={styles.detalleItem}>
                      <FontAwesomeIcon
                        icon={faUser}
                        className={styles.iconoDetalle}
                      />
                      <div>
                        <label>Comprador</label>
                        <span>{solicitud.comprador || "No asignado"}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.accionesTarjeta}>
                    <button
                      className={styles.botonAccion}
                      onClick={() => cargarDetalleSolicitud(solicitud.id)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                      <span>Ver Detalles</span>
                    </button>

                    <button
                      className={styles.botonAccion}
                      onClick={() => cargarTrazabilidad(solicitud.id)}
                    >
                      <FontAwesomeIcon icon={faHistory} />
                      <span>Trazabilidad</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {solicitudesFiltradas.length > 0 && (
        <div className={styles.paginacion}>
          <div className={styles.infoPaginacion}>
            Mostrando {indicePrimeraSolicitud + 1}-
            {Math.min(indiceUltimaSolicitud, solicitudesFiltradas.length)} de{" "}
            {solicitudesFiltradas.length} solicitudes
          </div>

          <div className={styles.controlesPaginacion}>
            <button
              className={`${styles.botonPaginacion} ${
                paginaActual === 1 ? styles.botonDeshabilitado : ""
              }`}
              onClick={paginaAnterior}
              disabled={paginaActual === 1}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Anterior
            </button>

            <div className={styles.numerosPagina}>
              {obtenerNumerosPagina().map((numero) => (
                <button
                  key={numero}
                  className={`${styles.numeroPagina} ${
                    paginaActual === numero ? styles.paginaActiva : ""
                  }`}
                  onClick={() => cambiarPagina(numero)}
                >
                  {numero}
                </button>
              ))}
            </div>

            <button
              className={`${styles.botonPaginacion} ${
                paginaActual === totalPaginas ? styles.botonDeshabilitado : ""
              }`}
              onClick={paginaSiguiente}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL PASO 1 */}
      {mostrarModalNueva && (
        <div
          className={styles.overlayModal}
          onClick={(e) => {
            if (e.target === e.currentTarget) setMostrarModalNueva(false);
          }}
        >
          <div
            className={styles.modalGrande}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.encabezadoModal}>
              <div className={styles.tituloModal}>
                <FontAwesomeIcon icon={faPlus} />
                <div>
                  <h2>Nueva Solicitud de Actualización</h2>
                  <p>Paso 1: Selección de items y fecha de inicio</p>
                </div>
              </div>
              <button
                className={styles.botonCerrarModal}
                onClick={() => setMostrarModalNueva(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.cuerpoModal}>
              {/* ENCABEZADO INFORMATIVO */}
              <div className={styles.encabezadoInformacion}>
                <div className={styles.infoProveedorModal}>
                  <FontAwesomeIcon
                    icon={faBuilding}
                    className={styles.iconoInfoModal}
                  />
                  <div>
                    <h4>
                      Proveedor: {user.proveedor?.razon_social || "Cargando..."}
                    </h4>
                    <p>NIT: {user.nit || "Cargando..."}</p>
                  </div>
                </div>
                <div className={styles.estadisticasModal}>
                  <div className={styles.estadisticaModal}>
                    <FontAwesomeIcon icon={faBoxes} />
                    <span>{itemsProveedor.length} items disponibles</span>
                  </div>
                  <div className={styles.estadisticaModal}>
                    <FontAwesomeIcon icon={faCheckSquare} />
                    <span>{itemsSeleccionados.length} items seleccionados</span>
                  </div>
                </div>
              </div>

              {/* FORMULARIO DE FECHA */}
              <div className={styles.seccionFormulario}>
                <div className={styles.tarjetaFormulario}>
                  <div className={styles.encabezadoTarjetaFormulario}>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <h4>Información de la Solicitud</h4>
                  </div>
                  <div className={styles.cuerpoTarjetaFormulario}>
                    <div className={styles.formularioFila}>
                      <div className={styles.grupoFormulario}>
                        <label className={styles.etiquetaFormulario}>
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          Seleccione la fecha de inicio *
                        </label>
                        <input
                          type="date"
                          value={fechaInicio}
                          onChange={manejarCambioFecha}
                          className={styles.inputFormulario}
                          min={new Date().toISOString().split("T")[0]}
                        />
                        <p className={styles.ayudaFormulario}>
                          La fecha de inicio determina cuándo entrarán en vigor
                          los nuevos precios
                        </p>
                      </div>

                      <div className={styles.grupoFormulario}>
                        <label className={styles.etiquetaFormulario}>
                          <FontAwesomeIcon icon={faUser} />
                          Seleccione el comprador *
                        </label>
                        <OptimizedSelect
                          value={compradorSeleccionado}
                          onChange={manejarCambioComprador}
                          options={compradores}
                          placeholder="Seleccione un comprador"
                          className={styles.inputFormulario}
                        />
                        <p className={styles.ayudaFormulario}>
                          Seleccione el comprador responsable de revisar esta
                          solicitud
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TIPO DE ACTUALIZACIÓN */}
              <div className={styles.seccionTipoActualizacion}>
                <div className={styles.tarjetaTipoActualizacion}>
                  <div className={styles.encabezadoTarjetaTipoActualizacion}>
                    <FontAwesomeIcon icon={faPercent} />
                    <h4>Tipo de Actualización</h4>
                  </div>
                  <div className={styles.cuerpoTarjetaTipoActualizacion}>
                    <div className={styles.grupoTipoActualizacion}>
                      <label className={styles.opcionTipoActualizacion}>
                        <input
                          type="radio"
                          value="pesos"
                          checked={tipoActualizacion === "pesos"}
                          onChange={manejarCambioTipoActualizacion}
                        />
                        <div className={styles.contenidoOpcion}>
                          <FontAwesomeIcon
                            icon={faDollarSign}
                            className={styles.iconoOpcion}
                          />
                          <div>
                            <span className={styles.tituloOpcion}>
                              Ingresar valores en pesos
                            </span>
                            <span className={styles.descripcionOpcion}>
                              Ingresar manualmente el nuevo costo para cada ítem
                            </span>
                          </div>
                        </div>
                      </label>

                      <label className={styles.opcionTipoActualizacion}>
                        <input
                          type="radio"
                          value="porcentaje"
                          checked={tipoActualizacion === "porcentaje"}
                          onChange={manejarCambioTipoActualizacion}
                        />
                        <div className={styles.contenidoOpcion}>
                          <FontAwesomeIcon
                            icon={faPercent}
                            className={styles.iconoOpcion}
                          />
                          <div>
                            <span className={styles.tituloOpcion}>
                              Aplicar porcentaje de variación
                            </span>
                            <span className={styles.descripcionOpcion}>
                              Aplicar una variación porcentual a todos los ítems
                              seleccionados
                            </span>
                          </div>
                        </div>
                      </label>
                    </div>

                    {tipoActualizacion === "porcentaje" && (
                      <div className={styles.grupoPorcentaje}>
                        <label className={styles.etiquetaPorcentaje}>
                          <FontAwesomeIcon icon={faTag} />
                          Porcentaje de variación *
                        </label>
                        <div className={styles.inputGrupoPorcentaje}>
                          <input
                            type="text"
                            value={porcentajeVariacion}
                            onChange={manejarCambioPorcentajeVariacion}
                            onBlur={manejarBlurPorcentajeVariacion}
                            className={styles.inputPorcentaje}
                            placeholder="0.0"
                          />
                          <span className={styles.sufijoPorcentaje}>%</span>
                        </div>
                        <p className={styles.ayudaPorcentaje}>
                          Ingrese un porcentaje entre -100% y 100%. Se aplicará
                          a todos los ítems seleccionados.
                        </p>
                        {porcentajeVariacion &&
                          porcentajeVariacion !== "0" &&
                          porcentajeVariacion !== "0.0" && (
                            <div className={styles.resumenPorcentaje}>
                              <span className={styles.textoResumen}>
                                Se aplicará un {porcentajeVariacion}% de
                                variación a {itemsSeleccionados.length} ítems
                              </span>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* FILTROS DE ITEMS */}
              <div className={styles.seccionFiltrosItems}>
                <div className={styles.tarjetaFiltros}>
                  <div className={styles.encabezadoTarjetaFiltros}>
                    <FontAwesomeIcon icon={faFilter} />
                    <h4>Filtros de Búsqueda</h4>
                  </div>
                  <div className={styles.cuerpoTarjetaFiltros}>
                    <div className={styles.filtrosGrid}>
                      <div className={styles.grupoFiltroGrande}>
                        <div className={styles.inputGrupoGrande}>
                          <FontAwesomeIcon
                            icon={faSearch}
                            className={styles.iconoFiltroGrande}
                          />
                          <input
                            type="text"
                            placeholder="Buscar por descripción, código de item o código de barras..."
                            value={filtroBusqueda}
                            onChange={manejarCambioFiltroBusqueda}
                            className={styles.inputBusquedaGrande}
                          />
                        </div>
                      </div>

                      <div className={styles.grupoFiltroDoble}>
                        <div className={styles.grupoFiltroIndividual}>
                          <label className={styles.etiquetaFiltroIndividual}>
                            <FontAwesomeIcon icon={faLayerGroup} />
                            Línea de producto
                          </label>
                          <select
                            value={filtroLinea}
                            onChange={manejarCambioFiltroLinea}
                            className={styles.selectFiltroIndividual}
                          >
                            <option value="">Todas las líneas</option>
                            {lineas.map((linea, index) => (
                              <option key={index} value={linea}>
                                {linea}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className={styles.grupoFiltroIndividual}>
                          <label className={styles.etiquetaFiltroIndividual}>
                            <FontAwesomeIcon icon={faStore} />
                            Casa comercial
                          </label>
                          <select
                            value={filtroCasa}
                            onChange={manejarCambioFiltroCasa}
                            className={styles.selectFiltroIndividual}
                          >
                            <option value="">Todas las casas</option>
                            {casas.map((casa, index) => (
                              <option key={index} value={casa.id}>
                                {casa.descripcion}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* LISTA DE ITEMS */}
              <div className={styles.seccionItems}>
                <div className={styles.tarjetaItems}>
                  <div className={styles.encabezadoTarjetaItems}>
                    <div className={styles.infoSeleccion}>
                      <div
                        className={styles.checkboxSeleccion}
                        onClick={alternarSeleccionTodos}
                      >
                        <FontAwesomeIcon
                          icon={
                            itemsSeleccionados.length === itemsFiltrados.length
                              ? faCheckSquare
                              : faSquare
                          }
                          className={styles.iconoCheckbox}
                        />
                        <div>
                          <span className={styles.textoSeleccion}>
                            Seleccionar todos
                          </span>
                          <span className={styles.contadorSeleccion}>
                            {itemsFiltrados.length} items disponibles
                          </span>
                        </div>
                      </div>

                      <div className={styles.estadoSeleccion}>
                        <span className={styles.contadorSeleccionados}>
                          {itemsSeleccionados.length} items seleccionados
                        </span>
                        {itemsSeleccionados.length > 0 && (
                          <span className={styles.badgeSeleccion}>
                            Listo para continuar
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.cuerpoTarjetaItems}>
                    {cargando ? (
                      <div className={styles.cargandoItems}>
                        <LoadingScreen message="Cargando items..." />
                      </div>
                    ) : itemsFiltrados.length === 0 ? (
                      <div className={styles.sinItems}>
                        <FontAwesomeIcon icon={faSearch} />
                        <h4>No se encontraron items</h4>
                        <p>Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    ) : (
                      <div className={styles.listaItems}>
                        {itemsOrdenados.map((item) => {
                          const claveItem = obtenerClaveItem(item);
                          const orden = estaItemSeleccionado(item)
                            ? obtenerOrdenItem(claveItem)
                            : null;
                          const animacion = animacionItems[claveItem];

                          return (
                            <ItemRow
                              key={claveItem}
                              item={item}
                              isSelected={estaItemSeleccionado(item)}
                              order={orden}
                              animation={animacion}
                              onToggle={alternarSeleccionItem}
                              obtenerDescripcionCasa={obtenerDescripcionCasa}
                              renderizarCodigosBarrasMejorado={
                                renderizarCodigosBarrasMejorado
                              }
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.pieModal}>
              <button
                className={styles.botonSecundario}
                onClick={() => setMostrarModalNueva(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
                <span>Cancelar</span>
              </button>

              <div className={styles.estadoAvance}>
                <span className={styles.textoAvance}>
                  {itemsSeleccionados.length} items seleccionados
                </span>
                <span className={styles.badgeAvance}>Paso 1 de 2</span>
              </div>

              <button
                className={styles.botonPrimario}
                onClick={irAPaso2}
                disabled={
                  cargando ||
                  itemsSeleccionados.length === 0 ||
                  !fechaInicio ||
                  !compradorSeleccionado ||
                  (tipoActualizacion === "porcentaje" &&
                    (porcentajeVariacion === "" ||
                      porcentajeVariacion === "-" ||
                      isNaN(parseFloat(porcentajeVariacion)) ||
                      parseFloat(porcentajeVariacion) < -100 ||
                      parseFloat(porcentajeVariacion) > 100))
                }
              >
                <FontAwesomeIcon icon={faArrowRight} />
                <span>{cargando ? "Cargando..." : "Continuar al Paso 2"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PASO 2 - Se mantiene similar pero con handlers optimizados */}
      {mostrarModalPaso2 && (
        <div
          className={styles.overlayModal}
          onClick={(e) => {
            if (e.target === e.currentTarget) setMostrarModalPaso2(false);
          }}
        >
          <div
            className={styles.modalExtraGrande}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.encabezadoModal}>
              <h2>Formulario de Actualización de Costos</h2>
              <button
                className={styles.botonCerrarModal}
                onClick={() => setMostrarModalPaso2(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.cuerpoModal}>
              {/* ... contenido del modal paso 2 (similar al original pero con handlers optimizados) */}
              <div className={styles.encabezadoFormulario}>
                <div className={styles.seccionSuperior}>
                  <div className={styles.logoEmpresa}>
                    <img
                      src={logo}
                      alt="Logo Empresa"
                      className={styles.logoGrande}
                    />
                    <div className={styles.infoEmpresa}>
                      <h3>Abastecemos de Occidente S.A.S</h3>
                      <p>Sistema de Actualización de Costos</p>
                    </div>
                  </div>
                  <div className={styles.fechaSolicitud}>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>Fecha de Inicio: {fechaInicio}</span>
                  </div>
                </div>

                <div className={styles.seccionProveedor}>
                  <div className={styles.tarjetaProveedor}>
                    <div className={styles.encabezadoTarjetaProveedor}>
                      <FontAwesomeIcon icon={faBuilding} />
                      <h4>Información del Proveedor</h4>
                    </div>
                    <div className={styles.cuerpoTarjetaProveedor}>
                      <div className={styles.filaInfoProveedor}>
                        <div className={styles.itemInfoProveedor}>
                          <FontAwesomeIcon
                            icon={faIdCard}
                            className={styles.iconoInfo}
                          />
                          <div>
                            <label>NIT</label>
                            <span>{user.nit}</span>
                          </div>
                        </div>
                        <div className={styles.itemInfoProveedor}>
                          <FontAwesomeIcon
                            icon={faBuilding}
                            className={styles.iconoInfo}
                          />
                          <div>
                            <label>Razón Social</label>
                            <span>
                              {user.proveedor?.razon_social || "Cargando..."}
                            </span>
                          </div>
                        </div>
                        <div className={styles.itemInfoProveedor}>
                          <FontAwesomeIcon
                            icon={faPercent}
                            className={styles.iconoInfo}
                          />
                          <div>
                            <label>ICUI 2025</label>
                            <span>20%</span>
                          </div>
                        </div>
                      </div>

                      {proveedorInfo && (
                        <div className={styles.filaInfoProveedor}>
                          <div className={styles.itemInfoProveedor}>
                            <FontAwesomeIcon
                              icon={faMapMarkerAlt}
                              className={styles.iconoInfo}
                            />
                            <div>
                              <label>Dirección</label>
                              <span>{proveedorInfo.direccion_1 || "N/A"}</span>
                            </div>
                          </div>
                          <div className={styles.itemInfoProveedor}>
                            <FontAwesomeIcon
                              icon={faPhone}
                              className={styles.iconoInfo}
                            />
                            <div>
                              <label>Teléfono</label>
                              <span>{proveedorInfo.telefono_1 || "N/A"}</span>
                            </div>
                          </div>
                          <div className={styles.itemInfoProveedor}>
                            <FontAwesomeIcon
                              icon={faCalendarAlt}
                              className={styles.iconoInfo}
                            />
                            <div>
                              <label>Items Seleccionados</label>
                              <span>{datosPaso2.length} productos</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.contenedorTabla}>
                <div className={styles.tablaScroll}>
                  <table className={styles.tabla}>
                    <thead>
                      <tr>
                        <th className={styles.columnaNumero}>No.</th>
                        <th className={styles.columnaCodigoBarras}>
                          Código de Barras
                        </th>
                        <th className={styles.columnaDescripcion}>
                          DESCRIPCIÓN
                        </th>
                        <th className={styles.columnaItem}>ITEM</th>
                        <th className={styles.columnaUnidad}>U.M</th>
                        <th className={styles.columnaGramaje}>GRAMAJE</th>
                        <th className={styles.columnaIva}>% IVA</th>
                        <th className={styles.columnaCostoActual}>
                          COSTO SIN IVA Actual
                        </th>
                        <th className={styles.columnaCostoNuevo}>
                          COSTO SIN IVA Nuevo
                        </th>
                        <th className={styles.columnaVariacion}>% Variación</th>
                        <th className={styles.columnaIcui}>ICUI</th>
                        <th className={styles.columnaIbua}>IBUA</th>
                        <th className={styles.columnaIpo}>IPO</th>
                        <th className={styles.columnaPie1}>Pie Factura 1</th>
                        <th className={styles.columnaPie2}>Pie Factura 2</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datosPaso2.map((item, index) => (
                        <tr key={index} className={styles.filaTabla}>
                          <td className={styles.columnaNumero}>{index + 1}</td>
                          <td className={styles.columnaCodigoBarras}>
                            {item.codigos_barras &&
                            item.codigos_barras.length > 0 ? (
                              <select
                                value={item.codigo_barras_seleccionado}
                                onChange={(e) =>
                                  actualizarDatoPaso2(
                                    index,
                                    "codigo_barras_seleccionado",
                                    e.target.value
                                  )
                                }
                                className={styles.selectCodigoBarras}
                                disabled={item.codigos_barras.length === 1}
                              >
                                {item.codigos_barras.map((codigo, codIndex) => (
                                  <option
                                    key={codIndex}
                                    value={codigo.id_codbar}
                                  >
                                    {codigo.id_codbar}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={
                                  valoresEditados[
                                    `${index}-codigo_barras_manual`
                                  ] !== undefined
                                    ? valoresEditados[
                                        `${index}-codigo_barras_manual`
                                      ]
                                    : item.codigo_barras_manual || ""
                                }
                                onChange={(e) =>
                                  manejarCambioInput(
                                    e,
                                    index,
                                    "codigo_barras_manual",
                                    "texto"
                                  )
                                }
                                onFocus={() =>
                                  manejarFocusInput(
                                    index,
                                    "codigo_barras_manual",
                                    item.codigo_barras_manual,
                                    "texto"
                                  )
                                }
                                onBlur={(e) =>
                                  manejarBlurInput(
                                    e,
                                    index,
                                    "codigo_barras_manual",
                                    "texto"
                                  )
                                }
                                className={styles.inputEditable}
                                placeholder="Ingresar código"
                              />
                            )}
                          </td>
                          <td className={styles.columnaDescripcion}>
                            {item.descripcion}
                          </td>
                          <td className={styles.columnaItem}>{item.id_item}</td>
                          <td className={styles.columnaUnidad}>
                            {item.unimed_com}
                          </td>
                          <td className={styles.columnaGramaje}>
                            <input
                              type="text"
                              value={
                                valoresEditados[`${index}-gramaje`] !==
                                undefined
                                  ? valoresEditados[`${index}-gramaje`]
                                  : obtenerValorDisplay(item.gramaje, "gramaje")
                              }
                              onChange={(e) =>
                                manejarCambioInput(
                                  e,
                                  index,
                                  "gramaje",
                                  "gramaje"
                                )
                              }
                              onFocus={() =>
                                manejarFocusInput(
                                  index,
                                  "gramaje",
                                  item.gramaje,
                                  "gramaje"
                                )
                              }
                              onBlur={(e) =>
                                manejarBlurInput(e, index, "gramaje", "gramaje")
                              }
                              className={styles.inputEditable}
                              placeholder="0"
                            />
                          </td>
                          <td className={styles.columnaIva}>
                            <input
                              type="text"
                              value={
                                valoresEditados[`${index}-porcentaje_iva`] !==
                                undefined
                                  ? valoresEditados[`${index}-porcentaje_iva`]
                                  : obtenerValorDisplay(
                                      item.porcentaje_iva,
                                      "porcentaje"
                                    )
                              }
                              onChange={(e) =>
                                manejarCambioInput(
                                  e,
                                  index,
                                  "porcentaje_iva",
                                  "porcentaje"
                                )
                              }
                              onFocus={() =>
                                manejarFocusInput(
                                  index,
                                  "porcentaje_iva",
                                  item.porcentaje_iva,
                                  "porcentaje"
                                )
                              }
                              onBlur={(e) =>
                                manejarBlurInput(
                                  e,
                                  index,
                                  "porcentaje_iva",
                                  "porcentaje"
                                )
                              }
                              className={styles.inputEditable}
                              placeholder="0.0%"
                            />
                          </td>
                          <td className={styles.columnaCostoActual}>
                            <input
                              type="text"
                              value={
                                valoresEditados[
                                  `${index}-costo_sin_iva_actual`
                                ] !== undefined
                                  ? valoresEditados[
                                      `${index}-costo_sin_iva_actual`
                                    ]
                                  : obtenerValorDisplay(
                                      item.costo_sin_iva_actual,
                                      "moneda"
                                    )
                              }
                              onChange={(e) =>
                                manejarCambioInput(
                                  e,
                                  index,
                                  "costo_sin_iva_actual",
                                  "moneda"
                                )
                              }
                              onFocus={() =>
                                manejarFocusInput(
                                  index,
                                  "costo_sin_iva_actual",
                                  item.costo_sin_iva_actual,
                                  "moneda"
                                )
                              }
                              onBlur={(e) =>
                                manejarBlurInput(
                                  e,
                                  index,
                                  "costo_sin_iva_actual",
                                  "moneda"
                                )
                              }
                              className={styles.inputEditable}
                              placeholder="$0.00"
                            />
                          </td>
                          <td className={styles.columnaCostoNuevo}>
                            <input
                              type="text"
                              value={
                                valoresEditados[
                                  `${index}-costo_sin_iva_nuevo`
                                ] !== undefined
                                  ? valoresEditados[
                                      `${index}-costo_sin_iva_nuevo`
                                    ]
                                  : obtenerValorDisplay(
                                      item.costo_sin_iva_nuevo,
                                      "moneda"
                                    )
                              }
                              onChange={(e) =>
                                manejarCambioInput(
                                  e,
                                  index,
                                  "costo_sin_iva_nuevo",
                                  "moneda"
                                )
                              }
                              onFocus={() =>
                                manejarFocusInput(
                                  index,
                                  "costo_sin_iva_nuevo",
                                  item.costo_sin_iva_nuevo,
                                  "moneda"
                                )
                              }
                              onBlur={(e) =>
                                manejarBlurInput(
                                  e,
                                  index,
                                  "costo_sin_iva_nuevo",
                                  "moneda"
                                )
                              }
                              className={styles.inputEditable}
                              placeholder="$0.00"
                            />
                          </td>
                          <td
                            className={`${
                              styles.columnaVariacion
                            } ${obtenerClaseVariacion(
                              item.porcentaje_variacion
                            )}`}
                          >
                            {item.porcentaje_variacion
                              ? item.porcentaje_variacion.toFixed(2)
                              : "0.00"}
                            %
                          </td>
                          <td className={styles.columnaIcui}>
                            <input
                              type="text"
                              value={
                                valoresEditados[`${index}-icui`] !== undefined
                                  ? valoresEditados[`${index}-icui`]
                                  : obtenerValorDisplay(item.icui, "moneda")
                              }
                              onChange={(e) =>
                                manejarCambioInput(e, index, "icui", "moneda")
                              }
                              onFocus={() =>
                                manejarFocusInput(
                                  index,
                                  "icui",
                                  item.icui,
                                  "moneda"
                                )
                              }
                              onBlur={(e) =>
                                manejarBlurInput(e, index, "icui", "moneda")
                              }
                              className={styles.inputEditable}
                              placeholder="$0.00"
                            />
                          </td>
                          <td className={styles.columnaIbua}>
                            <input
                              type="text"
                              value={
                                valoresEditados[`${index}-ibua`] !== undefined
                                  ? valoresEditados[`${index}-ibua`]
                                  : obtenerValorDisplay(item.ibua, "moneda")
                              }
                              onChange={(e) =>
                                manejarCambioInput(e, index, "ibua", "moneda")
                              }
                              onFocus={() =>
                                manejarFocusInput(
                                  index,
                                  "ibua",
                                  item.ibua,
                                  "moneda"
                                )
                              }
                              onBlur={(e) =>
                                manejarBlurInput(e, index, "ibua", "moneda")
                              }
                              className={styles.inputEditable}
                              placeholder="$0.00"
                            />
                          </td>
                          <td className={styles.columnaIpo}>
                            <input
                              type="text"
                              value={
                                valoresEditados[`${index}-ipo`] !== undefined
                                  ? valoresEditados[`${index}-ipo`]
                                  : obtenerValorDisplay(item.ipo, "moneda")
                              }
                              onChange={(e) =>
                                manejarCambioInput(e, index, "ipo", "moneda")
                              }
                              onFocus={() =>
                                manejarFocusInput(
                                  index,
                                  "ipo",
                                  item.ipo,
                                  "moneda"
                                )
                              }
                              onBlur={(e) =>
                                manejarBlurInput(e, index, "ipo", "moneda")
                              }
                              className={styles.inputEditable}
                              placeholder="$0.00"
                            />
                          </td>
                          <td className={styles.columnaPie1}>
                            <input
                              type="text"
                              value={
                                valoresEditados[`${index}-pie_factura1`] !==
                                undefined
                                  ? valoresEditados[`${index}-pie_factura1`]
                                  : obtenerValorDisplay(
                                      item.pie_factura1,
                                      "porcentaje"
                                    )
                              }
                              onChange={(e) =>
                                manejarCambioInput(
                                  e,
                                  index,
                                  "pie_factura1",
                                  "porcentaje"
                                )
                              }
                              onFocus={() =>
                                manejarFocusInput(
                                  index,
                                  "pie_factura1",
                                  item.pie_factura1,
                                  "porcentaje"
                                )
                              }
                              onBlur={(e) =>
                                manejarBlurInput(
                                  e,
                                  index,
                                  "pie_factura1",
                                  "porcentaje"
                                )
                              }
                              className={styles.inputEditable}
                              placeholder="0.0%"
                            />
                          </td>
                          <td className={styles.columnaPie2}>
                            <input
                              type="text"
                              value={
                                valoresEditados[`${index}-pie_factura2`] !==
                                undefined
                                  ? valoresEditados[`${index}-pie_factura2`]
                                  : obtenerValorDisplay(
                                      item.pie_factura2,
                                      "porcentaje"
                                    )
                              }
                              onChange={(e) =>
                                manejarCambioInput(
                                  e,
                                  index,
                                  "pie_factura2",
                                  "porcentaje"
                                )
                              }
                              onFocus={() =>
                                manejarFocusInput(
                                  index,
                                  "pie_factura2",
                                  item.pie_factura2,
                                  "porcentaje"
                                )
                              }
                              onBlur={(e) =>
                                manejarBlurInput(
                                  e,
                                  index,
                                  "pie_factura2",
                                  "porcentaje"
                                )
                              }
                              className={styles.inputEditable}
                              placeholder="0.0%"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className={styles.pieModal}>
              <button
                className={styles.botonSecundario}
                onClick={() => {
                  setMostrarModalPaso2(false);
                  setMostrarModalNueva(true);
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} /> Volver
              </button>
              <button
                className={styles.botonPrimario}
                onClick={crearSolicitudDesdePaso2}
                disabled={cargando}
              >
                {cargando ? "Creando..." : "Crear Solicitud"}
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalDetalles && (
        <ModalDetallesSolicitud
          solicitud={solicitudSeleccionada}
          onClose={() => setMostrarModalDetalles(false)}
        />
      )}

      {mostrarModalTrazabilidad && (
        <ModalTrazabilidad
          trazabilidad={trazabilidad}
          onClose={() => setMostrarModalTrazabilidad(false)}
        />
      )}
    </div>
  );
};

export default memo(ActualizacionCostos);
