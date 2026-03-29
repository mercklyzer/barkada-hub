'use client'

import { useState, useEffect } from 'react'

interface Props {
  onCountdownEnd: () => void
}

const STEPS = ['3', '2', '1', 'LARO!']

export function CountdownScreen({ onCountdownEnd }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (step >= STEPS.length) {
      onCountdownEnd()
      return
    }
    const timeout = setTimeout(() => {
      setStep((s) => s + 1)
    }, 800)
    return () => clearTimeout(timeout)
  }, [step, onCountdownEnd])

  const current = STEPS[step] ?? 'LARO!'
  const isGo = current === 'LARO!'

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
      <div
        key={step}
        className="flex flex-col items-center gap-6 animate-pulse"
      >
        <span
          className={`font-black leading-none select-none
            ${isGo ? 'text-green-400 text-7xl' : 'text-white text-9xl'}
          `}
        >
          {current}
        </span>
        <p className="text-slate-400 text-lg text-center max-w-xs">
          Ipatong ang telepono sa noo mo!
        </p>
      </div>
    </div>
  )
}
