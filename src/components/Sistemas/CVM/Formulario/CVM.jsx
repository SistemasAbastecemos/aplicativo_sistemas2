import React, { useState, useCallback } from "react";
import styles from "./CVM.module.css";
import LoadingScreen from "../../../UI/LoadingScreen";
import { apiService } from "../../../../services/api";
import { useAuth } from "../../../../contexts/AuthContext";
import { useNotification } from "../../../../contexts/NotificationContext";

// Hooks
import { useCatalogos } from "./hooks/useCatalogos";
import { useVerificaciones } from "./hooks/useVerificaciones";
import { useReporteEnviar } from "./hooks/useReporteEnviar";

// Components
import CVMHeader from "./components/CVMHeader";
import SupervisorFormSection from "./components/SupervisorFormSection";
import CajasGrid from "./components/CajasGrid";
import EquipoInfoSection from "./components/EquipoInfoSection";
import VerificacionesSection from "./components/VerificacionesSection";
import ActionBar from "./components/ActionBar";

// Utils
import { OBSERVACION_TODAS_SIN_NOVEDAD } from "./utils/constants";

/**
 * Orquestador del módulo CVM (Sistema de Supervisión de Verificaciones
 * Metrológicas). Coordina:
 *  - Selección de supervisor y observaciones
 *  - Selección de caja (con caso especial "todas sin novedad")
 *  - Carga del equipo asociado a la caja
 *  - Verificaciones (foto + estado) para conforme/regularización/precinto
 *  - Envío del reporte con rollback si falla
 *
 * Estado propio del orquestador: nombre/cédula del supervisor,
 * observaciones, caja seleccionada, equipo info. Lo pesado (fotos, envío)
 * vive en hooks.
 */
const CVM = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  // Estado del supervisor
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Estado de la caja y equipo
  const [cajaSeleccionada, setCajaSeleccionada] = useState(null);
  const [equipoInfo, setEquipoInfo] = useState(null);

  // Catálogos
  const { cajas, supervisores } = useCatalogos({
    sedeCodigo: user?.sede_codigo,
    addNotification,
  });

  // Verificaciones (fotos + estados)
  const verif = useVerificaciones();

  // Reset completo del formulario tras envío exitoso
  const resetFormulario = useCallback(() => {
    setNombre("");
    setCedula("");
    setObservaciones("");
    setCajaSeleccionada(null);
    setEquipoInfo(null);
    verif.resetVerificaciones();
  }, [verif]);

  // Hook de envío
  const { cargando, enviarReporteTodas, enviarReporteCaja } = useReporteEnviar({
    addNotification,
    onExitoso: resetFormulario,
  });

  // ==================== Handlers ====================

  const handleNombreChange = useCallback(
    (e) => {
      const seleccionado = supervisores.find(
        (s) => s.nombre === e.target.value,
      );
      setNombre(seleccionado?.nombre || "");
      setCedula(seleccionado?.cedula || "");
    },
    [supervisores],
  );

  const handleObservacionesChange = useCallback((e) => {
    // Bloquea espacios al inicio en tiempo real; trim final se aplica al
    // enviar en useReporteEnviar.
    setObservaciones(e.target.value.replace(/^\s+/, ""));
  }, []);

  const handleSelectCaja = useCallback(
    async (caja) => {
      // Al cambiar de caja, resetear las verificaciones (fotos + estados)
      setCajaSeleccionada(caja);
      verif.resetVerificaciones();

      // Ajustar observaciones según el tipo de caja
      if (caja.id_caja === "todas") {
        setObservaciones(OBSERVACION_TODAS_SIN_NOVEDAD);
      } else {
        setObservaciones("");
      }

      // Cargar la balanza asociada a la caja
      try {
        const response = await apiService.getBalanza(
          caja.id_sede,
          caja.id_caja,
        );
        setEquipoInfo(response.length > 0 ? response[0] : null);
      } catch (error) {
        addNotification({
          message: "Error al cargar el equipo: " + (error.message || error),
          type: "error",
        });
        setEquipoInfo(null);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [addNotification],
  );

  const handleEnviarReporte = useCallback(() => {
    if (cajaSeleccionada?.id_caja === "todas") {
      enviarReporteTodas({
        nombre,
        cedula,
        sedeCodigo: user?.sede_codigo,
        idCaja: cajaSeleccionada.id_caja,
      });
    } else {
      enviarReporteCaja({
        nombre,
        cedula,
        sedeCodigo: user?.sede_codigo,
        cajaSeleccionada,
        equipoInfo,
        verificaciones: verif.verificaciones,
        observaciones,
      });
    }
  }, [
    cajaSeleccionada,
    nombre,
    cedula,
    user,
    equipoInfo,
    verif.verificaciones,
    observaciones,
    enviarReporteTodas,
    enviarReporteCaja,
  ]);

  // ==================== Formulario completo ====================

  // Regla preservada del legacy:
  //  - "todas" solo requiere nombre
  //  - caja específica requiere nombre + caja + las 3 fotos + los 3 estados
  const esFormularioCompleto =
    (cajaSeleccionada?.id_caja === "todas" && nombre) ||
    (nombre && cajaSeleccionada && verif.todasCompletas);

  if (cargando) {
    return (
      <LoadingScreen
        isVisible={true}
        title="Procesando reporte"
        subtitle="Subiendo imágenes y guardando el registro..."
        variant="fullscreen"
      />
    );
  }

  return (
    <div className={styles.container}>
      <CVMHeader user={user} />

      <main className={styles.mainContent}>
        <SupervisorFormSection
          supervisores={supervisores}
          nombre={nombre}
          onNombreChange={handleNombreChange}
          observaciones={observaciones}
          onObservacionesChange={handleObservacionesChange}
        />

        <CajasGrid
          cajas={cajas}
          cajaSeleccionada={cajaSeleccionada}
          onSelectCaja={handleSelectCaja}
        />

        {cajaSeleccionada && (
          <EquipoInfoSection
            cajaSeleccionada={cajaSeleccionada}
            equipoInfo={equipoInfo}
          />
        )}

        {equipoInfo && (
          <VerificacionesSection
            verificaciones={verif.verificaciones}
            onTomarFoto={verif.tomarFoto}
            onEstadoChange={verif.cambiarEstado}
          />
        )}
      </main>

      {esFormularioCompleto && (
        <ActionBar
          cajaSeleccionada={cajaSeleccionada}
          equipoInfo={equipoInfo}
          cargando={cargando}
          onEnviar={handleEnviarReporte}
        />
      )}
    </div>
  );
};

export default CVM;
