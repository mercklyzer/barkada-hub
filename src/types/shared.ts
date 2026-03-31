export type Language = "filipino" | "english" | "mixed";
export type Difficulty = "easy" | "medium" | "hard";

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
