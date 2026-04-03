"use client";

import type { WerewolfPlayer, WerewolfRoom } from "@/types/werewolf";

interface Props {
  room: WerewolfRoom;
  players: WerewolfPlayer[];
  myPlayerId: string;
  isHost: boolean;
  isLoading: boolean;
  error: string | null;
  onStart: () => void;
  onLeave: () => void;
}

export const LobbyScreen = ({
  room,
  players,
  myPlayerId,
  isHost,
  isLoading,
  error,
  onStart,
  onLeave,
}: Props) => {
  const sorted = [...players].sort((a, b) => a.seat_order - b.seat_order);
  const canStart = players.length >= 4;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onLeave}
          className="text-slate-400 text-sm hover:text-white transition-colors"
        >
          ← Leave
        </button>
        <span className="text-xs uppercase tracking-widest text-slate-500">
          Lobby
        </span>
      </div>

      <div className="text-center space-y-2 mb-8">
        <p className="text-xs uppercase tracking-widest text-slate-500">
          Room Code
        </p>
        <p className="text-5xl font-black tracking-[0.2em] text-white">
          {room.room_code}
        </p>
        <p className="text-slate-400 text-sm">
          Share the code with your friends
        </p>
      </div>

      <div className="flex-1 space-y-3 mb-8">
        <p className="text-xs uppercase tracking-widest text-slate-500">
          Players ({players.length})
        </p>
        {sorted.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <span className="font-bold flex-1">{p.name}</span>
            {p.player_id === myPlayerId && (
              <span className="text-xs text-slate-400">You</span>
            )}
            {p.is_host && (
              <span className="text-xs text-yellow-400 font-bold">HOST</span>
            )}
          </div>
        ))}
        {players.length < 4 && (
          <p className="text-slate-500 text-sm text-center pt-2">
            Need {4 - players.length} more players to start
          </p>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center mb-4">{error}</p>
      )}

      {isHost ? (
        <button
          onClick={onStart}
          disabled={!canStart || isLoading}
          className="w-full py-4 bg-red-700 hover:bg-red-600 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl font-black text-lg transition-colors min-h-14"
        >
          {isLoading ? "Starting..." : "Start Game"}
        </button>
      ) : (
        <div className="w-full py-4 bg-slate-800 rounded-xl text-center text-slate-400 font-bold min-h-14 flex items-center justify-center">
          Waiting for host...
        </div>
      )}
    </div>
  );
};
