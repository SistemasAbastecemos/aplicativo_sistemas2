import React, { useEffect, useState } from "react";
import styles from "./Styles.module.css";
import { apiService } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import LoadingScreen from "../UI/LoadingScreen";

const Employes = () => {
    const { user: currentUser } = useAuth();
    const { addNotification } = useNotification();
    const [empleados, setEmpleados] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [cargando, setCargando] = useState(false);
    const [roles, setRoles] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [search, setSearch] = useState("");
    const [errorPermisos, setErrorPermisos] = useState("");

    // Modal
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [empleadoActual, setEmpleadoActual] = useState(null);

    // Estado inicial del formulario
    const [formData, setFormData] = useState({
        codigo: "",
        cedula: "",
        nombres: "",
        sede_id: "",
        empresa_id: "",
        fecha_contrato: "",
        estado_contrato: "",
        ult_curso_segurida: "",
        fecha_vencimiento_curso: "",
        fecha_vencimiento_psicofisico: "",
        fecha_vencimiento_acreditacion: "",
        fecha_vencimiento_contrato: "",
        observaciones: "",
        email: "",
        celular1: "",
        celular2: "",
        fecha_retiro: "",
        supervigilancia: "N",
        cumple_supervigilancia: "N",
        activo: 1,
    });


    const esAdministrador = currentUser && currentUser.rol_id === 1;

    useEffect(() => {
        if (esAdministrador) {
            cargarEmpleados(pagina);
            cargarDatosAdicionales();
        } else {
            setErrorPermisos("No tienes permisos para acceder a esta sección");
        }
    }, [pagina, esAdministrador]);

    const cargarDatosAdicionales = async () => {
        try {
            const [rolesData, cargosData, sedesData, empresasData] = await Promise.all([
                apiService.getRoles(),
                apiService.getCargos(),
                apiService.getSedes(),
                apiService.getEmpresas(),
            ]);
            setRoles(rolesData);
            setCargos(cargosData);
            setSedes(sedesData);
            setEmpresas(empresasData.data.empresas);
        } catch (error) {
            console.error("Error cargando datos adicionales:", error);
            addNotification({
                message: "Error cargando datos adicionales",
                type: "error",
            });
        }
    };

    const cargarEmpleados = async (page = 1) => {
        setCargando(true);
        try {
            const data = await apiService.getEmpleados(page);
            setEmpleados(data.data.empleados);
            setTotalPaginas(Math.max(1, data.data.paginacion.total_paginas));
        } catch (error) {
            console.error("Error cargando empleados:", error);
            if (error.message.includes("permisos") || error.message.includes("403")) {
                setErrorPermisos("No tienes permisos para ver los empleados");
                addNotification({
                    message: "No tienes permisos para ver los empleados",
                    type: "error",
                });
            } else {
                addNotification({
                    message: "Error cargando empleados",
                    type: "error",
                });
            }
        } finally {
            setCargando(false);
        }
    };

    const abrirModalNuevo = () => {
        setModoEdicion(false);
        setEmpleadoActual(null);
        setFormData({
            nombres_completos: "",
            usuario: "",
            password: "",
            email: "",
            rol_id: "",
            cargo_id: "",
            sede_id: "",
            activo: 1,
        });
        setMostrarModal(true);
    };

    const abrirModalEditar = (empleado) => {
        setModoEdicion(true);
        setEmpleadoActual(empleado);

        setFormData({
            codigo: empleado.codigo || "",
            cedula: empleado.cedula || "",
            nombres: empleado.nombres || "",
            sede_id: sedes.find((s) => s.id === empleado.sede_id)?.id || "",
            empresa_id: empresas.find((e) => e.id === empleado.empresa_id)?.id || "",
            fecha_contrato: empleado.fecha_contrato || "",
            estado_contrato: empleado.estado_contrato || "",
            ult_curso_segurida: empleado.ult_curso_segurida || "",
            fecha_vencimiento_curso: empleado.fecha_vencimiento_curso || "",
            fecha_vencimiento_psicofisico: empleado.fecha_vencimiento_psicofisico || "",
            fecha_vencimiento_acreditacion: empleado.fecha_vencimiento_acreditacion || "",
            fecha_vencimiento_contrato: empleado.fecha_vencimiento_contrato || "",
            observaciones: empleado.observaciones || "",
            email: empleado.email || "",
            celular1: empleado.celular1 || "",
            celular2: empleado.celular2 || "",
            fecha_retiro: empleado.fecha_retiro || "",
            supervigilancia: empleado.supervigilancia || "N",
            cumple_supervigilancia: empleado.cumple_supervigilancia || "N",
            rol_id: empleado.rol_id || "",
            cargo_id: cargos.find((c) => c.id === empleado.cargo_id)?.id || "",
            activo: empleado.activo ? 1 : 0,
        });

        setMostrarModal(true);
    };


    const guardarEmpleado = async () => {
        try {
            const datosParaEnviar = {
                ...formData,
                rol_id: parseInt(formData.rol_id),
                cargo_id: parseInt(formData.cargo_id),
                sede_id: parseInt(formData.sede_id),
                activo: parseInt(formData.activo),
            };

            if (modoEdicion && !datosParaEnviar.password) {
                delete datosParaEnviar.password;
            }

            if (modoEdicion) {
                await apiService.updateEmpleado(empleadoActual.id, datosParaEnviar);
                addNotification({
                    message: "Empleado actualizado correctamente",
                    type: "success",
                });
            } else {
                await apiService.createEmpleado(datosParaEnviar);
                addNotification({
                    message: "Empleado creado correctamente",
                    type: "success",
                });
            }
            setMostrarModal(false);
            cargarEmpleados(pagina);
        } catch (error) {
            console.error("Error guardando empleado:", error);
            addNotification({
                message: "Error al guardar el empleado: " + error.message,
                type: "error",
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const empleadosFiltrados = empleados.filter((e) => {
        const texto = search.toLowerCase();
        return (
            (e.nombres || "").toLowerCase().includes(texto) ||
            (e.codigo || "").toLowerCase().includes(texto) ||
            (e.cedula || "").toLowerCase().includes(texto) ||
            (roles.find((r) => r.id === e.rol_id)?.descripcion || "")
                .toLowerCase()
                .includes(texto) ||
            (e.cargo_descripcion || "").toLowerCase().includes(texto) ||
            (e.sede_nombre || "").toLowerCase().includes(texto)
        );
    });


    if (!esAdministrador) {
        return (
            <div className={styles.usuarios}>
                <div className={styles.errorPermisos}>
                    <h2>Acceso restringido</h2>
                    <p>{errorPermisos}</p>
                </div>
            </div>
        );
    }

    if (errorPermisos) {
        return (
            <div className={styles.usuarios}>
                <div className={styles.errorPermisos}>
                    <h2>Error de permisos</h2>
                    <p>{errorPermisos}</p>
                </div>
            </div>
        );
    }

    if (cargando && pagina === 1) {
        return <LoadingScreen message="Cargando empleados..." />;
    }

    return (
        <div className={styles.usuarios}>
            <h2>👤 Gestión de Empleados</h2>
            <div className={styles.header}>
                <input
                    type="text"
                    placeholder="Buscar empleados..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.searchInput}
                />
                <button className={styles.btnNuevo} onClick={abrirModalNuevo}>
                    + Nuevo Empleado
                </button>
            </div>

            <div className={styles.grid}>
                {empleadosFiltrados.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🚀</div>
                        <h3>No hay empleados registrados</h3>
                        <p>Puedes crear uno nuevo usando el botón <b>+ Nuevo Empleado</b>.</p>
                        <button className={styles.btnNuevoGrande} onClick={abrirModalNuevo}>
                            + Crear el primero
                        </button>
                    </div>
                ) : (

                    empleadosFiltrados.map((e) => (
                        <div key={e.id} className={styles.card}>
                            <div className={styles.cardContent}>
                                <div className={styles.avatar}>
                                    {e.nombres.charAt(0).toUpperCase()}
                                </div>
                                <div className={styles.info}>
                                    <h4>{e.nombres}</h4>
                                    <div className={styles.badgesRow}>
                                        {/* Estado contrato */}
                                        <span
                                            className={
                                                e.estado_contrato === "ACTIVO"
                                                    ? styles.tagActivo
                                                    : styles.tagInactivo
                                            }
                                        >
                                            {e.estado_contrato}
                                        </span>

                                        {/* Estado general */}
                                        <span
                                            className={
                                                e.activo ? styles.tagActivo : styles.tagInactivo
                                            }
                                        >
                                            {e.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </div>

                                    <div className={styles.inlineRow}>
                                        <p><b>Código:</b> {e.codigo} - <b>Cédula:</b> {e.cedula}</p>
                                    </div>

                                    <div className={styles.tags}>
                                        <span className={styles.tagSede}>
                                            {sedes.find((s) => s.id === e.sede_id)?.nombre || "Sin sede"}
                                        </span>
                                        <span className={styles.tagCargo}>{e.cargo_descripcion}</span>
                                    </div>

                                    <p className={styles.empresaText}>
                                        🏢 {e.empresa_nombre}
                                    </p>
                                </div>
                            </div>
                            <button
                                className={styles.btnEditar}
                                onClick={() => abrirModalEditar(e)}
                            >
                                ✏ Editar
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Paginación */}
            <div className={styles.paginacion}>
                <button
                    className={styles.pageBtn}
                    disabled={pagina === 1}
                    onClick={() => setPagina((p) => p - 1)}
                >
                    ⬅
                </button>
                <span>
                    Página <b>{pagina}</b> de <b>{totalPaginas}</b>
                </span>
                <button
                    className={styles.pageBtn}
                    disabled={pagina === totalPaginas}
                    onClick={() => setPagina((p) => p + 1)}
                >
                    ➡
                </button>
            </div>

            {mostrarModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>{modoEdicion ? "Editar Empleado" : "Nuevo Empleado"}</h3>
                        <div className={styles.modalContent}>
                            <div className={styles.modalLeft}>
                                <div className={styles.formGroup}>
                                    <label>Código</label>
                                    <input
                                        type="text"
                                        name="codigo"
                                        value={formData.codigo}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Cédula</label>
                                    <input
                                        type="text"
                                        name="cedula"
                                        value={formData.cedula}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Nombres completos</label>
                                    <input
                                        type="text"
                                        name="nombres"
                                        value={formData.nombres}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Centro de Operacion</label>
                                    <select
                                        name="sede_id"
                                        value={formData.sede_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione</option>
                                        {sedes.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Cargo</label>
                                    <select
                                        name="cargo_id"
                                        value={formData.cargo_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione</option>
                                        {cargos.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.descripcion}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Empresa</label>
                                    <select
                                        name="empresa_id"
                                        value={formData.empresa_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione</option>
                                        {empresas.map((e) => (
                                            <option key={e.id} value={e.id}>
                                                {e.descripcion}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Fecha contrato</label>
                                    <input
                                        type="date"
                                        name="fecha_contrato"
                                        value={formData.fecha_contrato}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Estado contrato</label>
                                    <select
                                        type="text"
                                        name="estado_contrato"
                                        value={formData.estado_contrato}
                                        onChange={handleChange}
                                    >
                                        <option value={"ACTIVO"}>ACTIVO</option>
                                        <option value={"TERMINADO"}>TERMINADO</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Último curso de seguridad</label>
                                    <input
                                        type="text"
                                        name="ult_curso_segurida"
                                        value={formData.ult_curso_segurida}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Vencimiento curso</label>
                                    <input
                                        type="date"
                                        name="fecha_vencimiento_curso"
                                        value={formData.fecha_vencimiento_curso}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className={styles.modalRight}>
                                <div className={styles.formGroup}>
                                    <label>Vencimiento psicofísico</label>
                                    <input
                                        type="date"
                                        name="fecha_vencimiento_psicofisico"
                                        value={formData.fecha_vencimiento_psicofisico}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Vencimiento acreditación</label>
                                    <input
                                        type="date"
                                        name="fecha_vencimiento_acreditacion"
                                        value={formData.fecha_vencimiento_acreditacion}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Vencimiento contrato</label>
                                    <input
                                        type="date"
                                        name="fecha_vencimiento_contrato"
                                        value={formData.fecha_vencimiento_contrato}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Correo</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Celular 1</label>
                                    <input
                                        type="text"
                                        name="celular1"
                                        value={formData.celular1}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Celular 2</label>
                                    <input
                                        type="text"
                                        name="celular2"
                                        value={formData.celular2}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Fecha retiro</label>
                                    <input
                                        type="date"
                                        name="fecha_retiro"
                                        value={formData.fecha_retiro}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Supervigilancia</label>
                                    <select
                                        name="supervigilancia"
                                        value={formData.supervigilancia}
                                        onChange={handleChange}
                                    >
                                        <option value="S">Sí</option>
                                        <option value="N">No</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Cumple supervigilancia</label>
                                    <select
                                        name="cumple_supervigilancia"
                                        value={formData.cumple_supervigilancia}
                                        onChange={handleChange}
                                    >
                                        <option value="S">Sí</option>
                                        <option value="N">No</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Observaciones</label>
                                    <textarea
                                        name="observaciones"
                                        value={formData.observaciones}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Activo</label>
                                    <select
                                        name="activo"
                                        value={formData.activo}
                                        onChange={handleChange}
                                    >
                                        <option value={1}>Sí</option>
                                        <option value={0}>No</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className={styles.btnCancelar}
                                onClick={() => setMostrarModal(false)}
                            >
                                Cancelar
                            </button>
                            <button className={styles.btnGuardar} onClick={guardarEmpleado}>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Employes;
