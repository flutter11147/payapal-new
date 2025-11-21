import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PayPalVenmoCheckout from './PayPalVenmoCheckout.jsx'
import PayPalCheckout from './PayPalCheckout.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
