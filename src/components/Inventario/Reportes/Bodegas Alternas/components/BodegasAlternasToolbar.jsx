import React from "react";
import styles from "../BodegasAlternas.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faSearch } from "@fortawesome/free-solid-svg-icons";

const BodegasAlternasToolbar = React.memo(
  ({ lapsoCalendario, setLapsoCalendario, onConsultar }) => {
    // Evaluamos si el campo de mes tiene datos para fijar el label arriba
    const tieneValor = !!lapsoCalendario;

    return (
      <div className={styles.tarjetaFiltros}>
        <form
          onSubmit={onConsultar}
          style={{ display: "flex", gap: "20px", alignItems: "flex-end" }}
        >
          <div className={styles.controlFormulario}>
            <div className={styles.campoFlotante}>
              <input
                type="month"
                value={lapsoCalendario}
                onChange={(e) => setLapsoCalendario(e.target.value)}
                required
                style={{ width: "100%", boxSizing: "border-box" }}
              />
              <label className={tieneValor ? styles.labelColapsado : ""}>
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  style={{ marginRight: "4px" }}
                />{" "}
                Periodo Contable
              </label>
            </div>
          </div>
          <button type="submit" className={styles.btnBuscarDatos}>
            <FontAwesomeIcon icon={faSearch} /> Consultar
          </button>
        </form>
      </div>
    );
  },
);

BodegasAlternasToolbar.displayName = "BodegasAlternasToolbar";
export default BodegasAlternasToolbar;
