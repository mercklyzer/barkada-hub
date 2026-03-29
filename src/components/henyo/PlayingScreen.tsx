'use client'

import type { HenyoWord } from '@/types/henyo'

interface Props {
  word: HenyoWord
  timeLeft: number
  timerSeconds: number
  passesLeft: number
  onCorrect: () => void
  onPass: () => void
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const CATEGORY_LABELS: Record<string, string> = {
  tao: 'TAO',
  bagay: 'BAGAY',
  lugar: 'LUGAR',
  hayop: 'HAYOP',
  pagkain: 'PAGKAIN',
  pelikula: 'PELIKULA',
  kanta: 'KANTA',
  palaro: 'PALARO',
  random: 'RANDOM',
}

export function PlayingScreen({ word, timeLeft, timerSeconds, passesLeft, onCorrect, onPass }: Props) {
  const isUrgent = timeLeft <= 10
  const pct = (timeLeft / timerSeconds) * 100

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col select-none">
      {/* Top bar: category + timer */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
          {CATEGORY_LABELS[word.category] ?? word.category.toUpperCase()}
        </span>
        <span
          className={`font-black tabular-nums text-4xl ${
            isUrgent ? 'text-red-400 animate-pulse' : 'text-white'
          }`}
        >
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-700">
        <div
          className={`h-full transition-all duration-1000 ${isUrgent ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Word */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="text-white font-black text-5xl text-center leading-tight tracking-wide uppercase">
          {word.word}
        </p>
        {word.hint && (
          <p className="text-slate-500 text-sm mt-3 text-center italic">
            {word.hint}
          </p>
        )}
      </div>

      {/* Three answer buttons */}
      <div className="px-4 pb-2 grid grid-cols-3 gap-3">
        <button
          className="bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-black text-2xl rounded-2xl py-5 min-h-[72px] transition-all"
        >
          OO
        </button>
        <button
          className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-2xl rounded-2xl py-5 min-h-[72px] transition-all"
        >
          HINDI
        </button>
        <button
          className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-black text-xl rounded-2xl py-5 min-h-[72px] transition-all"
        >
          PWEDE
        </button>
      </div>

      {/* Bottom: TAMA! + PASS */}
      <div className="px-4 pb-6 pt-2 grid grid-cols-2 gap-3">
        <button
          onClick={onCorrect}
          className="bg-green-700 hover:bg-green-600 active:bg-green-800 text-white font-black text-xl rounded-2xl py-4 min-h-[64px] transition-all border-2 border-green-500"
        >
          TAMA!
        </button>
        <button
          onClick={onPass}
          disabled={passesLeft <= 0}
          className="bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white font-bold text-lg rounded-2xl py-4 min-h-[64px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          PASS ({passesLeft})
        </button>
      </div>
    </div>
  )
}
