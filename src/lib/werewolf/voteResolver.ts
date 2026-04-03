import type { DayVote } from "@/types/werewolf";

interface VoteResult {
  tallies: Record<string, number>;
  eliminatedId: string | null;
}

export const resolveVotes = (votes: DayVote[]): VoteResult => {
  const tallies: Record<string, number> = {};

  for (const vote of votes) {
    tallies[vote.target_id] = (tallies[vote.target_id] ?? 0) + 1;
  }

  const sorted = Object.entries(tallies).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return { tallies, eliminatedId: null };
  }

  // Tie → no elimination
  if (sorted.length >= 2 && sorted[0][1] === sorted[1][1]) {
    return { tallies, eliminatedId: null };
  }

  return { tallies, eliminatedId: sorted[0][0] };
};
