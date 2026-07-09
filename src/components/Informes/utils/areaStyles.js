import {
  faChartLine,
  faStore,
  faWarehouse,
  faAppleAlt,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Informes.module.css";

export const getAreaClass = (areaNombre) => {
  const name = areaNombre?.toLowerCase() || "";
  if (name.includes("financiero")) return styles.areaFinanciero;
  if (name.includes("comercial")) return styles.areaComercial;
  if (name.includes("tobar")) return styles.areaTobar;
  if (name.includes("fruver")) return styles.areaFruver;
  return styles.areaDefault;
};

export const getAreaIcon = (areaNombre) => {
  const name = areaNombre?.toLowerCase() || "";
  if (name.includes("financiero")) return faChartLine;
  if (name.includes("comercial")) return faStore;
  if (name.includes("tobar")) return faWarehouse;
  if (name.includes("fruver")) return faAppleAlt;
  return faFileAlt;
};
