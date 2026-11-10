import { useState, useEffect, useMemo } from 'react'
import { useBuilds } from '../hooks/useBuilds'
import championService from '../services/championService'
import PATCH_ITEMS from '../data/patch16_22_items'
import RunePageSelector from '../components/RunePageSelector'
import { getItemIconUrl } from '../utils/itemHelper'
import { getRuneIconUrl, parseRunes, parseRuneSections } from '../utils/runeHelper'
import './BuildsPage.css'

function ItemIcon({ name, size = 22 }) {
  const iconUrl = getItemIconUrl(name)
  if (!iconUrl) return null
  return (
    <img
      src={iconUrl}
      alt={name}
      className="build-item-img"
      style={{ width: size, height: size }}
      loading="lazy"
      onError={(e) => { e.currentTarget.style.display = 'none' }}
    />
  )
}

function RuneIcon({ name, size = 18 }) {
  const iconUrl = getRuneIconUrl(name)
  if (!iconUrl) return null
  return (
    <img
      src={iconUrl}
      alt={name}
      className="build-rune-img"
      style={{ width: size, height: size }}
      loading="lazy"
      onError={(e) => { e.currentTarget.style.display = 'none' }}
    />
  )
}

const POPULAR_KEYSTONES = [
  'Lethal Tempo', 'Conqueror', 'Press the Attack', 'Fleet Footwork',
  'Electrocute', 'Dark Harvest', 'Hail of Blades',
  'First Strike', 'Phase Rush', 'Arcane Comet', 'Summon Aery',
  'Grasp of the Undying', 'Aftershock'
]

const ROLES = ['Top', 'Jungle', 'Mid', 'ADC', 'Support']

const BLANK = { champion: '', title: '', role: 'Mid', items: [], runes: '', notes: '' }

/* ---- Build Form Modal ---- */
function BuildModal({ initial, onClose, onSave, availableItems }) {
  const [form, setForm] = useState(initial || BLANK)
  const [itemText, setItemText] = useState('')
  const [errors, setErrors] = useState({})

  const patch = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.champion.trim()) e.champion = 'Champion wajib diisi'
    if (!form.title.trim()) e.title = 'Judul build wajib diisi'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = (e) => {
    e.preventDefault()
    if (validate()) onSave(form)
  }

  const addItem = () => {
    const v = itemText.trim()
    if (v && !form.items.includes(v) && form.items.length < 6) {
      patch('items', [...form.items, v])
      setItemText('')
    }
  }

  const isEditing = !!initial?.id

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal build-modal-wide">
        {/* corner ornaments */}
        <span className="modal-tl" /><span className="modal-tr" />
        <span className="modal-bl" /><span className="modal-br" />

        <div className="modal-header">
          <h2>{isEditing ? 'Edit Build' : 'New Build'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit}>
          <div className="form-row-2">
            <div className="form-group">
              <label>Champion</label>
              <input
                className="input"
                placeholder="e.g. Jinx, Ahri, Zaahen"
                value={form.champion}
                onChange={(e) => patch('champion', e.target.value)}
              />
              {errors.champion && <div className="field-error">{errors.champion}</div>}
            </div>
            <div className="form-group">
              <label>Role</label>
              <select className="input" value={form.role} onChange={(e) => patch('role', e.target.value)}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Build Title</label>
            <input
              className="input"
              placeholder="e.g. Patch 16.22 Lethal Hypercarry"
              value={form.title}
              onChange={(e) => patch('title', e.target.value)}
            />
            {errors.title && <div className="field-error">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label>
              Items <span style={{ color: 'var(--text-muted)', fontFamily: 'inherit', textTransform: 'none', letterSpacing: 0 }}>({form.items.length}/6) — Patch 16.22</span>
            </label>
            <div className="items-add-row">
              <input
                className="input"
                placeholder="Cari item patch 16.22 (misal: Yun Tal, Malignance)..."
                value={itemText}
                list="item-datalist"
                onChange={(e) => setItemText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
              />
              <datalist id="item-datalist">
                {(availableItems || PATCH_ITEMS).map((i) => <option key={i} value={i} />)}
              </datalist>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={addItem}
                disabled={form.items.length >= 6}
                style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                Add
              </button>
            </div>
            {form.items.length > 0 && (
              <div className="items-tag-list">
                {form.items.map((item) => (
                  <span key={item} className="item-pill">
                    <ItemIcon name={item} size={20} />
                    {item}
                    <button
                      type="button"
                      className="item-pill-remove"
                      onClick={() => patch('items', form.items.filter((i) => i !== item))}
                    >✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* RUNES SELECTION (IN-GAME 2 TREES + SHARDS PICKER) */}
          <div className="form-group">
            <RunePageSelector
              value={form.runes}
              onChange={(val) => patch('runes', val)}
            />
          </div>

          <div className="form-group">
            <label>Strategy & Matchup Notes</label>
            <textarea
              className="input"
              placeholder="Tips item spike, combo rotation, matchup notes..."
              value={form.notes}
              onChange={(e) => patch('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Simpan Perubahan' : 'Buat Build'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ---- Delete Confirm Modal ---- */
function ConfirmModal({ build, onClose, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <span className="modal-tl" /><span className="modal-tr" />
        <span className="modal-bl" /><span className="modal-br" />
        <div className="modal-header">
          <h2>Hapus Build</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="confirm-text">
          Hapus build <strong>"{build.title}"</strong> untuk{' '}
          <strong>{build.champion}</strong>? Aksi ini tidak dapat dibatalkan.
        </p>
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onClose}>Batal</button>
          <button className="btn btn-danger" onClick={onConfirm}>Hapus</button>
        </div>
      </div>
    </div>
  )
}

function WrenchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  )
}

function fmt(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const LANES = ['All', 'Top', 'Jungle', 'Mid', 'ADC', 'Support']

export default function BuildsPage() {
  const { builds, createBuild, updateBuild, deleteBuild } = useBuilds()
  const [modal, setModal]     = useState(null)
  const [delTarget, setDel]   = useState(null)
  const [toast, setToast]     = useState('')
  const [itemsList, setItemsList] = useState(PATCH_ITEMS)
  const [selectedLane, setSelectedLane] = useState('All')
  const [search, setSearch]   = useState('')

  useEffect(() => {
    championService.getAllItems().then((liveItems) => {
      if (liveItems && liveItems.length > 0) {
        setItemsList(liveItems)
      }
    })
  }, [])

  const filteredBuilds = useMemo(() => {
    return builds.filter((b) => {
      const matchLane = selectedLane === 'All' || b.role?.toLowerCase() === selectedLane.toLowerCase()
      const q = search.toLowerCase().trim()
      const matchSearch = !q ||
        b.champion?.toLowerCase().includes(q) ||
        b.title?.toLowerCase().includes(q) ||
        b.notes?.toLowerCase().includes(q)
      return matchLane && matchSearch
    })
  }, [builds, selectedLane, search])

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleSave = async (data) => {
    if (modal?.id) { await updateBuild(modal.id, data); flash('Build berhasil diperbarui.') }
    else           { await createBuild(data);            flash('Build baru berhasil dibuat.') }
    setModal(null)
  }

  const handleDelete = async () => {
    await deleteBuild(delTarget.id)
    setDel(null)
    flash('Build berhasil dihapus.')
  }

  return (
    <div>
      <div className="page-header">
        <h1>Build Planner — Patch 16.22</h1>
        <p>Rencanakan dan simpan item build champion League of Legends. Terupdate ke patch 16.22 dan tersimpan offline.</p>
      </div>

      {toast && <div className="alert alert-success">{toast}</div>}

      <div className="builds-topbar">
        <span className="builds-count">
          {builds.length} build{builds.length !== 1 ? 's' : ''} tersimpan · {itemsList.length} items tersedia
        </span>
        <button className="btn btn-primary" onClick={() => setModal({ role: selectedLane === 'All' ? 'Mid' : selectedLane })}>
          + Buat Build Baru
        </button>
      </div>

      {/* Lane Filter Tabs & Search Controls */}
      {builds.length > 0 && (
        <div className="builds-controls">
          <div className="builds-search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="input builds-search-input"
              type="text"
              placeholder="Cari champion atau build..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="search-clear-btn" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          <div className="lane-tabs">
            {LANES.map((lane) => {
              const count = lane === 'All'
                ? builds.length
                : builds.filter((b) => b.role?.toLowerCase() === lane.toLowerCase()).length
              return (
                <button
                  key={lane}
                  type="button"
                  className={`lane-tab ${selectedLane === lane ? 'active' : ''}`}
                  onClick={() => setSelectedLane(lane)}
                >
                  <span>{lane}</span>
                  <span className="lane-count-badge">{count}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state (Total 0 builds) */}
      {builds.length === 0 && (
        <div className="builds-empty">
          <div className="builds-empty-icon"><WrenchIcon /></div>
          <h2>Belum Ada Build Tersimpan</h2>
          <p>Mulai simpan racikan item dan runes untuk champion favoritmu.</p>
          <button className="btn btn-primary" onClick={() => setModal({})}>
            Buat Build Pertama
          </button>
        </div>
      )}

      {/* Filter empty state (builds exist, but none match lane/search filter) */}
      {builds.length > 0 && filteredBuilds.length === 0 && (
        <div className="builds-empty" style={{ margin: '20px 0' }}>
          <h2>Tidak Ada Build di Lane {selectedLane}</h2>
          <p>Belum ada build yang sesuai dengan filter pencarian ini.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => { setSelectedLane('All'); setSearch('') }}>
              Reset Filter
            </button>
            <button className="btn btn-primary" onClick={() => setModal({ role: selectedLane === 'All' ? 'Mid' : selectedLane })}>
              + Buat Build {selectedLane === 'All' ? '' : selectedLane}
            </button>
          </div>
        </div>
      )}

      {/* Build list */}
      {filteredBuilds.length > 0 && (
        <div className="builds-list">
          {filteredBuilds.map((b) => (
            <div key={b.id} className="build-entry">
              <div className="build-entry-main">
                <div className="build-entry-champ">{b.champion || 'Unknown Champion'}</div>
                <div className="build-entry-title">{b.title}</div>
                <div className="build-entry-meta">
                  <span className="build-entry-role">{b.role}</span>
                  {b.runes && (
                    <div className="build-entry-runes">
                      {parseRuneSections(b.runes).primary.map((rune, idx) => (
                        <span key={'p-' + idx} className="build-rune-pill primary" title={rune}>
                          <RuneIcon name={rune} size={16} />
                          <span>{rune}</span>
                        </span>
                      ))}
                      {parseRuneSections(b.runes).secondary.length > 0 && (
                        <span className="build-runes-separator">/</span>
                      )}
                      {parseRuneSections(b.runes).secondary.map((rune, idx) => (
                        <span key={'s-' + idx} className="build-rune-pill secondary" title={rune}>
                          <RuneIcon name={rune} size={16} />
                          <span>{rune}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {b.items?.length > 0 && (
                    <div className="build-entry-items">
                      {b.items.map((item) => (
                        <span key={item} className="build-item-pill">
                          <ItemIcon name={item} size={22} />
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {b.notes && <div className="build-entry-notes">"{b.notes}"</div>}
              </div>

              <div className="build-entry-actions">
                <span className="build-entry-date">{fmt(b.updated_at || b.created_at)}</span>
                <div className="build-entry-btns">
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal(b)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDel(b)}>Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <BuildModal
          initial={modal?.id ? modal : null}
          availableItems={itemsList}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {delTarget && (
        <ConfirmModal
          build={delTarget}
          onClose={() => setDel(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
