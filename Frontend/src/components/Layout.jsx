import { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CarritoContext } from '../context/carrito-context';
import { useSesion } from '../hooks/useSesion';
import Icon from './Icon';
import '../css/layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const { user, esAdmin, cerrarSesion } = useSesion();
  const { carrito } = useContext(CarritoContext);

  const items = carrito?.length || 0;

  const navClass = ({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`;

  return (
    <>
      <header className="site-header">
        <div className="container site-header-inner">
          <button className="brand" onClick={() => navigate('/')} aria-label="Ir al inicio">
            <img
              className="brand-logo"
              src="/logo-192.png"
              alt="Pétalos &amp; Encanto"
              width="36"
              height="36"
            />
            <span className="brand-text">
              <span className="brand-name">Pétalos &amp; Encanto</span>
              <span className="brand-tag">Flores frescas a domicilio</span>
            </span>
          </button>

          <nav className="site-nav" aria-label="Navegación principal">
            <NavLink to="/" end className={navClass}>
              <Icon name="home" size={16} />
              <span>Inicio</span>
            </NavLink>

            {esAdmin && (
              <NavLink to="/admin" className={navClass}>
                <Icon name="shield" size={16} />
                <span>Admin</span>
              </NavLink>
            )}
          </nav>

          <div className="site-actions">
            {!esAdmin && (
              <button
                className="cart-btn"
                onClick={() =>
                  user
                    ? navigate('/carrito')
                    : // Se guarda el destino para que Login devuelva
                      // al usuario al carrito tras identificarse.
                      navigate('/login', { state: { from: { pathname: '/carrito' } } })
                }
                aria-label={`Carrito, ${items} ${items === 1 ? 'producto' : 'productos'}`}
              >
                <Icon name="cart" size={18} />
                {items > 0 && <span className="cart-count">{items}</span>}
              </button>
            )}

            {user ? (
              <>
                <span className="user-chip" title={user.nombre || user.email || 'Sesión activa'}>
                  <Icon name="user" size={15} />
                  <span className="user-name">{user.nombre || user.email || 'Sesión'}</span>
                </span>

                <button className="btn btn-inverse btn-sm" onClick={cerrarSesion}>
                  <Icon name="logout" size={15} />
                  <span>Salir</span>
                </button>
              </>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
                <Icon name="lock" size={15} />
                <span>Ingresar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container site-footer-inner">
          <div className="footer-brand">
            <img
              className="footer-logo"
              src="/logo-192.png"
              alt=""
              width="30"
              height="30"
              aria-hidden="true"
            />
            <div>
              <p className="footer-name">Pétalos &amp; Encanto</p>
              <p className="footer-text">Arreglos y flores frescas para cada ocasión.</p>
            </div>
          </div>

          <nav className="footer-links" aria-label="Enlaces del pie">
            <NavLink to="/">Catálogo</NavLink>
            {!esAdmin && <NavLink to="/carrito">Carrito</NavLink>}
            <NavLink to="/login">Ingresar</NavLink>
            {esAdmin && <NavLink to="/admin">Administración</NavLink>}
          </nav>
        </div>

        <div className="container footer-bottom">
          <span>&copy; {new Date().getFullYear()} Pétalos &amp; Encanto</span>
        </div>
      </footer>
    </>
  );
}
