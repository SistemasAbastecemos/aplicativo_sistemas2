1. Admin / Informes:
   - Backend Defensivo (update_informe.php): Antes de actualizar, consultamos los valores actuales del registro en la base de datos dentro de la misma transacción. Si una propiedad opcional (como orden o color) no viene en el payload, conservamos su valor actual en lugar de sobrescribirla con un valor estático.

   - Asignación Automática en Creación (create_informe.php): Si al crear un informe no se recibe un orden explícito, realizamos una consulta rápida dentro de la transacción para obtener el COALESCE(MAX(orden), 0) + 1 de manera dinámica y segura.

   - Sincronización de Estado en Frontend (useInformeForm.js): Inicializamos y propagamos correctamente tanto orden como color en las acciones de creación y edición.

   - Se añadio el nuevo campo de orden de Visualizacion (InformeFormTab.jsx): al final de la segunda columna. Se configura con un placeholder descriptivo que le indica al usuario que si lo deja vacío, el sistema calculará automáticamente el consecutivo (Último + 1).

   - Modificamos el método handleChange (useInformeForm.js) para procesar el campo orden de manera numérica. Si el usuario borra por completo el número del campo en el modal, el hook asignará un valor null, lo que le indicará al backend de creación que debe disparar la lógica de auto-incrementar MAX(orden) + 1.

// API CPANEL SEAO

# Changelog — API v1 (public + private) y Repositorio de Proveedores

> Entrada para el CHANGELOG del aplicativo SEAO. Formato basado en _Keep a Changelog_.

---

## [1.x.0] — 2026-07-17

### 🆕 Added — Nuevas funcionalidades

- **Superficie API pública (`api/v1/public`).** API de solo lectura para consumo externo (front-ends, servidores, scripts, Postman). Autenticación por `X-API-KEY`, rate limiting de 30 peticiones/minuto por aplicación, y envelope de respuesta estandarizado (`success` / `meta` / `data|error`).
- **Superficie API privada (`api/v1/private`).** API de consumo exclusivo de la propia app SEAO (mismo cPanel), que reutiliza el sistema de sesión (`auth.php`) y permisos granulares (`check_permission.php` → `requirePermiso`) ya existentes en el aplicativo. No usa API keys.
- **Repositorio `ProveedoresRepo` (core LAN).** Acceso a la vista `proveedores` de Biable con conmutación dinámica de empresa (`abastecemos` → `biable01`, `tobar` → `biable02`). Métodos: `listar`, `buscar` (por código/NIT o descripción), `buscarPorId` (llave compuesta código + sucursal).
- **Rutas nuevas en el router del core LAN:**
  - `general/listar_proveedores` → `ProveedoresRepo::listar`
  - `general/buscar_proveedores_biable` → `ProveedoresRepo::buscar`
  - `general/buscar_proveedor_id` → `ProveedoresRepo::buscarPorId`
- **Endpoint público `get_proveedores`.** Consume el repositorio en caliente vía `LanClient` y entrega un contrato simplificado: `nit`, `sucursal`, `nombre`, `codBanco`, `banco`, `diasPgo`, `condPgo`, `porcDscto`.
- **Endpoints privados `listar_proveedores` y `buscar_proveedor`** para uso interno de la app.
- **Núcleo reutilizable por superficie:** `bootstrap.php` (resolución de rutas absolutas con constantes), `Response.php` (envelope + `X-Request-ID`), `Controller.php` (clase base con validación de método y de permisos/scopes).
- **Scopes por API key.** Cada key puede restringirse a un subconjunto de endpoints mediante la columna `scopes`.
- **IP allowlist opcional por API key** (columna `ips_permitidas`).
- **Migración SQL `api_keys`** con `llave_hash` (SHA-256), `scopes`, `ips_permitidas`, `ultimo_uso` y `creada_en`.

### 🐛 Fixed — Correcciones

- **Ruta de inclusión de `LanClient` en el controlador de proveedores.** Se eliminó el `include_once` con `../` contados a mano (causaba `Failed to open stream` en cada petición) y se centralizó la resolución de rutas en `bootstrap.php` mediante la constante `APP_ROOT`.
- **Aclaración del contrato de datos entre capas.** Se confirmó que el core LAN envuelve su respuesta en la clave `resultado` y la API pública la re-emite bajo `data` (envelope estándar). Ambas claves son correctas y pertenecen a capas distintas; el controlador lee `resultado` explícitamente.

### 🔒 Security — Seguridad

- **API keys hasheadas (SHA-256)** con comparación en tiempo constante (`hash_equals`). Un dump de la tabla `api_keys` ya no expone llaves utilizables. Fallback a texto plano para migración sin downtime.
- **Ocultamiento de errores al cliente.** `display_errors` desactivado y `log_errors` activado en ambas superficies; los detalles de excepciones nunca se filtran en la respuesta HTTP. Cada error se registra en `RemoteLogger` con su `request_id`.
- **Whitelist del parámetro `empresa`** antes de propagarlo al core, evitando la inyección de nombres de base de datos arbitrarios.
- **Enmascaramiento de la API key en logs de auditoría**, junto con IP y `request_id` en cada intento denegado.
- **Endurecimiento vía `.htaccess`** en ambas superficies: bloqueo de acceso directo a archivos sensibles, desactivación de listado de directorios, cabeceras de seguridad (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) y supresión de `X-Powered-By`. La superficie privada usa `X-Frame-Options: SAMEORIGIN`.
- **Separación de exposición de datos.** La superficie pública se limita a datos semi-públicos (catálogo de proveedores); los datos sensibles quedan reservados a la superficie privada autenticada.

### ♻️ Changed — Cambios

- **CORS explícito por superficie.** La pública mantiene origen abierto (`*`) — correcto para una API consumida desde cualquier cliente; la seguridad recae en la API key + rate limit + HTTPS, no en CORS. La privada usa política de mismo origen.
- **Router basado en tabla enriquecida.** Público: `[Controlador, método, módulo, métodos_http, scope]`. Privado: `[Controlador, método, módulo, métodos_http, moduloRutaPermiso, accionPermiso]`. Validación temprana de método HTTP y de existencia del handler antes de instanciar.

### 📌 Notas de despliegue

1. Ejecutar `sql/migracion_api_keys.sql` **antes** de desplegar el código.
2. Asignar `scopes` a las API keys existentes (ej. `comercial.proveedores` o `*`).
3. Verificar que exista `logs/` con escritura en la raíz del aplicativo (si no, cae al `error_log` por defecto sin romperse).
4. Registrar las rutas `general/*` en el router del core LAN (servidor biable).
5. Confirmar que la superficie privada encuentra `middlewares/auth.php`, `check_permission.php` y `cors.php` en las rutas esperadas.

### ⚠️ Pendientes / Deuda técnica

- Migrar todas las apps a llaves hasheadas y luego vaciar/eliminar la columna `llave` en texto plano (fase 5 del SQL).
- Implementar los controladores de ejemplo referenciados (`ClientesController`, `NominaController`) o retirarlos del router hasta que existan.
- Evaluar caché de corta duración para `get_proveedores` (datos maestros de baja frecuencia de cambio; hoy cada petición golpea el core LAN).

// CORRECION DE BUGS

- en usePrefijosDian se corrige la funcion ejecutarGuardarConfiguracionDIan en donde una s; ejecutaba una excepcion silenciosa invalida que invocava una falsa notificacion de error al guardar la informacion.

// IMPLEMENTACION DE MODO OSCURO

Se instalo la libreria DarkReader para implementar el modo oscuro, con el hook en typeScript y el toogle en la topbar

// DASHBOARD

Se implemento bloque de utilidades /accesos directos y gestion segun permisos, se creo tabla de mysql

1.2.0] — 2026-07-24
🆕 Added — Autenticación Silenciosa con Microsoft (Office 365 / Entra ID)

Detección automática de sesión activa corporativa al cargar /login utilizando el parámetro prompt=none de OAuth 2.0.

Helper buildMicrosoftAuthUrl en src/components/Auth/utils/microsoftAuth.js para la generación dinámica de URLs de autorización.

♻️ Changed / 🏗️ Refactored — Arquitectura del Módulo de Autenticación

Descomposición de Login.jsx en componentes y hooks bajo el principio de responsabilidad única (SRP):

hooks/useMicrosoftAuth.js: Lógica de autenticación OAuth, intercambio de código, errores y circuit breaker de auto-login.

hooks/useLoginForm.js: Manejo de estado del formulario tradicional y recuperación de contraseña.

components/LeftPanel.jsx: Panel visual con branding corporativo y luces ambientales con Framer Motion.

components/LoginForm.jsx: Formulario presentacional de credenciales locales.

components/ForgotPasswordForm.jsx: Formulario presentacional de recuperación.

components/MicrosoftLoginButton.jsx: Botón presentacional SSO.

components/LoginFooter.jsx: Pie de página con datos de contacto.

Login.jsx: Componente contenedor y orquestador principal.

🐛 Fixed — Prevención de Bucle Infinito en Cierre de Sesión (Logout)

Control de estado en sessionStorage (user_logged_out, ms_silent_login_attempted) y propagación de ?logout=true en AuthContext para desactivar el auto-login tras un cierre de sesión manual.
