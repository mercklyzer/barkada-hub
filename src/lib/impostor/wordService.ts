import type { ImpostorWord } from '@/types/impostor'
import type { Language } from '@/types/shared'
import fallbackWords from './fallback-words.json'

const CACHE_KEY = 'impostor_words_cache'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

interface WordCache {
  words: ImpostorWord[]
  fetchedAt: number
  category: string
  language: string
}

export async function fetchImpostorWords(
  category: string,
  language: Language,
  limit = 20
): Promise<ImpostorWord[]> {
  const cached = getCache(category, language)
  if (cached) return cached

  try {
    const params = new URLSearchParams({ category, language, limit: String(limit) })
    const res = await fetch(`/api/impostor/words?${params}`)
    if (!res.ok) throw new Error('Failed to fetch impostor words')

    const data = await res.json()
    setCache(category, language, data.words)
    return data.words as ImpostorWord[]
  } catch {
    // Silent fallback — log to PostHog
    if (typeof window !== 'undefined') {
      try {
        const { default: posthog } = await import('posthog-js')
        posthog.capture('impostor_fallback_words_used', { category, language })
      } catch {
        // ignore analytics errors
      }
    }

    let filtered = (fallbackWords as ImpostorWord[]).filter((w) => {
      if (category !== 'random' && w.category !== category) return false
      if (language !== 'mixed' && w.language !== language) return false
      return true
    })

    if (filtered.length === 0) {
      filtered = fallbackWords as ImpostorWord[]
    }

    return filtered.sort(() => Math.random() - 0.5).slice(0, Math.max(10, limit))
  }
}

function getCache(category: string, language: string): ImpostorWord[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cache: WordCache = JSON.parse(raw)
    if (
      cache.category === category &&
      cache.language === language &&
      Date.now() - cache.fetchedAt < CACHE_TTL_MS
    ) {
      return cache.words
    }
  } catch {
    // ignore
  }
  return null
}

function setCache(category: string, language: string, words: ImpostorWord[]): void {
  try {
    const cache: WordCache = { words, fetchedAt: Date.now(), category, language }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // ignore storage errors
  }
}
