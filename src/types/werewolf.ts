export type WerewolfGamePhase =
  | "lobby"
  | "role_reveal"
  | "night"
  | "night_resolving"
  | "day_announcement"
  | "discussion"
  | "day_vote"
  | "elimination"
  | "game_over";

export type WerewolfRole = "villager" | "werewolf" | "seer" | "doctor";

export interface RoomSettings {
  werewolfCount?: number;
  lastVoteTally?: Record<string, number>;
  lastEliminatedRole?: string;
  finalRoles?: Record<string, string>;
}

export interface WerewolfRoom {
  id: string;
  room_code: string;
  host_id: string;
  phase: WerewolfGamePhase;
  round_number: number;
  night_kill_target_id: string | null;
  night_saved: boolean;
  eliminated_player_id: string | null;
  winner: "village" | "werewolves" | null;
  settings: RoomSettings;
  created_at: string;
  updated_at: string;
}

export interface WerewolfPlayer {
  id: string;
  room_id: string;
  player_id: string;
  name: string;
  role: WerewolfRole | null;
  is_alive: boolean;
  is_host: boolean;
  seat_order: number;
  joined_at: string;
}

export interface NightAction {
  id: string;
  room_id: string;
  round_number: number;
  actor_id: string;
  action_type: "wolf_kill" | "seer_peek" | "doctor_protect";
  target_id: string;
  submitted_at: string;
}

export interface DayVote {
  id: string;
  room_id: string;
  round_number: number;
  voter_id: string;
  target_id: string;
  submitted_at: string;
}

export interface VoteTally {
  tallies: Record<string, number>;
  eliminatedId: string | null;
}

export interface SeerPeekResult {
  targetName: string;
  targetRole: WerewolfRole;
}

export interface MyRoleResponse {
  role: WerewolfRole;
  werewolfAllyNames?: string[];
  seerPeekHistory?: Array<{
    targetId: string;
    targetName: string;
    role: WerewolfRole;
  }>;
}
