'use client'

import { useState } from 'react'
import type { GameSettings } from '@/types/impostor'
import type { Language } from '@/types/shared'

interface Props {
  onStart: (settings: GameSettings) => Promise<void>
  isLoading: boolean
  error: string | null
  initialPlayers?: string[]
}

const CATEGORIES = [
  { key: 'random',   label: 'Random',    englishLabel: 'Random'        },
  { key: 'pagkain',  label: 'Pagkain',   englishLabel: 'Food'          },
  { key: 'hayop',    label: 'Hayop',     englishLabel: 'Animal'        },
  { key: 'lugar',    label: 'Lugar',     englishLabel: 'Place'         },
  { key: 'tao',      label: 'Tao',       englishLabel: 'Person'        },
  { key: 'bagay',    label: 'Bagay',     englishLabel: 'Object'        },
  { key: 'palaro',   label: 'Palaro',    englishLabel: 'Sport/Game'    },
  { key: 'pelikula', label: 'Pelikula',  englishLabel: 'Movie/Show'    },
  { key: 'sports',   label: 'Sports',    englishLabel: 'Sports'        },
]

const CLUE_ROUND_OPTIONS = [2, 3, 5]

export function SetupScreen({ onStart, isLoading, error, initialPlayers }: Props) {
  const [playerNames, setPlayerNames] = useState<string[]>(
    initialPlayers && initialPlayers.length >= 3
      ? initialPlayers
      : ['', '', '', '']
  )
  const [category, setCategory] = useState('random')
  const [clueRounds, setClueRounds] = useState(3)
  const [language, setLanguage] = useState<Language>('filipino')
  const [validationError, setValidationError] = useState<string | null>(null)

  function updatePlayer(index: number, value: string) {
    setPlayerNames((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function addPlayer() {
    if (playerNames.length < 8) {
      setPlayerNames((prev) => [...prev, ''])
    }
  }

  function removePlayer(index: number) {
    if (playerNames.length > 3) {
      setPlayerNames((prev) => prev.filter((_, i) => i !== index))
    }
  }

  function handleStart() {
    const filled = playerNames.map((n) => n.trim()).filter(Boolean)
    if (filled.length < 3) {
      setValidationError('Kailangan ng hindi bababa sa 3 manlalaro.')
      return
    }
    setValidationError(null)
    onStart({ players: filled, category, clueRounds, language })
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 py-6 overflow-y-auto">
      <div className="max-w-md mx-auto space-y-6 pb-10">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight">SINO ANG IMPOSTOR?</h1>
          <p className="text-slate-400 text-sm mt-1">I-set up ang laro at magsimula</p>
        </div>

        {/* Player Names */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Mga Manlalaro (3–8)
          </h2>
          <div className="space-y-2">
            {playerNames.map((name, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updatePlayer(i, e.target.value)}
                  placeholder={`Manlalaro ${i + 1}`}
                  maxLength={20}
                  className="
                    flex-1 bg-slate-800 text-white placeholder-slate-500
                    rounded-xl px-4 py-3 min-h-[56px] text-base
                    border border-slate-700 focus:border-blue-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                  "
                />
                {playerNames.length > 3 && (
                  <button
                    onClick={() => removePlayer(i)}
                    aria-label="Tanggalin"
                    className="
                      w-14 min-h-[56px] rounded-xl bg-slate-800
                      text-slate-400 hover:bg-red-900 hover:text-red-300
                      font-bold text-xl transition-all border border-slate-700
                    "
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          {playerNames.length < 8 && (
            <button
              onClick={addPlayer}
              className="
                mt-2 w-full py-3 rounded-xl font-bold text-sm
                bg-slate-800 text-slate-400 hover:bg-slate-700
                border border-dashed border-slate-600 min-h-[56px]
                transition-all
              "
            >
              + Dagdag na Manlalaro
            </button>
          )}
        </section>

        {/* Category */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Kategorya
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`
                  flex flex-col items-center justify-center py-4 rounded-xl
                  font-bold text-sm min-h-[64px] transition-all
                  ${
                    category === cat.key
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }
                `}
              >
                <span>{cat.label}</span>
                <span className="text-xs font-normal text-slate-400">{cat.englishLabel}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Clue Rounds */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Ilang Rounds ng Clue?
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {CLUE_ROUND_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setClueRounds(n)}
                className={`
                  py-4 rounded-xl font-bold text-2xl min-h-[64px] transition-all
                  ${
                    clueRounds === n
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }
                `}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        {/* Language */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Wika
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {(['filipino', 'english', 'mixed'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`
                  py-4 rounded-xl font-bold text-sm capitalize min-h-[56px] transition-all
                  ${
                    language === lang
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }
                `}
              >
                {lang === 'filipino' ? 'Filipino' : lang === 'english' ? 'English' : 'Mixed'}
              </button>
            ))}
          </div>
        </section>

        {(error || validationError) && (
          <p className="text-red-400 text-sm text-center bg-red-950 rounded-xl px-4 py-3">
            {validationError ?? error}
          </p>
        )}

        <button
          onClick={handleStart}
          disabled={isLoading}
          className="
            w-full py-5 rounded-2xl font-black text-2xl tracking-widest
            bg-green-600 hover:bg-green-500 active:bg-green-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all min-h-[72px]
          "
        >
          {isLoading ? 'LOADING...' : 'SIMULAN'}
        </button>
      </div>
    </div>
  )
}
