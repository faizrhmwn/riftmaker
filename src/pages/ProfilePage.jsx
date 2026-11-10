import { useState, useEffect } from 'react'
import { useBuilds } from '../hooks/useBuilds'
import { usePWAInstall } from '../hooks/usePWAInstall'
import { useAuth } from '../contexts/AuthContext'
import { getProfile, updateProfile } from '../services/userService'
import './ProfilePage.css'

const RANKS = [
  'Iron IV', 'Bronze I', 'Silver II', 'Gold IV',
  'Platinum III', 'Emerald II', 'Diamond I',
  'Master', 'Grandmaster', 'Challenger'
]

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function EditProfileModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({ summoner: profile.summoner, rank: profile.rank })
  const patch = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <span className="modal-tl" /><span className="modal-tr" />
        <span className="modal-bl" /><span className="modal-br" />

        <div className="modal-header">
          <h2>Edit Game Profile</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 16px' }}>
          Nama dan email diambil dari akun Google kamu secara otomatis.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-row-2">
            <div className="form-group">
              <label>Summoner Name</label>
              <input
                className="input"
                value={form.summoner}
                onChange={(e) => patch('summoner', e.target.value)}
                placeholder="Ziaf Fila"
              />
            </div>
            <div className="form-group">
              <label>Rank Season</label>
              <select
                className="input"
                value={form.rank}
                onChange={(e) => patch('rank', e.target.value)}
              >
                {RANKS.map((rk) => <option key={rk} value={rk}>{rk}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function InstallGuideModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <span className="modal-tl" /><span className="modal-tr" />
        <span className="modal-bl" /><span className="modal-br" />

        <div className="modal-header">
          <h2>Cara Install Aplikasi PWA</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <ul className="pwa-steps">
          <li className="pwa-step-item">
            <span className="pwa-step-icon">💻</span>
            <div>
              <div className="pwa-step-title">Chrome / Edge / Opera GX (Desktop)</div>
              <div className="pwa-step-desc">Lihat di ujung kanan <strong>Address Bar</strong>. Klik ikon <strong>Install (⊕)</strong>.</div>
            </div>
          </li>
          <li className="pwa-step-item">
            <span className="pwa-step-icon">📱</span>
            <div>
              <div className="pwa-step-title">Google Chrome (Android)</div>
              <div className="pwa-step-desc">Tekan <strong>⋮ menu</strong> → <strong>"Install Aplikasi"</strong>.</div>
            </div>
          </li>
          <li className="pwa-step-item">
            <span className="pwa-step-icon">🍎</span>
            <div>
              <div className="pwa-step-title">Safari (iPhone / iPad)</div>
              <div className="pwa-step-desc">Tekan <strong>Share</strong> → <strong>"Add to Home Screen"</strong>.</div>
            </div>
          </li>
        </ul>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn-primary" onClick={onClose}>Mengerti</button>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { builds } = useBuilds()
  const { canInstall, isInstalled, promptInstall } = usePWAInstall()
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (user) {
      getProfile(user).then(setProfile)
    }
  }, [user])

  const flash = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSaveProfile = async (updated) => {
    await updateProfile(user.id, updated)
    setProfile(p => ({ ...p, ...updated }))
    setIsEditing(false)
    flash('Profil berhasil diperbarui!')
  }

  const handleInstallClick = async () => {
    const res = await promptInstall()
    if (!res || !res.triggered) {
      setShowGuide(true)
    } else if (res.outcome === 'accepted') {
      flash('Aplikasi berhasil diinstall!')
    }
  }

  if (!profile) return <div style={{ padding: 40, color: '#c89b3c', fontFamily: 'Plus Jakarta Sans' }}>Loading...</div>

  const totalItems = builds.reduce((n, b) => n + (b.items?.length || 0), 0)
  const uniqueRoles = [...new Set(builds.map((b) => b.role))].length

  return (
    <div className="profile-wrap">
      <div className="profile-topbar">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Profile</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
            ✏️ Edit Profil
          </button>
          <button className="btn btn-ghost" onClick={signOut} style={{ color: 'rgba(255,100,100,0.8)', borderColor: 'rgba(255,100,100,0.3)' }}>
            Logout
          </button>
        </div>
      </div>

      {toast && <div className="alert alert-success">{toast}</div>}

      {/* PWA callout */}
      <div className="pwa-callout">
        <div className="pwa-callout-main">
          <div className="pwa-callout-icon"><DownloadIcon /></div>
          <div className="pwa-callout-text">
            <div className="pwa-callout-title">
              {isInstalled ? 'Aplikasi Terpasang (PWA Active)' : 'Install sebagai Aplikasi PWA'}
            </div>
            <div className="pwa-callout-desc">
              {isInstalled
                ? 'Aplikasi sudah berjalan dalam mode standalone. Data builds tersinkron ke cloud.'
                : 'Install RiftMaker ke perangkat untuk akses cepat dan dukungan offline.'}
            </div>
          </div>
        </div>

        {isInstalled ? (
          <div className="pwa-install-btn installed">
            <CheckIcon /> Terinstall
          </div>
        ) : (
          <button type="button" className="pwa-install-btn" onClick={handleInstallClick}>
            <DownloadIcon /> Install App
          </button>
        )}
      </div>

      {/* Identity card */}
      <div className="id-card">
        <div className="id-card-bg" />

        <div className="id-card-avatar-col">
          {profile.avatar ? (
            <img src={profile.avatar} alt="avatar" className="id-avatar-google" />
          ) : (
            <div className="id-avatar">🧙</div>
          )}
          <div className="id-avatar-role">Summoner</div>
          <div className="id-avatar-rank">🥇</div>
          <div className="id-avatar-role">{profile.rank}</div>
        </div>

        <div className="id-card-info">
          <div className="id-card-header-row">
            <div>
              <div className="id-name">{profile.name}</div>
              <div className="id-nim">{profile.email}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(true)}>
              ✏️ Edit
            </button>
          </div>

          <div className="id-badges">
            <span className="badge badge-gold">{profile.summoner}</span>
            <span className="badge badge-blue">ID Server</span>
          </div>

          <hr className="id-rule" />

          <div className="id-stats-row">
            <div className="id-stat">
              <div className="id-stat-num">{builds.length}</div>
              <div className="id-stat-label">Builds</div>
            </div>
            <div className="id-stat">
              <div className="id-stat-num">{uniqueRoles || 0}</div>
              <div className="id-stat-label">Roles</div>
            </div>
            <div className="id-stat">
              <div className="id-stat-num">{totalItems}</div>
              <div className="id-stat-label">Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* Account info */}
      <div className="info-panel">
        <div className="info-panel-header">
          <span className="info-panel-title">Account Information</span>
        </div>
        <div className="info-rows">
          {[
            ['Nama',         profile.name],
            ['Email',        profile.email],
            ['Summoner Name',profile.summoner],
            ['Rank',         profile.rank],
            ['Auth',         'Google OAuth'],
            ['Storage',      'Supabase Cloud DB'],
          ].map(([label, value]) => (
            <div key={label} className="info-row">
              <span className="info-row-label">{label}</span>
              <span className="info-row-value">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* App info */}
      <div className="info-panel">
        <div className="info-panel-header">
          <span className="info-panel-title">About RiftMaker</span>
        </div>
        <div className="info-rows">
          {[
            ['Type',       'Progressive Web App (PWA)'],
            ['Framework',  'React 18 + Vite 5'],
            ['Database',   'Supabase (PostgreSQL)'],
            ['Auth',       'Supabase Auth + Google OAuth'],
            ['API',        'Riot Data Dragon (Auto-patch)'],
            ['Deployment', 'Vercel'],
          ].map(([label, value]) => (
            <div key={label} className="info-row">
              <span className="info-row-label">{label}</span>
              <span className="info-row-value" style={{ color: 'var(--text-secondary)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {isEditing && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveProfile}
        />
      )}

      {showGuide && (
        <InstallGuideModal onClose={() => setShowGuide(false)} />
      )}
    </div>
  )
}
