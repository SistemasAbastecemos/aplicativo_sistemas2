const API_BASE_URL = "https://proveedor2.supermercadobelalcazar.com/api";

export const apiService = {
  async login(credentials) {
    try {
      const payload = {
        nit: credentials.nit,
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
          message: data.message || "Nit o contraseña incorrectos",
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

  async getMenu() {
    const params = new URLSearchParams();
    const response = await fetch(`${API_BASE_URL}/menu/get_menu.php?${params}`);
    const json = await response.json();
    if (!json.success) throw new Error(json.message || "Error obteniendo menú");
    return json.data;
  },

  async getSedes() {
    const response = await fetch(`${API_BASE_URL}/sedes/get_sedes.php`);
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo sedes");
    return json.data;
  },

  async createSede(payload) {
    const response = await fetch(`${API_BASE_URL}/sedes/create_sede.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message || "Error creando la sede");
    return json.data;
  },

  async updateSede(id, payload) {
    const response = await fetch(`${API_BASE_URL}/sedes/update_sede.php`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ ...payload, id }),
    });
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error actualizando la sede");
    return json.data;
  },

  async deleteSede(id) {
    const response = await fetch(`${API_BASE_URL}/sedes/delete_sede.php`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ id }),
    });
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error borrando la sede");
    return json.data;
  },

  async getUsuarios(pagina = 1, porPagina = 10) {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await fetch(
      `${API_BASE_URL}/usuarios/get_usuarios.php?pagina=${pagina}&por_pagina=${porPagina}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 403) {
      throw new Error("No tiene permisos para realizar esta acción");
    }

    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo usuarios");
    return json;
  },

  async getUsuario(id) {
    const response = await fetch(`${API_BASE_URL}/usuarios/get_user.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo usuario");
    return json.data;
  },

  async createUsuario(payload) {
    const response = await fetch(`${API_BASE_URL}/usuarios/create_user.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    if (!json.success) throw new Error(json.message || "Error creando usuario");
    return json.data;
  },

  async updateUsuario(id, payload) {
    const response = await fetch(`${API_BASE_URL}/usuarios/update_user.php`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ ...payload, id }),
    });
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error actualizando usuario");
    return json.data;
  },

  async deleteUsuario(id) {
    const response = await fetch(`${API_BASE_URL}/usuarios/delete_user.php`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ id }),
    });
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error eliminando usuario");
    return json.data;
  },

  async getEmpresas(pagina = 1, porPagina = 10) {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await fetch(
      `${API_BASE_URL}/empresas/get_empresas.php?pagina=${pagina}&por_pagina=${porPagina}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 403) {
      throw new Error("No tiene permisos para realizar esta acción");
    }

    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo empresas");
    return json;
  },

  async getEmpresa(id) {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await fetch(
      `${API_BASE_URL}/empresas/get_empresa.php?id=${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo empresa");
    return json.data;
  },

  async createEmpresa(payload) {
    const response = await fetch(
      `${API_BASE_URL}/empresas/create_empresa.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(payload),
      }
    );
    const json = await response.json();
    if (!json.success) throw new Error(json.message || "Error creando empresa");
    return json.data;
  },

  async updateEmpresa(id, payload) {
    const response = await fetch(
      `${API_BASE_URL}/empresas/update_empresa.php`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ ...payload, id }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(
        json.message || "Error <actualiza></actualiza>ndo empresa"
      );
    return json.data;
  },

  async deleteEmpresa(id) {
    const response = await fetch(
      `${API_BASE_URL}/empresas/delete_empresa.php`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ id }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error eliminando empresa");
    return json.data;
  },

  async getEmpleados(pagina = 1, porPagina = 10) {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await fetch(
      `${API_BASE_URL}/empleados/get_empleados.php?pagina=${pagina}&por_pagina=${porPagina}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 403) {
      throw new Error("No tiene permisos para realizar esta acción");
    }

    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo empleados");
    return json;
  },

  async getEmpleado(id) {
    const response = await fetch(`${API_BASE_URL}/empleados/get_empleado.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo empleado");
    return json.data;
  },

  async createEmpleado(payload) {
    const response = await fetch(
      `${API_BASE_URL}/empleados/create_empleado.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(payload),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error creando empleado");
    return json.data;
  },

  async updateEmpleado(id, payload) {
    const response = await fetch(
      `${API_BASE_URL}/empleados/update_empleado.php`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ ...payload, id }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error actualizando empleado");
    return json.data;
  },

  async deleteEmpleado(id) {
    const response = await fetch(
      `${API_BASE_URL}/empleados/delete_empleado.php`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ id }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error eliminando empleado");
    return json.data;
  },
  async getRoles() {
    const response = await fetch(`${API_BASE_URL}/roles/get_roles.php`);
    const json = await response.json();

    if (!json.success)
      throw new Error(json.message || "Error obteniendo roles");
    return json.data;
  },

  async getCargos() {
    const response = await fetch(`${API_BASE_URL}/cargos/get_cargos.php`);
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo cargos");
    return json.data;
  },

  async getClasificaciones() {
    const response = await fetch(
      `${API_BASE_URL}/clasificaciones/get_clasificaciones.php`
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo clasificaciones");
    return json.data;
  },

  async getClasificacion(id) {
    const response = await fetch(
      `${API_BASE_URL}/clasificaciones/get_clasificacion.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo clasificación");
    return json.data;
  },

  async createClasificacion(payload) {
    const response = await fetch(
      `${API_BASE_URL}/clasificaciones/create_clasificacion.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(payload),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error creando clasificación");
    return json.data;
  },

  async updateClasificacion(id, payload) {
    const response = await fetch(
      `${API_BASE_URL}/clasificaciones/update_clasificacion.php`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ ...payload, id }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error actualizando clasificación");
    return json.data;
  },

  async deleteClasificacion(id) {
    const response = await fetch(
      `${API_BASE_URL}/clasificaciones/delete_clasificacion.php`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ id }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error eliminando clasificación");
    return json.data;
  },

  async getTiposReporte() {
    const response = await fetch(
      `${API_BASE_URL}/tipos_reporte/get_tipos_reporte.php`
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo tipos de reporte");
    return json.data;
  },

  async getTipoReporte(id) {
    const response = await fetch(
      `${API_BASE_URL}/tipos_reporte/get_tipo_reporte.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo tipo de reporte");
    return json.data;
  },

  async createTipoReporte(payload) {
    const response = await fetch(
      `${API_BASE_URL}/tipos_reporte/create_tipo_reporte.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(payload),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error creando tipo de reporte");
    return json.data;
  },

  async updateTipoReporte(id, payload) {
    const response = await fetch(
      `${API_BASE_URL}/tipos_reporte/update_tipo_reporte.php`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ ...payload, id }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error actualizando tipo de reporte");
    return json.data;
  },

  async deleteTipoReporte(id) {
    const response = await fetch(
      `${API_BASE_URL}/tipos_reporte/delete_tipo_reporte.php`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ id }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error eliminando tipo de reporte");
    return json.data;
  },

  async getSiniestros(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.sede) params.append("sede", filtros.sede);
    if (filtros.fechaInicio) params.append("fecha_inicio", filtros.fechaInicio);
    if (filtros.fechaFin) params.append("fecha_fin", filtros.fechaFin);

    const response = await fetch(
      `${API_BASE_URL}/siniestros/get_siniestros.php?${params}`
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo siniestros");
    return json.data;
  },

  async getPositivos(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.sede) params.append("sede", filtros.sede);
    if (filtros.fechaInicio) params.append("fecha_inicio", filtros.fechaInicio);
    if (filtros.fechaFin) params.append("fecha_fin", filtros.fechaFin);

    const response = await fetch(
      `${API_BASE_URL}/positivos/get_positivos.php?${params}`
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo positivos");
    return json.data;
  },

  async getCriteriosGestion(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.sede) params.append("sede", filtros.sede);
    if (filtros.fechaInicio) params.append("fecha_inicio", filtros.fechaInicio);
    if (filtros.fechaFin) params.append("fecha_fin", filtros.fechaFin);

    const response = await fetch(
      `${API_BASE_URL}/criterios_gestion/get_criterios_gestion.php?${params}`
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo criterios de gestion");
    return json.data;
  },

  async getOtrosCriterios(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.sede) params.append("sede", filtros.sede);
    if (filtros.fechaInicio) params.append("fecha_inicio", filtros.fechaInicio);
    if (filtros.fechaFin) params.append("fecha_fin", filtros.fechaFin);

    const response = await fetch(
      `${API_BASE_URL}/otros_criterios/get_otros_criterios.php?${params}`
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo otros criterios");
    return json.data;
  },
};
