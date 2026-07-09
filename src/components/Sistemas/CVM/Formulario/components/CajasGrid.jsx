import React from "react";
import styles from "../CVM.module.css";
import imagenCaja from "../../../../../assets/images/caja.png";
import imagenAdvertencia from "../../../../../assets/images/advertencia.png";

/**
 * Grilla de cajas disponibles en la sede. La caja "todas" (sin novedad) se
 * ordena siempre primero. Click selecciona la caja y llama al orquestador
 * para cargar la balanza correspondiente.
 */
const CajasGrid = ({ cajas, cajaSeleccionada, onSelectCaja }) => {
  // Orden: "todas" primero, el resto en su orden natural
  const cajasOrdenadas = [...cajas].sort((a, b) =>
    a.id_caja === "todas" ? -1 : b.id_caja === "todas" ? 1 : 0,
  );

  return (
    <section className={styles.cajasSection}>
      <div className={styles.sectionHeader}>
        <h2>Seleccione la Caja a Supervisar</h2>
      </div>
      <div className={styles.cajasContainer}>
        <div className={styles.cajasGrid}>
          {cajasOrdenadas.map((caja) => {
            const esTodas = caja.id_caja === "todas";
            const isSelected = cajaSeleccionada?.id === caja.id;
            return (
              <div
                key={caja.id}
                className={`${styles.cajaCard} ${
                  isSelected ? styles.cajaSeleccionada : ""
                } ${esTodas ? styles.cajaTodas : ""}`}
                onClick={() => onSelectCaja(caja)}
              >
                <div className={styles.cajaIcon}>
                  <img
                    src={esTodas ? imagenAdvertencia : imagenCaja}
                    alt={esTodas ? "Todas las cajas" : `Caja ${caja.id_caja}`}
                  />
                </div>
                <div className={styles.cajaInfo}>
                  <h4>
                    {esTodas
                      ? "Todas sin Novedad"
                      : `Caja ${caja.id_caja.replace("caja", "")}`}
                  </h4>
                  <p>
                    {esTodas
                      ? "Reporte general sin novedades"
                      : "Verificar equipo de medición"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CajasGrid;
