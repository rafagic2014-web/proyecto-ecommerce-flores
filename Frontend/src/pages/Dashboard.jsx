import { useEffect, useMemo, useState, useContext } from 'react';
import api from '../services/api';
import { CarritoContext } from '../context/carrito-context';
import { PaisContext } from '../context/pais-context';
import { useSesion } from '../hooks/useSesion';
import { convertirPrecio, fmt, getMoneda } from '../lib/moneda';
import Icon from '../components/Icon';
import Bandera from '../components/Bandera';
import '../css/dashboard.css';

const paises = [
  { nombre: 'Ecuador', moneda: 'USD', codigo: 'EC' },
  { nombre: 'EEUU', moneda: 'USD', codigo: 'US' },
  { nombre: 'México', moneda: 'MXN', codigo: 'MX' },
  { nombre: 'Canadá', moneda: 'CAD', codigo: 'CA' },
  { nombre: 'España', moneda: 'EUR', codigo: 'ES' },
  { nombre: 'Inglaterra', moneda: 'GBP', codigo: 'GB' },
  { nombre: 'Rusia', moneda: 'RUB', codigo: 'RU' },
];

export default function Dashboard() {
  const { user, esAdmin } = useSesion();
  const { agregarCarrito } = useContext(CarritoContext);
  const { paisSeleccionado, setPaisSeleccionado } = useContext(PaisContext);

  // Sin sesión no se muestra el stock ni se ofrece agregar al carrito:
  // ambos datos y la acción quedan reservados a quien inicia sesión.
  const haySesion = Boolean(user);

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;

    // Cada recurso se pide por separado a propósito.
    // /productos es público, pero /categorias exige token: si se agruparan
    // en un Promise.all, el 401 de categorías tumbaría también el catálogo.
    const cargar = async () => {
      const [resProductos, resCategorias] = await Promise.allSettled([
        api.get('/productos'),
        api.get('/categorias'),
      ]);

      if (!vivo) return;

      if (resProductos.status === 'fulfilled') {
        setProductos(resProductos.value.data || []);
      } else {
        console.error('Error productos:', resProductos.reason);
        setProductos([]);
      }

      if (resCategorias.status === 'fulfilled') {
        setCategorias((resCategorias.value.data || []).filter((c) => c.estado_activo === 1));
      } else {
        // Sin categorías el catálogo igual se muestra completo
        console.warn('Categorías no disponibles:', resCategorias.reason?.message);
        setCategorias([]);
      }

      setCargando(false);
    };

    cargar();

    return () => {
      vivo = false;
    };
  }, []);

  const filtrar = async (id) => {
    setCategoriaActiva(id);
    setBusqueda('');
    setCargando(true);
    try {
      const res = await api.get(`/productos/categoria/${id}`);
      setProductos(res.data || []);
    } catch (error) {
      console.error('Error filtrar:', error);
      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  const mostrarTodos = async () => {
    setCategoriaActiva(null);
    setBusqueda('');
    setCargando(true);
    try {
      const res = await api.get('/productos');
      setProductos(res.data || []);
    } catch (error) {
      console.error('Error productos:', error);
      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  const moneda = getMoneda(paisSeleccionado);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q)
    );
  }, [productos, busqueda]);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="container hero-inner">
          <p className="hero-eyebrow">Entrega a domicilio</p>
          <h1 className="hero-title">Pétalos &amp; Encanto</h1>
          <p className="hero-text">
            Arreglos y flores frescas para cada ocasión. Elige tu país, revisa el catálogo y
            arma tu pedido en pocos pasos.
          </p>

          <div className="hero-paises">
            <span className="hero-paises-label">
              <Icon name="globe" size={15} />
              <span>País de entrega</span>
            </span>

            <div className="pais-chips">
              {paises.map((p) => (
                <button
                  key={p.nombre}
                  className={`pais-chip${paisSeleccionado?.nombre === p.nombre ? ' is-active' : ''}`}
                  onClick={() => setPaisSeleccionado(p)}
                  aria-pressed={paisSeleccionado?.nombre === p.nombre}
                >
                  <span className="pais-chip-flag">
                    <Bandera codigo={p.codigo} />
                  </span>
                  <span>{p.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CATÁLOGO ---------- */}
      <section className="page">
        <div className="container">
          <div className="cat-toolbar">
            <div className="cat-cats" role="group" aria-label="Categorías">
              <button
                className={`cat-pill${categoriaActiva === null ? ' is-active' : ''}`}
                onClick={mostrarTodos}
                aria-pressed={categoriaActiva === null}
              >
                Todos
              </button>

              {categorias.map((c) => (
                <button
                  key={c.id}
                  className={`cat-pill${categoriaActiva === c.id ? ' is-active' : ''}`}
                  onClick={() => filtrar(c.id)}
                  aria-pressed={categoriaActiva === c.id}
                >
                  {c.nombre}
                </button>
              ))}
            </div>

            <div className="cat-search">
              <Icon name="search" size={16} />
              <input
                type="search"
                className="input"
                placeholder="Buscar flor…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar productos"
              />
            </div>
          </div>

          <p className="cat-count">
            {cargando
              ? 'Cargando catálogo…'
              : `${visibles.length} ${visibles.length === 1 ? 'producto' : 'productos'}`}
            {paisSeleccionado && !cargando && ` · precios en ${moneda}`}
          </p>

          {cargando ? (
            <div className="prod-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-line-sm" />
                  <div className="skeleton-line skeleton-line-xs" />
                </div>
              ))}
            </div>
          ) : visibles.length === 0 ? (
            <div className="empty">
              <span className="empty-icon">
                <Icon name="search" size={22} />
              </span>
              <h3 className="empty-title">Sin resultados</h3>
              <p className="empty-text">
                {busqueda
                  ? `No encontramos flores para "${busqueda}". Prueba con otro nombre.`
                  : 'No hay productos disponibles en esta categoría.'}
              </p>
              <button className="btn btn-secondary" onClick={mostrarTodos}>
                Ver todo el catálogo
              </button>
            </div>
          ) : (
            <div className="prod-grid">
              {visibles.map((p) => (
                <article key={p.id} className="prod-card">
                  <div className="prod-media">
                    <img
                      className="prod-img"
                      src={p.imagen}
                      alt={p.nombre}
                      loading="lazy"
                      decoding="async"
                      width="600"
                      height="400"
                    />
                    {/* El stock solo se muestra con sesión iniciada */}
                    {haySesion &&
                      (p.stock > 0 ? (
                        <span className="badge badge-success prod-badge">
                          {p.stock} en stock
                        </span>
                      ) : (
                        <span className="badge badge-danger prod-badge">Agotado</span>
                      ))}
                  </div>

                  <div className="prod-body">
                    <h3 className="prod-name">{p.nombre}</h3>
                    <p className="prod-desc">{p.descripcion}</p>

                    <div className="prod-foot">
                      <span className="price">
                        <span className="prod-moneda">{moneda}</span>{' '}
                        {fmt(convertirPrecio(p.precio, moneda))}
                      </span>

                      {/* Sin sesión no se muestra el stock ni el botón de
                          agregar: la compra requiere cuenta iniciada. */}
                      {!esAdmin && haySesion && (
                        p.stock > 0 ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => agregarCarrito(p)}
                          >
                            <Icon name="plus" size={15} />
                            <span>Agregar</span>
                          </button>
                        ) : (
                          <span className="badge badge-neutral">Sin stock</span>
                        )
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
