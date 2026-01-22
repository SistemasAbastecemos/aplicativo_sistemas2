export const validarDocumento = (tipo, numero) => {
  if (!numero || !tipo) return false;
  
  const documento = numero.toString().trim();
  
  // Validar longitud mínima según tipo
  const longitudes = {
    'CC': { min: 8, max: 10 },
    'CE': { min: 6, max: 20 },
    'NIT': { min: 9, max: 15 },
    'PASAPORTE': { min: 6, max: 20 },
    'OTRO': { min: 4, max: 20 }
  };
  
  const config = longitudes[tipo] || { min: 4, max: 20 };
  
  if (documento.length < config.min || documento.length > config.max) {
    return false;
  }
  
  // Solo números para CI y NIT
  if (tipo === 'CC' || tipo === 'NIT') {
    return /^\d+$/.test(documento);
  }
  
  // Permitir letras y números para otros
  return /^[A-Za-z0-9]+$/.test(documento);
};

export const validarPlacaColombiana = (placa) => {
  if (!placa) return true; // No requerido
  
  const placaUpper = placa.toUpperCase().trim();
  
  // Patrones de placas colombianas comunes
  const patrones = [
    /^[A-Z]{3}\d{3}$/,           // AAA123 (Particular viejo)
    /^[A-Z]{3}\d{2}[A-Z]$/,      // AAA12A (Particular nuevo)
    /^[A-Z]{2}\d{4}$/,           // AA1234 (Moto)
    /^[A-Z]{2}\d{3}[A-Z]$/,      // AA123A (Moto nueva)
    /^[A-Z]\d{4}[A-Z]$/,         // A1234A (Especial)
    /^[A-Z]\d{5}$/,              // A12345 (Público antiguo)
    /^[A-Z]{2}\d{5}$/,           // AA12345 (Público)
    /^[A-Z]{3}\d{4}$/,           // AAA1234 (Carga)
    /^[A-Z]\d{4}$/,              // A1234 (Diplomática)
    /^CC\d{4}$/,                 // CC1234 (Cuerpo Consular)
    /^CD\d{4}$/,                 // CD1234 (Cuerpo Diplomático)
    /^OI\d{4}$/,                 // OI1234 (Organismo Internacional)
    /^S\d{4}[A-Z]$/,             // S1234A (Servicio Especial)
  ];
  
  return patrones.some(patron => patron.test(placaUpper));
};

export const validarEmail = (email) => {
  if (!email) return true; // No requerido
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

export const validarTelefono = (telefono) => {
  if (!telefono) return true;
  
  // Permitir números de 7 a 15 dígitos, con o sin espacios, guiones, paréntesis
  const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
  return /^[0-9]{7,15}$/.test(telefonoLimpio);
};

export const validarFoto = (fotoBase64, esProveedor) => {
  if (!esProveedor) return true; // Solo requerida para proveedores
  
  if (!fotoBase64) return false;
  
  try {
    // Verificar que sea una imagen válida base64
    if (!fotoBase64.startsWith('data:image/')) {
      return false;
    }
    
    // Verificar tamaño máximo (500KB)
    const base64Length = fotoBase64.length - (fotoBase64.indexOf(',') + 1);
    const padding = (fotoBase64.charAt(base64Length - 1) === '=' ? 
      (fotoBase64.charAt(base64Length - 2) === '=' ? 2 : 1) : 0);
    const fileSize = (base64Length * 3) / 4 - padding;
    
    return fileSize <= 500 * 1024; // 500KB máximo
  } catch {
    return false;
  }
};

export const validarRangoFechas = (desde, hasta) => {
  if (!desde || !hasta) return true;
  
  const fechaDesde = new Date(desde);
  const fechaHasta = new Date(hasta);
  
  if (fechaDesde > fechaHasta) {
    return false;
  }
  
  // No permitir búsquedas de más de 90 días
  const diferenciaDias = (fechaHasta - fechaDesde) / (1000 * 60 * 60 * 24);
  return diferenciaDias <= 90;
};

export const sanitizarInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>"'`]/g, '') // Eliminar caracteres peligrosos
    .substring(0, 255); // Limitar longitud
};