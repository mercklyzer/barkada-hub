'use client'

import { useState, useEffect } from 'react'
import type { Player, ImpostorWord } from '@/types/impostor'

interface Props {
  player: Player
  secretWord: ImpostorWord | null
  onRevealDone: () => void
}

export function RoleRevealShowScreen({ player, secretWord, onRevealDone }: Props) {
  const [buttonUnlocked, setButtonUnlocked] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false)

  const isImpostor = player.role === 'impostor'

  useEffect(() => {
    setButtonUnlocked(false)
    const timer = setTimeout(() => setButtonUnlocked(true), 3000)
    return () => clearTimeout(timer)
  }, [player.id])

  function handleDone() {
    if (!buttonUnlocked) return
    setIsFlashing(true)
    setTimeout(() => {
      setIsFlashing(false)
      onRevealDone()
    }, 500)
  }

  if (isFlashing) {
    return <div className="min-h-screen bg-black" />
  }

  if (isImpostor) {
    return (
      <div className="min-h-screen bg-red-900 text-white flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-4">
            <div className="inline-block bg-red-700 rounded-2xl px-4 py-2">
              <span className="text-sm font-bold uppercase tracking-widest text-red-200">
                {secretWord?.category ?? 'Kategorya'}
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white">
              IKAW ANG IMPOSTOR
            </h1>
            <p className="text-red-300 text-lg font-medium">Huwag mahuli!</p>
          </div>

          <div className="bg-red-800 rounded-2xl px-6 py-4">
            <p className="text-red-200 text-sm">
              Pakinggan ang mga clue ng ibang manlalaro. Ibigay ang isang clue na parang alam mo ang salita.
            </p>
          </div>

          <button
            onClick={handleDone}
            disabled={!buttonUnlocked}
            className={`
              w-full py-6 rounded-2xl font-black text-2xl tracking-widest
              transition-all min-h-[72px]
              ${
                buttonUnlocked
                  ? 'bg-white text-red-900 hover:bg-red-100 active:bg-red-200'
                  : 'bg-red-800 text-red-600 cursor-not-allowed opacity-50'
              }
            `}
          >
            {buttonUnlocked ? 'NAKITA NA' : 'Hintayin...'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-900 text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-4">
          <div className="inline-block bg-green-700 rounded-2xl px-4 py-2">
            <span className="text-sm font-bold uppercase tracking-widest text-green-200">
              {secretWord?.category ?? 'Kategorya'}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-green-300 text-sm font-bold uppercase tracking-widest">
              MIYEMBRO NG TEAM
            </p>
            <h1 className="text-6xl font-black tracking-tight text-white">
              {secretWord?.word ?? '...'}
            </h1>
          </div>
        </div>

        <div className="bg-green-800 rounded-2xl px-6 py-4">
          <p className="text-green-200 text-sm">
            Ibigay ang clue na nagpapakilala na alam mo ang salita, pero huwag masyadong halata!
          </p>
        </div>

        <button
          onClick={handleDone}
          disabled={!buttonUnlocked}
          className={`
            w-full py-6 rounded-2xl font-black text-2xl tracking-widest
            transition-all min-h-[72px]
            ${
              buttonUnlocked
                ? 'bg-white text-green-900 hover:bg-green-100 active:bg-green-200'
                : 'bg-green-800 text-green-600 cursor-not-allowed opacity-50'
            }
          `}
        >
          {buttonUnlocked ? 'NAKITA NA' : 'Hintayin...'}
        </button>
      </div>
    </div>
  )
}
