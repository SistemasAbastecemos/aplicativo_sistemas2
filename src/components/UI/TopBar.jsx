import styles from "./TopBar.module.css";
import logo from "../../assets/images/logo.png";
import { useAuth } from "../../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useEmpresa } from "../../contexts/EmpresaContext"; // 👈 importa contexto

export default function TopBar({ onLogout }) {
  const { user } = useAuth();
  const { empresa, setEmpresa } = useEmpresa(); // 👈 empresa actual
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const toggleEmpresa = () => {
    setEmpresa(empresa === "abastecemos" ? "tobar" : "abastecemos");
  };

  return (
    <header className={styles.topBar}>
      <div className={styles.left}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <p>
          <span className={styles.appName}>
            {empresa === "abastecemos"
              ? "Abastecemos de Occidente S.A.S"
              : "Tobar Sanchez Vallejo S.A"}
          </span>
        </p>
      </div>

      <div className={styles.right}>
        {/* Toggle Empresa */}
        <div className={styles.toggleContainer} onClick={toggleEmpresa}>
          <div
            className={`${styles.toggleSwitch} ${
              empresa === "tobar" ? styles.active : ""
            }`}
          >
            <span>{empresa === "abastecemos" ? "A" : "T"}</span>
          </div>
        </div>

        <div className={styles.userProfile}>
          <div className={styles.avatar}>{user?.nit?.[0] || "U"}</div>
          <p className={styles.userInfo}>
            Bienvenid@, {user?.nit} {user?.email && ` - ${user.email}`}
          </p>
        </div>
        <button onClick={onLogout} className={styles.logoutBtn}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          {isMobile ? "Salir" : "Cerrar sesión"}
        </button>
      </div>
    </header>
  );
}
