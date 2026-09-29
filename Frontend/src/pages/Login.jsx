import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import Icon from '../components/Icon';
import '../css/login.css';

const vacio = { nombre: '', email: '', password: '' };

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registro, setRegistro] = useState(vacio);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const esLogin = modo === 'login';

  const cambiarModo = (nuevo) => {
    setModo(nuevo);
    setError('');
  };

  // ============================
  //  LOGIN
  // ============================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError('Completa el correo y la contraseña.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });

      localStorage.setItem('token', res.data.token);

      const { rol } = jwtDecode(res.data.token);
      navigate(rol === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No pudimos iniciar sesión. Revisa tus datos.');
    } finally {
      setCargando(false);
    }
  };

  // ============================
  //  REGISTRO
  // ============================
  const handleRegistro = async (e) => {
    e.preventDefault();

    if (!registro.nombre.trim() || !registro.email.trim() || !registro.password) {
      setError('Completa todos los campos para crear tu cuenta.');
      return;
    }

    if (registro.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const res = await api.post('/auth/register', {
        nombre: registro.nombre.trim(),
        email: registro.email.trim(),
        password: registro.password,
      });

      localStorage.setItem('token', res.data.token);
      // Se respeta la ruta de origen: si el registro nació de un intento
      // de comprar, la cuenta nueva aterriza en el carrito y no en el inicio.
      window.location.assign(from);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No pudimos crear la cuenta. Intenta de nuevo.');
      setCargando(false);
    }
  };

  // ============================
  //  VISTA
  // ============================
  return (
    <div className="auth">
      {/* ---------- Panel de marca ---------- */}
      <aside className="auth-aside">
        <div className="auth-aside-inner">
          <div className="auth-brand">
            <img
              className="auth-logo"
              src="/logo-192.png"
              alt="Pétalos &amp; Encanto"
              width="44"
              height="44"
            />
            <div className="auth-brand-text">
              <p className="auth-brand-name">Pétalos &amp; Encanto</p>
              <p className="auth-brand-tag">Flores frescas a domicilio</p>
            </div>
          </div>

          <div className="auth-pitch">
            <h2 className="auth-pitch-title">Un detalle que lo dice todo.</h2>
            <ul className="auth-points">
              <li>
                <span className="auth-point-icon">
                  <Icon name="package" size={16} />
                </span>
                <span className="auth-point-text">Entrega el mismo día en ciudades principales</span>
              </li>
              <li>
                <span className="auth-point-icon">
                  <Icon name="tag" size={16} />
                </span>
                <span className="auth-point-text">Precios claros, sin costos ocultos</span>
              </li>
              <li>
                <span className="auth-point-icon">
                  <Icon name="shield" size={16} />
                </span>
                <span className="auth-point-text">Pago seguro y seguimiento de tu pedido</span>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* ---------- Formulario ---------- */}
      <div className="auth-panel">
        <div className="auth-form-wrap">
          <Link to="/" className="auth-back">
            <Icon name="arrowLeft" size={15} />
            <span>Volver a la tienda</span>
          </Link>

          <div className="auth-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={esLogin}
              className={`auth-tab${esLogin ? ' is-active' : ''}`}
              onClick={() => cambiarModo('login')}
            >
              Ingresar
            </button>
            <button
              role="tab"
              aria-selected={!esLogin}
              className={`auth-tab${!esLogin ? ' is-active' : ''}`}
              onClick={() => cambiarModo('registro')}
            >
              Crear cuenta
            </button>
          </div>

          <div className="auth-head">
            <h1 className="auth-title">
              {esLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta'}
            </h1>
            <p className="auth-sub">
              {esLogin
                ? 'Ingresa para ver tu carrito y completar tu pedido.'
                : 'Regístrate en menos de un minuto y empieza a pedir.'}
            </p>
          </div>

          {error && (
            <p className="form-alert" role="alert">
              <Icon name="alert" size={16} />
              <span>{error}</span>
            </p>
          )}

          {esLogin ? (
            <form className="auth-form" onSubmit={handleLogin} noValidate>
              <div className="field">
                <label className="label" htmlFor="login-email">
                  Correo electrónico
                </label>
                <input
                  id="login-email"
                  className="input"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="login-password">
                  Contraseña
                </label>
                <input
                  id="login-password"
                  className="input"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={cargando}>
                {cargando ? (
                  <>
                    <span className="spinner spinner-inverse" />
                    <span>Entrando…</span>
                  </>
                ) : (
                  <>
                    <Icon name="lock" size={16} />
                    <span>Ingresar</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegistro} noValidate>
              <div className="field">
                <label className="label" htmlFor="reg-nombre">
                  Nombre completo
                </label>
                <input
                  id="reg-nombre"
                  className="input"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="María Andrade"
                  value={registro.nombre}
                  onChange={(e) => setRegistro({ ...registro, nombre: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="reg-email">
                  Correo electrónico
                </label>
                <input
                  id="reg-email"
                  className="input"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={registro.email}
                  onChange={(e) => setRegistro({ ...registro, email: e.target.value })}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="reg-password">
                  Contraseña
                </label>
                <input
                  id="reg-password"
                  className="input"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  value={registro.password}
                  onChange={(e) => setRegistro({ ...registro, password: e.target.value })}
                />
              </div>

              <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={cargando}>
                {cargando ? (
                  <>
                    <span className="spinner spinner-inverse" />
                    <span>Creando cuenta…</span>
                  </>
                ) : (
                  <>
                    <Icon name="user" size={16} />
                    <span>Crear cuenta</span>
                  </>
                )}
              </button>
            </form>
          )}

          <p className="auth-switch">
            {esLogin ? '¿Todavía no tienes cuenta?' : '¿Ya tienes una cuenta?'}{' '}
            <button className="auth-switch-btn" onClick={() => cambiarModo(esLogin ? 'registro' : 'login')}>
              {esLogin ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
