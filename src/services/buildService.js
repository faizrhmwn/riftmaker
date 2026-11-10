import { supabase } from '../lib/supabase'

const DEFAULT_BUILDS = [
  {
    champion: 'Jinx',
    title: 'Patch 16.22 Lethal Hypercarry',
    role: 'ADC',
    runes: 'Lethal Tempo - Triumph - Legend: Bloodline - Coup de Grace',
    items: ['Yun Tal Wildarrows','Infinity Edge',"Runaan's Hurricane","Lord Dominik's Regards",'Bloodthirster',"Berserker's Greaves"],
    notes: 'Prioritize Yun Tal Wildarrows first for bleed crits, scale directly into Infinity Edge for massive teamfight res...',
  },
  {
    champion: 'Ahri',
    title: 'Patch 16.22 Burst & CDR Roamer',
    role: 'MID',
    runes: 'Electrocute - Taste of Blood - Eyeball Collection - Ultimate Hunter',
    items: ['Malignance','Blackfire Torch',"Zhonya's Hourglass","Rabadon's Deathcap",'Cryptbloom',"Sorcerer's Shoes"],
    notes: 'Rush Malignance for ultimate cooldown, combo with Blackfire Torch burn tick during charm rotations.',
  },
  {
    champion: 'Aatrox',
    title: 'Patch 16.22 Bruiser Drain Tank',
    role: 'TOP',
    runes: 'Conqueror - Triumph - Legend: Haste - Last Stand',
    items: ['Sundered Sky','Profane Hydra','Black Cleaver',"Sterak's Gage","Death's Dance",'Plated Steelcaps'],
    notes: 'Sundered Sky initial crit healing synergizes with Profane Hydra active for rapid waveclear and burst...',
  },
  {
    champion: 'Zaahen',
    title: 'Patch 16.22 Lethality Ambush',
    role: 'JUNGLE',
    runes: 'Dark Harvest - Sudden Impact - Eyeball Collection - Relentless Hunter',
    items: ['Hubris','Opportunity','Voltaic Cyclosword',"Serylda's Grudge",'Edge of Night','Ionian Boots of Lucidity'],
    notes: 'Stack Hubris early on ganks, utilize Opportunity movement speed burst to engage over terrain.',
  },
]

// Seed default builds for a new user
async function seedDefaultBuilds(userId) {
  const { data: existing } = await supabase
    .from('builds')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  if (existing && existing.length > 0) return

  const rows = DEFAULT_BUILDS.map(b => ({
    user_id: userId,
    champion: b.champion,
    title: b.title,
    role: b.role,
    runes: b.runes,
    items: b.items,
    notes: b.notes,
  }))

  await supabase.from('builds').insert(rows)
}

export async function getBuilds(userId) {
  await seedDefaultBuilds(userId)
  const { data, error } = await supabase
    .from('builds')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createBuild(userId, build) {
  const { data, error } = await supabase
    .from('builds')
    .insert([{
      user_id: userId,
      champion: build.champion,
      title: build.title,
      role: build.role,
      runes: build.runes,
      items: build.items || [],
      notes: build.notes,
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateBuild(userId, id, updates) {
  const { data, error } = await supabase
    .from('builds')
    .update({
      champion: updates.champion,
      title: updates.title,
      role: updates.role,
      runes: updates.runes,
      items: updates.items || [],
      notes: updates.notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBuild(userId, id) {
  const { error } = await supabase
    .from('builds')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}
