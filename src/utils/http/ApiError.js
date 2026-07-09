/**
 * Error de API. Se comporta como un `Error` normal (mismo `.message`),
 * pero además expone el código HTTP (`status`) y el cuerpo del backend
 * (`payload`) por si quieres inspeccionarlos en un `catch`.
 *
 *   try {
 *     await apiService.getSedes();
 *   } catch (e) {
 *     if (e instanceof ApiError && e.status === 403) { ... }
 *   }
 */
export class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}
