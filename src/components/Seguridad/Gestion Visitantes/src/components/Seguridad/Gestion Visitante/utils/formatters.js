export const formatDocumento = (tipo, numero) => {
  const tipos = {
    'CC': 'C.C.',
    'CE': 'C.E.',
    'NIT': 'NIT',
    'PASAPORTE': 'Pasaporte',
    'OTRO': 'Doc.'
  };
  
  return `${tipos[tipo] || 'Doc.'} ${numero}`;
};

export const formatFecha = (fecha) => {
  if (!fecha) return '';
  
  const date = new Date(fecha);
  
  // Si es hoy, mostrar solo la hora
  const hoy = new Date();
  if (date.toDateString() === hoy.toDateString()) {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Si es de este año, no mostrar el año
  if (date.getFullYear() === hoy.getFullYear()) {
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDuracion = (minutos) => {
  if (!minutos || minutos < 1) return '< 1 min';
  
  if (minutos < 60) {
    return `${minutos} min`;
  }
  
  const horas = Math.floor(minutos / 60);
  const minsRestantes = minutos % 60;
  
  if (minsRestantes === 0) {
    return `${horas} h`;
  }
  
  return `${horas}h ${minsRestantes}m`;
};

export const formatPlaca = (placa) => {
  if (!placa) return '-';
  
  // Formatear placa colombiana (AAA123 o AA123A)
  const placaUpper = placa.toUpperCase();
  
  if (placaUpper.match(/^[A-Z]{3}\d{3}$/)) {
    return placaUpper;
  }
  
  if (placaUpper.match(/^[A-Z]{2}\d{4}$/)) {
    return placaUpper;
  }
  
  return placaUpper;
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const truncateText = (text, maxLength = 30) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};