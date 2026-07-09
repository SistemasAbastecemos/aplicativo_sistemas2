import React, { useState } from "react";
import styles from "./Informes.module.css";
import LoadingScreen from "../UI/LoadingScreen";
import { useNotification } from "../../contexts/NotificationContext";
import { useAuth } from "../../contexts/AuthContext";

import { useInformesData } from "./hooks/useInformesData";
import { useInformesFilter } from "./hooks/useInformesFilter";

import InformesHeader from "./components/InformesHeader";
import InformesToolbar from "./components/InformesToolbar";
import InformesGrid from "./components/InformesGrid";
import Vista from "./components/Vista";

import { getAreaClass } from "./utils/areaStyles";

function Informes() {
  const [selectedCard, setSelectedCard] = useState(null);
  const { addNotification } = useNotification();
  const { user } = useAuth();

  const { informes, isLoading, cargarInformes } =
    useInformesData(addNotification);
  const {
    searchTerm,
    searchTrimmed,
    hayBusqueda,
    selectedArea,
    setSelectedArea,
    handleSearchChange,
    areasUnicas,
    informesDisponibles,
  } = useInformesFilter(informes, user);

  const handleCardClick = (informe) => {
    if (Number(informe.activo) === 0) {
      addNotification({
        message: "El informe se encuentra inactivo y no permite visualización.",
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
        areaClass={getAreaClass(selectedCard.area_nombre)}
        onBack={() => setSelectedCard(null)}
      />
    );
  }

  return (
    <div className={styles.container}>
      <LoadingScreen
        isVisible={isLoading}
        title="Sincronizando Módulos"
        subtitle="Estableciendo conexión con el repositorio analítico..."
        variant="fullscreen"
      />

      <InformesHeader totalDisponibles={informesDisponibles.length} />

      <main className={styles.content}>
        <InformesToolbar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          selectedArea={selectedArea}
          onAreaChange={setSelectedArea}
          areasUnicas={areasUnicas}
          cargando={isLoading}
          onRefresh={cargarInformes}
        />

        {!isLoading && (
          <InformesGrid
            informes={informesDisponibles}
            hayBusqueda={hayBusqueda}
            searchTrimmed={searchTrimmed}
            onCardClick={handleCardClick}
          />
        )}
      </main>
    </div>
  );
}

export default Informes;
