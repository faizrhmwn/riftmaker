import RUNE_MAP from '../data/runeMap.js'
import RUNE_TREES from '../data/runeTrees.js'

// Precompute rune metadata
const RUNE_META = {}
RUNE_TREES.forEach((tree) => {
  RUNE_META[tree.name.toLowerCase()] = { treeName: tree.name, isTree: true, icon: tree.icon }
  tree.slots.forEach((slot, slotIdx) => {
    slot.forEach((r) => {
      const key = r.name.toLowerCase()
      RUNE_META[key] = {
        treeName: tree.name,
        slotIdx,
        isKeystone: slotIdx === 0,
        icon: r.icon,
        name: r.name
      }
      RUNE_META[key.replace(/[':]/g, '')] = RUNE_META[key]
    })
  })
})

export function getRuneInfo(name) {
  if (!name) return null
  const key = String(name).toLowerCase().trim()
  return RUNE_META[key] || RUNE_META[key.replace(/[':]/g, '')] || null
}

export function getRuneIconUrl(runeName) {
  if (!runeName) return null
  const key = String(runeName).toLowerCase().trim()
  const norm = key.replace(/[':]/g, '')
  const iconPath = RUNE_MAP[key] || RUNE_MAP[norm] || RUNE_META[key]?.icon
  if (iconPath) {
    return `https://ddragon.leagueoflegends.com/cdn/img/${iconPath}`
  }
  return null
}

export function parseRunes(runesInput) {
  if (!runesInput) return []
  if (Array.isArray(runesInput)) return runesInput
  return String(runesInput)
    .split(/\s*[-–—,/•|]\s*/)
    .map(r => r.trim())
    .filter(Boolean)
}

export function parseRuneSections(runesInput) {
  if (!runesInput) return { primary: [], secondary: [], shards: [] }
  const raw = String(runesInput)
  
  if (raw.includes('//')) {
    const [pPart, rest] = raw.split('//').map(s => s.trim())
    const primary = parseRunes(pPart)
    let secondary = []
    let shards = []
    if (rest) {
      if (rest.includes('::')) {
        const [secPart, shPart] = rest.split('::').map(s => s.trim())
        secondary = parseRunes(secPart)
        shards = parseRunes(shPart)
      } else {
        secondary = parseRunes(rest)
      }
    }
    return { primary, secondary, shards }
  }

  const all = parseRunes(raw)
  if (all.length <= 4) {
    return { primary: all, secondary: [], shards: [] }
  }
  
  const firstRuneTree = getRuneInfo(all[0])?.treeName
  const primary = []
  const secondary = []
  
  all.forEach((r) => {
    const info = getRuneInfo(r)
    if (info && firstRuneTree && info.treeName === firstRuneTree) {
      primary.push(r)
    } else {
      secondary.push(r)
    }
  })

  if (primary.length === 0) {
    return {
      primary: all.slice(0, 4),
      secondary: all.slice(4),
      shards: []
    }
  }

  return { primary, secondary, shards: [] }
}
