import React, { useState, useEffect } from 'react';
import { formatFecha } from '../../utils/formatters';
import './HistorialTab.css';
import * as XLSX from 'xlsx';
import { FiDownload } from 'react-icons/fi';

const HistorialTab = () => {
  const [historial, setHistorial] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState('hoy');

  const cargarHistorial = async (numPagina = 1) => {
    setLoading(true);
    try {
      const hoy = new Date().toISOString().split('T')[0];
      let fechaDesde = hoy;
      let fechaHasta = hoy;

      if (filtroFecha === 'ayer') {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);
        fechaDesde = ayer.toISOString().split('T')[0];
        fechaHasta = fechaDesde;
      } else if (filtroFecha === 'semana') {
        const semanaPasada = new Date();
        semanaPasada.setDate(semanaPasada.getDate() - 7);
        fechaDesde = semanaPasada.toISOString().split('T')[0];
      }

      const response = await fetch(
        `/api/historial_visitas.php?` +
        `pagina=${numPagina}&` +
        `fecha_desde=${fechaDesde}&` +
        `fecha_hasta=${fechaHasta}`
      );

      if (response.ok) {
        const data = await response.json();
        setHistorial(data.visitas || []);
        setTotalPaginas(data.totalPaginas || 1);
        setPagina(data.pagina || 1);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorial(1);
  }, [filtroFecha]);

  // FUNCIÓN DE EXPORTACIÓN CORREGIDA
  const exportarExcel = () => {
    if (historial.length === 0) {
      alert("No hay datos para exportar en este momento.");
      return;
    }

    // 1. Mapear los datos con nombres de columnas legibles
    const datosParaExportar = historial.map(item => ({
      "Fecha de Ingreso": formatFecha(item.fecha_ingreso),
      "Nombre Completo": `${item.nombres} ${item.apellidos}`,
      "Documento": item.documento,
      "Placa Vehículo": item.placa || 'N/A',
      "Número de Ficha": `#${item.ficha_numero}`,
      "Hora Entrada": new Date(item.fecha_ingreso).toLocaleTimeString(),
      "Hora Salida": item.fecha_salida 
        ? new Date(item.fecha_salida).toLocaleTimeString() 
        : 'Aún en sitio',
      "Tiempo Total (min)": item.tiempo_total || 0
    }));

    // 2. Crear el libro y la hoja
    const hoja = XLSX.utils.json_to_sheet(datosParaExportar);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Historial de Visitas");

    // 3. Generar descarga
    const fechaArchivo = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(libro, `Reporte_Visitantes_${fechaArchivo}.xlsx`);
  };

  return (
    <div className="historial-tab">
      <div className="tab-header">
        <h2>Historial de Visitantes</h2>
        <div className="header-actions">
          <select
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="filtro-fecha"
          >
            <option value="hoy">Hoy</option>
            <option value="ayer">Ayer</option>
            <option value="semana">Última Semana</option>
            <option value="mes">Último Mes</option>
          </select>
          <button onClick={exportarExcel} className="btn-exportar">
            <FiDownload /> Exportar Excel
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="estadisticas-container">
        <div className="estadistica-card">
          <div className="estadistica-valor">{historial.length}</div>
          <div className="estadistica-label">Total Registros</div>
        </div>
        <div className="estadistica-card">
          <div className="estadistica-valor">
            {historial.filter(v => v.es_proveedor).length}
          </div>
          <div className="estadistica-label">Proveedores</div>
        </div>
        <div className="estadistica-card">
          <div className="estadistica-valor">
            {historial.filter(v => v.tiene_incidentes).length}
          </div>
          <div className="estadistica-label">Incidentes</div>
        </div>
      </div>

      {/* Tabla */}
      <div className="historial-table-container">
        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Cargando datos...</p>
          </div>
        ) : (
          <table className="historial-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Visitante</th>
                <th>Documento</th>
                <th>Placa</th>
                <th>Ficha</th>
                <th>Ingreso</th>
                <th>Salida</th>
                <th>Tiempo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((item) => (
                <tr key={item.id}>
                  <td>{formatFecha(item.fecha_ingreso)}</td>
                  <td>{item.nombres} {item.apellidos}</td>
                  <td>{item.documento}</td>
                  <td>{item.placa || '-'}</td>
                  <td>#{item.ficha_numero}</td>
                  <td>{new Date(item.fecha_ingreso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>{item.fecha_salida 
                    ? new Date(item.fecha_salida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '🟢 En sitio'}
                  </td>
                  <td>{item.tiempo_total} min</td>
                  <td>
                    <button className="btn-ver-detalle" onClick={() => window.open(`/detalle/${item.id}`)}>
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="paginacion">
          <button onClick={() => cargarHistorial(pagina - 1)} disabled={pagina === 1}>
            Anterior
          </button>
          <span className="info-pagina">Página {pagina} de {totalPaginas}</span>
          <button onClick={() => cargarHistorial(pagina + 1)} disabled={pagina === totalPaginas}>
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default HistorialTab;