import React from "react";
import styles from "../Informes.module.css";

const InformePermisosTab = ({
  areas,
  cargos,
  formData,
  cargoFilterArea,
  setCargoFilterArea,
  togglePermiso,
}) => {
  const filteredCargos = React.useMemo(() => {
    if (!cargoFilterArea) return cargos;
    return cargos.filter((c) => Number(c.id_area) === Number(cargoFilterArea));
  }, [cargos, cargoFilterArea]);

  const handleToggleAll = (tipo, lista) => {
    const ids = lista.map((item) => Number(item.id));
    const todosSeleccionados = ids.every((id) =>
      formData.permisos[tipo].includes(id),
    );

    ids.forEach((id) => {
      const estaSeleccionado = formData.permisos[tipo].includes(id);
      if (
        (todosSeleccionados && estaSeleccionado) ||
        (!todosSeleccionados && !estaSeleccionado)
      ) {
        togglePermiso(tipo, id);
      }
    });
  };

  return (
    <div className={styles.permisosLayout}>
      {/* Sección de Áreas */}
      <div className={styles.permisosSection}>
        <div className={styles.headerLine}>
          <h4>Áreas con Acceso Total</h4>
          <button
            type="button"
            className={styles.btnToggleAll}
            onClick={() => handleToggleAll("areas", areas)}
          >
            {areas.length > 0 &&
            areas.every((a) => formData.permisos.areas.includes(Number(a.id)))
              ? "Desmarcar todas"
              : "Marcar todas"}
          </button>
        </div>
        <p className={styles.helperText}>
          Los usuarios pertenecientes a estas áreas podrán visualizar el informe
          sin importar su cargo.
        </p>
        <div className={styles.checkboxGrid}>
          {areas.map((a) => (
            <label key={`area-${a.id}`} className={styles.checkboxItem}>
              <input
                type="checkbox"
                checked={formData.permisos.areas.includes(Number(a.id))}
                onChange={() => togglePermiso("areas", a.id)}
              />
              {a.nombre}
            </label>
          ))}
        </div>
      </div>

      {/* Sección de Cargos */}
      <div className={styles.permisosSection}>
        <div className={styles.headerLine}>
          <h4>Cargos Específicos</h4>
          <button
            type="button"
            className={styles.btnToggleAll}
            onClick={() => handleToggleAll("cargos", filteredCargos)}
          >
            {filteredCargos.length > 0 &&
            filteredCargos.every((c) =>
              formData.permisos.cargos.includes(Number(c.id)),
            )
              ? "Desmarcar filtrados"
              : "Marcar filtrados"}
          </button>
        </div>

        <div className={styles.filtroAreaRow}>
          <select
            value={cargoFilterArea}
            onChange={(e) => setCargoFilterArea(e.target.value)}
          >
            <option value="">Filtrar cargos por área...</option>
            {areas.map((a) => (
              <option key={`filt-${a.id}`} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.checkboxGrid}>
          {filteredCargos.map((c) => (
            <label key={`cargo-${c.id}`} className={styles.checkboxItem}>
              <input
                type="checkbox"
                checked={formData.permisos.cargos.includes(Number(c.id))}
                onChange={() => togglePermiso("cargos", c.id)}
              />
              {c.descripcion}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InformePermisosTab;
