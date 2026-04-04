import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) => {
  const { code } = await params;
  const body = await request.json();
  const { playerId } = body as { playerId: string };

  const { data: room } = await supabaseAdmin
    .from("werewolf_rooms")
    .select("id, host_id")
    .eq("room_code", code.toUpperCase())
    .maybeSingle();

  if (!room) return Response.json({ error: "Room not found" }, { status: 404 });
  if (room.host_id !== playerId)
    return Response.json({ error: "Not host" }, { status: 403 });

  try {
    // Reset room to lobby
    await supabaseAdmin
      .from("werewolf_rooms")
      .update({
        phase: "lobby",
        round_number: 1,
        night_kill_target_id: null,
        night_saved: false,
        eliminated_player_id: null,
        winner: null,
        settings: {},
      })
      .eq("id", room.id);

    // Clear roles and revive all players
    await supabaseAdmin
      .from("werewolf_players")
      .update({ role: null, is_alive: true })
      .eq("room_id", room.id);

    // Delete night actions and day votes for this room
    await supabaseAdmin
      .from("werewolf_night_actions")
      .delete()
      .eq("room_id", room.id);
    await supabaseAdmin
      .from("werewolf_day_votes")
      .delete()
      .eq("room_id", room.id);
  } catch (err) {
    logger.error("Failed to reset werewolf room", err, {
      route: `/api/werewolf/rooms/${code}/reset`,
      method: "POST",
      statusCode: 500,
      metadata: { roomId: room.id },
    });
    return Response.json({ error: "Failed to reset room" }, { status: 500 });
  }

  return Response.json({ success: true });
};
