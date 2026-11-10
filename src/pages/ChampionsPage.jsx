import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useChampions } from '../hooks/useChampions'
import './ChampionsPage.css'

const ROLES = ['All', 'Fighter', 'Mage', 'Assassin', 'Marksman', 'Support', 'Tank']

export default function ChampionsPage() {
  const { champions, loading, error } = useChampions()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('All')

  const filtered = useMemo(() => {
    return champions.filter((c) => {
      const q = search.toLowerCase()
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
      const matchRole = role === 'All' || c.tags.includes(role)
      return matchSearch && matchRole
    })
  }, [champions, search, role])

  return (
    <div>
      <div className="page-header">
        <h1>Champions</h1>
        <p>Semua champion League of Legends — klik untuk lore, abilities, dan skins.</p>
      </div>

      {/* Controls */}
      <div className="champ-controls">
        <div className="search-field">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="input"
            type="text"
            placeholder="Search champion name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="role-tabs">
          {ROLES.map((r) => (
            <button
              key={r}
              className={`role-tab${role === r ? ' active' : ''}`}
              onClick={() => setRole(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          Gagal memuat data champion. Pastikan ada koneksi internet untuk pertama kali.
        </div>
      )}

      {!loading && (
        <p className="champ-results-info">
          {filtered.length} of {champions.length} champions
        </p>
      )}

      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          <span className="spinner-label">Loading Champion Data</span>
        </div>
      ) : (
        <div className="champ-grid">
          {filtered.length === 0 ? (
            <div className="no-results">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6"/></svg>
              <p>No champions found for "{search}"</p>
            </div>
          ) : (
            filtered.map((c) => (
              <Link key={c.id} to={`/champions/${c.id}`} className="champ-tile">
                <img className="champ-tile-img" src={c.image} alt={c.name} loading="lazy" />
                <div className="champ-tile-overlay" />
                <div className="champ-tile-tags">
                  {c.tags.slice(0, 1).map((t) => (
                    <span key={t} className="badge badge-gold">{t}</span>
                  ))}
                </div>
                <div className="champ-tile-info">
                  <div className="champ-tile-name">{c.name}</div>
                  <div className="champ-tile-title">the {c.title}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
