import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppWithProviders from './AppWithProviders';
import { AuthProvider } from './contexts/AuthContext';
import './i18n';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppWithProviders />
    </AuthProvider>
  </StrictMode>
)
