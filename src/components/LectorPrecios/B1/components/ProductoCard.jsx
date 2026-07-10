import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxes,
  faClock,
  faTags,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../LectorPrecios.module.css";
import logo from "../../../../assets/images/logo.png";
import descuentos from "../../../../assets/images/descuentos.png";
import { formatearDinero } from "../utils/formatters";

/**
 * Card de resultado exitoso: muestra el precio del producto en formato
 * grande + PUM (precio por unidad de medida) si aplica + countdown de
 * regreso. Dividida en dos bloques:
 *  - Izquierdo: logo + precio principal + PUM + timer
 *  - Derecho: banner publicitario + nombre/línea/códigos del producto
 */
const ProductoCard = ({ producto, tiempoRestante }) => (
  <div className={`${styles.lectorPreciosCard} ${styles.resultadoLayout}`}>
    <div className={styles.layoutBloquePrecioIzquierdo}>
      <img
        src={logo}
        alt="Logo Belalcázar"
        className={styles.resultadoLogoIzquierdo}
      />

      <div className={styles.premiumPriceContainer}>
        <span className={styles.premiumPriceLabel}>PRECIO DE VENTA</span>
        <div className={styles.priceValueWrapper}>
          <span className={styles.currencyMiniSymbol}>$</span>
          <span className={styles.priceMainNumbers}>
            {formatearDinero(producto.precio)}
          </span>
          <span className={styles.currencyRegionIso}>COP</span>
        </div>
        {producto.precio_unitario && (
          <div className={styles.pumBadge}>
            <FontAwesomeIcon icon={faBoxes} /> PUM: ${producto.precio_unitario}{" "}
            por {producto.venta_por || "Und"}
          </div>
        )}
      </div>

      <div className={styles.contadorEsperaBadge}>
        <FontAwesomeIcon icon={faClock} className={styles.iconClockPulse} />{" "}
        Regreso en: <strong>{tiempoRestante}s</strong>
      </div>
    </div>

    <div className={styles.layoutDetalleProductoDerecho}>
      <div className={styles.subBloquePautaHorizontal}>
        <img
          src={descuentos}
          alt="Pauta Publicitaria"
          className={styles.bannerPautaHorizontal}
        />
      </div>

      <div className={styles.subBloqueInfoProductoHorizontal}>
        <h1 className={styles.productoNombre}>{producto.descripcion}</h1>

        {producto.linea2 && (
          <div className={styles.lineaCategoria}>
            <FontAwesomeIcon icon={faTags} /> {producto.linea2.toUpperCase()}
          </div>
        )}

        <div className={styles.metaDataContainer}>
          <div className={styles.metaBadge}>
            <span className={styles.metaLabel}>Código:</span>
            <span className={styles.metaValue}>{producto.codigo_barras}</span>
          </div>
          <div className={styles.metaBadge}>
            <span className={styles.metaLabel}>Ítem:</span>
            <span className={styles.metaValue}>{producto.item}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProductoCard;
