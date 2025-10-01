import React from "react";
import styles from "./Dashboard.module.css";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
  FaAngleRight,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const isTobarSanchez = user?.nit === "123456789" || "";
  const empresaNombre = isTobarSanchez
    ? "Tobar Sanchez Valencia y Vallejo S.A."
    : "Abastecemos de Occidente S.A.S.";

  return (
    <div className={styles.dashboard}>
      {/* Bienvenida */}
      <div className={`${styles.card} shadow-lg`}>
        <h1 className={styles.tituloBienvenida}>
          ¡Bienvenido al portal de proveedores de {empresaNombre}!
        </h1>
        <p className={styles.nitText}>Tu NIT es: {user?.nit}</p>
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
            Realizar solicitudes de codificación de productos
          </li>
          <li>
            <FaAngleRight className={styles.icono} />
            Generar Comprobantes
          </li>
          <li>
            <FaAngleRight className={styles.icono} />
            Generar Notas
          </li>
          <li>
            <FaAngleRight className={styles.icono} />
            Generar Notas de NI
          </li>
          <li>
            <FaAngleRight className={styles.icono} />
            Generar Notas de CR
          </li>
          <li>
            <FaAngleRight className={styles.icono} />
            Generar Notas de NG
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
