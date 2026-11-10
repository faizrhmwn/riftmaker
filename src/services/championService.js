import { ddClient, getDDragonBase, initDDragonVersion, getDDragonVersion } from '../config/api'

class ChampionService {
  async ensureVersion() {
    await initDDragonVersion()
  }

  async getAllChampions() {
    await this.ensureVersion()
    const base = getDDragonBase()
    const data = await ddClient.get(`${base}/data/en_US/champion.json`)
    const list = Object.values(data.data).map((c) => ({
      id: c.id,
      name: c.name,
      title: c.title,
      blurb: c.blurb,
      tags: c.tags,
      image: `${base}/img/champion/${c.image.full}`,
      splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${c.id}_0.jpg`,
      stats: c.stats,
      partype: c.partype,
    }))
    return list
  }

  async getChampionDetail(id) {
    await this.ensureVersion()
    const base = getDDragonBase()
    const data = await ddClient.get(`${base}/data/en_US/champion/${id}.json`)
    const c = data.data[id]
    return {
      id: c.id,
      name: c.name,
      title: c.title,
      lore: c.lore,
      tags: c.tags,
      partype: c.partype,
      image: `${base}/img/champion/${c.image.full}`,
      splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${c.id}_0.jpg`,
      passive: {
        name: c.passive.name,
        description: c.passive.description.replace(/<[^>]+>/g, ''),
        image: `${base}/img/passive/${c.passive.image.full}`,
      },
      spells: c.spells.map((s, i) => ({
        id: s.id,
        name: s.name,
        description: s.description.replace(/<[^>]+>/g, ''),
        key: ['Q', 'W', 'E', 'R'][i],
        image: `${base}/img/spell/${s.image.full}`,
        cooldown: s.cooldownBurn,
        cost: s.costBurn,
        range: s.rangeBurn,
      })),
      stats: c.stats,
      skins: (c.skins || []).map((sk) => ({
        id: sk.id,
        name: sk.name === 'default' ? c.name : sk.name,
        num: sk.num,
        image: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${c.id}_${sk.num}.jpg`,
      })),
      tips: c.allytips || [],
      enemytips: c.enemytips || [],
    }
  }

  async getAllItems() {
    await this.ensureVersion()
    const base = getDDragonBase()
    try {
      const data = await ddClient.get(`${base}/data/en_US/item.json`)
      const list = Object.values(data.data)
        .filter((item) => {
          if (!item.name || !item.gold) return false
          const isBoot = item.tags && item.tags.includes('Boots')
          if (isBoot) return true
          return item.gold.purchasable && item.gold.total >= 1000
        })
        .map((item) => item.name)
      return [...new Set(list)].sort()
    } catch (e) {
      console.warn('Failed to fetch live items, using offline items fallback', e)
      return null
    }
  }

  getVersion() {
    return getDDragonVersion()
  }
}

export default new ChampionService()
