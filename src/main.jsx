import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register PWA service worker immediately
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('PWA app content refreshed')
  },
  onOfflineReady() {
    console.log('PWA is ready for offline usage')
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
