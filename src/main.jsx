import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setupServiceWorkerAutoRefresh } from './utils/swAutoRefresh.js'

setupServiceWorkerAutoRefresh()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
