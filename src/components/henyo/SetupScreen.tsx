"use client";

import { useState } from "react";
import type { GameSettings, HenyoCategory } from "@/types/henyo";

interface Props {
  onStart: (settings: GameSettings) => void;
  isLoading: boolean;
  error: string | null;
}

const CATEGORIES: {
  key: HenyoCategory;
  label: string;
  englishLabel: string;
  emoji: string;
}[] = [
  { key: "random", label: "Random", englishLabel: "Random", emoji: "🎲" },
  { key: "pagkain", label: "Pagkain", englishLabel: "Food", emoji: "🍛" },
  { key: "tao", label: "Tao", englishLabel: "Person", emoji: "👤" },
  { key: "hayop", label: "Hayop", englishLabel: "Animal", emoji: "🐾" },
  { key: "bagay", label: "Bagay", englishLabel: "Object", emoji: "📦" },
  { key: "lugar", label: "Lugar", englishLabel: "Place", emoji: "📍" },
];

const TIMER_OPTIONS = [30, 60, 90, 120];
const WORD_COUNT_OPTIONS = [3, 5, 10];

export function SetupScreen({ onStart, isLoading, error }: Props) {
  const [category, setCategory] = useState<HenyoCategory>("random");
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [wordCount, setWordCount] = useState(5);

  function handleStart() {
    onStart({ category, timerSeconds, wordCount });
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 py-6 overflow-y-auto">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight">PINOY HENYO</h1>
          <p className="text-slate-400 text-sm mt-1">
            Piliin ang kategorya at simulan ang laro
          </p>
        </div>

        {/* Category selector */}
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
                  flex flex-col items-center justify-center py-4 rounded-xl font-bold text-sm
                  min-h-18 transition-all
                  ${
                    category === cat.key
                      ? "bg-blue-600 text-white ring-2 ring-blue-400"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }
                `}
              >
                <span className="text-2xl mb-1">{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Timer duration */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Gaano Katagal?
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {TIMER_OPTIONS.map((sec) => (
              <button
                key={sec}
                onClick={() => setTimerSeconds(sec)}
                className={`
                  py-4 rounded-xl font-bold text-lg min-h-14 transition-all
                  ${
                    timerSeconds === sec
                      ? "bg-blue-600 text-white ring-2 ring-blue-400"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }
                `}
              >
                {sec}s
              </button>
            ))}
          </div>
        </section>

        {/* Word count */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Ilang Salita?
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {WORD_COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setWordCount(n)}
                className={`
                  py-4 rounded-xl font-bold text-2xl min-h-14 transition-all
                  ${
                    wordCount === n
                      ? "bg-blue-600 text-white ring-2 ring-blue-400"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }
                `}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <p className="text-red-400 text-sm text-center bg-red-950 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          onClick={handleStart}
          disabled={isLoading}
          className="w-full py-5 rounded-2xl font-black text-2xl tracking-widest bg-green-600 hover:bg-green-500 active:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-16"
        >
          {isLoading ? "LOADING..." : "MAGLARO"}
        </button>
      </div>
    </div>
  );
}
