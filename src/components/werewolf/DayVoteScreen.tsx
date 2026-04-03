"use client";

import type { WerewolfPlayer } from "@/types/werewolf";

interface Props {
  players: WerewolfPlayer[];
  myPlayerId: string;
  hasVoted: boolean;
  roundNumber: number;
  onVote: (targetPlayerId: string) => void;
}

export const DayVoteScreen = ({
  players,
  myPlayerId,
  hasVoted,
  roundNumber,
  onVote,
}: Props) => {
  const myPlayer = players.find((p) => p.player_id === myPlayerId);
  const alive = players.filter((p) => p.is_alive && p.player_id !== myPlayerId);
  const canVote = myPlayer?.is_alive && !hasVoted;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col px-4 py-8">
      <div className="text-center space-y-1 mb-8">
        <p className="text-xs uppercase tracking-widest text-slate-500">
          Vote — Round {roundNumber}
        </p>
        <h2 className="text-2xl font-black">Choose the Wolf</h2>
        {hasVoted ? (
          <p className="text-green-400 text-sm font-bold">
            Vote submitted. Waiting for others...
          </p>
        ) : !canVote ? (
          <p className="text-slate-400 text-sm">
            You have no vote (you've been eliminated).
          </p>
        ) : (
          <p className="text-slate-400 text-sm">
            Choose one player to eliminate from the game.
          </p>
        )}
      </div>

      <div className="flex-1 space-y-3 mb-8">
        {alive.map((p) => (
          <button
            key={p.player_id}
            onClick={() => canVote && onVote(p.player_id)}
            disabled={!canVote}
            className={`w-full px-4 py-4 rounded-xl font-bold text-left transition-colors min-h-14 ${
              !canVote
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-slate-800 hover:bg-red-900/50 active:bg-red-800"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {hasVoted && (
        <div className="flex justify-center gap-1 pb-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-slate-600 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
