import type { NightAction, WerewolfPlayer } from "@/types/werewolf";

interface NightResult {
  killedPlayerId: string | null;
  savedByDoctor: boolean;
}

export const resolveNight = (actions: NightAction[]): NightResult => {
  const wolfKills = actions.filter((a) => a.action_type === "wolf_kill");
  const doctorProtect = actions.find((a) => a.action_type === "doctor_protect");

  if (wolfKills.length === 0) {
    return { killedPlayerId: null, savedByDoctor: false };
  }

  // Tally wolf votes; pick highest (first on tie)
  const tally: Record<string, number> = {};
  for (const action of wolfKills) {
    tally[action.target_id] = (tally[action.target_id] ?? 0) + 1;
  }
  const killTarget = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];

  const saved = doctorProtect?.target_id === killTarget;

  return {
    killedPlayerId: saved ? null : killTarget,
    savedByDoctor: saved,
  };
};

export const checkWinCondition = (
  players: WerewolfPlayer[],
): "village" | "werewolves" | null => {
  const alive = players.filter((p) => p.is_alive);
  const aliveWolves = alive.filter((p) => p.role === "werewolf");
  const aliveVillagers = alive.filter((p) => p.role !== "werewolf");

  if (aliveWolves.length === 0) return "village";
  if (aliveWolves.length >= aliveVillagers.length) return "werewolves";
  return null;
};
