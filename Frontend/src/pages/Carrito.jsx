import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CarritoContext } from '../context/carrito-context';
import { PaisContext } from '../context/pais-context';
import { calcularTotales, fmt, getMoneda, convertirPrecio } from '../lib/moneda';
import Icon from '../components/Icon';
import '../css/carrito.css';

export default function Carrito() {
  const navigate = useNavigate();
  const { carrito, actualizarCantidad, eliminarProducto, vaciarCarrito } =
    useContext(CarritoContext);
  const { paisSeleccionado } = useContext(PaisContext);

  const moneda = getMoneda(paisSeleccionado);
  const { subtotal, envio, total, faltaParaEnvioGratis, articulos: items } =
    calcularTotales(carrito, moneda);

  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <p className="eyebrow">Tu pedido</p>
          <h1 className="page-title">Carrito de compras</h1>
          <p className="page-subtitle">
            {carrito.length === 0
              ? 'Aún no has agregado flores.'
              : `${items} ${items === 1 ? 'producto' : 'productos'} · precios en ${moneda}`}
          </p>
        </header>

        {carrito.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">
              <Icon name="cart" size={22} />
            </span>
            <h2 className="empty-title">Tu carrito está vacío</h2>
            <p className="empty-text">
              Explora el catálogo y encuentra el arreglo perfecto para tu ocasión.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              <Icon name="arrowLeft" size={15} />
              <span>Ir al catálogo</span>
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            {/* ---------- Ítems ---------- */}
            <div className="card">
              <div className="card-head">
                <h2 className="card-title">Productos</h2>
                <button className="btn btn-ghost btn-sm" onClick={vaciarCarrito}>
                  <Icon name="trash" size={15} />
                  <span>Vaciar</span>
                </button>
              </div>

              <ul className="cart-list">
                {carrito.map((p) => {
                  const cantidad = p.cantidad || 1;
                  const linea = convertirPrecio(p.precio, moneda) * cantidad;

                  return (
                    <li key={p.id} className="cart-item">
                      <img
                        className="cart-img"
                        src={p.imagen}
                        alt={p.nombre}
                        loading="lazy"
                        decoding="async"
                        width="600"
                        height="400"
                      />

                      <div className="cart-info">
                        <h3 className="cart-name">{p.nombre}</h3>
                        <p className="cart-unit">
                          {moneda} {fmt(convertirPrecio(p.precio, moneda))} c/u
                        </p>
                        <p className="cart-stock">Stock: {p.stock}</p>
                      </div>

                      <div className="cart-qty">
                        <span className="cart-qty-label">Cantidad</span>
                        <div className="qty">
                          <button
                            className="qty-btn"
                            onClick={() => actualizarCantidad(p.id, cantidad - 1)}
                            aria-label={`Quitar una unidad de ${p.nombre}`}
                          >
                            <Icon name="minus" size={14} />
                          </button>
                          <span className="qty-value tabular">{cantidad}</span>
                          <button
                            className="qty-btn"
                            onClick={() => actualizarCantidad(p.id, cantidad + 1)}
                            disabled={cantidad >= p.stock}
                            aria-label={`Agregar una unidad de ${p.nombre}`}
                          >
                            <Icon name="plus" size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="cart-line">
                        <span className="price price-sm">
                          {moneda} {fmt(linea)}
                        </span>
                        <button
                          className="btn btn-ghost btn-sm cart-remove"
                          onClick={() => eliminarProducto(carrito.indexOf(p))}
                          aria-label={`Eliminar ${p.nombre} del carrito`}
                        >
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* ---------- Resumen ---------- */}
            <aside className="card cart-summary">
              <div className="card-head">
                <h2 className="card-title">Resumen</h2>
              </div>

              <div className="card-body stack stack-4">
                <div className="sum-row">
                  <span className="text-muted">Subtotal</span>
                  <span className="tabular">
                    {moneda} {fmt(subtotal)}
                  </span>
                </div>

                <div className="sum-row">
                  <span className="text-muted">Envío</span>
                  <span className="tabular">
                    {envio === 0 ? (
                      <span className="badge badge-success">Gratis</span>
                    ) : (
                      `${moneda} ${fmt(envio)}`
                    )}
                  </span>
                </div>

                {faltaParaEnvioGratis > 0 && (
                  <p className="sum-hint">
                    Te faltan {moneda} {fmt(faltaParaEnvioGratis)} para el envío gratis.
                  </p>
                )}

                <div className="sum-total">
                  <span>Total</span>
                  <span className="price">
                    {moneda} {fmt(total)}
                  </span>
                </div>

                <button className="btn btn-primary btn-lg btn-block" onClick={() => navigate('/pago')}>
                  <Icon name="card" size={16} />
                  <span>Continuar al pago</span>
                </button>

                <button className="btn btn-ghost btn-block" onClick={() => navigate('/')}>
                  <Icon name="arrowLeft" size={15} />
                  <span>Seguir comprando</span>
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
