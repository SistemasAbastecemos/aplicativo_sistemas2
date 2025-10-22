import React from "react";
import { useNavigate } from "react-router-dom";

function AccessDenied({
  message = "No tienes permisos para acceder a esta página",
}) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Acceso Denegado
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={() => navigate("/inicio")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}

export default AccessDenied;
