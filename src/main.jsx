import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)

// Ensure instant live updates: unregister service workers on localhost / standalone mode
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      let hadController = Boolean(navigator.serviceWorker.controller)
      for (const reg of registrations) {
        reg.unregister()
      }
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name))
        })
      }
      // If an old service worker was controlling this page, reload once to connect directly to Vite
      if (hadController && !sessionStorage.getItem('careeriq_sw_purged')) {
        sessionStorage.setItem('careeriq_sw_purged', 'true')
        window.location.reload()
      }
    })
  }
}
