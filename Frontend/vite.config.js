import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Sin esto, Lightning CSS convierte `@media (max-width: 640px)` a la
    // sintaxis de rango `(width <= 640px)`, que Safari no entiende hasta
    // la 16.4. En moviles con iOS anterior se ignorarian TODOS los
    // breakpoints y la web se veria con el diseno de escritorio.
    // Apuntar a iOS 14+ mantiene la sintaxis clasica.
    cssTarget: ['chrome87', 'edge88', 'firefox78', 'safari14'],
  },
})
