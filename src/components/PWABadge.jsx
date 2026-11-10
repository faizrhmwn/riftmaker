import { useState, useEffect } from 'react'
import { usePWAInstall } from '../hooks/usePWAInstall'
import './PWABadge.css'

export default function PWABadge() {
  const { canInstall, isInstalled, promptInstall } = usePWAInstall()
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [dismissed, setDismissed] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstallClick = async () => {
    const res = await promptInstall()
    if (!res || !res.triggered) {
      setShowModal(true)
    }
  }

  if (dismissed || isInstalled) return null

  return (
    <>
      {isOffline ? (
        <aside className="pwa-floating-badge pwa-floating-badge--offline" role="status">
          <span className="pwa-badge-dot" />
          <span>Mode Offline aktif. Data cached dapat diakses.</span>
        </aside>
      ) : (
        <aside className="pwa-floating-badge" role="region" aria-label="Install App">
          <div className="pwa-badge-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pwa-icon">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <div>
              <div className="pwa-badge-title">Install LoL Tracker</div>
              <div className="pwa-badge-sub">Akses cepat & offline support</div>
            </div>
          </div>
          <div className="pwa-badge-actions">
            <button type="button" className="pwa-btn-install" onClick={handleInstallClick}>
              Install
            </button>
            <button
              type="button"
              className="pwa-btn-dismiss"
              onClick={() => setDismissed(true)}
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>
        </aside>
      )}

      {/* Petunjuk instalasi jika native prompt tidak langsung muncul di browser tertentu */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h2>Install LoL Tracker</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: 14 }}>
                Untuk menginstall di browser Anda:
              </p>
              <div style={{ background: 'var(--dark-4)', padding: 12, marginBottom: 10, border: '1px solid var(--border)' }}>
                <strong style={{ color: 'var(--gold-1)', display: 'block', marginBottom: 4 }}>💻 Google Chrome / Edge / Opera GX (Laptop):</strong>
                Klik ikon <strong>titik tiga (⋮)</strong> di pojok kanan atas browser ➔ pilih <strong>"Install LoL Champion Tracker..."</strong> (atau klik ikon Install di ujung kanan address bar).
              </div>
              <div style={{ background: 'var(--dark-4)', padding: 12, border: '1px solid var(--border)' }}>
                <strong style={{ color: 'var(--gold-1)', display: 'block', marginBottom: 4 }}>📱 Smartphone (Android / iOS):</strong>
                Tekan menu browser ➔ pilih <strong>"Tambahkan ke Layar Utama" / "Add to Home Screen"</strong>.
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>Saya Mengerti</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
