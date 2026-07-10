import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBarcode } from "@fortawesome/free-solid-svg-icons";
import styles from "../../B1/LectorPrecios.module.css";

/**
 * Bloque visual del escáner: título + código de barras animado con
 * rayo laser rojo pulsante + instrucción. La animación activa se
 * controla via prop `activo` (aplica clase adicional).
 *
 * Las líneas del código de barras tienen anchos variados para verse
 * más realistas (algunas 6px, otras 4px, otras el default).
 */
const ScannerAnimation = ({ activo }) => (
  <div className={styles.scanPromptWrapper}>
    <h3 className={styles.lectorPreciosScanTitle}>
      PASE EL CÓDIGO POR EL ESCÁNER AQUÍ
    </h3>
    <div className={`${styles.scanAnimation} ${activo ? styles.activo : ""}`}>
      <div className={styles.barcodeIcon}>
        <div className={styles.barcodeLine}></div>
        <div className={styles.barcodeLine}></div>
        <div className={styles.barcodeLine}></div>
        <div className={styles.barcodeLine} style={{ width: "6px" }}></div>
        <div className={styles.barcodeLine}></div>
        <div className={styles.barcodeLine} style={{ width: "4px" }}></div>
        <div className={styles.barcodeLine}></div>
      </div>
      <div className={styles.scanLine}></div>
    </div>
    <p className={styles.instrucciones}>
      <FontAwesomeIcon icon={faBarcode} /> Alinee el código de barras frente al
      rayo láser rojo
    </p>
  </div>
);

export default ScannerAnimation;
