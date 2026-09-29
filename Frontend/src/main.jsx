import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './css/base.css';
import App from './App.jsx';
import { PaisProvider } from './context/PaisContext';
import { CarritoProvider } from './context/CarritoContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PaisProvider>
      <CarritoProvider>
        <App />
      </CarritoProvider>
    </PaisProvider>
  </StrictMode>
);
