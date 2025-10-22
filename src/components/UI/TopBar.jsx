import { useState, useEffect, useRef } from "react";
import styles from "./TopBar.module.css";
import { useAuth } from "../../contexts/AuthContext";
import { useEmpresa } from "../../contexts/EmpresaContext";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import logo from "../../assets/images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import "./fade.css";

export default function TopBar({ onLogout }) {
  const { user } = useAuth();
  const { empresa, setEmpresa } = useEmpresa();
  const [isMobile, setIsMobile] = useState(false);
  const nodeRef = useRef(null);

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
          <SwitchTransition>
            <CSSTransition
              key={empresa}
              nodeRef={nodeRef}
              timeout={200}
              classNames="fade"
            >
              <span ref={nodeRef} className={styles.appName}>
                {empresa === "abastecemos"
                  ? "Abastecemos de Occidente S.A.S"
                  : "Tobar Sanchez Vallejo S.A"}
              </span>
            </CSSTransition>
          </SwitchTransition>
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
          <div className={styles.avatar}>
            {user?.nombres_completos?.[0] || user?.login?.[0]}
          </div>
          <p className={styles.userInfo}>
            Bienvenid@, {user?.nombres_completos || user?.login || "Usuario"}
            {user?.correo && ` - ${user.correo}`}
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
