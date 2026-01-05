import React, { useState, useEffect } from "react";
import { apiService } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";
import ModalDetallesSolicitud from "./ModalDetallesSolicitud";
import ModalTrazabilidad from "./ModalTrazabilidad";
import ModalAprobarRechazar from "./ModalAprobarRechazar";
import ModalAplicarPrecios from "./ModalAplicarPrecios";
import styles from "./ActualizacionCostos.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEye,
  faHistory,
  faFilter,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faEdit,
  faSave,
  faCheckSquare,
  faFileAlt,
  faCalendarAlt,
  faUser,
  faBuilding,
  faBoxes,
  faCalculator,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";

const ActualizacionCostos = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [solicitudesPorPagina] = useState(8);
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [cargando, setCargando] = useState(false);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [mostrarModalTrazabilidad, setMostrarModalTrazabilidad] =
    useState(false);
  const [mostrarModalAprobarRechazar, setMostrarModalAprobarRechazar] =
    useState(false);
  const [mostrarModalAplicarPrecios, setMostrarModalAplicarPrecios] =
    useState(false);

  useEffect(() => {
    cargarSolicitudes();
  }, [user.id]);

  // Prevenir scroll del fondo cuando el modal está abierto
  useEffect(() => {
    if (
      mostrarModalDetalles ||
      mostrarModalTrazabilidad ||
      mostrarModalAplicarPrecios ||
      mostrarModalAprobarRechazar
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [
    mostrarModalDetalles,
    mostrarModalTrazabilidad,
    mostrarModalAplicarPrecios,
    mostrarModalAprobarRechazar,
  ]);

  const cargarSolicitudes = async () => {
    setCargando(true);
    try {
      const respuesta = await apiService.getSolicitudesActualizacionCostos(
        user.id,
        user.login
      );
      setSolicitudes(respuesta.data || []);
    } catch (error) {
      addNotification({
        message: "Error al cargar las solicitudes: " + error,
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const cargarDetalleSolicitud = async (idSolicitud) => {
    setCargando(true);
    try {
      const respuesta =
        await apiService.getDetalleSolicitudesActualizacionCostos(idSolicitud);
      setSolicitudSeleccionada(respuesta.data || []);

      // Siempre abrir modal de detalles, sin importar el usuario
      setMostrarModalDetalles(true);
    } catch (error) {
      addNotification({
        message: "Error al cargar el detalle de la solicitud: " + error,
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const cargarTrazabilidad = async (idSolicitud) => {
    setCargando(true);
    try {
      const respuesta =
        await apiService.getTrazabilidadSolicitudesActualizacionCostos(
          idSolicitud
        );
      setSolicitudSeleccionada({
        id: idSolicitud,
        trazabilidad: respuesta.data || [],
      });
      setMostrarModalTrazabilidad(true);
    } catch (error) {
      addNotification({
        message: "Error al cargar la trazabilidad: " + error,
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const manejarAprobarRechazar = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    if (mostrarModalDetalles) {
      setMostrarModalDetalles(false);
    }
    setMostrarModalAprobarRechazar(true);
  };

  const manejarAplicarCambioPrecio = async (idSolicitud) => {
    setCargando(true);
    try {
      const respuesta = await apiService.aplicarCambioPrecio(
        idSolicitud,
        user.login,
        user.id
      );

      addNotification({
        message: respuesta.mensaje,
        type: "success",
      });
      cargarSolicitudes();
    } catch (error) {
      addNotification({
        message: "Error al aplicar cambio de precio: " + error.message,
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const manejarAplicarPrecios = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setMostrarModalAplicarPrecios(true);
  };

  const solicitudesFiltradas = (solicitudes ?? []).filter((solicitud) => {
    const coincideBusqueda =
      solicitud.id.toString().includes(filtroBusqueda) ||
      solicitud.nit_proveedor
        ?.toLowerCase()
        .includes(filtroBusqueda.toLowerCase()) ||
      solicitud.nombre_comprador
        ?.toLowerCase()
        .includes(filtroBusqueda.toLowerCase()) ||
      solicitud.nombre_proveedor
        ?.toLowerCase()
        .includes(filtroBusqueda.toLowerCase());
    const coincideEstado =
      filtroEstado === "todos" || solicitud.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  const indiceUltimaSolicitud = paginaActual * solicitudesPorPagina;
  const indicePrimeraSolicitud = indiceUltimaSolicitud - solicitudesPorPagina;
  const solicitudesPaginaActual = solicitudesFiltradas.slice(
    indicePrimeraSolicitud,
    indiceUltimaSolicitud
  );
  const totalPaginas = Math.ceil(
    solicitudesFiltradas.length / solicitudesPorPagina
  );

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const obtenerNumerosPagina = () => {
    const numeros = [];
    const paginasAMostrar = 5;

    let inicio = Math.max(1, paginaActual - Math.floor(paginasAMostrar / 2));
    let fin = Math.min(totalPaginas, inicio + paginasAMostrar - 1);

    inicio = Math.max(1, fin - paginasAMostrar + 1);

    for (let i = inicio; i <= fin; i++) {
      numeros.push(i);
    }

    return numeros;
  };

  const renderizarBadgeEstado = (estado) => {
    const configuraciones = {
      pendiente: { clase: styles.badgePendiente, icono: faClock },
      en_revision: { clase: styles.badgeRevision, icono: faEdit },
      aprobada: { clase: styles.badgeAprobada, icono: faCheckCircle },
      rechazada: { clase: styles.badgeRechazada, icono: faTimesCircle },
      aplicada: { clase: styles.badgeAplicada, icono: faSave },
    };

    const config = configuraciones[estado] || configuraciones.pendiente;

    return (
      <span className={`${styles.badgeEstado} ${config.clase}`}>
        <FontAwesomeIcon icon={config.icono} />
        {estado.replace("_", " ")}
      </span>
    );
  };

  const obtenerAcciones = (solicitud) => {
    const acciones = [];

    if (user.login === "JOHANAB" && solicitud.estado === "en_revision") {
      acciones.push({
        label: "Cambio Precio Realizado",
        icon: faCheckSquare,
        onClick: () => manejarAplicarCambioPrecio(solicitud.id),
        clase: styles.botonAprobar,
      });
    }

    if (
      user.login !== "JOHANAB" &&
      user.login !== "ANDREA" &&
      solicitud.estado === "pendiente"
    ) {
      acciones.push({
        label: "Aprobar/Rechazar",
        icon: faCheckCircle,
        onClick: () => manejarAprobarRechazar(solicitud),
        clase: styles.botonGestionar,
      });
    }

    if (user.login === "ANDREA" && solicitud.estado === "aprobada") {
      acciones.push({
        label: "Aplicar Precios",
        icon: faCalculator,
        onClick: () => manejarAplicarPrecios(solicitud),
        clase: styles.botonAplicar,
      });
    }

    return acciones;
  };

  if (
    cargando &&
    !mostrarModalDetalles &&
    !mostrarModalTrazabilidad &&
    !mostrarModalAprobarRechazar &&
    !mostrarModalAplicarPrecios
  ) {
    return <LoadingScreen />;
  }

  return (
    <div className={styles.contenedor}>
      {/* ENCABEZADO PRINCIPAL */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Actualizacion de Costos</h1>
          <p className={styles.subtitle}>
            Gestión y programación de actualizaciones de costos
          </p>
        </div>
      </div>
      <div className={styles.encabezadoPrincipal}>
        <div className={styles.estadisticas}>
          <div className={styles.tarjetaEstadistica}>
            <div className={styles.iconoEstadistica}>
              <FontAwesomeIcon icon={faFileAlt} />
            </div>
            <div className={styles.contenidoEstadistica}>
              <span className={styles.valorEstadistica}>
                {(solicitudes ?? []).length}
              </span>
              <span className={styles.etiquetaEstadistica}>
                Total Solicitudes
              </span>
            </div>
          </div>

          <div className={styles.tarjetaEstadistica}>
            <div className={styles.iconoEstadistica}>
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className={styles.contenidoEstadistica}>
              <span className={styles.valorEstadistica}>
                {
                  (solicitudes ?? []).filter((s) => s.estado === "pendiente")
                    .length
                }
              </span>
              <span className={styles.etiquetaEstadistica}>Pendientes</span>
            </div>
          </div>

          <div className={styles.tarjetaEstadistica}>
            <div className={styles.iconoEstadistica}>
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className={styles.contenidoEstadistica}>
              <span className={styles.valorEstadistica}>
                {
                  (solicitudes ?? []).filter((s) => s.estado === "aprobada")
                    .length
                }
              </span>
              <span className={styles.etiquetaEstadistica}>Aprobadas</span>
            </div>
          </div>

          <div className={styles.tarjetaEstadistica}>
            <div className={styles.iconoEstadistica}>
              <FontAwesomeIcon icon={faSave} />
            </div>
            <div className={styles.contenidoEstadistica}>
              <span className={styles.valorEstadistica}>
                {solicitudes.filter((s) => s.estado === "aplicada").length}
              </span>
              <span className={styles.etiquetaEstadistica}>Aplicadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className={styles.filtros}>
        <div className={styles.encabezadoFiltros}>
          <FontAwesomeIcon
            icon={faFilter}
            className={styles.iconoEncabezadoFiltros}
          />
          <h3>Filtros de Búsqueda</h3>
        </div>
        <div className={styles.contenidoFiltros}>
          <div className={`${styles.grupoFiltro} ${styles.floating}`}>
            <div className={styles.inputGrupo}>
              <FontAwesomeIcon icon={faSearch} className={styles.iconoFiltro} />
              <input
                type="text"
                placeholder="Buscar por ID, proveedor..."
                value={filtroBusqueda}
                onChange={(e) => setFiltroBusqueda(e.target.value)}
                className={styles.inputBusqueda}
              />
              <label className={styles.etiquetaFiltro}>Busqueda</label>
            </div>
          </div>

          <div className={`${styles.grupoFiltro} ${styles.floating}`}>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className={styles.selectFiltro}
            >
              <option value="todos">Todos los estados</option>
              {user.login != "ANDREA" && (
                <option value="pendiente">Pendiente</option>
              )}
              {user.login != "ANDREA" && (
                <option value="en_revision">En revisión</option>
              )}
              <option value="aprobada">Aprobada</option>
              {user.login != "ANDREA" && (
                <option value="rechazada">Rechazada</option>
              )}
              <option value="aplicada">Aplicada</option>
            </select>
            <label className={styles.etiquetaFiltro}>Filtrar por Estado</label>
          </div>

          <button
            className={styles.refreshButton}
            onClick={cargarSolicitudes}
            title="Actualizar datos"
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
        </div>
      </div>

      {/* LISTA DE SOLICITUDES */}
      {solicitudesFiltradas.length === 0 ? (
        <div className={styles.sinResultados}>
          <FontAwesomeIcon
            icon={faFileAlt}
            className={styles.iconoSinResultados}
          />
          <h3>No se encontraron solicitudes</h3>
          <p>No hay solicitudes que coincidan con los criterios de búsqueda</p>
        </div>
      ) : (
        <div className={styles.contenedorSolicitudes}>
          <div className={styles.encabezadoLista}>
            <h3>Solicitudes Asignadas</h3>
            <span className={styles.contadorResultados}>
              Mostrando {solicitudesPaginaActual.length} de{" "}
              {solicitudesFiltradas.length} solicitudes (Página {paginaActual}{" "}
              de {totalPaginas})
            </span>
          </div>

          <div className={styles.listaSolicitudes}>
            {solicitudesPaginaActual.map((solicitud) => (
              <div key={solicitud.id} className={styles.tarjetaSolicitud}>
                <div className={styles.encabezadoTarjeta}>
                  <div className={styles.infoPrincipal}>
                    <div className={styles.numeroSolicitud}>
                      <FontAwesomeIcon icon={faFileAlt} />
                      <span>Solicitud #{solicitud.id}</span>
                    </div>
                    {renderizarBadgeEstado(solicitud.estado)}
                  </div>
                  <div className={styles.fechaCreacion}>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>
                      {new Date(solicitud.fecha_creacion).toLocaleDateString(
                        "es-CO",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>

                <div className={styles.cuerpoTarjeta}>
                  <div className={styles.detallesSolicitud}>
                    <div className={styles.detalleItem}>
                      <FontAwesomeIcon
                        icon={faBuilding}
                        className={styles.iconoDetalle}
                      />
                      <div>
                        <label>Proveedor</label>
                        <span>
                          {solicitud.nombre_proveedor} -{" "}
                          {solicitud.nit_proveedor}
                        </span>
                      </div>
                    </div>

                    <div className={styles.detalleItem}>
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className={styles.iconoDetalle}
                      />
                      <div>
                        <label>Fecha Aplicación</label>
                        <span>{solicitud.fecha_inicio || "No definida"}</span>
                      </div>
                    </div>

                    <div className={styles.detalleItem}>
                      <FontAwesomeIcon
                        icon={faBoxes}
                        className={styles.iconoDetalle}
                      />
                      <div>
                        <label>Items</label>
                        <span>{solicitud.cantidad_items || 0} productos</span>
                      </div>
                    </div>

                    <div className={styles.detalleItem}>
                      <FontAwesomeIcon
                        icon={faUser}
                        className={styles.iconoDetalle}
                      />
                      <div>
                        <label>Comprador</label>
                        <span>
                          {solicitud.nombre_comprador || "No asignado"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.accionesTarjeta}>
                    <button
                      className={styles.botonAccion}
                      onClick={() => cargarDetalleSolicitud(solicitud.id)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                      <span>Ver Detalles</span>
                    </button>

                    <button
                      className={styles.botonAccion}
                      onClick={() => cargarTrazabilidad(solicitud.id)}
                    >
                      <FontAwesomeIcon icon={faHistory} />
                      <span>Trazabilidad</span>
                    </button>

                    {obtenerAcciones(solicitud).map((accion, index) => (
                      <button
                        key={index}
                        className={`${styles.botonAccion} ${accion.clase}`}
                        onClick={accion.onClick}
                      >
                        <FontAwesomeIcon icon={accion.icon} />
                        <span>{accion.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {solicitudesFiltradas.length > 0 && (
        <div className={styles.paginacion}>
          <div className={styles.infoPaginacion}>
            Mostrando {indicePrimeraSolicitud + 1}-
            {Math.min(indiceUltimaSolicitud, solicitudesFiltradas.length)} de{" "}
            {solicitudesFiltradas.length} solicitudes
          </div>

          <div className={styles.controlesPaginacion}>
            <button
              className={`${styles.botonPaginacion} ${
                paginaActual === 1 ? styles.botonDeshabilitado : ""
              }`}
              onClick={paginaAnterior}
              disabled={paginaActual === 1}
            >
              Anterior
            </button>

            <div className={styles.numerosPagina}>
              {obtenerNumerosPagina().map((numero) => (
                <button
                  key={numero}
                  className={`${styles.numeroPagina} ${
                    paginaActual === numero ? styles.paginaActiva : ""
                  }`}
                  onClick={() => cambiarPagina(numero)}
                >
                  {numero}
                </button>
              ))}
            </div>

            <button
              className={`${styles.botonPaginacion} ${
                paginaActual === totalPaginas ? styles.botonDeshabilitado : ""
              }`}
              onClick={paginaSiguiente}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* MODALES */}
      {mostrarModalDetalles && (
        <ModalDetallesSolicitud
          solicitud={solicitudSeleccionada}
          onClose={() => setMostrarModalDetalles(false)}
          onAprobarRechazar={() =>
            manejarAprobarRechazar(solicitudSeleccionada)
          }
          onAplicarPrecios={() => manejarAplicarPrecios(solicitudSeleccionada)}
          onAplicarCambioPrecio={() =>
            manejarAplicarCambioPrecio(solicitudSeleccionada.id)
          }
          onSuccess={cargarSolicitudes}
        />
      )}

      {mostrarModalTrazabilidad && (
        <ModalTrazabilidad
          trazabilidad={solicitudSeleccionada?.trazabilidad || []}
          onClose={() => setMostrarModalTrazabilidad(false)}
        />
      )}

      {mostrarModalAprobarRechazar && (
        <ModalAprobarRechazar
          solicitud={solicitudSeleccionada}
          onClose={() => setMostrarModalAprobarRechazar(false)}
          onSuccess={cargarSolicitudes}
        />
      )}

      {mostrarModalAplicarPrecios && (
        <ModalAplicarPrecios
          solicitud={solicitudSeleccionada}
          onClose={() => setMostrarModalAplicarPrecios(false)}
          onSuccess={cargarSolicitudes}
        />
      )}
    </div>
  );
};

export default ActualizacionCostos;
