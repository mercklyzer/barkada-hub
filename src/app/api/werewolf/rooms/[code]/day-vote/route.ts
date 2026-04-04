import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkWinCondition } from "@/lib/werewolf/nightResolver";
import { resolveVotes } from "@/lib/werewolf/voteResolver";
import type { DayVote, WerewolfPlayer } from "@/types/werewolf";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) => {
  const { code } = await params;
  const body = await request.json();
  const { playerId, targetId } = body as { playerId: string; targetId: string };

  if (!playerId || !targetId) {
    return Response.json(
      { error: "playerId and targetId required" },
      { status: 400 },
    );
  }

  const { data: room } = await supabaseAdmin
    .from("werewolf_rooms")
    .select("id, phase, round_number, settings")
    .eq("room_code", code.toUpperCase())
    .maybeSingle();

  if (!room) return Response.json({ error: "Room not found" }, { status: 404 });
  if (room.phase !== "day_vote")
    return Response.json({ error: "Not voting phase" }, { status: 409 });

  const { error: voteError } = await supabaseAdmin
    .from("werewolf_day_votes")
    .upsert(
      {
        room_id: room.id,
        round_number: room.round_number,
        voter_id: playerId,
        target_id: targetId,
      },
      { onConflict: "room_id,round_number,voter_id" },
    );

  if (voteError) {
    logger.error("Failed to upsert day vote", voteError, {
      route: `/api/werewolf/rooms/${code}/day-vote`,
      method: "POST",
      statusCode: 500,
      errorCode: voteError.code,
      metadata: { roomId: room.id, playerId, targetId },
    });
    return Response.json({ error: "Failed to submit vote" }, { status: 500 });
  }

  // Check if all alive players have voted
  const { data: players } = await supabaseAdmin
    .from("werewolf_players")
    .select("*")
    .eq("room_id", room.id);

  const alivePlayers = (players ?? []).filter((p) => p.is_alive);

  const { data: votes } = await supabaseAdmin
    .from("werewolf_day_votes")
    .select("*")
    .eq("room_id", room.id)
    .eq("round_number", room.round_number);

  const aliveVoterIds = new Set(alivePlayers.map((p) => p.player_id));
  const votedIds = new Set((votes ?? []).map((v) => v.voter_id));
  const allVoted = [...aliveVoterIds].every((id) => votedIds.has(id));

  if (!allVoted) {
    return Response.json({ success: true, resolved: false });
  }

  // Auto-resolve
  const { tallies, eliminatedId } = resolveVotes((votes ?? []) as DayVote[]);

  let updatedPlayers = [...(players ?? [])] as WerewolfPlayer[];
  let eliminatedPlayer: WerewolfPlayer | null = null;

  if (eliminatedId) {
    const { error: eliminateError } = await supabaseAdmin
      .from("werewolf_players")
      .update({ is_alive: false })
      .eq("room_id", room.id)
      .eq("player_id", eliminatedId);

    if (eliminateError) {
      logger.error("Failed to eliminate player after vote", eliminateError, {
        route: `/api/werewolf/rooms/${code}/day-vote`,
        method: "POST",
        statusCode: 500,
        errorCode: eliminateError.code,
        metadata: { roomId: room.id, eliminatedId },
      });
    }

    eliminatedPlayer =
      updatedPlayers.find((p) => p.player_id === eliminatedId) ?? null;

    updatedPlayers = updatedPlayers.map((p) =>
      p.player_id === eliminatedId ? { ...p, is_alive: false } : p,
    );
  }

  const winner = checkWinCondition(updatedPlayers);

  const newSettings = {
    ...(room.settings ?? {}),
    lastVoteTally: tallies,
    lastEliminatedRole: eliminatedPlayer?.role ?? null,
    ...(winner
      ? {
          finalRoles: Object.fromEntries(
            updatedPlayers.map((p) => [p.player_id, p.role ?? "villager"]),
          ),
        }
      : {}),
  };

  const { error: roomUpdateError } = await supabaseAdmin
    .from("werewolf_rooms")
    .update({
      phase: winner ? "game_over" : "elimination",
      eliminated_player_id: eliminatedId ?? null,
      winner: winner ?? null,
      settings: newSettings,
    })
    .eq("id", room.id);

  if (roomUpdateError) {
    logger.error(
      "Failed to update room after day vote resolution",
      roomUpdateError,
      {
        route: `/api/werewolf/rooms/${code}/day-vote`,
        method: "POST",
        statusCode: 500,
        errorCode: roomUpdateError.code,
        metadata: { roomId: room.id, eliminatedId, winner },
      },
    );
    return Response.json({ error: "Failed to resolve votes" }, { status: 500 });
  }

  return Response.json({ success: true, resolved: true, eliminatedId, winner });
};
