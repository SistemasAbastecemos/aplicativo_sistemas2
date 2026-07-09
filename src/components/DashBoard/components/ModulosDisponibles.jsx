import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import styles from "../Dashboard.module.css";
import FuncionCard from "./FuncionCard";

const ModulosDisponibles = ({
  funcionesAMostrar,
  menuLoading,
  searchTerm,
  onNavigate,
}) => (
  <section className={styles.infoCard}>
    <div className={styles.cardHeader}>
      <div className={styles.cardTitleSection}>
        <h3>Módulos de Aplicación</h3>
        <span className={styles.funcionesCount}>
          {funcionesAMostrar.length} disponibles
        </span>
      </div>
    </div>

    <div className={styles.cardContent}>
      {menuLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <span>Sincronizando módulos de acceso...</span>
        </div>
      ) : funcionesAMostrar.length === 0 ? (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>
            {searchTerm
              ? `No se encontraron coincidencias para "${searchTerm}"`
              : "No posees funciones asignadas a tu perfil."}
          </span>
        </div>
      ) : (
        <div className={styles.funcionesContainer}>
          <div className={styles.funcionesGrid}>
            {funcionesAMostrar.map((item) => (
              <FuncionCard
                key={item.id_menu}
                item={item}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  </section>
);

export default ModulosDisponibles;
