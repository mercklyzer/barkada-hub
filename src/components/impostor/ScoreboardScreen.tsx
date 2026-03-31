"use client";

import type { ImpostorSession } from "@/types/impostor";

interface Props {
  session: ImpostorSession;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export const ScoreboardScreen = ({
  session,
  onPlayAgain,
  onNewGame,
}: Props) => {
  const { players, sessionScores } = session;

  const sorted = [...players].sort(
    (a, b) => (sessionScores[b.id] ?? 0) - (sessionScores[a.id] ?? 0),
  );

  const topScore = sessionScores[sorted[0]?.id] ?? 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight">SCOREBOARD</h1>
          <p className="text-slate-400 text-sm mt-1">
            {session.roundsPlayedInSession} round
            {session.roundsPlayedInSession !== 1 ? "s" : ""} na nalaro
          </p>
        </div>

        <div className="bg-slate-800 rounded-2xl overflow-hidden">
          <ul>
            {sorted.map((player, i) => {
              const score = sessionScores[player.id] ?? 0;
              const isTop = score === topScore && topScore > 0;
              return (
                <li
                  key={player.id}
                  className={`
                    flex items-center gap-4 px-5 py-4
                    ${i < sorted.length - 1 ? "border-b border-slate-700" : ""}
                    ${isTop && i === 0 ? "bg-yellow-900/30" : ""}
                  `}
                >
                  <span
                    className={`
                      w-9 h-9 rounded-full flex items-center justify-center
                      font-black text-lg flex-shrink-0
                      ${i === 0 && topScore > 0 ? "bg-yellow-500 text-black" : "bg-slate-700 text-slate-300"}
                    `}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-black text-white text-xl">
                      {player.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`
                        font-black text-3xl
                        ${i === 0 && topScore > 0 ? "text-yellow-400" : "text-slate-300"}
                      `}
                    >
                      {score}
                    </span>
                    <span className="text-slate-500 text-xs ml-1">panalo</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="
              w-full py-5 rounded-2xl font-black text-xl tracking-widest
              bg-green-600 hover:bg-green-500 active:bg-green-700
              transition-all min-h-[72px]
            "
          >
            MAGLARO ULIT
          </button>
          <button
            onClick={onNewGame}
            className="
              w-full py-4 rounded-2xl font-black text-lg tracking-widest
              bg-slate-700 hover:bg-slate-600 active:bg-slate-800
              transition-all min-h-[60px]
            "
          >
            BAGONG LARO
          </button>
        </div>
      </div>
    </div>
  );
};
