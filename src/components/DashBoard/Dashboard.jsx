import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useEmpresa } from "../../contexts/EmpresaContext";
import { useDynamicMenu } from "../../hooks/useDynamicMenu";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../UI/LoadingScreen";
import styles from "./Dashboard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faEnvelope,
  faFileAlt,
  faShoppingCart,
  faUser,
  faCog,
  faChartBar,
  faBox,
  faUsers,
  faBell,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
  FaAngleRight,
  FaPlus,
} from "react-icons/fa";

const Dashboard = () => {
  const { user } = useAuth();
  const { empresa, setEmpresa } = useEmpresa();
  const { menu, userInfo, loading: menuLoading, tienePermiso, error } = useDynamicMenu();
  const navigate = useNavigate();
  
  const [userInfoExpanded, setUserInfoExpanded] = useState(false);

  const empresaNombre =
    empresa === "abastecemos"
      ? "Abastecemos de Occidente S.A.S"
      : "Tobar Sanchez Vallejo S.A";

  // ✅ Combinar información de user (AuthContext) y userInfo (useDynamicMenu)
  const usuarioCompleto = {
    ...user,
    ...userInfo, // Esto sobrescribirá los datos de user con userInfo si existen
  };

  const saludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  // Funciones para las acciones rápidas
  const handleNuevaSolicitud = () => {
    navigate("/solicitudes/nueva");
  };

  const handleCrearUsuario = () => {
    navigate("/usuarios/crear");
  };

  const handleVerReportes = () => {
    navigate("/reportes");
  };

  const handleEditarPerfil = () => {
    navigate("/perfil");
  };

  const toggleUserInfo = () => {
    setUserInfoExpanded(!userInfoExpanded);
  };

  if (!user) {
    return <LoadingScreen message="Cargando información del usuario..." />;
  }

  // ✅ CORREGIDO: Asegurar que menu es array antes de usar filter
  const funcionesDisponibles = Array.isArray(menu) 
    ? menu.filter(item => item.permisos && Object.values(item.permisos).some(permiso => permiso))
    : [];

  // ✅ Mostrar error si hay problema cargando el menú
  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={`${styles.card} ${styles.errorCard}`}>
          <h2>Error cargando el menú</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header de Bienvenida */}
      <div className={`${styles.card} ${styles.header} ${styles.gradientHeader}`}>
        <div className={styles.welcomeSection}>
          <h1>
            {saludo()}, <span className={styles.userName}>{usuarioCompleto.nombres_completos || "Usuario"}</span>
          </h1>
          <p className={styles.welcomeSubtitle}>
            ¡Bienvenido al sistema de {empresaNombre}!
          </p>
          <div className={styles.userBadge}>
            <FontAwesomeIcon icon={faUser} />
            <span>{usuarioCompleto.rol_nombre || usuarioCompleto.cargo || "Usuario"}</span>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Información del Usuario - Card Expandible */}
        <div className={`${styles.card} ${userInfoExpanded ? styles.expanded : ''}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <FontAwesomeIcon icon={faUser} /> Información del Usuario
            </h2>
            <button 
              className={styles.expandButton}
              onClick={toggleUserInfo}
              title={userInfoExpanded ? "Contraer" : "Expandir"}
            >
              <FontAwesomeIcon 
                icon={userInfoExpanded ? faEdit : faEdit} 
                className={styles.expandIcon}
              />
            </button>
          </div>
          
          <div className={`${styles.userInfoGrid} ${userInfoExpanded ? styles.expandedGrid : ''}`}>
            <div className={styles.infoItem}>
              <strong>Usuario:</strong>
              <span>{usuarioCompleto.login}</span>
            </div>
            <div className={styles.infoItem}>
              <strong>Nombre Completo:</strong>
              <span>{usuarioCompleto.nombres_completos || "No registra"}</span>
            </div>
            <div className={styles.infoItem}>
              <strong>Correo Electrónico:</strong>
              <span>{usuarioCompleto.correo || "No registra"}</span>
            </div>
            <div className={styles.infoItem}>
              <strong>Área/Departamento:</strong>
              <span>{usuarioCompleto.area_nombre || usuarioCompleto.area || "No registra"}</span>
            </div>
            <div className={styles.infoItem}>
              <strong>Cargo:</strong>
              <span>{usuarioCompleto.cargo_nombre || usuarioCompleto.cargo || "No registra"}</span>
            </div>
            <div className={styles.infoItem}>
              <strong>Rol:</strong>
              <span>{usuarioCompleto.rol_nombre || usuarioCompleto.rol || "No registra"}</span>
            </div>
            <div className={styles.infoItem}>
              <strong>Estado:</strong>
              <span className={styles.statusActive}>
                Activo ✅
              </span>
            </div>
            
            {/* Información adicional que se muestra cuando está expandido */}
            {userInfoExpanded && (
              <>
                {usuarioCompleto.telefono && (
                  <div className={styles.infoItem}>
                    <strong>Teléfono:</strong>
                    <span>{usuarioCompleto.telefono}</span>
                  </div>
                )}
                {usuarioCompleto.direccion && (
                  <div className={styles.infoItem}>
                    <strong>Dirección:</strong>
                    <span>{usuarioCompleto.direccion}</span>
                  </div>
                )}
                {usuarioCompleto.fecha_creacion && (
                  <div className={styles.infoItem}>
                    <strong>Fecha de Registro:</strong>
                    <span>{new Date(usuarioCompleto.fecha_creacion).toLocaleDateString()}</span>
                  </div>
                )}
                {usuarioCompleto.ultimo_acceso && (
                  <div className={styles.infoItem}>
                    <strong>Último Acceso:</strong>
                    <span>{new Date(usuarioCompleto.ultimo_acceso).toLocaleString()}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Funciones Disponibles Dinámicas */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <FontAwesomeIcon icon={faCog} /> Funciones Disponibles
          </h2>
          {menuLoading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              Cargando funciones...
            </div>
          ) : funcionesDisponibles.length === 0 ? (
            <div className={styles.emptyState}>
              No hay funciones disponibles o no se pudieron cargar.
            </div>
          ) : (
            <ul className={styles.funcionesList}>
              {funcionesDisponibles.map((item) => (
                <li key={item.id_menu} className={styles.funcionItem}>
                  <div className={styles.funcionMain}>
                    <FaAngleRight className={styles.icono} />
                    <span className={styles.funcionNombre}>{item.nombre}</span>
                  </div>
                  <div className={styles.permisosBadge}>
                    {item.permisos.crear && <span className={styles.badgeCreate}>Crear</span>}
                    {item.permisos.editar && <span className={styles.badgeEdit}>Editar</span>}
                    {item.permisos.eliminar && <span className={styles.badgeDelete}>Eliminar</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Acciones Rápidas FUNCIONALES */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <FontAwesomeIcon icon={faShoppingCart} /> Acciones Rápidas
          </h2>
          <div className={styles.accionesGrid}>
            {tienePermiso(3, 'crear') && (
              <button 
                className={`${styles.botonAccion} ${styles.accionPrimary}`}
                onClick={handleNuevaSolicitud}
              >
                <FaPlus className={styles.accionIcon} />
                <span>Nueva Solicitud</span>
                <small>Gestión de solicitudes</small>
              </button>
            )}
            {tienePermiso(2, 'crear') && (
              <button 
                className={`${styles.botonAccion} ${styles.accionSuccess}`}
                onClick={handleCrearUsuario}
              >
                <FaPlus className={styles.accionIcon} />
                <span>Crear Usuario</span>
                <small>Administración</small>
              </button>
            )}
            {tienePermiso(4, 'ver') && (
              <button 
                className={`${styles.botonAccion} ${styles.accionWarning}`}
                onClick={handleVerReportes}
              >
                <FontAwesomeIcon icon={faChartBar} className={styles.accionIcon} />
                <span>Ver Reportes</span>
                <small>Análisis y datos</small>
              </button>
            )}
            {tienePermiso(1, 'editar') && (
              <button 
                className={`${styles.botonAccion} ${styles.accionInfo}`}
                onClick={handleEditarPerfil}
              >
                <FontAwesomeIcon icon={faUser} className={styles.accionIcon} />
                <span>Editar Perfil</span>
                <small>Configuración</small>
              </button>
            )}
            
            {/* Acciones básicas que siempre están disponibles */}
            <button 
              className={`${styles.botonAccion} ${styles.accionSecondary}`}
              onClick={() => navigate('/solicitudes')}
            >
              <FontAwesomeIcon icon={faFileAlt} className={styles.accionIcon} />
              <span>Mis Solicitudes</span>
              <small>Ver historial</small>
            </button>
            <button 
              className={`${styles.botonAccion} ${styles.accionTertiary}`}
              onClick={() => navigate('/ayuda')}
            >
              <FontAwesomeIcon icon={faBell} className={styles.accionIcon} />
              <span>Ayuda</span>
              <small>Soporte</small>
            </button>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <FontAwesomeIcon icon={faUsers} /> Soporte y Contacto
          </h2>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <FaPhoneAlt className={styles.contactIcon} />
              <div>
                <strong>Teléfono:</strong>
                <span>669 5778 | Ext 132 - 109</span>
              </div>
            </div>
            <div className={styles.contactItem}>
              <FaEnvelope className={styles.contactIcon} />
              <div>
                <strong>Email:</strong>
                <a
                  href="mailto:sistemas@supermercadobelalcazar.com.co"
                  className={styles.enlace}
                >
                  sistemas@supermercadobelalcazar.com.co
                </a>
              </div>
            </div>
            <div className={styles.contactItem}>
              <FaGlobe className={styles.contactIcon} />
              <div>
                <strong>Sitio Web:</strong>
                <a
                  href="https://supermercadobelalcazar.com.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.enlace}
                >
                  supermercadobelalcazar.com.co
                </a>
              </div>
            </div>
            <div className={styles.contactItem}>
              <FaMapMarkerAlt className={styles.contactIcon} />
              <div>
                <strong>Dirección:</strong>
                <span>Cra. 5 # 5-48, Yumbo, Valle del Cauca</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje Informativo */}
      <div className={`${styles.card} ${styles.infoCard}`}>
        <div className={styles.infoContent}>
          <FontAwesomeIcon icon={faBell} className={styles.infoIcon} />
          <div>
            <h3>¿Necesitas ayuda?</h3>
            <p>
              Recuerda que puedes gestionar tus comprobantes, notas y realizar consultas 
              directamente desde este portal. Si tienes alguna pregunta o necesitas asistencia, 
              no dudes en contactar a nuestro equipo de soporte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;