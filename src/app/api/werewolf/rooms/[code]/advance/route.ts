import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { WerewolfGamePhase } from "@/types/werewolf";

const ADVANCE_MAP: Partial<Record<WerewolfGamePhase, WerewolfGamePhase>> = {
  role_reveal: "night",
  day_announcement: "discussion",
  discussion: "day_vote",
  elimination: "night",
};

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) => {
  const { code } = await params;
  const body = await request.json();
  const { playerId } = body as { playerId: string };

  const { data: room } = await supabaseAdmin
    .from("werewolf_rooms")
    .select("id, host_id, phase, round_number")
    .eq("room_code", code.toUpperCase())
    .maybeSingle();

  if (!room) return Response.json({ error: "Room not found" }, { status: 404 });
  if (room.host_id !== playerId)
    return Response.json({ error: "Not host" }, { status: 403 });

  const nextPhase = ADVANCE_MAP[room.phase as WerewolfGamePhase];
  if (!nextPhase) {
    return Response.json(
      { error: `Cannot advance from phase: ${room.phase}` },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> = { phase: nextPhase };
  if (room.phase === "elimination") {
    updates.round_number = room.round_number + 1;
    updates.night_kill_target_id = null;
    updates.night_saved = false;
    updates.eliminated_player_id = null;
  }

  const { error: updateError } = await supabaseAdmin
    .from("werewolf_rooms")
    .update(updates)
    .eq("id", room.id);

  if (updateError) {
    logger.error("Failed to advance game phase", updateError, {
      route: `/api/werewolf/rooms/${code}/advance`,
      method: "POST",
      statusCode: 500,
      errorCode: updateError.code,
      metadata: { roomId: room.id, fromPhase: room.phase, toPhase: nextPhase },
    });
    return Response.json({ error: "Failed to advance phase" }, { status: 500 });
  }

  return Response.json({ success: true, nextPhase });
};
