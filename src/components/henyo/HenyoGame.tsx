'use client'

import { useHenyoGame } from '@/hooks/useHenyoGame'
import { SetupScreen } from './SetupScreen'
import { CountdownScreen } from './CountdownScreen'
import { PlayingScreen } from './PlayingScreen'
import { ResultScreen } from './ResultScreen'
import { GameOverScreen } from './GameOverScreen'

export function HenyoGame() {
  const game = useHenyoGame()

  const {
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
  } = game

  if (gameState === 'setup') {
    return (
      <SetupScreen
        onStart={startGame}
        isLoading={isLoading}
        error={error}
      />
    )
  }

  if (gameState === 'countdown') {
    return <CountdownScreen onCountdownEnd={beginPlaying} />
  }

  if (gameState === 'playing' && currentWord) {
    return (
      <PlayingScreen
        word={currentWord}
        timeLeft={timeLeft}
        timerSeconds={session?.settings.timerSeconds ?? 60}
        passesLeft={passesLeft}
        onCorrect={markCorrect}
        onPass={passWord}
      />
    )
  }

  if (gameState === 'result' && lastAttempt && session) {
    return (
      <ResultScreen
        attempt={lastAttempt}
        session={session}
        onNext={nextWord}
      />
    )
  }

  if (gameState === 'game_over' && session) {
    return (
      <GameOverScreen
        session={session}
        onPlayAgain={restartGame}
        onChangeCategory={resetToSetup}
      />
    )
  }

  // Fallback: reset to setup if somehow in bad state
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-slate-400">May problema. Subukan ulit.</p>
        <button
          onClick={resetToSetup}
          className="px-6 py-3 bg-blue-600 rounded-xl font-bold"
        >
          Bumalik sa Setup
        </button>
      </div>
    </div>
  )
}
