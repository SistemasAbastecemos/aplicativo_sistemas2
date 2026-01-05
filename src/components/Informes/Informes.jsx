import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faArrowLeft,
  faChartLine,
  faStore,
  faWarehouse,
  faAppleAlt,
  faSearch,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Informes.module.css";
import Vista from "./Vista";
import { informesConfig } from "./informesConfig";
import { useNotification } from "../../contexts/NotificationContext";
import { useAuth } from "../../contexts/AuthContext";

function Informes() {
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const { addNotification } = useNotification();
  const { user } = useAuth();
  const areaUsuario = user?.area_nombre;

  const areas = useMemo(() => {
    const uniqueAreas = [
      ...new Set(informesConfig.map((informe) => informe.area)),
    ];
    return uniqueAreas;
  }, []);

  const getAreaIcon = (area) => {
    const icons = {
      Financiero: faChartLine,
      Comercial: faStore,
      Tobar: faWarehouse,
      Fruver: faAppleAlt,
    };
    return icons[area] || faFileAlt;
  };

  const filteredInformes = useMemo(() => {
    return informesConfig.filter((informe) => {
      const matchesSearch =
        informe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        informe.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesArea =
        selectedArea === "all" || informe.area === selectedArea;
      return matchesSearch && matchesArea;
    });
  }, [searchTerm, selectedArea]);

  const handleCardClick = (informe) => {
    if (!informe.areaPermitida.includes(areaUsuario)) {
      addNotification(
        "warning",
        `No tienes permisos para visualizar el informe "${informe.title}".`
      );
      return;
    }
    setSelectedCard(informe);
  };

  const handleBack = () => setSelectedCard(null);

  if (selectedCard) {
    return (
      <div className={styles.informeView}>
        <div className={styles.viewHeader}>
          <button className={styles.backButton} onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Volver a informes</span>
          </button>
          <div className={styles.viewTitle}>
            <FontAwesomeIcon
              icon={getAreaIcon(selectedCard.area)}
              className={styles.areaIcon}
            />
            <h1>{selectedCard.title}</h1>
            <span
              className={styles.areaBadge}
              style={{ backgroundColor: selectedCard.color }}
            >
              {selectedCard.area}
            </span>
          </div>
        </div>
        <div className={styles.vistaContainer}>
          <Vista informe={selectedCard.id} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Informes Corporativos</h1>
          <p className={styles.subtitle}>
            Accede a los dashboards y reportes empresariales en tiempo real
          </p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar informes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterContainer}>
          <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className={styles.areaSelect}
          >
            <option value="all">Todas las áreas</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.statsBar}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{filteredInformes.length}</span>
            <span className={styles.statLabel}>Informes disponibles</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {
                filteredInformes.filter((informe) =>
                  informe.areaPermitida.includes(areaUsuario)
                ).length
              }
            </span>
            <span className={styles.statLabel}>Con acceso</span>
          </div>
        </div>

        <div className={styles.grid}>
          {filteredInformes.map((informe) => {
            const disabled = !informe.areaPermitida.includes(areaUsuario);
            return (
              <div
                key={informe.id}
                className={`${styles.card} ${disabled ? styles.disabled : ""}`}
                onClick={() => !disabled && handleCardClick(informe)}
              >
                <div
                  className={styles.cardHeader}
                  style={{ backgroundColor: informe.color }}
                >
                  <div className={styles.cardIcon}>
                    <FontAwesomeIcon icon={getAreaIcon(informe.area)} />
                  </div>
                  <div className={styles.cardBadge}>{informe.area}</div>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{informe.title}</h3>
                  <p className={styles.cardText}>{informe.description}</p>

                  <div className={styles.cardFooter}>
                    <div className={styles.accessInfo}>
                      {disabled ? (
                        <span className={styles.noAccess}>Sin acceso</span>
                      ) : (
                        <span className={styles.hasAccess}>Disponible</span>
                      )}
                    </div>
                    <div className={styles.cardAction}>
                      <span className={styles.actionText}>
                        {disabled ? "Sin permisos" : "Ver informe"}
                      </span>
                    </div>
                  </div>
                </div>

                {!disabled && (
                  <div
                    className={styles.cardHover}
                    style={{ backgroundColor: informe.color }}
                  ></div>
                )}
              </div>
            );
          })}
        </div>

        {filteredInformes.length === 0 && (
          <div className={styles.noResults}>
            <FontAwesomeIcon icon={faSearch} size="3x" />
            <h3>No se encontraron informes</h3>
            <p>Intenta con otros términos de búsqueda o filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Informes;
