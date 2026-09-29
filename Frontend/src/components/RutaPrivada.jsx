import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSesion } from '../hooks/useSesion';

/**
 * Ruta protegida: exige sesión activa y, opcionalmente, rol de administrador.
 *
 * Sin sesión manda a /login guardando la ruta de origen en `location.state`,
 * así Login.jsx puede devolver al usuario justo donde quería estar.
 */
export default function RutaPrivada({ soloAdmin = false }) {
  const { token, esAdmin } = useSesion();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Con sesión pero sin permisos: al inicio, no al login,
  // porque sí está autenticado.
  if (soloAdmin && !esAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
