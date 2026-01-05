const API_BASE_URL = "https://aplicativo.supermercadobelalcazar.com/api";

export const roleService = {
  // Solo enviamos id_cargo, el PHP obtiene el nombre
  async getAccionesPorUsuario(usuario_id, id_rol, id_cargo) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/roles/get_acciones_usuario.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            usuario_id,
            id_rol,
            id_cargo,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const json = await response.json();
      if (!json.success)
        throw new Error(json.message || "Error obteniendo acciones");
      return json.data;
    } catch (error) {
      console.error("Error obteniendo acciones:", error);
      // Fallback simplificado
      return this.getAccionesPorDefecto(id_rol, id_cargo);
    }
  },

  // Solo lógica básica de fallback
  getAccionesPorDefecto(id_rol, id_cargo) {
    const configBase = {
      1: {
        // Admin
        accionesRapidas: [
          {
            id: 1,
            nombre: "Gestionar Usuarios",
            ruta: "/usuarios",
            icono: "faUsers",
            color: "success",
            descripcion: "Administrar usuarios del sistema",
          },
          {
            id: 2,
            nombre: "Ver Reportes",
            ruta: "/reportes",
            icono: "faChartBar",
            color: "warning",
            descripcion: "Reportes del sistema",
          },
        ],
        funcionalidadesEspeciales: [
          "Gestión completa de usuarios",
          "Aprobación de todas las solicitudes",
        ],
      },
      2: {
        // Usuario base
        accionesRapidas: [
          {
            id: 1,
            nombre: "Nueva Solicitud",
            ruta: "/actualizacion_costos",
            icono: "faPlus",
            color: "primary",
            descripcion: "Crear solicitud de costos",
          },
          {
            id: 2,
            nombre: "Mi Perfil",
            ruta: "/usuario",
            icono: "faUser",
            color: "info",
            descripcion: "Actualizar mis datos",
          },
        ],
        funcionalidadesEspeciales: [
          "Solicitudes de actualización de costos",
          "Gestión de perfil personal",
        ],
      },
    };

    return configBase[id_rol] || configBase[2];
  },
};
