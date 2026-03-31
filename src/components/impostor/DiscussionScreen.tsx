"use client";

import type { Player } from "@/types/impostor";

interface Props {
  players: Player[];
  onStartVoting: () => void;
}

export const DiscussionScreen = ({ players, onStartVoting }: Props) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black tracking-tight">PAGUUSAPAN!</h1>
          <p className="text-slate-300 text-lg">Sino ang parang Impostor?</p>
        </div>

        <div className="bg-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Mga Manlalaro
            </p>
          </div>
          <ul>
            {players.map((player, i) => (
              <li
                key={player.id}
                className={`
                  flex items-center gap-3 px-4 py-4
                  ${i < players.length - 1 ? "border-b border-slate-700" : ""}
                `}
              >
                <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                  {i + 1}
                </span>
                <span className="font-bold text-base text-white">
                  {player.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-yellow-900/40 border border-yellow-700/50 rounded-2xl px-5 py-4">
          <p className="text-yellow-300 text-sm font-medium text-center">
            Pag-usapan ang mga clue na ibinigay. Sino ang pinakamalabo? Sino ang
            hindi sigurado?
          </p>
        </div>

        <button
          onClick={onStartVoting}
          className="
            w-full py-5 rounded-2xl font-black text-2xl tracking-widest
            bg-red-600 hover:bg-red-500 active:bg-red-700
            transition-all min-h-[72px]
          "
        >
          BUMOTO NA
        </button>
      </div>
    </div>
  );
};
