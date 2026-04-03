"use client";

import { useEffect, useState } from "react";
import type { ImpostorWord, Player } from "@/types/impostor";

interface Props {
  player: Player;
  secretWord: ImpostorWord | null;
  onRevealDone: () => void;
}

export const RoleRevealShowScreen = ({
  player,
  secretWord,
  onRevealDone,
}: Props) => {
  const [revealed, setRevealed] = useState(false);
  const [buttonUnlocked, setButtonUnlocked] = useState(false);

  const isImpostor = player.role === "impostor";

  useEffect(() => {
    setRevealed(false);
    setButtonUnlocked(false);
    const timer = setTimeout(() => setButtonUnlocked(true), 3000);
    return () => clearTimeout(timer);
  }, [player.id]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <p className="text-slate-400 text-sm uppercase tracking-widest">
            Role para kay
          </p>
          <h2 className="text-3xl font-black text-white">{player.name}</h2>
        </div>

        <button
          type="button"
          onClick={() => setRevealed(true)}
          disabled={revealed}
          className={`
            w-full rounded-2xl transition-all min-h-[200px] flex flex-col items-center justify-center px-6 py-8 space-y-4
            ${
              revealed
                ? isImpostor
                  ? "bg-rose-950 cursor-default"
                  : "bg-slate-800 cursor-default"
                : "bg-slate-700 hover:bg-slate-600 active:bg-slate-500 cursor-pointer"
            }
          `}
        >
          {!revealed ? (
            <div className="space-y-3">
              <p className="text-slate-200 font-black text-2xl tracking-wide">
                I-TAP PARA MAKITA
              </p>
              <p className="text-slate-400 text-sm">ang iyong role</p>
            </div>
          ) : isImpostor ? (
            <div className="space-y-3">
              <div className="inline-block bg-rose-900 rounded-xl px-3 py-1">
                <span className="text-xs font-bold uppercase tracking-widest text-rose-300">
                  {secretWord?.category ?? "Kategorya"}
                </span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-rose-100">
                IKAW ANG IMPOSTOR
              </h1>
              <p className="text-rose-300 text-sm">
                Pakinggan ang mga clue. Ibigay ang clue na parang alam mo ang
                salita.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="inline-block bg-slate-700 rounded-xl px-3 py-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                  {secretWord?.category ?? "Kategorya"}
                </span>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                MIYEMBRO NG TEAM
              </p>
              <h1 className="text-5xl font-black tracking-tight text-white">
                {secretWord?.word ?? "..."}
              </h1>
              <p className="text-slate-400 text-sm">
                Ibigay ang clue na nagpapakilala na alam mo ang salita, pero
                huwag masyadong halata!
              </p>
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={onRevealDone}
          disabled={!revealed || !buttonUnlocked}
          className={`
            w-full py-6 rounded-2xl font-black text-2xl tracking-widest
            transition-all min-h-[72px]
            ${
              revealed && buttonUnlocked
                ? "bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white"
                : "bg-slate-800 text-slate-600 cursor-not-allowed opacity-50"
            }
          `}
        >
          {!revealed
            ? "I-tap ang card"
            : buttonUnlocked
              ? "NAKITA NA"
              : "Hintayin..."}
        </button>
      </div>
    </div>
  );
};
