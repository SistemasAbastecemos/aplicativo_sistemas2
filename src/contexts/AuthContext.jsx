import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const logout = useCallback(
    (message = "", redirect = true) => {
      const token = localStorage.getItem("authToken");

      if (token) {
        apiService
          .logout(token)
          .catch((err) =>
            console.error("Error al cerrar sesión en el servidor:", err)
          );
      }

      setUser(null);
      localStorage.removeItem("authToken");

      if (message) {
        const safeMessage =
          typeof message === "string"
            ? message
            : message?.message || "Sesión cerrada";
        setError(safeMessage);
      }

      if (redirect) {
        navigate("/login", { replace: true });
      }
    },
    [navigate]
  );

  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      // No hacer logout con error, simplemente dejar usuario en null
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const result = await apiService.verifyToken(token);

      if (result.success && result.user) {
        // Actualizar usuario si hay cambios
        setUser(result.user);
        localStorage.setItem("authToken", token);
      } else {
        logout(result.message || "Sesión expirada o usuario inactivo");
      }
    } catch (err) {
      logout(err.message || "Error de conexión al verificar la sesión");
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.login(credentials);

      if (response.success) {
        setUser(response.user);
        localStorage.setItem("authToken", response.token);
        return { success: true };
      } else {
        setError(response.message || "Error en el login");
        return { success: false, message: response.message };
      }
    } catch (error) {
      setError(error.message || "Error de conexión");
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyToken(); // primera verificación

    const interval = setInterval(() => {
      verifyToken();
    }, 30000); // cada 60s

    return () => clearInterval(interval);
  }, [verifyToken]);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
