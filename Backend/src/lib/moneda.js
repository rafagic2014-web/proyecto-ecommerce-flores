
const TASAS = {
  USD: 1,
  MXN: 17,
  CAD: 1.3,
  EUR: 0.9,
  GBP: 0.8,
  RUB: 90,
};

const ENVIO = 5;
const ENVIO_GRATIS_DESDE = 80;

/** Devuelve la tasa de una moneda, o 1 si no está en la lista. */
const tasaDe = (moneda) => TASAS[moneda] || 1;

/**
 * Suma un carrito usando los precios que le pasa el llamador.
 * `items` son objetos { precio, cantidad } con el precio en la moneda base.
 */
const calcularTotales = (items, moneda) => {
  const tasa = tasaDe(moneda);

  const subtotal = items.reduce(
    (acc, item) => acc + Number(item.precio) * tasa * item.cantidad,
    0
  );

  const envio = subtotal === 0 || subtotal >= ENVIO_GRATIS_DESDE ? 0 : ENVIO;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    envio,
    total: Number((subtotal + envio).toFixed(2)),
  };
};

module.exports = { TASAS, ENVIO, ENVIO_GRATIS_DESDE, tasaDe, calcularTotales };
