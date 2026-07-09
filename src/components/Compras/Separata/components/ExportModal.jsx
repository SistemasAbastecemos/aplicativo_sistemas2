import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faFileDownload,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../ProgramacionSeparata.module.css";

/**
 * Modal de exportación: elige tipo de precio (final vs regular), listas de
 * precios a incluir en el TXT posicional, y dispara la generación.
 */
const ExportModal = ({
  onClose,
  listasPrecios,
  onListasChange,
  itemsSeparata,
  onExportTxt,
  onExportExcel,
}) => {
  const [tipoExportacion, setTipoExportacion] = useState("final");

  const handleListaPreciosChange = (listaPrecios) => {
    if (listasPrecios.includes(listaPrecios)) {
      onListasChange(listasPrecios.filter((pl) => pl !== listaPrecios));
    } else {
      onListasChange([...listasPrecios, listaPrecios]);
    }
  };

  const listasPreciosDisponibles = [
    { id: "01", nombre: "B1" },
    { id: "30", nombre: "B2" },
    { id: "50", nombre: "B5" },
    { id: "06", nombre: "B6" },
    { id: "08", nombre: "B8" },
    { id: "13", nombre: "B9" },
    { id: "011", nombre: "B11" },
  ];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Exportar Separata</h3>
          <button className={styles.modalClose} onClick={onClose} type="button">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.exportSection}>
            <h4>Tipo de Exportación</h4>
            <div className={styles.exportOptions}>
              <label className={styles.exportOption}>
                <input
                  type="radio"
                  value="final"
                  checked={tipoExportacion === "final"}
                  onChange={(e) => setTipoExportacion(e.target.value)}
                />
                <div className={styles.exportOptionContent}>
                  <strong>Precio Final</strong>
                  <span>Usa precio con descuento y fecha inicial</span>
                </div>
              </label>
              <label className={styles.exportOption}>
                <input
                  type="radio"
                  value="regular"
                  checked={tipoExportacion === "regular"}
                  onChange={(e) => setTipoExportacion(e.target.value)}
                />
                <div className={styles.exportOptionContent}>
                  <strong>Precio Regular</strong>
                  <span>Usa precio regular con fecha final +1 día</span>
                </div>
              </label>
            </div>
          </div>

          <div className={styles.exportSection}>
            <h4>Listas de Precios</h4>
            <div className={styles.listasGrid}>
              {listasPreciosDisponibles.map((lista) => (
                <label key={lista.id} className={styles.listaOption}>
                  <input
                    type="checkbox"
                    checked={listasPrecios.includes(lista.id)}
                    onChange={() => handleListaPreciosChange(lista.id)}
                  />
                  <span>
                    {lista.id} ({lista.nombre})
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.exportInfo}>
            <p>
              <strong>Items a exportar:</strong> {itemsSeparata.length}
            </p>
            <p>
              <strong>Listas seleccionadas:</strong> {listasPrecios.length}
            </p>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className={styles.exportTxtButton}
            onClick={() => {
              onExportTxt(tipoExportacion);
              onClose();
            }}
            type="button"
          >
            <FontAwesomeIcon icon={faFileDownload} />
            Exportar TXT
          </button>
          <button
            className={styles.exportExcelButton}
            onClick={() => {
              onExportExcel();
              onClose();
            }}
            type="button"
          >
            <FontAwesomeIcon icon={faFileExcel} />
            Exportar Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
