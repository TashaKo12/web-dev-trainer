import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { getAdminSession, getCloudCode, startAutoSync } from './lib/cloud'
import { adoptOldTheory } from './lib/access'
import { saveAndReload, watchNewVersion } from './lib/newVersion'
import { startTimeTracking } from './lib/timeTracker'

if (getCloudCode() && !getAdminSession()) adoptOldTheory()
startAutoSync()
startTimeTracking()

// the site was updated while this page was open: a part of the old version is gone from the server.
// Save everything first, then open the new version (once).
window.addEventListener('vite:preloadError', (e) => {
  if (saveAndReload()) e.preventDefault()
})
watchNewVersion()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
