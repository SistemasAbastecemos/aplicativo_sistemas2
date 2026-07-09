import React, { useState, useEffect } from "react";
import styles from "../PermisosInventario.module.css";
import SelectorProveedor from "./SelectorProveedor";
import SelectorCriterio from "./SelectorCriterio";
import { useAuth } from "../../../../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCheck,
  faCalendarAlt,
  faPlus,
  faTrashAlt,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

const COLS_MATRIZ = [
  { id: "existencia_unidades", label: "Existencia en Unidades" },
  { id: "existencia_valor", label: "Existencia en Valor" },
  { id: "venta_unidades", label: "Venta en Unidades" },
  { id: "venta_valor", label: "Venta en Valor" },
  { id: "costo_unitario", label: "Costo Unitario" },
  { id: "costo_total", label: "Costo Total" },
];

const MESES_MATRIZ = [
  { id: "01", name: "Enero" },
  { id: "02", name: "Febrero" },
  { id: "03", name: "Marzo" },
  { id: "04", name: "Abril" },
  { id: "05", name: "Mayo" },
  { id: "06", name: "Junio" },
  { id: "07", name: "Julio" },
  { id: "08", name: "Agosto" },
  { id: "09", name: "Septiembre" },
  { id: "10", name: "Octubre" },
  { id: "11", name: "Noviembre" },
  { id: "12", name: "Diciembre" },
];

function ModalConfiguracion({ data, sedesDisponibles = [], onClose, onSave }) {
  const isEdit = !!data?.id;
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  // Estados de Entidad e Indicadores Lógicos
  const [proveedor, setProveedor] = useState({ nit: "", razon_social: "" });
  const [origenConsultaSaldo, setOrigenConsultaSaldo] = useState("CRITERIO");
  const [acceso, setAcceso] = useState(true);
  const [criterios, setCriterios] = useState([]);
  const [lineasExcluidas, setLineasExcluidas] = useState("");

  // Estructuras de Grillas
  const [columnas, setColumnas] = useState(() => {
    const initialCols = {};
    COLS_MATRIZ.forEach((c) => (initialCols[c.id] = true));
    return initialCols;
  });
  const [sedesSeleccionadas, setSedesSeleccionadas] = useState([]);

  // Constructor de Multi-Temporalidad
  const [lapsosConfig, setLapsosConfig] = useState({
    permitir_todos: true,
    exclusiones: [],
  });
  const [selAnio, setSelAnio] = useState(new Date().getFullYear().toString());
  const [selMes, setSelMes] = useState("todos");

  // Normalización segura del listado de sedes disponibles
  const listaSedesNormalizada = React.useMemo(() => {
    return sedesDisponibles
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return (item.codigo || item.id || item.nombre || "")
            .toUpperCase()
            .trim();
        }
        return String(item).toUpperCase().trim();
      })
      .filter(Boolean);
  }, [sedesDisponibles]);

  // Encendido automático de marcas por defecto en modo creación
  useEffect(() => {
    if (!isEdit && listaSedesNormalizada.length > 0) {
      setSedesSeleccionadas(listaSedesNormalizada);
    }
  }, [listaSedesNormalizada, isEdit]);

  // Hidratación y emparejamiento exacto de datos en Modo Edición
  useEffect(() => {
    if (isEdit && data) {
      setProveedor({
        nit: data.nit_proveedor || data.nit || "",
        razon_social: data.razon_social || "",
      });
      setAcceso(data.acceso_inventario === 1);
      setOrigenConsultaSaldo(data.origen_consulta_saldo || "CRITERIO");
      setCriterios(data.criterios || []);
      setColumnas(data.columnas_permitidas || {});
      setLineasExcluidas(
        Array.isArray(data.lineas_excluidas)
          ? data.lineas_excluidas.join(", ")
          : "",
      );

      if (data.sedes_permitidas) {
        if (typeof data.sedes_permitidas === "string") {
          const list = data.sedes_permitidas
            .split(",")
            .map((s) => s.trim().toUpperCase())
            .filter(Boolean);
          setSedesSeleccionadas(
            list.includes("TODAS") ? listaSedesNormalizada : list,
          );
        } else if (Array.isArray(data.sedes_permitidas)) {
          const listArr = data.sedes_permitidas.map((s) =>
            String(s).trim().toUpperCase(),
          );
          setSedesSeleccionadas(
            listArr.includes("TODAS") ? listaSedesNormalizada : listArr,
          );
        }
      }

      if (
        data.lapsos_permitidos &&
        typeof data.lapsos_permitidos === "object"
      ) {
        setLapsosConfig({
          permitir_todos: data.lapsos_permitidos.permitir_todos !== false,
          exclusiones: data.lapsos_permitidos.exclusiones || [],
        });
      }
    }
  }, [data, isEdit, listaSedesNormalizada]);

  const toggleBulkColumnas = (status) => {
    const updatedCols = {};
    COLS_MATRIZ.forEach((c) => (updatedCols[c.id] = status));
    setColumnas(updatedCols);
  };

  const handleBulkSedes = (status) => {
    setSedesSeleccionadas(status ? [...listaSedesNormalizada] : []);
  };

  const handleCheckSede = (sedeName) => {
    setSedesSeleccionadas((prev) =>
      prev.includes(sedeName)
        ? prev.filter((s) => s !== sedeName)
        : [...prev, sedeName],
    );
  };

  const handleAddCriterioToken = (nuevoCod) => {
    if (!nuevoCod) return;
    const sanitizado = String(nuevoCod).trim().toUpperCase();
    if (sanitizado !== "" && !criterios.includes(sanitizado)) {
      setCriterios((prev) => [...prev, sanitizado]);
    }
  };

  const handleRemoveCriterioToken = (codTarget) => {
    setCriterios((prev) => prev.filter((c) => c !== codTarget));
  };

  const handleAddExclusionLapso = () => {
    const anioClean = selAnio.trim();
    if (!anioClean) return;

    if (
      lapsosConfig.exclusiones.some(
        (e) => e.anio === anioClean && e.mes === selMes,
      )
    ) {
      return;
    }

    setLapsosConfig((prev) => ({
      ...prev,
      exclusiones: [...prev.exclusiones, { anio: anioClean, mes: selMes }],
    }));
  };

  const handleRemoveExclusionLapso = (index) => {
    setLapsosConfig((prev) => ({
      ...prev,
      exclusiones: prev.exclusiones.filter((_, i) => i !== index),
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isFormInvalid || saving) return;

    setSaving(true);
    try {
      const splitLineas = lineasExcluidas
        .split(",")
        .map((l) => l.trim())
        .filter((l) => l !== "");

      await onSave({
        id: data?.id || undefined,
        nit_proveedor: proveedor.nit.trim(),
        razon_social: proveedor.razon_social.trim(),
        acceso_inventario: acceso ? 1 : 0,
        origen_consulta_saldo: origenConsultaSaldo,
        criterios: criterios,
        columnas_permitidas: columnas,
        sedes_permitidas: sedesSeleccionadas,
        lapsos_permitidos: lapsosConfig,
        lineas_excluidas: splitLineas,
        actualizado_por: user?.login || "sistema",
      });
      onClose();
    } catch (err) {
      console.error("Error al despachar el formulario:", err);
    } finally {
      setSaving(false);
    }
  };

  const requiereCriterio =
    origenConsultaSaldo === "CRITERIO" || origenConsultaSaldo === "AMBOS";
  const tieneNitValido = !!(
    proveedor?.nit && String(proveedor.nit).trim() !== ""
  );
  const tieneCriterioValido = !requiereCriterio || criterios.length > 0;
  const isFormInvalid =
    !tieneNitValido || !tieneCriterioValido || sedesSeleccionadas.length === 0;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            {isEdit
              ? "Modificar Política del Proveedor"
              : "Nueva Parametrización por Proveedor"}
          </h2>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            disabled={saving}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form
          onSubmit={handleFormSubmit}
          className={styles.modalFormScrollable}
        >
          <div className={styles.modalBody}>
            <div className={styles.formColumns}>
              {/* COLUMNA IZQUIERDA */}
              <div className={styles.formColumn}>
                {isEdit ? (
                  <div className={styles.infoStatic}>
                    <strong>Proveedor:</strong> {proveedor.nit} -{" "}
                    {proveedor.razon_social}
                  </div>
                ) : (
                  <SelectorProveedor
                    onSelect={(p) =>
                      setProveedor(
                        p
                          ? { nit: p.nit, razon_social: p.razon_social }
                          : { nit: "", razon_social: "" },
                      )
                    }
                  />
                )}

                <div
                  className={`${styles.formGroup} ${styles.floating}`}
                  style={{ marginTop: "14px" }}
                >
                  <select
                    className={styles.formSelect}
                    value={origenConsultaSaldo}
                    onChange={(e) => setOrigenConsultaSaldo(e.target.value)}
                    disabled={saving}
                  >
                    <option value="NIT" disabled>
                      Consultar únicamente por NIT del Proveedor (No disponible)
                    </option>
                    <option value="CRITERIO">
                      Consultar únicamente por Criterio 1 (Obligatorio)
                    </option>
                    <option value="AMBOS" disabled>
                      Verificación Cruzada (NIT + Criterio 1) (No disponible)
                    </option>
                  </select>
                  <label>Estrategia de Consulta de Saldos (Inventario)</label>
                </div>

                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <select
                    className={styles.formSelect}
                    value={acceso ? "1" : "0"}
                    onChange={(e) => setAcceso(e.target.value === "1")}
                    disabled={saving}
                  >
                    <option value="1">Canal Abierto (Permitido)</option>
                    <option value="0">Canal Bloqueado (Restringido)</option>
                  </select>
                  <label>Estado del Canal</label>
                </div>

                <div className={styles.sectionDivider}>
                  <h3>Asociar Criterio 1</h3>
                </div>
                <SelectorCriterio
                  onSelect={handleAddCriterioToken}
                  disabled={saving}
                />
                <div
                  className={styles.tagsContainer}
                  style={{ marginTop: "8px" }}
                >
                  {requiereCriterio && criterios.length === 0 && (
                    <span className={styles.errorTextNotice}>
                      <FontAwesomeIcon icon={faExclamationCircle} /> Es
                      obligatorio asociar al menos un Criterio 1.
                    </span>
                  )}
                  {criterios.map((crit) => (
                    <span key={crit} className={styles.criterioTag}>
                      {crit}
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterioToken(crit)}
                        disabled={saving}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </span>
                  ))}
                </div>

                <div
                  className={`${styles.formGroup} ${styles.floating}`}
                  style={{ marginTop: "14px" }}
                >
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder=" "
                    value={lineasExcluidas}
                    onChange={(e) => setLineasExcluidas(e.target.value)}
                    disabled={saving}
                  />
                  <label>Líneas Excluidas (Filtrado Manual Siesa)</label>
                </div>
                <small className={styles.fieldHint}>
                  Separe los ID por comas (Ej: 62, 1401).
                </small>
              </div>

              {/* COLUMNA DERECHA */}
              <div className={styles.formColumn}>
                <div>
                  <div className={styles.gridSectionTitleInline}>
                    <h3>Métricas Permitidas</h3>
                    <div className={styles.bulkActionsInline}>
                      <button
                        type="button"
                        className={styles.bulkBtnInline}
                        onClick={() => toggleBulkColumnas(true)}
                      >
                        Marcar Todas
                      </button>
                      <button
                        type="button"
                        className={styles.bulkBtnInline}
                        onClick={() => toggleBulkColumnas(false)}
                      >
                        Desmarcar Todas
                      </button>
                    </div>
                  </div>
                  <div className={styles.checkboxGrid}>
                    {COLS_MATRIZ.map((c) => (
                      <label key={c.id} className={styles.checkboxItem}>
                        <input
                          type="checkbox"
                          checked={!!columnas[c.id]}
                          onChange={(e) =>
                            setColumnas((p) => ({
                              ...p,
                              [c.id]: e.target.checked,
                            }))
                          }
                          disabled={saving}
                        />
                        {c.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: "24px" }}>
                  <div className={styles.gridSectionTitleInline}>
                    <h3>
                      Sedes Autorizadas{" "}
                      <span
                        className={styles.errorTextNotice}
                        style={{ display: "inline" }}
                      >
                        *
                      </span>
                    </h3>
                    <div className={styles.bulkActionsInline}>
                      <button
                        type="button"
                        className={styles.bulkBtnInline}
                        onClick={() => handleBulkSedes(true)}
                      >
                        Marcar Todas
                      </button>
                      <button
                        type="button"
                        className={styles.bulkBtnInline}
                        onClick={() => handleBulkSedes(false)}
                      >
                        Desmarcar Todas
                      </button>
                    </div>
                  </div>
                  <div
                    className={styles.checkboxGrid}
                    style={{
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(105px, 1fr))",
                    }}
                  >
                    {listaSedesNormalizada.map((s) => (
                      <label key={s} className={styles.checkboxItem}>
                        <input
                          type="checkbox"
                          checked={sedesSeleccionadas.includes(s)}
                          onChange={() => handleCheckSede(s)}
                          disabled={saving}
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* ÁREA INFERIOR EXTENDIDA BENTO */}
              <div className={styles.extendedBottomSection}>
                <div className={styles.sectionDivider}>
                  <h3>Lapsos Temporales (Periodos Excluidos de Consulta)</h3>
                </div>

                <div className={styles.temporalCreatorGrid}>
                  <div className={styles.temporalInputsPane}>
                    <label
                      className={styles.checkboxItem}
                      style={{ marginBottom: "14px", fontWeight: "600" }}
                    >
                      <input
                        type="checkbox"
                        checked={lapsosConfig.permitir_todos}
                        onChange={(e) =>
                          setLapsosConfig((p) => ({
                            ...p,
                            permitir_todos: e.target.checked,
                          }))
                        }
                        disabled={saving}
                      />
                      Permitir todos los periodos históricos
                    </label>

                    <div className={`${styles.formGroup} ${styles.floating}`}>
                      <input
                        type="number"
                        className={styles.formInput}
                        value={selAnio}
                        onChange={(e) => setSelAnio(e.target.value)}
                        placeholder=" "
                        disabled={saving}
                      />
                      <label>
                        <FontAwesomeIcon icon={faCalendarAlt} /> Año a
                        Restringir
                      </label>
                    </div>

                    <div
                      className={`${styles.formGroup} ${styles.floating}`}
                      style={{ marginTop: "14px" }}
                    >
                      <select
                        className={styles.formSelect}
                        value={selMes}
                        onChange={(e) => setSelMes(e.target.value)}
                        disabled={saving}
                      >
                        <option value="todos">Todo el año</option>
                        {MESES_MATRIZ.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                      <label>Mes de Corte</label>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddExclusionLapso}
                      className={styles.btnActionInline}
                      style={{ width: "100%", marginTop: "14px" }}
                      disabled={saving}
                    >
                      <FontAwesomeIcon icon={faPlus} /> Restringir Periodo
                    </button>
                  </div>

                  <div
                    className={styles.temporalListPane}
                    style={{ gridColumn: "span 2" }}
                  >
                    <h4 className={styles.subtextTitle}>
                      Lista de Lapsos Restringidos Activos
                    </h4>
                    <div
                      className={styles.rulesListWrapper}
                      style={{ maxHeight: "165px" }}
                    >
                      {lapsosConfig.exclusiones.map((exc, idx) => (
                        <div key={idx} className={styles.ruleListRow}>
                          <div className={styles.ruleDataText}>
                            <span className={styles.ruleYearBadge}>
                              {exc.anio}
                            </span>
                            <span className={styles.ruleMonthsText}>
                              {exc.mes === "todos"
                                ? "Año Completo Bloqueado"
                                : `Mes: ${MESES_MATRIZ.find((m) => m.id === exc.mes)?.name}`}
                            </span>
                          </div>
                          <button
                            type="button"
                            className={styles.btnRemoveRule}
                            onClick={() => handleRemoveExclusionLapso(idx)}
                            disabled={saving}
                          >
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </button>
                        </div>
                      ))}
                      {lapsosConfig.exclusiones.length === 0 && (
                        <p
                          className={styles.emptyHelpText}
                          style={{ textAlign: "center", paddingTop: "28px" }}
                        >
                          Sin exclusiones de periodos en la regla (Acceso
                          histórico total habilitado).
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              className={styles.cancelButton}
              onClick={onClose}
              type="button"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              className={`${styles.saveButton} ${isFormInvalid ? styles.disabled : ""}`}
              type="submit"
              disabled={saving || isFormInvalid}
            >
              <FontAwesomeIcon icon={faCheck} />{" "}
              {isEdit ? "Actualizar Propiedades" : "Confirmar Reglas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalConfiguracion;
