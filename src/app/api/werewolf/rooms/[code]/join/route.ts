import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) => {
  const { code } = await params;
  const body = await request.json();
  const { playerName, playerId } = body as {
    playerName: string;
    playerId: string;
  };

  if (!playerName?.trim() || !playerId) {
    return Response.json(
      { error: "playerName and playerId required" },
      { status: 400 },
    );
  }

  const { data: room, error: roomError } = await supabaseAdmin
    .from("werewolf_rooms")
    .select("id, phase")
    .eq("room_code", code.toUpperCase())
    .maybeSingle();

  if (roomError || !room) {
    return Response.json({ error: "Room not found" }, { status: 404 });
  }

  // Check for reconnect (same playerId)
  const { data: existing } = await supabaseAdmin
    .from("werewolf_players")
    .select("*")
    .eq("room_id", room.id)
    .eq("player_id", playerId)
    .maybeSingle();

  if (existing) {
    return Response.json({ player: existing, isReconnect: true });
  }

  if (room.phase !== "lobby") {
    return Response.json(
      { error: "Game already in progress" },
      { status: 409 },
    );
  }

  // Get current player count for seat_order
  const { count } = await supabaseAdmin
    .from("werewolf_players")
    .select("id", { count: "exact", head: true })
    .eq("room_id", room.id);

  const { data: player, error: playerError } = await supabaseAdmin
    .from("werewolf_players")
    .insert({
      room_id: room.id,
      player_id: playerId,
      name: playerName.trim(),
      is_host: false,
      seat_order: count ?? 0,
    })
    .select()
    .single();

  if (playerError || !player) {
    const isDuplicate = playerError?.code === "23505";
    return Response.json(
      { error: isDuplicate ? "Name already taken" : "Failed to join" },
      { status: isDuplicate ? 409 : 500 },
    );
  }

  return Response.json({ player, isReconnect: false });
};
