import { useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';

/**
 * Sesión del usuario leída del token en localStorage.
 * Antes cada página repetía este bloque (y envolvía jwtDecode
 * sin try/catch, con riesgo de romperse si el token expiraba).
 */
export function useSesion() {
  const token = localStorage.getItem('token');

  const user = useMemo(() => {
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }, [token]);

  const esAdmin = user?.rol === 'admin';

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem('token');
    window.location.reload();
  }, []);

  return { token, user, esAdmin, cerrarSesion };
}
