import { useMemo, useState } from 'react';
import { PaisContext } from './pais-context';

export const PaisProvider = ({ children }) => {
  const [paisSeleccionado, setPaisSeleccionado] = useState({
    nombre: 'Ecuador',
    moneda: 'USD',
    codigo: 'EC',
  });

  const value = useMemo(
    () => ({ paisSeleccionado, setPaisSeleccionado }),
    [paisSeleccionado]
  );

  return <PaisContext.Provider value={value}>{children}</PaisContext.Provider>;
};
