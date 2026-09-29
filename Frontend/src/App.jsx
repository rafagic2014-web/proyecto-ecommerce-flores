import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RutaPrivada from './components/RutaPrivada';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Carrito from './pages/Carrito';
import Pago from './pages/Pago';
import Resumen from './pages/Resumen';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login va suelto: pantalla partida sin cabecera del sitio */}
        <Route path="/login" element={<Login />} />

        {/* Catálogo: público */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />

          {/* Compra: exige sesión. El carrito, el pago y el comprobante
              guardan datos del pedido, así que no se ven sin login. */}
          <Route element={<RutaPrivada />}>
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/pago" element={<Pago />} />
            <Route path="/resumen" element={<Resumen />} />
          </Route>

          {/* Panel: exige sesión y rol de administrador */}
          <Route element={<RutaPrivada soloAdmin />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
