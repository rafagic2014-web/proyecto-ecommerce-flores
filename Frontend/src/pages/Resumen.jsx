import { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CarritoContext } from '../context/carrito-context';
import { fmt, convertirPrecio } from '../lib/moneda';
import Icon from '../components/Icon';
import Bandera from '../components/Bandera';
import '../css/resumen.css';

export default function Resumen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { vaciarCarrito } = useContext(CarritoContext);

  const datos = location.state;

  // Vacía el carrito una sola vez, incluso con StrictMode en desarrollo
  const vaciado = useRef(false);
  useEffect(() => {
    if (datos && !vaciado.current) {
      vaciado.current = true;
      vaciarCarrito();
    }
  }, [datos, vaciarCarrito]);

  // El id real lo asigna el servidor al crear el pedido. El formato
  // PE-XXXXXX queda como respaldo si la pantalla se abre sin esos datos.
  const [numeroOrden] = useState(
    () => datos?.pedidoId ? `PE-${String(datos.pedidoId).padStart(6, '0')}` : `PE-${Date.now().toString(36).toUpperCase().slice(-6)}`
  );

  if (!datos) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty">
            <span className="empty-icon">
              <Icon name="alert" size={22} />
            </span>
            <h1 className="empty-title">No hay datos de compra</h1>
            <p className="empty-text">
              Esta pantalla solo se muestra al completar un pedido.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              <Icon name="home" size={15} />
              <span>Volver al inicio</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { carrito = [], total, cliente = {}, pais } = datos;
  const moneda = datos.moneda || 'USD';
  const articulos = carrito.reduce((acc, p) => acc + (p.cantidad || 1), 0);

  return (
    <div className="page">
      <div className="container resumen-wrap">
        {/* ---------- Confirmación ---------- */}
        <header className="done-head">
          <span className="done-check">
            <Icon name="check" size={26} strokeWidth={2.5} />
          </span>
          <h1 className="done-title">¡Compra realizada!</h1>
          <p className="done-text">
            Gracias por tu compra. Recibirás la confirmación en tu correo y te avisaremos
            cuando tu pedido esté en camino.
          </p>
          <span className="badge badge-brand done-order">
            Pedido {numeroOrden}
          </span>
        </header>

        {/* ---------- Recibo ---------- */}
        <div className="card done-card">
          <div className="card-head">
            <h2 className="card-title">Detalle del pedido</h2>
            <span className="badge badge-success">
              Pagado · {moneda} {fmt(total)}
            </span>
          </div>

          <div className="card-body done-body">
            {/* Cliente */}
            <section className="done-block">
              <h3 className="done-block-title">
                <Icon name="user" size={15} />
                <span>Datos del cliente</span>
              </h3>
              <dl className="done-list">
                <div className="done-field">
                  <dt>Cédula / RUC</dt>
                  <dd>{cliente.cedula || '—'}</dd>
                </div>
                <div className="done-field">
                  <dt>Nombre</dt>
                  <dd>{cliente.nombreCliente || '—'}</dd>
                </div>
                <div className="done-field done-field-full">
                  <dt>Dirección</dt>
                  <dd>{cliente.direccion || '—'}</dd>
                </div>
                <div className="done-field">
                  <dt>País de entrega</dt>
                  <dd className="done-pais">
                    <Bandera codigo={pais?.codigo} />
                    <span>{pais?.nombre || '—'}</span>
                  </dd>
                </div>
              </dl>
            </section>

            {/* Productos */}
            <section className="done-block">
              <h3 className="done-block-title">
                <Icon name="package" size={15} />
                <span>
                  Productos · {articulos} {articulos === 1 ? 'artículo' : 'artículos'}
                </span>
              </h3>

              {carrito.length > 0 ? (
                <ul className="done-items">
                  {carrito.map((p) => (
                    <li key={p.id} className="done-item">
                      <img
                        className="done-img"
                        src={p.imagen}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        width="600"
                        height="400"
                      />
                      <div className="done-item-info">
                        <p className="done-item-name">{p.nombre}</p>
                        <p className="done-item-qty">
                          {moneda} {fmt(convertirPrecio(p.precio, moneda))} × {p.cantidad || 1}
                        </p>
                      </div>
                      <span className="done-item-total tabular">
                        {moneda}{' '}
                        {fmt(convertirPrecio(p.precio, moneda) * (p.cantidad || 1))}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted text-sm">Sin productos en el pedido.</p>
              )}
            </section>

            <div className="sum-total done-total">
              <span>Total pagado</span>
              <span className="price">
                {moneda} {fmt(total)}
              </span>
            </div>
          </div>
        </div>

        {/* ---------- Acciones ---------- */}
        <div className="done-actions">
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            <Icon name="home" size={15} />
            <span>Volver al inicio</span>
          </button>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Icon name="package" size={15} />
            <span>Imprimir comprobante</span>
          </button>
        </div>
      </div>
    </div>
  );
}
