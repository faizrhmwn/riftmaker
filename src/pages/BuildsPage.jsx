import { useState, useEffect } from 'react'
import { useBuilds } from '../hooks/useBuilds'
import championService from '../services/championService'
import PATCH_ITEMS from '../data/patch16_22_items'
import RUNE_TREES from '../data/runeTrees'
import { getItemIconUrl } from '../utils/itemHelper'
import { getRuneIconUrl, parseRunes } from '../utils/runeHelper'
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
  const [activeTreeIndex, setActiveTreeIndex] = useState(0)

  const patch = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const selectedRunes = parseRunes(form.runes)

  const toggleRune = (runeName) => {
    let next
    if (selectedRunes.includes(runeName)) {
      next = selectedRunes.filter((r) => r !== runeName)
    } else {
      next = [...selectedRunes, runeName]
    }
    patch('runes', next.join(' - '))
  }

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
  const activeTree = RUNE_TREES[activeTreeIndex] || RUNE_TREES[0]

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

          {/* RUNES SELECTION (NO TYPING - SELECT FROM OFFICIAL TREES) */}
          <div className="form-group">
            <div className="runes-section-header">
              <label style={{ margin: 0 }}>
                Runes <span style={{ color: 'var(--text-muted)', fontFamily: 'inherit', textTransform: 'none', letterSpacing: 0 }}>({selectedRunes.length} dipilih)</span>
              </label>
              {selectedRunes.length > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => patch('runes', '')}
                  style={{ fontSize: 10, padding: '2px 8px' }}
                >
                  Reset Runes
                </button>
              )}
            </div>

            {/* Selected runes pills (just like items!) */}
            <div className="runes-tag-list">
              {selectedRunes.length === 0 ? (
                <div className="runes-none-selected">
                  Belum ada rune yang dipilih. Klik rune pada pohon di bawah:
                </div>
              ) : (
                selectedRunes.map((rune) => (
                  <span key={rune} className="rune-pill">
                    <RuneIcon name={rune} size={18} />
                    <span>{rune}</span>
                    <button
                      type="button"
                      className="item-pill-remove"
                      onClick={() => toggleRune(rune)}
                      title={`Hapus ${rune}`}
                    >✕</button>
                  </span>
                ))
              )}
            </div>

            {/* Tree Picker with 4 Slots per path */}
            <div className="rune-picker-card">
              {/* 5 Tree Tabs */}
              <div className="rune-tree-tabs">
                {RUNE_TREES.map((tree, idx) => (
                  <button
                    key={tree.name}
                    type="button"
                    className={`rune-tree-tab ${activeTreeIndex === idx ? 'active ' + tree.name.toLowerCase() : ''}`}
                    onClick={() => setActiveTreeIndex(idx)}
                  >
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/img/${tree.icon}`}
                      alt={tree.name}
                      className="rune-tree-tab-icon"
                    />
                    <span>{tree.name}</span>
                  </button>
                ))}
              </div>

              {/* 4 Slots / Tiers for the active tree */}
              <div className="rune-slots-wrapper">
                {activeTree.slots.map((slotRunes, slotIdx) => (
                  <div key={slotIdx} className="rune-slot-row">
                    <div className="rune-slot-tag">
                      {slotIdx === 0 ? 'Keystone' : `Slot ${slotIdx}`}
                    </div>
                    <div className="rune-slot-options">
                      {slotRunes.map((r) => {
                        const isSelected = selectedRunes.includes(r.name)
                        return (
                          <button
                            key={r.name}
                            type="button"
                            className={`rune-choice-btn ${isSelected ? 'selected' : ''} ${slotIdx === 0 ? 'keystone-choice' : ''}`}
                            onClick={() => toggleRune(r.name)}
                            title={r.name}
                          >
                            <img
                              src={`https://ddragon.leagueoflegends.com/cdn/img/${r.icon}`}
                              alt={r.name}
                              className="rune-choice-img"
                              loading="lazy"
                            />
                            <span className="rune-choice-name">{r.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

export default function BuildsPage() {
  const { builds, createBuild, updateBuild, deleteBuild } = useBuilds()
  const [modal, setModal]     = useState(null)
  const [delTarget, setDel]   = useState(null)
  const [toast, setToast]     = useState('')
  const [itemsList, setItemsList] = useState(PATCH_ITEMS)

  useEffect(() => {
    championService.getAllItems().then((liveItems) => {
      if (liveItems && liveItems.length > 0) {
        setItemsList(liveItems)
      }
    })
  }, [])

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
        <button className="btn btn-primary" onClick={() => setModal({})}>
          + Buat Build Baru
        </button>
      </div>

      {/* Empty state */}
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

      {/* Build list */}
      {builds.length > 0 && (
        <div className="builds-list">
          {builds.map((b) => (
            <div key={b.id} className="build-entry">
              <div className="build-entry-main">
                <div className="build-entry-champ">{b.champion || 'Unknown Champion'}</div>
                <div className="build-entry-title">{b.title}</div>
                <div className="build-entry-meta">
                  <span className="build-entry-role">{b.role}</span>
                  {b.runes && (
                    <div className="build-entry-runes">
                      {parseRunes(b.runes).map((rune, idx) => (
                        <span key={idx} className="build-rune-pill" title={rune}>
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
