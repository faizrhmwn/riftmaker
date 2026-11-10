import { useState, useEffect } from 'react'
import RUNE_TREES from '../data/runeTrees.js'
import STAT_SHARDS from '../data/statShards.js'
import { parseRuneSections, getRuneInfo } from '../utils/runeHelper.js'
import './RunePageSelector.css'

export default function RunePageSelector({ value, onChange }) {
  // Parse initial state from string
  const [primaryTreeName, setPrimaryTreeName] = useState('Precision')
  const [secondaryTreeName, setSecondaryTreeName] = useState('Inspiration')
  const [primaryRunes, setPrimaryRunes] = useState(['Conqueror', 'Triumph', 'Legend: Bloodline', 'Coup de Grace'])
  const [secondaryRunes, setSecondaryRunes] = useState(['Magical Footwear', 'Cosmic Insight'])
  const [statShards, setStatShards] = useState(['Attack Speed', 'Adaptive Force', 'Scaling Health'])

  // Sync from props on initial load or change
  useEffect(() => {
    if (!value) return
    const { primary, secondary, shards } = parseRuneSections(value)
    if (primary.length > 0) {
      const pInfo = getRuneInfo(primary[0])
      if (pInfo?.treeName) {
        setPrimaryTreeName(pInfo.treeName)
      }
      setPrimaryRunes(primary)
    }
    if (secondary.length > 0) {
      const sInfo = getRuneInfo(secondary[0])
      if (sInfo?.treeName) {
        setSecondaryTreeName(sInfo.treeName)
      }
      setSecondaryRunes(secondary)
    }
    if (shards.length > 0) {
      setStatShards(shards)
    }
  }, [])

  // Helper to emit serialized value
  const emitChange = (pRunes, sRunes, shards = statShards) => {
    const parts = []
    if (pRunes.length > 0) parts.push(pRunes.join(' - '))
    if (sRunes.length > 0) parts.push(sRunes.join(' - '))
    const serialized = parts.join(' // ')
    onChange(serialized)
  }

  // Active Tree objects
  const primaryTree = RUNE_TREES.find((t) => t.name === primaryTreeName) || RUNE_TREES[0]
  const secondaryTree = RUNE_TREES.find((t) => t.name === secondaryTreeName) || RUNE_TREES[4]

  // Change Primary Tree
  const handleSelectPrimaryTree = (treeName) => {
    setPrimaryTreeName(treeName)
    const newTree = RUNE_TREES.find((t) => t.name === treeName)
    if (!newTree) return

    // Pick first rune from each slot as default
    const newPrimaryRunes = newTree.slots.map((slot) => slot[0]?.name).filter(Boolean)
    setPrimaryRunes(newPrimaryRunes)

    // If secondary tree is the same, pick a different one
    let newSecTreeName = secondaryTreeName
    if (newSecTreeName === treeName) {
      const alt = RUNE_TREES.find((t) => t.name !== treeName)
      newSecTreeName = alt ? alt.name : 'Inspiration'
      setSecondaryTreeName(newSecTreeName)
      const secTreeObj = RUNE_TREES.find((t) => t.name === newSecTreeName)
      const newSecRunes = [secTreeObj?.slots[1]?.[0]?.name, secTreeObj?.slots[2]?.[0]?.name].filter(Boolean)
      setSecondaryRunes(newSecRunes)
      emitChange(newPrimaryRunes, newSecRunes)
      return
    }

    emitChange(newPrimaryRunes, secondaryRunes)
  }

  // Change Secondary Tree
  const handleSelectSecondaryTree = (treeName) => {
    if (treeName === primaryTreeName) return
    setSecondaryTreeName(treeName)
    const newSecTree = RUNE_TREES.find((t) => t.name === treeName)
    if (!newSecTree) return

    // Pick 2 runes from slot 1 & 2 by default
    const newSecRunes = [newSecTree.slots[1]?.[0]?.name, newSecTree.slots[2]?.[0]?.name].filter(Boolean)
    setSecondaryRunes(newSecRunes)
    emitChange(primaryRunes, newSecRunes)
  }

  // Click rune in primary tree (1 per slot)
  const handlePrimaryRuneClick = (slotIdx, runeName) => {
    const updated = [...primaryRunes]
    updated[slotIdx] = runeName
    setPrimaryRunes(updated)
    emitChange(updated, secondaryRunes)
  }

  // Click rune in secondary tree (choose any 2)
  const handleSecondaryRuneClick = (slotIdx, runeName) => {
    let updated = [...secondaryRunes]
    if (updated.includes(runeName)) {
      // Unselect if already selected
      updated = updated.filter((r) => r !== runeName)
    } else {
      // Check if we already have a rune from this slot
      const secTreeSlots = secondaryTree.slots
      const existingInSameSlot = updated.find((r) =>
        secTreeSlots[slotIdx]?.some((sr) => sr.name === r)
      )

      if (existingInSameSlot) {
        // Replace rune in the same slot
        updated = updated.map((r) => (r === existingInSameSlot ? runeName : r))
      } else if (updated.length >= 2) {
        // If already 2 selected, replace the second one
        updated = [updated[0], runeName]
      } else {
        updated.push(runeName)
      }
    }
    setSecondaryRunes(updated)
    emitChange(primaryRunes, updated)
  }

  // Click stat shard
  const handleStatShardClick = (rowIdx, shardName) => {
    const updated = [...statShards]
    updated[rowIdx] = shardName
    setStatShards(updated)
    emitChange(primaryRunes, secondaryRunes, updated)
  }

  return (
    <div className="rune-page-container">
      <div className="rune-page-title">RUNES</div>

      <div className="rune-page-columns">
        {/* ===== LEFT COLUMN: PRIMARY TREE ===== */}
        <div className="rune-col primary-col">
          {/* Header & Path selector */}
          <div className="tree-header-row">
            <div className="tree-selector-wrap">
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/img/${primaryTree.icon}`}
                alt={primaryTree.name}
                className="tree-active-icon"
              />
              <select
                className="tree-select"
                value={primaryTreeName}
                onChange={(e) => handleSelectPrimaryTree(e.target.value)}
              >
                {RUNE_TREES.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Primary Slots */}
          <div className="rune-slots-col">
            {primaryTree.slots.map((slotRunes, slotIdx) => (
              <div
                key={slotIdx}
                className={`rune-row ${slotIdx === 0 ? 'keystone-row' : 'minor-row'}`}
              >
                {slotRunes.map((rune) => {
                  const isSelected = primaryRunes.includes(rune.name)
                  return (
                    <button
                      key={rune.name}
                      type="button"
                      className={`rune-circle-btn ${isSelected ? 'active' : 'dimmed'} ${
                        slotIdx === 0 ? 'keystone-btn' : ''
                      }`}
                      onClick={() => handlePrimaryRuneClick(slotIdx, rune.name)}
                      title={rune.name}
                    >
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`}
                        alt={rune.name}
                        className="rune-circle-img"
                        loading="lazy"
                      />
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ===== RIGHT COLUMN: SECONDARY TREE & SHARDS ===== */}
        <div className="rune-col secondary-col">
          {/* Header & Path selector */}
          <div className="tree-header-row">
            <div className="tree-selector-wrap">
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/img/${secondaryTree.icon}`}
                alt={secondaryTree.name}
                className="tree-active-icon"
              />
              <select
                className="tree-select"
                value={secondaryTreeName}
                onChange={(e) => handleSelectSecondaryTree(e.target.value)}
              >
                {RUNE_TREES.filter((t) => t.name !== primaryTreeName).map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Secondary Slots (Slots 1, 2, 3 only - no keystone) */}
          <div className="rune-slots-col">
            {secondaryTree.slots.slice(1).map((slotRunes, idx) => {
              const actualSlotIdx = idx + 1
              return (
                <div key={actualSlotIdx} className="rune-row minor-row">
                  {slotRunes.map((rune) => {
                    const isSelected = secondaryRunes.includes(rune.name)
                    return (
                      <button
                        key={rune.name}
                        type="button"
                        className={`rune-circle-btn ${isSelected ? 'active secondary-active' : 'dimmed'}`}
                        onClick={() => handleSecondaryRuneClick(actualSlotIdx, rune.name)}
                        title={rune.name}
                      >
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`}
                          alt={rune.name}
                          className="rune-circle-img"
                          loading="lazy"
                        />
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Stat Shards */}
          <div className="shards-section">
            {STAT_SHARDS.map((shardRow, rowIdx) => (
              <div key={rowIdx} className="rune-row shards-row">
                {shardRow.options.map((shard) => {
                  const isSelected = statShards[rowIdx] === shard.name
                  return (
                    <button
                      key={shard.id}
                      type="button"
                      className={`shard-circle-btn ${isSelected ? 'active' : 'dimmed'}`}
                      onClick={() => handleStatShardClick(rowIdx, shard.name)}
                      title={shard.name}
                    >
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/img/${shard.icon}`}
                        alt={shard.name}
                        className="shard-circle-img"
                        loading="lazy"
                      />
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
