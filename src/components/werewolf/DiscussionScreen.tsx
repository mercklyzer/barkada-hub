"use client";

import type { WerewolfPlayer } from "@/types/werewolf";

interface Props {
  players: WerewolfPlayer[];
  roundNumber: number;
  isHost: boolean;
  onStartVote: () => void;
}

export const DiscussionScreen = ({
  players,
  roundNumber,
  isHost,
  onStartVote,
}: Props) => {
  const alive = players.filter((p) => p.is_alive);
  const eliminated = players.filter((p) => !p.is_alive);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col px-4 py-8">
      <div className="text-center space-y-1 mb-8">
        <p className="text-xs uppercase tracking-widest text-slate-500">
          Discussion — Round {roundNumber}
        </p>
        <h2 className="text-2xl font-black">Who is the Werewolf?</h2>
        <p className="text-slate-400 text-sm">
          Discuss and find the wolf in your group.
        </p>
      </div>

      <div className="flex-1 space-y-6 mb-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Alive ({alive.length})
          </p>
          <div className="space-y-2">
            {alive.map((p) => (
              <div
                key={p.player_id}
                className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3"
              >
                <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                <span className="font-bold">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {eliminated.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Eliminated ({eliminated.length})
            </p>
            <div className="space-y-2">
              {eliminated.map((p) => (
                <div
                  key={p.player_id}
                  className="flex items-center gap-3 bg-slate-800/40 rounded-xl px-4 py-3 opacity-50"
                >
                  <div className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
                  <span className="font-bold line-through">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isHost ? (
        <button
          onClick={onStartVote}
          className="w-full py-4 bg-red-700 hover:bg-red-600 rounded-xl font-black text-lg transition-colors min-h-14"
        >
          Start Voting
        </button>
      ) : (
        <div className="w-full py-4 bg-slate-800 rounded-xl text-center text-slate-400 font-bold min-h-14 flex items-center justify-center">
          Waiting for host to start voting...
        </div>
      )}
    </div>
  );
};
