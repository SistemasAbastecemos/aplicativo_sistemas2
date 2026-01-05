const API_BASE_URL = "https://aplicativo.supermercadobelalcazar.com/api";

export const menuService = {
  async getMenuPorUsuario(usuarioId) {
    try {
      const response = await fetch(`${API_BASE_URL}/menu/get_menu_user.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ usuario_id: usuarioId }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const json = await response.json();
      if (!json.success)
        throw new Error(json.message || "Error obteniendo menú");

      // Ahora el backend devuelve
      return {
        menu: json.data,
        userInfo: json.user_info, // Contiene 'id', 'login', 'id_rol', etc.
      };
    } catch (error) {
      console.error("Error obteniendo menú:", error);
      return {
        menu: this.getMenuPorDefecto(),
        userInfo: null,
      };
    }
  },

  // menú por defecto
  getMenuPorDefecto() {
    return [
      {
        id_menu: 1,
        nombre: "Dashboard",
        ruta: "/dashboard",
        icono: "faHome",
        orden: 1,
        permisos: {
          crear: true,
          editar: true,
          eliminar: false,
        },
      },
      {
        id_menu: 2,
        nombre: "Mi Perfil",
        ruta: "/perfil",
        icono: "faUser",
        orden: 2,
        permisos: {
          crear: false,
          editar: true,
          eliminar: false,
        },
      },
    ];
  },
};
