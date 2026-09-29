/**
 * Conversión de moneda y totales.
 *
 * Antes cada página tenía su propia copia de la tabla de tasas, y no
 * coincidían: Carrito aplicaba conversión pero Pago no, así que el total
 * del resumen podía cambiar entre pantallas.
 */

export const TASAS = {
  USD: 1,
  MXN: 17,
  CAD: 1.3,
  EUR: 0.9,
  GBP: 0.8,
  RUB: 90,
};

export const ENVIO = 5;
export const ENVIO_GRATIS_DESDE = 80;

export function getMoneda(paisSeleccionado) {
  return paisSeleccionado?.moneda || 'USD';
}

/** Devuelve el precio convertido al número, sin formato. */
export function convertirPrecio(precio, moneda) {
  const tasa = TASAS[moneda] || 1;
  return Number(precio) * tasa;
}

/** Calcula subtotal, envío y total de una lista de productos del carrito. */
export function calcularTotales(carrito, moneda) {
  const subtotal = (carrito || []).reduce(
    (acc, p) => acc + convertirPrecio(p.precio, moneda) * (p.cantidad || 1),
    0
  );

  const envio = subtotal === 0 || subtotal >= ENVIO_GRATIS_DESDE ? 0 : ENVIO;

  return {
    subtotal,
    envio,
    total: subtotal + envio,
    faltaParaEnvioGratis: Math.max(ENVIO_GRATIS_DESDE - subtotal, 0),
    articulos: (carrito || []).reduce((acc, p) => acc + (p.cantidad || 1), 0),
  };
}

/** Formatea con dos decimales. */
export function fmt(monto) {
  return Number(monto || 0).toFixed(2);
}
