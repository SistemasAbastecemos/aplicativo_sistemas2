import React, { useState } from 'react';
import ScannerModal from '../shared/ScannerModal';
import { FiCamera } from 'react-icons/fi'; // Importamos el icono de cámara
import './SearchSection.css';

const SearchSection = ({ formData, onChange, onDocumentoChange, onScannerData }) => {
  const [showScanner, setShowScanner] = useState(false);

  const handleScan = (data) => {
    if (data) {
      onScannerData(data);
      setShowScanner(false);
    }
  };

  return (
    <div className="search-section">
      <div className="form-row">
        <div className="form-group flex-1">
          <label>Tipo Documento</label>
          <select
            value={formData.tipoDocumento}
            onChange={(e) => onChange({ ...formData, tipoDocumento: e.target.value })}
            className="select-documento"
          >
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="CE">Cédula Extranjería</option>
            <option value="NIT">NIT (Empresas)</option>
            <option value="PASAPORTE">Pasaporte</option>
          </select>
        </div>

        <div className="form-group flex-2">
          <label>Número Documento *</label>
          <div className="input-with-button">
            <input
              type="text"
              value={formData.documento}
              onChange={onDocumentoChange}
              placeholder="Ingrese o escanee el número"
              maxLength="20"
              className="input-documento"
              required
            />
            <button
              type="button"
              className="btn-scan-trigger"
              onClick={() => setShowScanner(true)}
              title="Abrir escáner de cámara"
            >
              <FiCamera />
              <span>Escanear</span>
            </button>
          </div>
        </div>
      </div>

      {showScanner && (
        <ScannerModal
          onClose={() => setShowScanner(false)}
          onScan={handleScan}
        />
      )}
    </div>
  );
};

export default SearchSection;