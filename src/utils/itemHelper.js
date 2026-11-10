import ITEM_MAP from '../data/itemMap'
import { getDDragonBase } from '../config/api'

export function getItemIconUrl(itemName) {
  if (!itemName) return null
  const key = String(itemName).toLowerCase().trim()
  const id = ITEM_MAP[key]
  if (id) {
    return `${getDDragonBase()}/img/item/${id}.png`
  }
  return null
}
