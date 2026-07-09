import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faSpinner } from "@fortawesome/free-solid-svg-icons";
import styles from "../PlanosContables.module.css";
import ToggleCargaBlock from "./ToggleCargaBlock";
import RestriccionAnualBlock from "./RestriccionAnualBlock";
import RestriccionIvaBlock from "./RestriccionIvaBlock";
import { BLOQUES_ANUALES } from "../utils/constants";

/**
 * Tab "Políticas y Restricciones". Layout de 3 columnas con:
 *  - Toggle admin fila completa (opcional, solo si isAdmin)
 *  - 3 bloques anuales (retefuente, ICA Yumbo, ICA Palmira)
 *  - 1 bloque bimestral (ReteIVA)
 *
 * El botón "Aplicar Cambios" persiste toda la configuración de una sola
 * vez. Los cambios locales no se envían al backend hasta este momento.
 */
const ConfiguracionTab = ({
  config,
  isAdmin,
  guardando,
  onToggleCarga,
  onSaveConfig,
  restricciones,
}) => (
  <div className={styles.configContainer}>
    <div className={styles.configHeader}>
      <div className={styles.configIntro}>
        <h3>Parámetros Globales del Sistema</h3>
        <p>
          Las restricciones aplican individualmente para el aplicativo externo
          de proveedores.
        </p>
      </div>
      <button
        className={styles.saveConfigBtn}
        onClick={onSaveConfig}
        disabled={guardando}
        type="button"
      >
        <FontAwesomeIcon
          icon={guardando ? faSpinner : faSave}
          spin={guardando}
        />
        {guardando ? "Guardando..." : "Aplicar Cambios"}
      </button>
    </div>

    <div className={styles.configLayout}>
      {isAdmin && (
        <ToggleCargaBlock
          habilitada={config.carga_habilitada}
          onToggle={onToggleCarga}
        />
      )}

      {BLOQUES_ANUALES.map((bloque) => (
        <RestriccionAnualBlock
          key={bloque.key}
          titulo={bloque.titulo}
          keyState={bloque.key}
          anios={config[bloque.key] || []}
          onAdd={restricciones.addRestriccionAnual}
          onRemove={restricciones.removeRestriccionAnual}
        />
      ))}

      <RestriccionIvaBlock
        restricciones={config.restricciones_reteiva}
        onAdd={restricciones.addRestriccionIva}
        onRemove={restricciones.removeRestriccionIva}
      />
    </div>
  </div>
);

export default ConfiguracionTab;
