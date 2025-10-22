import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import PrivateRoute from "./components/Routing/PrivateRoute";
import { NotificationProvider } from "./contexts/NotificationContext";
import LoadingScreen from "./components/UI/LoadingScreen";
import NotificationContainer from "./components/UI/NotificationContainer";
import Layout from "./components/Layout/Layout";

import Login from "./components/Auth/Login";
import Dashboard from "./components/DashBoard/Dashboard";
import User from "./components/Config/User";
import ActualizacionCostos from "./components/Formularios/ActualizacionCostos/ActualizacionCostos";
import CodificacionProductos from "./components/Formularios/CodificacionProductos/CodificacionProductos";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Verificando sesión..." />;
  }

  return (
    <>
      <NotificationContainer />
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={user ? <Navigate to="/inicio" replace /> : <Login />}
        />

        {/* Rutas protegidas */}
        <Route
          path="/inicio"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/usuario"
          element={
            <PrivateRoute>
              <Layout>
                <User />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/actualizacion_costos"
          element={
            <PrivateRoute>
              <Layout>
                <ActualizacionCostos />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/codificacion_productos"
          element={
            <PrivateRoute>
              <Layout>
                <CodificacionProductos />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Redirección por defecto */}
        <Route
          path="*"
          element={<Navigate to={user ? "/inicio" : "/login"} replace />}
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

export default App;
