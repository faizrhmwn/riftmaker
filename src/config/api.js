import axios from 'axios'

// League of Legends Data Dragon API
// Patch 16.22.1 has all 173 champions (including Yunara, Zaahen, etc.)
export const DEFAULT_VERSION = '16.22.1'

let cachedVersion = DEFAULT_VERSION

export const getDDragonVersion = () => cachedVersion
export const getDDragonBase = () => `https://ddragon.leagueoflegends.com/cdn/${cachedVersion}`

export async function initDDragonVersion() {
  try {
    const res = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json', { timeout: 4000 })
    if (Array.isArray(res.data) && res.data.length > 0) {
      cachedVersion = res.data[0]
      return cachedVersion
    }
  } catch (err) {
    console.warn('Using fallback DDragon version:', DEFAULT_VERSION, err.message)
  }
  return DEFAULT_VERSION
}

// Axios instance helper
export const ddClient = axios.create({
  timeout: 10000,
})

ddClient.interceptors.request.use((config) => {
  if (!config.baseURL) {
    config.baseURL = getDDragonBase()
  }
  return config
})

ddClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Network error'
    return Promise.reject(new Error(message))
  },
)
