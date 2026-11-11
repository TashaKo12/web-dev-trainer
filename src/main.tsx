import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { startAutoSync } from './lib/cloud'
import { startTimeTracking } from './lib/timeTracker'

startAutoSync()
startTimeTracking()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
