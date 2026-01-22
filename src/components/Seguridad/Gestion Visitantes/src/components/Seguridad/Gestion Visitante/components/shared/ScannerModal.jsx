import React, { useState, useEffect } from 'react';
import { useScanner } from '../../hooks/useScanner';
import { FiX, FiCamera, FiEdit3, FiInfo, FiCheck } from 'react-icons/fi'; // Importamos iconos
import './ScannerModal.css';

const ScannerModal = ({ onClose, onScan }) => {
  const { startScanner, stopScanner, isScanning } = useScanner();
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  const handleScan = (data) => {
    stopScanner();
    onScan(data);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan({ documento: manualInput.trim() });
    }
  };

  return (
    <div className="scanner-modal-overlay">
      <div className="scanner-modal">
        <div className="scanner-header">
          <div className="header-title">
            <FiCamera className="icon-header" />
            <h3>Escanear Documento</h3>
          </div>
          <button onClick={onClose} className="btn-close">
            <FiX />
          </button>
        </div>

        <div className="scanner-content">
          <div className="scanner-area">
            {isScanning ? (
              <div className="scanner-active">
                <div className="scanner-frame">
                    <div className="scanning-line"></div> {/* Línea de escaneo animada */}
                </div>
                <p>Apunte al código de barras del documento</p>
              </div>
            ) : (
              <div className="scanner-placeholder">
                <button
                    onClick={() => startScanner(handleScan)}
                    className="btn-start-scanner"
                >
                    <FiCamera /> Iniciar Cámara
                </button>
              </div>
            )}
          </div>

          <div className="manual-input-section">
            <div className="section-divider">
                <span>O ingreso manual</span>
            </div>
            <div className="input-group">
                <FiEdit3 className="input-icon" />
                <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Número de documento"
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                />
                <button
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim()}
                    className="btn-apply"
                >
                    <FiCheck />
                </button>
            </div>
          </div>

          <div className="scanner-instructions">
            <div className="ins-title">
                <FiInfo /> <h4>Instrucciones</h4>
            </div>
            <ul>
              <li>Asegure buena iluminación en el área.</li>
              <li>Mantenga el documento a 15cm de la cámara.</li>
              <li>Centre el código de barras en el recuadro.</li>
            </ul>
          </div>
        </div>

        <div className="scanner-footer">
          <button onClick={onClose} className="btn-cancel">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;