"use client";

import type { WerewolfPlayer, WerewolfRoom } from "@/types/werewolf";

interface Props {
  room: WerewolfRoom;
  players: WerewolfPlayer[];
  isHost: boolean;
  onContinue: () => void;
}

export const DayAnnouncementScreen = ({
  room,
  players,
  isHost,
  onContinue,
}: Props) => {
  const killedPlayer = room.eliminated_player_id
    ? players.find((p) => p.player_id === room.eliminated_player_id)
    : null;
  const noDeath = !killedPlayer;

  return (
    <div className="min-h-screen bg-amber-950 text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-8">
        <div className="space-y-2">
          <div className="text-6xl">🌅</div>
          <p className="text-xs uppercase tracking-widest text-amber-400">
            Morning — Round {room.round_number}
          </p>
        </div>

        {noDeath ? (
          <div className="space-y-4">
            <div className="text-5xl">✅</div>
            <h2 className="text-3xl font-black text-green-300">
              No One Died!
            </h2>
            <p className="text-amber-200 text-sm leading-relaxed">
              Congratulations! The doctor protected the wolves' target tonight.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-5xl">🪦</div>
            <h2 className="text-3xl font-black text-red-300">
              {killedPlayer?.name} is Dead
            </h2>
            <p className="text-amber-200 text-sm leading-relaxed">
              The wolves got{" "}
              <span className="font-bold">{killedPlayer?.name}</span> last
              night.
            </p>
          </div>
        )}

        {isHost ? (
          <button
            onClick={onContinue}
            className="w-full py-4 bg-amber-700 hover:bg-amber-600 rounded-xl font-black text-lg transition-colors min-h-14"
          >
            Continue to Discussion
          </button>
        ) : (
          <div className="w-full py-4 bg-amber-900/50 rounded-xl text-center text-amber-400 font-bold min-h-14 flex items-center justify-center">
            Waiting for host...
          </div>
        )}
      </div>
    </div>
  );
};
