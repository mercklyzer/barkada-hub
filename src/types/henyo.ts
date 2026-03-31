import type { Language, Difficulty } from "@/types/shared";

export type { Language, Difficulty };

export type GameState =
  | "setup"
  | "countdown"
  | "playing"
  | "result"
  | "game_over";
export type WordResult = "correct" | "passed" | "timeout";

export type HenyoCategory =
  | "tao"
  | "bagay"
  | "lugar"
  | "hayop"
  | "pagkain"
  | "random";

export interface HenyoWord {
  id: string;
  word: string;
  category: HenyoCategory;
  difficulty: Difficulty;
  hint?: string;
}

export interface GameSettings {
  category: HenyoCategory;
  timerSeconds: number;
  wordCount: number;
}

export interface WordAttempt {
  word: HenyoWord;
  result: WordResult;
  timeUsed: number;
}

export interface GameSession {
  settings: GameSettings;
  wordQueue: HenyoWord[];
  currentIndex: number;
  attempts: WordAttempt[];
  passesUsed: number;
  score: number;
}

export interface CategoryInfo {
  key: HenyoCategory;
  label: string;
  englishLabel: string;
  count: number;
}
