import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useChampionDetail } from '../hooks/useChampions'
import './ChampionDetailPage.css'

const STAT_MAP = {
  hp: 'HP', hpperlevel: 'HP/lvl', mp: 'Mana', mpperlevel: 'Mana/lvl',
  movespeed: 'Move Speed', armor: 'Armor', armorperlevel: 'Armor/lvl',
  spellblock: 'Magic Resist', attackrange: 'Attack Range',
  attackdamage: 'Attack Damage', attackdamageperlevel: 'AD/lvl',
  attackspeed: 'Attack Speed', attackspeedperlevel: 'AS/lvl',
  crit: 'Crit', hpregen: 'HP Regen', mpregen: 'Mana Regen',
}

const TABS = ['Lore', 'Abilities', 'Stats', 'Skins', 'Tips']

export default function ChampionDetailPage() {
  const { id } = useParams()
  const { champion, loading, error } = useChampionDetail(id)
  const [tab, setTab] = useState('Lore')

  if (loading) return (
    <div>
      <Link to="/champions" className="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back to Champions
      </Link>
      <div className="spinner-wrap">
        <div className="spinner" />
        <span className="spinner-label">Summoning Champion Data</span>
      </div>
    </div>
  )

  if (error || !champion) return (
    <div>
      <Link to="/champions" className="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back to Champions
      </Link>
      <div className="alert alert-error">{error || 'Champion not found.'}</div>
    </div>
  )

  return (
    <div>
      <Link to="/champions" className="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back to Champions
      </Link>

      {/* Cinematic banner */}
      <div className="detail-banner">
        <img className="detail-banner-img" src={champion.splash} alt={champion.name} />
        <div className="detail-banner-overlay" />
        <div className="detail-banner-content">
          <div className="detail-eyebrow">{champion.tags.join('  ·  ')}</div>
          <div className="detail-name">{champion.name}</div>
          <div className="detail-title-line">the {champion.title}</div>
          <div className="detail-tags">
            <span className="badge badge-blue">{champion.partype}</span>
            {champion.tags.map(t => (
              <span key={t} className="badge badge-gold">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="detail-tabs-bar">
        {TABS.map(t => (
          <button
            key={t}
            className={`dtab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── LORE ── */}
      {tab === 'Lore' && (
        <p className="lore-body">{champion.lore}</p>
      )}

      {/* ── ABILITIES ── */}
      {tab === 'Abilities' && (
        <div className="ability-grid">
          {/* Passive */}
          <div className="ability-row">
            <div className="ability-icon-wrap">
              <img className="ability-img" src={champion.passive.image} alt={champion.passive.name} />
              <span className="ability-key-badge">P</span>
            </div>
            <div className="ability-info">
              <div className="ability-name">{champion.passive.name}</div>
              <div className="ability-desc">{champion.passive.description}</div>
            </div>
          </div>
          {/* Active spells */}
          {champion.spells.map(s => (
            <div key={s.id} className="ability-row">
              <div className="ability-icon-wrap">
                <img className="ability-img" src={s.image} alt={s.name} />
                <span className="ability-key-badge">{s.key}</span>
              </div>
              <div className="ability-info">
                <div className="ability-name">{s.name}</div>
                <div className="ability-desc">{s.description}</div>
                <div className="ability-stats">
                  {s.cooldown && s.cooldown !== '0' && (
                    <span className="ability-stat"><strong>Cooldown</strong> {s.cooldown}s</span>
                  )}
                  {s.cost && s.cost !== '0' && (
                    <span className="ability-stat"><strong>Cost</strong> {s.cost}</span>
                  )}
                  {s.range && s.range !== '0' && (
                    <span className="ability-stat"><strong>Range</strong> {s.range}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── STATS ── */}
      {tab === 'Stats' && (
        <div className="stats-layout">
          {Object.entries(champion.stats)
            .filter(([k]) => STAT_MAP[k])
            .map(([k, v]) => (
              <div key={k} className="stat-entry">
                <span className="stat-entry-label">{STAT_MAP[k]}</span>
                <span className="stat-entry-val">
                  {typeof v === 'number' ? (v % 1 !== 0 ? v.toFixed(2) : v) : v}
                </span>
              </div>
            ))}
        </div>
      )}

      {/* ── SKINS ── */}
      {tab === 'Skins' && (
        <div className="skins-grid">
          {champion.skins.map(sk => (
            <div key={sk.id} className="skin-tile">
              <img src={sk.image} alt={sk.name} loading="lazy" />
              <div className="skin-tile-name">{sk.name}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── TIPS ── */}
      {tab === 'Tips' && (
        <div>
          {champion.tips?.length > 0 && (
            <div className="tips-block">
              <div className="tips-heading tips-ally">Playing {champion.name}</div>
              {champion.tips.map((t, i) => (
                <div key={i} className="tip-line">{t}</div>
              ))}
            </div>
          )}
          {champion.enemytips?.length > 0 && (
            <div className="tips-block">
              <div className="tips-heading tips-enemy">Against {champion.name}</div>
              {champion.enemytips.map((t, i) => (
                <div key={i} className="tip-line">{t}</div>
              ))}
            </div>
          )}
          {!champion.tips?.length && !champion.enemytips?.length && (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 14 }}>
              No tips available for this champion.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
