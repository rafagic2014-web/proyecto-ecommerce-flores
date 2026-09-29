
const C = {
  blanco: '#ffffff',
  rojo: '#d52b1e',
  azul: '#0a3d91',
  azulRussia: '#0039a6',
  verde: '#006847',
  verdeClaro: '#0f8b5f',
  amarillo: '#ffd100',
  oro: '#fcd116',
  marron: '#6b4423',
};

/** Estrellas del cantón de EEUU: 4 columnas por 5 filas, filas alternas desplazadas. */
const ESTRELLAS = [];
for (let fila = 0; fila < 5; fila++) {
  for (let col = 0; col < 4; col++) {
    ESTRELLAS.push({
      cx: 1.9 + col * 2.6 + (fila % 2 ? 1.3 : 0),
      cy: 1.7 + fila * 1.85,
    });
  }
}

const BANDERAS = {
  // Ecuador: amarillo / azul / amarillo con el escudo en el centro.
  EC: {
    viewBox: '0 0 30 20',
    children: (
      <>
        <rect width="30" height="5" y="0" fill={C.amarillo} />
        <rect width="30" height="10" y="5" fill={C.azul} />
        <rect width="30" height="5" y="15" fill={C.rojo} />
        <circle cx="15" cy="10" r="2.7" fill={C.oro} />
        <path
          d="M15 7.4v5.2M12.4 9.2h5.2"
          stroke={C.marron}
          strokeWidth="0.7"
          strokeLinecap="round"
        />
      </>
    ),
  },

  // EEUU: trece franjas y el cantón con las estrellas.
  US: {
    viewBox: '0 0 30 20',
    children: (
      <>
        <rect width="30" height="20" fill={C.blanco} />
        {[0, 2, 4, 6, 8, 10, 12].map((i) => (
          <rect
            key={i}
            width="30"
            height={20 / 13}
            y={(i * 20) / 13}
            fill={C.rojo}
          />
        ))}
        <rect width="12" height={((20 / 13) * 7)} y="0" fill={C.azul} />
        {ESTRELLAS.map((e, i) => (
          <circle key={i} cx={e.cx} cy={e.cy} r="0.45" fill={C.blanco} />
        ))}
      </>
    ),
  },

  // México: verde / blanco / rojo con el emblema en el centro.
  MX: {
    viewBox: '0 0 30 20',
    children: (
      <>
        <rect width="10" height="20" x="0" fill={C.verde} />
        <rect width="10" height="20" x="10" fill={C.blanco} />
        <rect width="10" height="20" x="20" fill={C.rojo} />
        <circle cx="15" cy="10" r="2.5" fill={C.marron} />
        <path
          d="M12.8 11.2c1.4-2.6 3-2.6 4.4 0"
          stroke={C.verdeClaro}
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
        />
      </>
    ),
  },

  // Canadá: rojo / blanco / rojo con el arce. El contorno sale de un
  // polígono de 10 vértices (5 puntas y 4 muescas) calculado aparte.
  CA: {
    viewBox: '0 0 30 15',
    children: (
      <>
        <rect width="5" height="15" x="0" fill={C.rojo} />
        <rect width="20" height="15" x="5" fill={C.blanco} />
        <rect width="5" height="15" x="25" fill={C.rojo} />
        <polygon
          fill={C.rojo}
          points="15.00,3.40 16.00,6.62 18.18,6.31 16.50,8.05 17.21,9.72
                  15.00,9.00 12.79,9.72 13.50,8.05 11.82,6.31 14.00,6.62"
        />
        <rect x="14.6" y="9" width="0.8" height="1.8" fill={C.rojo} />
      </>
    ),
  },

  // España: rojo / amarillo / rojo con el escudo junto al asta.
  ES: {
    viewBox: '0 0 30 20',
    children: (
      <>
        <rect width="30" height="5" y="0" fill={C.rojo} />
        <rect width="30" height="10" y="5" fill={C.oro} />
        <rect width="30" height="5" y="15" fill={C.rojo} />
        <rect x="5.4" y="7" width="3.4" height="6" rx="0.4" fill={C.marron} />
        <rect x="5.8" y="7.4" width="2.6" height="1.4" fill={C.oro} />
        <rect x="5.8" y="9.4" width="2.6" height="1.4" fill={C.rojo} />
        <rect x="6.5" y="11.2" width="1.2" height="1.4" fill={C.amarillo} />
      </>
    ),
  },

  // Inglaterra: la cruz de San Jorge sobre campo blanco.
  // Antes ponía el Union Jack junto al nombre Inglaterra: se cambia a la
  // bandera de Inglaterra, que es la que corresponde a la etiqueta.
  GB: {
    viewBox: '0 0 30 15',
    children: (
      <>
        <rect width="30" height="15" fill={C.blanco} />
        <rect x="13.5" width="3" height="15" fill={C.rojo} />
        <rect y="6" width="30" height="3" fill={C.rojo} />
      </>
    ),
  },

  // Rusia: blanco / azul / rojo.
  RU: {
    viewBox: '0 0 30 15',
    children: (
      <>
        <rect width="30" height="5" y="0" fill={C.blanco} />
        <rect width="30" height="5" y="5" fill={C.azulRussia} />
        <rect width="30" height="5" y="10" fill={C.rojo} />
      </>
    ),
  },
};

export default function Bandera({ codigo, nombre, className = '', ...rest }) {
  const bandera = BANDERAS[codigo];

  if (!bandera) return null;

  // Si el nombre ya aparece al lado, la bandera es decorativa y el
  // lector de pantalla no necesita leerla dos veces.
  const decorativa = !nombre;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={bandera.viewBox}
      className={`bandera ${className}`.trim()}
      role={decorativa ? undefined : 'img'}
      aria-label={decorativa ? undefined : nombre}
      aria-hidden={decorativa ? 'true' : undefined}
      focusable="false"
      {...rest}
    >
      {bandera.children}
    </svg>
  );
}
