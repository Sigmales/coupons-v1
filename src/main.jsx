import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { Toaster } from 'react-hot-toast'
import './styles/index.css'

// Debug: Vérifier que le root existe
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found!')
}

console.log('🚀 Application starting...')

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

