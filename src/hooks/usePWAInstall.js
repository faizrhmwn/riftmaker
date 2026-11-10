import { useState, useEffect } from 'react'

let globalDeferredPrompt = null

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    globalDeferredPrompt = e
    window.__pwa_deferred_prompt = e
    window.dispatchEvent(new CustomEvent('pwa_prompt_ready'))
  })
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(() => {
    if (typeof window === 'undefined') return null
    return window.__pwa_deferred_prompt || globalDeferredPrompt
  })

  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    )
  })

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      globalDeferredPrompt = e
      window.__pwa_deferred_prompt = e
      setDeferredPrompt(e)
    }

    const handlePromptReady = () => {
      setDeferredPrompt(window.__pwa_deferred_prompt || globalDeferredPrompt)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      globalDeferredPrompt = null
      window.__pwa_deferred_prompt = null
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('pwa_prompt_ready', handlePromptReady)
    window.addEventListener('appinstalled', handleAppInstalled)

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleDisplayChange = (evt) => {
      if (evt.matches) setIsInstalled(true)
    }
    mediaQuery.addEventListener('change', handleDisplayChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('pwa_prompt_ready', handlePromptReady)
      window.removeEventListener('appinstalled', handleAppInstalled)
      mediaQuery.removeEventListener('change', handleDisplayChange)
    }
  }, [])

  const promptInstall = async () => {
    const promptEvent = deferredPrompt || window.__pwa_deferred_prompt || globalDeferredPrompt
    if (!promptEvent) {
      return { triggered: false, reason: 'no-prompt' }
    }
    try {
      await promptEvent.prompt()
      const choice = await promptEvent.userChoice
      if (choice.outcome === 'accepted') {
        setIsInstalled(true)
        globalDeferredPrompt = null
        window.__pwa_deferred_prompt = null
        setDeferredPrompt(null)
      }
      return { triggered: true, outcome: choice.outcome }
    } catch (err) {
      console.warn('Install prompt error:', err)
      return { triggered: false, error: err.message }
    }
  }

  return {
    canInstall: Boolean(deferredPrompt || (typeof window !== 'undefined' && window.__pwa_deferred_prompt)),
    isInstalled,
    promptInstall,
  }
}
