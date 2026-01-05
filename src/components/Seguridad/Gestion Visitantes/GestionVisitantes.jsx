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
  NotFoundException,
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
  faFileAlt,
  faFilter,
  faDownload,
  faQrcode,
  faCamera,
  faTimes,
  faUpload,
  faBarcode,
  faKeyboard,
  faCalendar,
  faPhone,
  faEnvelope,
  faBuilding,
  faMapMarkerAlt,
  faStickyNote,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./GestionVisitantes.module.css";
import debounce from "lodash/debounce";

const ProveedorSelect = React.memo(
  ({ value, onChange, proveedores, placeholder = "Seleccionar proveedor" }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    const filteredProveedores = useMemo(() => {
      if (!searchTerm.trim()) return proveedores.slice(0, 50);
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
      () => proveedores.find((p) => p.codigo === value),
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
              {filteredProveedores.length > 0 ? (
                filteredProveedores.map((proveedor) => (
                  <div
                    key={proveedor.codigo}
                    className={`${styles.selectOption} ${
                      value === proveedor.codigo ? styles.selected : ""
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

// Componente para inputs con label flotante
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

// Componente para select con label flotante
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

// Componente para textarea con label flotante
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

// Componente para el escáner de cámara
const ScannerModal = ({ isOpen, onClose, onScan }) => {
  const scannerRef = useRef(null);
  const physicalInputRef = useRef(null);
  const [error, setError] = useState("");
  const [scanner, setScanner] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMode, setActiveMode] = useState("physical");

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const extractCedulaFromBarcode = useCallback((barcodeData) => {
    if (!barcodeData || barcodeData.trim() === "") return null;

    const textoLimpio = barcodeData.trim();
    const patterns = [
      /\^(\d{8,10})\^/,
      /CEDULA\s*(\d{8,10})/i,
      /CC\s*(\d{8,10})/i,
      /(\d{8,10})/,
    ];

    for (const pattern of patterns) {
      const match = textoLimpio.match(pattern);
      if (match) {
        let cedula = match[1] || match[0];
        cedula = cedula.replace(/\D/g, "");

        if (cedula.length >= 8 && cedula.length <= 10) {
          if (cedula.length < 10) {
            cedula = cedula.padStart(10, "0");
          }
          return cedula;
        }
      }
    }

    if (textoLimpio.includes("^")) {
      const partes = textoLimpio.split("^");
      for (const parte of partes) {
        const numeros = parte.replace(/\D/g, "");
        if (numeros.length >= 8 && numeros.length <= 10) {
          return numeros.padStart(10, "0");
        }
      }
    }

    return null;
  }, []);

  const initScanner = useCallback(() => {
    if (!scannerRef.current) return;

    try {
      if (scanner) {
        scanner.clear();
      }

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.PDF_417,
        BarcodeFormat.CODE_128,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);

      const codeReader = new BrowserMultiFormatReader(hints);

      const videoElement = document.createElement("video");
      videoElement.style.width = "100%";
      videoElement.style.height = "100%";
      scannerRef.current.innerHTML = "";
      scannerRef.current.appendChild(videoElement);

      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: isMobile ? "environment" : "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
        .then((stream) => {
          videoElement.srcObject = stream;
          videoElement.play();

          let isDecoding = false;
          let lastDecodeTime = 0;
          const MIN_DECODE_INTERVAL = 500;

          const decode = () => {
            if (!videoElement.srcObject || isDecoding) return;

            const now = Date.now();
            if (now - lastDecodeTime < MIN_DECODE_INTERVAL) {
              requestAnimationFrame(decode);
              return;
            }

            isDecoding = true;
            lastDecodeTime = now;

            const canvas = document.createElement("canvas");
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            try {
              const luminanceSource = new RGBLuminanceSource(
                ctx.getImageData(0, 0, canvas.width, canvas.height).data,
                canvas.width,
                canvas.height
              );
              const binaryBitmap = new BinaryBitmap(
                new HybridBinarizer(luminanceSource)
              );
              const result = codeReader.decode(binaryBitmap, hints);

              if (result) {
                const cedula = extractCedulaFromBarcode(result.getText());
                if (cedula) {
                  stopScanner();
                  onScan(cedula);
                  onClose();
                }
              }
            } catch (err) {
              if (!(err instanceof NotFoundException)) {
                console.log("Error decodificando:", err);
              }
            } finally {
              isDecoding = false;
              requestAnimationFrame(decode);
            }
          };

          videoElement.onplaying = () => {
            setTimeout(decode, 1000);
          };

          setScanner({
            clear: () => {
              if (videoElement.srcObject) {
                videoElement.srcObject
                  .getTracks()
                  .forEach((track) => track.stop());
              }
              scannerRef.current.innerHTML = "";
            },
          });
        })
        .catch((err) => {
          console.error("Error accediendo a la cámara:", err);
          setError(
            "No se pudo acceder a la cámara. Asegúrate de dar permisos."
          );
        });
    } catch (err) {
      console.error("Error inicializando escáner:", err);
      setError("Error inicializando el escáner.");
    }
  }, [scanner, isMobile, extractCedulaFromBarcode, onScan, onClose]);

  const stopScanner = useCallback(() => {
    if (scanner) {
      scanner.clear();
      setScanner(null);
    }
  }, [scanner]);

  useEffect(() => {
    if (isOpen && activeMode === "physical" && physicalInputRef.current) {
      setTimeout(() => {
        physicalInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, activeMode]);

  useEffect(() => {
    if (isOpen && activeMode === "camera") {
      const timer = setTimeout(() => {
        initScanner();
      }, 300);

      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    }

    return () => stopScanner();
  }, [isOpen, activeMode, initScanner, stopScanner]);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
          return;

        if (e.key === "F2") {
          e.preventDefault();
          setActiveMode("camera");
        } else if (e.key === "F3") {
          e.preventDefault();
          setActiveMode("physical");
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  const handlePhysicalScannerInput = useCallback(
    debounce((value) => {
      if (value.length >= 8) {
        const cedula = extractCedulaFromBarcode(value);
        if (cedula) {
          onScan(cedula);
          onClose();
        }
      }
    }, 300),
    [extractCedulaFromBarcode, onScan, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Escanear Código de Barras</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.scannerTabs}>
          <button
            className={`${styles.scannerTab} ${
              activeMode === "camera" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveMode("camera")}
          >
            <FontAwesomeIcon icon={faCamera} /> Cámara
          </button>
          <button
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
                  <div ref={scannerRef} className={styles.qrReader} />
                  <div className={styles.scannerOverlay}>
                    <div className={styles.scannerFrame}>
                      <div className={styles.scannerLine} />
                    </div>
                    <p className={styles.scannerHint}>
                      Enfoca el código de barras dentro del marco
                    </p>
                  </div>
                </>
              ) : (
                <div className={styles.physicalScannerContainer}>
                  <div className={styles.physicalScannerIcon}>
                    <FontAwesomeIcon icon={faBarcode} size="6x" />
                  </div>
                  <h3>Modo Escáner Físico</h3>
                  <p className={styles.physicalScannerInstructions}>
                    1. Asegúrate que el escáner esté conectado al PC
                    <br />
                    2. Haz clic en el campo de texto y escanea la cédula
                    <br />
                    3. El sistema capturará automáticamente la cédula
                  </p>
                  <div className={styles.physicalScannerInput}>
                    <input
                      ref={physicalInputRef}
                      type="text"
                      id="physicalScannerInput"
                      placeholder="Haz clic aquí y escanea con el dispositivo físico..."
                      autoFocus
                      onChange={(e) => {
                        handlePhysicalScannerInput(e.target.value);
                      }}
                      onBlur={(e) => {
                        if (isOpen && activeMode === "physical") {
                          setTimeout(() => e.target.focus(), 10);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente para capturar foto del visitante (optimizado)
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
              {error ? (
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
                <>
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: isMobile ? "environment" : "user",
                      width: { ideal: 640 },
                      height: { ideal: 480 },
                    }}
                    className={styles.webcam}
                  />
                </>
              )}
            </>
          )}
        </div>

        {!photo && !error && (
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

// Clases auxiliares para ZXing
class RGBLuminanceSource {
  constructor(data, width, height) {
    this.data = data;
    this.width = width;
    this.height = height;
  }

  getRow(y, row) {
    const offset = y * this.width * 4;
    for (let x = 0; x < this.width; x++) {
      const pixelOffset = offset + x * 4;
      const r = this.data[pixelOffset];
      const g = this.data[pixelOffset + 1];
      const b = this.data[pixelOffset + 2];
      row[x] = Math.floor((r + g + b) / 3);
    }
    return row;
  }

  getMatrix() {
    const matrix = new Array(this.height);
    for (let y = 0; y < this.height; y++) {
      matrix[y] = new Array(this.width);
      const offset = y * this.width * 4;
      for (let x = 0; x < this.width; x++) {
        const pixelOffset = offset + x * 4;
        const r = this.data[pixelOffset];
        const g = this.data[pixelOffset + 1];
        const b = this.data[pixelOffset + 2];
        matrix[y][x] = Math.floor((r + g + b) / 3);
      }
    }
    return matrix;
  }

  isCropSupported() {
    return false;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }
}

class BinaryBitmap {
  constructor(binarizer) {
    this.binarizer = binarizer;
  }

  getBlackMatrix() {
    return this.binarizer.getBlackMatrix();
  }

  getWidth() {
    return this.binarizer.getWidth();
  }

  getHeight() {
    return this.binarizer.getHeight();
  }

  getBlackRow(y, row) {
    return this.binarizer.getBlackRow(y, row);
  }
}

class HybridBinarizer {
  constructor(source) {
    this.source = source;
    this.matrix = null;
  }

  getBlackMatrix() {
    if (!this.matrix) {
      const matrix = this.source.getMatrix();
      const width = this.source.getWidth();
      const height = this.source.getHeight();

      this.matrix = new Array(height);
      for (let y = 0; y < height; y++) {
        this.matrix[y] = new Array(width);
        for (let x = 0; x < width; x++) {
          this.matrix[y][x] = matrix[y][x] < 128 ? 1 : 0;
        }
      }
    }
    return this.matrix;
  }

  getWidth() {
    return this.source.getWidth();
  }

  getHeight() {
    return this.source.getHeight();
  }

  getBlackRow(y, row) {
    const matrix = this.getBlackMatrix();
    if (!row || row.length < this.source.getWidth()) {
      row = new Array(this.source.getWidth());
    }
    for (let x = 0; x < this.source.getWidth(); x++) {
      row[x] = matrix[y][x];
    }
    return row;
  }
}

const GestionVisitantes = () => {
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
    empresa_actual_nombre: "",
    foto: "",
  });

  const [visitaData, setVisitaData] = useState({
    sede_id: "",
    empresa_entrega_id: "",
    motivo_visita: "Entrega de mercancía",
    observaciones: "",
  });

  const [proveedores, setProveedores] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [visitantes, setVisitantes] = useState([]);
  const [visitas, setVisitas] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    sede_id: "",
    estado: "",
    proveedor_id: "",
    fecha_desde: "",
    fecha_hasta: "",
  });

  const [pagination, setPagination] = useState({
    pagina: 1,
    por_pagina: 20,
    total: 0,
    total_paginas: 1,
  });

  const proveedoresMemo = useMemo(() => proveedores, [proveedores]);
  const sedesMemo = useMemo(() => sedes, [sedes]);

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
        message: "Error cargando datos iniciales: " + error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    cargarDatosIniciales();
  }, [cargarDatosIniciales]);

  const buscarVisitantePorCedula = useCallback(
    async (cedula) => {
      if (!cedula || cedula.length < 5) {
        addNotification({
          message: "Ingrese una cédula válida",
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
            nombres: response.data.nombres,
            apellidos: response.data.apellidos,
            fecha_nacimiento: response.data.fecha_nacimiento || "",
            telefono: response.data.telefono || "",
            email: response.data.email || "",
            arl_vigente: response.data.arl_vigente || false,
            fecha_arl_vigencia: response.data.fecha_arl_vigencia || "",
            archivo_arl: response.data.archivo_arl || "",
            empresa_actual_codigo: response.data.empresa_actual_codigo || "",
            empresa_actual_nombre: response.data.empresa_actual_nombre || "",
            foto: response.data.foto || "",
          });

          addNotification({
            message: `Visitante encontrado: ${response.data.nombres} ${response.data.apellidos}`,
            type: "success",
          });
        } else {
          setVisitanteEncontrado(null);
          setFormData({
            cedula: cedula,
            nombres: "",
            apellidos: "",
            fecha_nacimiento: "",
            telefono: "",
            email: "",
            arl_vigente: false,
            fecha_arl_vigencia: "",
            archivo_arl: "",
            empresa_actual_codigo: "",
            empresa_actual_nombre: "",
            foto: "",
          });

          addNotification({
            message: "Visitante no encontrado. Puede registrarlo.",
            type: "info",
          });
        }
      } catch (error) {
        addNotification({
          message: "Error buscando visitante: " + error.message,
          type: "error",
        });
      } finally {
        setBuscandoVisitante(false);
      }
    },
    [addNotification]
  );

  const debouncedBuscarVisitante = useCallback(
    debounce((value) => {
      if (value.length === 10) {
        buscarVisitantePorCedula(value);
      }
    }, 500),
    [buscarVisitantePorCedula]
  );

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
          empresa_actual_nombre: "",
          foto: "",
        });
      } else if (value.length === 10) {
        debouncedBuscarVisitante(value);
      }
    },
    [debouncedBuscarVisitante]
  );

  const handleFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleVisitaChange = useCallback((e) => {
    const { name, value } = e.target;
    setVisitaData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
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
    }));
  }, []);

  const guardarVisitante = useCallback(async () => {
    if (!formData.cedula || !formData.nombres || !formData.apellidos) {
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
        await apiService.createVisitante(datosParaEnviar);
        addNotification({
          message: "Visitante registrado exitosamente",
          type: "success",
        });
      }

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
        empresa_actual_codigo: "",
        empresa_actual_nombre: "",
        foto: "",
      });
    } catch (error) {
      addNotification({
        message: "Error guardando visitante: " + error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [formData, visitanteEncontrado, addNotification]);

  const handleBarcodeScan = useCallback(
    (cedula) => {
      setCedulaInput(cedula);
      buscarVisitantePorCedula(cedula);
      addNotification({
        message: `Cédula ${cedula} escaneada correctamente`,
        type: "success",
      });
    },
    [buscarVisitantePorCedula, addNotification]
  );

  const handlePhotoTaken = useCallback(
    (photoData) => {
      setFormData((prev) => ({
        ...prev,
        foto: photoData,
      }));
      addNotification({
        message: "Foto guardada exitosamente",
        type: "success",
      });
    },
    [addNotification]
  );

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
        icon: faTruckLoading,
        color: "#3b82f6",
      },
      {
        value: "terminado",
        label: "Terminado",
        icon: faCheckCircle,
        color: "#10b981",
      },
      {
        value: "cancelado",
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
                    {visitanteEncontrado.arl_vigente ? "VIGENTE" : "NO VIGENTE"}
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
                  : "Registrar Nuevo Visitante"}
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
                      value={formData.fecha_arl_vigencia}
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

              <div className={styles.formActions}>
                <button
                  className={styles.saveButton}
                  onClick={guardarVisitante}
                  disabled={loading}
                >
                  {visitanteEncontrado
                    ? "Actualizar Visitante"
                    : "Registrar Visitante"}
                </button>

                <button
                  className={styles.clearButton}
                  onClick={() => {
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
                      empresa_actual_codigo: "",
                      empresa_actual_nombre: "",
                      foto: "",
                    });
                  }}
                >
                  Limpiar
                </button>
              </div>
            </div>

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
                      value: sede.id,
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
                      if (!visitanteEncontrado) {
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
                          message: "Sede y proveedor de entrega son requeridos",
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
                          motivo_visita: visitaData.motivo_visita,
                          observaciones: visitaData.observaciones,
                        };

                        await apiService.createVisita(visitaPayload);

                        addNotification({
                          message:
                            "Visita registrada exitosamente. Estado: En espera",
                          type: "success",
                        });

                        setVisitaData({
                          sede_id: "",
                          empresa_entrega_id: "",
                          motivo_visita: "Entrega de mercancía",
                          observaciones: "",
                        });
                      } catch (error) {
                        addNotification({
                          message: "Error registrando visita: " + error.message,
                          type: "error",
                        });
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={
                      loading ||
                      !visitaData.sede_id ||
                      !visitaData.empresa_entrega_id
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

// Componentes separados para las pestañas de visitas y consulta
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
      estado: "",
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

          setVisitas(response.data);
          setPagination(response.pagination);
        } catch (error) {
          addNotification({
            message: "Error cargando visitas: " + error.message,
            type: "error",
          });
        } finally {
          setLoading(false);
        }
      },
      [filters, pagination.por_pagina, addNotification]
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
            usuario_id: user.id,
            estado: nuevoEstado,
          };

          if (carnet && nuevoEstado === "en_operacion") {
            payload.carnet_asignado = carnet;
          }

          await apiService.updateVisita(visitaId, payload);

          addNotification({
            message: `Visita actualizada a: ${nuevoEstado}`,
            type: "success",
          });

          cargarVisitas(pagination.pagina);
        } catch (error) {
          addNotification({
            message: "Error actualizando visita: " + error.message,
            type: "error",
          });
        }
      },
      [user.id, addNotification, cargarVisitas, pagination.pagina]
    );

    const formatearFecha = useCallback((fecha) => {
      if (!fecha) return "";
      return new Date(fecha).toLocaleString("es-CO");
    }, []);

    return (
      <div className={styles.visitasContainer}>
        <div className={styles.filtersSection}>
          <div className={styles.filterGrid}>
            <div className={`${styles.formGroup} ${styles.floating}`}>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className={styles.formInput}
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
                <option value=""></option>
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
                <option value=""></option>
                {estadosVisitas.map((estado) => (
                  <option key={estado.value} value={estado.value}>
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
                    ...prev,
                    proveedor_id: proveedor?.codigo || "",
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
                          estadosVisitas.find((e) => e.value === visita.estado)
                            ?.color || "#6b7280",
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
                            const carnet = prompt("Ingrese número de carnet:");
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

          {visitas.length === 0 && !loading && (
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

const ConsultaTab = React.memo(
  ({
    proveedores,
    setActiveTab,
    buscarVisitantePorCedula,
    addNotification,
  }) => {
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
            filters.search
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
      [filters.search, addNotification]
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
              className={styles.searchInput}
              placeholder="Buscar por cédula, nombre o empresa"
            />
            <button
              className={styles.cameraButton}
              onClick={() => cargarVisitantes(1)}
            >
              Buscar
            </button>
          </div>
        </div>

        <div className={styles.tableContainer}>
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
                  <td>{visitante.cedula}</td>
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
                          buscarVisitantePorCedula(visitante.cedula);
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

          {visitantes.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <p>No hay visitantes registrados</p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default GestionVisitantes;
