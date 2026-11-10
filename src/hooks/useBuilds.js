import { useState, useEffect, useCallback } from 'react'
import { getBuilds, createBuild, updateBuild, deleteBuild } from '../services/buildService'
import { useAuth } from '../contexts/AuthContext'

export function useBuilds() {
  const { user } = useAuth()
  const [builds, setBuilds] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getBuilds(user.id)
      setBuilds(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(async (data) => {
    if (!user) return null
    try {
      setLoading(true)
      const created = await createBuild(user.id, data)
      await refresh()
      return created
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [user, refresh])

  const update = useCallback(async (id, data) => {
    if (!user) return null
    try {
      setLoading(true)
      const updated = await updateBuild(user.id, id, data)
      await refresh()
      return updated
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [user, refresh])

  const remove = useCallback(async (id) => {
    if (!user) return false
    try {
      await deleteBuild(user.id, id)
      await refresh()
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }, [user, refresh])

  return { builds, loading, error, refresh, createBuild: create, updateBuild: update, deleteBuild: remove }
}
