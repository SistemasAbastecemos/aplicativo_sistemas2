import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useDashboardRedirect = (currentUser, addNotification) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasRedirectedThisSession = sessionStorage.getItem(
      "hasRedirectedThisSession",
    );

    if (hasRedirectedThisSession) return;

    addNotification({
      message: "Ha iniciado sesión correctamente.",
      type: "success",
    });

    if (currentUser.area_nombre === "Cajas" && isMobile) {
      sessionStorage.setItem("hasRedirectedThisSession", "true");
      navigate("/CVM");
      return;
    }

    if (currentUser.area_nombre === "Carnes") {
      sessionStorage.setItem("hasRedirectedThisSession", "true");
      navigate("/formulario_pedidos_carnes");
      return;
    }

    sessionStorage.setItem("hasRedirectedThisSession", "true");
  }, [currentUser, navigate, addNotification]);
};
