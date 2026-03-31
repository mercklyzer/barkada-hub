import type { Vote } from "@/types/impostor";

export function tallyVotes(votes: Vote[]): Record<string, number> {
  const tallies: Record<string, number> = {};
  for (const vote of votes) {
    tallies[vote.suspectId] = (tallies[vote.suspectId] ?? 0) + 1;
  }
  return tallies;
}

/** Returns the player ID with the most votes, or '' if there is a tie. */
export function getTopVoteId(tallies: Record<string, number>): string {
  let maxVotes = 0;
  let topId = "";
  let hasTie = false;
  for (const [pid, count] of Object.entries(tallies)) {
    if (count > maxVotes) {
      maxVotes = count;
      topId = pid;
      hasTie = false;
    } else if (count === maxVotes) {
      hasTie = true;
    }
  }
  return hasTie ? "" : topId;
}
