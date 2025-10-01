import React, { useEffect, useState } from "react";
import styles from "./Styles.module.css";
import { apiService } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import LoadingScreen from "../UI/LoadingScreen";

const Users = () => {
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotification();
  const [usuarios, setUsuarios] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [roles, setRoles] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [search, setSearch] = useState("");
  const [errorPermisos, setErrorPermisos] = useState("");

  // Modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);

  const [formData, setFormData] = useState({
    nombres_completos: "",
    usuario: "",
    password: "",
    email: "",
    rol_id: "",
    cargo_id: "",
    sede_id: "",
    activo: 1,
  });

  const esAdministrador = currentUser && currentUser.rol_id === 1;

  useEffect(() => {
    if (esAdministrador) {
      cargarUsuarios(pagina);
      cargarDatosAdicionales();
    } else {
      setErrorPermisos("No tienes permisos para acceder a esta sección");
    }
  }, [pagina, esAdministrador]);

  const cargarDatosAdicionales = async () => {
    try {
      const [rolesData, cargosData, sedesData] = await Promise.all([
        apiService.getRoles(),
        apiService.getCargos(),
        apiService.getSedes()
      ]);
      setRoles(rolesData);
      setCargos(cargosData);
      setSedes(sedesData);
    } catch (error) {
      console.error("Error cargando datos adicionales:", error);
      addNotification({
        message: "Error cargando datos adicionales",
        type: "error"
      });
    }
  };

  const cargarUsuarios = async (page = 1) => {
    setCargando(true);
    try {
      const data = await apiService.getUsuarios(page);
      setUsuarios(data.data.usuarios);
      setTotalPaginas(data.data.paginacion.total_paginas);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      if (error.message.includes("permisos") || error.message.includes("403")) {
        setErrorPermisos("No tienes permisos para ver los usuarios");
        addNotification({
          message: "No tienes permisos para ver los usuarios",
          type: "error"
        });
      } else {
        addNotification({
          message: "Error cargando usuarios",
          type: "error"
        });
      }
    } finally {
      setCargando(false);
    }
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setUsuarioActual(null);
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

  const abrirModalEditar = (usuario) => {
    setModoEdicion(true);
    setUsuarioActual(usuario);
    setFormData({
      nombres_completos: usuario.nombres_completos,
      usuario: usuario.usuario,
      password: "",
      email: usuario.email,
      rol_id: usuario.rol_id,
      cargo_id: cargos.find((c) => c.nombre === usuario.cargo)?.id || "",
      sede_id: sedes.find((s) => s.nombre === usuario.sede)?.id || "",
      activo: usuario.activo ? 1 : 0,
    });
    setMostrarModal(true);
  };

  const guardarUsuario = async () => {
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
        await apiService.updateUsuario(usuarioActual.id, datosParaEnviar);
        addNotification({
          message: "Usuario actualizado correctamente",
          type: "success"
        });
      } else {
        await apiService.createUsuario(datosParaEnviar);
        addNotification({
          message: "Usuario creado correctamente",
          type: "success"
        });
      }
      setMostrarModal(false);
      cargarUsuarios(pagina);
    } catch (error) {
      console.error("Error guardando usuario:", error);
      addNotification({
        message: "Error al guardar el usuario: " + error.message,
        type: "error"
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = search.toLowerCase();
    return (
      u.nombres_completos.toLowerCase().includes(texto) ||
      u.usuario.toLowerCase().includes(texto) ||
      u.email.toLowerCase().includes(texto) ||
      (roles.find((r) => r.id === u.rol_id)?.descripcion || "").toLowerCase().includes(texto) ||
      u.cargo.toLowerCase().includes(texto) ||
      u.sede.toLowerCase().includes(texto)
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
    return <LoadingScreen message="Cargando usuarios..." />;
  }

  return (
    <div className={styles.usuarios}>
      <h2>👤 Gestión de Usuarios</h2>
      <div className={styles.header}>
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <button className={styles.btnNuevo} onClick={abrirModalNuevo}>
          + Nuevo Usuario
        </button>
      </div>

      <div className={styles.grid}>
        {usuariosFiltrados.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🚀</div>
            <h3>No hay Usuarios registrados</h3>
            <p>Puedes crear uno nuevo usando el botón <b>+ Nuevo Usuario</b>.</p>
            <button className={styles.btnNuevoGrande} onClick={abrirModalNuevo}>
              + Crear el primero
            </button>
          </div>
        ) : (
          usuariosFiltrados.map((u) => (
            <div key={u.id} className={styles.card}>
              <div className={styles.cardContent}>
                <div className={styles.avatar}>
                  {u.nombres_completos.charAt(0).toUpperCase()}
                </div>
                <div className={styles.info}>
                  <h4>{u.nombres_completos}</h4>
                  <p>{u.email}</p>
                  <div className={styles.tags}>
                    <span className={styles.tagRol}>
                      {roles.find((r) => r.id === u.rol_id)?.descripcion || u.rol_id}
                    </span>
                    <span className={styles.tagCargo}>{u.cargo}</span>
                    <span className={styles.tagSede}>{u.sede}</span>
                    <span
                      className={u.activo ? styles.tagActivo : styles.tagInactivo}
                    >
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                className={styles.btnEditar}
                onClick={() => abrirModalEditar(u)}
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
            <h3>{modoEdicion ? "Editar Usuario" : "Nuevo Usuario"}</h3>

            <div className={styles.modalContent}>
              <div className={styles.modalLeft}>
                <div className={styles.formGroup}>
                  <label>Nombres Completos</label>
                  <input
                    type="text"
                    name="nombres_completos"
                    value={formData.nombres_completos}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Usuario</label>
                  <input
                    type="text"
                    name="usuario"
                    value={formData.usuario}
                    onChange={handleChange}
                    disabled={modoEdicion}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={modoEdicion ? "Dejar vacío para no cambiar" : ""}
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
              </div>

              <div className={styles.modalRight}>
                <div className={styles.formGroup}>
                  <label>Rol</label>
                  <select name="rol_id" value={formData.rol_id} onChange={handleChange}>
                    <option value="">Seleccione</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Cargo</label>
                  <select name="cargo_id" value={formData.cargo_id} onChange={handleChange}>
                    <option value="">Seleccione</option>
                    {cargos.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Sede</label>
                  <select name="sede_id" value={formData.sede_id} onChange={handleChange}>
                    <option value="">Seleccione</option>
                    {sedes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Activo</label>
                  <select name="activo" value={formData.activo} onChange={handleChange}>
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
              <button className={styles.btnGuardar} onClick={guardarUsuario}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;