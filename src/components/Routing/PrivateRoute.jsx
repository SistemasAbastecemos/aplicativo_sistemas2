import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useEmpresa } from "../../contexts/EmpresaContext";
import { apiService } from "../../services/api";
import LoadingScreen from "../UI/LoadingScreen";

function PrivateRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { empresa } = useEmpresa();
  const location = useLocation();
  const [accessState, setAccessState] = useState({
    allowed: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user || !empresa) {
      setAccessState({
        allowed: false,
        loading: false,
        error: "Usuario o empresa no definidos",
      });
      return;
    }

    const checkAccess = async () => {
      try {
        const res = await apiService.validateAccess({
          ruta: location.pathname,
          empresa,
        });

        setAccessState({
          allowed: res.success,
          loading: false,
          error: res.success ? null : res.message,
        });
      } catch (err) {
        setAccessState({
          allowed: false,
          loading: false,
          error: err.message,
        });
      }
    };

    checkAccess();
  }, [location.pathname, empresa, user]);

  // Mostrar loading mientras verifica autenticación
  if (authLoading) {
    return <LoadingScreen message="Verificando sesión..." />;
  }

  // Redirigir si no está autenticado
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Mostrar loading mientras verifica permisos
  if (accessState.loading) {
    return <LoadingScreen message="Verificando permisos..." />;
  }

  // Redirigir si no tiene acceso
  if (!accessState.allowed) {
    return <Navigate to="/inicio" replace />;
  }

  return children;
}

export default PrivateRoute;
