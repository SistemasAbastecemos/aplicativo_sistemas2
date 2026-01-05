import React, { useState, useEffect } from "react";
import { apiService } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";
import styles from "./ActualizacionCostos.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCalculator,
  faDollarSign,
  faPercent,
  faSave,
  faCalendarAlt,
  faCheckCircle,
  faExclamationTriangle,
  faBuilding,
  faUser,
  faBoxes,
} from "@fortawesome/free-solid-svg-icons";

const ModalAplicarPrecios = ({ solicitud, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [items, setItems] = useState([]);
  const [fechaAplicacionReal, setFechaAplicacionReal] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});
  const [camposEditados, setCamposEditados] = useState(new Set());

  useEffect(() => {
    if (solicitud) {
      cargarDetalles();
    }
  }, [solicitud]);

  const cargarDetalles = async () => {
    try {
      let itemsCargados = [];
      let fechaAplicacionRealCargada = "";

      if (solicitud.items && solicitud.items.length > 0) {
        itemsCargados = solicitud.items;
        fechaAplicacionRealCargada = solicitud.fecha_aplicacion_real || "";
      } else {
        const respuesta =
          await apiService.getDetalleSolicitudesActualizacionCostos(
            solicitud.id
          );
        itemsCargados = respuesta.data.items || [];
        fechaAplicacionRealCargada = respuesta.data.fecha_aplicacion_real || "";
      }

      // Inicializar margen y pdv - si es 0, poner vacío
      const itemsInicializados = itemsCargados.map((item) => ({
        ...item,
        margen:
          item.margen != null &&
          item.margen !== "" &&
          parseFloat(item.margen) !== 0
            ? parseFloat(item.margen).toString()
            : "",
        pdv:
          item.pdv != null && item.pdv !== "" && parseFloat(item.pdv) !== 0
            ? parseFloat(item.pdv).toString()
            : "",
      }));

      setItems(itemsInicializados);
      setFechaAplicacionReal(fechaAplicacionRealCargada);
    } catch (error) {
      addNotification({
        message: "Error al cargar detalles: " + error,
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const calcularCampos = (item) => {
    const costoNuevo = parseFloat(item.costo_sin_iva_nuevo) || 0;
    const pie1 = parseFloat(item.porcentaje_pie_factura1) || 0;
    const pie2 = parseFloat(item.porcentaje_pie_factura2) || 0;
    const icui = parseFloat(item.valor_icui) || 0;
    const iva = parseFloat(item.iva) || 0;
    const margen = parseFloat(item.margen) || 0;
    const pdv = parseFloat(item.pdv) || 0;

    const valorPieFactura = (costoNuevo * (pie1 + pie2)) / 100;
    const costoConPie = costoNuevo - valorPieFactura;
    const costoMasIcui = costoConPie + icui;
    const valorIva = costoMasIcui * (iva / 100);
    const costoMasIva = costoMasIcui + valorIva;
    const precioFinal = costoMasIva * (1 + margen / 100);

    return {
      valor_pie_factura: valorPieFactura,
      costo_con_pie_factura: costoConPie,
      costo_mas_icui: costoMasIcui,
      valor_iva_calculado: valorIva,
      costo_mas_iva: costoMasIva,
      precio_final: precioFinal,
      precio_pdv: precioFinal + pdv,
    };
  };

  // Función para manejar cambios en los inputs
  const actualizarItem = (index, campo, valor) => {
    const nuevosItems = [...items];

    // Eliminar ceros a la izquierda y validar formato
    let valorLimpio = valor;

    if (campo === "margen" || campo === "pdv") {
      // Eliminar ceros a la izquierda
      if (valor.startsWith("0") && valor.length > 1 && !valor.includes(".")) {
        valorLimpio = valor.replace(/^0+/, "");
        if (valorLimpio === "") valorLimpio = "0";
      }

      // Permitir solo números y un punto decimal
      valorLimpio = valorLimpio.replace(/[^0-9.]/g, "");

      // Validar que no tenga más de un punto decimal
      const puntos = valorLimpio.split(".").length - 1;
      if (puntos > 1) {
        const partes = valorLimpio.split(".");
        valorLimpio = partes[0] + "." + partes.slice(1).join("");
      }

      // Limitar a 2 decimales
      if (valorLimpio.includes(".")) {
        const partes = valorLimpio.split(".");
        if (partes[1].length > 2) {
          valorLimpio = partes[0] + "." + partes[1].substring(0, 2);
        }
      }
    }

    nuevosItems[index][campo] = valorLimpio;

    // Marcar como editado
    const campoKey = `${index}-${campo}`;
    setCamposEditados((prev) => new Set(prev).add(campoKey));

    // Solo calcular si el valor no está vacío y es válido
    if (["margen", "pdv"].includes(campo)) {
      const valorNumerico = parseFloat(valorLimpio);
      if (!isNaN(valorNumerico) && valorNumerico >= 0) {
        const calculos = calcularCampos(nuevosItems[index]);
        Object.assign(nuevosItems[index], calculos);
      }
    }

    setItems(nuevosItems);

    // Limpiar errores si existen
    if (errores[campoKey]) {
      const nuevosErrores = { ...errores };
      delete nuevosErrores[campoKey];
      setErrores(nuevosErrores);
    }
  };

  const formatearMoneda = (valor) => {
    if (!valor || isNaN(valor)) return "$0.00";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(valor);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "No definida";
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Función mejorada de validación
  const validarCampo = (valor, campo) => {
    // Si el valor está vacío o es 0, no es válido
    if (
      valor === "" ||
      valor === null ||
      valor === undefined ||
      valor === "0"
    ) {
      return { valido: false, error: `El ${campo} es obligatorio` };
    }

    // Validar que no empiece por 0 innecesariamente
    if (valor.startsWith("0") && valor.length > 1 && !valor.includes(".")) {
      return { valido: false, error: `El ${campo} no puede empezar con 0` };
    }

    const valorNum = parseFloat(valor);
    if (isNaN(valorNum)) {
      return { valido: false, error: `El ${campo} debe ser un número válido` };
    }

    if (valorNum < 0) {
      return { valido: false, error: `El ${campo} no puede ser negativo` };
    }

    // El margen debe ser mayor que 0
    if (campo === "margen" && valorNum <= 0) {
      return { valido: false, error: "El margen debe ser mayor a 0" };
    }

    if (campo === "margen") {
      if (valorNum > 1000) {
        return { valido: false, error: "El margen debe estar entre 0 y 1000%" };
      }
      // Validar formato decimal
      if (valor.includes(".") && valor.split(".")[1].length > 2) {
        return {
          valido: false,
          error: "El margen no puede tener más de 2 decimales",
        };
      }
    }

    // Validar PDV - debe ser mayor a 0
    if (campo === "PDV") {
      if (valorNum <= 0) {
        return {
          valido: false,
          error: "El PDV no puede ser negativo o igual a 0",
        };
      }
      if (valor.includes(".") && valor.split(".")[1].length > 2) {
        return {
          valido: false,
          error: "El PDV no puede tener más de 2 decimales",
        };
      }
    }

    return { valido: true };
  };

  const validarDatos = () => {
    const nuevosErrores = {};
    let valido = true;

    // Validar fecha de aplicación real
    if (!fechaAplicacionReal) {
      nuevosErrores.fechaAplicacionReal =
        "La fecha de aplicación real es obligatoria";
      valido = false;
    }

    // Validar items
    items.forEach((item, index) => {
      // Validar margen
      const validacionMargen = validarCampo(item.margen, "margen");
      if (!validacionMargen.valido) {
        nuevosErrores[`${index}-margen`] = validacionMargen.error;
        valido = false;
      }

      // Validar PDV
      const validacionPdv = validarCampo(item.pdv, "PDV");
      if (!validacionPdv.valido) {
        nuevosErrores[`${index}-pdv`] = validacionPdv.error;
        valido = false;
      }
    });

    setErrores(nuevosErrores);
    return valido;
  };

  const puedeFinalizar = () => {
    // Verificar fecha
    if (!fechaAplicacionReal) return false;

    // Verificar que todos los items tengan margen y pdv válidos
    const todosCompletos = items.every((item) => {
      const validacionMargen = validarCampo(item.margen, "margen");
      const validacionPdv = validarCampo(item.pdv, "PDV");

      return validacionMargen.valido && validacionPdv.valido;
    });

    return todosCompletos;
  };

  // Función CORREGIDA para contar campos completados
  const contarCamposCompletados = (campo) => {
    return items.filter((item) => {
      const valor = item[campo];

      // Validación estricta - no contar vacíos, nulos, undefined o "0"
      if (
        valor === "" ||
        valor === null ||
        valor === undefined ||
        valor === "0"
      ) {
        return false;
      }

      const valorNum = parseFloat(valor);

      //  No contar si no es un número válido o es negativo
      if (isNaN(valorNum) || valorNum < 0) {
        return false;
      }

      // Validaciones específicas por campo
      if (campo === "margen") {
        // Margen debe ser mayor que 0 y menor o igual a 1000
        if (valorNum <= 0 || valorNum > 1000) return false;
        if (valor.startsWith("0") && valor.length > 1 && !valor.includes("."))
          return false;
        if (valor.includes(".") && valor.split(".")[1].length > 2) return false;
      }

      if (campo === "pdv") {
        // PDV debe ser mayor o igual a 0
        if (valorNum < 0) return false;
        if (valor.startsWith("0") && valor.length > 1 && !valor.includes("."))
          return false;
        if (valor.includes(".") && valor.split(".")[1].length > 2) return false;
      }

      return true;
    }).length;
  };

  const manejarGuardar = async () => {
    if (!validarDatos()) return;

    setGuardando(true);
    try {
      // 2. Preparar los datos de los ítems a enviar
      const itemsParaEnviar = items.map((item) => {
        const margen = parseFloat(item.margen) || 0;
        const pdv = parseFloat(item.pdv) || 0;

        return {
          id_item: item.id_item,
          margen: margen,
          pdv: pdv,
          ...calcularCampos({ ...item, margen, pdv }),
        };
      });

      // 3. Crear el payload completo para la API
      const payload = {
        idLogin: user.id,
        login: user.login,
        id_solicitud: solicitud.id,
        items: itemsParaEnviar,
        fecha_aplicacion: fechaAplicacionReal,
      };

      // 4. Llama al apiService
      const respuesta = await apiService.finalizarProcesoActualizacion(payload);

      // 5. Manejo de éxito
      onSuccess();
      onClose();
      addNotification({
        message: respuesta.mensaje || "Solicitud finalizada exitosamente",
        type: "success",
      });
    } catch (error) {
      addNotification({
        message: "Error al guardar los precios: " + error.message,
        type: "error",
      });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className={styles.overlayModal} onClick={onClose}>
        <div
          className={styles.modalExtraGrande}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.encabezadoModal}>
            <div className={styles.tituloModal}>
              <FontAwesomeIcon icon={faCalculator} />
              <div>
                <h2>Aplicar Precios - Solicitud #{solicitud.id}</h2>
                <p>Cargando detalles de la solicitud...</p>
              </div>
            </div>
            <button className={styles.botonCerrarModal} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className={styles.cuerpoModalCargando}>
            <LoadingScreen message="Cargando información de la solicitud..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlayModal} onClick={onClose}>
      <div
        className={styles.modalExtraGrande}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.encabezadoModal}>
          <div className={styles.tituloModal}>
            <FontAwesomeIcon icon={faCalculator} />
            <div>
              <h2>Aplicar Precios - Solicitud #{solicitud.id}</h2>
              <p>Complete los campos obligatorios para finalizar el proceso</p>
            </div>
          </div>
          <button className={styles.botonCerrarModal} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.cuerpoModal}>
          {/* Información General */}
          <div className={styles.seccionInfo}>
            <h3>Información de la Solicitud</h3>
            <div className={styles.gridInfo}>
              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faBuilding} />
                <div>
                  <label>Proveedor</label>
                  <span>{solicitud.nombre_proveedor}</span>
                  <small>NIT: {solicitud.nit_proveedor}</small>
                </div>
              </div>

              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faCalendarAlt} />
                <div>
                  <label>Fecha de Aplicación Programada</label>
                  <span>{formatearFecha(solicitud.fecha_aplicacion)}</span>
                  <small>No editable</small>
                </div>
              </div>

              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faUser} />
                <div>
                  <label>Comprador Asignado</label>
                  <span>{solicitud.nombre_comprador || "No asignado"}</span>
                </div>
              </div>

              <div className={styles.infoItem}>
                <FontAwesomeIcon icon={faBoxes} />
                <div>
                  <label>Total de Items</label>
                  <span>{items.length} productos</span>
                </div>
              </div>

              <div
                className={`${styles.infoItem} ${styles.fechaAplicacionReal}`}
              >
                <FontAwesomeIcon icon={faCalendarAlt} />
                <div>
                  <label className={styles.etiquetaObligatoria}>
                    Fecha de Aplicación Contrato *
                  </label>
                  <input
                    type="date"
                    value={fechaAplicacionReal}
                    onChange={(e) => {
                      setFechaAplicacionReal(e.target.value);
                      if (errores.fechaAplicacionReal) {
                        const nuevosErrores = { ...errores };
                        delete nuevosErrores.fechaAplicacionReal;
                        setErrores(nuevosErrores);
                      }
                    }}
                    className={
                      errores.fechaAplicacionReal ? styles.inputError : ""
                    }
                  />
                  {errores.fechaAplicacionReal && (
                    <span className={styles.mensajeError}>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      {errores.fechaAplicacionReal}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de items */}
          <div className={styles.seccionItems}>
            <h3>
              Configuración de Precios ({items.length} items) * Campos
              obligatorios
            </h3>
            <div className={styles.tablaContenedor}>
              <div className={styles.tablaScroll}>
                <table className={styles.tablaDetalles}>
                  <thead>
                    <tr>
                      <th className={styles.columnaNumero}>#</th>
                      <th className={styles.columnaCodigoBarras}>
                        Codigo de Barras
                      </th>
                      <th className={styles.columnaCodigo}>Código</th>
                      <th className={styles.columnaDescripcion}>Descripción</th>
                      <th className={styles.columnaMoneda}>Costo Nuevo</th>
                      <th className={styles.columnaMoneda}>Pie Factura</th>
                      <th className={styles.columnaMoneda}>Costo con Pie</th>
                      <th className={styles.columnaMoneda}>Costo + ICUI</th>
                      <th className={styles.columnaMoneda}>Valor IVA</th>
                      <th className={styles.columnaMoneda}>Costo + IVA</th>
                      <th className={styles.columnaMargen}>Margen *</th>
                      <th className={styles.columnaMoneda}>Precio Final</th>
                      <th className={styles.columnaPDV}>PDV *</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const calculos = calcularCampos(item);
                      return (
                        <tr key={index}>
                          <td className={styles.columnaNumero}>{index + 1}</td>
                          <td className={styles.codigoBarras}>
                            {item.codigo_barras}
                          </td>
                          <td className={styles.codigoItem}>{item.id_item}</td>
                          <td className={styles.descripcionMultiLinea}>
                            {item.descripcion}
                          </td>
                          <td className={styles.costo}>
                            {formatearMoneda(item.costo_sin_iva_nuevo)}
                          </td>
                          <td className={styles.costo}>
                            {formatearMoneda(calculos.valor_pie_factura)}
                          </td>
                          <td className={styles.costo}>
                            {formatearMoneda(calculos.costo_con_pie_factura)}
                          </td>
                          <td className={styles.costo}>
                            {formatearMoneda(calculos.costo_mas_icui)}
                          </td>
                          <td className={styles.costo}>
                            {formatearMoneda(calculos.valor_iva_calculado)}
                          </td>
                          <td className={styles.costo}>
                            {formatearMoneda(calculos.costo_mas_iva)}
                          </td>

                          <td className={styles.columnaInput}>
                            <div className={styles.inputWithIcon}>
                              <input
                                type="text"
                                value={item.margen}
                                onChange={(e) =>
                                  actualizarItem(
                                    index,
                                    "margen",
                                    e.target.value
                                  )
                                }
                                onBlur={(e) => {
                                  const valor = e.target.value;
                                  if (valor && !valor.endsWith(".")) {
                                    const numero = parseFloat(valor);
                                    if (!isNaN(numero)) {
                                      actualizarItem(
                                        index,
                                        "margen",
                                        numero.toString()
                                      );
                                    }
                                  }
                                  const validacion = validarCampo(
                                    item.margen,
                                    "margen"
                                  );
                                  if (!validacion.valido) {
                                    setErrores((prev) => ({
                                      ...prev,
                                      [`${index}-margen`]: validacion.error,
                                    }));
                                  }
                                }}
                                className={
                                  errores[`${index}-margen`]
                                    ? styles.inputError
                                    : ""
                                }
                                placeholder="0"
                                maxLength="7"
                              />
                              <FontAwesomeIcon
                                icon={faPercent}
                                className={styles.inputIcon}
                              />
                            </div>
                            {errores[`${index}-margen`] && (
                              <span className={styles.mensajeErrorCampo}>
                                {errores[`${index}-margen`]}
                              </span>
                            )}
                          </td>

                          <td className={styles.costoDestacado}>
                            {formatearMoneda(calculos.precio_final)}
                          </td>

                          <td className={styles.columnaInput}>
                            <div className={styles.inputWithIcon}>
                              <FontAwesomeIcon
                                icon={faDollarSign}
                                className={styles.inputIcon}
                              />
                              <input
                                type="text"
                                value={item.pdv}
                                onChange={(e) =>
                                  actualizarItem(index, "pdv", e.target.value)
                                }
                                onBlur={(e) => {
                                  const valor = e.target.value;
                                  if (valor && !valor.endsWith(".")) {
                                    const numero = parseFloat(valor);
                                    if (!isNaN(numero)) {
                                      actualizarItem(
                                        index,
                                        "pdv",
                                        numero.toString()
                                      );
                                    }
                                  }
                                  const validacion = validarCampo(
                                    item.pdv,
                                    "PDV"
                                  );
                                  if (!validacion.valido) {
                                    setErrores((prev) => ({
                                      ...prev,
                                      [`${index}-pdv`]: validacion.error,
                                    }));
                                  }
                                }}
                                className={
                                  errores[`${index}-pdv`]
                                    ? styles.inputError
                                    : ""
                                }
                                placeholder="0.00"
                                maxLength="10"
                              />
                            </div>
                            {errores[`${index}-pdv`] && (
                              <span className={styles.mensajeErrorCampo}>
                                {errores[`${index}-pdv`]}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className={styles.seccionResumen}>
            <h3>Resumen de Aplicación</h3>
            <div className={styles.gridResumen}>
              <div className={styles.resumenItem}>
                <div className={styles.resumenValor}>{items.length}</div>
                <div className={styles.resumenLabel}>Total Items</div>
              </div>
              <div className={styles.resumenItem}>
                <div className={styles.resumenValor}>
                  {contarCamposCompletados("margen")}
                </div>
                <div className={styles.resumenLabel}>Margen Completado</div>
              </div>
              <div className={styles.resumenItem}>
                <div className={styles.resumenValor}>
                  {contarCamposCompletados("pdv")}
                </div>
                <div className={styles.resumenLabel}>PDV Completado</div>
              </div>
              <div className={styles.resumenItem}>
                <div className={styles.resumenValor}>
                  {fechaAplicacionReal ? "✓" : "✗"}
                </div>
                <div className={styles.resumenLabel}>Fecha Aplicación</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.pieModal}>
          <button
            className={styles.botonSecundario}
            onClick={onClose}
            disabled={guardando}
          >
            Cancelar
          </button>

          <div className={styles.estadoGuardado}>
            {Object.keys(errores).length > 0 && (
              <span className={styles.erroresCount}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                {Object.keys(errores).length} error(es) por corregir
              </span>
            )}
            {puedeFinalizar() && Object.keys(errores).length === 0 && (
              <span className={styles.badgeAvance}>
                <FontAwesomeIcon icon={faCheckCircle} />
                Todo listo para finalizar
              </span>
            )}
          </div>

          <button
            className={styles.botonPrimario}
            onClick={manejarGuardar}
            disabled={guardando || !puedeFinalizar()}
          >
            <FontAwesomeIcon icon={guardando ? faSave : faCheckCircle} />
            {guardando ? "Aplicando Precios..." : "Finalizar Proceso"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAplicarPrecios;
