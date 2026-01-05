const API_BASE_URL = "https://aplicativo.supermercadobelalcazar.com/api";

export const apiService = {
  /////////////////////////////
  /////// AUTENTICACION ///////
  /////////////////////////////

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

  //////////////
  // SEDES /////
  //////////////

  async getSedes(onlyActive = true) {
    const response = await fetch(
      `${API_BASE_URL}/sedes/get_sedes.php?onlyActive=${onlyActive}`
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo sedes");
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

  ///////////////////
  ////// AREAS //////
  ///////////////////

  async getAreas(onlyActive = true) {
    const res = await fetch(
      `${API_BASE_URL}/areas/get_areas.php?onlyActive=${onlyActive}`
    );
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async createArea(data) {
    const res = await fetch(`${API_BASE_URL}/areas/create_area.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json;
  },

  async updateArea(id, data) {
    const res = await fetch(`${API_BASE_URL}/areas/update_area.php`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ id, ...data }),
    });
    const json = await res.json();
    if (!json.success)
      throw new Error(json.message || "Error actualizando la sede");
    return json;
  },

  ///////////////////////
  /////// CARGOS ////////
  ///////////////////////

  async getCargos(onlyActive = true) {
    const res = await fetch(
      `${API_BASE_URL}/cargos/get_cargos.php?onlyActive=${onlyActive}`
    );
    const json = await res.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo cargos");
    return json.data;
  },

  async createCargo(data) {
    const res = await fetch(`${API_BASE_URL}/cargos/create_cargo.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Error creando cargo");
    return json;
  },

  async updateCargo(id, data) {
    const res = await fetch(`${API_BASE_URL}/cargos/update_cargo.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ id, ...data }),
    });
    const json = await res.json();
    if (!json.success)
      throw new Error(json.message || "Error actualizando cargo");
    return json;
  },

  ///////////////////////
  //////// ROLES ////////
  ///////////////////////

  async getRoles() {
    const response = await fetch(`${API_BASE_URL}/roles/get_roles.php`);
    const json = await response.json();

    if (!json.success)
      throw new Error(json.message || "Error obteniendo roles");
    return json.data;
  },

  ///////////////////////
  //////// MENUS ////////
  ///////////////////////

  async getMenus() {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No hay token de autenticación");

    const res = await fetch(`${API_BASE_URL}/menu/get_menus.php`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 403)
      throw new Error("No tiene permisos para realizar esta acción");

    const json = await res.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo menús");
    return json; // tu get_menus.php devuelve { success: true, data: [...] }
  },

  // Crear menú (payload: { nombre, ruta, icono, orden, id_parent, activo, permisos: { roles:{}, areas:{} } })
  async createMenu(payload) {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No hay token de autenticación");

    const res = await fetch(`${API_BASE_URL}/menu/create_menu.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 403)
      throw new Error("No tiene permisos para realizar esta acción");

    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Error creando menú");
    return json; // { success: true, id: <nuevo_id> }
  },

  // Actualizar menú (payload igual que create, id pasado por query string)
  async updateMenu(id, payload) {
    if (!id) throw new Error("ID de menú requerido para actualizar");
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No hay token de autenticación");

    const res = await fetch(
      `${API_BASE_URL}/menu/update_menu.php?id=${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (res.status === 403)
      throw new Error("No tiene permisos para realizar esta acción");

    const json = await res.json();
    if (!json.success)
      throw new Error(json.message || "Error actualizando menú");
    return json;
  },

  ////////////////////////
  /////// USUARIOS ///////
  ////////////////////////

  async getUsuarios(pagina = 1, porPagina = 12, search = "") {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const url = new URL(`${API_BASE_URL}/usuarios/get_usuarios.php`);
    url.searchParams.append("pagina", pagina);
    url.searchParams.append("por_pagina", porPagina);
    if (search.trim() !== "") {
      url.searchParams.append("search", search.trim());
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 403) {
      throw new Error("No tiene permisos para realizar esta acción");
    }

    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo usuarios");
    return json.data;
  },

  async updateUsuario(id, data) {
    const res = await fetch(`${API_BASE_URL}/usuarios/update_usuario.php`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ id, ...data }),
    });
    const json = await res.json();
    if (!json.success)
      throw new Error(json.message || "Error actualizando usuario");
    return json;
  },

  async createUsuario(data) {
    const res = await fetch(`${API_BASE_URL}/usuarios/create_usuario.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Error creando usuario");
    return json;
  },

  /////////////////////
  // PERFIL USUARIO //
  ////////////////////

  async getPerfilUsuario(id) {
    const response = await fetch(`${API_BASE_URL}/perfil/get_usuario.php`, {
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

  async updatePerfilUsuario(id, payload) {
    const response = await fetch(`${API_BASE_URL}/perfil/update_user.php`, {
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
    return json;
  },

  //////////////////////////
  /////// PROVEEDORES //////
  //////////////////////////

  async getProveedores(pagina = 1, porPagina = 12, search = "") {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const url = new URL(`${API_BASE_URL}/proveedores/get_proveedores.php`);
    url.searchParams.append("pagina", pagina);
    url.searchParams.append("por_pagina", porPagina);
    if (search.trim() !== "") {
      url.searchParams.append("search", search.trim());
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 403) {
      throw new Error("No tiene permisos para realizar esta acción");
    }

    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo proveedores");
    return json.data;
  },

  async getProveedores2() {
    const response = await fetch(
      `${API_BASE_URL}/seguridad/visitantes/get_proveedores.php`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo Proveedores");
    return json.data;
  },

  async updateProveedor(id, data) {
    const res = await fetch(
      `${API_BASE_URL}/proveedores/update_proveedor.php`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ id, ...data }),
      }
    );
    const json = await res.json();
    if (!json.success)
      throw new Error(json.message || "Error actualizando proveedor");
    return json;
  },

  async createProveedor(data) {
    const res = await fetch(
      `${API_BASE_URL}/proveedores/create_proveedor.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(data),
      }
    );
    const json = await res.json();
    if (!json.success)
      throw new Error(json.message || "Error creando proveedir");
    return json;
  },

  /////////////////////////////////////////
  // FORMULARIO ACTUALIZACION DE COSTOS //
  /////////////////////////////////////////

  async getSolicitudesActualizacionCostos(idLogin, usuario) {
    const response = await fetch(
      `${API_BASE_URL}/compras/actualizacion_costos/get_solicitudes.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ idLogin, usuario }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo las solicitudes");
    return json;
  },

  async getDetalleSolicitudesActualizacionCostos(id_solicitud) {
    const response = await fetch(
      `${API_BASE_URL}/compras/actualizacion_costos/get_detalle_solicitud.php`,
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

  async getTrazabilidadSolicitudesActualizacionCostos(id_solicitud) {
    const response = await fetch(
      `${API_BASE_URL}/compras/actualizacion_costos/get_trazabilidad.php`,
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

  async procesarSolicitud(id_solicitud, login, accion, observaciones) {
    const response = await fetch(
      `${API_BASE_URL}/compras/actualizacion_costos/aprobar_solicitud.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          id_solicitud,
          login,
          accion,
          observaciones: observaciones.trim(),
        }),
      }
    );

    const json = await response.json();

    if (!json.success) {
      throw new Error(
        json.error ||
          json.message ||
          "Error desconocido al procesar la solicitud"
      );
    }

    return json;
  },

  async aplicarCambioPrecio(id_solicitud, login, idLogin) {
    const response = await fetch(
      `${API_BASE_URL}/compras/actualizacion_costos/aplicar_cambio_precio.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ id_solicitud, login, idLogin }),
      }
    );
    const json = await response.json();

    if (!json.success) {
      throw new Error(
        json.error || json.message || "Error al aplicar el cambio de precio"
      );
    }
    return json;
  },

  async finalizarProcesoActualizacion(payload) {
    const response = await fetch(
      `${API_BASE_URL}/compras/actualizacion_costos/finalizar_proceso.php`,
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

    if (!json.success) {
      throw new Error(
        json.error ||
          json.message ||
          "Error desconocido al finalizar el proceso"
      );
    }

    return json;
  },

  /////////////////////////////////////////
  ///// ACTUALIZACION DE INVENTARIO ///////
  /////////////////////////////////////////

  async updateInventario(tipoInventario, formData) {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await fetch(
      `${API_BASE_URL}/subida_archivos/actualiza_inventarios/update_inventario.php`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const json = await response.json();
    if (!json.success) {
      throw new Error(json.error || "Error actualizando inventario");
    }

    return json;
  },

  ///////////////////////////////////
  //// CODIFICACION DE PRODUCTOS ////
  ///////////////////////////////////

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

  ///////////////////////////////////
  //////// ADMIN ITEMS FRUVER ///////
  ///////////////////////////////////

  async getItemsFruver(page = 1, por_pagina = 20, search = "") {
    const params = new URLSearchParams({ pagina: page, por_pagina, search });
    const response = await fetch(
      `${API_BASE_URL}/fruver/items/get_items.php?${params}`
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo los items");
    return json;
  },

  async createItemFruver(data) {
    const res = await fetch(`${API_BASE_URL}/fruver/items/create_item.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Error creando el item");
    return json;
  },

  async updateItemFruver(id, data) {
    const res = await fetch(`${API_BASE_URL}/fruver/items/update_item.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ id, ...data }),
    });
    const json = await res.json();
    if (!json.success)
      throw new Error(json.message || "Error actualizando el item");
    return json;
  },

  ///////////////////////////////
  //////// PEDIDOS FRUVER ///////
  ///////////////////////////////

  async getPedidosFruver(fecha) {
    const params = new URLSearchParams();
    if (fecha) params.append("fecha", fecha);

    const response = await fetch(
      `${API_BASE_URL}/fruver/pedidos/get_pedidos.php?${params}`,
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      }
    );
    return await response.json();
  },

  ///////////////////////////////////
  //// CARGA PLANOS CONTABILIDAD ////
  ///////////////////////////////////

  async updatePlanosContabilidad({
    file,
    empresa,
    tipo,
    uploadId,
    onProgress,
  }) {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No hay token de autenticación");

    const chunkSize = 10 * 1024 * 1024; // 10MB
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const blob = file.slice(start, end);

      const formData = new FormData();
      formData.append("empresa", empresa);
      formData.append("tipo", tipo);
      formData.append("fileName", file.name);
      formData.append("uploadId", uploadId);
      formData.append("chunkIndex", i);
      formData.append("totalChunks", totalChunks);
      formData.append("file", blob);

      const response = await fetch(
        `${API_BASE_URL}/contabilidad/planos/update_planos.php`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const json = await response.json();
      if (!json.success) {
        throw new Error(json.error || "Error subiendo archivo plano");
      }

      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalChunks) * 100));
      }
    }
  },

  /////////////
  //// CVM ////
  /////////////

  // Obtener reportes cvm
  async getReportesCVM(estado, sede, search = "") {
    const params = new URLSearchParams({
      estado,
      sede,
      search,
    });

    const response = await fetch(
      `${API_BASE_URL}/sistemas/cvm/get_registros.php?${params}`
    );

    const json = await response.json();

    if (!json.success) {
      throw new Error(json.message || "Error obteniendo registros CVM");
    }

    return json;
  },

  // Actualizar reporte cvm
  async updateReporteCVM(data) {
    const res = await fetch(
      `${API_BASE_URL}/sistemas/cvm/update_registro.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(data),
      }
    );

    const json = await res.json();

    if (!json.success) {
      throw new Error(json.message || "Error actualizando registro CVM");
    }

    return json;
  },

  // Obetener cajas
  async getCajas(id_sede) {
    const params = new URLSearchParams({
      id_sede,
    });

    const response = await fetch(
      `${API_BASE_URL}/sistemas/cvm/get_cajas.php?${params}`
    );
    const json = await response.json();
    if (!response.ok)
      throw new Error(json.error || "Error obteniendo las cajas");
    return json;
  },

  // Obetener Supervisores
  async getSupervisores(id_sede) {
    const params = new URLSearchParams({
      id_sede,
    });

    const response = await fetch(
      `${API_BASE_URL}/sistemas/cvm/get_supervisores.php?${params}`
    );
    const json = await response.json();
    if (!response.ok)
      throw new Error(json.error || "Error obteniendo los supervisores");
    return json;
  },

  // Obetener datos balanza
  async getBalanza(id_sede, id_caja) {
    const params = new URLSearchParams({
      id_sede,
      id_caja,
    });

    const response = await fetch(
      `${API_BASE_URL}/sistemas/cvm/get_balanza.php?${params}`
    );
    const json = await response.json();
    if (!response.ok)
      throw new Error(json.error || "Error obteniendo los datos de la balanza");
    return json;
  },

  // Subir imagen CVM
  async uploadImagenCvm(formData) {
    const response = await fetch(
      `${API_BASE_URL}/sistemas/cvm/upload_imagen.php`,
      {
        method: "POST",
        body: formData,
      }
    );

    const json = await response.json();

    if (!json.success) {
      throw new Error(json.error || "Error guardando el registro");
    }

    return json;
  },

  // Eliminar imagenes de cvm
  async eliminarImagenes(data) {
    const response = await fetch(
      `${API_BASE_URL}/sistemas/cvm/delete_imagen.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    return await response.json();
  },

  // Guardar reporte todas
  async saveRegistroTodasOK(data) {
    const response = await fetch(
      `${API_BASE_URL}/sistemas/cvm/save_registro_ok.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const json = await response.json();

    if (!json.success) {
      throw new Error(json.error || "Error guardando el registro");
    }

    return json;
  },

  // Guardar registro
  async saveRegistroCVM(data) {
    const response = await fetch(
      `${API_BASE_URL}/sistemas/cvm/save_registro.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const json = await response.json();

    if (!json.success) {
      throw new Error(json.error || "Error guardando el registro");
    }

    return json;
  },

  /////////////////////////////////////////////
  /////////// PROGRAMACION SEPARATA ///////////
  /////////////////////////////////////////////

  // Obetener separatas
  async getSeparatas() {
    const response = await fetch(
      `${API_BASE_URL}/compras/separata/get_separatas.php`
    );
    const json = await response.json();
    if (!response.ok)
      throw new Error(json.error || "Error obteniendo separatas");
    return json;
  },

  // Checkear Separata
  async checkSeparata(fechaInicio, fechaFinal) {
    const params = new URLSearchParams({
      fecha_inicio: fechaInicio,
      fecha_final: fechaFinal,
    });
    const response = await fetch(
      `${API_BASE_URL}/compras/separata/check_separata.php?${params}`
    );
    const json = await response.json();
    if (!response.ok)
      throw new Error(json.error || "Error verificando separata");
    return json;
  },

  // Items de separata
  async getSeparataItems(separataId) {
    const params = new URLSearchParams({ separata_id: separataId });
    const response = await fetch(
      `${API_BASE_URL}/compras/separata/get_items_separata.php?${params}`
    );
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Error obteniendo items");
    return json;
  },

  // Guardar Item en una separata
  async saveSeparataItem(data) {
    const response = await fetch(
      `${API_BASE_URL}/compras/separata/save_item_separata.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const json = await response.json();

    if (!json.success) throw new Error(json.message || "Error al guardar item");

    return json;
  },

  // Actualizar el item en una separata
  async updateSeparataItem(data) {
    const response = await fetch(
      `${API_BASE_URL}/compras/separata/update_item_separata.php`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error al actualizar el item");
    return json;
  },

  // Borrar el item de una separata
  async deleteSeparataItem(id, usuario) {
    const response = await fetch(
      `${API_BASE_URL}/compras/separata/delete_item_separata.php`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, usuario }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error al retirar el item");
    return json;
  },

  // Obtener datos de item
  async getItemData(item) {
    const params = new URLSearchParams({ item });
    const response = await fetch(
      `${API_BASE_URL}/compras/separata/get_item_data.php?${params}`
    );
    const json = await response.json();
    if (json.error) throw new Error(json.error);
    return json;
  },

  // Actulizar fecha límite de una separata
  async updateFechaLimite(separataId, fechaLimite) {
    const response = await fetch(
      `${API_BASE_URL}/compras/separata/update_fecha_limite.php`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          separata_id: separataId,
          fecha_limite: fechaLimite,
        }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error actualizando fecha límite");
    return json;
  },

  // Actualizar el título de separata
  async updateSeparataTitle(separataId, titulo, usuario) {
    const response = await fetch(
      `${API_BASE_URL}/compras/separata/update_separata_title.php`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          separata_id: separataId,
          titulo: titulo,
          usuario: usuario,
        }),
      }
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error actualizando el título");
    return json;
  },

  // Descargar reporte de ventas
  async downloadReporteVentas(separataId) {
    const response = await fetch(
      `${API_BASE_URL}/compras/separata/download_report_separata.php?separata_id=${separataId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("El reporte aún no está disponible");
      }
      throw new Error("Error al descargar el reporte");
    }

    return await response.blob();
  },

  // Obtener la ultima actualización
  async getLastUpdate() {
    const response = await fetch(
      `${API_BASE_URL}/compras/separata/last_update.php`
    );
    const json = await response.json();
    if (!response.ok) throw new Error("Error obteniendo última actualización");
    return json;
  },

  //////////////////////////////////////
  /////////// PEDIDOS CARNES ///////////
  //////////////////////////////////////

  // Verificar pedido existente
  async verificarPedidoHoyCarnes(sede) {
    const response = await fetch(
      `${API_BASE_URL}/carnes/pedidos/verificar_pedido_hoy.php?id_sede=${sede}`
    );
    const json = await response.json();

    if (!response.ok) throw new Error(json.error || "Error verificando pedido");

    return json;
  },

  // Obtener items de carnes
  async getItemsCarnes() {
    const response = await fetch(
      `${API_BASE_URL}/carnes/pedidos/get_items.php`
    );
    const json = await response.json();
    if (!response.ok)
      throw new Error(json.error || "Error obteniendo separatas");
    return json;
  },

  async savePedidoCarnes(data) {
    const response = await fetch(
      `${API_BASE_URL}/carnes/pedidos/guardar_pedido.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const json = await response.json();

    if (!json.success) throw new Error(json.message || "Error al guardar item");

    return json;
  },

  ///////////////////////////
  //// LECTOR DE PRECIOS ////
  ///////////////////////////

  // Obtener datos de item
  async getProductoBarras(codigoBarras, sede) {
    let endpoint;

    switch (sede) {
      case "001":
        endpoint = "get_producto.php";
        break;
      case "002":
        endpoint = "get_producto_b2.php";
        break;
      case "005":
        endpoint = "get_producto_b5.php";
        break;
      case "008":
        endpoint = "get_producto_b8.php";
        break;
      case "011":
        endpoint = "get_producto_b11.php";
        break;
      default:
        throw new Error(`Sede no válida: ${sede}.`);
    }

    const params = new URLSearchParams({ codigo_barras: codigoBarras });

    const response = await fetch(
      `${API_BASE_URL}/lector_precios/${endpoint}?${params}`
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }
    const json = await response.json();
    return json;
  },

  ////////////////////////////////
  //// CONTROL DE PROVEEDORES ////
  ////////////////////////////////

  async getVisitantes(page = 1, por_pagina = 20, search = "", filters = {}) {
    const params = new URLSearchParams({
      pagina: page,
      por_pagina,
      search,
      ...filters,
    });
    const response = await fetch(
      `${API_BASE_URL}/seguridad/visitantes/get_visitantes.php?${params}`
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo visitantes");
    return json;
  },

  async getVisitante(cedula) {
    const response = await fetch(
      `${API_BASE_URL}/seguridad/visitantes/get_visitante.php?cedula=${cedula}`
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo visitante");
    return json;
  },

  async createVisitante(data) {
    const res = await fetch(
      `${API_BASE_URL}/seguridad/visitantes/create_visitante.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(data),
      }
    );
    const json = await res.json();
    if (!json.success)
      throw new Error(json.message || "Error creando visitante");
    return json;
  },

  async updateVisitante(id, data) {
    const res = await fetch(
      `${API_BASE_URL}/seguridad/visitantes/update_visitante.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ id, ...data }),
      }
    );
    const json = await res.json();
    if (!json.success)
      throw new Error(json.message || "Error actualizando visitante");
    return json;
  },

  // Visitas
  async getVisitas(page = 1, por_pagina = 20, filters = {}) {
    const params = new URLSearchParams({
      pagina: page,
      por_pagina,
      ...filters,
    });
    const response = await fetch(
      `${API_BASE_URL}/seguridad/visitantes/get_visitas.php?${params}`
    );
    const json = await response.json();
    if (!json.success)
      throw new Error(json.message || "Error obteniendo visitas");
    return json;
  },

  async createVisita(data) {
    const res = await fetch(
      `${API_BASE_URL}/seguridad/visitantes/create_visita.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(data),
      }
    );
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Error creando visita");
    return json;
  },

  async updateVisita(id, data) {
    const res = await fetch(
      `${API_BASE_URL}/seguridad/visitantes/update_visita.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ id, ...data }),
      }
    );
    const json = await res.json();
    if (!json.success)
      throw new Error(json.message || "Error actualizando visita");
    return json;
  },
};
