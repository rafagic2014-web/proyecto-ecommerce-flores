import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CarritoContext } from '../context/carrito-context';
import { PaisContext } from '../context/pais-context';
import { calcularTotales, fmt, getMoneda, convertirPrecio } from '../lib/moneda';
import Icon from '../components/Icon';
import '../css/pago.css';

const soloDigitos = (v) => v.replace(/\D/g, '');

export default function Pago() {
  const navigate = useNavigate();
  const { carrito } = useContext(CarritoContext);
  const { paisSeleccionado } = useContext(PaisContext);

  const moneda = getMoneda(paisSeleccionado);
  const { subtotal, envio, total, articulos } = calcularTotales(carrito, moneda);

  // =========================
  //  DATOS DE TARJETA
  // =========================
  const [tipoTarjeta, setTipoTarjeta] = useState('VISA');
  const [numero, setNumero] = useState('');
  const [cvv, setCvv] = useState('');
  const [fecha, setFecha] = useState('');
  const [nombreTarjeta, setNombreTarjeta] = useState('');

  // =========================
  //  DATOS DE FACTURA
  // =========================
  const [cedula, setCedula] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [direccion, setDireccion] = useState('');

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // ---------- Formateo de la tarjeta ----------
  const onNumero = (v) => {
    const d = soloDigitos(v).slice(0, 16);
    setNumero(d.replace(/(.{4})/g, '$1 ').trim());
  };

  const onFecha = (v) => {
    const d = soloDigitos(v).slice(0, 4);
    setFecha(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  };

  const onCvv = (v) => setCvv(soloDigitos(v).slice(0, 4));

  // =========================
  //  PAGAR
  // =========================
  const pagar = async () => {
    if (carrito.length === 0) {
      setError('Tu carrito está vacío.');
      return;
    }

    if (soloDigitos(numero).length < 13 || cvv.length < 3 || !fecha || !nombreTarjeta.trim()) {
      setError('Revisa los datos de la tarjeta: número, CVV, fecha y titular son obligatorios.');
      return;
    }

    if (!cedula.trim() || !nombreCliente.trim() || !direccion.trim()) {
      setError('Completa los datos de facturación para emitir la factura.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      // Una sola petición: el servidor registra el pedido y descuenta el
      // stock dentro de una transacción. Antes se mandaba un PUT por
      // producto y, si uno fallaba, los anteriores ya habían descontado.
      const { data } = await api.post('/pedidos', {
        items: carrito.map((item) => ({
          id: item.id,
          cantidad: item.cantidad || 1,
        })),
        cliente: {
          cedula: cedula.trim(),
          nombre: nombreCliente.trim(),
          direccion: direccion.trim(),
          pais: paisSeleccionado?.nombre || null,
          moneda,
        },
      });

      // El servidor recalcula el total con los precios de la base, así que
      // se muestra su resultado y no el estimado del navegador.
      const pedido = data.pedido;

      navigate('/resumen', {
        state: {
          carrito,
          total: pedido.total,
          moneda: pedido.moneda,
          pedidoId: pedido.id,
          cliente: { cedula, nombreCliente, direccion },
          pais: paisSeleccionado,
        },
      });
    } catch (err) {
      console.error(err);
      // El backend devuelve el motivo (stock insuficiente, producto
      // desactivado, etc.) en `mensaje`.
      setError(
        err.response?.data?.mensaje || 'No pudimos procesar el pago. Intenta de nuevo.'
      );
      setCargando(false);
    }
  };

  // =========================
  //  VISTA
  // =========================
  if (carrito.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty">
            <span className="empty-icon">
              <Icon name="card" size={22} />
            </span>
            <h1 className="empty-title">No hay nada que pagar</h1>
            <p className="empty-text">Agrega flores al carrito antes de continuar al pago.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              <Icon name="arrowLeft" size={15} />
              <span>Ir al catálogo</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <header className="page-head">
          <p className="eyebrow">Paso 2 de 3</p>
          <h1 className="page-title">Pago</h1>
          <p className="page-subtitle">
            Confirma tu tarjeta y los datos de facturación para emitir la factura.
          </p>
        </header>

        <div className="pago-layout">
          {/* ---------- Formulario ---------- */}
          <div className="stack stack-6">
            {error && (
              <p className="form-alert" role="alert">
                <Icon name="alert" size={16} />
                <span>{error}</span>
              </p>
            )}

            <section className="card">
              <div className="card-head">
                <h2 className="card-title">Datos de facturación</h2>
                <Icon name="wallet" size={18} className="card-head-icon" />
              </div>

              <div className="card-body form-grid">
                <div className="field">
                  <label className="label" htmlFor="cedula">
                    Cédula / RUC
                  </label>
                  <input
                    id="cedula"
                    className="input"
                    inputMode="numeric"
                    placeholder="1712345678"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label className="label" htmlFor="nombre-cliente">
                    Nombre completo
                  </label>
                  <input
                    id="nombre-cliente"
                    className="input"
                    placeholder="María Andrade"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                  />
                </div>

                <div className="field form-grid-full">
                  <label className="label" htmlFor="direccion">
                    Dirección de entrega
                  </label>
                  <input
                    id="direccion"
                    className="input"
                    placeholder="Av. Amazonas N34-56, Quito"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-head">
                <h2 className="card-title">Método de pago</h2>
                <Icon name="card" size={18} className="card-head-icon" />
              </div>

              <div className="card-body form-grid">
                <div className="field form-grid-full">
                  <label className="label" htmlFor="tipo-tarjeta">
                    Tipo de tarjeta
                  </label>
                  <select
                    id="tipo-tarjeta"
                    className="select"
                    value={tipoTarjeta}
                    onChange={(e) => setTipoTarjeta(e.target.value)}
                  >
                    <option value="VISA">VISA</option>
                    <option value="MASTERCARD">MasterCard</option>
                    <option value="AMEX">American Express</option>
                    <option value="DINERS">Diners Club</option>
                  </select>
                </div>

                <div className="field form-grid-full">
                  <label className="label" htmlFor="numero">
                    Número de tarjeta
                  </label>
                  <input
                    id="numero"
                    className="input input-mono"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="1234 5678 9012 3456"
                    value={numero}
                    onChange={(e) => onNumero(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label className="label" htmlFor="fecha">
                    Vencimiento
                  </label>
                  <input
                    id="fecha"
                    className="input input-mono"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    value={fecha}
                    onChange={(e) => onFecha(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label className="label" htmlFor="cvv">
                    CVV
                  </label>
                  <input
                    id="cvv"
                    className="input input-mono"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => onCvv(e.target.value)}
                  />
                </div>

                <div className="field form-grid-full">
                  <label className="label" htmlFor="titular">
                    Nombre del titular
                  </label>
                  <input
                    id="titular"
                    className="input"
                    autoComplete="cc-name"
                    placeholder="Como aparece en la tarjeta"
                    value={nombreTarjeta}
                    onChange={(e) => setNombreTarjeta(e.target.value)}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* ---------- Resumen ---------- */}
          <aside className="card cart-summary">
            <div className="card-head">
              <h2 className="card-title">Tu pedido</h2>
              <span className="badge badge-neutral">
                {articulos} {articulos === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>

            <div className="card-body stack stack-4">
              <ul className="mini-list">
                {carrito.map((p) => (
                  <li key={p.id} className="mini-item">
                    <img
                      className="mini-img"
                      src={p.imagen}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      width="600"
                      height="400"
                    />
                    <div className="mini-info">
                      <p className="mini-name">{p.nombre}</p>
                      <p className="mini-qty">Cantidad: {p.cantidad || 1}</p>
                    </div>
                    <span className="mini-price tabular">
                      {moneda} {fmt(convertirPrecio(p.precio, moneda) * (p.cantidad || 1))}
                    </span>
                  </li>
                ))}
              </ul>

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

              <div className="sum-total">
                <span>Total</span>
                <span className="price">
                  {moneda} {fmt(total)}
                </span>
              </div>

              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={pagar}
                disabled={cargando}
              >
                {cargando ? (
                  <>
                    <span className="spinner spinner-inverse" />
                    <span>Procesando…</span>
                  </>
                ) : (
                  <>
                    <Icon name="check" size={16} />
                    <span>Confirmar pago</span>
                  </>
                )}
              </button>

              <button
                className="btn btn-ghost btn-block"
                onClick={() => navigate('/carrito')}
                disabled={cargando}
              >
                <Icon name="arrowLeft" size={15} />
                <span>Volver al carrito</span>
              </button>

              <p className="pago-note">
                <Icon name="lock" size={13} />
                <span>Datos de pago solo para la demostración del proyecto.</span>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
