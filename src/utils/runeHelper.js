import RUNE_MAP from '../data/runeMap.js'

export function getRuneIconUrl(runeName) {
  if (!runeName) return null
  const key = String(runeName).toLowerCase().trim()
  const norm = key.replace(/[':]/g, '')
  const iconPath = RUNE_MAP[key] || RUNE_MAP[norm]
  if (iconPath) {
    return `https://ddragon.leagueoflegends.com/cdn/img/${iconPath}`
  }
  return null
}

export function parseRunes(runesInput) {
  if (!runesInput) return []
  if (Array.isArray(runesInput)) return runesInput
  return String(runesInput)
    .split(/\s*[-–—,/•]\s*/)
    .map(r => r.trim())
    .filter(Boolean)
}
