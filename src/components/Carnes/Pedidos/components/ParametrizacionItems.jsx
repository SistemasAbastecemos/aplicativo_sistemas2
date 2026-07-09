import React from "react";
import styles from "../FormularioPedidos.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faSort,
  faSortUp,
  faSortDown,
  faBarcode,
  faDolly,
} from "@fortawesome/free-solid-svg-icons";
import { useParametrizacionCarnes } from "../hooks/useParametrizacionCarnes";
import { ParametrizacionModal } from "./ParametrizacionModal";
import EmptyState from "../../../UI/EmptyState";

export const ParametrizacionItems = React.memo(({ addNotification }) => {
  const ctrl = useParametrizacionCarnes(addNotification);

  const renderIconoSort = (key) => {
    if (ctrl.sortConfig.key !== key) return faSort;
    return ctrl.sortConfig.direction === "asc" ? faSortUp : faSortDown;
  };

  return (
    <div className={styles.configTabContainer}>
      <div className={styles.configTabToolbar}>
        <div>
          <h2>Catálogo Operativo de Carnes</h2>
          <p>
            Configura las claves de ítem, unidades de medida y categorías
            fiscales.
          </p>
        </div>
        <button
          type="button"
          onClick={ctrl.abrirCreacion}
          className={styles.appleBtnPrimaryAction}
        >
          <FontAwesomeIcon icon={faPlus} /> Agregar Producto
        </button>
      </div>

      {ctrl.items.length === 0 ? (
        <EmptyState
          icon={faDolly}
          title="Sin ítems configurados"
          description="El catálogo maestro se encuentra vacío."
        />
      ) : (
        <>
          {/* Vista Escritorio */}
          <div className={styles.desktopConfigView}>
            <table className={styles.appleConfigTable}>
              <thead>
                <tr>
                  <th
                    onClick={() => ctrl.ordenarPor("id_item")}
                    className={styles.sortableTh}
                  >
                    Código <FontAwesomeIcon icon={renderIconoSort("id_item")} />
                  </th>
                  <th
                    onClick={() => ctrl.ordenarPor("descripcion")}
                    className={styles.sortableTh}
                  >
                    Descripción{" "}
                    <FontAwesomeIcon icon={renderIconoSort("descripcion")} />
                  </th>
                  <th
                    onClick={() => ctrl.ordenarPor("unidad_medida")}
                    className={styles.sortableTh}
                  >
                    U.M{" "}
                    <FontAwesomeIcon icon={renderIconoSort("unidad_medida")} />
                  </th>
                  <th
                    onClick={() => ctrl.ordenarPor("categoria")}
                    className={styles.sortableTh}
                  >
                    Categoría{" "}
                    <FontAwesomeIcon icon={renderIconoSort("categoria")} />
                  </th>
                  <th style={{ textAlign: "center" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {ctrl.items.map((item) => (
                  <tr key={item.id}>
                    <td className={styles.monoCode}>{item.id_item}</td>
                    <td className={styles.textBold1d}>{item.descripcion}</td>
                    <td>
                      <span className={styles.umPill}>
                        {item.unidad_medida}
                      </span>
                    </td>
                    <td>
                      <span className={styles.catPill}>{item.categoria}</span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => ctrl.abrirEdicion(item)}
                        className={styles.btnRowEdit}
                      >
                        <FontAwesomeIcon icon={faEdit} /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista Móvil */}
          <div className={styles.mobileConfigView}>
            <div className={styles.itemsResponsiveGridCanvas}>
              {ctrl.items.map((item) => (
                <div key={item.id} className={styles.productAppleBentoCard}>
                  <div className={styles.productCardHeader}>
                    <span className={styles.itemCodeIndicator}>
                      REF: {item.id_item}
                    </span>
                    <button
                      type="button"
                      onClick={() => ctrl.abrirEdicion(item)}
                      className={styles.btnStepperAction}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </div>
                  <h3 className={styles.productCardTitle}>
                    {item.descripcion}
                  </h3>
                  <div className={styles.weightMetrciBadge}>
                    Categoría: <strong>{item.categoria}</strong> | UM:{" "}
                    <strong>{item.unidad_medida}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {ctrl.isModalOpen && (
        <ParametrizacionModal
          item={ctrl.activeItem}
          setItem={ctrl.setActiveItem}
          onClose={ctrl.cerrarModal}
          onSave={ctrl.persistirItem}
          guardando={ctrl.guardando}
        />
      )}
    </div>
  );
});

ParametrizacionItems.displayName = "ParametrizacionItems";
