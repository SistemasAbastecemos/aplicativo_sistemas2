import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";
import imagenCaja from "../../../assets/images/caja.png";
import imagenConforme from "../../../assets/images/conforme.png";
import imagenRegularizacion from "../../../assets/images/regularizacion.png";
import imagenPrecinto from "../../../assets/images/precinto.png";
import imagenGramera from "../../../assets/images/gramera.png";
import imagenScannerBalanza from "../../../assets/images/scannerbalanza.png";
import imagenAdvertencia from "../../../assets/images/advertencia.png";
import imageCompression from "browser-image-compression";
import styles from "./CVM.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faUser,
  faStore,
  faCamera,
  faRedo,
  faCheckCircle,
  faTimesCircle,
  faIdCard,
  faCertificate,
  faCalendarCheck,
  faClipboardCheck,
  faShieldAlt,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

const CVM = ({}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [cargando, setCargando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [supervisores, setSupervisores] = useState([]);
  const [observaciones, setObservaciones] = useState("");
  const [cajas, setCajas] = useState([]);
  const [cajaSeleccionada, setCajaSeleccionada] = useState(null);
  const [estadoConforme, setEstadoConforme] = useState("Bueno");
  const [estadoRegularizacion, setEstadoRegularizacion] = useState("Bueno");
  const [estadoPrecinto, setEstadoPrecinto] = useState("Bueno");
  const [fotoConforme, setFotoConforme] = useState(null);
  const [fotoRegularizacion, setFotoRegularizacion] = useState(null);
  const [fotoPrecinto, setFotoPrecinto] = useState(null);
  const [equipoInfo, setEquipoInfo] = useState(null);
  const [urlFotoConforme, setUrlFotoConforme] = useState(null);
  const [urlFotoRegularizacion, setUrlFotoRegularizacion] = useState(null);
  const [urlFotoPrecinto, setUrlFotoPrecinto] = useState(null);

  const esFormularioCompleto =
    (cajaSeleccionada?.id_caja === "todas" && nombre) ||
    (nombre &&
      cajaSeleccionada &&
      fotoConforme &&
      fotoRegularizacion &&
      fotoPrecinto &&
      estadoConforme &&
      estadoRegularizacion &&
      estadoPrecinto);

  useEffect(() => {
    const fetchCajas = async () => {
      try {
        const response = await apiService.getCajas(user?.sede_codigo);
        setCajas(response);
        addNotification({
          message: "Bienvenido al aplicativo de supervisión.",
          type: "success",
        });
      } catch (error) {
        addNotification({
          message: "Error cargando las cajas: " + (error.message || error),
          type: "error",
        });
      }
    };

    fetchCajas();
  }, [user?.sede_codigo]);

  useEffect(() => {
    const fetchSupervisores = async () => {
      try {
        const response = await apiService.getSupervisores(user?.sede_codigo);
        setSupervisores(response);
      } catch (error) {
        addNotification({
          message:
            "Error cargando los supervisores: " + (error.message || error),
          type: "error",
        });
      }
    };

    fetchSupervisores();
  }, [user?.sede_codigo]);

  const handleCajaSeleccionada = async (caja) => {
    setCajaSeleccionada(caja);
    setFotoConforme(null);
    setFotoRegularizacion(null);
    setFotoPrecinto(null);
    setEstadoConforme("Bueno");
    setEstadoRegularizacion("Bueno");
    setEstadoPrecinto("Bueno");

    try {
      const response = await apiService.getBalanza(caja.id_sede, caja.id_caja);

      if (response.length > 0) {
        setEquipoInfo(response[0]);
      } else {
        setEquipoInfo(null);
      }
    } catch (error) {
      addNotification({
        message: "Error al cargar el equipo: " + (error.message || error),
        type: "error",
      });
      setEquipoInfo(null);
    }
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error comprimiendo imagen:", error);
      return file;
    }
  };

  const tomarFoto = (tipo) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "camera";
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const compressedFile = await compressImage(file);
        const url = URL.createObjectURL(compressedFile);
        if (tipo === "conforme") {
          setFotoConforme(compressedFile);
          setUrlFotoConforme(url);
        } else if (tipo === "regularizacion") {
          setFotoRegularizacion(compressedFile);
          setUrlFotoRegularizacion(url);
        } else if (tipo === "precinto") {
          setFotoPrecinto(compressedFile);
          setUrlFotoPrecinto(url);
        }
      }
    };
    input.click();
  };

  const obtenerImagenEquipo = () => {
    if (equipoInfo) {
      switch (equipoInfo.tipo) {
        case "GRAMERA":
          return imagenGramera;
        case "SCANER BALANZA":
          return imagenScannerBalanza;
        default:
          return null;
      }
    }
    return null;
  };

  const getEstadoColor = (estado) => {
    return estado === "Bueno" ? "#10b981" : "#ef4444";
  };

  const getEstadoIcon = (estado) => {
    return estado === "Bueno" ? faCheckCircle : faTimesCircle;
  };

  const handleEnviarReporte = () => {
    if (cajaSeleccionada?.id_caja === "todas") {
      handleEnviarReporteTodas();
    } else {
      handleEnviarReporteCaja();
    }
  };

  const handleEnviarReporteTodas = async () => {
    setCargando(true);

    if (!esFormularioCompleto) {
      addNotification({
        message: "Por favor, seleccione un nombre antes de enviar.",
        type: "danger",
      });
      setCargando(false); // Ocultar pantalla de carga
      return;
    }

    // Obtener la fecha actual en formato YYYYMMDD
    const obtenerFechaActual = () => {
      const hoy = new Date();
      const anio = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, "0");
      const dia = String(hoy.getDate()).padStart(2, "0");
      return `${anio}${mes}${dia}`;
    };

    const fechaActual = obtenerFechaActual();

    const registroData = {
      fecha: fechaActual,
      nombre,
      cedula,
      id_caja: cajaSeleccionada.id_caja,
      id_sede: user?.sede_codigo,
      estado_inicial: "Bueno",
      estado_final: "Bueno",
      observaciones:
        "La sede ha realizado todas las balanzas de todas las cajas y no hubo novedad, este reporte queda como registro de aquello",
    };

    try {
      const response = await apiService.saveRegistroTodasOK(registroData);

      if (response.success) {
        addNotification({
          message: "Registro guardado exitosamente.",
          type: "success",
        });

        // Resetear el formulario
        setObservaciones("");
        setCajaSeleccionada(null);
        setEquipoInfo(null);
      } else {
        addNotification({
          message: "Error al guardar el registro.",
          type: "error",
        });
      }
    } catch (error) {
      addNotification({
        message:
          "Ocurrio en error al guardar el reporte: " + (error.message || error),
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const handleEnviarReporteCaja = async () => {
    setCargando(true);

    // Validar si el formulario está completo
    if (!esFormularioCompleto) {
      addNotification({
        message:
          "Por favor, ingrese todos los datos antes de enviar el registro.",
        type: "danger",
      });
      setCargando(false);
      return;
    }

    // Obtener la fecha actual en formato YYYYMMDD
    const obtenerFechaActual = () => {
      const hoy = new Date();
      const anio = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, "0");
      const dia = String(hoy.getDate()).padStart(2, "0");
      return `${anio}${mes}${dia}`;
    };

    const fechaActual = obtenerFechaActual();

    // Arrays para manejo de errores y rollback
    let uploadedImages = [];
    let registroExitoso = false;

    try {
      // Subir imágenes al servidor de forma paralela
      const uploadImage = async (file, tipo) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("tipo", tipo);

        const response = await apiService.uploadImagenCvm(formData);
        return response.url;
      };

      const uploadPromises = [];

      if (fotoConforme)
        uploadPromises.push(uploadImage(fotoConforme, "conforme"));
      if (fotoRegularizacion)
        uploadPromises.push(uploadImage(fotoRegularizacion, "regularizacion"));
      if (fotoPrecinto)
        uploadPromises.push(uploadImage(fotoPrecinto, "precinto"));

      // Esperar a que todas las imágenes se suban
      const [urlFotoConforme, urlFotoRegularizacion, urlFotoPrecinto] =
        await Promise.all(uploadPromises);

      // Guardar URLs para posible rollback
      uploadedImages = [
        urlFotoConforme,
        urlFotoRegularizacion,
        urlFotoPrecinto,
      ];

      // Determinar el estado inicial
      const estadoInicial =
        estadoConforme === "Malo" ||
        estadoRegularizacion === "Malo" ||
        estadoPrecinto === "Malo"
          ? "Malo"
          : "Bueno";

      // Estado final nunca debe estar vacío
      // Si hay algún estado "Malo", el estado final debe reflejar la situación
      const estadoFinal =
        estadoInicial === "Malo" ? "Requiere Acción" : "Bueno";

      // Preparar los datos para el registro
      const registroData = {
        fecha: fechaActual,
        nombre,
        cedula,
        id_caja: cajaSeleccionada.id_caja,
        id_sede: user?.sede_codigo,
        tipo_balanza: equipoInfo.tipo,
        serial: equipoInfo.serial,
        nii: equipoInfo.nii,
        estado_simel: equipoInfo.estadoSimel,
        fecha_certificacion: equipoInfo.fechaCertificacion,
        estado_conforme: estadoConforme,
        estado_regularizacion: estadoRegularizacion,
        estado_precinto: estadoPrecinto,
        foto_conforme: urlFotoConforme,
        foto_regularizacion: urlFotoRegularizacion,
        foto_precinto: urlFotoPrecinto,
        estado_inicial: estadoInicial,
        estado_final: estadoFinal, // Ahora nunca estará vacío
        observaciones,
      };

      // Enviar el registro a la base de datos
      const response = await apiService.saveRegistroCVM(registroData);

      if (response.success) {
        registroExitoso = true;

        addNotification({
          message: "Registro guardado exitosamente.",
          type: "success",
        });

        // Resetear el formulario
        setObservaciones("");
        setFotoConforme(null);
        setFotoRegularizacion(null);
        setFotoPrecinto(null);
        setEstadoConforme("Bueno");
        setEstadoRegularizacion("Bueno");
        setEstadoPrecinto("Bueno");
        setCajaSeleccionada(null);
        setEquipoInfo(null);

        // Limpiar URLs locales
        if (urlFotoConforme) URL.revokeObjectURL(urlFotoConforme);
        if (urlFotoRegularizacion) URL.revokeObjectURL(urlFotoRegularizacion);
        if (urlFotoPrecinto) URL.revokeObjectURL(urlFotoPrecinto);
      } else {
        throw new Error(response.error || "Error al guardar el registro");
      }
    } catch (error) {
      // Si hubo error y se subieron imágenes, intentar eliminarlas
      if (uploadedImages.length > 0 && !registroExitoso) {
        try {
          await apiService.eliminarImagenes({ urls: uploadedImages });
        } catch (deleteError) {
          console.error("Error eliminando imágenes huérfanas:", deleteError);
        }
      }

      addNotification({
        message:
          "Ocurrió un error al guardar el reporte: " + (error.message || error),
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <LoadingScreen message="Procesando reporte..." />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerMain}>
            <h1 className={styles.title}>Sistema de Supervisión CVM</h1>
          </div>
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.userDetail}>
                <FontAwesomeIcon icon={faUser} />
                <span>{user?.nombres_completos || "Usuario"}</span>
              </div>
              <div className={styles.userDetail}>
                <FontAwesomeIcon icon={faStore} />
                <span>Sede: {user?.sede_codigo || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información Principal */}
      <div className={styles.mainContent}>
        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <FontAwesomeIcon
                icon={faClipboardCheck}
                className={styles.cardIcon}
              />
              <h3>Información del Supervisor</h3>
            </div>
            <div className={styles.cardContent}>
              {/* Nombre del Supervisor con floating label */}
              <div className={`${styles.formGroup} ${styles.floating}`}>
                <select
                  className={styles.formSelect}
                  value={nombre}
                  onChange={(e) => {
                    const selectedSupervisor = supervisores.find(
                      (s) => s.nombre === e.target.value
                    );
                    setNombre(selectedSupervisor?.nombre || "");
                    setCedula(selectedSupervisor?.cedula || "");
                  }}
                  required
                >
                  <option value="" disabled></option>
                  {supervisores.map((supervisor) => (
                    <option key={supervisor.id} value={supervisor.nombre}>
                      {supervisor.nombre}
                    </option>
                  ))}
                </select>
                <label className={styles.formLabel}>
                  <FontAwesomeIcon icon={faUser} />
                  Nombre del Supervisor
                </label>
              </div>

              {/* Observaciones con floating label */}
              <div className={`${styles.formGroup} ${styles.floating}`}>
                <textarea
                  className={styles.formTextarea}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows="3"
                  placeholder=" "
                />
                <label className={styles.formLabel}>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  Observaciones
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Selección de Cajas */}
        <div className={styles.cajasSection}>
          <div className={styles.sectionHeader}>
            <h2>Seleccione la Caja a Supervisar</h2>
          </div>
          <div className={styles.cajasContainer}>
            <div className={styles.cajasGrid}>
              {cajas
                .sort((a, b) =>
                  a.id_caja === "todas" ? -1 : b.id_caja === "todas" ? 1 : 0
                )
                .map((caja) => (
                  <div
                    key={caja.id}
                    className={`${styles.cajaCard} ${
                      cajaSeleccionada && cajaSeleccionada.id === caja.id
                        ? styles.cajaSeleccionada
                        : ""
                    }`}
                    onClick={() => {
                      handleCajaSeleccionada(caja);
                      caja.id_caja === "todas"
                        ? setObservaciones(
                            "La sede ha revisado todas las balanzas de todas las cajas y no hubo novedad, este reporte queda como registro de aquello"
                          )
                        : setObservaciones("");
                    }}
                  >
                    <div className={styles.cajaIcon}>
                      <img
                        src={
                          caja.id_caja === "todas"
                            ? imagenAdvertencia
                            : imagenCaja
                        }
                        alt={
                          caja.id_caja === "todas"
                            ? "Todas las cajas"
                            : `Caja ${caja.id_caja}`
                        }
                      />
                    </div>
                    <div className={styles.cajaInfo}>
                      <h4>
                        {caja.id_caja === "todas"
                          ? "Todas sin Novedad"
                          : `Caja ${caja.id_caja.replace("caja", "")}`}
                      </h4>
                      <p>
                        {caja.id_caja === "todas"
                          ? "Reporte general sin novedades"
                          : "Verificar equipo de medición"}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Información del Equipo */}
        {cajaSeleccionada && (
          <div className={styles.equipoSection}>
            <div className={styles.sectionHeader}>
              <h2>Información del Equipo</h2>
            </div>

            {equipoInfo ? (
              <div className={styles.equipoCard}>
                <div className={styles.equipoHeader}>
                  <div className={styles.equipoIcon}>
                    <img src={obtenerImagenEquipo()} alt={equipoInfo.tipo} />
                  </div>
                  <div className={styles.equipoTitle}>
                    <h3>{equipoInfo.tipo}</h3>
                  </div>
                </div>
                <div className={styles.equipoDetails}>
                  <div className={styles.detailItem}>
                    <FontAwesomeIcon icon={faIdCard} />
                    <span>Serial: {equipoInfo.serial}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <FontAwesomeIcon icon={faCertificate} />
                    <span>NII: {equipoInfo.nii}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <FontAwesomeIcon icon={faShieldAlt} />
                    <span>Estado SIMEL: {equipoInfo.estadoSimel}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <FontAwesomeIcon icon={faCalendarCheck} />
                    <span>Certificación: {equipoInfo.fechaCertificacion}</span>
                  </div>
                </div>
              </div>
            ) : cajaSeleccionada.id_caja === "todas" ? (
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <div className={styles.infoContent}>
                  <h3>Reporte General</h3>
                  <p>
                    Esta opción es únicamente para cuando ya has revisado todas
                    las balanzas de todas las cajas y ninguna de ellas presenta
                    novedad. En caso contrario, selecciona la caja cuya balanza
                    tenga novedad y sigue el procedimiento.
                  </p>
                </div>
              </div>
            ) : (
              <div className={styles.infoCard}>
                <div className={styles.infoIcon}>
                  <FontAwesomeIcon icon={faTimesCircle} />
                </div>
                <div className={styles.infoContent}>
                  <h3>Sin Equipo</h3>
                  <p>La caja seleccionada no tiene balanza asignada.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Verificaciones */}
        {equipoInfo && (
          <div className={styles.verificacionesSection}>
            <div className={styles.sectionHeader}>
              <h2>Verificaciones de Estado</h2>
            </div>

            <div className={styles.verificacionesGrid}>
              {/* Conforme */}
              <div className={styles.verificacionCard}>
                <div className={styles.verificacionHeader}>
                  <div className={styles.verificacionIcon}>
                    <img src={imagenConforme} alt="Conforme" />
                  </div>
                  <div className={styles.verificacionInfo}>
                    <h4>Estado de Conforme</h4>
                    <p>Etiqueta amarilla en zona frontal del equipo</p>
                  </div>
                </div>

                <div className={styles.verificacionContent}>
                  <div className={styles.fotoSection}>
                    {!fotoConforme ? (
                      <button
                        className={styles.fotoButton}
                        onClick={() => tomarFoto("conforme")}
                      >
                        <FontAwesomeIcon icon={faCamera} />
                        Tomar Foto
                      </button>
                    ) : (
                      <div className={styles.fotoPreview}>
                        <img src={urlFotoConforme} alt="Foto Conforme" />
                        <button
                          className={styles.fotoRetake}
                          onClick={() => tomarFoto("conforme")}
                        >
                          <FontAwesomeIcon icon={faRedo} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.estadoSection}>
                    <div className={`${styles.formGroup} ${styles.floating}`}>
                      <select
                        className={styles.formSelect}
                        value={estadoConforme}
                        onChange={(e) => setEstadoConforme(e.target.value)}
                        style={{ borderColor: getEstadoColor(estadoConforme) }}
                      >
                        <option value="Bueno">Bueno</option>
                        <option value="Malo">Malo</option>
                      </select>
                      <label className={styles.formLabel}>Estado</label>
                    </div>
                    <div
                      className={styles.estadoBadge}
                      style={{
                        backgroundColor: getEstadoColor(estadoConforme),
                      }}
                    >
                      <FontAwesomeIcon icon={getEstadoIcon(estadoConforme)} />
                      {estadoConforme}
                    </div>
                  </div>
                </div>
              </div>

              {/* Regularización */}
              <div className={styles.verificacionCard}>
                <div className={styles.verificacionHeader}>
                  <div className={styles.verificacionIcon}>
                    <img src={imagenRegularizacion} alt="Regularización" />
                  </div>
                  <div className={styles.verificacionInfo}>
                    <h4>Estado de Regularización</h4>
                    <p>Etiqueta blanca en zona frontal del equipo</p>
                  </div>
                </div>

                <div className={styles.verificacionContent}>
                  <div className={styles.fotoSection}>
                    {!fotoRegularizacion ? (
                      <button
                        className={styles.fotoButton}
                        onClick={() => tomarFoto("regularizacion")}
                      >
                        <FontAwesomeIcon icon={faCamera} />
                        Tomar Foto
                      </button>
                    ) : (
                      <div className={styles.fotoPreview}>
                        <img
                          src={urlFotoRegularizacion}
                          alt="Foto Regularización"
                        />
                        <button
                          className={styles.fotoRetake}
                          onClick={() => tomarFoto("regularizacion")}
                        >
                          <FontAwesomeIcon icon={faRedo} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.estadoSection}>
                    <div className={`${styles.formGroup} ${styles.floating}`}>
                      <select
                        className={styles.formSelect}
                        value={estadoRegularizacion}
                        onChange={(e) =>
                          setEstadoRegularizacion(e.target.value)
                        }
                        style={{
                          borderColor: getEstadoColor(estadoRegularizacion),
                        }}
                      >
                        <option value="Bueno">Bueno</option>
                        <option value="Malo">Malo</option>
                      </select>
                      <label className={styles.formLabel}>Estado</label>
                    </div>
                    <div
                      className={styles.estadoBadge}
                      style={{
                        backgroundColor: getEstadoColor(estadoRegularizacion),
                      }}
                    >
                      <FontAwesomeIcon
                        icon={getEstadoIcon(estadoRegularizacion)}
                      />
                      {estadoRegularizacion}
                    </div>
                  </div>
                </div>
              </div>

              {/* Precinto */}
              <div className={styles.verificacionCard}>
                <div className={styles.verificacionHeader}>
                  <div className={styles.verificacionIcon}>
                    <img src={imagenPrecinto} alt="Precinto" />
                  </div>
                  <div className={styles.verificacionInfo}>
                    <h4>Estado de Precinto</h4>
                    <p>Etiqueta roja en zona inferior del equipo</p>
                  </div>
                </div>

                <div className={styles.verificacionContent}>
                  <div className={styles.fotoSection}>
                    {!fotoPrecinto ? (
                      <button
                        className={styles.fotoButton}
                        onClick={() => tomarFoto("precinto")}
                      >
                        <FontAwesomeIcon icon={faCamera} />
                        Tomar Foto
                      </button>
                    ) : (
                      <div className={styles.fotoPreview}>
                        <img src={urlFotoPrecinto} alt="Foto Precinto" />
                        <button
                          className={styles.fotoRetake}
                          onClick={() => tomarFoto("precinto")}
                        >
                          <FontAwesomeIcon icon={faRedo} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.estadoSection}>
                    <div className={`${styles.formGroup} ${styles.floating}`}>
                      <select
                        className={styles.formSelect}
                        value={estadoPrecinto}
                        onChange={(e) => setEstadoPrecinto(e.target.value)}
                        style={{ borderColor: getEstadoColor(estadoPrecinto) }}
                      >
                        <option value="Bueno">Bueno</option>
                        <option value="Malo">Malo</option>
                      </select>
                      <label className={styles.formLabel}>Estado</label>
                    </div>
                    <div
                      className={styles.estadoBadge}
                      style={{
                        backgroundColor: getEstadoColor(estadoPrecinto),
                      }}
                    >
                      <FontAwesomeIcon icon={getEstadoIcon(estadoPrecinto)} />
                      {estadoPrecinto}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      {esFormularioCompleto && (
        <div className={styles.actionBar}>
          <div className={styles.actionSummary}>
            <div className={styles.summaryText}>
              <strong>Reporte listo para enviar</strong>
              <span>
                {cajaSeleccionada?.id_caja === "todas"
                  ? "Reporte general sin novedades"
                  : `Caja ${cajaSeleccionada?.id_caja?.replace("caja", "")} - ${
                      equipoInfo?.tipo
                    }`}
              </span>
            </div>
            <button
              className={styles.submitBtn}
              onClick={handleEnviarReporte}
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faArrowRight} />
                  <span>Enviar Reporte</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVM;
