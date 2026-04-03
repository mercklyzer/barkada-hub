"use client";

import { useEffect, useState } from "react";
import type {
  WerewolfPlayer,
  WerewolfRole,
  WerewolfRoom,
} from "@/types/werewolf";

const ROLE_CONFIG: Record<
  WerewolfRole,
  { icon: string; label: string; color: string }
> = {
  werewolf: { icon: "🐺", label: "Werewolf", color: "text-red-400" },
  seer: { icon: "👁", label: "Seer", color: "text-purple-400" },
  doctor: { icon: "🛡", label: "Doctor", color: "text-teal-400" },
  villager: { icon: "🧑", label: "Villager", color: "text-slate-300" },
};

interface Props {
  room: WerewolfRoom;
  players: WerewolfPlayer[];
  isHost: boolean;
  onContinue: () => void;
}

export const EliminationScreen = ({
  room,
  players,
  isHost,
  onContinue,
}: Props) => {
  const [revealed, setRevealed] = useState(false);
  const tallies = (room.settings?.lastVoteTally ?? {}) as Record<
    string,
    number
  >;
  const eliminated = room.eliminated_player_id
    ? players.find((p) => p.player_id === room.eliminated_player_id)
    : null;

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const roleConfig = eliminated?.role
    ? ROLE_CONFIG[eliminated.role as WerewolfRole]
    : null;

  const sortedTallies = Object.entries(tallies)
    .map(([pid, count]) => ({
      player: players.find((p) => p.player_id === pid),
      count,
    }))
    .filter((t) => t.player)
    .sort((a, b) => b.count - a.count);

  const maxVotes = sortedTallies[0]?.count ?? 1;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col px-4 py-8">
      <div className="text-center space-y-1 mb-8">
        <p className="text-xs uppercase tracking-widest text-slate-500">
          Vote Results
        </p>
      </div>

      {/* Vote tally bars */}
      {sortedTallies.length > 0 && (
        <div className="space-y-3 mb-8">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">
            Votes
          </p>
          {sortedTallies.map(({ player, count }) => (
            <div key={player!.player_id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-bold">{player!.name}</span>
                <span className="text-slate-400">{count}</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-700 rounded-full transition-all duration-700"
                  style={{ width: `${(count / maxVotes) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Role reveal */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {!eliminated ? (
          <div className="text-center space-y-3">
            <div className="text-5xl">⚖️</div>
            <h2 className="text-2xl font-black text-slate-300">Tie!</h2>
            <p className="text-slate-400 text-sm">
              No one was eliminated due to a tie.
            </p>
          </div>
        ) : !revealed ? (
          <div className="text-center space-y-4">
            <div className="text-5xl animate-pulse">⏳</div>
            <p className="text-2xl font-black text-slate-300">
              {eliminated.name}...
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-6xl">{roleConfig?.icon}</div>
            <p className="text-2xl font-black text-white">
              <span className="text-red-300">{eliminated.name}</span> is...
            </p>
            <p className={`text-4xl font-black ${roleConfig?.color}`}>
              {roleConfig?.label}!
            </p>
          </div>
        )}
      </div>

      {isHost && (
        <button
          onClick={onContinue}
          className="w-full mt-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-black text-lg transition-colors min-h-14"
        >
          Next Night →
        </button>
      )}
    </div>
  );
};
