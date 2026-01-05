import Sidebar from "../UI/Sidebar";
import TopBar from "../UI/TopBar";
import styles from "./Layout.module.css";
import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  // Estado inicial que lee desde localStorage
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    return savedState !== null ? JSON.parse(savedState) : true; // default true si no hay valor guardado
  });

  // Estado para detectar si es móvil
  const [isMobile, setIsMobile] = useState(false);

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  // Efecto para detectar si es móvil y ajustar el estado de collapsed
  useEffect(() => {
    const checkMobile = () => {
      // Detectar por ancho de pantalla (generalmente <= 768px para móviles)
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // Si es móvil, forzar que la sidebar NO esté colapsada
      if (mobile && collapsed) {
        setCollapsed(false);
      }
    };

    // Verificar al cargar
    checkMobile();

    // Agregar listener para cambios de tamaño
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [collapsed]);

  // Efecto para guardar en localStorage cuando cambie el estado
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  return (
    <div className={styles.layout}>
      <TopBar
        onLogout={logout}
        onToggleSidebar={toggleCollapse}
        collapsed={collapsed}
        isMobile={isMobile}
      />

      <main className={styles.main}>
        <div className={styles.card}>
          {/* Sidebar con soporte para collapse */}
          <aside
            className={`${styles.sidebar} ${
              collapsed ? styles.sidebarCollapsed : ""
            } ${isMobile ? styles.mobileSidebar : ""}`}
          >
            {/* Pasar la prop collapsed y isMobile al Sidebar */}
            <Sidebar collapsed={collapsed} isMobile={isMobile} />
          </aside>

          {/* contenido ajustado */}
          <section
            className={`${styles.content} ${
              collapsed ? styles.contentCollapsed : ""
            } ${isMobile ? styles.mobileContent : ""}`}
          >
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}
