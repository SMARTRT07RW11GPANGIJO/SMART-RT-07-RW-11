import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against benign browser/iframe IndexedDB closing or hidden lifecycle rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event?.reason?.message || String(event?.reason || '');
    if (
      msg.includes('Database is closing') ||
      msg.includes('closing/hidden') ||
      event?.reason?.name === 'DatabaseClosedError' ||
      event?.reason?.name === 'InvalidStateError'
    ) {
      event.preventDefault();
      console.warn('Handled iframe database visibility/closing lifecycle event gracefully:', msg);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
