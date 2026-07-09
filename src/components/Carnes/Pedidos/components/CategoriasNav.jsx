import React from "react";
import styles from "../FormularioPedidos.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCow,
  faPiggyBank,
  faHeart,
  faStore,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";

const CategoriasNav = React.memo(({ activa, onCambiar, totales }) => {
  // Configuracion de las categorias mapeadas al catalogo de la base de datos
  const listadoCategorias = [
    {
      id: "RES",
      label: "Res",
      icon: faCow,
      kg: totales.totalResKG,
      und: totales.totalResUND,
      claseColor: styles.cardRes,
    },
    {
      id: "CERDO",
      label: "Cerdo",
      icon: faPiggyBank,
      kg: totales.totalCerdoKG,
      und: totales.totalCerdoUND,
      claseColor: styles.cardCerdo,
    },
    {
      id: "VISCERAS DE RES",
      label: "Vísceras",
      icon: faHeart,
      kg: totales.totalViscerasKG,
      und: totales.totalViscerasUND,
      claseColor: styles.cardVisceras,
    },
    {
      id: "CANALES",
      label: "Canales",
      icon: faStore,
      kg: totales.totalCanalesKG,
      und: totales.totalCanalesUND,
      claseColor: styles.cardCanales,
    },
  ];

  return (
    <div className={styles.galleryContainerCanvas}>
      <div className={styles.galleryHeaderTitle}>
        <h3>Categorías de Productos</h3>
      </div>

      <div className={styles.appleHorizontalGallery}>
        {listadoCategorias.map((cat) => {
          const isSelected = cat.id === activa;
          const muestraUnidades = parseInt(cat.und || 0) > 0;

          return (
            <button
              key={cat.id}
              type="button"
              className={`${styles.bentoCategoryCard} ${cat.claseColor} ${isSelected ? styles.bentoCardActive : ""}`}
              onClick={() => onCambiar(cat.id)}
            >
              <div className={styles.bentoCardHeaderFlex}>
                <div className={styles.bentoIconFrame}>
                  <FontAwesomeIcon icon={cat.icon} />
                </div>
                <span className={styles.bentoCardLabelText}>{cat.label}</span>
              </div>

              <div className={styles.bentoCardMetricsRow}>
                <div className={styles.metricColumnValue}>
                  <span className={styles.metricNumberValue}>{cat.kg}</span>
                  <span className={styles.metricUnitIndicator}>KG</span>
                </div>
                {muestraUnidades && (
                  <div className={styles.metricColumnValue}>
                    <span className={styles.metricNumberValue}>{cat.und}</span>
                    <span className={styles.metricUnitIndicator}>UND</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {/* Tarjeta estática de resumen global al cierre de la galería */}
        <div
          className={`${styles.bentoCategoryCard} ${styles.cardTotalGeneralGlobal}`}
        >
          <div className={styles.bentoCardHeaderFlex}>
            <div className={styles.bentoIconFrame}>
              <FontAwesomeIcon icon={faChartBar} />
            </div>
            <span className={styles.bentoCardLabelText}>Consolidado</span>
          </div>

          <div className={styles.bentoCardMetricsRow}>
            <div className={styles.metricColumnValue}>
              <span className={styles.metricNumberValue}>
                {totales.totalGeneralKG}
              </span>
              <span className={styles.metricUnitIndicator}>KG TOTAL</span>
            </div>
            {parseInt(totales.totalGeneralUND || 0) > 0 && (
              <div className={styles.metricColumnValue}>
                <span className={styles.metricNumberValue}>
                  {totales.totalGeneralUND}
                </span>
                <span className={styles.metricUnitIndicator}>UND TOTAL</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

CategoriasNav.displayName = "CategoriasNav";
export default CategoriasNav;
