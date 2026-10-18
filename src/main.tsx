import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/variables.css';
import 'antd/dist/reset.css';
import { registerSW } from './swRegister';
import SwUpdateToast from './components/SwUpdateToast';

// Register service worker using base-aware path
if (typeof window !== 'undefined') {
  try { registerSW(); } catch (e) { console.warn('SW register failed', e); }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <SwUpdateToast />
  </React.StrictMode>
);
