import { useState, useEffect, useCallback } from 'react'
import championService from '../services/championService'

export function useChampions() {
  const [champions, setChampions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchChampions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await championService.getAllChampions()
      setChampions(data)
    } catch (err) {
      setError(err.message || 'Failed to load champions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChampions()
  }, [fetchChampions])

  return { champions, loading, error, refetch: fetchChampions }
}

export function useChampionDetail(id) {
  const [champion, setChampion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    championService
      .getChampionDetail(id)
      .then(setChampion)
      .catch((err) => setError(err.message || 'Failed to load champion'))
      .finally(() => setLoading(false))
  }, [id])

  return { champion, loading, error }
}
