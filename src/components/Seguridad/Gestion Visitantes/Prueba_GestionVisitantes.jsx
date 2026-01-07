import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { apiService } from "../../../services/api";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";
import { useAuth } from "../../../contexts/AuthContext";
import Webcam from "react-webcam";
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";
import {
  faSearch,
  faUserPlus,
  faIdCard,
  faHistory,
  faSyncAlt,
  faEdit,
  faCheckCircle,
  faClock,
  faTruckLoading,
  faSignOutAlt,
  faFilter,
  faQrcode,
  faCamera,
  faTimes,
  faUpload,
  faBarcode,
  faCalendar,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faStickyNote,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./GestionVisitantes.module.css";
import debounce from "lodash/debounce";
import Tesseract from "tesseract.js";

// ============================================================================
// FUNCIÓN UNIFICADA DE PARSING - Reemplaza todas las anteriores
// ============================================================================
// ============================================================================
// FUNCIÓN UNIFICADA DE PARSING - VERSIÓN CORREGIDA PARA CÉDULAS COLOMBIANAS
// ============================================================================
const parsearDatosEscaneados = (rawData) => {
  if (!rawData || rawData.length < 5) return null;
  // Al inicio de parsearDatosEscaneados
  console.log("=== DATOS CRUDOS RECIBIDOS ===");
  console.log("Longitud:", rawData.length);
  console.log("Primeros 100 chars:", rawData.substring(0, 100));
  console.log("Contiene PubDSK:", rawData.includes("PubDSK"));

  // Limpiar caracteres de control y basura del final
  let cleanData = "";
  for (let i = 0; i < rawData.length; i++) {
    const charCode = rawData.charCodeAt(i);
    if (charCode >= 32 && charCode <= 126) {
      cleanData += rawData[i];
    } else if (cleanData.length > 20) {
      break;
    }
  }

  console.log("Datos limpios:", cleanData);

  if (cleanData.includes("PubDSK")) {
    try {
      const pubdskIndex = cleanData.indexOf("PubDSK");
      const despuesPubDSK = cleanData.substring(pubdskIndex);

      const numerosEncontrados = despuesPubDSK.match(/\d{8,10}/g) || [];

      console.log("Números encontrados:", numerosEncontrados);

      let cedula = null;
      if (numerosEncontrados.length >= 2) {
        cedula = numerosEncontrados[1];
      } else if (numerosEncontrados.length === 1) {
        cedula = numerosEncontrados[0];
      }

      if (!cedula) return null;

      const fechaMatch = cleanData.match(/(19[0-9]{2}|20[0-2][0-9])(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])/);
      let fechaNacimiento = "";
      if (fechaMatch) {
        fechaNacimiento = `${fechaMatch[1]}-${fechaMatch[2]}-${fechaMatch[3]}`;
      }

      let nombresCompletos = "";
      const indexCedula = cleanData.indexOf(cedula);
      if (indexCedula !== -1) {
        const despuesCedula = cleanData.substring(indexCedula + cedula.length);
        const matchNombres = despuesCedula.match(/^([A-ZÑ]+)/);
        if (matchNombres) {
          nombresCompletos = matchNombres[1];
        }
      }

      let apellidos = "";
      let nombres = "";

      if (nombresCompletos.length > 0) {
        const longitudTotal = nombresCompletos.length;

        const patronesApellido = [
          'MARQUEZ', 'SEPULVEDA', 'GARCIA', 'RODRIGUEZ', 'MARTINEZ', 'LOPEZ',
          'HERNANDEZ', 'GONZALEZ', 'PEREZ', 'SANCHEZ', 'RAMIREZ', 'TORRES',
          'FLORES', 'RIVERA', 'GOMEZ', 'DIAZ', 'CRUZ', 'MORALES', 'REYES',
          'ORTIZ', 'GUTIERREZ', 'CHAVEZ', 'RAMOS', 'VARGAS', 'CASTILLO'
        ];

        let separacionEncontrada = false;

        for (const apellido1 of patronesApellido) {
          if (nombresCompletos.startsWith(apellido1)) {
            const resto1 = nombresCompletos.substring(apellido1.length);
            for (const apellido2 of patronesApellido) {
              if (resto1.startsWith(apellido2)) {
                apellidos = `${apellido1} ${apellido2}`;
                nombres = resto1.substring(apellido2.length);
                separacionEncontrada = true;
                break;
              }
            }
            if (separacionEncontrada) break;
          }
        }

        if (!separacionEncontrada) {
          const puntoCorte = Math.floor(longitudTotal * 0.6);
          apellidos = nombresCompletos.substring(0, puntoCorte);
          nombres = nombresCompletos.substring(puntoCorte);
        }
      }

      console.log("Datos extraídos:", { cedula, apellidos, nombres, fechaNacimiento });

      return {
        tipo: "CEDULA_COLOMBIANA",
        cedula: cedula,
        apellidos: apellidos.trim(),
        nombres: nombres.trim(),
        nombresCompletos: nombresCompletos,
        fecha_nacimiento: fechaNacimiento,
      };
    } catch (error) {
      console.error("Error parseando trama de cédula:", error);
    }
  }

  if (cleanData.length > 30 && /\d{8,10}/.test(cleanData) && /[A-Z]{5,}/.test(cleanData)) {
    try {
      const numeros = cleanData.match(/\d{8,10}/g) || [];

      let cedula = numeros.find(n =>
        !n.startsWith('0') &&
        !n.startsWith('19') &&
        !n.startsWith('20')
      );

      if (!cedula) {
        cedula = numeros.find(n => /^[1-9]\d{7,9}$/.test(n) && !n.startsWith('19') && !n.startsWith('20'));
      }

      if (!cedula && numeros.length > 0) {
        cedula = numeros[numeros.length > 1 ? 1 : 0];
      }

      if (cedula) {
        const fechaMatch = cleanData.match(/(19[0-9]{2}|20[0-2][0-9])(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])/);
        let fechaNacimiento = "";
        if (fechaMatch) {
          fechaNacimiento = `${fechaMatch[1]}-${fechaMatch[2]}-${fechaMatch[3]}`;
        }

        const indexCedula = cleanData.indexOf(cedula);
        let nombresCompletos = "";
        if (indexCedula !== -1) {
          const despues = cleanData.substring(indexCedula + cedula.length);
          const match = despues.match(/^([A-ZÑ]+)/);
          if (match) {
            nombresCompletos = match[1];
          }
        }

        return {
          tipo: "CEDULA_COLOMBIANA",
          cedula: cedula,
          apellidos: nombresCompletos,
          nombres: "",
          nombresCompletos: nombresCompletos,
          fecha_nacimiento: fechaNacimiento,
        };
      }
    } catch (error) {
      console.error("Error en parsing alternativo:", error);
    }
  }

  const codigoLimpio = cleanData.replace(/[^a-zA-Z0-9]/g, "");

  if (/^\d{8,10}$/.test(codigoLimpio)) {
    return {
      tipo: "CEDULA_SIMPLE",
      cedula: codigoLimpio,
    };
  }

  if (codigoLimpio.length >= 4 && codigoLimpio.length <= 20) {
    return {
      tipo: "CODIGO_SIMPLE",
      codigo: codigoLimpio,
    };
  }

  return null;
};
// ============================================================================
// COMPONENTE:  ProveedorSelect
// ============================================================================
const ProveedorSelect = React.memo(
  ({ value, onChange, proveedores, placeholder = "Seleccionar proveedor" }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    const filteredProveedores = useMemo(() => {
      if (! searchTerm.trim()) return proveedores.slice(0, 50);
      const term = searchTerm.toLowerCase();
      return proveedores
        .filter(
          (p) =>
            p.establecimiento?.toLowerCase().includes(term) ||
            p.codigo?.toLowerCase().includes(term)
        )
        .slice(0, 100);
    }, [proveedores, searchTerm]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = useCallback(
      (proveedor) => {
        onChange(proveedor);
        setIsOpen(false);
        setSearchTerm("");
      },
      [onChange]
    );

    const selectedProveedor = useMemo(
      () =>proveedores.find((p) => p.codigo === value),
      [proveedores, value]
    );

    return (
      <div className={styles.customSelect} ref={selectRef}>
        <div
          className={styles.selectTrigger}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className={styles.selectValue}>
            {selectedProveedor ? (
              <>
                {selectedProveedor.establecimiento}
                <span className={styles.proveedorCodigo}>
                  {selectedProveedor.codigo}
                </span>
              </>
            ) : (
              <span className={styles.placeholder}>{placeholder}</span>
            )}
          </div>
          <div className={styles.selectArrow}>▼</div>
        </div>

        {isOpen && (
          <div className={styles.selectDropdown}>
            <div className={styles.searchContainer}>
              <FontAwesomeIcon
                icon={faSearch}
                className={styles.searchIconProveedor}
              />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Buscar proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.selectOptions}>
              {filteredProveedores.length > 0 ?  (
                filteredProveedores.map((proveedor) => (
                  <div
                    key={proveedor.codigo}
                    className={`${styles.selectOption} ${
                      value === proveedor.codigo ?  styles.selected : ""
                    }`}
                    onClick={() => handleSelect(proveedor)}
                  >
                    <div className={styles.optionMain}>
                      {proveedor.establecimiento}
                    </div>
                    <div className={styles.optionSub}>
                      Código: {proveedor.codigo}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>
                  No se encontraron proveedores
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

// ============================================================================
// COMPONENTE: FloatingInput
// ============================================================================
const FloatingInput = React.memo(
  ({
    label,
    type = "text",
    name,
    value,
    onChange,
    required = false,
    placeholder = "",
    maxLength,
    icon,
    ...props
  }) => {
    const inputRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);

    const hasValue = value && value.toString().trim() !== "";

    return (
      <div className={`${styles.formGroup} ${styles.floating}`}>
        {icon && <FontAwesomeIcon icon={icon} className={styles.inputIcon} />}
        <input
          ref={inputRef}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={styles.formInput}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        <label
          className={`${styles.formLabel} ${
            hasValue || isFocused ?  styles.labelFloating : ""
          }`}
        >
          {label}
          {required && <span className={styles.required}> *</span>}
        </label>
      </div>
    );
  }
);

// ============================================================================
// COMPONENTE: FloatingSelect
// ============================================================================
const FloatingSelect = React.memo(
  ({
    label,
    name,
    value,
    onChange,
    required = false,
    options,
    placeholderOption = "",
    icon,
    ...props
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && value.toString().trim() !== "";

    return (
      <div className={`${styles.formGroup} ${styles.floating}`}>
        {icon && <FontAwesomeIcon icon={icon} className={styles.inputIcon} />}
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={styles.formSelect}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        >
          <option value="">{placeholderOption}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label
          className={`${styles.formLabel} ${
            hasValue || isFocused ? styles.labelFloating : ""
          }`}
        >
          {label}
          {required && <span className={styles.required}> *</span>}
        </label>
      </div>
    );
  }
);

// ============================================================================
// COMPONENTE:  FloatingTextarea
// ============================================================================
const FloatingTextarea = React.memo(
  ({
    label,
    name,
    value,
    onChange,
    required = false,
    rows = 3,
    icon,
    ...props
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && value.toString().trim() !== "";

    return (
      <div className={`${styles.formGroup} ${styles.floating}`}>
        {icon && <FontAwesomeIcon icon={icon} className={styles.inputIcon} />}
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          className={styles.formTextarea}
          required={required}
          rows={rows}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        <label
          className={`${styles.formLabel} ${
            hasValue || isFocused ? styles.labelFloating : ""
          }`}
        >
          {label}
          {required && <span className={styles.required}> *</span>}
        </label>
      </div>
    );
  }
);

// ============================================================================
// COMPONENTE: ScannerModal (CORREGIDO)
// ============================================================================
const ScannerModal = ({ isOpen, onClose, onScan }) => {
  const scannerRef = useRef(null);
  const physicalInputRef = useRef(null);

  const [error, setError] = useState("");
  const [scanner, setScanner] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMode, setActiveMode] = useState("physical");

  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef(Date.now());
  const timeoutRef = useRef(null);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (isOpen && activeMode === "physical") {
      const focusTrap = () => physicalInputRef.current?.focus();
      const t1 = setTimeout(focusTrap, 100);
      const t2 = setTimeout(focusTrap, 500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isOpen, activeMode]);

  const limpiarBuffer = useCallback((data) => {
    if (!data) return "";
    // Elimina tokens como <F2>, <F5>, <CR>, <LF>, caracteres de control y deja imprimibles
    return data
      .replace(/<F\d+>/gi, "")
      .replace(/<CR>|<LF>|<GS>|<RS>|<US>/gi, "")
      .split("")
      .filter((ch) => {
        const code = ch.charCodeAt(0);
        return code >= 32 && code <= 126;
      })
      .join("");
  }, []);

  const procesarBuffer = useCallback(() => {
    const raw = bufferRef.current;
    bufferRef.current = "";
    const data = limpiarBuffer(raw);
    if (!data || data.length < 3) return;

    const resultado = parsearDatosEscaneados(data);
    if (resultado) {
      onScan(resultado);
    } else {
      onScan({ tipo: "CODIGO_SIMPLE", codigo: data });
    }
    onClose();
  }, [limpiarBuffer, onScan, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      const key = e.key;
      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Bloquea recarga y navegación
      if (
        key === "F5" ||
        (e.ctrlKey && key.toLowerCase() === "r") ||
        (e.metaKey && key.toLowerCase() === "r")
      ) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Cierra con Escape
      if (key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      // Ya no usamos F2/F3 para cambiar de modo (evita interferencia con scanners que envían <F2> en texto)
      // Solo procesar en modo físico
      if (activeMode !== "physical") return;

      // Enter = fin de escaneo
      if (key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        if (bufferRef.current.length > 0) procesarBuffer();
        return;
      }

      // Distinguir velocidad de escáner
      const isScannerSpeed = timeDiff < 50;
      if (!isScannerSpeed && bufferRef.current.length === 0) {
        return; // no interferir con escritura humana
      }

      // Carácter imprimible -> buffer
      if (key.length === 1) {
        e.preventDefault();
        e.stopPropagation();
        bufferRef.current += key;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (bufferRef.current.length > 3) {
            procesarBuffer();
          } else {
            bufferRef.current = "";
          }
        }, 250);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      bufferRef.current = "";
    };
  }, [isOpen, activeMode, procesarBuffer, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const stopKeys = (e) => {
      const key = e.key;
      if (
        key === "F5" ||
        (e.ctrlKey && key.toLowerCase() === "r") ||
        (e.metaKey && key.toLowerCase() === "r") ||
        key === "Enter" ||
        key === "Escape"
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    window.addEventListener("keyup", stopKeys, { capture: true });
    return () => window.removeEventListener("keyup", stopKeys, { capture: true });
  }, [isOpen]);

  const handleCameraScan = useCallback(
    (text) => {
      const resultado = parsearDatosEscaneados(limpiarBuffer(text));
      if (resultado) {
        onScan(resultado);
        onClose();
      }
    },
    [limpiarBuffer, onScan, onClose]
  );

  const initScanner = useCallback(() => {
    if (!scannerRef.current) return;
    try {
      if (scanner) {
        try {
          scanner.clear();
        } catch (e) {
          console.log("Error limpiando scanner anterior:", e);
        }
      }

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.PDF_417,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);

      const codeReader = new BrowserMultiFormatReader(hints);
      const videoElement = document.createElement("video");
      videoElement.style.width = "100%";
      videoElement.style.height = "100%";
      videoElement.style.objectFit = "cover";

      scannerRef.current.innerHTML = "";
      scannerRef.current.appendChild(videoElement);

      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: isMobile ? "environment" : "user" },
        })
        .then((stream) => {
          videoElement.srcObject = stream;
          videoElement.play();

          codeReader.decodeFromStream(stream, videoElement, (result) => {
            if (result) {
              handleCameraScan(result.getText());
            }
          });

          setScanner({
            clear: () => {
              try {
                stream.getTracks().forEach((t) => t.stop());
                codeReader.reset();
              } catch (e) {
                console.log("Error deteniendo stream:", e);
              }
            },
          });
        })
        .catch((err) => {
          console.error("Error accediendo a cámara:", err);
          setError("No se pudo acceder a la cámara. Verifique permisos.");
        });
    } catch (err) {
      console.error("Error inicializando scanner:", err);
      setError("Error inicializando librería de escáner.");
    }
  }, [scanner, isMobile, handleCameraScan]);

  const stopScanner = useCallback(() => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
  }, [scanner]);

  useEffect(() => {
    if (isOpen && activeMode === "camera") {
      const timer = setTimeout(initScanner, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    }
    return () => stopScanner();
  }, [isOpen, activeMode, initScanner, stopScanner]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Escanear Código de Barras</h2>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.scannerTabs}>
          <button
            type="button"
            className={`${styles.scannerTab} ${
              activeMode === "camera" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveMode("camera")}
          >
            <FontAwesomeIcon icon={faCamera} /> Cámara
          </button>
          <button
            type="button"
            className={`${styles.scannerTab} ${
              activeMode === "physical" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveMode("physical")}
          >
            <FontAwesomeIcon icon={faBarcode} /> Escáner Físico
          </button>
        </div>

        <div className={styles.scannerContainer}>
          {error ? (
            <div className={styles.scannerError}>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  if (activeMode === "camera") initScanner();
                }}
                className={styles.retryButton}
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              {activeMode === "camera" ? (
                <>
                  <div
                    ref={scannerRef}
                    className={styles.qrReader}
                    style={{ minHeight: "300px", background: "#000" }}
                  />
                  <div className={styles.scannerOverlay}>
                    <p className={styles.scannerHint}>Enfoca el código</p>
                  </div>
                </>
              ) : (
                <div
                  className={styles.physicalScannerContainer}
                  onClick={() => physicalInputRef.current?.focus()}
                  style={{ cursor: "text" }}
                >
                  <div className={styles.physicalScannerIcon}>
                    <FontAwesomeIcon icon={faBarcode} size="6x" />
                  </div>
                  <h3>Modo Escáner Físico</h3>
                  <p className={styles.physicalScannerInstructions}>
                    <span style={{ color: "#22c55e", fontWeight: "bold" }}>
                      LISTO PARA ESCANEAR
                    </span>
                    <br />
                    No es necesario hacer clic, solo usa el lector.
                  </p>

                  {/* INPUT TRAMPA */}
                  <input
                    ref={physicalInputRef}
                    type="text"
                    autoComplete="off"
                    style={{
                      position: "absolute",
                      left: "-9999px",
                      opacity: 0,
                    }}
                    onBlur={() => physicalInputRef.current?.focus()}
                  />

                  <div className={styles.scannerStatus}>
                    <small>Detectando entrada de teclado...</small>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.modalActions}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};



// ============================================================================
// COMPONENTE: PhotoModal
// ============================================================================
const PhotoModal = React.memo(({ isOpen, onClose, onPhotoTaken }) => {
  const webcamRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
  }, []);

  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    setPhoto(imageSrc);
  }, []);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const savePhoto = useCallback(() => {
    if (photo) {
      onPhotoTaken(photo);
      onClose();
    }
  }, [photo, onPhotoTaken, onClose]);

  // Limpiar al cerrar
  useEffect(() => {
    if (! isOpen) {
      setPhoto(null);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Tomar Foto del Visitante</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.photoContainer}>
          {photo ? (
            <div className={styles.photoPreview}>
              <img
                src={photo}
                alt="Foto del visitante"
                className={styles.photoImage}
              />
              <div className={styles.photoActions}>
                <button
                  onClick={() => setPhoto(null)}
                  className={styles.retryButton}
                >
                  Tomar Otra Foto
                </button>
                <button onClick={savePhoto} className={styles.saveButton}>
                  Usar Esta Foto
                </button>
              </div>
            </div>
          ) : (
            <>
              {error ?  (
                <div className={styles.photoError}>
                  <p>{error}</p>
                  <input
                    type="file"
                    accept="image/*"
                    capture={isMobile ? "camera" : undefined}
                    onChange={handleFileUpload}
                    className={styles.fileInput}
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className={styles.uploadLabel}>
                    <FontAwesomeIcon icon={faCamera} /> Seleccionar Foto
                  </label>
                </div>
              ) : (
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: isMobile ? "environment" : "user",
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                  }}
                  className={styles.webcam}
                  onUserMediaError={() =>
                    setError("No se pudo acceder a la cámara")
                  }
                />
              )}
            </>
          )}
        </div>

        {! photo && ! error && (
          <div className={styles.modalActions}>
            <button onClick={onClose} className={styles.cancelButton}>
              Cancelar
            </button>
            <button onClick={capturePhoto} className={styles.captureButton}>
              <FontAwesomeIcon icon={faCamera} /> Tomar Foto
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

// ============================================================================
// COMPONENTE PRINCIPAL: GestionVisitantes
// ============================================================================
const GestionVisitantes = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentos, setDocumentos] = useState({
    foto_cedula: null,
    foto_escarapela: null,
  });
  const { addNotification } = useNotification();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("registro");

  const [showScanner, setShowScanner] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const [cedulaInput, setCedulaInput] = useState("");
  const [visitanteEncontrado, setVisitanteEncontrado] = useState(null);
  const [buscandoVisitante, setBuscandoVisitante] = useState(false);

  const [formData, setFormData] = useState({
    cedula: "",
    nombres: "",
    apellidos: "",
    fecha_nacimiento: "",
    telefono: "",
    email: "",
    arl_vigente: false,
    fecha_arl_vigencia: "",
    archivo_arl: "",
    empresa_actual_codigo: "",
    empresa_actual_nombre:  "",
    foto:  "",
  });

  const [visitaData, setVisitaData] = useState({
    sede_id: "",
    empresa_entrega_id: "",
    empresa_entrega_codigo: "",
    motivo_visita: "Entrega de mercancía",
    observaciones: "",
  });

  const [proveedores, setProveedores] = useState([]);
  const [sedes, setSedes] = useState([]);

  const [pagination, setPagination] = useState({
    pagina: 1,
    por_pagina: 20,
    total: 0,
    total_paginas: 1,
  });

  const proveedoresMemo = useMemo(() => proveedores, [proveedores]);
  const sedesMemo = useMemo(() => sedes, [sedes]);

  // Prevenir Enter en formularios
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Cargar datos iniciales
  const cargarDatosIniciales = useCallback(async () => {
    setLoading(true);
    try {
      const [proveedoresRes, sedesRes] = await Promise.all([
        apiService.getProveedores2(),
        apiService.getSedes(),
      ]);

      const uniqueProveedores = Array.from(
        new Map(proveedoresRes.map((p) => [p.codigo, p])).values()
      );

      setProveedores(uniqueProveedores || []);
      setSedes(sedesRes || []);
    } catch (error) {
      addNotification({
        message: "Error cargando datos iniciales:  " + error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    cargarDatosIniciales();
  }, [cargarDatosIniciales]);

  // Buscar visitante por cédula
  const buscarVisitantePorCedula = useCallback(
    async (cedula) => {
      if (!cedula || cedula.length < 5) {
        addNotification({
          message:  "Ingrese una cédula válida",
          type: "warning",
        });
        return;
      }

      setBuscandoVisitante(true);
      try {
        const response = await apiService.getVisitante(cedula);

        if (response.data) {
          setVisitanteEncontrado(response.data);
          setFormData({
            cedula: response.data.cedula,
            nombres:  response.data.nombres,
            apellidos: response.data.apellidos,
            fecha_nacimiento:  response.data.fecha_nacimiento || "",
            telefono: response.data.telefono || "",
            email:  response.data.email || "",
            arl_vigente:  response.data.arl_vigente || false,
            fecha_arl_vigencia: response.data.fecha_arl_vigencia || "",
            archivo_arl: response.data.archivo_arl || "",
            empresa_actual_codigo:  response.data.empresa_actual_codigo || "",
            empresa_actual_nombre: response.data.empresa_actual_nombre || "",
            foto: response.data.foto || "",
          });

          addNotification({
            message: `Visitante encontrado: ${response.data.nombres} ${response.data.apellidos}`,
            type: "success",
          });
        } else {
          setVisitanteEncontrado(null);
          setFormData((prev) => ({
            ...prev,
            cedula: cedula,
            nombres: "",
            apellidos: "",
            fecha_nacimiento:  "",
            telefono: "",
            email: "",
            arl_vigente:  false,
            fecha_arl_vigencia: "",
            archivo_arl:  "",
            empresa_actual_codigo: "",
            empresa_actual_nombre: "",
            foto: "",
          }));

          addNotification({
            message: "Visitante no encontrado.  Puede registrarlo.",
            type: "info",
          });
        }
      } catch (error) {
        addNotification({
          message:  "Error buscando visitante:  " + error.message,
          type:  "error",
        });
      } finally {
        setBuscandoVisitante(false);
      }
    },
    [addNotification]
  );

  // Debounce para búsqueda automática
  const debouncedBuscarVisitante = useMemo(
    () =>
      debounce((value) => {
        if (value.length === 10) {
          buscarVisitantePorCedula(value);
        }
      }, 500),
    [buscarVisitantePorCedula]
  );

  // Limpiar debounce al desmontar
  useEffect(() => {
    return () => {
      debouncedBuscarVisitante.cancel();
    };
  }, [debouncedBuscarVisitante]);

  const handleCedulaChange = useCallback(
    (e) => {
      const value = e.target.value.replace(/\D/g, "");
      setCedulaInput(value);

      setFormData((prev) => ({
        ...prev,
        cedula: value,
      }));

      if (value.length === 0) {
        setVisitanteEncontrado(null);
        setFormData({
          cedula:  "",
          nombres:  "",
          apellidos: "",
          fecha_nacimiento: "",
          telefono:  "",
          email:  "",
          arl_vigente: false,
          fecha_arl_vigencia: "",
          archivo_arl: "",
          empresa_actual_codigo: "",
          empresa_actual_nombre: "",
          foto: "",
        });
      } else if (value.length === 10) {
        debouncedBuscarVisitante(value);
      }
    },
    [debouncedBuscarVisitante]
  );

  // Mejorar imagen para OCR
  const mejorarImagenParaOCR = useCallback((imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Escalar 2x para mejor resolución
        const scale = 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Dibujar imagen escalada
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Obtener datos de imagen para procesamiento
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convertir a escala de grises y aumentar contraste
        for (let i = 0; i < data.length; i += 4) {
          const gray =
            data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;

          const threshold = 128;
          const contrast = 1.5;
          let newValue = (gray - threshold) * contrast + threshold;
          newValue = Math.max(0, Math.min(255, newValue));

          data[i] = newValue;
          data[i + 1] = newValue;
          data[i + 2] = newValue;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = () => resolve(imageSrc);
    });
  }, []);

  // Procesar documento con OCR
  const procesarDocumentoInteligente = useCallback(
    async (file) => {
      setIsProcessing(true);
      addNotification({ message:  "Procesando documento.. .", type: "info" });

      let imageUrl = null;

      try {
        imageUrl = URL.createObjectURL(file);

        // --- INTENTO 1: Código de Barras PDF417 ---
        try {
          const hints = new Map();
          hints.set(DecodeHintType.POSSIBLE_FORMATS, [
            BarcodeFormat.PDF_417,
            BarcodeFormat.CODE_128,
            BarcodeFormat.CODE_39,
          ]);
          hints.set(DecodeHintType.TRY_HARDER, true);

          const codeReader = new BrowserMultiFormatReader(hints);
          const result = await codeReader.decodeFromImageUrl(imageUrl);

          if (result) {
            const datos = parsearDatosEscaneados(result.getText());

            if (datos && datos.cedula) {
              setCedulaInput(datos.cedula);

              if (datos.tipo === "CEDULA_COLOMBIANA") {
                setFormData((prev) => ({
                  ...prev,
                  cedula: datos.cedula,
                  nombres: datos.nombres || "",
                  apellidos: datos.apellidos || datos.nombresCompletos || "",
                  fecha_nacimiento:  datos.fecha_nacimiento || "",
                }));
                addNotification({
                  message: "Datos extraídos del código.  Por favor verifique.",
                  type:  "success",
                });
              } else {
                buscarVisitantePorCedula(datos.cedula);
              }

              setIsProcessing(false);
              URL.revokeObjectURL(imageUrl);
              return;
            }
          }
        } catch (e) {
          console.log(
            "Código de barras no detectado, intentando OCR.. .",
            e.message
          );
        }

        // --- INTENTO 2: OCR con Tesseract ---
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = async (e) => {
          try {
            const base64Original = e.target.result;
            const imagenMejorada = await mejorarImagenParaOCR(base64Original);

            const {
              data: { text },
            } = await Tesseract.recognize(imagenMejorada, "spa", {
              logger: (m) => console.log("Tesseract:", m.status),
            });

            console.log("Texto OCR detectado:", text);

            // Buscar cédula:  8-10 dígitos, excluyendo celulares
            const regexCedula = /\b(?!3\d{9})\d{8,10}\b/g;
            const matches = text.match(regexCedula);

            if (matches && matches.length > 0) {
              // Filtrar fechas
              const cedulaProbable =
                matches.find(
                  (m) => !m.startsWith("19") && !m.startsWith("20")
                ) || matches[0];

              setCedulaInput(cedulaProbable);
              setFormData((prev) => ({ ...prev, cedula: cedulaProbable }));
              buscarVisitantePorCedula(cedulaProbable);
              addNotification({
                message: `Cédula detectada por OCR: ${cedulaProbable}`,
                type: "success",
              });
            } else {
              addNotification({
                message: 
                  "No se pudo leer automáticamente.  Ingrese manualmente.",
                type: "warning",
              });
            }
          } catch (ocrError) {
            console.error("Error en OCR:", ocrError);
            addNotification({ message: "Error en OCR", type: "error" });
          }

          setIsProcessing(false);
          if (imageUrl) URL.revokeObjectURL(imageUrl);
        };

        reader.onerror = () => {
          setIsProcessing(false);
          addNotification({ message: "Error leyendo archivo", type: "error" });
          if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
      } catch (error) {
        console.error("Error procesando documento:", error);
        addNotification({
          message:  "Error procesando la imagen",
          type: "error",
        });
        setIsProcessing(false);
        if (imageUrl) URL.revokeObjectURL(imageUrl);
      }
    },
    [addNotification, buscarVisitantePorCedula, mejorarImagenParaOCR]
  );

  const handleFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ... prev,
      [name]: type === "checkbox" ? checked :  value,
    }));
  }, []);

  const handleVisitaChange = useCallback((e) => {
    const { name, value } = e.target;
    setVisitaData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleProveedorSelect = useCallback((proveedor) => {
    setFormData((prev) => ({
      ...prev,
      empresa_actual_codigo: proveedor.codigo,
      empresa_actual_nombre: proveedor.establecimiento,

    }));
  }, []);

  const handleProveedorVisitaSelect = useCallback((proveedor) => {
    setVisitaData((prev) => ({
      ...prev,
      empresa_entrega_id: proveedor.codigo,
      empresa_entrega_codigo: proveedor.codigo,
    }));
  }, []);

  const handleFileSelect = useCallback(
    (e, tipoDocumento) => {
      const file = e.target.files[0];
      if (! file) return;

      const previewUrl = URL.createObjectURL(file);

      setDocumentos((prev) => ({
        ... prev,
        [tipoDocumento]:  previewUrl,
      }));

      // Si subieron la cédula, intentar leerla
      if (tipoDocumento === "foto_cedula") {
        procesarDocumentoInteligente(file);
      }
    },
    [procesarDocumentoInteligente]
  );

  const guardarVisitante = useCallback(async () => {
    if (! formData.cedula || !formData.nombres || ! formData.apellidos) {
      addNotification({
        message: "Cédula, nombres y apellidos son requeridos",
        type: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const datosParaEnviar = {
        cedula: formData.cedula,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        telefono: formData.telefono || null,
        email: formData.email || null,
        arl_vigente: formData.arl_vigente || false,
        fecha_arl_vigencia: formData.fecha_arl_vigencia || null,
        archivo_arl: formData.archivo_arl || null,
        empresa_actual_codigo: formData.empresa_actual_codigo || null,
        empresa_actual_nombre: formData.empresa_actual_nombre || null,
        foto: formData.foto || null,
      };

      if (visitanteEncontrado) {
        await apiService.updateVisitante(
          visitanteEncontrado.id,
          datosParaEnviar
        );
        addNotification({
          message: "Visitante actualizado exitosamente",
          type: "success",
        });
      } else {
        await apiService. createVisitante(datosParaEnviar);
        addNotification({
          message: "Visitante registrado exitosamente",
          type: "success",
        });
      }

      // Limpiar formulario
      setCedulaInput("");
      setVisitanteEncontrado(null);
      setFormData({
        cedula:  "",
        nombres:  "",
        apellidos: "",
        fecha_nacimiento: "",
        telefono:  "",
        email:  "",
        arl_vigente: false,
        fecha_arl_vigencia: "",
        archivo_arl: "",
        empresa_actual_codigo: "",
        empresa_actual_nombre: "",
        foto: "",
      });
      setDocumentos({ foto_cedula:  null, foto_escarapela: null });
    } catch (error) {
      addNotification({
        message: "Error guardando visitante: " + error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [formData, visitanteEncontrado, addNotification]);

  // Handler para escaneo de código de barras
  const handleBarcodeScan = useCallback(
    async (datosEscaneados) => {
      let datos = datosEscaneados;

      // Si es string crudo, parsearlo
      if (typeof datosEscaneados === "string") {
        datos = parsearDatosEscaneados(datosEscaneados);
        if (! datos) {
          datos = { tipo: "CODIGO_SIMPLE", codigo: datosEscaneados };
        }
      }

      if (! datos || (! datos.cedula && !datos.codigo)) return;

      const cedulaABuscar = datos.cedula || datos.codigo;

      setCedulaInput(cedulaABuscar);
      setBuscandoVisitante(true);
      addNotification({ message: "Procesando código.. .", type: "info" });

      try {
        const response = await apiService.getVisitante(cedulaABuscar);

        if (response.data) {
          // Visitante existe
          setVisitanteEncontrado(response.data);
          setFormData({
            cedula:  response.data.cedula,
            nombres: response.data.nombres,
            apellidos:  response.data.apellidos,
            fecha_nacimiento: response.data.fecha_nacimiento || "",
            telefono:  response.data.telefono || "",
            email: response.data.email || "",
            arl_vigente: response.data.arl_vigente || false,
            fecha_arl_vigencia: response.data.fecha_arl_vigencia || "",
            archivo_arl: response.data.archivo_arl || "",
            empresa_actual_codigo: response.data.empresa_actual_codigo || "",
            empresa_actual_nombre: response.data.empresa_actual_nombre || "",
            foto: response.data.foto || "",
          });
          addNotification({
            message: "Visitante encontrado.  Puede registrar la visita.",
            type: "success",
          });
        } else {
          // Visitante nuevo
          setVisitanteEncontrado(null);

          if (
            datos.tipo === "CEDULA_COLOMBIANA" ||
            datos.tipo === "CEDULA_DIGITAL"
          ) {
            setFormData({
              cedula:  cedulaABuscar,
              nombres: datos.nombres || "",
              apellidos: datos.apellidos || datos.nombresCompletos || "",
              fecha_nacimiento: datos.fecha_nacimiento || "",
              telefono:  "",
              email: "",
              arl_vigente: false,
              fecha_arl_vigencia:  "",
              archivo_arl: "",
              empresa_actual_codigo: "",
              empresa_actual_nombre: "",
              foto: "",
            });

            addNotification({
              message: 
                "Visitante nuevo.  Datos extraídos de la cédula.  Por favor verifique y complete.",
              type: "warning",
            });
          } else {
            setFormData((prev) => ({
              ...prev,
              cedula: cedulaABuscar,
              nombres: "",
              apellidos:  "",
            }));
            addNotification({
              message: "Código registrado.  Complete los datos del visitante.",
              type: "info",
            });
          }
        }
      } catch (error) {
        console.error("Error buscando visitante", error);
        addNotification({ message:  "Error en la búsqueda", type: "error" });
      } finally {
        setBuscandoVisitante(false);
      }
    },
    [addNotification]
  );

  const handlePhotoTaken = useCallback(
    (photoData) => {
      setFormData((prev) => ({
        ...prev,
        foto:  photoData,
      }));
      addNotification({
        message: "Foto guardada exitosamente",
        type: "success",
      });
    },
    [addNotification]
  );

  const limpiarFormulario = useCallback(() => {
    setCedulaInput("");
    setVisitanteEncontrado(null);
    setFormData({
      cedula: "",
      nombres: "",
      apellidos: "",
      fecha_nacimiento: "",
      telefono: "",
      email: "",
      arl_vigente: false,
      fecha_arl_vigencia: "",
      archivo_arl: "",
      empresa_actual_codigo:  "",
      empresa_actual_nombre: "",
      foto: "",
    });
    setDocumentos({ foto_cedula:  null, foto_escarapela: null });
  }, []);

  const estadosVisitas = useMemo(
    () => [
      {
        value: "en_espera",
        label: "En espera",
        icon: faClock,
        color: "#f59e0b",
      },
      {
        value: "en_operacion",
        label: "En operación",
        icon:  faTruckLoading,
        color: "#3b82f6",
      },
      {
        value: "terminado",
        label: "Terminado",
        icon:  faCheckCircle,
        color: "#10b981",
      },
      {
        value:  "cancelado",
        label: "Cancelado",
        icon: faSignOutAlt,
        color: "#ef4444",
      },
    ],
    []
  );

  if (loading && activeTab === "registro") {
    return <LoadingScreen message="Cargando..." />;
  }

  return (
    <div className={styles.container}>
      <ScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleBarcodeScan}
      />

      <PhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onPhotoTaken={handlePhotoTaken}
      />

      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Gestión de Visitantes</h1>
          <p className={styles.subtitle}>
            Registro y control de visitantes proveedores
          </p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "registro" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("registro")}
        >
          <FontAwesomeIcon icon={faIdCard} />
          Registro/Consulta
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "visitas" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("visitas")}
        >
          <FontAwesomeIcon icon={faHistory} />
          Historial Visitas
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "consulta" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("consulta")}
        >
          <FontAwesomeIcon icon={faSearch} />
          Consulta Visitantes
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "registro" && (
          <div className={styles.registroContainer}>
            <div className={styles.busquedaSection}>
              <div className={styles.searchBox}>
                <FontAwesomeIcon
                  icon={faSearch}
                  className={styles.searchIcon}
                />
                <input
                  type="text"
                  className={styles.searchInput}
                  value={cedulaInput}
                  onChange={handleCedulaChange}
                  placeholder="Escanear o ingresar cédula (10 dígitos)"
                  maxLength={10}
                />
                <button
                  className={styles.scanButton}
                  onClick={() => setShowScanner(true)}
                >
                  <FontAwesomeIcon icon={faQrcode} />
                  Escanear
                </button>
                <button
                  className={styles.cameraButton}
                  onClick={() => setShowPhotoModal(true)}
                >
                  <FontAwesomeIcon icon={faCamera} />
                  Foto
                </button>
              </div>

              {buscandoVisitante && (
                <div className={styles.loadingMessage}>
                  Buscando visitante...
                </div>
              )}
            </div>

            {visitanteEncontrado && (
              <div className={styles.visitanteInfo}>
                <div className={styles.infoHeader}>
                  <h3>Visitante Encontrado</h3>
                  <span
                    className={`${styles.estadoBadge} ${
                      visitanteEncontrado.arl_vigente
                        ? styles.arlVigente
                        : styles.arlNoVigente
                    }`}
                  >
                    ARL:{" "}
                    {visitanteEncontrado.arl_vigente ?  "VIGENTE" : "NO VIGENTE"}
                  </span>
                </div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Cédula:</label>
                    <strong>{visitanteEncontrado.cedula}</strong>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Nombre:</label>
                    <strong>
                      {visitanteEncontrado.nombres}{" "}
                      {visitanteEncontrado.apellidos}
                    </strong>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Empresa:</label>
                    <span>
                      {visitanteEncontrado.empresa_actual_nombre ||
                        "No asignada"}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Última visita:</label>
                    <span>
                      {visitanteEncontrado.ultima_visita
                        ? new Date(
                            visitanteEncontrado.ultima_visita
                          ).toLocaleDateString("es-CO")
                        : "Nunca"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.formSection}>
              <h3>
                {visitanteEncontrado
                  ? "Actualizar Datos"
                  :  "Registrar Nuevo Visitante"}
              </h3>

              <div className={styles.formGrid}>
                <FloatingInput
                  label="Cédula"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleFormChange}
                  required={true}
                  maxLength={10}
                  icon={faIdCard}
                />

                <FloatingInput
                  label="Nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleFormChange}
                  required={true}
                  icon={faIdCard}
                />

                <FloatingInput
                  label="Apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleFormChange}
                  required={true}
                  icon={faIdCard}
                />

                <FloatingInput
                  label="Teléfono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleFormChange}
                  icon={faPhone}
                />

                <FloatingInput
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  icon={faEnvelope}
                />

                <FloatingInput
                  label="Fecha de Nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={handleFormChange}
                  icon={faCalendar}
                />

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Proveedor/Empleador
                  </label>
                  <ProveedorSelect
                    value={formData.empresa_actual_codigo}
                    onChange={handleProveedorSelect}
                    proveedores={proveedoresMemo}
                    placeholder="Buscar proveedor..."
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="arl_vigente"
                      checked={formData.arl_vigente}
                      onChange={handleFormChange}
                    />
                    <span>ARL Vigente</span>
                  </label>
                </div>

                {formData.arl_vigente && (
                  <>
                    <FloatingInput
                      label="Fecha Vigencia ARL"
                      name="fecha_arl_vigencia"
                      type="date"
                      value={formData. fecha_arl_vigencia}
                      onChange={handleFormChange}
                    />
                    <FloatingInput
                      label="URL Archivo ARL"
                      name="archivo_arl"
                      value={formData.archivo_arl}
                      onChange={handleFormChange}
                    />
                  </>
                )}
              </div>

              {/* Sección de documentos */}
              <div style={{ marginTop: "20px", padding: "0 10px" }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Foto Cédula (Lectura Automática)
                    {isProcessing && (
                      <span style={{ marginLeft: 10, color: "blue" }}>
                        Procesando...{" "}
                        <FontAwesomeIcon icon={faSyncAlt} spin />
                      </span>
                    )}
                  </label>
                  <div className={styles.uploadContainer}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, "foto_cedula")}
                      id="upload-cedula"
                      className={styles.fileInput}
                      disabled={isProcessing}
                    />
                    <label
                      htmlFor="upload-cedula"
                      className={`${styles.uploadLabel} ${
                        documentos.foto_cedula ? styles.fileUploaded : ""
                      }`}
                    >
                      <FontAwesomeIcon icon={faUpload} />
                      {documentos.foto_cedula
                        ? "Cambiar Imagen"
                        :  "Subir Cédula (Frente o Reverso)"}
                    </label>
                  </div>
                  {documentos.foto_cedula && (
                    <div style={{ marginTop: 5 }}>
                      <img
                        src={documentos.foto_cedula}
                        alt="Preview"
                        style={{ height: 60, borderRadius: 4 }}
                      />
                    </div>
                  )}
                                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Foto Escarapela / Carnet
                  </label>
                  <div className={styles.uploadContainer}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, "foto_escarapela")}
                      id="upload-escarapela"
                      className={styles.fileInput}
                    />
                    <label
                      htmlFor="upload-escarapela"
                      className={`${styles.uploadLabel} ${
                        documentos.foto_escarapela ?  styles.fileUploaded : ""
                      }`}
                    >
                      <FontAwesomeIcon icon={faIdCard} />
                      {documentos. foto_escarapela
                        ?  "Cambiar Escarapela"
                        : "Subir Escarapela"}
                    </label>
                  </div>
                  {documentos.foto_escarapela && (
                    <div style={{ marginTop: 5 }}>
                      <img
                        src={documentos.foto_escarapela}
                        alt="Preview Escarapela"
                        style={{ height: 60, borderRadius: 4 }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  className={styles.saveButton}
                  onClick={guardarVisitante}
                  disabled={loading}
                >
                  {loading ?  (
                    <>
                      <FontAwesomeIcon icon={faSyncAlt} spin /> Guardando...
                    </>
                  ) : visitanteEncontrado ? (
                    "Actualizar Visitante"
                  ) : (
                    "Registrar Visitante"
                  )}
                </button>

                <button
                  className={styles. clearButton}
                  onClick={limpiarFormulario}
                  disabled={loading}
                >
                  Limpiar
                </button>
              </div>
            </div>

            {/* Sección de registro de visita */}
            {visitanteEncontrado && (
              <div className={styles.visitaSection}>
                <h3>Registrar Visita</h3>

                <div className={styles.visitaForm}>
                  <FloatingSelect
                    label="Sede"
                    name="sede_id"
                    value={visitaData.sede_id}
                    onChange={handleVisitaChange}
                    required={true}
                    options={sedesMemo.map((sede) => ({
                      value: sede. id,
                      label: sede.nombre,
                    }))}
                    placeholderOption="Seleccionar sede"
                    icon={faMapMarkerAlt}
                  />

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      Proveedor de entrega *
                    </label>
                    <ProveedorSelect
                      value={visitaData.empresa_entrega_id}
                      onChange={handleProveedorVisitaSelect}
                      proveedores={proveedoresMemo}
                      placeholder="Buscar proveedor de entrega..."
                    />
                  </div>

                  <FloatingTextarea
                    label="Motivo de visita"
                    name="motivo_visita"
                    value={visitaData.motivo_visita}
                    onChange={handleVisitaChange}
                    icon={faStickyNote}
                  />

                  <FloatingTextarea
                    label="Observaciones"
                    name="observaciones"
                    value={visitaData.observaciones}
                    onChange={handleVisitaChange}
                    rows={2}
                    icon={faStickyNote}
                  />

                  <button
                    className={styles.registrarVisitaButton}
                    onClick={async () => {
                      if (! visitanteEncontrado) {
                        addNotification({
                          message: 
                            "Primero debe buscar y seleccionar un visitante",
                          type: "warning",
                        });
                        return;
                      }

                      if (
                        !visitaData.sede_id ||
                        !visitaData.empresa_entrega_id
                      ) {
                        addNotification({
                          message:  "Sede y proveedor de entrega son requeridos",
                          type: "warning",
                        });
                        return;
                      }

                      setLoading(true);
                      try {
                        const visitaPayload = {
                          visitante_id: visitanteEncontrado.id,
                          sede_id: visitaData.sede_id,
                          usuario_id: user.id,
                          empresa_entrega_id: visitaData.empresa_entrega_id,
                          empresa_entrega_codigo: visitaData.empresa_entrega_codigo, // <---- Asegúrate de incluir esto
                          motivo_visita: visitaData.motivo_visita,
                          observaciones: visitaData.observaciones,
                      };
                        console.log("Visita Payload:", visitaPayload); // Verificar los datos antes de enviar
                        await apiService.createVisita(visitaPayload);
                        console.log("Empresa Entrega ID:", visitaData.empresa_entrega_id);
                        console.log("Proveedores disponibles:", proveedores);
                        await apiService.createVisita(visitaPayload);
                        console.log("Empresa Entrega ID:", visitaData.empresa_entrega_id);

                        addNotification({
                          message: 
                            "Visita registrada exitosamente.  Estado: En espera",
                          type:  "success",
                        });

                        setVisitaData({
                          sede_id: "",
                          empresa_entrega_id:  "",
                          motivo_visita:  "Entrega de mercancía",
                          observaciones: "",
                        });
                      } catch (error) {
                        addNotification({
                          message: "Error registrando visita:  " + error.message,
                          type: "error",
                        });
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={
                      loading ||
                      !visitaData.sede_id ||
                      ! visitaData.empresa_entrega_id
                    }
                  >
                    <FontAwesomeIcon icon={faUserPlus} />
                    Registrar Visita
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "visitas" && (
          <VisitasTab
            sedes={sedesMemo}
            proveedores={proveedoresMemo}
            estadosVisitas={estadosVisitas}
            user={user}
            addNotification={addNotification}
          />
        )}

        {activeTab === "consulta" && (
          <ConsultaTab
            proveedores={proveedoresMemo}
            setActiveTab={setActiveTab}
            buscarVisitantePorCedula={buscarVisitantePorCedula}
            addNotification={addNotification}
          />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE:  VisitasTab
// ============================================================================
const VisitasTab = React.memo(
  ({ sedes, proveedores, estadosVisitas, user, addNotification }) => {
    const [visitas, setVisitas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
      pagina: 1,
      por_pagina: 20,
      total: 0,
      total_paginas: 1,
    });
    const [filters, setFilters] = useState({
      search: "",
      sede_id: "",
      estado:  "",
      proveedor_id: "",
      fecha_desde: "",
      fecha_hasta: "",
    });

    const cargarVisitas = useCallback(
      async (page = 1) => {
        setLoading(true);
        try {
          const response = await apiService.getVisitas(
            page,
            pagination.por_pagina,
            filters
          );

          setVisitas(response.data || []);
          setPagination(response.pagination || pagination);
        } catch (error) {
          addNotification({
            message: "Error cargando visitas:  " + error.message,
            type:  "error",
          });
        } finally {
          setLoading(false);
        }
      },
      [filters, pagination. por_pagina, addNotification]
    );

    useEffect(() => {
      cargarVisitas();
    }, []);

    const handleFilterChange = useCallback((e) => {
      const { name, value } = e.target;
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }, []);

    const cambiarEstadoVisita = useCallback(
      async (visitaId, nuevoEstado, carnet = null) => {
        try {
          const payload = {
            id: visitaId,
            usuario_id: user. id,
            estado: nuevoEstado,
          };

          if (carnet && nuevoEstado === "en_operacion") {
            payload.carnet_asignado = carnet;
          }

          await apiService. updateVisita(visitaId, payload);

          addNotification({
            message: `Visita actualizada a:  ${nuevoEstado}`,
            type: "success",
          });

          cargarVisitas(pagination.pagina);
        } catch (error) {
          addNotification({
            message: "Error actualizando visita:  " + error.message,
            type:  "error",
          });
        }
      },
      [user.id, addNotification, cargarVisitas, pagination. pagina]
    );

    const formatearFecha = useCallback((fecha) => {
      if (! fecha) return "";
      return new Date(fecha).toLocaleString("es-CO");
    }, []);

    return (
      <div className={styles.visitasContainer}>
        <div className={styles.filtersSection}>
          <div className={styles.filterGrid}>
            <div className={`${styles.formGroup} ${styles. floating}`}>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className={styles.formInput}
                placeholder=" "
              />
              <label className={styles.formLabel}>
                Buscar (Cédula, nombre o carnet)
              </label>
            </div>

            <div className={`${styles.formGroup} ${styles.floating}`}>
              <select
                name="sede_id"
                value={filters.sede_id}
                onChange={handleFilterChange}
                className={styles.formSelect}
              >
                <option value="">Todas las sedes</option>
                {sedes.map((sede) => (
                  <option key={sede.id} value={sede.id}>
                    {sede.nombre}
                  </option>
                ))}
              </select>
              <label className={styles.formLabel}>Sede</label>
            </div>

            <div className={`${styles.formGroup} ${styles.floating}`}>
              <select
                name="estado"
                value={filters.estado}
                onChange={handleFilterChange}
                className={styles.formSelect}
              >
                <option value="">Todos los estados</option>
                {estadosVisitas.map((estado) => (
                  <option key={estado. value} value={estado. value}>
                    {estado.label}
                  </option>
                ))}
              </select>
              <label className={styles.formLabel}>Estado</label>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Proveedor</label>
              <ProveedorSelect
                value={filters.proveedor_id}
                onChange={(proveedor) => {
                  setFilters((prev) => ({
                    ... prev,
                    proveedor_id: proveedor?. codigo || "",
                  }));
                }}
                proveedores={proveedores}
                placeholder="Todos los proveedores"
              />
            </div>
          </div>

          <div className={styles.filterActions}>
            <button
              className={styles.filterButton}
              onClick={() => cargarVisitas(1)}
            >
              <FontAwesomeIcon icon={faFilter} />
              Aplicar Filtros
            </button>

            <button
              className={styles.refreshButton}
              onClick={() => cargarVisitas(pagination.pagina)}
            >
              <FontAwesomeIcon icon={faSyncAlt} />
              Actualizar
            </button>
          </div>
        </div>

        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.loadingMessage}>Cargando visitas...</div>
          ) : (
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Visitante</th>
                  <th>Cédula</th>
                  <th>Sede</th>
                  <th>Proveedor</th>
                  <th>Estado</th>
                  <th>Carnet</th>
                  <th>Ingreso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visitas.map((visita) => (
                  <tr key={visita.id}>
                    <td>{visita.id}</td>
                    <td>
                      <strong>
                        {visita.visitante_nombres} {visita.visitante_apellidos}
                      </strong>
                    </td>
                    <td>{visita.cedula}</td>
                    <td>{visita.sede_nombre}</td>
                    <td>{visita.proveedor_nombre}</td>
                    <td>
                      <span
                        className={styles.estadoBadge}
                        style={{
                          backgroundColor: 
                            estadosVisitas.find(
                              (e) => e.value === visita.estado
                            )?.color || "#6b7280",
                        }}
                      >
                        {estadosVisitas.find((e) => e.value === visita.estado)
                          ?.label || visita.estado}
                      </span>
                    </td>
                    <td>
                      {visita.carnet_asignado ? (
                        <span className={styles.carnetBadge}>
                          {visita.carnet_asignado}
                        </span>
                      ) : (
                        <span className={styles.carnetEmpty}>No asignado</span>
                      )}
                    </td>
                    <td>{formatearFecha(visita.fecha_hora_ingreso)}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        {visita.estado === "en_espera" && (
                          <button
                            className={styles.actionButton}
                            onClick={() => {
                              const carnet = prompt(
                                "Ingrese número de carnet:"
                              );
                              if (carnet) {
                                cambiarEstadoVisita(
                                  visita.id,
                                  "en_operacion",
                                  carnet
                                );
                              }
                            }}
                            title="Aprobar ingreso"
                          >
                            <FontAwesomeIcon icon={faCheckCircle} />
                          </button>
                        )}

                        {visita.estado === "en_operacion" && (
                          <button
                            className={styles.actionButton}
                            onClick={() =>
                              cambiarEstadoVisita(visita.id, "terminado")
                            }
                            title="Finalizar visita"
                          >
                            <FontAwesomeIcon icon={faSignOutAlt} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {visitas. length === 0 && ! loading && (
            <div className={styles.emptyState}>
              <p>No hay visitas registradas con los filtros actuales</p>
            </div>
          )}

          {pagination.total_paginas > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationButton}
                onClick={() => cargarVisitas(pagination.pagina - 1)}
                disabled={pagination.pagina === 1}
              >
                Anterior
              </button>

              <span className={styles.paginationInfo}>
                Página {pagination.pagina} de {pagination.total_paginas}
              </span>

              <button
                className={styles.paginationButton}
                onClick={() => cargarVisitas(pagination.pagina + 1)}
                disabled={pagination.pagina === pagination.total_paginas}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

// ============================================================================
// COMPONENTE: ConsultaTab
// ============================================================================
const ConsultaTab = React.memo(
  ({ proveedores, setActiveTab, buscarVisitantePorCedula, addNotification }) => {
    const [visitantes, setVisitantes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
      search: "",
    });

    const cargarVisitantes = useCallback(
      async (page = 1) => {
        setLoading(true);
        try {
          const response = await apiService.getVisitantes(
            page,
            20,
            filters. search
          );

          setVisitantes(response.data || []);
        } catch (error) {
          addNotification({
            message: "Error cargando visitantes: " + error.message,
            type: "error",
          });
        } finally {
          setLoading(false);
        }
      },
      [filters. search, addNotification]
    );

    useEffect(() => {
      cargarVisitantes();
    }, []);

    const handleFilterChange = useCallback((e) => {
      const { name, value } = e.target;
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }, []);

    const formatearFechaCorta = useCallback((fecha) => {
      if (!fecha) return "";
      return new Date(fecha).toLocaleDateString("es-CO");
    }, []);

    return (
      <div className={styles.consultaContainer}>
        <div className={styles.filtersSection}>
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className={styles. searchInput}
              placeholder="Buscar por cédula, nombre o empresa"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  cargarVisitantes(1);
                }
              }}
            />
            <button
              className={styles.scanButton}
              onClick={() => cargarVisitantes(1)}
            >
              Buscar
            </button>
          </div>
        </div>

        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.loadingMessage}>Cargando visitantes...</div>
          ) : (
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Cédula</th>
                  <th>Nombre Completo</th>
                  <th>Empresa Actual</th>
                  <th>ARL Vigente</th>
                  <th>Teléfono</th>
                  <th>Total Visitas</th>
                  <th>Última Visita</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visitantes.map((visitante) => (
                  <tr key={visitante.id}>
                    <td>{visitante. cedula}</td>
                    <td>
                      <strong>
                        {visitante.nombres} {visitante.apellidos}
                      </strong>
                    </td>
                    <td>{visitante.empresa_actual_nombre || "No asignada"}</td>
                    <td>
                      <span
                        className={`${styles.arlIndicator} ${
                          visitante.arl_vigente
                            ? styles.vigente
                            : styles.noVigente
                        }`}
                      >
                        {visitante.arl_vigente ? "SÍ" : "NO"}
                      </span>
                    </td>
                    <td>{visitante.telefono || "-"}</td>
                    <td>{visitante.total_visitas || 0}</td>
                    <td>
                      {formatearFechaCorta(visitante.ultima_visita) || "Nunca"}
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.actionButton}
                          onClick={() => {
                            setActiveTab("registro");
                            setTimeout(() => {
                              buscarVisitantePorCedula(visitante.cedula);
                            }, 100);
                          }}
                          title="Ver/Editar"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {visitantes.length === 0 && ! loading && (
            <div className={styles.emptyState}>
              <p>No hay visitantes registrados</p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default GestionVisitantes;0
