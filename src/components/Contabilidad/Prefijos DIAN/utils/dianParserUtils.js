/**
 * Normaliza fechas provenientes de celdas densas de Excel (numeros seriales o strings ISO/tradicionales)
 * Retorna un string formateado con patron estricto AAAA-MM-DD
 */
export const normalizarFechaDian = (fechaRaw) => {
  if (fechaRaw === null || fechaRaw === undefined) return "";

  // Procesamiento de numero de serie nativo de Excel
  if (
    typeof fechaRaw === "number" ||
    (!isNaN(fechaRaw) &&
      !String(fechaRaw).includes("-") &&
      !String(fechaRaw).includes("/"))
  ) {
    const numeroExcel = Number(fechaRaw);
    const fechaJs = new Date((numeroExcel - 25569) * 86400000);
    if (!isNaN(fechaJs.getTime())) {
      const ano = fechaJs.getUTCFullYear();
      const mes = String(fechaJs.getUTCMonth() + 1).padStart(2, "0");
      const dia = String(fechaJs.getUTCDate()).padStart(2, "0");
      return `${ano}-${mes}-${dia}`;
    }
  }

  const fechaStr = String(fechaRaw).trim();
  const soloFecha = fechaStr.split(" ")[0];

  // Evaluacion de formato tradicional DD/MM/AAAA o DD-MM-AAAA
  const regexFormatTradicional = /^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/;
  const matchTradicional = soloFecha.match(regexFormatTradicional);
  if (matchTradicional) {
    const [_, dia, mes, ano] = matchTradicional;
    return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }

  // Evaluacion de formato ISO AAAA/MM/DD o AAAA-MM-DD
  const regexFormatISO = /^(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})$/;
  const matchISO = soloFecha.match(regexFormatISO);
  if (matchISO) {
    const [_, ano, mes, dia] = matchISO;
    return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }

  return soloFecha;
};

/**
 * Cruza las celdas de un registro DIAN contra las reglas vivas del maestro fiscal parametrizado
 */
export const extraerSedeYTipoDianDinamico = (
  tipoDocRaw,
  prefijoRaw,
  maestroDianActivo,
) => {
  const tipoDoc = String(tipoDocRaw).trim().toUpperCase();
  const p = String(prefijoRaw).trim().toUpperCase();
  const esNota =
    tipoDoc.includes("NOTA DE CRÉDITO") || tipoDoc.includes("NOTA DE CREDITO");

  const reglaMatch = maestroDianActivo.find((regla) => {
    if (regla.activo !== undefined && Number(regla.activo) === 0) return false;
    const prefijosPermitidos = String(regla.prefijos_dian || "")
      .split(",")
      .map((x) => x.trim().toUpperCase())
      .filter(Boolean);
    return (
      prefijosPermitidos.includes(p) &&
      esNota === (regla.tipo_documento === "NOTA")
    );
  });

  if (reglaMatch) {
    return {
      sede: reglaMatch.co_siesa
        ? String(reglaMatch.co_siesa).padStart(3, "0")
        : "",
      tipo: reglaMatch.tipo_siesa
        ? String(reglaMatch.tipo_siesa).trim().toUpperCase()
        : p,
    };
  }
  return { sede: "", tipo: p };
};
