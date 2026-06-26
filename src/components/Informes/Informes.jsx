import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faChartLine,
  faStore,
  faWarehouse,
  faAppleAlt,
  faFileAlt,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Informes.module.css";
import Vista from "./Vista";
import { apiService } from "../../services/api";
import { useNotification } from "../../contexts/NotificationContext";
import { useAuth } from "../../contexts/AuthContext";

function Informes() {
  const [informes, setInformes] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const { addNotification } = useNotification();
  const { user } = useAuth();

  const idAreaUser = Number(user?.id_area);
  const idCargoUser = Number(user?.id_cargo);
  const esAdministrador = user?.id_rol === 1;

  useEffect(() => {
    const fetchInformes = async () => {
      try {
        const res = await apiService.getInformes();
        setInformes(res.data || []);
      } catch (error) {
        addNotification({
          message: "No fue posible procesar la informacion",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInformes();
  }, []);

  const areasUnicas = useMemo(() => {
    return [...new Set(informes.map((inf) => inf.area_nombre))];
  }, [informes]);

  const verificarAcceso = (informe) => {
    if (esAdministrador) return true;
    const permisoPorArea = informe.permisos.areas.includes(idAreaUser);
    const permisoPorCargo = informe.permisos.cargos.includes(idCargoUser);
    return permisoPorArea || permisoPorCargo;
  };

  const informesDisponibles = useMemo(() => {
    return informes.filter((inf) => {
      // Los usuarios normales no ven los inactivos. Los administradores si los ven (pero no podran abrirlos).
      if (Number(inf.activo) === 0 && !esAdministrador) return false;

      // Valida permisos cruzados
      if (!verificarAcceso(inf) && !esAdministrador) return false;

      const matchesSearch = inf.titulo
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesArea =
        selectedArea === "all" || inf.area_nombre === selectedArea;
      return matchesSearch && matchesArea;
    });
  }, [
    informes,
    searchTerm,
    selectedArea,
    idAreaUser,
    idCargoUser,
    esAdministrador,
  ]);

  const getAreaIcon = (areaNombre) => {
    const name = areaNombre?.toLowerCase() || "";
    if (name.includes("financiero")) return faChartLine;
    if (name.includes("comercial")) return faStore;
    if (name.includes("tobar")) return faWarehouse;
    if (name.includes("fruver")) return faAppleAlt;
    return faFileAlt;
  };

  const handleCardClick = (informe) => {
    // Validacion restrictiva: Si el estado es inactivo, se bloquea el acceso independientemente del rol.
    if (Number(informe.activo) === 0) {
      addNotification({
        message: "El informe se encuentra inactivo y no permite visualizacion.",
        type: "warning",
      });
      return;
    }

    setSelectedCard(informe);
  };

  if (selectedCard) {
    return (
      <Vista
        url={selectedCard.url}
        titulo={selectedCard.titulo}
        area={selectedCard.area_nombre}
        color={selectedCard.color}
        onBack={() => setSelectedCard(null)}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Inteligencia de Negocios</h1>
          <p className={styles.subtitle}>
            Analitica y metricas organizacionales centralizadas
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.controlBar}>
          <div className={styles.searchGroup}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Filtro analitico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className={styles.areaSelect}
            >
              <option value="all">Filtro departamental general</option>
              {areasUnicas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.kpiGroup}>
            <div className={styles.kpiBadge}>
              <span>Modulos asignados:</span>{" "}
              <strong>{informesDisponibles.length}</strong>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loadingState}>
            Sincronizando con repositorio origen...
          </div>
        ) : (
          <div className={styles.grid}>
            {informesDisponibles.map((informe) => {
              const isInactivo = Number(informe.activo) === 0;

              return (
                <div
                  key={informe.id}
                  className={`${styles.card} ${isInactivo ? styles.disabled : ""}`}
                  onClick={() => handleCardClick(informe)}
                >
                  <div
                    className={styles.cardHeader}
                    style={{
                      backgroundColor: isInactivo ? "#94a3b8" : informe.color,
                    }}
                  >
                    <div className={styles.cardIcon}>
                      <FontAwesomeIcon
                        icon={
                          isInactivo ? faBan : getAreaIcon(informe.area_nombre)
                        }
                      />
                    </div>
                    <div className={styles.cardBadge}>
                      {isInactivo ? "Suspendido" : informe.area_nombre}
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{informe.titulo}</h3>
                    <p className={styles.cardText}>{informe.descripcion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Informes;
