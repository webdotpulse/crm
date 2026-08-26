import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider } from './context/AppContext'
import App from './App'
import { initOfflineSyncEngine } from './services/offlineSyncService'
import './styles/sandbox-theme.css'

// Initialize IndexedDB offline sync queue engine
initOfflineSyncEngine()

// Register Progressive Web App (PWA) Service Worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // SW registered
      })
      .catch((err) => {
        // SW registration fallback
      })
  })
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
)
