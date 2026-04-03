"use client";

import { useState } from "react";
import type { MyRoleResponse, WerewolfRole } from "@/types/werewolf";

const ROLE_CONFIG: Record<
  WerewolfRole,
  { icon: string; label: string; color: string; bg: string; desc: string }
> = {
  werewolf: {
    icon: "🐺",
    label: "Werewolf",
    color: "text-red-400",
    bg: "bg-red-950",
    desc: "At night, choose one player to kill. Don't get caught!",
  },
  seer: {
    icon: "👁",
    label: "Seer",
    color: "text-purple-400",
    bg: "bg-purple-950",
    desc: "At night, you will see the true role of one player.",
  },
  doctor: {
    icon: "🛡",
    label: "Doctor",
    color: "text-teal-400",
    bg: "bg-teal-950",
    desc: "At night, you will protect one player from death.",
  },
  villager: {
    icon: "🧑",
    label: "Villager",
    color: "text-slate-300",
    bg: "bg-slate-800",
    desc: "No special power. Join the discussion and vote wisely!",
  },
};

interface Props {
  roleData: MyRoleResponse;
  onConfirm: () => void;
}

export const RoleRevealScreen = ({ roleData, onConfirm }: Props) => {
  const [flipped, setFlipped] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const config = ROLE_CONFIG[roleData.role];

  const handleFlip = () => {
    if (!flipped) setFlipped(true);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center px-4 animate-fade-in-up">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-1">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Your Role
          </p>
          <p className="text-slate-400 text-sm">
            Don't show your screen to others
          </p>
        </div>

        {/* Card with flip animation */}
        <div
          className="relative w-full aspect-[3/4] cursor-pointer"
          style={{ perspective: "1000px" }}
          onClick={handleFlip}
        >
          <div
            className="w-full h-full transition-transform duration-700"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front — hidden card */}
            <div
              className="absolute inset-0 bg-slate-800 border-2 border-slate-600 rounded-2xl flex flex-col items-center justify-center gap-4"
              style={{ backfaceVisibility: "hidden" }}
            >
              <span className="text-6xl">🂠</span>
              <p className="text-slate-400 font-bold text-lg">
                Tap to reveal
              </p>
            </div>
            {/* Back — role card */}
            <div
              className={`absolute inset-0 ${config.bg} border-2 border-opacity-40 rounded-2xl flex flex-col items-center justify-center gap-4 px-6`}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <span className="text-8xl">{config.icon}</span>
              <p className={`text-3xl font-black ${config.color}`}>
                {config.label}
              </p>
              <p className="text-slate-300 text-center text-sm leading-relaxed">
                {config.desc}
              </p>
              {roleData.role === "werewolf" &&
                roleData.werewolfAllyNames &&
                roleData.werewolfAllyNames.length > 0 && (
                  <div className="mt-2 bg-red-900/50 rounded-xl px-4 py-3 w-full text-center">
                    <p className="text-xs text-red-300 uppercase tracking-widest mb-1">
                      Your wolf ally
                    </p>
                    {roleData.werewolfAllyNames.map((n) => (
                      <p key={n} className="font-black text-red-200">
                        {n}
                      </p>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>

        {flipped && (
          confirmed ? (
            <div className="w-full py-4 bg-slate-800 border border-slate-600 rounded-xl text-center min-h-14 flex flex-col items-center justify-center gap-1 animate-fade-in-up">
              <p className="font-black text-slate-300">Ready!</p>
              <p className="text-xs text-slate-500">Waiting for other players...</p>
            </div>
          ) : (
            <button
              onClick={handleConfirm}
              className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-black text-lg transition-colors min-h-14 animate-fade-in-up"
            >
              I understand my role
            </button>
          )
        )}
      </div>
    </div>
  );
};
