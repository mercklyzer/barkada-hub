import type { NextRequest } from "next/server";
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
    return Response.json({ error: "Failed to fetch players" }, { status: 500 });
  }

  return Response.json({ room, players: players ?? [] });
};
