import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useEmpresa } from "../../contexts/EmpresaContext";
import LoadingScreen from "../UI/LoadingScreen";
import styles from "./Dashboard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faEnvelope,
  faFileAlt,
  faShoppingCart,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
  FaAngleRight,
} from "react-icons/fa";

const Dashboard = () => {
  const { user } = useAuth();
  const { empresa, setEmpresa } = useEmpresa();
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

  if (!user) {
    return <LoadingScreen message="Cargando informacion del usuario..." />;
  }

  return (
    <div className={styles.dashboard}>
      {/* Bienvenida */}
      <div className={`${styles.card} ${styles.header} shadow-lg`}>
        <h1>
          {saludo()}, <span>{user.nombres_completos || "Usuario"}</span>
        </h1>

        <p className={styles.tituloBienvenida}>
          ¡Bienvenido al aplicativo de {empresaNombre}!
        </p>

        <div className={styles.cardResumen}>
          <h2>Información del usuario</h2>
          <ul>
            <li>
              <FontAwesomeIcon icon={faBuilding} /> <strong>Login:</strong>{" "}
              {user.login}
            </li>
            <li>
              <FontAwesomeIcon icon={faUser} /> <strong>Razón Social:</strong>{" "}
              {user.nombres_completos || "No registra"}
            </li>
            <li>
              <FontAwesomeIcon icon={faEnvelope} /> <strong>Correo:</strong>{" "}
              {user.correo || "No registra"}
            </li>
            <li>
              <FontAwesomeIcon icon={faBuilding} /> <strong>Area:</strong>{" "}
              {user.area || "No registra"}
            </li>
            <li>
              <FontAwesomeIcon icon={faBuilding} /> <strong>Cargo:</strong>{" "}
              {user.cargo || "No registra"}
            </li>
            <li>
              <strong>Estado:</strong>{" "}
              {user.proveedor?.estado !== "X" ? "Activo ✅" : "Inactivo ❌"}
            </li>
          </ul>
        </div>
      </div>

      {/* Funciones disponibles */}
      <div className={styles.seccion}>
        <h3 className={styles.tituloFunciones}>Funciones Disponibles</h3>
        <ul className={styles.funcionesList}>
          <li>
            <FaAngleRight className={styles.icono} />
            Modificar los datos de tu usuario
          </li>
          <li>
            <FaAngleRight className={styles.icono} />
            Realizar solicitudes de actualizacion de costos
          </li>
          <li>
            <FaAngleRight className={styles.icono} />
            Realizar solicitudes de codificación de productos
          </li>
          <li>
            <FaAngleRight className={styles.icono} />
            Generar Comprobantes
          </li>
          <li>
            <FaAngleRight className={styles.icono} />
            Generar Notas (NP, NI, CR y NG)
          </li>
          <li>
            <FaAngleRight className={styles.icono} />
            Generar Retenciones (Fuente, ICA, IVA)
          </li>
        </ul>
      </div>

      {/* Información adicional */}
      <div className={styles.seccion}>
        <p>
          Recuerda que puedes gestionar tus comprobantes y notas desde este
          portal, así como realizar consultas y emitir las retenciones
          correspondientes.
        </p>
        <p>
          Si tienes alguna pregunta o necesitas asistencia, no dudes en
          contactar a nuestro soporte.
        </p>
      </div>

      {/* Contacto */}
      <div className={styles.seccion}>
        <h3 className={styles.tituloFirma}>Contacto</h3>
        <ul className={styles.firmaList}>
          <li>
            <FaPhoneAlt className={styles.icono} />
            <span>669 5778 | Ext 132 - 109</span>
          </li>
          <li>
            <FaEnvelope className={styles.icono} />
            <a
              href="mailto:sistemas@supermercadobelalcazar.com.co"
              className={styles.enlace}
            >
              sistemas@supermercadobelalcazar.com.co
            </a>
          </li>
          <li>
            <FaGlobe className={styles.icono} />
            <a
              href="https://supermercadobelalcazar.com.co"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.enlace}
            >
              https://supermercadobelalcazar.com.co
            </a>
          </li>
          <li>
            <FaMapMarkerAlt className={styles.icono} />
            <span>
              Oficina Principal, Cra. 5 # 5-48, Yumbo, Valle del Cauca
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
