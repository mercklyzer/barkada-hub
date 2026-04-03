"use client";

import { useState } from "react";
import type {
  SeerPeekResult,
  WerewolfPlayer,
  WerewolfRole,
} from "@/types/werewolf";

interface Props {
  role: WerewolfRole;
  alivePlayers: WerewolfPlayer[];
  myPlayerId: string;
  hasEyesClosed: boolean;
  hasSubmittedNightAction: boolean;
  seerPeekResult: SeerPeekResult | null;
  roundNumber: number;
  onCloseEyes: () => void;
  onSubmitAction: (targetPlayerId: string) => void;
}

const ROLE_LABEL: Record<WerewolfRole, string> = {
  werewolf: "Werewolves",
  seer: "Seer",
  doctor: "Doctor",
  villager: "Villager",
};

const ROLE_INSTRUCTION: Record<WerewolfRole, string> = {
  werewolf: "Choose a player to kill tonight.",
  seer: "Choose a player to reveal their true role.",
  doctor: "Choose a player to protect from death.",
  villager: "Sleep. Wait for morning.",
};

export const NightScreen = ({
  role,
  alivePlayers,
  myPlayerId,
  hasEyesClosed,
  hasSubmittedNightAction,
  seerPeekResult,
  roundNumber,
  onCloseEyes,
  onSubmitAction,
}: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const targets = alivePlayers.filter((p) => {
    if (role === "werewolf")
      return p.player_id !== myPlayerId && p.role !== "werewolf";
    if (role === "seer") return p.player_id !== myPlayerId;
    // doctor can protect self
    return true;
  });

  const ROLE_COLOR: Record<WerewolfRole, string> = {
    werewolf: "text-red-400",
    seer: "text-purple-400",
    doctor: "text-teal-400",
    villager: "text-slate-300",
  };

  if (!hasEyesClosed) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-8">
          <div className="space-y-3">
            <div className="text-5xl">🌙</div>
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Night — Round {roundNumber}
            </p>
            <h2 className="text-2xl font-black text-slate-200">
              Close your eyes
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Everyone must tap this button so no one knows who has a special
              role.
            </p>
          </div>
          <button
            onClick={onCloseEyes}
            className="w-full py-5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-2xl font-black text-xl transition-colors min-h-16"
          >
            😴 I'm sleeping
          </button>
        </div>
      </div>
    );
  }

  if (role === "villager" || hasSubmittedNightAction) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="text-6xl animate-pulse">💤</div>
          {role === "seer" && seerPeekResult ? (
            <div className="space-y-3 bg-purple-950 border border-purple-700 rounded-2xl p-6">
              <p className="text-xs uppercase tracking-widest text-purple-400">
                Peek Result
              </p>
              <p className="text-2xl font-black">{seerPeekResult.targetName}</p>
              <p
                className={`text-4xl font-black ${
                  seerPeekResult.targetRole === "werewolf"
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {seerPeekResult.targetRole === "werewolf"
                  ? "🐺 WEREWOLF"
                  : "✅ Not a Wolf"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-slate-400 font-bold text-lg">
                {role === "villager"
                  ? "Sleep. Wait for morning."
                  : "Submitted. Waiting..."}
              </p>
              {role !== "villager" && (
                <p className={`text-sm ${ROLE_COLOR[role]} font-bold`}>
                  {ROLE_LABEL[role]}
                </p>
              )}
            </div>
          )}
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-slate-600 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active role: show target selector
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col px-4 py-8">
      <div className="text-center space-y-2 mb-6">
        <p className={`text-xs uppercase tracking-widest ${ROLE_COLOR[role]}`}>
          {ROLE_LABEL[role]}
        </p>
        <p className="text-slate-300 text-sm">{ROLE_INSTRUCTION[role]}</p>
      </div>

      <div className="flex-1 space-y-3 mb-6">
        {targets.map((p) => (
          <button
            key={p.player_id}
            onClick={() => setSelectedId(p.player_id)}
            className={`w-full px-4 py-4 rounded-xl font-bold text-left transition-colors ${
              selectedId === p.player_id
                ? "bg-slate-600 border-2 border-slate-300"
                : "bg-slate-800 border-2 border-transparent"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <button
        onClick={() => selectedId && onSubmitAction(selectedId)}
        disabled={!selectedId}
        className="w-full py-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl font-black text-lg transition-colors min-h-14"
      >
        Confirm
      </button>
    </div>
  );
};
