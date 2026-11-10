import { Link } from 'react-router-dom'
import { useChampions } from '../hooks/useChampions'
import { useBuilds } from '../hooks/useBuilds'
import './HomePage.css'

function SwordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" /><path d="M13 19l6-6" /><path d="M16 16l4 4" /><path d="M19 21l2-2" />
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}
function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

const FEATURED_IDX = [0, 3, 6, 10, 14, 1, 20, 8] // varied picks

export default function HomePage() {
  const { champions, loading } = useChampions()
  const { builds } = useBuilds()

  const listChamps  = champions.slice(0, 7)
  const heroChamp   = champions[42] || champions[0]

  return (
    <div>
      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-art" />
        <div className="hero-backdrop" />
        <div className="hero-content">
          <div className="hero-eyebrow">Champion Database</div>
          <h1 className="hero-title">
            League of
            <em>Legends</em>
          </h1>
          <p className="hero-sub">
            Jelajahi champion, baca lore, dan rencanakan build terbaikmu.
            Tersedia offline setelah diinstall.
          </p>
          <div className="hero-cta">
            <Link to="/champions" className="btn btn-primary">
              Lihat Champions
            </Link>
            <Link to="/builds" className="btn btn-outline">
              Buat Build
            </Link>
          </div>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div className="stats-strip">
        <div className="stats-strip-item">
          <div className="stats-strip-num">{loading ? '—' : champions.length}</div>
          <div className="stats-strip-label">Champions</div>
        </div>
        <div className="stats-strip-item">
          <div className="stats-strip-num">5</div>
          <div className="stats-strip-label">Roles</div>
        </div>
        <div className="stats-strip-item">
          <div className="stats-strip-num">{builds.length}</div>
          <div className="stats-strip-label">Saved Builds</div>
        </div>
        <div className="stats-strip-item">
          <div className="stats-strip-num">Offline</div>
          <div className="stats-strip-label">PWA Ready</div>
        </div>
      </div>

      {/* ── FEATURED ROW ── */}
      <div className="section-label">Champions</div>
      <div className="featured-row">
        {/* List column */}
        <div>
          {loading ? (
            <div className="spinner-wrap" style={{ minHeight: 200 }}>
              <div className="spinner" />
              <span className="spinner-label">Loading Champions</span>
            </div>
          ) : (
            <div className="champ-list-compact">
              {listChamps.map((c, i) => (
                <Link key={c.id} to={`/champions/${c.id}`} className="champ-list-item">
                  <span className="champ-list-item-num">0{i + 1}</span>
                  <img className="champ-list-item-img" src={c.image} alt={c.name} loading="lazy" />
                  <div className="champ-list-item-info">
                    <div className="champ-list-item-name">{c.name}</div>
                    <div className="champ-list-item-role">{c.tags.join(' · ')}</div>
                  </div>
                  <span className="champ-list-item-arrow">›</span>
                </Link>
              ))}
              <Link
                to="/champions"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '14px',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: '10px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--gold-3)',
                  borderTop: '1px solid var(--border)',
                  marginTop: 4,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold-1)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--gold-3)'}
              >
                View All Champions →
              </Link>
            </div>
          )}
        </div>

        {/* Featured splash card */}
        {heroChamp && (
          <Link to={`/champions/${heroChamp.id}`} className="featured-card">
            <img
              className="featured-card-img"
              src={heroChamp.splash}
              alt={heroChamp.name}
              loading="eager"
            />
            <div className="featured-card-overlay" />
            <div className="featured-card-body">
              <div className="featured-card-label">Featured Champion</div>
              <div className="featured-card-name">{heroChamp.name}</div>
              <div className="featured-card-title">the {heroChamp.title}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {heroChamp.tags.map(t => (
                  <span key={t} className="badge badge-gold">{t}</span>
                ))}
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="section-label">Quick Actions</div>
      <div className="quick-actions">
        <Link to="/champions" className="quick-action-item">
          <div className="qa-icon"><BookIcon /></div>
          <div className="qa-text">
            <div className="qa-label">Browse Champions</div>
            <div className="qa-desc">Search, filter by role</div>
          </div>
          <span className="qa-arrow">›</span>
        </Link>
        <Link to="/builds" className="quick-action-item">
          <div className="qa-icon"><SwordIcon /></div>
          <div className="qa-text">
            <div className="qa-label">Build Planner</div>
            <div className="qa-desc">Plan items & runes</div>
          </div>
          <span className="qa-arrow">›</span>
        </Link>
        <Link to="/champions" className="quick-action-item">
          <div className="qa-icon"><ShieldIcon /></div>
          <div className="qa-text">
            <div className="qa-label">Champion Lore</div>
            <div className="qa-desc">Stories from Runeterra</div>
          </div>
          <span className="qa-arrow">›</span>
        </Link>
        <Link to="/profile" className="quick-action-item">
          <div className="qa-icon"><UserIcon /></div>
          <div className="qa-text">
            <div className="qa-label">My Profile</div>
            <div className="qa-desc">Summoner info</div>
          </div>
          <span className="qa-arrow">›</span>
        </Link>
      </div>
    </div>
  )
}
