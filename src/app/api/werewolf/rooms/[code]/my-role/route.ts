import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { MyRoleResponse, WerewolfRole } from "@/types/werewolf";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) => {
  const { code } = await params;
  const playerId = request.nextUrl.searchParams.get("playerId");

  if (!playerId)
    return Response.json({ error: "playerId required" }, { status: 400 });

  const { data: room, error: roomError } = await supabaseAdmin
    .from("werewolf_rooms")
    .select("id")
    .eq("room_code", code.toUpperCase())
    .maybeSingle();

  if (!room) {
    if (roomError) {
      logger.error("Failed to fetch room in my-role", roomError, {
        route: `/api/werewolf/rooms/${code}/my-role`,
        method: "GET",
        statusCode: 404,
        errorCode: roomError.code,
      });
    }
    return Response.json({ error: "Room not found" }, { status: 404 });
  }

  const { data: me, error: meError } = await supabaseAdmin
    .from("werewolf_players")
    .select("role")
    .eq("room_id", room.id)
    .eq("player_id", playerId)
    .maybeSingle();

  if (!me?.role) {
    if (meError) {
      logger.error("Failed to fetch player role", meError, {
        route: `/api/werewolf/rooms/${code}/my-role`,
        method: "GET",
        statusCode: 404,
        errorCode: meError.code,
        metadata: { roomId: room.id },
      });
    }
    return Response.json({ error: "Player not found" }, { status: 404 });
  }

  const role = me.role as WerewolfRole;
  const response: MyRoleResponse = { role };

  if (role === "werewolf") {
    const { data: allies } = await supabaseAdmin
      .from("werewolf_players")
      .select("name, player_id")
      .eq("room_id", room.id)
      .eq("role", "werewolf")
      .neq("player_id", playerId);

    response.werewolfAllyNames = (allies ?? []).map((a) => a.name);
  }

  if (role === "seer") {
    const { data: pastPeeks } = await supabaseAdmin
      .from("werewolf_night_actions")
      .select("target_id")
      .eq("room_id", room.id)
      .eq("actor_id", playerId)
      .eq("action_type", "seer_peek")
      .order("submitted_at", { ascending: true });

    if (pastPeeks && pastPeeks.length > 0) {
      const targetIds = pastPeeks.map((p) => p.target_id);
      const { data: targetPlayers } = await supabaseAdmin
        .from("werewolf_players")
        .select("player_id, name, role")
        .eq("room_id", room.id)
        .in("player_id", targetIds);

      response.seerPeekHistory = (targetPlayers ?? []).map((p) => ({
        targetId: p.player_id,
        targetName: p.name,
        role: p.role as WerewolfRole,
      }));
    }
  }

  return Response.json(response);
};
