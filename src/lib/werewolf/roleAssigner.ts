import { shuffle } from "@/lib/shuffle";
import type { WerewolfRole } from "@/types/werewolf";

const werewolfCountForPlayers = (total: number): number => {
  if (total <= 6) return 1;
  if (total <= 10) return 2;
  return 3;
};

export const assignWerewolfRoles = (
  playerIds: string[],
): Record<string, WerewolfRole> => {
  const total = playerIds.length;
  const wolfCount = werewolfCountForPlayers(total);

  const shuffled = shuffle([...playerIds]);

  const roles: Record<string, WerewolfRole> = {};

  for (let i = 0; i < shuffled.length; i++) {
    const id = shuffled[i];
    if (i < wolfCount) {
      roles[id] = "werewolf";
    } else if (i === wolfCount) {
      roles[id] = "seer";
    } else if (i === wolfCount + 1) {
      roles[id] = "doctor";
    } else {
      roles[id] = "villager";
    }
  }

  return roles;
};
