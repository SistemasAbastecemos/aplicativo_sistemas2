import React, { useEffect, useState } from "react";
import styles from "./Styles.module.css";
import { apiService } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import LoadingScreen from "../UI/LoadingScreen";

const Companies = () => {
    const { user: currentUser } = useAuth();
    const { addNotification } = useNotification();
    const [empresas, setEmpresas] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [cargando, setCargando] = useState(false);
    const [search, setSearch] = useState("");
    const [errorPermisos, setErrorPermisos] = useState("");

    // Modal
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [empresaActual, setEmpresaActual] = useState(null);

    const [formData, setFormData] = useState({
        codigo: "",
        descripcion: "",
        direccion: "",
        barrio: "",
        ciudad: "",
        departamento: ""
    });

    const esAdministrador = currentUser && currentUser.rol_id === 1;

    useEffect(() => {
        if (esAdministrador) {
            cargarEmpresas(pagina);
        } else {
            setErrorPermisos("No tienes permisos para acceder a esta sección");
        }
    }, [pagina, esAdministrador]);

    const cargarEmpresas = async (page = 1) => {
        setCargando(true);
        try {
            const data = await apiService.getEmpresas(page);
            setEmpresas(data.data.empresas);
            setTotalPaginas(Math.max(1, data.data.paginacion.total_paginas));
        } catch (error) {
            console.error("Error cargando empresas:", error);
            if (error.message.includes("permisos") || error.message.includes("403")) {
                setErrorPermisos("No tienes permisos para ver las empresas");
                addNotification({
                    message: "No tienes permisos para ver las empresas",
                    type: "error",
                });
            } else {
                addNotification({
                    message: "Error cargando empresas",
                    type: "error",
                });
            }
        } finally {
            setCargando(false);
        }
    };

    const abrirModalNuevo = () => {
        setModoEdicion(false);
        setEmpresaActual(null);
        setFormData({
            codigo: "",
            descripcion: "",
            direccion: "",
            barrio: "",
            ciudad: "",
            departamento: ""
        });
        setMostrarModal(true);
    };

    const abrirModalEditar = (empresa) => {
        setModoEdicion(true);
        setEmpresaActual(empresa);
        setFormData({
            codigo: empresa.codigo,
            descripcion: empresa.descripcion,
            direccion: empresa.direccion,
            barrio: empresa.barrio,
            ciudad: empresa.ciudad,
            departamento: empresa.departamento
        });
        setMostrarModal(true);
    };

    const guardarEmpresa = async () => {
        try {
            if (modoEdicion) {
                await apiService.updateEmpresa(empresaActual.id, formData);
                addNotification({
                    message: "Empresa actualizada correctamente",
                    type: "success",
                });
            } else {
                await apiService.createEmpresa(formData);
                addNotification({
                    message: "Empresa creada correctamente",
                    type: "success",
                });
            }
            setMostrarModal(false);
            cargarEmpresas(pagina);
        } catch (error) {
            console.error("Error guardando empresa:", error);
            addNotification({
                message: "Error al guardar la empresa: " + error.message,
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

    const empresasFiltradas = empresas.filter((e) => {
        const texto = search.toLowerCase();
        return (
            e.codigo.toLowerCase().includes(texto) ||
            e.descripcion.toLowerCase().includes(texto) ||
            e.direccion.toLowerCase().includes(texto) ||
            e.barrio.toLowerCase().includes(texto) ||
            e.ciudad.toLowerCase().includes(texto) ||
            e.departamento.toLowerCase().includes(texto)
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
        return <LoadingScreen message="Cargando empresas..." />;
    }

    return (
        <div className={styles.usuarios}>
            <h2>🏢 Gestión de Empresas</h2>
            <div className={styles.header}>
                <input
                    type="text"
                    placeholder="Buscar empresas..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.searchInput}
                />
                <button className={styles.btnNuevo} onClick={abrirModalNuevo}>
                    + Nueva Empresa
                </button>
            </div>

            <div className={styles.grid}>
                {empresasFiltradas.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🚀</div>
                        <h3>No hay Empresas registradas</h3>
                        <p>Puedes crear una nueva usando el botón <b>+ Nueva Empresa</b>.</p>
                        <button className={styles.btnNuevoGrande} onClick={abrirModalNuevo}>
                            + Crear el primero
                        </button>
                    </div>
                ) : (
                    empresasFiltradas.map((e) => (
                        <div key={e.id} className={styles.card}>
                            <div className={styles.cardContent}>
                                <div className={styles.avatar}>
                                    {e.descripcion.charAt(0).toUpperCase()}
                                </div>
                                <div className={styles.info}>
                                    <h4>{e.descripcion}</h4>
                                    <p>Código: {e.codigo}</p>
                                    <p>{e.direccion}</p>
                                    <p>{e.barrio}, {e.ciudad} - {e.departamento}</p>
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

            {/* Modal */}
            {mostrarModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>{modoEdicion ? "Editar Empresa" : "Nueva Empresa"}</h3>
                        <div className={styles.modalContent}>
                            <div className={styles.modalLeft}>
                                <div className={styles.formGroup}>
                                    <label>Código</label>
                                    <input
                                        type="text"
                                        name="codigo"
                                        value={formData.codigo}
                                        onChange={handleChange}
                                        maxLength={3}
                                        disabled={modoEdicion}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Descripción</label>
                                    <input
                                        type="text"
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Dirección</label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className={styles.modalRight}>
                                <div className={styles.formGroup}>
                                    <label>Barrio</label>
                                    <input
                                        type="text"
                                        name="barrio"
                                        value={formData.barrio}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Ciudad</label>
                                    <input
                                        type="text"
                                        name="ciudad"
                                        value={formData.ciudad}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Departamento</label>
                                    <input
                                        type="text"
                                        name="departamento"
                                        value={formData.departamento}
                                        onChange={handleChange}
                                    />
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
                            <button className={styles.btnGuardar} onClick={guardarEmpresa}>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Companies;
