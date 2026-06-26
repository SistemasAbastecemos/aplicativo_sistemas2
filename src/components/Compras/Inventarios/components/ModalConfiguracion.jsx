import React, { useState, useEffect } from "react";
import styles from "../PermisosInventario.module.css";
import SelectorProveedor from "./SelectorProveedor";
import SelectorCriterio from "./SelectorCriterio";
import { useAuth } from "../../../../contexts/AuthContext";
import { apiService } from "../../../../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSave,
  faSpinner,
  faPlus,
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

function ModalConfiguracion({ data, onClose, onSave }) {
  const isEdit = !!data?.id;
  const { user } = useAuth(); // Extraccion del usuario en sesion activa

  const [proveedor, setProveedor] = useState({ nit: "", razon_social: "" });
  const [acceso, setAcceso] = useState(true);
  const [origenConsultaSaldo, setOrigenConsultaSaldo] = useState("CRITERIO");
  const [criterios, setCriterios] = useState([]);
  const [columnas, setColumnas] = useState({});
  const [lineasExcluidas, setLineasExcluidas] = useState("");
  const [saving, setSaving] = useState(false);

  const [sedesDisponibles, setSedesDisponibles] = useState([]);
  const [sedesSeleccionadas, setSedesSeleccionadas] = useState([]);
  const [loadingSedes, setLoadingSedes] = useState(false);

  const [lapsosConfig, setLapsosConfig] = useState({
    permitir_todos: true,
    exclusiones: [],
  });
  const [selAnio, setSelAnio] = useState(new Date().getFullYear().toString());
  const [selMes, setSelMes] = useState("todos");

  useEffect(() => {
    async function loadSedesCorporativas() {
      setLoadingSedes(true);
      try {
        const rawData = await apiService.getSedes(true);
        const listNormalizada = (rawData || [])
          .map((item) => {
            if (typeof item === "object" && item !== null) {
              return (item.codigo || "").toUpperCase().trim();
            }
            return String(item).toUpperCase().trim();
          })
          .filter((name) => name !== "");

        setSedesDisponibles(listNormalizada);
        if (!isEdit) setSedesSeleccionadas(listNormalizada);
      } catch (err) {
        const fallback = [""];
        setSedesDisponibles(fallback);
        if (!isEdit) setSedesSeleccionadas(fallback);
      } finally {
        setLoadingSedes(false);
      }
    }
    loadSedesCorporativas();
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) {
      setProveedor({
        nit: data.nit_proveedor,
        razon_social: data.razon_social,
      });
      setAcceso(data.acceso_inventario === 1);
      setOrigenConsultaSaldo("CRITERIO"); // Garantiza consistencia por Criterio 1 por defecto
      setCriterios(data.criterios || []);
      setColumnas(data.columnas_permitidas || {});
      setSedesSeleccionadas(data.sedes_permitidas || []);
      setLineasExcluidas((data.lineas_excluidas || []).join(", "));

      if (
        data.lapsos_permitidos &&
        typeof data.lapsos_permitidos === "object"
      ) {
        setLapsosConfig({
          permitir_todos: data.lapsos_permitidos.permitir_todos !== false,
          exclusiones: data.lapsos_permitidos.exclusiones || [],
        });
      }
    } else {
      const initialCols = {};
      COLS_MATRIZ.forEach((c) => (initialCols[c.id] = true));
      setColumnas(initialCols);
      setOrigenConsultaSaldo("CRITERIO");
    }
  }, [data, isEdit]);

  const handleAddCriterioToken = (nuevoCod) => {
    if (nuevoCod === null || nuevoCod === undefined) return;
    const sanitizado = String(nuevoCod).trim().toUpperCase();
    if (sanitizado === "") return;
    if (!criterios.includes(sanitizado)) {
      setCriterios((prev) => [...prev, sanitizado]);
    }
  };

  const handleRemoveCriterioToken = (codTarget) => {
    setCriterios((prev) => prev.filter((c) => c !== codTarget));
  };

  const handleBulkSedes = (status) =>
    setSedesSeleccionadas(status ? [...sedesDisponibles] : []);

  const handleCheckSede = (sede) => {
    setSedesSeleccionadas((prev) =>
      prev.includes(sede) ? prev.filter((i) => i !== sede) : [...prev, sede],
    );
  };

  const handleAddExclusionLapso = () => {
    if (!selAnio.trim()) return;
    if (
      lapsosConfig.exclusiones.some(
        (e) => e.anio === selAnio && e.mes === selMes,
      )
    )
      return;
    setLapsosConfig((prev) => ({
      ...prev,
      exclusiones: [...prev.exclusiones, { anio: selAnio, mes: selMes }],
    }));
  };

  const toggleBulkColumnas = (status) => {
    const updatedCols = {};
    COLS_MATRIZ.forEach((c) => (updatedCols[c.id] = status));
    setColumnas(updatedCols);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isFormInvalid) return;

    setSaving(true);
    const splitLineas = lineasExcluidas
      .split(",")
      .map((l) => l.trim())
      .filter((l) => l !== "");

    // Generacion del payload auditado incluyendo el login del usuario actual
    const payload = {
      id: data?.id || undefined,
      nit_proveedor: proveedor.nit,
      razon_social: proveedor.razon_social,
      acceso_inventario: acceso ? 1 : 0,
      origen_consulta_saldo: origenConsultaSaldo,
      criterios: criterios,
      columnas_permitidas: columnas,
      sedes_permitidas: sedesSeleccionadas,
      lapsos_permitidos: lapsosConfig,
      lineas_excluidas: splitLineas,
      actualizado_por: user?.login || "sistema",
    };

    const isOk = await onSave(payload);
    setSaving(false);
    if (isOk) onClose();
  };

  const requiereCriterio =
    origenConsultaSaldo === "CRITERIO" || origenConsultaSaldo === "AMBOS";

  // Mismas reglas para ambos campos obligatorios: deben tener contenido real
  const tieneNitValido = !!(
    proveedor?.nit && String(proveedor.nit).trim() !== ""
  );
  const tieneCriterioValido = !requiereCriterio || criterios.length > 0;

  const isFormInvalid =
    !tieneNitValido || !tieneCriterioValido || sedesSeleccionadas.length === 0;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>
            {isEdit
              ? "Modificar Politica del Proveedor"
              : "Nueva Parametrizacion por Proveedor"}
          </h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className={styles.modalForm}>
          <div className={styles.formGrid}>
            <div className={styles.fullWidth}>
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
            </div>

            <div className={styles.fullWidth}>
              <div className={styles.floatingField}>
                <select
                  className={styles.modalSelect}
                  value={origenConsultaSaldo}
                  onChange={(e) => setOrigenConsultaSaldo(e.target.value)}
                >
                  <option value="NIT" disabled>
                    Consultar unicamente por NIT del Proveedor (No disponible)
                  </option>
                  <option value="CRITERIO">
                    Consultar unicamente por Criterio 1 (Obligatorio)
                  </option>
                  <option value="AMBOS" disabled>
                    Verificacion Cruzada (NIT + Criterio 1) (No disponible)
                  </option>
                </select>
                <label className={styles.floatingLabel}>
                  Estrategia de Consulta de Saldos (Inventario)
                </label>
              </div>
            </div>

            <div className={styles.fullWidth}>
              <SelectorCriterio onSelect={handleAddCriterioToken} />
              <div
                className={styles.tagsWrapper}
                style={{ marginTop: "0.75rem" }}
              >
                {requiereCriterio && criterios.length === 0 && (
                  <span className={styles.errorTextNotice}>
                    <FontAwesomeIcon icon={faExclamationCircle} /> Es
                    obligatorio asociar al menos un Criterio 1 bajo la
                    estrategia actual.
                  </span>
                )}
                <div className={styles.tagsContainer}>
                  {criterios.map((crit) => (
                    <div key={crit} className={styles.criterioTag}>
                      <span>{crit}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterioToken(crit)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className={styles.floatingField}>
                <select
                  className={styles.modalSelect}
                  value={acceso ? "1" : "0"}
                  onChange={(e) => setAcceso(e.target.value === "1")}
                >
                  <option value="1">Canal Abierto (Permitido)</option>
                  <option value="0">Canal Bloqueado (Restringido)</option>
                </select>
                <label className={styles.floatingLabel}>Estado del Canal</label>
              </div>
            </div>

            <div className={styles.fullWidth}>
              <div className={styles.sectionTitleBlock}>
                <h3>Columnas Visibles</h3>
                <div className={styles.bulkActions}>
                  <button
                    type="button"
                    onClick={() => toggleBulkColumnas(true)}
                  >
                    Marcar Todas
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleBulkColumnas(false)}
                  >
                    Desmarcar Todas
                  </button>
                </div>
              </div>
              <div className={styles.checkboxGrid}>
                {COLS_MATRIZ.map((c) => (
                  <label key={c.id} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={!!columnas[c.id]}
                      onChange={(e) =>
                        setColumnas((prev) => ({
                          ...prev,
                          [c.id]: e.target.checked,
                        }))
                      }
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.fullWidth}>
              <div className={styles.sectionTitleBlock}>
                <h3>
                  Sedes Autorizadas{" "}
                  <span className={styles.requiredIndicator}>*</span>
                </h3>
                <div className={styles.bulkActions}>
                  <button type="button" onClick={() => handleBulkSedes(true)}>
                    Marcar Todas
                  </button>
                  <button type="button" onClick={() => handleBulkSedes(false)}>
                    Desmarcar Todas
                  </button>
                </div>
              </div>
              {loadingSedes ? (
                <p className={styles.miniLoader}>
                  <FontAwesomeIcon icon={faSpinner} spin /> Cargando catálogo...
                </p>
              ) : (
                <div className={styles.sedesScrollContainer}>
                  <div className={styles.sedesResponsiveGrid}>
                    {sedesDisponibles.map((s) => (
                      <label key={s} className={styles.checkboxLabelCard}>
                        <input
                          type="checkbox"
                          checked={sedesSeleccionadas.includes(s)}
                          onChange={() => handleCheckSede(s)}
                        />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.fullWidth}>
              <div className={styles.sectionTitleBlock}>
                <h3>Lapsos Temporales (Periodos)</h3>
              </div>
              <div className={styles.toggleRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={lapsosConfig.permitir_todos}
                    onChange={(e) =>
                      setLapsosConfig((prev) => ({
                        ...prev,
                        permitir_todos: e.target.checked,
                      }))
                    }
                  />
                  Permitir todos los periodos historicos
                </label>
              </div>
              <div className={styles.periodSelectorForm}>
                <div className={styles.periodField}>
                  <span>Año:</span>
                  <input
                    type="number"
                    className={styles.miniInput}
                    value={selAnio}
                    onChange={(e) => setSelAnio(e.target.value)}
                  />
                </div>
                <div className={styles.periodField}>
                  <span>Mes:</span>
                  <select
                    className={styles.miniSelect}
                    value={selMes}
                    onChange={(e) => setSelMes(e.target.value)}
                  >
                    <option value="todos">Todo el año</option>
                    {MESES_MATRIZ.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className={styles.addPeriodBtn}
                  onClick={handleAddExclusionLapso}
                >
                  Restringir
                </button>
              </div>
              <div className={styles.tagsWrapper}>
                <div className={styles.tagsContainer}>
                  {lapsosConfig.exclusiones.map((exc, idx) => (
                    <div key={idx} className={styles.periodTag}>
                      <span>
                        {exc.anio} (
                        {exc.mes === "todos"
                          ? "Todo el año"
                          : MESES_MATRIZ.find((m) => m.id === exc.mes)?.name}
                        )
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setLapsosConfig((p) => ({
                            ...p,
                            exclusiones: p.exclusiones.filter(
                              (e) =>
                                !(e.anio === exc.anio && e.mes === exc.mes),
                            ),
                          }))
                        }
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.fullWidth}>
              <div className={styles.floatingField}>
                <input
                  type="text"
                  className={styles.modalInput}
                  placeholder="Ej: 62, 1401"
                  value={lineasExcluidas}
                  onChange={(e) => setLineasExcluidas(e.target.value)}
                />
                <label className={styles.floatingLabel}>
                  Lineas Excluidas (Filtrado Manual Siesa)
                </label>
              </div>
              <small className={styles.fieldHint}>
                Ingrese los id_linea1 que NO deben mostrarse. Ej: si escribe 62,
                se ocultaran los items cuya id_linea1 sea 62. Separe varios con
                comas.
              </small>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={saving || isFormInvalid}
            >
              <FontAwesomeIcon
                icon={saving ? faSpinner : faSave}
                spin={saving}
              />{" "}
              {isEdit ? "Actualizar Proveedor" : "Confirmar Parametros"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalConfiguracion;
