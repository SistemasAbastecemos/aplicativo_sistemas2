import React, { useState, useEffect } from "react";
import styles from "./LibroAuxiliar.module.css";
import { apiService } from "../../../services/api";
import { useNotification } from "../../../contexts/NotificationContext";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFileExcel,
  faFileCsv,
  faBuilding,
  faCalendarAlt,
  faMapMarkerAlt,
  faUserTie,
  faTable,
  faChevronLeft,
  faChevronRight,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../../assets/images/logo.png";

const EMPRESAS = [
  { value: "AB", label: "Abastecemos de Occidente" },
  { value: "TH", label: "Tobar Sanchez" },
];

const ITEMS_POR_PAGINA = 100;
const LIMITE_REGISTROS_EXCEL = 450000;

function LibroAuxiliar() {
  const { addNotification } = useNotification();
  const [cargando, setCargando] = useState(false);
  const [sedes, setSedes] = useState([]);
  const [proveedoresOptions, setProveedoresOptions] = useState([]);
  const [buscandoProveedor, setBuscandoProveedor] = useState(false);
  const [datosVistaPrevia, setDatosVistaPrevia] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [progresoCarga, setProgresoCarga] = useState("");

  const [filtros, setFiltros] = useState({
    empresa: "AB",
    sede: "",
    proveedor_id: "",
    proveedor_desc: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  useEffect(() => {
    const cargarSedes = async () => {
      try {
        const response = await apiService.searchSedes();
        if (response.success) {
          setSedes(response.data);
        }
      } catch (error) {
        addNotification({
          message: "Fallo en la extraccion de centros de operacion",
          type: "error",
        });
      }
    };
    cargarSedes();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleProveedorSearch = async (e) => {
    const termino = e.target.value;
    setFiltros((prev) => ({
      ...prev,
      proveedor_desc: termino,
      proveedor_id: "",
    }));

    if (termino.length < 3) {
      setProveedoresOptions([]);
      return;
    }

    setBuscandoProveedor(true);
    try {
      const response = await apiService.searchProveedores(termino);
      if (response.success) {
        setProveedoresOptions(response.data);
      }
    } catch (error) {
      addNotification({
        message: "Fallo en la busqueda de proveedores",
        type: "error",
      });
    } finally {
      setBuscandoProveedor(false);
    }
  };

  const selectProveedor = (prov) => {
    setFiltros((prev) => ({
      ...prev,
      proveedor_id: prov.codigo,
      proveedor_desc: `${prov.codigo} - ${prov.descripcion}`,
    }));
    setProveedoresOptions([]);
  };

  const generarLapsosMensuales = (inicio, fin) => {
    let lapsos = [];
    let fechaActual = new Date(inicio + "T00:00:00");
    const fechaFin = new Date(fin + "T00:00:00");

    while (fechaActual <= fechaFin) {
      let y = fechaActual.getFullYear();
      let m = fechaActual.getMonth();
      let primerDia = new Date(y, m, 1);
      if (primerDia < new Date(inicio + "T00:00:00")) {
        primerDia = new Date(inicio + "T00:00:00");
      }
      let ultimoDia = new Date(y, m + 1, 0);
      if (ultimoDia > fechaFin) {
        ultimoDia = fechaFin;
      }
      lapsos.push({
        inicio: primerDia.toISOString().split("T")[0],
        fin: ultimoDia.toISOString().split("T")[0],
        etiqueta: `${y}-${String(m + 1).padStart(2, "0")}`,
      });
      fechaActual = new Date(y, m + 1, 1);
    }
    return lapsos;
  };

  const getBase64ImageFromUrl = async (imageSource) => {
    try {
      if (imageSource.startsWith("data:image")) return imageSource;
      const res = await fetch(imageSource);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(reader.result), false);
        reader.addEventListener("error", () =>
          reject(new Error("Fallo al procesar imagen corporativa")),
        );
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      return null;
    }
  };

  const consultarDatos = async () => {
    if (!filtros.fecha_inicio || !filtros.fecha_fin) {
      addNotification({
        message: "Defina un rango de fechas",
        type: "warning",
      });
      return;
    }

    setCargando(true);
    setDatosVistaPrevia([]);
    setPaginaActual(1);

    const lapsos = generarLapsosMensuales(
      filtros.fecha_inicio,
      filtros.fecha_fin,
    );
    let acumuladorGeneral = [];

    try {
      for (let i = 0; i < lapsos.length; i++) {
        const lapso = lapsos[i];
        setProgresoCarga(
          `Procesando periodo: ${lapso.etiqueta} (${i + 1} de ${lapsos.length})`,
        );
        const response = await apiService.obtenerDatosAuxiliar({
          ...filtros,
          fecha_inicio: lapso.inicio,
          fecha_fin: lapso.fin,
        });

        if (response.success && response.data) {
          acumuladorGeneral = [...acumuladorGeneral, ...response.data];
        }
      }

      if (acumuladorGeneral.length > 0) {
        acumuladorGeneral.sort((a, b) => {
          if (a.terc !== b.terc) return a.terc.localeCompare(b.terc);
          const fA = `${a.ano}${a.mes.padStart(2, "0")}${a.dia.padStart(2, "0")}`;
          const fB = `${b.ano}${b.mes.padStart(2, "0")}${b.dia.padStart(2, "0")}`;
          return fB.localeCompare(fA);
        });
        setDatosVistaPrevia(acumuladorGeneral);
        addNotification({
          message: `Carga completa: ${acumuladorGeneral.length} registros extraidos.`,
          type: "success",
        });
      } else {
        addNotification({
          message: "No se encontraron datos",
          type: "warning",
        });
      }
    } catch (error) {
      addNotification({
        message: "Error en la concatenacion: " + error.message,
        type: "error",
      });
    } finally {
      setCargando(false);
      setProgresoCarga("");
    }
  };

  const construirCSV = () => {
    if (datosVistaPrevia.length === 0) return;

    setCargando(true);
    setProgresoCarga("Generando archivo CSV...");

    setTimeout(() => {
      try {
        const encabezados = [
          "Empresa",
          "CO",
          "Desc_CO",
          "Cuenta",
          "Desc_Cuenta",
          "Tercero",
          "Razon_Social",
          "Dia",
          "Mes",
          "Ano",
          "Tipo_Doc",
          "Num_Doc",
          "Detalle",
          "CCosto",
          "Desc_CCosto",
          "Grupo_Proy",
          "Proyecto",
          "Desc_Proyecto",
          "Pref_Prov",
          "Nro_Prov",
          "Nat",
          "Valor_Debito",
        ];

        const filas = datosVistaPrevia.map((row) =>
          [
            row.id_emp,
            row.doc_fc_co,
            `"${row.desc_co}"`,
            row.id_cuenta,
            `"${row.desc_cuenta}"`,
            row.terc,
            `"${row.desc_proveedor}"`,
            row.dia,
            row.mes,
            row.ano,
            row.doc_fc_tipo,
            row.documento_fc,
            `"${row.detalle1}"`,
            row.id_ccosto,
            `"${row.desc_ccosto}"`,
            row.id_gpo_proyec,
            row.id_proyecto,
            `"${row.desc_proyecto}"`,
            row.pref_prov_doc,
            row.nro_prov_doc,
            row.naturaleza,
            row.valor_deb,
          ].join(";"),
        );

        const csvContent =
          "\uFEFF" + [encabezados.join(";"), ...filas].join("\n");
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        saveAs(
          blob,
          `Libro_Auxiliar_${filtros.empresa}_${new Date().getTime()}.csv`,
        );

        addNotification({
          message: "CSV generado exitosamente",
          type: "success",
        });
      } catch (error) {
        addNotification({ message: "Error al generar CSV", type: "error" });
      } finally {
        setCargando(false);
        setProgresoCarga("");
      }
    }, 50);
  };

  const construirExcelCorporativo = async () => {
    if (datosVistaPrevia.length === 0) return;
    if (datosVistaPrevia.length > LIMITE_REGISTROS_EXCEL) {
      addNotification({
        message: "Volumen de datos excede el limite de Excel. Use CSV.",
        type: "warning",
      });
      return;
    }

    setCargando(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Libro Auxiliar", {
        views: [{ showGridLines: false }],
      });

      const logoBase64 = await getBase64ImageFromUrl(logo);
      if (logoBase64) {
        const logoId = workbook.addImage({
          base64: logoBase64,
          extension: "png",
        });
        worksheet.mergeCells("A1:C4");
        worksheet.addImage(logoId, {
          tl: { col: 0.1, row: 0.2 },
          ext: { width: 160, height: 65 },
        });
      }

      const empresaNombre =
        EMPRESAS.find((e) => e.value === filtros.empresa)?.label ||
        filtros.empresa;
      const sedeNombre =
        sedes.find((s) => s.codigo === filtros.sede)?.descripcion ||
        "CONSOLIDADO GENERAL";
      const proveedorNombre = filtros.proveedor_desc || "TODOS";
      const fechaTxt = filtros.fecha_inicio
        ? `${filtros.fecha_inicio} al ${filtros.fecha_fin}`
        : "Historico completo";

      worksheet.mergeCells("D1:J2");
      const titleCell = worksheet.getCell("D1");
      titleCell.value = "LIBRO AUXILIAR POR CUENTA";
      titleCell.font = {
        name: "Arial",
        size: 16,
        bold: true,
        color: { argb: "FF1E293B" },
      };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };

      worksheet.mergeCells("D3:J4");
      const filterCell = worksheet.getCell("D3");
      filterCell.value = `EMPRESA: ${empresaNombre} | SEDE: ${sedeNombre}\nPROVEEDOR: ${proveedorNombre} | PERIODO: ${fechaTxt}`;
      filterCell.font = {
        name: "Arial",
        size: 9,
        italic: true,
        color: { argb: "FF475569" },
      };
      filterCell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };

      const encabezados = [
        "Empresa",
        "C.O.",
        "Desc. C.O.",
        "Cuenta",
        "Desc. Cuenta",
        "Tercero",
        "Razon Social",
        "Dia",
        "Mes",
        "Ano",
        "Tipo Doc",
        "Num Doc",
        "Detalle",
        "C.Costo",
        "Desc. C.Costo",
        "Grupo Proy",
        "Proyecto",
        "Desc. Proyecto",
        "Pref Prov",
        "Nro Prov",
        "Nat",
        "Valor Debito",
      ];

      worksheet.getRow(6).values = encabezados;
      worksheet.getRow(6).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF009B6D" },
        };
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      datosVistaPrevia.forEach((row, index) => {
        const rowIndex = 7 + index;
        const worksheetRow = worksheet.getRow(rowIndex);
        worksheetRow.values = [
          row.id_emp,
          row.doc_fc_co,
          row.desc_co,
          row.id_cuenta,
          row.desc_cuenta,
          row.terc,
          row.desc_proveedor,
          row.dia,
          row.mes,
          row.ano,
          row.doc_fc_tipo,
          row.documento_fc,
          row.detalle1,
          row.id_ccosto,
          row.desc_ccosto,
          row.id_gpo_proyec,
          row.id_proyecto,
          row.desc_proyecto,
          row.pref_prov_doc,
          row.nro_prov_doc,
          row.naturaleza,
          parseFloat(row.valor_deb || 0),
        ];
        worksheetRow.getCell(22).numFmt = "#,##0.00";
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `Libro_Auxiliar_${filtros.empresa}_${new Date().getTime()}.xlsx`,
      );
    } catch (error) {
      addNotification({
        message: "Fallo en la generacion Excel",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const totalPaginas = Math.ceil(datosVistaPrevia.length / ITEMS_POR_PAGINA);
  const itemsActuales = datosVistaPrevia.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA,
  );
  const totalDebitoGeneral = datosVistaPrevia.reduce(
    (sum, row) => sum + parseFloat(row.valor_deb || 0),
    0,
  );
  const excelBloqueado = datosVistaPrevia.length > LIMITE_REGISTROS_EXCEL;

  return (
    <div className={styles.container}>
      {cargando && (
        <div className={styles.loadingOverlay}>
          <div className={styles.localSpinner}></div>
          <h2 className={styles.localLoadingText}>
            {progresoCarga || "Extrayendo datos..."}
          </h2>
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Libro Auxiliar</h1>
        </div>
        {datosVistaPrevia.length > 0 && (
          <div className={styles.totalGeneralCard}>
            <span className={styles.totalLabel}>Total General</span>
            <span className={styles.totalValue}>
              {new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
              }).format(totalDebitoGeneral)}
            </span>
          </div>
        )}
      </div>

      <div className={styles.formCard}>
        <div className={styles.gridContainer}>
          <div
            className={`${styles.formGroup} ${styles.floating} ${styles.colSpan2}`}
          >
            <select
              name="empresa"
              className={styles.input}
              value={filtros.empresa}
              onChange={handleFilterChange}
            >
              {EMPRESAS.map((emp) => (
                <option key={emp.value} value={emp.value}>
                  {emp.label}
                </option>
              ))}
            </select>
            <label className={styles.label}>
              <FontAwesomeIcon icon={faBuilding} /> Empresa
            </label>
          </div>

          <div
            className={`${styles.formGroup} ${styles.floating} ${styles.colSpan3}`}
          >
            <select
              name="sede"
              className={styles.input}
              value={filtros.sede}
              onChange={handleFilterChange}
            >
              <option value="">Consolidado general</option>
              {sedes.map((s) => (
                <option key={s.codigo} value={s.codigo}>
                  {s.codigo} - {s.descripcion}
                </option>
              ))}
            </select>
            <label className={styles.label}>
              <FontAwesomeIcon icon={faMapMarkerAlt} /> Centro de Operacion
            </label>
          </div>

          <div
            className={`${styles.formGroup} ${styles.floating} ${styles.colSpan3}`}
          >
            <input
              type="text"
              className={styles.input}
              value={filtros.proveedor_desc}
              placeholder="NIT O DESCRIPCION"
              onChange={handleProveedorSearch}
            />
            <label className={styles.label}>
              <FontAwesomeIcon icon={faUserTie} /> Tercero
            </label>
            {proveedoresOptions.length > 0 && (
              <ul className={styles.optionsList}>
                {proveedoresOptions.map((prov) => (
                  <li key={prov.codigo} onClick={() => selectProveedor(prov)}>
                    {prov.codigo} - {prov.descripcion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            className={`${styles.formGroup} ${styles.floating} ${styles.colSpan2}`}
          >
            <input
              type="date"
              name="fecha_inicio"
              className={styles.input}
              value={filtros.fecha_inicio}
              onChange={handleFilterChange}
            />
            <label className={styles.label}>
              <FontAwesomeIcon icon={faCalendarAlt} /> Fecha Inicio
            </label>
          </div>

          <div
            className={`${styles.formGroup} ${styles.floating} ${styles.colSpan2}`}
          >
            <input
              type="date"
              name="fecha_fin"
              className={styles.input}
              value={filtros.fecha_fin}
              onChange={handleFilterChange}
            />
            <label className={styles.label}>
              <FontAwesomeIcon icon={faCalendarAlt} /> Fecha Final
            </label>
          </div>
        </div>

        <div className={styles.actionContainer}>
          <button className={styles.btnSecondary} onClick={consultarDatos}>
            <FontAwesomeIcon icon={faTable} /> Consultar
          </button>

          <button
            className={styles.btnCSV}
            onClick={construirCSV}
            disabled={datosVistaPrevia.length === 0}
          >
            <FontAwesomeIcon icon={faFileCsv} /> Exportar CSV
          </button>

          <div className={styles.excelControl}>
            <button
              className={styles.btnPrimary}
              onClick={construirExcelCorporativo}
              disabled={datosVistaPrevia.length === 0 || excelBloqueado}
            >
              <FontAwesomeIcon icon={faFileExcel} /> Exportar Excel
            </button>
            {excelBloqueado && (
              <span className={styles.warningTooltip}>
                <FontAwesomeIcon icon={faExclamationTriangle} /> Use CSV para
                mas de 50k filas
              </span>
            )}
          </div>
        </div>
      </div>

      {datosVistaPrevia.length > 0 && (
        <div className={styles.previewContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>C.O.</th>
                  <th>Cuenta</th>
                  <th>Desc. Cuenta</th>
                  <th>Tercero</th>
                  <th>Fecha</th>
                  <th>Documento</th>
                  <th style={{ textAlign: "right" }}>Valor Debito</th>
                </tr>
              </thead>
              <tbody>
                {itemsActuales.map((row, index) => (
                  <tr key={index}>
                    <td>{row.doc_fc_co}</td>
                    <td className={styles.bold}>{row.id_cuenta}</td>
                    <td>{row.desc_cuenta}</td>
                    <td>
                      {row.terc} - {row.desc_proveedor}
                    </td>
                    <td>{`${row.ano}-${row.mes}-${row.dia}`}</td>
                    <td>{`${row.doc_fc_tipo} ${row.documento_fc}`}</td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: "700",
                        color: "#009b6d",
                      }}
                    >
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                      }).format(row.valor_deb || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.pagination}>
            <button
              className={styles.paginationButton}
              onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
            >
              <FontAwesomeIcon icon={faChevronLeft} /> Anterior
            </button>
            <span className={styles.paginationInfo}>
              Pagina <strong>{paginaActual}</strong> de {totalPaginas}
            </span>
            <button
              className={styles.paginationButton}
              onClick={() =>
                setPaginaActual((p) => Math.min(totalPaginas, p + 1))
              }
              disabled={paginaActual >= totalPaginas}
            >
              Siguiente <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LibroAuxiliar;
