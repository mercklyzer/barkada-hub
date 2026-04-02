import { shuffle } from "@/lib/shuffle";
import type { Player } from "@/types/impostor";

export const assignRoles = (
  playerNames: string[],
  numImpostors = 1,
): {
  players: Player[];
  impostorIds: string[];
} => {
  const players: Player[] = playerNames.map((name, i) => ({
    id: `player-${i}`,
    name,
    role: "team" as const,
    score: 0,
  }));

  const shuffled = shuffle([...players]);
  const impostorIds = shuffled.slice(0, numImpostors).map((p) => p.id);

  return {
    players: players.map((p) =>
      impostorIds.includes(p.id) ? { ...p, role: "impostor" as const } : p,
    ),
    impostorIds,
  };
};
