import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faClock, faEdit } from "@fortawesome/free-solid-svg-icons";
import styles from "../Dashboard.module.css";

const WelcomeCard = ({ saludo, usuarioCompleto, ultimoAcceso }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.welcomeCard}>
      <div className={styles.welcomeContent}>
        <div className={styles.welcomeText}>
          <h2>
            {saludo},{" "}
            <span className={styles.userHighlight}>
              {usuarioCompleto.nombres_completos || "Usuario"}
            </span>
          </h2>
          <p className={styles.welcomeDescription}>
            Bienvenido al ecosistema de gestión empresarial integral.
          </p>
          <div className={styles.userBadges}>
            <span className={styles.userBadge}>
              <FontAwesomeIcon icon={faUser} />
              {usuarioCompleto.rol_descripcion ||
                usuarioCompleto.cargo ||
                "Usuario"}
            </span>
            <span className={styles.userBadge}>
              <FontAwesomeIcon icon={faClock} />
              Último acceso: {ultimoAcceso}
            </span>
          </div>
        </div>
        <button
          className={styles.profileButton}
          onClick={() => navigate("/perfil")}
        >
          <FontAwesomeIcon icon={faEdit} />
          Editar Perfil
        </button>
      </div>
    </div>
  );
};

export default WelcomeCard;
