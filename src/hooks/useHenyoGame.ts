'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { GameState, GameSettings, GameSession, HenyoWord, WordAttempt } from '@/types/henyo'
import { fetchWords } from '@/lib/henyo/wordService'
import { shuffle } from '@/lib/shuffle'

const MAX_PASSES = 3

export interface UseHenyoGame {
  // State
  gameState: GameState
  currentWord: HenyoWord | null
  session: GameSession | null
  timeLeft: number
  passesLeft: number
  isLoading: boolean
  error: string | null
  lastAttempt: WordAttempt | null

  // Actions
  startGame: (settings: GameSettings) => Promise<void>
  beginPlaying: () => void
  markCorrect: () => void
  passWord: () => void
  nextWord: () => void
  restartGame: () => void
  resetToSetup: () => void
}

function captureEvent(name: string, props: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  import('posthog-js')
    .then(({ default: posthog }) => { posthog.capture(name, props) })
    .catch(() => { /* ignore */ })
}

export function useHenyoGame(): UseHenyoGame {
  const [gameState, setGameState] = useState<GameState>('setup')
  const [session, setSession] = useState<GameSession | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastAttempt, setLastAttempt] = useState<WordAttempt | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionRef = useRef<GameSession | null>(null)
  const timerSecondsRef = useRef(0)

  // Keep sessionRef in sync with state
  useEffect(() => {
    sessionRef.current = session
  }, [session])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleTimeout = useCallback(() => {
    stopTimer()
    const sess = sessionRef.current
    if (!sess) return
    const word = sess.wordQueue[sess.currentIndex]

    captureEvent('henyo_word_timeout', { word: word.word, category: word.category })

    const attempt: WordAttempt = { word, result: 'timeout', timeUsed: timerSecondsRef.current }
    setLastAttempt(attempt)
    setSession((prev) => prev ? { ...prev, attempts: [...prev.attempts, attempt] } : prev)
    setGameState('result')
  }, [stopTimer])

  const startTimer = useCallback((seconds: number) => {
    stopTimer()
    timerSecondsRef.current = seconds
    setTimeLeft(seconds)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          timerRef.current = null
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [stopTimer, handleTimeout])

  useEffect(() => { return () => stopTimer() }, [stopTimer])

  const startGame = useCallback(async (settings: GameSettings) => {
    setIsLoading(true)
    setError(null)
    try {
      const words = await fetchWords(settings.category, settings.language, settings.wordCount * 3)
      const shuffled = shuffle([...words]).slice(0, settings.wordCount)

      captureEvent('henyo_game_started', {
        category: settings.category,
        language: settings.language,
        timer_seconds: settings.timerSeconds,
        word_count: settings.wordCount,
      })

      const newSession: GameSession = {
        settings,
        wordQueue: shuffled,
        currentIndex: 0,
        attempts: [],
        passesUsed: 0,
        score: 0,
      }
      setSession(newSession)
      setLastAttempt(null)
      setGameState('countdown')
    } catch {
      setError('Hindi ma-load ang mga salita. Subukan ulit.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Called by CountdownScreen after the 3-2-1 animation ends
  const beginPlaying = useCallback(() => {
    const sess = sessionRef.current
    if (!sess) return
    startTimer(sess.settings.timerSeconds)
    setGameState('playing')
  }, [startTimer])

  const markCorrect = useCallback(() => {
    stopTimer()
    const sess = sessionRef.current
    if (!sess) return
    const word = sess.wordQueue[sess.currentIndex]
    const timeUsed = timerSecondsRef.current - timeLeft

    captureEvent('henyo_word_correct', {
      word: word.word,
      category: word.category,
      time_used: timeUsed,
      passes_used: sess.passesUsed,
    })

    const attempt: WordAttempt = { word, result: 'correct', timeUsed }
    setLastAttempt(attempt)
    setSession((prev) =>
      prev ? { ...prev, attempts: [...prev.attempts, attempt], score: prev.score + 1 } : prev
    )
    setGameState('result')
  }, [stopTimer, timeLeft])

  const passWord = useCallback(() => {
    const sess = sessionRef.current
    if (!sess || sess.passesUsed >= MAX_PASSES) return

    stopTimer()
    const word = sess.wordQueue[sess.currentIndex]
    captureEvent('henyo_word_passed', { word: word.word, category: word.category })

    const attempt: WordAttempt = {
      word,
      result: 'passed',
      timeUsed: timerSecondsRef.current - timeLeft,
    }
    setLastAttempt(attempt)
    setSession((prev) =>
      prev ? { ...prev, attempts: [...prev.attempts, attempt], passesUsed: prev.passesUsed + 1 } : prev
    )
    setGameState('result')
  }, [stopTimer, timeLeft])

  const nextWord = useCallback(() => {
    const sess = sessionRef.current
    if (!sess) return
    const nextIndex = sess.currentIndex + 1
    if (nextIndex >= sess.settings.wordCount) {
      captureEvent('henyo_game_completed', {
        score: sess.score,
        total_words: sess.settings.wordCount,
        category: sess.settings.category,
        language: sess.settings.language,
      })
      setGameState('game_over')
    } else {
      setSession((prev) => prev ? { ...prev, currentIndex: nextIndex } : prev)
      setLastAttempt(null)
      setGameState('countdown')
    }
  }, [])

  const restartGame = useCallback(() => {
    const sess = sessionRef.current
    if (!sess) return
    stopTimer()
    const reshuffled = shuffle([...sess.wordQueue])
    setSession({
      ...sess,
      wordQueue: reshuffled,
      currentIndex: 0,
      attempts: [],
      passesUsed: 0,
      score: 0,
    })
    setLastAttempt(null)
    setGameState('countdown')
  }, [stopTimer])

  const resetToSetup = useCallback(() => {
    stopTimer()
    setSession(null)
    setLastAttempt(null)
    setError(null)
    setGameState('setup')
  }, [stopTimer])

  const currentWord: HenyoWord | null = session
    ? (session.wordQueue[session.currentIndex] ?? null)
    : null
  const passesLeft = MAX_PASSES - (session?.passesUsed ?? 0)

  return {
    gameState,
    currentWord,
    session,
    timeLeft,
    passesLeft,
    isLoading,
    error,
    lastAttempt,
    startGame,
    beginPlaying,
    markCorrect,
    passWord,
    nextWord,
    restartGame,
    resetToSetup,
  }
}
