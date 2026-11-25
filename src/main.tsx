import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { getAdminSession, getCloudCode, startAutoSync, syncNow } from './lib/cloud'
import { adoptOldTheory } from './lib/access'
import { flushDrafts } from './lib/drafts'
import { startTimeTracking } from './lib/timeTracker'

if (getCloudCode() && !getAdminSession()) adoptOldTheory()
startAutoSync()

// the site was updated while this page was open: a part of the old version is gone from the server.
// Save everything first, then open the new version (once).
window.addEventListener('vite:preloadError', (e) => {
  try {
    if (Date.now() - Number(sessionStorage.getItem('reloaded-at')) < 30_000) return
    sessionStorage.setItem('reloaded-at', String(Date.now()))
  } catch {
    return
  }
  e.preventDefault()
  flushDrafts()
  Promise.race([syncNow(), new Promise((r) => setTimeout(r, 4000))]).finally(() => window.location.reload())
})
startTimeTracking()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
