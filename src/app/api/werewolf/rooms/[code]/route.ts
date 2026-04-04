import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) => {
  const { code } = await params;

  const { data: room, error: roomError } = await supabaseAdmin
    .from("werewolf_rooms")
    .select("*")
    .eq("room_code", code.toUpperCase())
    .maybeSingle();

  if (roomError || !room) {
    if (roomError) {
      logger.error("Failed to fetch werewolf room", roomError, {
        route: `/api/werewolf/rooms/${code}`,
        method: "GET",
        statusCode: 404,
        errorCode: roomError.code,
      });
    }
    return Response.json({ error: "Room not found" }, { status: 404 });
  }

  const { data: players, error: playersError } = await supabaseAdmin
    .from("werewolf_players")
    .select(
      "id, room_id, player_id, name, is_alive, is_host, seat_order, joined_at",
    )
    .eq("room_id", room.id)
    .order("seat_order", { ascending: true });

  if (playersError) {
    logger.error("Failed to fetch werewolf players", playersError, {
      route: `/api/werewolf/rooms/${code}`,
      method: "GET",
      statusCode: 500,
      errorCode: playersError.code,
      metadata: { roomId: room.id },
    });
    return Response.json({ error: "Failed to fetch players" }, { status: 500 });
  }

  return Response.json({ room, players: players ?? [] });
};
