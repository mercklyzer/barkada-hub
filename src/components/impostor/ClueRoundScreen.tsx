"use client";

import type { ImpostorWord, Player } from "@/types/impostor";

interface Props {
  players: Player[];
  currentRound: number;
  totalRounds: number;
  currentPlayerIndex: number;
  secretWord: ImpostorWord | null;
  onNext: () => void;
}

export const ClueRoundScreen = ({
  players,
  currentRound,
  totalRounds,
  currentPlayerIndex,
  secretWord,
  onNext,
}: Props) => {
  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col px-4 py-6">
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 space-y-6">
        {/* Round header */}
        <div className="text-center">
          <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">
            Round {currentRound} ng {totalRounds}
          </p>
          {secretWord && (
            <p className="text-slate-500 text-xs mt-1">
              Kategorya:{" "}
              <span className="text-slate-400">{secretWord.category}</span>
            </p>
          )}
        </div>

        {/* Current player highlight */}
        <div className="bg-blue-900 border border-blue-700 rounded-2xl px-6 py-5 text-center">
          <p className="text-blue-300 text-xs uppercase tracking-widest font-bold mb-1">
            Ikaw na
          </p>
          <h2 className="text-3xl font-black text-white">
            {currentPlayer?.name ?? "..."}
          </h2>
          <p className="text-blue-300 text-sm mt-2 font-medium">
            Ibigay ang iyong clue nang malakas!
          </p>
        </div>

        {/* Turn order list */}
        <div className="bg-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Pagkakasunod
            </p>
          </div>
          <ul>
            {players.map((player, i) => (
              <li
                key={player.id}
                className={`
                  flex items-center gap-3 px-4 py-3
                  ${i < players.length - 1 ? "border-b border-slate-700" : ""}
                  ${i === currentPlayerIndex ? "bg-blue-900/30" : ""}
                `}
              >
                <span
                  className={`
                    w-7 h-7 rounded-full flex items-center justify-center
                    text-xs font-bold flex-shrink-0
                    ${i === currentPlayerIndex ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400"}
                    ${i < currentPlayerIndex ? "bg-green-800 text-green-300" : ""}
                  `}
                >
                  {i < currentPlayerIndex ? "✓" : i + 1}
                </span>
                <span
                  className={`
                    font-bold text-base
                    ${i === currentPlayerIndex ? "text-white" : "text-slate-400"}
                    ${i < currentPlayerIndex ? "text-slate-500 line-through" : ""}
                  `}
                >
                  {player.name}
                </span>
                {i === currentPlayerIndex && (
                  <span className="ml-auto text-blue-400 text-xs font-bold">
                    IKAW NA
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1" />

        <button
          onClick={onNext}
          className="
            w-full py-5 rounded-2xl font-black text-xl tracking-widest
            bg-blue-600 hover:bg-blue-500 active:bg-blue-700
            transition-all min-h-[72px]
          "
        >
          SUSUNOD
        </button>
      </div>
    </div>
  );
};
