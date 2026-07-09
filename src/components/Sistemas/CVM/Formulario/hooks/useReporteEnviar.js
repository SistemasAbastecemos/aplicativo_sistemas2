import { useState, useCallback } from "react";
import { apiService } from "../../../../../services/api";
import { obtenerFechaActual } from "../utils/helpers";
import { VERIFICACIONES } from "../utils/constants";

/**
 * Encapsula el envío del reporte, con dos flujos:
 *  1. `enviarReporteTodas`: reporte general "sin novedad", no requiere fotos
 *     ni equipo. Un solo POST simple.
 *  2. `enviarReporteCaja`: reporte específico de una caja. Sube las 3 fotos
 *     en paralelo, calcula estado_inicial / estado_final según los estados,
 *     y guarda el registro. Si el POST del registro falla, hace rollback de
 *     las imágenes subidas para no dejar huérfanas.
 *
 * `onExitoso` se dispara tras un envío exitoso — el orquestador lo usa
 * para resetear el formulario completo.
 */
export function useReporteEnviar({ addNotification, onExitoso }) {
  const [cargando, setCargando] = useState(false);

  const enviarReporteTodas = useCallback(
    async ({ nombre, cedula, sedeCodigo, idCaja }) => {
      setCargando(true);

      if (!nombre) {
        addNotification({
          message: "Por favor, seleccione un nombre antes de enviar.",
          type: "danger",
        });
        setCargando(false);
        return;
      }

      const registroData = {
        fecha: obtenerFechaActual(),
        nombre,
        cedula,
        id_caja: idCaja,
        id_sede: sedeCodigo,
        estado_inicial: "Bueno",
        estado_final: "Bueno",
        observaciones:
          "La sede ha realizado todas las balanzas de todas las cajas y no hubo novedad, este reporte queda como registro de aquello",
      };

      try {
        const response = await apiService.saveRegistroTodasOK(registroData);

        if (response.success) {
          addNotification({
            message: "Registro guardado exitosamente.",
            type: "success",
          });
          if (onExitoso) onExitoso();
        } else {
          addNotification({
            message: "Error al guardar el registro.",
            type: "error",
          });
        }
      } catch (error) {
        addNotification({
          message:
            "Ocurrió un error al guardar el reporte: " +
            (error.message || error),
          type: "error",
        });
      } finally {
        setCargando(false);
      }
    },
    [addNotification, onExitoso],
  );

  const enviarReporteCaja = useCallback(
    async ({
      nombre,
      cedula,
      sedeCodigo,
      cajaSeleccionada,
      equipoInfo,
      verificaciones,
      observaciones,
    }) => {
      setCargando(true);

      // Validar que las 3 verificaciones estén completas
      const faltantes = VERIFICACIONES.filter(
        (v) => !verificaciones[v.tipo]?.file,
      );
      if (!nombre || faltantes.length > 0) {
        addNotification({
          message:
            "Por favor, ingrese todos los datos antes de enviar el registro.",
          type: "danger",
        });
        setCargando(false);
        return;
      }

      let uploadedImages = [];
      let registroExitoso = false;

      try {
        // Subir imágenes en paralelo
        const uploadImage = async (file, tipo) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("tipo", tipo);
          const response = await apiService.uploadImagenCvm(formData);
          return response.url;
        };

        const uploadPromises = VERIFICACIONES.map((v) =>
          uploadImage(verificaciones[v.tipo].file, v.tipo),
        );

        const [urlConforme, urlRegularizacion, urlPrecinto] =
          await Promise.all(uploadPromises);

        uploadedImages = [urlConforme, urlRegularizacion, urlPrecinto];

        // Calcular estados agregados según legacy
        const estados = {
          conforme: verificaciones.conforme.estado,
          regularizacion: verificaciones.regularizacion.estado,
          precinto: verificaciones.precinto.estado,
        };

        const hayMalo = Object.values(estados).some((e) => e === "Malo");
        const estadoInicial = hayMalo ? "Malo" : "Bueno";
        const estadoFinal = hayMalo ? "Requiere Acción" : "Bueno";

        const registroData = {
          fecha: obtenerFechaActual(),
          nombre,
          cedula,
          id_caja: cajaSeleccionada.id_caja,
          id_sede: sedeCodigo,
          tipo_balanza: equipoInfo.tipo,
          serial: equipoInfo.serial,
          nii: equipoInfo.nii,
          estado_simel: equipoInfo.estadoSimel,
          fecha_certificacion: equipoInfo.fechaCertificacion,
          estado_conforme: estados.conforme,
          estado_regularizacion: estados.regularizacion,
          estado_precinto: estados.precinto,
          foto_conforme: urlConforme,
          foto_regularizacion: urlRegularizacion,
          foto_precinto: urlPrecinto,
          estado_inicial: estadoInicial,
          estado_final: estadoFinal,
          observaciones: observaciones.trim(),
        };

        const response = await apiService.saveRegistroCVM(registroData);

        if (response.success) {
          registroExitoso = true;
          addNotification({
            message: "Registro guardado exitosamente.",
            type: "success",
          });
          if (onExitoso) onExitoso();
        } else {
          throw new Error(response.error || "Error al guardar el registro");
        }
      } catch (error) {
        // Rollback: si el registro falló pero las imágenes ya se subieron,
        // pedir al backend que las elimine para no dejar archivos huérfanos.
        if (uploadedImages.length > 0 && !registroExitoso) {
          try {
            await apiService.eliminarImagenes({ urls: uploadedImages });
          } catch (deleteError) {
            console.error("Error eliminando imágenes huérfanas:", deleteError);
          }
        }

        addNotification({
          message:
            "Ocurrió un error al guardar el reporte: " +
            (error.message || error),
          type: "error",
        });
      } finally {
        setCargando(false);
      }
    },
    [addNotification, onExitoso],
  );

  return {
    cargando,
    enviarReporteTodas,
    enviarReporteCaja,
  };
}
