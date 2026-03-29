'use client'

import type { GameSession } from '@/types/henyo'

interface Props {
  session: GameSession
  onPlayAgain: () => void
  onChangeCategory: () => void
}

export function GameOverScreen({ session, onPlayAgain, onChangeCategory }: Props) {
  const { score, settings, attempts } = session
  const total = settings.wordCount

  // Stats
  const correctAttempts = attempts.filter((a) => a.result === 'correct')
  const avgTime =
    correctAttempts.length > 0
      ? correctAttempts.reduce((sum, a) => sum + a.timeUsed, 0) / correctAttempts.length
      : 0

  const fastestAttempt = correctAttempts.length > 0
    ? correctAttempts.reduce((fastest, a) => (a.timeUsed < fastest.timeUsed ? a : fastest))
    : null

  function formatSecs(s: number) {
    return `${Math.round(s)}s`
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center px-6 py-8">
      <div className="max-w-sm w-full space-y-6">
        {/* Score */}
        <div className="text-center">
          <p className="text-slate-400 text-sm uppercase tracking-widest mb-2">Tapos na!</p>
          <p className="font-black text-8xl text-white">
            {score}<span className="text-slate-500 text-5xl">/{total}</span>
          </p>
          <p className="text-slate-300 mt-2">
            {score === total
              ? 'Perpekto! Henyo ka talaga!'
              : score === 0
              ? 'Subukan ulit!'
              : `Nahulaan mo ang ${score} sa ${total} salita`}
          </p>
        </div>

        {/* Stat cards */}
        {correctAttempts.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Avg. Oras</p>
              <p className="font-black text-2xl">{formatSecs(avgTime)}</p>
            </div>
            {fastestAttempt && (
              <div className="bg-slate-800 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Pinakamabilis</p>
                <p className="font-black text-lg truncate">{fastestAttempt.word.word}</p>
                <p className="text-slate-400 text-sm">{formatSecs(fastestAttempt.timeUsed)}</p>
              </div>
            )}
          </div>
        )}

        {/* Word list recap */}
        <div className="bg-slate-800 rounded-xl p-4 space-y-2">
          {attempts.map((a, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm">{a.word.word}</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  a.result === 'correct'
                    ? 'bg-green-900 text-green-300'
                    : a.result === 'passed'
                    ? 'bg-amber-900 text-amber-300'
                    : 'bg-red-900 text-red-300'
                }`}
              >
                {a.result === 'correct' ? 'TAMA' : a.result === 'passed' ? 'PASS' : 'TIMEOUT'}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <button
          onClick={onPlayAgain}
          className="w-full py-5 rounded-2xl font-black text-2xl tracking-widest bg-green-600 hover:bg-green-500 active:bg-green-700 transition-all min-h-[64px]"
        >
          MAGLARO ULIT
        </button>
        <button
          onClick={onChangeCategory}
          className="w-full py-4 rounded-2xl font-bold text-lg bg-slate-700 hover:bg-slate-600 active:bg-slate-800 transition-all min-h-[56px]"
        >
          BAGUHIN ANG KATEGORYA
        </button>
      </div>
    </div>
  )
}
