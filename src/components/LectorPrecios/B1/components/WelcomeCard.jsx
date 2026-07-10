import React from "react";
import styles from "../LectorPrecios.module.css";
import logo from "../../../../assets/images/logo.png";
import ScannerAnimation from "./ScannerAnimation";

/**
 * Pantalla inicial cuando no hay producto/error mostrándose. Dividida
 * en dos bloques horizontales:
 *  - Izquierdo: logo Belalcázar + mensaje de bienvenida
 *  - Derecho: animación del escáner (código de barras + rayo)
 */
const WelcomeCard = ({ escannerActivo }) => (
  <div className={styles.lectorPreciosCard}>
    <div className={styles.lectorPreciosLeftBlock}>
      <img
        src={logo}
        alt="Logo Belalcázar"
        className={styles.lectorPreciosLogo}
      />
      <div className={styles.welcomeMessage}>
        <h2>¡BIENVENIDO!</h2>
        <p>Consulte aquí el precio de sus productos de forma rápida y segura</p>
      </div>
    </div>

    <div className={styles.lectorPreciosRightBlock}>
      <ScannerAnimation activo={escannerActivo} />
    </div>
  </div>
);

export default WelcomeCard;
