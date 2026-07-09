import React, { useState } from "react";
import styles from "./FormularioPedidos.module.css";
import LoadingScreen from "../../UI/LoadingScreen";
import { useNotification } from "../../../contexts/NotificationContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useFormularioPedidos } from "./hooks/useFormularioPedidos";
import { usePermisos } from "../../../hooks/usePermission";

import PedidosHeader from "./components/PedidosHeader";
import CategoriasNav from "./components/CategoriasNav";
import { PedidosItemsGrid } from "./components/PedidosItemsGrid";
import PedidosActionBar from "./components/PedidosActionBar";
import { ParametrizacionItems } from "./components/ParametrizacionItems";
import EmptyState from "../../UI/EmptyState";
import {
  faCheckCircle,
  faShoppingCart,
  faSlidersH,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const FormularioPedidos = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const model = useFormularioPedidos(user, addNotification);

  // Evaluación del árbol de permisos corporativos
  const {
    puedeVer,
    puedeCrear,
    puedeEditar,
    loading: permisosLoading,
  } = usePermisos();
  const [currentTab, setCurrentTab] = useState("FORMULARIO"); // Opciones: FORMULARIO o PARAMETRIZACION

  return (
    <div className={styles.pedidosContainerCanvas}>
      {model.submitting && (
        <LoadingScreen
          isVisible={true}
          title="Transmitiendo Pedido"
          subtitle="Guardando registros de compra en la red de Abastecemos..."
          variant="fullscreen"
        />
      )}

      <PedidosHeader user={user} />

      <main className={styles.cuerpoPrincipalPedidosCanvas}>
        {/* Segmented Control visible únicamente para roles autorizados */}
        {puedeEditar && (
          <div className={styles.appleSegmentedControl}>
            <button
              type="button"
              className={`${styles.segmentedBtn} ${currentTab === "FORMULARIO" ? styles.segmentedBtnActive : ""}`}
              onClick={() => setCurrentTab("FORMULARIO")}
            >
              <FontAwesomeIcon icon={faShoppingCart} /> Operación de Pedidos
            </button>
            <button
              type="button"
              className={`${styles.segmentedBtn} ${currentTab === "PARAMETRIZACION" ? styles.segmentedBtnActive : ""}`}
              onClick={() => setCurrentTab("PARAMETRIZACION")}
            >
              <FontAwesomeIcon icon={faSlidersH} /> Parametrización Catálogo
            </button>
          </div>
        )}

        {currentTab === "FORMULARIO" ? (
          model.pedidoHoy ? (
            <div className={styles.canvasFullPagePedidoHoyInline}>
              <EmptyState
                icon={faCheckCircle}
                title="¡Pedido Diario Completado!"
                description="Tu punto de venta ya transmitió la orden de carnes correspondiente a la fecha actual."
              />
            </div>
          ) : (
            <>
              <CategoriasNav
                activa={model.categoriaActiva}
                onCambiar={model.setCategoriaActiva}
                totales={model.totales}
              />
              <PedidosItemsGrid
                items={model.items}
                cantidades={model.cantidades}
                onAdjust={model.ajustarCantidad}
                onChange={model.handleCantidadChange}
              />
            </>
          )
        ) : (
          puedeEditar && (
            <ParametrizacionItems addNotification={addNotification} />
          )
        )}
      </main>

      {currentTab === "FORMULARIO" && !model.pedidoHoy && (
        <PedidosActionBar
          totalKG={model.totales.totalGeneralKG}
          cantidadProductos={model.totales.cantidadProductos}
          isVisible={model.totales.hayItemsParaGuardar}
          submitting={model.submitting}
          onConfirm={model.ejecutarGuardarPedido}
        />
      )}
    </div>
  );
};

export default FormularioPedidos;
