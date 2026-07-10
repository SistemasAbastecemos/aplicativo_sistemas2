import React from "react";
import styles from "../LectorPrecios.module.css";

/**
 * Banner inferior animado con mensajes rotatorios y partículas
 * flotantes decorativas. El mensaje activo y las partículas vienen
 * pre-calculados desde el hook `useBannerAnimacion`.
 *
 * Cada mensaje puede tener una variante de color en el badge
 * ('tips' | 'activo' | 'exclusivo') que mapea a una clase CSS.
 */
const BannerRotatorio = ({ mensajeActivo, particulas }) => {
  if (!mensajeActivo) return null;

  const badgeClases = [
    styles.badgeAnimado,
    mensajeActivo.variante === "activo" ? styles.badgeVerde : "",
    mensajeActivo.variante === "exclusivo" ? styles.badgeAmarillo : "",
  ]
    .filter(Boolean)
    .join(" ");

  const contenedorClases = [
    styles.itemAnimado,
    mensajeActivo.variante === "tips" ? styles.slideEfecto : "",
    mensajeActivo.variante === "activo" ? styles.pulseEfecto : "",
    mensajeActivo.variante === "exclusivo" ? styles.shimmerEfecto : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`${styles.bannerInferiorAnimado} ${styles.ambientGlowEffect}`}>
      {particulas.map((p) => (
        <span
          key={p.id}
          className={styles.particulaFlotante}
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      <div className={contenedorClases}>
        <span className={badgeClases}>{mensajeActivo.badge}</span>
        <p>{mensajeActivo.texto}</p>
      </div>
    </div>
  );
};

export default BannerRotatorio;
