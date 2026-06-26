import React, { useState, useMemo } from "react";
import { apiService } from "../../../services/api";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";
import styles from "./Recaudos.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faCalendarDay,
  faFileExcel,
  faSearch,
  faList,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from "../../../assets/images/logo.png";

const ITEMS_POR_PAGINA = 50;

const Recaudos = () => {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [mensajeCarga, setMensajeCarga] = useState(
    "Procesando consulta en base de datos...",
  );

  const [tipoFiltro, setTipoFiltro] = useState("fecha");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [lapso, setLapso] = useState("");
  const [tipoTransaccion, setTipoTransaccion] = useState("Todos");

  const [resultados, setResultados] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [orden, setOrden] = useState({ columna: null, direccion: "asc" });

  // Pipeline de procesamiento en memoria
  const resultadosProcesados = useMemo(() => {
    let datos = [...resultados];

    if (terminoBusqueda) {
      const termino = terminoBusqueda.toLowerCase();
      datos = datos.filter((item) =>
        Object.values(item).some(
          (val) =>
            val !== null &&
            val !== undefined &&
            val.toString().toLowerCase().includes(termino),
        ),
      );
    }

    if (orden.columna) {
      datos.sort((a, b) => {
        let valA = a[orden.columna];
        let valB = b[orden.columna];

        if (valA === null || valA === undefined) valA = "";
        if (valB === null || valB === undefined) valB = "";

        if (!isNaN(valA) && !isNaN(valB) && valA !== "" && valB !== "") {
          valA = Number(valA);
          valB = Number(valB);
        } else {
          valA = valA.toString().toLowerCase();
          valB = valB.toString().toLowerCase();
        }

        if (valA < valB) return orden.direccion === "asc" ? -1 : 1;
        if (valA > valB) return orden.direccion === "asc" ? 1 : -1;
        return 0;
      });
    }

    return datos;
  }, [resultados, terminoBusqueda, orden]);

  const totalPaginas = Math.ceil(
    resultadosProcesados.length / ITEMS_POR_PAGINA,
  );

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const fin = inicio + ITEMS_POR_PAGINA;
    return resultadosProcesados.slice(inicio, fin);
  }, [resultadosProcesados, paginaActual]);

  const formatearMoneda = (valor) => {
    const numero = parseFloat(valor) || 0;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numero);
  };

  const handleBusqueda = (e) => {
    setTerminoBusqueda(e.target.value);
    setPaginaActual(1);
  };

  const solicitarOrden = (columna) => {
    let direccion = "asc";
    if (orden.columna === columna && orden.direccion === "asc") {
      direccion = "desc";
    }
    setOrden({ columna, direccion });
    setPaginaActual(1);
  };

  const getIconoOrden = (nombreColumna) => {
    if (orden.columna !== nombreColumna) return faSort;
    return orden.direccion === "asc" ? faSortUp : faSortDown;
  };

  const validarFormulario = () => {
    if (tipoFiltro === "fecha") {
      if (!fechaInicio || !fechaFin) {
        addNotification({
          message: "Debe ingresar la fecha inicial y la fecha final.",
          type: "warning",
        });
        return false;
      }
      if (new Date(fechaFin) < new Date(fechaInicio)) {
        addNotification({
          message: "La fecha final no puede ser menor a la fecha inicial.",
          type: "warning",
        });
        return false;
      }
    } else if (tipoFiltro === "lapso") {
      if (!lapso) {
        addNotification({
          message: "Debe seleccionar un lapso valido.",
          type: "warning",
        });
        return false;
      }
    }
    return true;
  };

  const consultarDatos = async () => {
    if (!validarFormulario()) return;

    setMensajeCarga("Procesando consulta en base de datos...");
    setLoading(true);
    try {
      const payload = {
        tipoFiltro,
        fechaInicio: tipoFiltro === "fecha" ? fechaInicio : null,
        fechaFin: tipoFiltro === "fecha" ? fechaFin : null,
        lapso: tipoFiltro === "lapso" ? lapso : null,
        tipoTransaccion,
      };

      const response = await apiService.obtenerReporteRecaudos(payload);

      if (response.success) {
        setResultados(response.data);
        setTerminoBusqueda("");
        setPaginaActual(1);
        setOrden({ columna: null, direccion: "asc" });

        if (response.data.length === 0) {
          addNotification({
            message:
              "No se encontraron registros para los criterios seleccionados.",
            type: "info",
          });
        }
      } else {
        addNotification({
          message: response.message || "Error al obtener los datos.",
          type: "error",
        });
      }
    } catch (error) {
      addNotification({
        message: error.message || "Error de conexion con el servidor.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const generarExcel = async () => {
    if (resultadosProcesados.length === 0) {
      addNotification({
        message: "No hay datos para exportar.",
        type: "warning",
      });
      return;
    }

    setMensajeCarga("Generando archivo Excel corporativo...");
    setLoading(true);

    try {
      // Diferir la ejecucion sincrona de ExcelJS para permitir el renderizado del LoadingScreen
      await new Promise((resolve) => setTimeout(resolve, 50));

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Recaudos");

      try {
        const response = await fetch(logo);
        const arrayBuffer = await response.arrayBuffer();
        const logoId = workbook.addImage({
          buffer: arrayBuffer,
          extension: "png",
        });
        worksheet.addImage(logoId, {
          tl: { col: 0.5, row: 0.5 },
          br: { col: 2.5, row: 3.5 },
        });
      } catch (error) {
        console.error("Error al cargar el logo corporativo", error);
      }

      for (let r = 1; r <= 4; r++) {
        for (let c = 1; c <= 10; c++) {
          worksheet.getCell(r, c).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF2F9F6" },
          };
          if (r === 4) {
            worksheet.getCell(r, c).border = {
              bottom: { style: "thick", color: { argb: "FF009B6D" } },
            };
          }
        }
      }

      worksheet.mergeCells(1, 4, 1, 10);
      worksheet.mergeCells(2, 4, 2, 10);
      worksheet.mergeCells(3, 4, 3, 10);
      worksheet.mergeCells(4, 4, 4, 10);

      const tituloCelda = worksheet.getCell(1, 4);
      tituloCelda.value =
        "SUPERMERCADO BELALCAZAR - ABASTECEMOS DE OCCIDENTE S.A.S";
      tituloCelda.font = {
        name: "Arial",
        size: 16,
        bold: true,
        color: { argb: "FF009B6D" },
      };
      tituloCelda.alignment = { vertical: "middle", horizontal: "left" };

      const subtituloCelda = worksheet.getCell(2, 4);
      subtituloCelda.value = "REPORTE DE MEDIOS DE RECAUDO";
      subtituloCelda.font = {
        name: "Arial",
        size: 12,
        bold: true,
        color: { argb: "FF404040" },
      };
      subtituloCelda.alignment = { vertical: "middle", horizontal: "left" };

      const parametrosCelda = worksheet.getCell(3, 4);
      const textoParametros =
        tipoFiltro === "fecha"
          ? `Rango: ${fechaInicio} al ${fechaFin}`
          : `Lapso: ${lapso}`;

      parametrosCelda.value = `Filtro: ${textoParametros} | Transacciones: ${tipoTransaccion}`;
      parametrosCelda.font = {
        name: "Arial",
        size: 11,
        color: { argb: "FF202020" },
      };
      parametrosCelda.alignment = { vertical: "middle", horizontal: "left" };

      worksheet.getRow(6).values = [
        "Sede",
        "Tipo Doc",
        "Nº Documento",
        "Fecha",
        "Lapso",
        "Modo",
        "Medio Recaudo",
        "Referencia",
        "Valor",
      ];

      worksheet.getRow(6).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF009B6D" },
        };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin", color: { argb: "FFBFBFBF" } },
          left: { style: "thin", color: { argb: "FFBFBFBF" } },
          bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
          right: { style: "thin", color: { argb: "FFBFBFBF" } },
        };
      });

      // Exportar solo los resultados filtrados
      resultadosProcesados.forEach((row) => {
        const rowData = [
          row.id_co,
          row.id_tipdoc,
          row.documento_fc,
          row.fecha_fc,
          row.lapso_doc,
          row.ind_modo,
          row.medio_desc,
          row.medio_refer,
          parseFloat(row.vlr_recaudo) || 0,
        ];

        const dataRow = worksheet.addRow(rowData);
        dataRow.eachCell((cell) => {
          cell.alignment = { vertical: "middle" };
          cell.border = {
            top: { style: "thin", color: { argb: "FFE7E6E6" } },
            left: { style: "thin", color: { argb: "FFE7E6E6" } },
            bottom: { style: "thin", color: { argb: "FFE7E6E6" } },
            right: { style: "thin", color: { argb: "FFE7E6E6" } },
          };
        });
        dataRow.getCell(9).numFmt = '"$"#,##0';
      });

      worksheet.columns.forEach((column) => {
        let maxLength = 12;
        column.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
          if (rowNumber > 5) {
            const columnLength = cell.value ? cell.value.toString().length : 0;
            if (columnLength > maxLength) maxLength = columnLength;
          }
        });
        column.width = maxLength + 2;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Construccion dinamica del nombre de archivo
      let nombreArchivo = "Reporte_Recaudos_";
      nombreArchivo +=
        tipoFiltro === "fecha" ? `${fechaInicio}_al_${fechaFin}` : `${lapso}`;
      nombreArchivo += `_${tipoTransaccion}.xlsx`;

      saveAs(blob, nombreArchivo);

      addNotification({
        message: "Archivo Excel generado correctamente.",
        type: "success",
      });
    } catch (error) {
      addNotification({
        message: "Error al estructurar el archivo Excel.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message={mensajeCarga} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Reporte de Recaudos</h1>
          <p className={styles.subtitle}>
            Consulta y exportacion de transacciones por medio de pago
          </p>
        </div>
      </div>

      <div className={styles.panelControl}>
        <div className={styles.filtrosEstructura}>
          <div className={styles.grupoSelector}>
            <label className={styles.etiquetaPrincipal}>Tipo de Busqueda</label>
            <div className={styles.radioContainer}>
              <label
                className={`${styles.radioOpcion} ${tipoFiltro === "fecha" ? styles.activo : ""}`}
              >
                <input
                  type="radio"
                  value="fecha"
                  checked={tipoFiltro === "fecha"}
                  onChange={(e) => {
                    setTipoFiltro(e.target.value);
                    setResultados([]);
                  }}
                />
                <FontAwesomeIcon icon={faCalendarDay} /> Rango de Fechas
              </label>
              <label
                className={`${styles.radioOpcion} ${tipoFiltro === "lapso" ? styles.activo : ""}`}
              >
                <input
                  type="radio"
                  value="lapso"
                  checked={tipoFiltro === "lapso"}
                  onChange={(e) => {
                    setTipoFiltro(e.target.value);
                    setResultados([]);
                  }}
                />
                <FontAwesomeIcon icon={faCalendarAlt} /> Por Lapso
              </label>
            </div>
          </div>

          <div className={styles.grupoSelector}>
            <label className={styles.etiquetaPrincipal}>
              Parametros de Tiempo
            </label>
            <div className={styles.fechasContainer}>
              {tipoFiltro === "fecha" ? (
                <>
                  <div className={`${styles.formGroup} ${styles.floating}`}>
                    <input
                      type="date"
                      className={styles.formInput}
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      placeholder=" "
                    />
                    <label className={styles.formLabel}>Fecha Inicio</label>
                  </div>
                  <div className={`${styles.formGroup} ${styles.floating}`}>
                    <input
                      type="date"
                      className={styles.formInput}
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      placeholder=" "
                    />
                    <label className={styles.formLabel}>Fecha Fin</label>
                  </div>
                </>
              ) : (
                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <input
                    type="month"
                    className={styles.formInput}
                    value={lapso}
                    onChange={(e) => setLapso(e.target.value)}
                    placeholder=" "
                  />
                  <label className={styles.formLabel}>Mes / Año</label>
                </div>
              )}
            </div>
          </div>

          <div className={styles.grupoSelector}>
            <label className={styles.etiquetaPrincipal}>
              Tipo de Transaccion
            </label>
            <div className={`${styles.formGroup} ${styles.floating}`}>
              <select
                className={styles.formSelect}
                value={tipoTransaccion}
                onChange={(e) => setTipoTransaccion(e.target.value)}
              >
                <option value="Todos">Todas las Transacciones</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjetas">Tarjetas</option>
              </select>
              <label className={styles.formLabel}>Transacción</label>
            </div>
          </div>
        </div>

        <div className={styles.accionesContainer}>
          <button className={styles.btnConsultar} onClick={consultarDatos}>
            <FontAwesomeIcon icon={faSearch} /> Consultar Registros
          </button>
          <button
            className={styles.btnExportar}
            onClick={generarExcel}
            disabled={resultados.length === 0}
          >
            <FontAwesomeIcon icon={faFileExcel} /> Exportar Excel
          </button>
        </div>
      </div>

      <div className={styles.resultadosContainer}>
        {resultados.length > 0 ? (
          <>
            <div className={styles.tablaAcciones}>
              <div className={styles.tablaHeaderInfo}>
                <h3>Resultados de la Consulta</h3>
                <span className={styles.badgeTotal}>
                  {new Intl.NumberFormat("es-CO").format(
                    resultadosProcesados.length,
                  )}{" "}
                  registros filtrados
                </span>
              </div>

              <div className={styles.buscadorContainer}>
                <FontAwesomeIcon
                  icon={faSearch}
                  className={styles.iconoBuscador}
                />
                <input
                  type="text"
                  className={styles.inputBuscador}
                  placeholder="Buscar en todos los campos..."
                  value={terminoBusqueda}
                  onChange={handleBusqueda}
                />
              </div>
            </div>

            <div className={styles.tablaWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th
                      className={styles.thSortable}
                      onClick={() => solicitarOrden("id_co")}
                    >
                      Sede{" "}
                      <FontAwesomeIcon
                        icon={getIconoOrden("id_co")}
                        className={`${styles.sortIcon} ${orden.columna === "id_co" ? styles.active : ""}`}
                      />
                    </th>
                    <th
                      className={styles.thSortable}
                      onClick={() => solicitarOrden("id_tipdoc")}
                    >
                      Tipo Doc{" "}
                      <FontAwesomeIcon
                        icon={getIconoOrden("id_tipdoc")}
                        className={`${styles.sortIcon} ${orden.columna === "id_tipdoc" ? styles.active : ""}`}
                      />
                    </th>
                    <th
                      className={styles.thSortable}
                      onClick={() => solicitarOrden("documento_fc")}
                    >
                      Nº Documento{" "}
                      <FontAwesomeIcon
                        icon={getIconoOrden("documento_fc")}
                        className={`${styles.sortIcon} ${orden.columna === "documento_fc" ? styles.active : ""}`}
                      />
                    </th>
                    <th
                      className={styles.thSortable}
                      onClick={() => solicitarOrden("fecha_fc")}
                    >
                      Fecha{" "}
                      <FontAwesomeIcon
                        icon={getIconoOrden("fecha_fc")}
                        className={`${styles.sortIcon} ${orden.columna === "fecha_fc" ? styles.active : ""}`}
                      />
                    </th>
                    <th
                      className={styles.thSortable}
                      onClick={() => solicitarOrden("lapso_doc")}
                    >
                      Lapso{" "}
                      <FontAwesomeIcon
                        icon={getIconoOrden("lapso_doc")}
                        className={`${styles.sortIcon} ${orden.columna === "lapso_doc" ? styles.active : ""}`}
                      />
                    </th>
                    <th
                      className={styles.thSortable}
                      onClick={() => solicitarOrden("ind_modo")}
                    >
                      Modo{" "}
                      <FontAwesomeIcon
                        icon={getIconoOrden("ind_modo")}
                        className={`${styles.sortIcon} ${orden.columna === "ind_modo" ? styles.active : ""}`}
                      />
                    </th>
                    <th
                      className={styles.thSortable}
                      onClick={() => solicitarOrden("medio_desc")}
                    >
                      Medio Recaudo{" "}
                      <FontAwesomeIcon
                        icon={getIconoOrden("medio_desc")}
                        className={`${styles.sortIcon} ${orden.columna === "medio_desc" ? styles.active : ""}`}
                      />
                    </th>
                    <th
                      className={styles.thSortable}
                      onClick={() => solicitarOrden("medio_refer")}
                    >
                      Referencia{" "}
                      <FontAwesomeIcon
                        icon={getIconoOrden("medio_refer")}
                        className={`${styles.sortIcon} ${orden.columna === "medio_refer" ? styles.active : ""}`}
                      />
                    </th>
                    <th
                      className={`${styles.thSortable} ${styles.columnaNumerica}`}
                      onClick={() => solicitarOrden("vlr_recaudo")}
                    >
                      Valor{" "}
                      <FontAwesomeIcon
                        icon={getIconoOrden("vlr_recaudo")}
                        className={`${styles.sortIcon} ${orden.columna === "vlr_recaudo" ? styles.active : ""}`}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {datosPaginados.map((row, index) => (
                    <tr key={`${row.documento_fc}-${index}`}>
                      <td>{row.id_co}</td>
                      <td>{row.id_tipdoc}</td>
                      <td className={styles.columnaFuerte}>
                        {row.documento_fc}
                      </td>
                      <td>{row.fecha_fc}</td>
                      <td>{row.lapso_doc}</td>
                      <td>{row.ind_modo}</td>
                      <td>{row.medio_desc}</td>
                      <td>{row.medio_refer}</td>
                      <td className={styles.columnaMoneda}>
                        {formatearMoneda(row.vlr_recaudo)}
                      </td>
                    </tr>
                  ))}
                  {datosPaginados.length === 0 && (
                    <tr>
                      <td
                        colSpan="9"
                        style={{
                          textAlign: "center",
                          padding: "24px",
                          color: "#94a3b8",
                        }}
                      >
                        No se encontraron coincidencias para la busqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPaginas > 1 && (
              <div className={styles.paginacionContainer}>
                <div className={styles.infoPaginacion}>
                  Mostrando {(paginaActual - 1) * ITEMS_POR_PAGINA + 1} a{" "}
                  {Math.min(
                    paginaActual * ITEMS_POR_PAGINA,
                    resultadosProcesados.length,
                  )}{" "}
                  de {resultadosProcesados.length}
                </div>
                <div className={styles.controlesPaginacion}>
                  <button
                    onClick={() => setPaginaActual(1)}
                    disabled={paginaActual === 1}
                    className={styles.btnPaginacion}
                    title="Primera pagina"
                  >
                    <FontAwesomeIcon icon={faAngleDoubleLeft} />
                  </button>
                  <button
                    onClick={() =>
                      setPaginaActual((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={paginaActual === 1}
                    className={styles.btnPaginacion}
                    title="Anterior"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>

                  <span className={styles.indicadorPagina}>
                    Pagina <strong>{paginaActual}</strong> de {totalPaginas}
                  </span>

                  <button
                    onClick={() =>
                      setPaginaActual((prev) =>
                        Math.min(prev + 1, totalPaginas),
                      )
                    }
                    disabled={paginaActual === totalPaginas}
                    className={styles.btnPaginacion}
                    title="Siguiente"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                  <button
                    onClick={() => setPaginaActual(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    className={styles.btnPaginacion}
                    title="Ultima pagina"
                  >
                    <FontAwesomeIcon icon={faAngleDoubleRight} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faList} className={styles.emptyIcon} />
            <h3>Sin datos para mostrar</h3>
            <p>Ajuste los parametros de busqueda y presione Consultar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recaudos;
