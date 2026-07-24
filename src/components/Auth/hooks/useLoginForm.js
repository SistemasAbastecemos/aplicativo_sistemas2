import { useState, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../services/api";

export const useLoginForm = () => {
  const [credentials, setCredentials] = useState({ login: "", password: "" });
  const [mode, setMode] = useState("login");
  const [submitting, setSubmitting] = useState(false);

  const { login, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  }, []);

  const changeMode = useCallback(
    (newMode) => {
      setError("");
      setMode(newMode);
    },
    [setError],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      if (mode === "login") {
        const data = await login({
          login: credentials.login,
          password: credentials.password,
        });

        if (data?.success) {
          sessionStorage.removeItem("user_logged_out");
          sessionStorage.removeItem("ms_silent_login_attempted");
          navigate("/inicio");
        } else {
          throw new Error(data?.message || "Credenciales invalidas");
        }
      } else if (mode === "forgot") {
        const data = await apiService.forgotPassword({
          login: credentials.login,
        });

        if (data?.success) {
          alert("Se ha enviado un enlace de recuperacion a tu correo.");
          setMode("login");
        } else {
          throw new Error(data?.message || "No se pudo enviar el enlace");
        }
      }
    } catch (err) {
      setError(err.message || "Ocurrio un error inesperado.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    credentials,
    mode,
    submitting,
    error,
    handleChange,
    handleSubmit,
    changeMode,
  };
};
