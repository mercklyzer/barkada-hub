import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkWinCondition, resolveNight } from "@/lib/werewolf/nightResolver";
import type { NightAction, WerewolfPlayer } from "@/types/werewolf";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) => {
  const { code } = await params;
  const body = await request.json();
  const { playerId } = body as { playerId: string };

  const { data: room } = await supabaseAdmin
    .from("werewolf_rooms")
    .select("id, host_id, phase, round_number, settings")
    .eq("room_code", code.toUpperCase())
    .maybeSingle();

  if (!room) return Response.json({ error: "Room not found" }, { status: 404 });
  if (room.host_id !== playerId)
    return Response.json({ error: "Not host" }, { status: 403 });
  if (room.phase !== "night" && room.phase !== "night_resolving") {
    return Response.json({ error: "Not night phase" }, { status: 409 });
  }

  // Mark as resolving to prevent double-fire
  await supabaseAdmin
    .from("werewolf_rooms")
    .update({ phase: "night_resolving" })
    .eq("id", room.id);

  const { data: actions } = await supabaseAdmin
    .from("werewolf_night_actions")
    .select("*")
    .eq("room_id", room.id)
    .eq("round_number", room.round_number);

  const { data: players } = await supabaseAdmin
    .from("werewolf_players")
    .select("*")
    .eq("room_id", room.id);

  const { killedPlayerId, savedByDoctor } = resolveNight(
    (actions ?? []) as NightAction[],
  );

  let updatedPlayers = [...(players ?? [])] as WerewolfPlayer[];

  if (killedPlayerId) {
    await supabaseAdmin
      .from("werewolf_players")
      .update({ is_alive: false })
      .eq("room_id", room.id)
      .eq("player_id", killedPlayerId);

    updatedPlayers = updatedPlayers.map((p) =>
      p.player_id === killedPlayerId ? { ...p, is_alive: false } : p,
    );
  }

  const winner = checkWinCondition(updatedPlayers);

  const killedPlayer = killedPlayerId
    ? updatedPlayers.find((p) => p.player_id === killedPlayerId)
    : null;

  const newSettings = {
    ...(room.settings ?? {}),
    ...(winner
      ? {
          finalRoles: Object.fromEntries(
            updatedPlayers.map((p) => [p.player_id, p.role ?? "villager"]),
          ),
        }
      : {}),
  };

  await supabaseAdmin
    .from("werewolf_rooms")
    .update({
      phase: winner ? "game_over" : "day_announcement",
      night_kill_target_id: killedPlayerId ?? null,
      night_saved: savedByDoctor,
      eliminated_player_id: killedPlayerId ?? null,
      winner: winner ?? null,
      settings: newSettings,
    })
    .eq("id", room.id);

  return Response.json({
    success: true,
    killedPlayerId,
    savedByDoctor,
    winner,
    killedPlayerName: killedPlayer?.name ?? null,
  });
};
