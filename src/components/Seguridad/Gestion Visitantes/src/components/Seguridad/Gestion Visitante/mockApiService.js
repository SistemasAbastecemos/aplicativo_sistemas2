// Mock para probar el frontend SIN backend
export const mockApiService = {
  // Simula delay de red
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Datos de prueba
  fichasMock: [
    { id: 1, numero: '001', estado: 'DISPONIBLE' },
    { id: 2, numero: '002', estado: 'DISPONIBLE' },
    { id: 3, numero: '003', estado: 'OCUPADA', visitante: 'Juan Pérez' },
    { id: 4, numero: '004', estado: 'DISPONIBLE' },
    { id: 5, numero: '005', estado: 'DISPONIBLE' },
    { id: 6, numero: '006', estado: 'OCUPADA', visitante: 'Ana Gómez' },
    { id: 7, numero: '007', estado: 'DISPONIBLE' },
    { id: 8, numero: '008', estado: 'DISPONIBLE' },
  ],
  
  visitantesMock: {
    '12345678': {
      documento: '12345678',
      nombres: 'CARLOS',
      apellidos: 'RODRIGUEZ',
      es_proveedor: true,
      es_blacklist: false,
      incidentes: []
    },
    '87654321': {
      documento: '87654321',
      nombres: 'ANA',
      apellidos: 'GOMEZ',
      es_proveedor: false,
      es_blacklist: true,
      incidentes: [
        { fecha: '2024-01-15', tipo: 'INFRACCION', descripcion: 'Acceso no autorizado a zona restringida' }
      ]
    },
    '23456789': {
      documento: '23456789',
      nombres: 'LUIS',
      apellidos: 'MARTINEZ',
      es_proveedor: true,
      es_blacklist: false,
      incidentes: []
    }
  },

  // Métodos mock
  async getFichasPorteria(sedeId) {
    await this.delay(800); // Simular delay de red
    return {
      success: true,
      data: this.fichasMock
    };
  },

  async buscarVisitantePorteria(documento, sedeId) {
    await this.delay(600);
    
    if (this.visitantesMock[documento]) {
      return {
        success: true,
        data: this.visitantesMock[documento]
      };
    }
    
    // Visitante nuevo
    return {
      success: true,
      data: {
        documento,
        es_nuevo: true,
        nombres: '',
        apellidos: '',
        es_proveedor: false,
        es_blacklist: false,
        incidentes: []
      }
    };
  },

  async registrarVisitaPorteria(data) {
    await this.delay(1200);
    console.log('Registro mock:', data);
    
    // Simular éxito
    return {
      success: true,
      data: {
        visita_id: Math.floor(Math.random() * 1000),
        ficha_numero: data.fichaNumero || '001',
        timestamp: new Date().toISOString(),
        qr_data: 'mock_qr_data'
      }
    };
  },

  async getVisitantesActivosPorteria(sedeId) {
    await this.delay(1000);
    return {
      success: true,
      data: [
        {
          id: 1,
          documento: '12345678',
          nombres: 'CARLOS',
          apellidos: 'RODRIGUEZ',
          ficha_numero: '003',
          fecha_ingreso: '2024-01-20 08:30:00',
          tiempo_transcurrido: 125,
          placa: 'ABC123',
          motivo_visita: 'DESCARGA'
        },
        {
          id: 2,
          documento: '23456789',
          nombres: 'LUIS',
          apellidos: 'MARTINEZ',
          ficha_numero: '006',
          fecha_ingreso: '2024-01-20 09:15:00',
          tiempo_transcurrido: 80,
          placa: 'XYZ789',
          motivo_visita: 'MANTENIMIENTO'
        }
      ]
    };
  },

  async liberarVisitaPorteria(visitaId, fichaId) {
    await this.delay(800);
    console.log('Liberar visita mock:', { visitaId, fichaId });
    return {
      success: true,
      message: 'Visita liberada exitosamente'
    };
  },

  async sincronizarVisitasOffline(datosOffline) {
    await this.delay(500);
    console.log('Sincronización mock:', datosOffline);
    return {
      success: true,
      processed: datosOffline.length,
      message: 'Datos sincronizados correctamente'
    };
  }
};