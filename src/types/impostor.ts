import type { Difficulty, Language } from "@/types/shared";

export type ImpostorGameState =
  | "setup"
  | "role_reveal_queue"
  | "role_reveal_show"
  | "clue_round"
  | "discussion"
  | "voting"
  | "impostor_guess"
  | "results"
  | "scoreboard";

export type PlayerRole = "team" | "impostor";

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  score: number;
}

export interface ImpostorWord {
  id: string;
  word: string;
  category: string;
  difficulty: Difficulty;
  language: Language;
}

export interface GameSettings {
  players: string[];
  category: string;
  clueRounds: number;
  language: Language;
  numImpostors: number;
}

// Alias for spec compatibility
export type ImpostorGameSettings = GameSettings;

export interface Vote {
  voterId: string;
  suspectId: string;
}

export interface ImpostorSession {
  settings: GameSettings;
  players: Player[];
  secretWord: ImpostorWord | null;
  impostorIds: string[];
  currentRound: number;
  currentPlayerIndex: number;
  votes: Vote[];
  impostorGuess: string | null;
  outcome: "impostor_wins" | "team_wins" | null;
  roundsPlayedInSession: number;
  sessionScores: Record<string, number>;
}

export interface CategoryInfo {
  key: string;
  label: string;
  englishLabel: string;
  count: number;
}
