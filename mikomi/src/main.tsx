/**
 * Browser entry: mounts `App` into `#root` from `index.html`.
 * `StrictMode` enables extra development checks (e.g. double-invoking some lifecycles in React 19).
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
