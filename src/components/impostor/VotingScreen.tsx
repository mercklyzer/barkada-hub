"use client";

import { useState } from "react";
import type { Player, Vote } from "@/types/impostor";

interface Props {
  players: Player[];
  currentPlayerIndex: number;
  onVote: (vote: Vote) => void;
}

type VotingPhase = "queue" | "vote";

export function VotingScreen({ players, currentPlayerIndex, onVote }: Props) {
  const [phase, setPhase] = useState<VotingPhase>("queue");
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(
    null,
  );

  const currentVoter = players[currentPlayerIndex];

  function handleReady() {
    setPhase("vote");
    setSelectedSuspectId(null);
  }

  function handleSubmitVote() {
    if (!selectedSuspectId || !currentVoter) return;
    const vote: Vote = {
      voterId: currentVoter.id,
      suspectId: selectedSuspectId,
    };
    setPhase("queue");
    setSelectedSuspectId(null);
    onVote(vote);
  }

  const otherPlayers = players.filter((p) => p.id !== currentVoter?.id);

  if (phase === "queue") {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-3">
            <p className="text-slate-400 text-base">I-pass ang telepono kay</p>
            <h1 className="text-4xl font-black tracking-tight text-white">
              {currentVoter?.name ?? "..."}
            </h1>
          </div>

          <div className="bg-slate-800 rounded-2xl px-6 py-4">
            <p className="text-yellow-400 text-sm font-bold">
              Huwag makitaan ng iba ang iyong boto!
            </p>
          </div>

          <button
            onClick={handleReady}
            className="
              w-full py-6 rounded-2xl font-black text-2xl tracking-widest
              bg-red-600 hover:bg-red-500 active:bg-red-700
              transition-all min-h-[72px]
            "
          >
            HANDA NA AKO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col px-4 py-6">
      <div className="max-w-md mx-auto w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-black">Sino ang Impostor?</h2>
          <p className="text-slate-400 text-sm mt-1">
            Bumoto ka, {currentVoter?.name}
          </p>
        </div>

        <div className="space-y-2">
          {otherPlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => setSelectedSuspectId(player.id)}
              className={`
                w-full flex items-center gap-4 px-5 py-4
                rounded-2xl font-bold text-left min-h-[64px]
                transition-all border-2
                ${
                  selectedSuspectId === player.id
                    ? "bg-red-900 border-red-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                }
              `}
            >
              <span
                className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${
                    selectedSuspectId === player.id
                      ? "border-red-400 bg-red-500"
                      : "border-slate-500"
                  }
                `}
              >
                {selectedSuspectId === player.id && (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </span>
              <span className="text-lg">{player.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmitVote}
          disabled={!selectedSuspectId}
          className="
            w-full py-5 rounded-2xl font-black text-2xl tracking-widest
            bg-red-600 hover:bg-red-500 active:bg-red-700
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all min-h-[72px]
          "
        >
          IBOTO
        </button>
      </div>
    </div>
  );
}
