import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Usuarios.module.css";
import UsuarioCard from "./UsuarioCard";
import EmptyState from "../../../UI/EmptyState";

/**
 * Cuadrícula de usuarios. Cuando no hay resultados usa el EmptyState global
 * (agnóstico y reutilizable); en caso contrario muestra las tarjetas y la
 * paginación.
 */
const UsuariosGrid = ({
  usuarios,
  roles,
  sedes,
  search,
  puedeCrear,
  pagina,
  totalPaginas,
  onPaginaChange,
  onEdit,
  onCreate,
}) => {
  if (usuarios.length === 0) {
    const hayBusqueda = !!search;
    return (
      <EmptyState
        icon="👤"
        title={
          hayBusqueda
            ? "No se encontraron usuarios"
            : "No hay usuarios registrados"
        }
        description={
          hayBusqueda
            ? `No se encontraron usuarios que coincidan con "${search.trim()}". Intenta con otro término.`
            : "Puedes crear uno nuevo usando el botón + Nuevo Usuario."
        }
      >
        {!hayBusqueda && puedeCrear && (
          <button onClick={onCreate} type="button">
            <FontAwesomeIcon icon={faUserPlus} /> Crear el primero
          </button>
        )}
      </EmptyState>
    );
  }

  return (
    <>
      <div className={styles.usuariosGrid}>
        {usuarios.map((usuario) => (
          <UsuarioCard
            key={usuario.id}
            usuario={usuario}
            onEdit={onEdit}
            roles={roles}
            sedes={sedes}
          />
        ))}
      </div>

      {totalPaginas > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => onPaginaChange(Math.max(pagina - 1, 1))}
            disabled={pagina === 1}
          >
            <FontAwesomeIcon icon={faChevronLeft} /> Anterior
          </button>

          <div className={styles.paginationInfo}>
            Página <strong>{pagina}</strong> de <strong>{totalPaginas}</strong>
          </div>

          <button
            className={styles.paginationButton}
            onClick={() => onPaginaChange(Math.min(pagina + 1, totalPaginas))}
            disabled={pagina === totalPaginas}
          >
            Siguiente <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </>
  );
};

export default UsuariosGrid;
