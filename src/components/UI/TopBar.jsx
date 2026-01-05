import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useEmpresa } from "../../contexts/EmpresaContext";
import logo from "../../assets/images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faUserCircle,
  faTimes,
  faAnglesLeft,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./TopBar.module.css";

const TopBar = ({ onLogout, onToggleSidebar, collapsed }) => {
  const { user } = useAuth();
  const { empresa } = useEmpresa();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const userProfileRef = useRef(null);

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

  // Cerrar menú al hacer click fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        userProfileRef.current &&
        !userProfileRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevenir scroll del body cuando el menú está abierto en móvil
      if (isMobile) {
        document.body.style.overflow = "hidden";
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [showUserMenu, isMobile]);

  const empresaNombre =
    empresa === "abastecemos"
      ? "Abastecemos de Occidente S.A.S"
      : "Tobar Sanchez Vallejo S.A";

  const saludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate("/perfil");
  };

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  const closeMenu = () => {
    setShowUserMenu(false);
  };

  return (
    <>
      <header className={styles.topBar}>
        {/* Seccion izquierda */}
        <div className={styles.leftSection}>
          {/* Botón collapse desktop */}
          <button className={styles.collapseBtn} onClick={onToggleSidebar}>
            <FontAwesomeIcon icon={collapsed ? faAnglesRight : faAnglesLeft} />
          </button>
          {/* logo */}
          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <img src={logo} alt="Logo" className={styles.logoImg} />
            </div>
            <div className={styles.companyInfo}>
              <h1 className={styles.companyName}>{empresaNombre}</h1>
              <p className={styles.greeting}>
                {saludo()},{" "}
                <span className={styles.userName}>
                  {user?.nombres_completos || "Usuario"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Seccion derecha */}
        <div className={styles.rightSection}>
          {/* Empresa Toggle - Deshabilitado */}
          <div className={`${styles.toggleContainer} ${styles.disabled}`}>
            <div
              className={`${styles.toggleSwitch} ${
                empresa === "tobar" ? styles.toggleActive : ""
              }`}
            >
              <span className={styles.toggleText}>
                {empresa === "abastecemos" ? "A" : "T"}
              </span>
            </div>
            <span className={styles.toggleLabel}>Empresa</span>
          </div>

          {/* Perfil del usuario */}
          <div
            ref={userProfileRef}
            className={styles.userProfile}
            onClick={handleUserMenuToggle}
          >
            <div className={styles.avatar}>
              <FontAwesomeIcon
                icon={faUserCircle}
                className={styles.avatarIcon}
              />
            </div>

            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {user?.nombres_completos || user?.login || "Usuario"}
              </span>
              <span className={styles.userRole}>
                @{user?.rol_descripcion || user?.login || "Usuario"}
              </span>
            </div>
          </div>

          {/* Boton de cerrar sesion (mobile) */}
          {isMobile && (
            <button className={styles.logoutButton} onClick={onLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          )}
        </div>
      </header>

      {/* Menu usuario desplegable - Versión móvil */}
      {showUserMenu && isMobile && (
        <div className={styles.mobileMenuOverlay}>
          <div ref={userMenuRef} className={styles.mobileMenuContent}>
            <div className={styles.mobileMenuHeader}>
              <div className={styles.menuHeader}>
                <div className={styles.menuAvatar}>
                  <FontAwesomeIcon icon={faUserCircle} />
                </div>
                <div className={styles.menuUserInfo}>
                  <span className={styles.menuUserName}>
                    {user?.nombres_completos || "Usuario"}
                  </span>
                  <span className={styles.menuUserEmail}>
                    {user?.correo || "usuario@empresa.com"}
                  </span>
                </div>
              </div>
              <button className={styles.closeMenuButton} onClick={closeMenu}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.menuDivider}></div>

            <button className={styles.menuItem} onClick={handleProfileClick}>
              <FontAwesomeIcon icon={faUserCircle} />
              Mi Perfil
            </button>

            <div className={styles.menuDivider}></div>

            <button
              className={`${styles.menuItem} ${styles.logoutItem}`}
              onClick={onLogout}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Menu usuario desplegable - Versión desktop */}
      {showUserMenu && !isMobile && (
        <div
          ref={userMenuRef}
          className={styles.userMenu}
          onMouseEnter={() => setShowUserMenu(true)}
          onMouseLeave={() => setShowUserMenu(false)}
        >
          <div className={styles.menuHeader}>
            <div className={styles.menuAvatar}>
              <FontAwesomeIcon icon={faUserCircle} />
            </div>
            <div className={styles.menuUserInfo}>
              <span className={styles.menuUserName}>
                {user?.nombres_completos || "Usuario"}
              </span>
              <span className={styles.menuUserEmail}>
                {user?.correo || "usuario@empresa.com"}
              </span>
            </div>
          </div>

          <div className={styles.menuDivider}></div>

          <button className={styles.menuItem} onClick={handleProfileClick}>
            <FontAwesomeIcon icon={faUserCircle} />
            Mi Perfil
          </button>

          <div className={styles.menuDivider}></div>

          <button
            className={`${styles.menuItem} ${styles.logoutItem}`}
            onClick={onLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Cerrar Sesión
          </button>
        </div>
      )}
    </>
  );
};

export default TopBar;
