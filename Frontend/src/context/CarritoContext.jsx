import { useCallback, useEffect, useMemo, useState } from 'react';
import { CarritoContext } from './carrito-context';

const CLAVE = 'carrito';

const leer = () => {
  try {
    const data = localStorage.getItem(CLAVE);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState(leer);

  useEffect(() => {
    localStorage.setItem(CLAVE, JSON.stringify(carrito));
  }, [carrito]);

  /** Agrega un producto, o suma 1 si ya está, sin superar el stock. */
  const agregarCarrito = useCallback((producto) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === producto.id);

      if (!existe) return [...prev, { ...producto, cantidad: 1 }];

      return prev.map((p) =>
        p.id === producto.id
          ? { ...p, cantidad: Math.min((p.cantidad || 1) + 1, p.stock ?? Infinity) }
          : p
      );
    });
  }, []);

  /** Cambia la cantidad. Si llega a 0, quita el producto del carrito. */
  const actualizarCantidad = useCallback((id, cantidad) => {
    setCarrito((prev) =>
      prev.flatMap((p) => {
        if (p.id !== id) return [p];

        const tope = p.stock ?? Infinity;
        const nueva = Math.min(Math.max(Number(cantidad) || 0, 0), tope);

        return nueva === 0 ? [] : [{ ...p, cantidad: nueva }];
      })
    );
  }, []);

  const eliminarProducto = useCallback((index) => {
    setCarrito((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const vaciarCarrito = useCallback(() => setCarrito([]), []);

  const value = useMemo(
    () => ({
      carrito,
      agregarCarrito,
      actualizarCantidad,
      eliminarProducto,
      vaciarCarrito,
    }),
    [carrito, agregarCarrito, actualizarCantidad, eliminarProducto, vaciarCarrito]
  );

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
};
