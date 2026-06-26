import React, { useState, useEffect, useCallback } from "react";
import styles from "./PlanosContables.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";
import { apiService } from "../../../services/api";
import {
  faUpload,
  faFileExcel,
  faExclamationTriangle,
  faTimes,
  faPaperPlane,
  faCloudUploadAlt,
  faBuilding,
  faFilter,
  faCog,
  faCalendarAlt,
  faLock,
  faSave,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function PlanosContables() {
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotification();

  const isAdmin =
    currentUser?.rol === "admin" ||
    currentUser?.area_nombre?.toUpperCase() === "SISTEMAS";

  const [activeTab, setActiveTab] = useState("carga");
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [config, setConfig] = useState({
    carga_habilitada: false,
    restricciones_retefuente: [],
    restricciones_ica_yumbo: [],
    restricciones_ica_palmira: [],
    restricciones_reteiva: [],
  });

  const [inputRF, setInputRF] = useState("");
  const [inputIcaY, setInputIcaY] = useState("");
  const [inputIcaP, setInputIcaP] = useState("");
  const [inputAnioIva, setInputAnioIva] = useState("");
  const [inputBimestreIva, setInputBimestreIva] = useState("1");
  const [guardandoConfig, setGuardandoConfig] = useState(false);

  const [file, setFile] = useState(null);
  const [empresa, setEmpresa] = useState("AB");
  const [tipo, setTipo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [progress, setProgress] = useState(0);
  const [controller, setController] = useState(null);

  const fetchConfiguracion = useCallback(async () => {
    try {
      const responseData = await apiService.getConfigPlanos();
      const data = responseData || {};
      setConfig({
        carga_habilitada: data.carga_habilitada ?? false,
        restricciones_retefuente:
          data.restricciones_retefuente || data.restricciones_generales || [],
        restricciones_ica_yumbo: data.restricciones_ica_yumbo || [],
        restricciones_ica_palmira: data.restricciones_ica_palmira || [],
        restricciones_reteiva: data.restricciones_reteiva || [],
      });
    } catch (error) {
      addNotification({
        message: "Error al cargar la configuracion inicial",
        type: "error",
      });
    } finally {
      setLoadingConfig(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchConfiguracion();
  }, [fetchConfiguracion]);

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleEmpresaChange = (e) => setEmpresa(e.target.value);
  const handleTipoChange = (e) => setTipo(e.target.value);

  const handleFileUpload = async () => {
    if (!file)
      return addNotification({
        message: "Selecciona un archivo.",
        type: "warning",
      });
    if (!empresa || !tipo)
      return addNotification({
        message: "Selecciona empresa y tipo.",
        type: "warning",
      });

    setCargando(true);
    setProgress(0);
    const uploadId = `${file.name}_${Date.now()}`;
    const newController = new AbortController();
    setController(newController);

    try {
      await apiService.updatePlanosContabilidad({
        file,
        empresa,
        tipo,
        uploadId,
        onProgress: (percent) => setProgress(percent),
        signal: newController.signal,
      });
      addNotification({
        message: "Archivo plano subido exitosamente.",
        type: "success",
      });
    } catch (err) {
      if (err.name === "AbortError") {
        addNotification({ message: "Subida cancelada.", type: "warning" });
      } else {
        addNotification({
          message: "Error al subir archivo plano.",
          type: "error",
        });
      }
    } finally {
      setCargando(false);
      setProgress(0);
      setFile(null);
    }
  };

  const handleCancel = () => {
    if (controller) controller.abort();
  };

  const handleToggleCarga = () => {
    setConfig((prev) => ({
      ...prev,
      carga_habilitada: !prev.carga_habilitada,
    }));
  };

  const handleAddRestriccionAnual = (keyState, valueState, resetter) => {
    const anio = parseInt(valueState);
    if (!anio || anio < 2000 || anio > 2100)
      return addNotification({ message: "Año invalido", type: "warning" });
    if (config[keyState].includes(anio))
      return addNotification({
        message: "El año ya esta restringido",
        type: "warning",
      });
    setConfig((prev) => ({
      ...prev,
      [keyState]: [...prev[keyState], anio].sort(),
    }));
    resetter("");
  };

  const handleRemoveRestriccionAnual = (keyState, anioToRemove) => {
    setConfig((prev) => ({
      ...prev,
      [keyState]: prev[keyState].filter((a) => a !== anioToRemove),
    }));
  };

  const handleAddRestriccionIva = () => {
    const anio = parseInt(inputAnioIva);
    const bimestre = parseInt(inputBimestreIva);
    if (!anio || anio < 2000 || anio > 2100)
      return addNotification({ message: "Año invalido", type: "warning" });
    const existe = config.restricciones_reteiva.some(
      (r) => r.anio === anio && r.bimestre === bimestre,
    );
    if (existe)
      return addNotification({
        message: "Este periodo ya esta restringido",
        type: "warning",
      });
    setConfig((prev) => ({
      ...prev,
      restricciones_reteiva: [
        ...prev.restricciones_reteiva,
        { anio, bimestre },
      ].sort((a, b) =>
        a.anio !== b.anio ? a.anio - b.anio : a.bimestre - b.bimestre,
      ),
    }));
    setInputAnioIva("");
  };

  const handleRemoveRestriccionIva = (anio, bimestre) => {
    setConfig((prev) => ({
      ...prev,
      restricciones_reteiva: prev.restricciones_reteiva.filter(
        (r) => !(r.anio === anio && r.bimestre === bimestre),
      ),
    }));
  };

  const handleSaveConfig = async () => {
    setGuardandoConfig(true);
    try {
      await apiService.updateConfigPlanos(config);
      addNotification({
        message: "Configuracion aplicada en los portales externos.",
        type: "success",
      });
    } catch (error) {
      addNotification({
        message: "Error al guardar configuracion",
        type: "error",
      });
    } finally {
      setGuardandoConfig(false);
    }
  };

  if (loadingConfig)
    return <LoadingScreen message="Cargando modulo contable..." />;
  if (cargando)
    return <LoadingScreen message={`Subiendo archivo... ${progress}%`} />;

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Planos Contables y Retenciones</h1>
          <p className={styles.subtitle}>
            Administracion de archivos base y politicas de generacion de
            certificados
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tab} ${activeTab === "carga" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("carga")}
        >
          <FontAwesomeIcon icon={faCloudUploadAlt} /> Carga de Archivos
        </button>
        <button
          className={`${styles.tab} ${activeTab === "configuracion" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("configuracion")}
        >
          <FontAwesomeIcon icon={faCog} /> Politicas y Restricciones
        </button>
      </div>

      {/* ════════════════════════════════════════
          TAB: CARGA DE ARCHIVOS
      ════════════════════════════════════════ */}
      {activeTab === "carga" && (
        <div className={styles.content}>
          {!config.carga_habilitada && !isAdmin ? (
            <div className={styles.disabledState}>
              <FontAwesomeIcon icon={faBan} className={styles.disabledIcon} />
              <h3>Funcionalidad Suspendida</h3>
              <p>
                La carga manual de planos ha sido deshabilitada por el
                administrador.
              </p>
            </div>
          ) : (
            <>
              {!config.carga_habilitada && isAdmin && (
                <div className={styles.warningBanner}>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <span>
                    El modulo de carga esta desactivado, pero usted puede operar
                    como administrador.
                  </span>
                </div>
              )}

              {/* Card unificada: selects + selector de archivo en una sola fila */}
              <div className={styles.mainCard}>
                <div className={styles.cardContent}>
                  <div className={styles.uploadArea}>
                    {/* Panel izquierdo: Empresa y Tipo */}
                    <div className={styles.filtersPanel}>
                      <div className={styles.filterGroup}>
                        <div className={styles.floatingField}>
                          <select
                            value={empresa}
                            onChange={handleEmpresaChange}
                            className={styles.filterSelect}
                          >
                            <option value="AB">
                              Abastecemos de Occidente S.A.S
                            </option>
                            <option value="TS">
                              Tobar Sanchez Valencia y Vallejo S.A
                            </option>
                          </select>
                          <label className={styles.floatingLabel}>
                            <FontAwesomeIcon
                              icon={faBuilding}
                              className={styles.filterIcon}
                            />
                            Empresa
                          </label>
                        </div>
                      </div>

                      <div className={styles.filterGroup}>
                        <div className={styles.floatingField}>
                          <select
                            value={tipo}
                            onChange={handleTipoChange}
                            className={styles.filterSelect}
                          >
                            <option value="">Seleccione un tipo</option>
                            <option value="CE">Comprobantes de Egreso</option>
                            <option value="N">Notas N</option>
                            <option value="NP">Notas NP</option>
                            <option value="NI">Notas NI</option>
                            <option value="CR">Notas CR</option>
                            <option value="NG">Notas NG</option>
                            <option value="Retefuente">
                              Retencion en la fuente
                            </option>
                            <option value="ReteicaYumbo">Rete ICA Yumbo</option>
                            <option value="ReteicaPalmira">
                              Rete ICA Palmira
                            </option>
                            <option value="Reteiva">Rete IVA</option>
                          </select>
                          <label className={styles.floatingLabel}>
                            <FontAwesomeIcon
                              icon={faFilter}
                              className={styles.filterIcon}
                            />
                            Tipo de Archivo
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Panel derecho: Seleccionar archivo */}
                    <div className={styles.uploadInfo}>
                      <h3>Seleccionar Archivo Plano</h3>
                      <div className={styles.uploadControls}>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className={styles.fileInput}
                          id="fileInput"
                        />
                        <label
                          htmlFor="fileInput"
                          className={styles.fileInputLabel}
                        >
                          <FontAwesomeIcon icon={faUpload} /> Seleccionar
                          archivo
                        </label>

                        {file && (
                          <div className={styles.fileInfo}>
                            <div className={styles.fileDetails}>
                              <FontAwesomeIcon
                                icon={faFileExcel}
                                className={styles.fileIcon}
                              />
                              <div>
                                <span className={styles.fileName}>
                                  {file.name}
                                </span>
                                <span className={styles.fileSize}>
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </div>
                            </div>
                            <button
                              className={styles.clearFile}
                              onClick={() => setFile(null)}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </div>
                        )}

                        <div className={styles.actionButtons}>
                          <button
                            onClick={handleFileUpload}
                            disabled={!file || !tipo}
                            className={`${styles.submitButton} ${!file || !tipo ? styles.disabled : ""}`}
                          >
                            <FontAwesomeIcon icon={faPaperPlane} /> Subir
                          </button>
                          {cargando && (
                            <button
                              onClick={handleCancel}
                              className={styles.cancelButton}
                            >
                              <FontAwesomeIcon icon={faTimes} /> Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          TAB: POLITICAS Y RESTRICCIONES
      ════════════════════════════════════════ */}
      {activeTab === "configuracion" && (
        <div className={styles.configContainer}>
          <div className={styles.configHeader}>
            <div className={styles.configIntro}>
              <h3>Parametros Globales del Sistema</h3>
              <p>
                Las restricciones aplican individualmente para el aplicativo
                externo de proveedores.
              </p>
            </div>
            <button
              className={styles.saveConfigBtn}
              onClick={handleSaveConfig}
              disabled={guardandoConfig}
            >
              <FontAwesomeIcon icon={faSave} />
              {guardandoConfig ? "Guardando..." : "Aplicar Cambios"}
            </button>
          </div>

          <div className={styles.configLayout}>
            {/* ── Toggle fila completa — solo admin ── */}
            {isAdmin && (
              <div className={styles.configBlockFull}>
                <div className={styles.blockHeader}>
                  <FontAwesomeIcon icon={faUpload} />
                  <h4>Disponibilidad del Modulo de Carga (Uso Interno)</h4>
                </div>
                <div className={styles.blockBody}>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      className={styles.toggleInput}
                      checked={config.carga_habilitada}
                      onChange={handleToggleCarga}
                    />
                    <span className={styles.toggleSlider}></span>
                    <span className={styles.toggleText}>
                      {config.carga_habilitada
                        ? "Modulo de Carga Habilitado"
                        : "Modulo de Carga Suspendido"}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* ── Retefuente ── */}
            <div className={styles.configBlock}>
              <div className={styles.blockHeader}>
                <FontAwesomeIcon icon={faLock} />
                <h4>Bloquear Retefuente</h4>
              </div>
              <div className={styles.blockBody}>
                <div className={styles.inputRow}>
                  <input
                    type="number"
                    placeholder="Ej. 2026"
                    value={inputRF}
                    onChange={(e) => setInputRF(e.target.value)}
                    className={styles.configInput}
                  />
                  <button
                    onClick={() =>
                      handleAddRestriccionAnual(
                        "restricciones_retefuente",
                        inputRF,
                        setInputRF,
                      )
                    }
                    className={styles.addBtn}
                  >
                    Agregar
                  </button>
                </div>
                <div className={styles.tagContainer}>
                  {config.restricciones_retefuente.length === 0 && (
                    <span className={styles.emptyTag}>Sin restricciones</span>
                  )}
                  {config.restricciones_retefuente.map((anio) => (
                    <div key={anio} className={styles.tag}>
                      <span>Año {anio}</span>
                      <button
                        onClick={() =>
                          handleRemoveRestriccionAnual(
                            "restricciones_retefuente",
                            anio,
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── ReteICA Yumbo ── */}
            <div className={styles.configBlock}>
              <div className={styles.blockHeader}>
                <FontAwesomeIcon icon={faLock} />
                <h4>Bloquear ReteICA Yumbo</h4>
              </div>
              <div className={styles.blockBody}>
                <div className={styles.inputRow}>
                  <input
                    type="number"
                    placeholder="Ej. 2026"
                    value={inputIcaY}
                    onChange={(e) => setInputIcaY(e.target.value)}
                    className={styles.configInput}
                  />
                  <button
                    onClick={() =>
                      handleAddRestriccionAnual(
                        "restricciones_ica_yumbo",
                        inputIcaY,
                        setInputIcaY,
                      )
                    }
                    className={styles.addBtn}
                  >
                    Agregar
                  </button>
                </div>
                <div className={styles.tagContainer}>
                  {config.restricciones_ica_yumbo.length === 0 && (
                    <span className={styles.emptyTag}>Sin restricciones</span>
                  )}
                  {config.restricciones_ica_yumbo.map((anio) => (
                    <div key={anio} className={styles.tag}>
                      <span>Año {anio}</span>
                      <button
                        onClick={() =>
                          handleRemoveRestriccionAnual(
                            "restricciones_ica_yumbo",
                            anio,
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── ReteICA Palmira ── */}
            <div className={styles.configBlock}>
              <div className={styles.blockHeader}>
                <FontAwesomeIcon icon={faLock} />
                <h4>Bloquear ReteICA Palmira</h4>
              </div>
              <div className={styles.blockBody}>
                <div className={styles.inputRow}>
                  <input
                    type="number"
                    placeholder="Ej. 2026"
                    value={inputIcaP}
                    onChange={(e) => setInputIcaP(e.target.value)}
                    className={styles.configInput}
                  />
                  <button
                    onClick={() =>
                      handleAddRestriccionAnual(
                        "restricciones_ica_palmira",
                        inputIcaP,
                        setInputIcaP,
                      )
                    }
                    className={styles.addBtn}
                  >
                    Agregar
                  </button>
                </div>
                <div className={styles.tagContainer}>
                  {config.restricciones_ica_palmira.length === 0 && (
                    <span className={styles.emptyTag}>Sin restricciones</span>
                  )}
                  {config.restricciones_ica_palmira.map((anio) => (
                    <div key={anio} className={styles.tag}>
                      <span>Año {anio}</span>
                      <button
                        onClick={() =>
                          handleRemoveRestriccionAnual(
                            "restricciones_ica_palmira",
                            anio,
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── ReteIVA (bimestral) — misma fila que las otras 3, NO fila completa ── */}
            <div className={styles.configBlock}>
              <div className={styles.blockHeader}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                <h4>Bloquear ReteIVA</h4>
              </div>
              <div className={styles.blockBody}>
                <div className={styles.inputRow}>
                  <input
                    type="number"
                    placeholder="Año"
                    value={inputAnioIva}
                    onChange={(e) => setInputAnioIva(e.target.value)}
                    className={styles.configInput}
                  />
                  <select
                    value={inputBimestreIva}
                    onChange={(e) => setInputBimestreIva(e.target.value)}
                    className={styles.configSelect}
                  >
                    <option value="1">Bimestre 1</option>
                    <option value="2">Bimestre 2</option>
                    <option value="3">Bimestre 3</option>
                    <option value="4">Bimestre 4</option>
                    <option value="5">Bimestre 5</option>
                    <option value="6">Bimestre 6</option>
                  </select>
                  <button
                    onClick={handleAddRestriccionIva}
                    className={styles.addBtn}
                  >
                    Agregar
                  </button>
                </div>
                <div className={styles.tagContainer}>
                  {config.restricciones_reteiva.length === 0 && (
                    <span className={styles.emptyTag}>Sin restricciones</span>
                  )}
                  {config.restricciones_reteiva.map((res, idx) => (
                    <div key={idx} className={styles.tag}>
                      <span>
                        {res.anio} - Bime {res.bimestre}
                      </span>
                      <button
                        onClick={() =>
                          handleRemoveRestriccionIva(res.anio, res.bimestre)
                        }
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlanosContables;
