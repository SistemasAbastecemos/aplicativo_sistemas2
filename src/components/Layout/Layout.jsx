import Sidebar from "../UI/Sidebar";
import TopBar from "../UI/TopBar";
import styles from "./Layout.module.css";
import { useAuth } from "../../contexts/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className={styles.layout}>
      {/* Barra superior */}
      <TopBar onLogout={logout} />

      {/* Contenedor principal */}
      <main className={styles.main}>
        <div className={styles.card}>
          <aside className={styles.sidebar}>
            <Sidebar />
          </aside>

          <section className={styles.content}>{children}</section>
        </div>
      </main>
    </div>
  );
}
