import styles from "../Dashboard.module.css";

export const getPermisoClass = (tipo) => {
  const classes = {
    ver: styles.badgeVer,
    crear: styles.badgeCrear,
    editar: styles.badgeEditar,
    eliminar: styles.badgeEliminar,
  };
  return classes[tipo] || styles.badgeDefault;
};
