import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

const showFatalError = (msg: string) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<pre style="padding:16px;color:#dc2626;background:#fef2f2;font-size:13px;white-space:pre-wrap;word-break:break-word;">RUNTIME ERROR:\n${msg}</pre>`;
  }
};

window.addEventListener('error', (e) => {
  showFatalError(e.error?.stack || e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  showFatalError(e.reason?.stack || String(e.reason));
});

// Disable multi-touch pinch zoom & Safari gesture zoom globally
document.addEventListener(
  'touchmove',
  (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  },
  { passive: false }
);

document.addEventListener('gesturestart', (e) => {
  e.preventDefault();
});

createRoot(document.getElementById('root')!, {
  onUncaughtError: (error) => {
    showFatalError(
      error instanceof Error ? error.stack || error.message : String(error)
    );
  },
}).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
