import React, { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faShield,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Usuarios.module.css";

/**
 * Tarjeta de un usuario. Memoizada porque se renderiza en lista. Muestra
 * avatar con inicial, nombre/login/correo, badges de rol y sede, y editar.
 */
const UsuarioCard = React.memo(({ usuario, onEdit, roles, sedes }) => {
  const handleEdit = useCallback(() => onEdit(usuario), [usuario, onEdit]);

  const rol = roles.find((r) => r.id === usuario.id_rol);
  const sede = sedes.find((s) => s.id === usuario.id_sede);

  return (
    <div
      className={`${styles.usuarioCard} ${usuario.activo ? styles.activo : styles.inactivo}`}
    >
      <span
        className={styles.statusDot}
        title={usuario.activo ? "Activo" : "Inactivo"}
      />

      <div className={styles.cardMain}>
        <div className={styles.avatar}>
          {usuario.nombres_completos?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div className={styles.userDetails}>
          <div className={styles.nameRow}>
            <h4 className={styles.userName}>{usuario.nombres_completos}</h4>
            <span className={styles.userLogin}>@{usuario.login}</span>
          </div>
          <p className={styles.userEmail}>
            {usuario.correo || "Sin correo electrónico"}
          </p>
        </div>
      </div>

      <div className={styles.cardMeta}>
        <div className={styles.metaBadge} title="Rol">
          <FontAwesomeIcon icon={faShield} className={styles.metaIcon} />
          <span>{rol?.descripcion || "Sin rol"}</span>
        </div>
        <div className={styles.metaBadge} title="Sede">
          <FontAwesomeIcon icon={faBuilding} className={styles.metaIcon} />
          <span>{sede?.nombre || "Sin sede"}</span>
        </div>
      </div>

      <div className={styles.cardActions}>
        <button className={styles.editActionBtn} onClick={handleEdit}>
          <FontAwesomeIcon icon={faEdit} />
          <span>Editar perfil</span>
        </button>
      </div>
    </div>
  );
});

UsuarioCard.displayName = "UsuarioCard";

export default UsuarioCard;
