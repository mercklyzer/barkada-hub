import { shuffle } from "@/lib/shuffle";
import type { Player } from "@/types/impostor";

export const assignRoles = (
  playerNames: string[],
): {
  players: Player[];
  impostorId: string;
} => {
  const players: Player[] = playerNames.map((name, i) => ({
    id: `player-${i}`,
    name,
    role: "team" as const,
    score: 0,
  }));

  const shuffled = shuffle([...players]);
  const impostor = shuffled[0];
  impostor.role = "impostor";

  return {
    players: players.map((p) =>
      p.id === impostor.id ? { ...p, role: "impostor" as const } : p,
    ),
    impostorId: impostor.id,
  };
};
