import { useMemo } from "react";

export const useDianAnalytics = (
  configList,
  configListEdit,
  reporte,
  alertasSiesaHuerfanos,
  datosDian,
  columnas,
  diasConciliados,
) => {
  // Transforma y agrupa jerarquicamente bajo ordenamientos naturales estrictos
  const sedesAgrupadas = useMemo(() => {
    const estructuraIntermedia = {};
    configListEdit.forEach((row) => {
      const Sede = row.grupo_sede
        ? String(row.grupo_sede).trim().toUpperCase()
        : "SIN SEDE";
      const rangoStr = `${String(row.fecha_desde).trim()} AL ${String(row.fecha_hasta).trim()}`;
      if (!estructuraIntermedia[Sede]) estructuraIntermedia[Sede] = {};
      if (!estructuraIntermedia[Sede][rangoStr])
        estructuraIntermedia[Sede][rangoStr] = [];
      estructuraIntermedia[Sede][rangoStr].push(row.indexOriginal);
    });

    const ordenarSedesNatural = (a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
    const ordenarPeriodosInverso = (a, b) =>
      new Date(b.substring(0, 10)) - new Date(a.substring(0, 10));

    const estructuraFinalOrdenada = {};
    Object.keys(estructuraIntermedia)
      .sort(ordenarSedesNatural)
      .forEach((Sede) => {
        estructuraFinalOrdenada[Sede] = {};
        Object.keys(estructuraIntermedia[Sede])
          .sort(ordenarPeriodosInverso)
          .forEach((periodo) => {
            estructuraFinalOrdenada[Sede][periodo] =
              estructuraIntermedia[Sede][periodo];
          });
      });

    return estructuraFinalOrdenada;
  }, [configListEdit]);

  // Ejecuta el cruce matricial denso buscando inconsistencias cronologicas de timbrado externo
  const alertasHuerfanasConsolidadas = useMemo(() => {
    const listaAlertas = [...alertasSiesaHuerfanos];
    if (!reporte || reporte.length === 0) return listaAlertas;

    reporte.forEach((item) => {
      if (!item.dias) return;
      const reglasCandidatas = configList.filter(
        (c) =>
          Number(c.activo) === 1 &&
          String(c.co_siesa).padStart(3, "0") ===
            String(item.co_siesa).padStart(3, "0") &&
          String(c.tipo_siesa).trim().toUpperCase() ===
            String(item.tipo).trim().toUpperCase(),
      );
      if (reglasCandidatas.length === 0) return;

      Object.keys(item.dias).forEach((fechaKey) => {
        const diaData = item.dias[fechaKey];
        const ano = fechaKey.substring(0, 4);
        const mes = fechaKey.substring(4, 6);
        const dia = fechaKey.substring(6, 8);
        const fechaFormateadaLegible = `${ano}-${mes}-${dia}`;
        const fechaMovimiento = new Date(`${ano}-${mes}-${dia}T00:00:00`);

        let regla =
          reglasCandidatas.find((c) => {
            const d = new Date(`${c.fecha_desde}T00:00:00`);
            const h = new Date(`${c.fecha_hasta}T00:00:00`);
            return fechaMovimiento >= d && fechaMovimiento <= h;
          }) || reglasCandidatas[0];

        const desde = new Date(`${regla.fecha_desde}T00:00:00`);
        const hasta = new Date(`${regla.fecha_hasta}T00:00:00`);
        let totalDianFila = 0;

        if (datosDian && datosDian[fechaKey]) {
          const centroOad = item.co_siesa
            ? String(item.co_siesa).padStart(3, "0")
            : "";
          const reglasAsociadas = configList.filter(
            (r) =>
              Number(r.activo) === 1 &&
              String(r.co_siesa).padStart(3, "0") === centroOad &&
              String(r.tipo_siesa).trim().toUpperCase() ===
                String(item.tipo).trim().toUpperCase(),
          );

          reglasAsociadas.forEach((reglaAsoc) => {
            const prefijos = String(reglaAsoc.prefijos_dian || "")
              .split(",")
              .map((x) => x.trim().toUpperCase())
              .filter(Boolean);
            prefijos.forEach((prefijo) => {
              const llaveCompuesta = `${centroOad}_${String(item.tipo).trim().toUpperCase()}_${prefijo}`;
              if (datosDian[fechaKey].totales_compuestos?.[llaveCompuesta]) {
                totalDianFila +=
                  datosDian[fechaKey].totales_compuestos[llaveCompuesta];
              }
            });
          });
        }

        if (
          diaData &&
          diaData.total > 0 &&
          (fechaMovimiento < desde || fechaMovimiento > hasta)
        ) {
          if (
            !listaAlertas.some(
              (a) =>
                a.tipo === item.tipo &&
                a.co === item.co_siesa &&
                a.fecha === fechaFormateadaLegible,
            )
          ) {
            listaAlertas.push({
              origen: "VIGENCIA VIOLADA EN SIESA",
              tipo: item.tipo,
              co: item.co_siesa,
              total: diaData.total,
              fecha: fechaFormateadaLegible,
              detalle_error: `Fuera del rango parametrizado (${regla.fecha_desde} al ${regla.fecha_hasta})`,
            });
          }
        }

        if (
          (diaData?.total || 0) === 0 &&
          totalDianFila > 0 &&
          (fechaMovimiento < desde || fechaMovimiento > hasta)
        ) {
          if (
            !listaAlertas.some(
              (a) =>
                a.tipo === item.tipo &&
                a.co === item.co_siesa &&
                a.fecha === fechaFormateadaLegible,
            )
          ) {
            listaAlertas.push({
              origen: "DIAN FUERA DE VIGENCIA",
              tipo: item.tipo,
              co: item.co_siesa,
              total: totalDianFila,
              fecha: fechaFormateadaLegible,
              detalle_error: `La DIAN reporta ${totalDianFila} folios timbrados pero Siesa tiene cero.`,
            });
          }
        }
      });
    });
    return listaAlertas;
  }, [alertasSiesaHuerfanos, reporte, configList, datosDian]);

  const diasNuevosParaGuardar = useMemo(() => {
    if (!datosDian) return 0;
    return columnas.filter((col) => {
      const fk = col.replace(/-/g, "");
      return (
        datosDian[fk] &&
        datosDian[fk].total_general > 0 &&
        !diasConciliados[col]
      );
    }).length;
  }, [datosDian, columnas, diasConciliados]);

  return {
    sedesAgrupadas,
    alertasHuerfanasConsolidadas,
    diasNuevosParaGuardar,
  };
};
