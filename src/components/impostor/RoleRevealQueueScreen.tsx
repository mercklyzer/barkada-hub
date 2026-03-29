'use client'

import type { Player } from '@/types/impostor'

interface Props {
  player: Player
  onReady: () => void
}

export function RoleRevealQueueScreen({ player, onReady }: Props) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-3">
          <p className="text-slate-400 text-base">I-pass ang telepono kay</p>
          <h1 className="text-4xl font-black tracking-tight text-white">{player.name}</h1>
        </div>

        <div className="bg-slate-800 rounded-2xl px-6 py-4">
          <p className="text-yellow-400 text-sm font-bold">
            Huwag makitaan ng iba ang screen mo!
          </p>
        </div>

        <button
          onClick={onReady}
          className="
            w-full py-6 rounded-2xl font-black text-2xl tracking-widest
            bg-blue-600 hover:bg-blue-500 active:bg-blue-700
            transition-all min-h-[72px]
          "
        >
          HANDA NA AKO
        </button>
      </div>
    </div>
  )
}
