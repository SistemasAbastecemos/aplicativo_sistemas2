const API_BASE_URL = "https://aplicativo2.supermercadobelalcazar.com/api";

export const apiService = {
  async login(credentials) {
    try {
      const payload = {
        login: credentials.login,
        password: credentials.password,
      };

      const response = await fetch(`${API_BASE_URL}/login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!responseText || responseText.trim() === "") {
        throw new Error("El servidor devolvió una respuesta vacía");
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(
          `El servidor no devolvió una respuesta JSON válida. Código: ${response.status}`
        );
      }

      if (response.status === 401) {
        return {
          success: false,
          message: data.message || "Usuario o contraseña incorrectos",
        };
      }

      if (!response.ok) {
        throw new Error(data.message || `Error HTTP: ${response.status}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  async forgotPassword({ usuario }) {
    try {
      const response = await fetch(`${API_BASE_URL}/forgot_password.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ usuario }),
      });

      const text = await response.text();
      if (!text.trim()) throw new Error("El servidor no devolvió respuesta");
      const data = JSON.parse(text);

      if (!response.ok)
        throw new Error(data.message || "Error al enviar recuperación");
      return data;
    } catch (err) {
      throw err;
    }
  },

  async logout(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/logout.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }), // Enviar el token en el body por si falla el header
      });

      const responseText = await response.text();

      if (!responseText || responseText.trim() === "") {
        throw new Error("El servidor devolvió una respuesta vacía");
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(
          `El servidor no devolvió una respuesta JSON válida. Código: ${response.status}`
        );
      }

      if (!response.ok) {
        throw new Error(data.message || `Error HTTP: ${response.status}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  async verifyToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/verify_token.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await response.text();

      if (!responseText || responseText.trim() === "") {
        throw new Error("El servidor devolvió una respuesta vacía");
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(
          `El servidor no devolvió una respuesta JSON válida. Código: ${response.status}`
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Token inválido");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  async validateAccess(data) {
    const response = await fetch(
      `${API_BASE_URL}/middlewares/validate_access.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  },

  async getUserMenu(empresa) {
    const response = await fetch(`${API_BASE_URL}/menu/get_user_menu.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ empresa }),
    });

    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo los menus");
    return json.data;
  },

  async getUsuario(id) {
    const response = await fetch(`${API_BASE_URL}/usuarios/get_usuario.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ id }),
    });

    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo usuario");
    return json.data;
  },

  async updateUsuario(usuario, payload) {
    const response = await fetch(`${API_BASE_URL}/usuarios/update_user.php`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ ...payload, usuario }),
    });
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error actualizando usuario");
    return json;
  },

  async getSolicitudesActualizacionCostos(usuario) {
    const response = await fetch(
      `${API_BASE_URL}/formularios/actualizacion_costos/get_solicitudes.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ usuario }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo las solicitudes");
    return json.data;
  },

  async getItemsProveedor(usuario) {
    const response = await fetch(
      `${API_BASE_URL}/formularios/actualizacion_costos/get_items_proveedor.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ usuario }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo las solicitudes");
    return json;
  },

  async getTrazabilidadSolicitudesActualizacionCostos(id_solicitud) {
    const response = await fetch(
      `${API_BASE_URL}/formularios/actualizacion_costos/get_trazabilidad.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ id_solicitud }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(
        json.message || "Error obteniendo la trazabilidad de la solicitud"
      );
    return json;
  },

  async getDetalleSolicitudesActualizacionCostos(id_solicitud) {
    const response = await fetch(
      `${API_BASE_URL}/formularios/actualizacion_costos/get_detalle_solicitud.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ id_solicitud }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(
        json.message || "Error obteniendo los detalles de la solicitud"
      );
    return json;
  },

  async getSolicitudesCodificacionProductos(search, estado, page, usuario) {
    const response = await fetch(
      `${API_BASE_URL}/formularios/codificacion_productos/get_solicitudes.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ search, estado, page, usuario }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo las solicitudes");
    return json;
  },

  async getSolicitudCodificacionProductos(id, usuario) {
    const response = await fetch(
      `${API_BASE_URL}/formularios/codificacion_productos/get_solicitud.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ id, usuario }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(
        json.message || "Error obteniendo los detalles de la solicitud"
      );
    return json;
  },

  async getTrazabilidadCodificacionProducto(id) {
    const response = await fetch(
      `${API_BASE_URL}/formularios/codificacion_productos/get_trazabilidad.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ id }),
      }
    );

    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo trazabilidad");
    return json.trazabilidad;
  },
};
