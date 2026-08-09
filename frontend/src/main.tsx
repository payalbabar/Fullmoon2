import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSentry } from './lib/sentry';
import { trackPageView } from './lib/analytics';

// Initialize monitoring & analytics as early as possible
// Both are silent no-ops when env vars are absent
initSentry();
trackPageView();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
