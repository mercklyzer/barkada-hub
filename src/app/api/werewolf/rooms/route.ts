import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateRoomCode } from "@/lib/werewolf/roomCodeGenerator";

export const POST = async (request: NextRequest) => {
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

  // Generate a unique room code
  let roomCode = generateRoomCode();
  let attempts = 0;
  while (attempts < 10) {
    const { data } = await supabaseAdmin
      .from("werewolf_rooms")
      .select("id")
      .eq("room_code", roomCode)
      .maybeSingle();
    if (!data) break;
    roomCode = generateRoomCode();
    attempts++;
  }

  const { data: room, error: roomError } = await supabaseAdmin
    .from("werewolf_rooms")
    .insert({ room_code: roomCode, host_id: playerId })
    .select()
    .single();

  if (roomError || !room) {
    console.log(roomError)
    return Response.json({ error: "Failed to create room" }, { status: 500 });
  }

  const { data: player, error: playerError } = await supabaseAdmin
    .from("werewolf_players")
    .insert({
      room_id: room.id,
      player_id: playerId,
      name: playerName.trim(),
      is_host: true,
      seat_order: 0,
    })
    .select()
    .single();

  if (playerError || !player) {
    await supabaseAdmin.from("werewolf_rooms").delete().eq("id", room.id);
    return Response.json({ error: "Failed to create player" }, { status: 500 });
  }

  return Response.json({ roomCode, roomId: room.id });
};
