"use client";

import { useState } from "react";
import type { ImpostorWord } from "@/types/impostor";

interface Props {
  impostorName: string;
  secretWord: ImpostorWord | null;
  onSubmitGuess: (guess: string) => void;
}

export const ImpostorGuessScreen = ({
  impostorName,
  secretWord,
  onSubmitGuess,
}: Props) => {
  const [guess, setGuess] = useState("");

  const handleSubmit = () => {
    const trimmed = guess.trim();
    if (!trimmed) return;
    onSubmitGuess(trimmed);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="text-6xl">NAHULI!</div>
          <h1 className="text-3xl font-black tracking-tight">
            {impostorName}, ikaw ang napili ng grupo!
          </h1>
        </div>

        <div className="bg-slate-800 rounded-2xl px-6 py-5 space-y-2">
          <p className="text-slate-300 text-center font-medium">
            Huwag mag-alala — may pagkakataon ka pa!
          </p>
          <p className="text-white text-center font-bold text-lg">
            Hulaan ang secret word para manalo.
          </p>
        </div>

        {secretWord && (
          <div className="bg-blue-900/40 border border-blue-700/50 rounded-2xl px-5 py-4 text-center">
            <p className="text-blue-300 text-xs uppercase tracking-widest font-bold mb-1">
              Kategorya
            </p>
            <p className="text-white text-2xl font-black">
              {secretWord.category}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Isulat ang iyong hula..."
            autoFocus
            className="
              w-full bg-slate-800 text-white placeholder-slate-500
              rounded-xl px-4 py-4 min-h-[64px] text-xl text-center
              border border-slate-700 focus:border-blue-500
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!guess.trim()}
          className="
            w-full py-5 rounded-2xl font-black text-2xl tracking-widest
            bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-700
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all min-h-[72px]
          "
        >
          IPASOK
        </button>
      </div>
    </div>
  );
};
