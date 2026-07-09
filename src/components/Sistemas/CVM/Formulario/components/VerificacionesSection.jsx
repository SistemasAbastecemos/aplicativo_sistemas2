import React from "react";
import styles from "../CVM.module.css";
import VerificacionCard from "./VerificacionCard";
import { VERIFICACIONES } from "../utils/constants";

/**
 * Sección que agrupa las tres tarjetas de verificación. Itera sobre la
 * constante VERIFICACIONES para renderizar cada una, y le pasa el estado
 * y los handlers correspondientes desde el hook `useVerificaciones`.
 */
const VerificacionesSection = ({ verificaciones, onTomarFoto, onEstadoChange }) => (
  <section className={styles.verificacionesSection}>
    <div className={styles.sectionHeader}>
      <h2>Verificaciones de Estado</h2>
    </div>

    <div className={styles.verificacionesGrid}>
      {VERIFICACIONES.map((v) => (
        <VerificacionCard
          key={v.tipo}
          tipo={v.tipo}
          imagen={v.imagen}
          titulo={v.titulo}
          descripcion={v.descripcion}
          foto={verificaciones[v.tipo]?.file}
          urlFoto={verificaciones[v.tipo]?.url}
          estado={verificaciones[v.tipo]?.estado}
          onTomarFoto={onTomarFoto}
          onEstadoChange={onEstadoChange}
        />
      ))}
    </div>
  </section>
);

export default VerificacionesSection;
