import { supabase } from '../lib/supabase'

const DEFAULT_PROFILE = {
  summoner: 'Ziaf Fila',
  rank: 'Master',
}

export async function getProfile(user) {
  // Try to get from supabase profiles table
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const googleName = user.user_metadata?.full_name || user.email || 'Summoner'
  const googleAvatar = user.user_metadata?.avatar_url || null

  return {
    id: user.id,
    name: googleName,
    email: user.email,
    avatar: googleAvatar,
    summoner: data?.summoner_name || DEFAULT_PROFILE.summoner,
    rank: data?.rank || DEFAULT_PROFILE.rank,
  }
}

export async function updateProfile(userId, updates) {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      summoner_name: updates.summoner,
      rank: updates.rank,
      updated_at: new Date().toISOString(),
    })
  if (error) throw error
}
