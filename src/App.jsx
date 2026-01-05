import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import PrivateRoute from "./components/Routing/PrivateRoute";
import { NotificationProvider } from "./contexts/NotificationContext";
import LoadingScreen from "./components/UI/LoadingScreen";
import NotificationContainer from "./components/UI/NotificationContainer";
import Layout from "./components/Layout/Layout";

// BASIC CONFIG//
import Menus from "./components/AdminPanel/Menus/Menus";
import Usuarios from "./components/AdminPanel/Usuarios/Usuarios";
import Proveedores from "./components/AdminPanel/Proveedores/Proveedores";
import Sedes from "./components/AdminPanel/Sedes/Sedes";
import Areas from "./components/AdminPanel/Areas/Areas";
import Cargos from "./components/AdminPanel/Cargos/Cargos";
import PerfilUsuario from "./components/Perfil/Perfil";

// NO PROTECT //
import Login from "./components/Auth/Login";
import Dashboard from "./components/DashBoard/Dashboard";

// FRUVER //
import AdministrarItemsFruver from "./components/Fruver/Items/AdministrarItems";
import PedidosFruver from "./components/Fruver/Pedidos/Pedidos";

// CARNES //
import PedidosCarnes from "./components/Carnes/Pedidos/FormularioPedidos";

// COMPRAS //
import ProgramacionSeparata from "./components/Compras/Separata/ProgramacionSeparata";
import ActualizacionCostos from "./components/Compras/Actualizacion Costos/ActualizacionCostos";
import CodificacionProductos from "./components/Compras/Codificacion Productos/CodificacionProductos";

// CONTABILIDAD //
import CargarPlanosContabilidad from "./components/Contabilidad/Planos/CargaPlanos";

// SISTEMAS //
import ActualizarInventario from "./components/AdminPanel/Inventario/ActualizarInventario";
import VisualizaReportesCVM from "./components/Sistemas/CVM/Reportes";
import CVM from "./components/Sistemas/CVM/CVM";

// SEGURIDAD //
import GestionVisitantes from "./components/Seguridad/Gestion Visitantes/GestionVisitantes";

// INFORMES //
import Informes from "./components/Informes/Informes";

// LECTOR PRECIOS //
import LectorPrecios1 from "./components/LectorPrecios/B1/LectorPrecios";
import LectorPrecios2 from "./components/LectorPrecios/B2/LectorPrecios";
import LectorPrecios5 from "./components/LectorPrecios/B5/LectorPrecios";
import LectorPrecios8 from "./components/LectorPrecios/B8/LectorPrecios";
import LectorPrecios11 from "./components/LectorPrecios/B11/LectorPrecios";

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
          path="/perfil"
          element={
            <PrivateRoute>
              <Layout>
                <PerfilUsuario />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/configuracion/menus"
          element={
            <PrivateRoute>
              <Layout>
                <Menus />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/configuracion/sedes"
          element={
            <PrivateRoute>
              <Layout>
                <Sedes />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/configuracion/areas"
          element={
            <PrivateRoute>
              <Layout>
                <Areas />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/configuracion/cargos"
          element={
            <PrivateRoute>
              <Layout>
                <Cargos />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/configuracion/usuarios"
          element={
            <PrivateRoute>
              <Layout>
                <Usuarios />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/configuracion/proveedores"
          element={
            <PrivateRoute>
              <Layout>
                <Proveedores />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/configuracion/actualizar_inventario"
          element={
            <PrivateRoute>
              <Layout>
                <ActualizarInventario />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* /////////// FRUVER /////////// */}
        <Route
          path="/fruver/admin_items"
          element={
            <PrivateRoute>
              <Layout>
                <AdministrarItemsFruver />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/fruver/pedidos"
          element={
            <PrivateRoute>
              <Layout>
                <PedidosFruver />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* /////////// CONTABILIDAD /////////// */}
        <Route
          path="/contabilidad/cargar_planos"
          element={
            <PrivateRoute>
              <Layout>
                <CargarPlanosContabilidad />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* /////////// SISTEMAS /////////// */}
        <Route
          path="/sistemas/reportes_cvm"
          element={
            <PrivateRoute>
              <Layout>
                <VisualizaReportesCVM />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/CVM"
          element={
            <PrivateRoute>
              <Layout>
                <CVM />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/informes"
          element={
            <PrivateRoute>
              <Layout>
                <Informes />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* /////////// SEGURIDAD /////////// */}
        <Route
          path="/seguridad/visitantes"
          element={
            <PrivateRoute>
              <Layout>
                <GestionVisitantes />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* /////////// COMPRAS /////////// */}
        <Route
          path="/compras/separata"
          element={
            <PrivateRoute>
              <Layout>
                <ProgramacionSeparata />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/compras/actualizacion_costos"
          element={
            <PrivateRoute>
              <Layout>
                <ActualizacionCostos />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/compras/codificacion_productos"
          element={
            <PrivateRoute>
              <Layout>
                <CodificacionProductos />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* /////////// CARNES /////////// */}
        <Route
          path="/formulario_pedidos_carnes"
          element={
            <PrivateRoute>
              <Layout>
                <PedidosCarnes />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* /////////// LECTORES /////////// */}
        <Route path="/LectorPrecios" element={<LectorPrecios1 />} />
        <Route path="/LectorPrecios2" element={<LectorPrecios2 />} />
        <Route path="/LectorPrecios5" element={<LectorPrecios5 />} />
        <Route path="/LectorPrecios8" element={<LectorPrecios8 />} />
        <Route path="/LectorPrecios11" element={<LectorPrecios11 />} />

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
