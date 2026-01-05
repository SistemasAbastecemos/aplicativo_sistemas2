import React from "react";
import styles from "./Tooltip.module.css";

const Tooltip = ({ text, children, position = "right" }) => {
  return (
    <div className={styles.tooltipContainer}>
      {children}
      <div className={`${styles.tooltip} ${styles[position]}`}>{text}</div>
    </div>
  );
};

export default Tooltip;
