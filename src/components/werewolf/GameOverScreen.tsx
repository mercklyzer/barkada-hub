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
  onPlayAgain: () => void;
  onLeave: () => void;
}

export const GameOverScreen = ({
  room,
  players,
  isHost,
  onPlayAgain,
  onLeave,
}: Props) => {
  const [rolesVisible, setRolesVisible] = useState(false);
  const winner = room.winner;
  const finalRoles = (room.settings?.finalRoles ?? {}) as Record<
    string,
    string
  >;

  useEffect(() => {
    const t = setTimeout(() => setRolesVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const sorted = [...players].sort((a, b) => a.seat_order - b.seat_order);

  return (
    <div
      className={`min-h-screen text-white flex flex-col px-4 py-8 transition-colors duration-1000 ${
        winner === "village" ? "bg-green-950" : "bg-red-950"
      }`}
    >
      <div className="text-center space-y-3 mb-10">
        <div className="text-7xl">{winner === "village" ? "🏡" : "🐺"}</div>
        <h1 className="text-4xl font-black">
          {winner === "village" ? "Village Wins!" : "Wolves Win!"}
        </h1>
        <p
          className={`text-sm font-bold uppercase tracking-widest ${
            winner === "village" ? "text-green-400" : "text-red-400"
          }`}
        >
          {winner === "village"
            ? "All werewolves have been eliminated"
            : "Wolves equal the villagers"}
        </p>
      </div>

      {rolesVisible && (
        <div className="space-y-3 mb-10">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">
            Roles
          </p>
          {sorted.map((p) => {
            const role = (finalRoles[p.player_id] ??
              p.role ??
              "villager") as WerewolfRole;
            const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.villager;
            return (
              <div
                key={p.player_id}
                className="flex items-center gap-3 bg-black/20 rounded-xl px-4 py-3"
              >
                <span className="text-xl">{config.icon}</span>
                <span className="font-bold flex-1">{p.name}</span>
                <span className={`text-sm font-bold ${config.color}`}>
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-3">
        {isHost && (
          <button
            onClick={onPlayAgain}
            className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-black text-lg transition-colors min-h-14"
          >
            Play Again
          </button>
        )}
        <button
          onClick={onLeave}
          className="w-full py-4 bg-black/20 hover:bg-black/30 rounded-xl font-bold text-slate-300 transition-colors min-h-14"
        >
          Leave
        </button>
      </div>
    </div>
  );
};
