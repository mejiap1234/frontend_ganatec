import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Trabajadores from "./pages/Trabajadores";

import Register from "./pages/Register";

import DashboardLayout from "./layouts/DashboardLayout";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";

import Animales from "./pages/Animales";

import Dashboard from "./pages/Dashboard";

import AnimalDetalle from "./pages/AnimalDetalle";

import Salud from "./pages/Salud";

import SaludEvento from "./pages/SaludEvento";

import Reproduccion from "./pages/Reproduccion";

import ReproduccionAnimal from "./pages/ReproduccionAnimal";

import ReproduccionServicioNuevo from "./pages/ReproduccionServicioNuevo";

import ReproduccionDiagnostico from "./pages/ReproduccionDiagnostico";

import ReproduccionParto from "./pages/ReproduccionParto";

import Leche from "./pages/Leche";

import LecheAnimal from "./pages/LecheAnimal";

import LecheOrdenioNuevo from "./pages/LecheOrdenioNuevo";

import LecheCorreccion from "./pages/LecheCorreccion";

import LecheFinalizarLactancia from "./pages/LecheFinalizarLactancia";

import ProduccionDiariaNueva from "./pages/ProduccionDiariaNueva";

import ProduccionDiariaEditar from "./pages/ProduccionDiariaEditar";

import PotrerosLayout from "./pages/potreros/PotrerosLayout";

import Potreros from "./pages/potreros/Potreros";

import PotreroNuevo from "./pages/potreros/potrero/PotreroNuevo";

import PotreroDetalle from "./pages/potreros/potrero/PotreroDetalle";

import PotreroFinalizarDescanso from "./pages/potreros/potrero/PotreroFinalizarDescanso";

import Lotes from "./pages/potreros/lote/Lotes";

import LoteNuevo from "./pages/potreros/lote/LoteNuevo";

import LoteDetalle from "./pages/potreros/lote/LoteDetalle";

import LoteAgregarAnimal from "./pages/potreros/lote/LoteAgregarAnimal";

import LoteRetirarAnimal from "./pages/potreros/lote/LoteRetirarAnimal";

import LoteMoverAnimal from "./pages/potreros/lote/LoteMoverAnimal";

import LoteMoverPotrero from "./pages/potreros/lote/LoteMoverPotrero";

import Inventario from "./pages/inventario/Inventario";

import ProductoNuevo from "./pages/inventario/ProductoNuevo";

import ProductoDetalle from "./pages/inventario/ProductoDetalle";

import MovimientoNuevo from "./pages/inventario/MovimientoNuevo";

import StockBajo from "./pages/inventario/StockBajo";

import ProductoEditar from "./pages/inventario/ProductoEditar";

import Finanzas from "./pages/finanzas/Finanzas";

import GastoNuevo from "./pages/finanzas/GastoNuevo";

import VentaLecheNueva from "./pages/finanzas/VentaLecheNueva";

import VentaAnimalNueva from "./pages/finanzas/VentaAnimalNueva";

import MovimientosFinancieros from "./pages/finanzas/MovimientosFinancieros";

import Alertas from "./pages/alertas/Alertas";

import IAGanatec from "./pages/ia/IAGanatec";

import "./styles/global.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/animales"
            element={
              <ProtectedRoute>
                <Animales />
              </ProtectedRoute>
            }
          />

          <Route
            path="/animales/:id"
            element={
              <ProtectedRoute>
                <AnimalDetalle />
              </ProtectedRoute>
            }
          />

          <Route
            path="/salud"
            element={
              <ProtectedRoute>
                <Salud />
              </ProtectedRoute>
            }
          />

          <Route
            path="/salud/animal/:animalId/evento/:eventoId"
            element={
              <ProtectedRoute>
                <SaludEvento />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventario"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Inventario />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventario/nuevo"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProductoNuevo />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventario/stock-bajo"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <StockBajo />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventario/:productoId"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProductoDetalle />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventario/:productoId/movimiento/:tipo"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MovimientoNuevo />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
{/* Gestión de trabajadores */}
<Route
  path="/trabajadores"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <Trabajadores />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
          <Route
            path="/inventario/:productoId/editar"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProductoEditar />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/finanzas"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Finanzas />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/finanzas/gasto/nuevo"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <GastoNuevo />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/finanzas/venta-leche/nueva"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <VentaLecheNueva />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/finanzas/venta-animal/nueva"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <VentaAnimalNueva />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/finanzas/movimientos"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MovimientosFinancieros />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* =========================================================
              18. MÓDULO DE ALERTAS
          ========================================================= */}

          <Route
            path="/alertas"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Alertas />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* =================================================
              REPRODUCCIÓN
          ================================================= */}

          <Route
            path="/reproduccion"
            element={
              <ProtectedRoute>
                <Reproduccion />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reproduccion/animal/:animalId"
            element={
              <ProtectedRoute>
                <ReproduccionAnimal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reproduccion/servicio/nuevo"
            element={
              <ProtectedRoute>
                <ReproduccionServicioNuevo />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reproduccion/animal/:animalId/servicio/nuevo"
            element={
              <ProtectedRoute>
                <ReproduccionServicioNuevo />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reproduccion/animal/:animalId/servicio/:servicioId/diagnostico"
            element={
              <ProtectedRoute>
                <ReproduccionDiagnostico />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reproduccion/animal/:animalId/gestacion/:gestacionId/parto"
            element={
              <ProtectedRoute>
                <ReproduccionParto />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              PRODUCCIÓN DE LECHE
          ================================================= */}

          <Route
            path="/leche"
            element={
              <ProtectedRoute>
                <Leche />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leche/animal/:animalId"
            element={
              <ProtectedRoute>
                <LecheAnimal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leche/ordenio/nuevo"
            element={
              <ProtectedRoute>
                <LecheOrdenioNuevo />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leche/animal/:animalId/ordenio/nuevo"
            element={
              <ProtectedRoute>
                <LecheOrdenioNuevo />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leche/animal/:animalId/registro/:registroId/corregir"
            element={
              <ProtectedRoute>
                <LecheCorreccion />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leche/animal/:animalId/lactancia/:lactanciaId/finalizar"
            element={
              <ProtectedRoute>
                <LecheFinalizarLactancia />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leche/produccion-diaria/nueva"
            element={
              <ProtectedRoute>
                <ProduccionDiariaNueva />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leche/produccion-diaria/:produccionId/editar"
            element={
              <ProtectedRoute>
                <ProduccionDiariaEditar />
              </ProtectedRoute>
            }
          />

          {/* =================================================
              POTREROS Y LOTES
          ================================================= */}

          <Route
            path="/potreros"
            element={
              <ProtectedRoute>
                <PotrerosLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Potreros />} />

            <Route path="nuevo" element={<PotreroNuevo />} />

            {/* =================================================
                LOTES
            ================================================= */}

            <Route path="lotes" element={<Lotes />} />

            <Route path="lotes/nuevo" element={<LoteNuevo />} />

            <Route path="lotes/:loteId" element={<LoteDetalle />} />

            <Route
              path="lotes/:loteId/agregar-animal"
              element={<LoteAgregarAnimal />}
            />

            <Route
              path="lotes/:loteId/animal/:animalId/retirar"
              element={<LoteRetirarAnimal />}
            />

            <Route
              path="lotes/:loteId/animal/:animalId/mover"
              element={<LoteMoverAnimal />}
            />

            <Route
              path="lotes/:loteId/mover-potrero"
              element={<LoteMoverPotrero />}
            />

            {/* =================================================
                POTREROS
            ================================================= */}

            <Route path=":potreroId" element={<PotreroDetalle />} />

            <Route
              path=":potreroId/descanso/finalizar"
              element={<PotreroFinalizarDescanso />}
            />
          </Route>

          {/* =================================================
              IA GANATEC
          ================================================= */}

          <Route
            path="/ia"
            element={
              <ProtectedRoute>
                <IAGanatec />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
