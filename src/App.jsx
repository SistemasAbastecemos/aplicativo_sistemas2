import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import PrivateRoute from "./components/Routing/PrivateRoute";
import { NotificationProvider } from "./contexts/NotificationContext";

import LoadingScreen from "./components/UI/LoadingScreen";
import NotificationContainer from "./components/UI/NotificationContainer";
import Login from "./components/Auth/Login";
import Layout from "./components/Layout/Layout";
import Dashboard from "./components/DashBoard/Dashboard";

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
