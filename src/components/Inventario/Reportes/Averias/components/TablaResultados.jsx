import React, { useState, useMemo, useEffect, useRef } from "react";
import styles from "../ExistenciasAverias.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
  faChevronDown,
  faSearch,
  faCheckSquare,
  faSquare,
} from "@fortawesome/free-solid-svg-icons";

const TablaResultados = ({ datos }) => {
  const [pagina, setPagina] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Control de apertura de menús desplegables
  const [dropdownAbierto, setDropdownAbierto] = useState({
    proveedor: false,
    linea: false,
    item: false,
  });

  // Estado para la selección de filtros múltiples (Arreglo vacío = Todos)
  const [filtros, setFiltros] = useState({
    proveedores: [],
    lineas: [],
    items: [],
  });

  // Estado para los términos de búsqueda internos de cada desplegable
  const [busquedaFiltro, setBusquedaFiltro] = useState({
    proveedor: "",
    linea: "",
    item: "",
  });

  const tamañoPagina = 50;

  // Referencias para interceptar clics externos y cerrar menús
  const contenedorRef = useRef(null);

  useEffect(() => {
    const handleClicExterno = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setDropdownAbierto({ proveedor: false, linea: false, item: false });
      }
    };
    document.addEventListener("mousedown", handleClicExterno);
    return () => document.removeEventListener("mousedown", handleClicExterno);
  }, []);

  // Extracción optimizada de catálogos únicos ordenados
  const catalogosFiltros = useMemo(() => {
    if (!datos || datos.length === 0) {
      return { proveedores: [], lineas: [], items: [] };
    }

    const provSet = new Set();
    const linSet = new Set();
    const itemSet = new Set();

    datos.forEach((el) => {
      if (el.proveedor != null && el.proveedor !== "")
        provSet.add(String(el.proveedor));
      if (el.linea != null && el.linea !== "") linSet.add(String(el.linea));
      if (el.item != null && el.item !== "") itemSet.add(String(el.item));
    });

    return {
      proveedores: Array.from(provSet).sort((a, b) =>
        String(a).localeCompare(String(b)),
      ),
      lineas: Array.from(linSet).sort((a, b) =>
        String(a).localeCompare(String(b)),
      ),
      items: Array.from(itemSet).sort((a, b) =>
        String(a).localeCompare(String(b)),
      ),
    };
  }, [datos]);

  // ¿Están TODAS las opciones de una categoría seleccionadas?
  const esTodosSeleccionado = (categoria) =>
    catalogosFiltros[categoria].length > 0 &&
    filtros[categoria].length === catalogosFiltros[categoria].length;

  // Reinicia paginación, orden, búsqueda y filtros cada vez que llega una
  // NUEVA consulta (el padre entrega un nuevo arreglo "datos"). Por defecto
  // todas las opciones quedan marcadas (se muestran todos los registros).
  const [refDatos, setRefDatos] = useState(null);
  if (datos !== refDatos) {
    setRefDatos(datos);
    setPagina(1);
    setSortConfig({ key: null, direction: "asc" });
    setFiltros({
      proveedores: [...catalogosFiltros.proveedores],
      lineas: [...catalogosFiltros.lineas],
      items: [...catalogosFiltros.items],
    });
    setBusquedaFiltro({ proveedor: "", linea: "", item: "" });
    setDropdownAbierto({ proveedor: false, linea: false, item: false });
  }

  // Alternar la selección de un ítem individual o conmutar el estado de "Todos"
  const handleToggleOpcion = (categoria, valor) => {
    setFiltros((prev) => {
      const actuales = prev[categoria];
      let nuevos;

      if (valor === "TODOS") {
        const todasOpciones = catalogosFiltros[categoria];
        const estanTodasMarcadas =
          todasOpciones.length > 0 && actuales.length === todasOpciones.length;
        // Marca todas, o si ya estaban todas, las desmarca todas
        nuevos = estanTodasMarcadas ? [] : [...todasOpciones];
      } else {
        nuevos = actuales.includes(valor)
          ? actuales.filter((v) => v !== valor)
          : [...actuales, valor];
      }

      return { ...prev, [categoria]: nuevos };
    });
    setPagina(1);
  };

  // Alternar visibilidad de los dropdowns individuales
  const handleToggleDropdown = (menu) => {
    setDropdownAbierto((prev) => ({
      proveedor: menu === "proveedor" ? !prev.proveedor : false,
      linea: menu === "linea" ? !prev.linea : false,
      item: menu === "item" ? !prev.item : false,
    }));
  };

  const handleBusquedaChange = (e) => {
    const { name, value } = e.target;
    setBusquedaFiltro((prev) => ({ ...prev, [name]: value }));
  };

  // Filtrado de las opciones visibles dentro del menú flotante por su buscador
  const opcionesFiltradas = useMemo(() => {
    return {
      proveedores: catalogosFiltros.proveedores.filter((p) =>
        p.toLowerCase().includes(busquedaFiltro.proveedor.toLowerCase()),
      ),
      lineas: catalogosFiltros.lineas.filter((l) =>
        l.toLowerCase().includes(busquedaFiltro.linea.toLowerCase()),
      ),
      items: catalogosFiltros.items.filter((i) =>
        String(i).toLowerCase().includes(busquedaFiltro.item.toLowerCase()),
      ),
    };
  }, [catalogosFiltros, busquedaFiltro]);

  // Canalización y procesamiento del universo de datos (Filtros -> Ordenamiento) [ÚNICA DECLARACIÓN]
  const datosProcesados = useMemo(() => {
    if (!datos || datos.length === 0) return [];

    let resultados = datos.filter((el) => {
      const matchProveedor = filtros.proveedores.includes(
        String(el.proveedor ?? ""),
      );
      const matchLinea = filtros.lineas.includes(String(el.linea ?? ""));
      const matchItem = filtros.items.includes(String(el.item ?? ""));

      return matchProveedor && matchLinea && matchItem;
    });

    if (sortConfig.key !== null) {
      resultados.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (!isNaN(valA) && !isNaN(valB) && valA !== "" && valB !== "") {
          return sortConfig.direction === "asc"
            ? parseFloat(valA) - parseFloat(valB)
            : parseFloat(valB) - parseFloat(valA);
        }

        valA = String(valA ?? "").toLowerCase();
        valB = String(valB ?? "").toLowerCase();
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return resultados;
  }, [datos, sortConfig, filtros]);

  const handleRequestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setPagina(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return faSort;
    return sortConfig.direction === "asc" ? faSortUp : faSortDown;
  };

  const formatMonedaLocal = (valor) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  if (!datos || datos.length === 0) {
    return (
      <div className={styles.estadoVacioContainer}>
        No se registran datos para mostrar. Modifique las variables de entrada e
        inicie la consulta.
      </div>
    );
  }

  const indexFin = pagina * tamañoPagina;
  const indexInicio = indexFin - tamañoPagina;
  const fragmentoDatos = datosProcesados.slice(indexInicio, indexFin);
  const totalPaginas = Math.ceil(datosProcesados.length / tamañoPagina);

  return (
    <div className={styles.contenedorTablaMaestra} ref={contenedorRef}>
      {/* SECCIÓN DE MENÚS DESPLEGABLES (DROPDOWNS) */}
      <div className={styles.barraFiltrosDropdowns}>
        {/* ================= DROPDOWN PROVEEDOR ================= */}
        <div className={styles.dropdownContenedorIndividual}>
          <button
            type="button"
            className={`${styles.botonDropdownDisparador} ${!esTodosSeleccionado("proveedores") ? styles.botonDropdownFiltrando : ""}`}
            onClick={() => handleToggleDropdown("proveedor")}
          >
            <span>
              Proveedor:{" "}
              {esTodosSeleccionado("proveedores")
                ? "Todos"
                : `${filtros.proveedores.length} sel.`}
            </span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={styles.iconoChevronFlotante}
            />
          </button>

          {dropdownAbierto.proveedor && (
            <div className={styles.panelDesplegableFlotante}>
              <div className={styles.buscadorFiltroWrapper}>
                <FontAwesomeIcon
                  icon={faSearch}
                  className={styles.iconoLupaBuscador}
                />
                <input
                  type="text"
                  name="proveedor"
                  placeholder="Buscar proveedor..."
                  value={busquedaFiltro.proveedor}
                  onChange={handleBusquedaChange}
                  autoComplete="off"
                />
              </div>
              <div className={styles.listaOpcionesSeleccionables}>
                <div
                  className={`${styles.opcionFiltroFila} ${esTodosSeleccionado("proveedores") ? styles.opcionFiltroFilaActiva : ""}`}
                  onClick={() => handleToggleOpcion("proveedores", "TODOS")}
                >
                  <FontAwesomeIcon
                    icon={
                      esTodosSeleccionado("proveedores")
                        ? faCheckSquare
                        : faSquare
                    }
                    className={styles.iconoCasillaCheck}
                  />
                  <span>[ Seleccionar Todos ]</span>
                </div>
                {opcionesFiltradas.proveedores.map((p) => {
                  const estaSeleccionado = filtros.proveedores.includes(p);
                  return (
                    <div
                      key={p}
                      className={`${styles.opcionFiltroFila} ${estaSeleccionado ? styles.opcionFiltroFilaActiva : ""}`}
                      onClick={() => handleToggleOpcion("proveedores", p)}
                    >
                      <FontAwesomeIcon
                        icon={estaSeleccionado ? faCheckSquare : faSquare}
                        className={styles.iconoCasillaCheck}
                      />
                      <span title={p}>{p}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ================= DROPDOWN LÍNEA ================= */}
        <div className={styles.dropdownContenedorIndividual}>
          <button
            type="button"
            className={`${styles.botonDropdownDisparador} ${!esTodosSeleccionado("lineas") ? styles.botonDropdownFiltrando : ""}`}
            onClick={() => handleToggleDropdown("linea")}
          >
            <span>
              Línea:{" "}
              {esTodosSeleccionado("lineas")
                ? "Todos"
                : `${filtros.lineas.length} sel.`}
            </span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={styles.iconoChevronFlotante}
            />
          </button>

          {dropdownAbierto.linea && (
            <div className={styles.panelDesplegableFlotante}>
              <div className={styles.buscadorFiltroWrapper}>
                <FontAwesomeIcon
                  icon={faSearch}
                  className={styles.iconoLupaBuscador}
                />
                <input
                  type="text"
                  name="linea"
                  placeholder="Buscar línea..."
                  value={busquedaFiltro.linea}
                  onChange={handleBusquedaChange}
                  autoComplete="off"
                />
              </div>
              <div className={styles.listaOpcionesSeleccionables}>
                <div
                  className={`${styles.opcionFiltroFila} ${esTodosSeleccionado("lineas") ? styles.opcionFiltroFilaActiva : ""}`}
                  onClick={() => handleToggleOpcion("lineas", "TODOS")}
                >
                  <FontAwesomeIcon
                    icon={
                      esTodosSeleccionado("lineas") ? faCheckSquare : faSquare
                    }
                    className={styles.iconoCasillaCheck}
                  />
                  <span>[ Seleccionar Todos ]</span>
                </div>
                {opcionesFiltradas.lineas.map((l) => {
                  const estaSeleccionado = filtros.lineas.includes(l);
                  return (
                    <div
                      key={l}
                      className={`${styles.opcionFiltroFila} ${estaSeleccionado ? styles.opcionFiltroFilaActiva : ""}`}
                      onClick={() => handleToggleOpcion("lineas", l)}
                    >
                      <FontAwesomeIcon
                        icon={estaSeleccionado ? faCheckSquare : faSquare}
                        className={styles.iconoCasillaCheck}
                      />
                      <span title={l}>{l}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ================= DROPDOWN ÍTEM ================= */}
        <div className={styles.dropdownContenedorIndividual}>
          <button
            type="button"
            className={`${styles.botonDropdownDisparador} ${!esTodosSeleccionado("items") ? styles.botonDropdownFiltrando : ""}`}
            onClick={() => handleToggleDropdown("item")}
          >
            <span>
              Ítem:{" "}
              {esTodosSeleccionado("items")
                ? "Todos"
                : `${filtros.items.length} sel.`}
            </span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={styles.iconoChevronFlotante}
            />
          </button>

          {dropdownAbierto.item && (
            <div className={styles.panelDesplegableFlotante}>
              <div className={styles.buscadorFiltroWrapper}>
                <FontAwesomeIcon
                  icon={faSearch}
                  className={styles.iconoLupaBuscador}
                />
                <input
                  type="text"
                  name="item"
                  placeholder="Buscar ítem..."
                  value={busquedaFiltro.item}
                  onChange={handleBusquedaChange}
                  autoComplete="off"
                />
              </div>
              <div className={styles.listaOpcionesSeleccionables}>
                <div
                  className={`${styles.opcionFiltroFila} ${esTodosSeleccionado("items") ? styles.opcionFiltroFilaActiva : ""}`}
                  onClick={() => handleToggleOpcion("items", "TODOS")}
                >
                  <FontAwesomeIcon
                    icon={
                      esTodosSeleccionado("items") ? faCheckSquare : faSquare
                    }
                    className={styles.iconoCasillaCheck}
                  />
                  <span>[ Seleccionar Todos ]</span>
                </div>
                {opcionesFiltradas.items.map((i) => {
                  const estaSeleccionado = filtros.items.includes(i);
                  return (
                    <div
                      key={i}
                      className={`${styles.opcionFiltroFila} ${estaSeleccionado ? styles.opcionFiltroFilaActiva : ""}`}
                      onClick={() => handleToggleOpcion("items", i)}
                    >
                      <FontAwesomeIcon
                        icon={estaSeleccionado ? faCheckSquare : faSquare}
                        className={styles.iconoCasillaCheck}
                      />
                      <span>{i}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RENDERIZADO DE LA TABLA DE RESULTADOS */}
      <div className={styles.tablaResponsivaWrapper}>
        <table>
          <thead>
            <tr>
              <th
                onClick={() => handleRequestSort("proveedor")}
                style={{ cursor: "pointer" }}
              >
                Proveedor{" "}
                <FontAwesomeIcon
                  icon={getSortIcon("proveedor")}
                  style={{ marginLeft: "6px", fontSize: "11px" }}
                />
              </th>
              <th
                onClick={() => handleRequestSort("linea")}
                style={{ cursor: "pointer" }}
              >
                Linea{" "}
                <FontAwesomeIcon
                  icon={getSortIcon("linea")}
                  style={{ marginLeft: "6px", fontSize: "11px" }}
                />
              </th>
              <th
                onClick={() => handleRequestSort("sede")}
                style={{ cursor: "pointer" }}
              >
                Sede{" "}
                <FontAwesomeIcon
                  icon={getSortIcon("sede")}
                  style={{ marginLeft: "6px", fontSize: "11px" }}
                />
              </th>
              <th
                onClick={() => handleRequestSort("local")}
                style={{ cursor: "pointer" }}
              >
                Local{" "}
                <FontAwesomeIcon
                  icon={getSortIcon("local")}
                  style={{ marginLeft: "6px", fontSize: "11px" }}
                />
              </th>
              <th
                onClick={() => handleRequestSort("item")}
                style={{ cursor: "pointer" }}
              >
                Item{" "}
                <FontAwesomeIcon
                  icon={getSortIcon("item")}
                  style={{ marginLeft: "6px", fontSize: "11px" }}
                />
              </th>
              <th
                onClick={() => handleRequestSort("nombre_item")}
                style={{ cursor: "pointer" }}
              >
                Nombre de Item{" "}
                <FontAwesomeIcon
                  icon={getSortIcon("nombre_item")}
                  style={{ marginLeft: "6px", fontSize: "11px" }}
                />
              </th>
              <th
                onClick={() => handleRequestSort("existencia_final")}
                style={{ cursor: "pointer", textAlign: "right" }}
              >
                Existencia{" "}
                <FontAwesomeIcon
                  icon={getSortIcon("existencia_final")}
                  style={{ marginLeft: "6px", fontSize: "11px" }}
                />
              </th>
              <th
                onClick={() => handleRequestSort("costo_total")}
                style={{ cursor: "pointer", textAlign: "right" }}
              >
                Costo Total{" "}
                <FontAwesomeIcon
                  icon={getSortIcon("costo_total")}
                  style={{ marginLeft: "6px", fontSize: "11px" }}
                />
              </th>
              <th style={{ textAlign: "center" }}>Recoge Averias</th>
            </tr>
          </thead>
          <tbody>
            {fragmentoDatos.length > 0 ? (
              fragmentoDatos.map((item, index) => (
                <tr key={`${item.item}-${index}`}>
                  <td className={styles.celdaTruncada} title={item.proveedor}>
                    {item.proveedor}
                  </td>
                  <td>{item.linea}</td>
                  <td>{item.sede}</td>
                  <td>{item.local}</td>
                  <td className={styles.textoDestacado}>{item.item}</td>
                  <td className={styles.celdaTruncada} title={item.nombre_item}>
                    {item.nombre_item}
                  </td>
                  <td className={styles.numeroAlineado}>
                    {parseFloat(item.existencia_final).toFixed(2)}
                  </td>
                  <td className={styles.numeroAlineado}>
                    {formatMonedaLocal(item.costo_total)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      className={
                        item.recoge_averias === "Si"
                          ? styles.badgeSi
                          : styles.badgeNo
                      }
                    >
                      {item.recoge_averias}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#666",
                  }}
                >
                  No se encontraron registros que coincidan con los filtros
                  aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className={styles.barraPaginacion}>
          <button
            onClick={() => setPagina((p) => Math.max(p - 1, 1))}
            disabled={pagina === 1}
          >
            Anterior
          </button>
          <span>
            Página {pagina} de {totalPaginas}
          </span>
          <button
            onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
            disabled={pagina === totalPaginas}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default TablaResultados;
