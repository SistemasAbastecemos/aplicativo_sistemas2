/**
 * Parsea datos escaneados de PDF417 (Cédula Colombiana)
 * Formato esperado: [@T] [PAIS] [DOCUMENTO] [APELLIDO1 APELLIDO2] [NOMBRE1 NOMBRE2] ...
 */
export const parsearDatosEscaneados = (textoEscaneado) => {
  if (!textoEscaneado || typeof textoEscaneado !== 'string') {
    return { error: 'Texto escaneado no válido' };
  }

  const resultado = {
    documento: '',
    nombres: '',
    apellidos: '',
    tipoDocumento: 'CC',
    pais: 'COLOMBIA',
    raw: textoEscaneado
  };

  try {
    // Patrón para cédula colombiana PDF417
    const regexCedula = /\[@([A-Z])\]\s+\[([^\]]+)\]\s+\[([^\]]+)\]\s+\[([^\]]+)\]\s+\[([^\]]+)\]/;
    const matchCedula = textoEscaneado.match(regexCedula);

    if (matchCedula) {
      const [_, tipo, pais, documento, apellidos, nombres] = matchCedula;
      
      // Mapear tipo de documento
      const tiposMap = {
        'C': 'CC',  // Cédula de ciudadanía
        'E': 'CE',  // Cédula de extranjería
        'P': 'PASAPORTE',
        'N': 'NIT'
      };

      resultado.tipoDocumento = tiposMap[tipo] || 'CC';
      resultado.pais = pais;
      resultado.documento = documento.trim();
      resultado.apellidos = apellidos.trim();
      resultado.nombres = nombres.trim();
      
      return resultado;
    }

    // Si no coincide con el formato PDF417, buscar documento de 8-10 dígitos
    const regexDocumento = /\b(\d{8,10})\b/;
    const matchDoc = textoEscaneado.match(regexDocumento);
    
    if (matchDoc) {
      resultado.documento = matchDoc[1];
      
      // Intentar extraer nombres y apellidos si están presentes
      const partes = textoEscaneado.split(/\s+/);
      const posiblesNombres = partes.filter(p => 
        !p.match(/\d/) && 
        p.length > 2 && 
        !['@', '[', ']', 'COLOMBIA'].includes(p)
      );
      
      if (posiblesNombres.length >= 2) {
        // Asumir que los primeros dos son apellidos y los siguientes nombres
        resultado.apellidos = posiblesNombres.slice(0, 2).join(' ');
        resultado.nombres = posiblesNombres.slice(2).join(' ');
      }
      
      return resultado;
    }

    return resultado;
  } catch (error) {
    console.error('Error parseando datos escaneados:', error);
    return { error: 'Error al procesar datos escaneados' };
  }
};

/**
 * Valida número de cédula colombiana usando algoritmo Luhn
 */
export const validarCedulaColombiana = (cedula) => {
  if (!cedula || cedula.length < 8 || cedula.length > 10) return false;
  
  const digitos = cedula.split('').map(Number);
  const algoritmo = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  
  let suma = 0;
  for (let i = 0; i < digitos.length; i++) {
    suma += digitos[i] * algoritmo[digitos.length - i - 1];
  }
  
  return suma % 11 === 0;
};