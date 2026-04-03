import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { assignWerewolfRoles } from "@/lib/werewolf/roleAssigner";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) => {
  const { code } = await params;
  const body = await request.json();
  const { playerId } = body as { playerId: string };

  const { data: room } = await supabaseAdmin
    .from("werewolf_rooms")
    .select("id, host_id, phase")
    .eq("room_code", code.toUpperCase())
    .maybeSingle();

  if (!room) return Response.json({ error: "Room not found" }, { status: 404 });
  if (room.host_id !== playerId)
    return Response.json({ error: "Not host" }, { status: 403 });
  if (room.phase !== "lobby")
    return Response.json({ error: "Game already started" }, { status: 409 });

  const { data: players } = await supabaseAdmin
    .from("werewolf_players")
    .select("id, player_id")
    .eq("room_id", room.id);

  if (!players || players.length < 4) {
    return Response.json({ error: "Need at least 4 players" }, { status: 400 });
  }

  const playerIds = players.map((p) => p.player_id);
  const roleMap = assignWerewolfRoles(playerIds);

  // Update each player's role
  const updates = players.map((p) =>
    supabaseAdmin
      .from("werewolf_players")
      .update({ role: roleMap[p.player_id] })
      .eq("id", p.id),
  );
  await Promise.all(updates);

  const wolfCount = Object.values(roleMap).filter(
    (r) => r === "werewolf",
  ).length;

  await supabaseAdmin
    .from("werewolf_rooms")
    .update({
      phase: "role_reveal",
      settings: { werewolfCount: wolfCount },
    })
    .eq("id", room.id);

  return Response.json({ success: true });
};
