import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore } from "@fortawesome/free-solid-svg-icons";
import styles from "../../B1/LectorPrecios.module.css";
import { SEDE_NOMBRE } from "../utils/constants";

const TopSedeBar = () => (
  <div className={styles.topSedeBar}>
    <FontAwesomeIcon icon={faStore} className={styles.topSedeIcon} />
    <span>{SEDE_NOMBRE}</span>
  </div>
);

export default TopSedeBar;
