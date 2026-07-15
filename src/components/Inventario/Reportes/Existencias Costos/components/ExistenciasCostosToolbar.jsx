import React, { useState, useRef, useEffect } from "react";
import styles from "../ExistenciasCostos.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faSearch,
  faStore,
  faFilter,
  faFont,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

const ExistenciasCostosToolbar = React.memo(
  ({
    lapsoCalendario,
    setLapsoCalendario,
    localSeleccionado,
    setLocalSeleccionado,
    onConsultar,
    searchTerm,
    setSearchTerm,
    abcFilter,
    setAbcFilter,
    hayDatos,
    localesConfig = [],
  }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cierra el menu flotante si se hace click fuera de el
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCheckboxChange = (codigoLocal) => {
      if (localSeleccionado.includes(codigoLocal)) {
        setLocalSeleccionado(
          localSeleccionado.filter((id) => id !== codigoLocal),
        );
      } else {
        setLocalSeleccionado([...localSeleccionado, codigoLocal]);
      }
    };

    const getDropdownLabel = () => {
      if (localSeleccionado.length === 0) {
        return "TODAS LAS BODEGAS PARAMETRIZADAS";
      }
      if (localSeleccionado.length === localesConfig.length) {
        return "TODAS LAS BODEGAS SELECCIONADAS";
      }
      return `${localSeleccionado.length} BODEGAS SELECCIONADAS`;
    };

    return (
      <div className={styles.tarjetaFiltros}>
        <form
          onSubmit={onConsultar}
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {/* Filtro de Periodo */}
          <div className={styles.controlFormulario}>
            <div className={styles.campoFlotante}>
              <input
                type="month"
                value={lapsoCalendario}
                onChange={(e) => setLapsoCalendario(e.target.value)}
                required
              />
              <label className={lapsoCalendario ? styles.labelColapsado : ""}>
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  style={{ marginRight: "6px" }}
                />{" "}
                Periodo de Analisis
              </label>
            </div>
          </div>

          {/* Selector Multiple de Sedes / Locales */}
          <div
            className={styles.controlFormulario}
            ref={dropdownRef}
            style={{ position: "relative" }}
          >
            {/* Contenedor del disparador flotante */}
            <div className={styles.campoFlotante}>
              <div
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  width: "100%",
                  height: "46px",
                  padding: "12px 35px 4px 12px",
                  fontSize: "0.85rem",
                  borderRadius: "8px",
                  border: "1px solid #d2d2d7",
                  backgroundColor: "#ffffff",
                  color: "#1d1d1f",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between", // Corregido: space-between para distribuir elementos
                  boxSizing: "border-box",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: "left",
                  }}
                >
                  {getDropdownLabel()}
                </span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  style={{
                    fontSize: "0.75rem",
                    color: "#86868b",
                    marginLeft: "8px",
                  }}
                />
              </div>
              <label className={styles.labelColapsado}>
                <FontAwesomeIcon
                  icon={faStore}
                  style={{ marginRight: "6px" }}
                />{" "}
                Sede / Local
              </label>
            </div>{" "}
            {/* Fin de campoFlotante */}
            {/* Menu Flotante Desplegable (Desplazado fuera de campoFlotante) */}
            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  top: "50px",
                  background: "#ffffff",
                  border: "1px solid #d2d2d7",
                  borderRadius: "8px",
                  zIndex: 110,
                  maxHeight: "260px",
                  overflowY: "auto",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                  padding: "6px 0",
                }}
              >
                <div
                  onClick={() => setLocalSeleccionado([])}
                  style={{
                    padding: "8px 12px",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    fontWeight: "600",
                    color: "#009b6d",
                    borderBottom: "1px solid #f5f5f7",
                    backgroundColor:
                      localSeleccionado.length === 0
                        ? "#f5f5f7"
                        : "transparent",
                  }}
                >
                  -- LIMPIAR SELECCION (TODAS) --
                </div>
                {localesConfig.map((loc) => {
                  const estaSeleccionado = localSeleccionado.includes(
                    loc.codigo_local,
                  );
                  return (
                    <label
                      key={loc.codigo_local}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        margin: 0,
                        cursor: "pointer",
                        fontSize: "0.82rem",
                        transition: "background 0.1s ease",
                        backgroundColor: estaSeleccionado
                          ? "#f2f9f6"
                          : "transparent",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f5f5f7")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = estaSeleccionado
                          ? "#f2f9f6"
                          : "transparent")
                      }
                    >
                      <input
                        type="checkbox"
                        checked={estaSeleccionado}
                        onChange={() => handleCheckboxChange(loc.codigo_local)}
                        style={{
                          accentColor: "#009b6d",
                          width: "14px",
                          height: "14px",
                          cursor: "pointer",
                        }}
                      />
                      <span
                        style={{
                          color: estaSeleccionado ? "#1d1d1f" : "#515154",
                          userSelect: "none", // Evita la seleccion de texto incomoda en doble click rapido
                        }}
                      >
                        {loc.descripcion} <strong>({loc.codigo_local})</strong>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          {/* Fin de controlFormulario */}

          <button type="submit" className={styles.btnBuscarDatos}>
            <FontAwesomeIcon icon={faSearch} /> Consultar
          </button>
        </form>

        {/* --- CONTROLES DE BUSQUEDA Y SEGMENTACION --- */}
        {hayDatos && (
          <div className={styles.subPanelFiltros}>
            <div className={styles.controlFormulario}>
              <div className={styles.campoFlotante}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por item, descripcion, proveedor..."
                />
                <label className={searchTerm ? styles.labelColapsado : ""}>
                  <FontAwesomeIcon
                    icon={faFont}
                    style={{ marginRight: "6px" }}
                  />{" "}
                  Busqueda Global
                </label>
              </div>
            </div>

            <div
              className={styles.controlFormulario}
              style={{ maxWidth: "220px" }}
            >
              <div className={styles.campoFlotante}>
                <select
                  value={abcFilter}
                  onChange={(e) => setAbcFilter(e.target.value)}
                >
                  <option value="">Todos los cuadrantes</option>
                  <option value="A">Clasificacion A (80% Rotacion)</option>
                  <option value="B">Clasificacion B (15% Rotacion)</option>
                  <option value="C">Clasificacion C (5% Rotacion)</option>
                </select>
                <label className={styles.labelColapsado}>
                  <FontAwesomeIcon
                    icon={faFilter}
                    style={{ marginRight: "6px" }}
                  />{" "}
                  Filtrar ABC
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

ExistenciasCostosToolbar.displayName = "ExistenciasCostosToolbar";
export default ExistenciasCostosToolbar;
