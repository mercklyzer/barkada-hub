import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { SeerPeekResult, WerewolfRole } from "@/types/werewolf";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) => {
  const { code } = await params;
  const body = await request.json();
  const { playerId, actionType, targetId } = body as {
    playerId: string;
    actionType: "wolf_kill" | "seer_peek" | "doctor_protect";
    targetId: string;
  };

  if (!playerId || !actionType || !targetId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: room } = await supabaseAdmin
    .from("werewolf_rooms")
    .select("id, phase, round_number")
    .eq("room_code", code.toUpperCase())
    .maybeSingle();

  if (!room) return Response.json({ error: "Room not found" }, { status: 404 });
  if (room.phase !== "night")
    return Response.json({ error: "Not night phase" }, { status: 409 });

  const { error } = await supabaseAdmin.from("werewolf_night_actions").upsert(
    {
      room_id: room.id,
      round_number: room.round_number,
      actor_id: playerId,
      action_type: actionType,
      target_id: targetId,
    },
    { onConflict: "room_id,round_number,actor_id" },
  );

  if (error) {
    logger.error("Failed to upsert night action", error, {
      route: `/api/werewolf/rooms/${code}/night-action`,
      method: "POST",
      statusCode: 500,
      errorCode: error.code,
      metadata: { roomId: room.id, playerId, actionType },
    });
    return Response.json({ error: "Failed to submit action" }, { status: 500 });
  }

  // If seer, return peek result immediately in response body
  if (actionType === "seer_peek") {
    const { data: target } = await supabaseAdmin
      .from("werewolf_players")
      .select("name, role")
      .eq("room_id", room.id)
      .eq("player_id", targetId)
      .maybeSingle();

    if (target) {
      const peekResult: SeerPeekResult = {
        targetName: target.name,
        targetRole: target.role as WerewolfRole,
      };
      return Response.json({ success: true, peekResult });
    }
  }

  return Response.json({ success: true });
};
